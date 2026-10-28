import {build} from 'esbuild';
import {mkdir,copyFile,writeFile} from 'node:fs/promises';
await mkdir('.qa-output/fixtures',{recursive:true});
await build({entryPoints:['tests/linux-runtime-check.ts'],bundle:true,platform:'node',format:'cjs',packages:'external',outfile:'.qa-output/linux-runtime-check.cjs'});
await build({entryPoints:['tests/upload.test.ts'],bundle:true,platform:'node',format:'cjs',packages:'external',outfile:'.qa-output/upload.test.cjs'});
for(const name of ['rubric.pdf','rubric.docx'])await copyFile('tests/fixtures/'+name,'.qa-output/fixtures/'+name);
await writeFile('.qa-output/hang.mjs',"process.on('message',()=>{});\n");
await writeFile('.qa-output/crash.mjs',"process.on('message',()=>process.exit(1));\n");
console.log('Prepared synthetic-only Linux runtime checks in .qa-output. No container was started.');
