export type CanvasConnection={origin:string;clientId:string;generation:string;tokenBox:string;snapshotBox:string|null;lastSyncAt:string|null;error:string|null};
export type Authorization={origin:string;epoch:number};
export type SyncLease={connection:CanvasConnection;lease:string};
export interface CanvasRepository{
 read(owner:string):Promise<CanvasConnection|null>;
 beginConnection(owner:string):Promise<number>;
 beginAuthorization(owner:string,stateHash:string,nonceHash:string,origin:string):Promise<number>;
 consumeAuthorization(owner:string,stateHash:string,nonceHash:string):Promise<Authorization|null>;
 completeAuthorization(owner:string,epoch:number,connection:CanvasConnection):Promise<boolean>;
 beginSync(owner:string):Promise<SyncLease|null>;
 updateTokens(owner:string,generation:string,lease:string,tokenBox:string):Promise<boolean>;
 finishSync(owner:string,generation:string,lease:string,result:{snapshotBox:string;at:string}|{error:string}):Promise<boolean>;
 disconnect(owner:string):Promise<CanvasConnection|null>;
}
