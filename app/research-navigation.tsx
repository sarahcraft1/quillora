import {type Assignment} from '../lib/work';

export default function ResearchNavigation({assignment,course,tab,focus,onFocus,onNavigate,onHome}:{assignment?:Assignment;course?:string;tab:string;focus:boolean;onFocus:()=>void;onNavigate:(destination:string)=>void;onHome:()=>void}){
 const sections=[['Assignments','Overview'],['Search','Discover'],['Assignment sources','Sources & citations'],['Evidence Board','Notes & evidence']];
 return <section className="research-navigation" aria-label="Research workspace navigation">
  <div className="research-breadcrumb"><button className="text-button" onClick={onHome}>My Desk</button><span aria-hidden="true">/</span><span>{course||'Independent research'}</span>{assignment&&<><span aria-hidden="true">/</span><strong>{assignment.name}</strong></>}<button className="outline focus-toggle" aria-pressed={focus} onClick={onFocus}>{focus?'Exit focus':'Focus mode'}</button></div>
  <nav aria-label="Assignment research areas">{sections.filter(([key])=>!!assignment||key==='Search'||key==='Evidence Board').map(([key,label])=><button key={key} aria-current={tab===key?'page':undefined} onClick={()=>onNavigate(key)}>{label}</button>)}<button className="shelf-shortcut" aria-current={tab==='Saved sources'?'page':undefined} onClick={()=>onNavigate('Saved sources')}>Reading shelf</button></nav>
 </section>;
}
