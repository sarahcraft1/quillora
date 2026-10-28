import path from 'node:path';
export default {serverExternalPackages:['pdf-parse','@napi-rs/canvas'],outputFileTracingRoot:path.resolve('.'),distDir:process.env.NODE_ENV==='development'?'.next-dev':'.next'};
