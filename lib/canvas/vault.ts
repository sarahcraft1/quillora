import {createCipheriv,createDecipheriv,randomBytes,createHash} from 'node:crypto';
export function digest(value:string){return createHash('sha256').update(value).digest('hex');}
export function seal(value:unknown,key:Buffer,owner:string,origin:string,purpose:'tokens'|'snapshot'){
 const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);cipher.setAAD(Buffer.from(JSON.stringify([1,owner,origin,purpose])));
 const ciphertext=Buffer.concat([cipher.update(JSON.stringify(value),'utf8'),cipher.final()]);return JSON.stringify({v:1,iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),data:ciphertext.toString('base64')});
}
export function unseal<T>(box:string,key:Buffer,owner:string,origin:string,purpose:'tokens'|'snapshot'):T{
 const v=JSON.parse(box);if(v.v!==1)throw Error('Unsupported encrypted record');const decipher=createDecipheriv('aes-256-gcm',key,Buffer.from(v.iv,'base64'));decipher.setAAD(Buffer.from(JSON.stringify([1,owner,origin,purpose])));decipher.setAuthTag(Buffer.from(v.tag,'base64'));return JSON.parse(Buffer.concat([decipher.update(Buffer.from(v.data,'base64')),decipher.final()]).toString('utf8'));
}
