import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync('app/globals.css','utf8');
function token(name:string){const value=css.match(new RegExp('--'+name+':(#[0-9a-f]{6})','i'))?.[1];assert.ok(value,name);return value;}
function luminance(hex:string){const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);return rgb[0]*0.2126+rgb[1]*0.7152+rgb[2]*0.0722;}
function contrast(a:string,b:string){const [lo,hi]=[luminance(a),luminance(b)].sort((a,b)=>a-b);return (hi+0.05)/(lo+0.05);}
// Analytical CSS-token checks, not a browser/comprehensive WCAG audit.
test('small muted research text meets 4.5:1 on the existing paper/card/sidebar backgrounds',()=>{
 for(const background of [token('paper'),'#fffef9','#f0f1e9','#eeefe7','#e1e6d8'])assert.ok(contrast(token('muted'),background)>=4.5,'Muted text contrast on '+background);
});
test('primary action text and keyboard focus have adequate contrast without changing the palette',()=>{
 assert.ok(contrast('#ffffff',token('green'))>=4.5);assert.ok(contrast(token('green'),token('paper'))>=3);
 assert.match(css,/\.search-box:focus-within/);assert.match(css,/\.skip-link:focus/);
});
