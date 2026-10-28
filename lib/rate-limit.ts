const windows=new Map<string,{start:number;count:number}>();
export function allowRequest(key:string,limit:number,now=Date.now()){
 for(const [k,w] of windows)if(now-w.start>=60000)windows.delete(k);
 const w=windows.get(key)||{start:now,count:0};w.count++;windows.set(key,w);return w.count<=limit;
}
