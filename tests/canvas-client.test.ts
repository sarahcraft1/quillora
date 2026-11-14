import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CanvasClient,canvasPlainText} from '../lib/canvas/client';
import {CanvasError} from '../lib/canvas/errors';
import {canvasDate,canvasOrigin,validCanvasTimestamp} from '../lib/canvas/types';

const institution={origin:'https://canvas.example.edu',name:'Example University',personalTokens:true};
const now=new Date('2026-11-13T18:00:00.000Z');
const course={id:12,name:'Research methods',course_code:'RES 101',workflow_state:'available',time_zone:'America/Chicago'};
const assignment={id:34,course_id:12,name:'Review essay',description:'<p>Compare &amp; explain.</p><script>unsafe()</script>',due_at:'2026-11-15T02:00:00Z',published:true};
const json=(value:unknown,headers:Record<string,string>={})=>new Response(JSON.stringify(value),{headers});
const hasCode=(code:string)=>(error:unknown)=>error instanceof CanvasError&&error.code===code;

test('Canvas validates a personal token against users/self using a bearer header',async()=>{
 const client=new CanvasClient(institution,(async(url,options)=>{
  assert.equal(String(url),institution.origin+'/api/v1/users/self');
  assert.equal(options?.method,'GET');assert.equal(options?.redirect,'error');assert.equal(options?.cache,'no-store');
  assert.equal((options?.headers as Record<string,string>).Authorization,'Bearer synthetic-personal-token');
  return json({id:8,name:'Synthetic student',email:'not-retained@example.edu'});
 }) as typeof fetch);
 assert.deepEqual(await client.validateToken('synthetic-personal-token'),{id:'8'});
});

test('Canvas requests string IDs and preserves IDs larger than JavaScript safe integers',async()=>{
 const userId='9007199254740993',courseId='9007199254740995',assignmentId='9007199254740997';
 const client=new CanvasClient(institution,(async(input,options)=>{
  assert.equal((options?.headers as Record<string,string>).Accept,'application/json+canvas-string-ids');
  const path=new URL(String(input)).pathname;
  if(path.endsWith('/users/self'))return json({id:userId});
  if(path.endsWith('/courses'))return json([{...course,id:courseId}]);
  assert.equal(path,`/api/v1/courses/${courseId}/assignments`);
  return json([{...assignment,id:assignmentId,course_id:courseId}]);
 }) as typeof fetch);
 assert.equal((await client.validateToken('synthetic')).id,userId);
 const result=await client.snapshot('synthetic',now);
 assert.equal(result.courses[0].id,courseId);assert.equal(result.assignments[0].id,assignmentId);
 assert.equal(result.assignments[0].url,`${institution.origin}/courses/${courseId}/assignments/${assignmentId}`);
});

test('Canvas follows course and assignment pagination, reads requester submission state and undated work',async()=>{
 const calls:URL[]=[];
 const client=new CanvasClient(institution,(async(input)=>{
  const url=new URL(String(input));calls.push(url);
  if(url.pathname.endsWith('/courses')){
   if(url.searchParams.has('page'))return json([{...course,id:13,name:'Empty class',course_code:'EMPTY'}]);
   assert.equal(url.searchParams.get('enrollment_state'),'active');assert.equal(url.searchParams.get('enrollment_type'),'student');
   return json([course,{...course,id:99,workflow_state:'completed'}],{Link:`<${institution.origin}/api/v1/courses?page=2&opaque=value>; rel="next"`});
  }
  if(url.pathname.includes('/13/'))return json([]);
  assert.equal(url.searchParams.get('include[]'),'submission');
  if(url.searchParams.has('page'))return json([{...assignment,id:35,name:'No deadline',due_at:null},{...assignment,id:36,due_at:'2026-10-01T12:00:00Z'},{...assignment,id:37,published:false}]);
  return json([{...assignment,submission:{workflow_state:'submitted',grade:'private-unused'}}],{link:`<${institution.origin}/api/v1/courses/12/assignments?include%5B%5D=submission&page=2>; rel="next"`});
 }) as typeof fetch);
 const snapshot=await client.snapshot('synthetic-personal-token',now);
 assert.equal(calls.length,5);assert.deepEqual(snapshot.courses.map(c=>c.id),['12','13']);
 assert.deepEqual(snapshot.assignments.map(a=>a.id),['34','35']);
 assert.equal(snapshot.assignments[0].submissionStatus,'submitted');assert.equal(snapshot.assignments[1].submissionStatus,undefined);
 assert.equal(snapshot.assignments[0].description,'Compare & explain.');
 assert.equal(snapshot.assignments[0].url,institution.origin+'/courses/12/assignments/34');
 assert.equal(snapshot.refreshedAt,now.toISOString());assert.ok(!JSON.stringify(snapshot).includes('grade'));
});

test('Canvas rejects foreign, credential-bearing, looping and token-bearing pagination before sending credentials',async()=>{
 for(const next of ['https://other.example.edu/api/v1/courses?page=2',institution.origin+'/api/v1/courses?access_token=bad',institution.origin+'/api/v1/courses/12/assignments?page=2','https://user:pass@canvas.example.edu/api/v1/courses?page=2',institution.origin+'/api/v1/courses?enrollment_state=active&enrollment_type=student&per_page=100']){
  let calls=0;const client=new CanvasClient(institution,(async()=>{calls++;return json([],{link:`<${next}>; rel="next"`});}) as typeof fetch);
  await assert.rejects(client.snapshot('synthetic-personal-token',now),hasCode('invalid_response'));assert.equal(calls,1);
 }
});

test('Canvas failures reject the complete refresh, including failures after earlier courses succeeded',async()=>{
 for(const status of [401,403,429,500]){
  let calls=0;const client=new CanvasClient(institution,(async()=>{calls++;return calls===1?json([course]):new Response('private diagnostic',{status});}) as typeof fetch);
  await assert.rejects(client.snapshot('synthetic-personal-token',now),hasCode(status===401?'authorization_expired':status===403?'permission_denied':'unavailable'));assert.equal(calls,2);
 }
});

test('Canvas rejects malformed assignments, unsafe numeric IDs, invalid dates and oversized pages',async()=>{
 for(const value of [{...assignment,id:Number.MAX_SAFE_INTEGER+1},{...assignment,course_id:13},{...assignment,due_at:'2026-02-31T12:00:00Z'},{...assignment,due_at:'2026-11-15T02:00:00'},{...assignment,name:''},{...assignment,rubric:[{id:'c',description:'Criterion',points:-1}]}]){
  const client=new CanvasClient(institution,(async(url)=>String(url).includes('/assignments')?json([value]):json([course])) as typeof fetch);
  await assert.rejects(client.snapshot('synthetic-personal-token',now),hasCode('invalid_response'));
 }
 const huge=new CanvasClient(institution,(async()=>new Response('x'.repeat(2_000_001))) as typeof fetch);
 await assert.rejects(huge.snapshot('synthetic-personal-token',now),hasCode('limit_exceeded'));
});

test('Canvas domain and course-time-zone dates preserve the institution boundary',()=>{
 assert.equal(canvasOrigin('canvas.example.edu'),'https://canvas.example.edu');
 for(const domain of ['http://canvas.example.edu','https://canvas.example.edu/courses','https://127.0.0.1','https://canvas.local','https://canvas.example.edu:8443'])assert.throws(()=>canvasOrigin(domain));
 assert.equal(canvasDate('2026-11-15T02:00:00Z','America/Chicago'),'2026-11-14');
 assert.equal(canvasDate('2026-11-15T23:30:00Z','Asia/Tokyo'),'2026-11-16');
 assert.equal(canvasDate(null),undefined);assert.equal(validCanvasTimestamp('2026-02-31T12:00:00Z'),false);
 assert.equal(canvasPlainText('<p>A &lt; B</p><style>body{}</style><p>Next</p>'),'A < B\nNext');
});
