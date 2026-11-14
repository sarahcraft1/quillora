import {createCanvasPool,PostgresCanvasRepository} from './postgres';
import {CanvasService} from './service';
import {canvasHttp} from './http';
import type {CanvasConfig} from './config';

// Server-only module: database and node:crypto dependencies must never enter client imports.
let cached:{databaseUrl:string;repository:PostgresCanvasRepository}|undefined;
function service(config:CanvasConfig){
 if(!cached||cached.databaseUrl!==config.databaseUrl)cached={databaseUrl:config.databaseUrl,repository:new PostgresCanvasRepository(createCanvasPool(config.databaseUrl))};
 return new CanvasService(config,cached.repository);
}
export function canvasRoute(req:Request,operation:Parameters<typeof canvasHttp>[1]){return canvasHttp(req,operation,{service});}
