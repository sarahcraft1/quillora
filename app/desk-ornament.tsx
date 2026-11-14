import {type Preferences} from '../lib/workspace';

export default function DeskOrnament({kind='none'}:{kind?:Preferences['ornament']}){
 if(kind==='none')return null;
 return <span className={'desk-ornament ornament-'+kind} aria-hidden="true">{kind==='botanical'?<svg viewBox="0 0 120 80" fill="none"><path d="M14 70Q67 60 101 12M40 60Q17 27 40 34Q60 37 40 60M64 43Q48 8 67 20Q82 25 64 43M77 30Q109 41 110 26Q108 10 77 30M55 50Q89 66 93 49Q93 33 55 50"/></svg>:kind==='celestial'?<svg viewBox="0 0 120 80" fill="none"><path d="M58 13a24 24 0 1 0 29 34A25 25 0 0 1 58 13ZM20 12v12m-6-6h12M101 9v16m-8-8h16M98 59v12m-6-6h12"/></svg>:kind==='postage'?<span className="desk-stamp">Q<br/><small>CURIOUS MINDS</small></span>:<span className="desk-tape"/>}</span>;
}
