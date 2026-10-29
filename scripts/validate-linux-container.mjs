// Local-only validation; creates and removes only this run's labeled disposable containers.
import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const cli=process.env.DOCKER_CLI||'docker',image=process.env.QA_IMAGE||'quillora:p0-local',runId='quillora-p0-'+Date.now(),owned=[];
const report={image,imageId:'',checks:[],results:{},cleanup:[]};
function raw(args,timeout=90000){return spawnSync(cli,args,{encoding:'utf8',timeout,maxBuffer:4*1024*1024,windowsHide:true});}
function command(args){const r=raw(args);if(r.status!==0)throw Error('Docker '+args[0]+' failed: '+(r.stderr||r.stdout||r.error));return r.stdout.trim();}
function inspect(name){return JSON.parse(command(['inspect',name]))[0];}
function create(suffix,extra=[]){const name=runId+'-'+suffix;command(['run','-d','--name',name,'--label','quillora.qa.run='+runId,'--memory=1536m','--memory-swap=1536m','--cpus=1','--pids-limit=128','-p','127.0.0.1::10000',...extra,image]);owned.push(name);return name;}
function origin(name){const p=inspect(name).NetworkSettings.Ports['10000/tcp'][0];assert.equal(p.HostIp,'127.0.0.1');return 'http://127.0.0.1:'+p.HostPort;}
async function ready(url){for(let n=0;n<80;n++){try{const r=await fetch(url+'/api/health',{signal:AbortSignal.timeout(1000)});if(r.ok){assert.deepEqual(await r.json(),{status:'ok'});return;}}catch{}await new Promise(r=>setTimeout(r,500));}throw Error('Health did not recover');}
function note(check){report.checks.push(check);console.log('PASS: '+check);}
try{
 report.imageId=command(['image','inspect',image,'--format','{{.Id}}']);
 const main=create('server',['--mount','type=bind,source='+path.resolve('.qa-output')+',target=/app/qa,readonly','--mount','type=bind,source='+path.resolve('.qa-output/fixtures')+',target=/app/tests/fixtures,readonly']);
 let url=origin(main);await ready(url);note('production health on loopback only');
 const details=inspect(main);assert.equal(details.Config.User,'node');assert.equal(details.HostConfig.Memory,1536*1024*1024);assert.equal(details.HostConfig.NanoCpus,1000000000);assert.equal(details.HostConfig.PidsLimit,128);note('non-root configuration; 1536 MiB, one CPU, 128-PID limits');
 const access=spawnSync(process.execPath,['tests/production-access.mjs'],{encoding:'utf8',env:{...process.env,TEST_URL:url,EXPECTED_DENIED_STATUS:'503'}});assert.equal(access.status,0,access.stderr);note('HTTP pages/APIs and forged headers denied without configuration');
 const runtime=command(['exec',main,'node','/app/qa/linux-runtime-check.cjs']);report.results.runtime=runtime;note('Linux extraction, streaming/concurrency limits and worker failure recovery');
 report.results.uploadTests=command(['exec',main,'node','--test','/app/qa/upload.test.cjs']);note('original upload regressions executed in production Linux image');
 await ready(url);note('health remains available after upload failures');
 // Separate capped container, no application data or published port. Intentionally exhaust native RSS.
 const oom=runId+'-oom';const oomResult=raw(['run','--name',oom,'--label','quillora.qa.run='+runId,'--memory=128m','--memory-swap=128m','--cpus=1','--pids-limit=32','--entrypoint','node',image,'--max-old-space-size=1024','-e','const held=[];for(;;)held.push(Buffer.alloc(16*1024*1024,1));'],60000);if(!oomResult.error)owned.push(oom);assert.equal(oomResult.status,137,oomResult.stderr);assert.equal(inspect(oom).State.OOMKilled,true);report.results.oom={exitCode:137,OOMKilled:true,memoryLimitBytes:128*1024*1024};await ready(url);note('isolated 128 MiB native-memory exhaustion killed only test container');
 command(['kill','--signal','KILL',main]);command(['start',main]);url=origin(main);await ready(url);note('production server recovers after forced process/container termination');
 const configured=create('configured',['-e','CF_ACCESS_ISSUER=https://quillora-local-validation.cloudflareaccess.com','-e','CF_ACCESS_AUD=synthetic-local-audience','-e','QUILLORA_ALLOWED_EMAILS=synthetic@example.invalid','-e','QUILLORA_PUBLIC_ORIGIN=https://pilot.example.invalid','-e','QUILLORA_ACCESS_MODE=local']);const configuredUrl=origin(configured);await ready(configuredUrl);
 const denied=spawnSync(process.execPath,['tests/production-access.mjs'],{encoding:'utf8',env:{...process.env,TEST_URL:configuredUrl,EXPECTED_DENIED_STATUS:'401'}});assert.equal(denied.status,0,denied.stderr);note('configured production rejects absent/forged tokens; local bypass cannot enable production');
 for(let n=0;n<80&&inspect(main).State.Health?.Status!=='healthy';n++)await new Promise(r=>setTimeout(r,500));const health=inspect(main).State.Health;assert.equal(health?.Status,'healthy');note('Docker image healthcheck reports healthy after restart');report.results.health=health.Status;report.results.node=command(['exec',main,'node','--version']);
 report.passed=true;
}catch(error){report.passed=false;report.error=String(error);console.error(error);process.exitCode=1;}
finally{for(const name of owned){try{assert.equal(inspect(name).Config.Labels['quillora.qa.run'],runId);command(['rm','-f',name]);report.cleanup.push(name);}catch(error){report.cleanup.push('NOT REMOVED: '+name+' '+error);process.exitCode=1;}}writeFileSync('.qa-output/linux-validation.json',JSON.stringify(report,null,2)+'\n');console.log('Report: .qa-output/linux-validation.json');}
