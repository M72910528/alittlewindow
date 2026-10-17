import {useEffect,useState,type ReactNode} from 'react'
import {Play,Pause,Volume2,VolumeX,Maximize,Minimize,EyeOff,Shuffle,Heart,Layers,CloudRain,Music,Timer,LogOut,Sparkles,ListChecks,TrendingUp} from 'lucide-react'
import Stage,{TOD,Logo} from './Stage'
import Login from './Login'
import {SCENES,mixFor} from './scenes'
import {canAudio,chime,pauseAudio,resumeAudio,setMuted,setVol,startAudio,thunder} from './audio'

const CH=[['rain','Rain'],['thunder','Thunder'],['wind','Wind'],['waves','Ocean waves'],['forest','Forest'],['lofi','Lo-fi beats'],['snow','Snowfall hush'],['music','Ambient pad']]
const PRE:[string,Record<string,number>][]=[['Lo-fi rain',{rain:.5,lofi:.5}],['Snowy lo-fi',{snow:.5,wind:.2,lofi:.45}],['Storm',{rain:.7,thunder:.5,wind:.3}],['Just beats',{lofi:.6}]]
const LV=['Off','Light','Medium','Heavy']
const DEF={scene:0,...SCENES[0].def,bright:100,vol:mixFor(0) as Record<string,number>,fav:[] as number[]}
const load=()=>{try{return {...DEF,...JSON.parse(localStorage.getItem('alw_s2')||'{}')} as typeof DEF}catch{return DEF}}
const R=(n:number)=>Math.floor(Math.random()*n)
const fmtMin=(m:number)=>m<60?`${m}m`:`${Math.floor(m/60)}h ${m%60}m`
const fmt=(ms:number)=>{const s=Math.ceil(ms/1000);return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}

const B=({t,on,a,children}:{t:string;on:()=>void;a?:boolean;children:ReactNode})=>
 <button title={t} aria-label={t} aria-pressed={a} onClick={on} className={`glass grid place-items-center w-10 h-10 rounded-full hover:bg-white/20 transition ${a?'text-amber-300':''}`}>{children}</button>
const Seg=({label,v,on,opts=LV}:{label:string;v:number;on:(n:number)=>void;opts?:readonly string[]})=>
 <div className="flex items-center justify-between gap-3"><span className="text-xs w-16 text-white/65">{label}</span>
  <div role="radiogroup" aria-label={label} className="flex gap-1 flex-wrap justify-end">{opts.map((l,i)=>
   <button key={l} role="radio" aria-checked={v===i} title={`${label}: ${l}`} onClick={()=>on(i)} className={`px-2.5 py-1 rounded-full text-xs transition ${v===i?'bg-amber-300 text-slate-900':'bg-white/10 hover:bg-white/20'}`}>{l}</button>)}</div></div>
const Sl=({label,v,on,dis}:{label:string;v:number;on:(n:number)=>void;dis?:boolean})=>
 <label className="flex items-center gap-3 text-xs"><span className="w-24 text-white/65">{label}</span>
  <input type="range" min={0} max={100} value={v} disabled={dis} aria-label={label} title={`${label}: ${v}%`} onChange={e=>on(+e.target.value)} className="flex-1 accent-amber-300 disabled:opacity-40"/></label>

export default function App(){
 const [user,setUser]=useState(()=>localStorage.getItem('alw_user'))
 if(!user)return <Login onAuth={n=>{localStorage.setItem('alw_user',n);setUser(n)}}/>
 return <Home user={user} out={()=>{localStorage.removeItem('alw_user');setUser(null)}}/>
}

function Home({user,out}:{user:string;out:()=>void}){
 const [s,setS]=useState(load),[tab,setTab]=useState<string|null>(null)
 const [on,setOn]=useState(false),[paused,setPaused]=useState(false),[mute,setMute]=useState(false)
 const [flash,setFlash]=useState(false),[show,setShow]=useState(true),[hid,setHid]=useState(false),[fs,setFs]=useState(false),[ld,setLd]=useState(false),[toast,setToast]=useState('')
 const [tm,setTm]=useState({mins:25,end:0,left:25*60000,run:false}),[sess,setSess]=useState(+(localStorage.getItem('alw_n')||0))
 type Todo={id:number;t:string;sub:string;p:number;d:boolean;at?:number}
 const [todos,setTodos]=useState<Todo[]>(()=>{try{return JSON.parse(localStorage.getItem('alw_todo')||'[]')}catch{return[]}})
 const [td,setTd]=useState({t:'',sub:'',p:1}),[flt,setFlt]=useState('All')
 useEffect(()=>{localStorage.setItem('alw_todo',JSON.stringify(todos))},[todos])
 const [log,setLog]=useState<{t:number;m:number}[]>(()=>{try{return JSON.parse(localStorage.getItem('alw_log')||'[]')}catch{return[]}})
 useEffect(()=>{localStorage.setItem('alw_log',JSON.stringify(log))},[log])
 const subjects=[...new Set(todos.map(x=>x.sub))]
 const shown=todos.filter(x=>flt==='All'||x.sub===flt).sort((a,b)=>+a.d-+b.d||a.p-b.p||a.id-b.id)
 const addTodo=()=>{const t=td.t.trim();if(!t)return;setTodos(x=>[...x,{id:Date.now(),t,sub:td.sub.trim()||'General',p:td.p,d:false}]);setTd({...td,t:''})}
 const up=(p:Partial<typeof DEF>)=>setS(x=>({...x,...p}))
 const can=canAudio(),vis=show&&!hid

 useEffect(()=>localStorage.setItem('alw_s2',JSON.stringify(s)),[s])
 useEffect(()=>{if(on)CH.forEach(([k])=>setVol(k,s.vol[k]||0))},[s.vol,on])
 useEffect(()=>{setMuted(mute)},[mute])
 const pick=(i:number)=>{setLd(true);setTimeout(()=>setLd(false),700);up({scene:i,...SCENES[i].def,vol:mixFor(i)})}
 const random=()=>{const i=R(SCENES.length);pick(i);up({rain:R(4),snow:R(4),fog:R(3),wind:R(4),tod:R(4),light:Math.random()<.35})}
 const fav=s.fav.includes(s.scene)

 // idle auto-hide + keyboard
 useEffect(()=>{let t=0;const a=()=>{setShow(true);clearTimeout(t);t=window.setTimeout(()=>setShow(false),4500)};a()
  const k=(e:KeyboardEvent)=>{if(e.key.toLowerCase()==='h'&&!(e.target instanceof HTMLInputElement))setHid(h=>!h);a()}
  const ev=['pointermove','pointerdown','touchstart'];ev.forEach(e=>addEventListener(e,a));addEventListener('keydown',k)
  const fc=()=>setFs(!!document.fullscreenElement);document.addEventListener('fullscreenchange',fc)
  return()=>{clearTimeout(t);ev.forEach(e=>removeEventListener(e,a));removeEventListener('keydown',k);document.removeEventListener('fullscreenchange',fc)}},[])

 // lightning: one soft flash, no strobing
 useEffect(()=>{if(!s.light)return;let t=0
  const nx=()=>{t=window.setTimeout(()=>{setFlash(true);setTimeout(()=>setFlash(false),160);setTimeout(thunder,500+Math.random()*1800);nx()},7000+Math.random()*9000)};nx()
  return()=>clearTimeout(t)},[s.light])

 // timer uses an absolute end time so it stays accurate in background tabs
 useEffect(()=>{if(!tm.run)return
  const f=()=>{const l=tm.end-Date.now()
   if(l<=0){setTm(t=>({...t,run:false,left:t.mins*60000}));setSess(n=>n+1);setLog(l=>[...l,{t:Date.now(),m:tm.mins}]);chime().catch(()=>{});setToast('Session complete. Take a slow breath.')
    if('Notification' in window&&Notification.permission==='granted')new Notification('Session complete',{body:'Take a slow breath.'})}
   else setTm(t=>({...t,left:l}))}
  const id=setInterval(f,500);document.addEventListener('visibilitychange',f);return()=>{clearInterval(id);document.removeEventListener('visibilitychange',f)}},[tm.run,tm.end])
 useEffect(()=>{localStorage.setItem('alw_n',String(sess))},[sess])
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),8000);return()=>clearTimeout(t)},[toast])

 const toggleSound=async()=>{if(!on){await startAudio();setOn(true);setPaused(false)}else if(paused){await resumeAudio();setPaused(false)}else{await pauseAudio();setPaused(true)}}
 const setMins=(m:number)=>setTm({mins:m,left:m*60000,run:false,end:0})
 const start=()=>{if('Notification' in window&&Notification.permission==='default')Notification.requestPermission();setTm(t=>({...t,run:true,end:Date.now()+t.left}))}
 const tf=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.()
 const zen=()=>{setTab(null);setHid(true);document.documentElement.requestFullscreen?.()}
 const tabs:[string,string,ReactNode][]=[['scenes','Scenes',<Layers size={16}/>],['weather','Weather',<CloudRain size={16}/>],['sound','Sound',<Music size={16}/>],['todo','To-do',<ListChecks size={16}/>],['focus','Focus',<Timer size={16}/>],['progress','Progress',<TrendingUp size={16}/>]]

 return <div className="fixed inset-0 text-white select-none" onDoubleClick={()=>setHid(false)}>
  <Stage scene={s.scene} w={{rain:s.rain,snow:s.snow,fog:s.fog,wind:s.wind,tod:s.tod,bright:s.bright,flash}}/>
  {ld&&<div className="absolute inset-0 grid place-items-center bg-[#0a0d24]/80 backdrop-blur-sm serif italic text-2xl animate-pulse" role="status">Painting the view…</div>}
  {(tm.run||toast)&&<div className="glass absolute top-4 left-1/2 -translate-x-1/2 rounded-full px-5 py-2 text-sm z-20" role="status">{toast||<span className="tabular-nums serif text-xl">{fmt(tm.left)}</span>}</div>}

  <div className={`transition-opacity duration-700 ${vis?'opacity-100':'opacity-0 pointer-events-none'}`}>
   <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-none [&>*]:pointer-events-auto">
    <div className="flex items-center gap-3"><Logo s={42}/><div><div className="serif text-2xl leading-none drop-shadow">A Little Window</div><div className="text-xs text-white/60 mt-1">{user} · <button onClick={out} className="underline underline-offset-2 hover:text-amber-200 inline-flex items-center gap-1"><LogOut size={11}/>sign out</button></div><div className="serif italic text-sm text-amber-100/70 mt-1">Created with love by Zhang Shui Yue ❤️🌙</div></div></div>
    <div className="flex gap-2">
     <B t="Random atmosphere" on={random}><Shuffle size={16}/></B>
     <B t={fav?'Remove favorite':'Favorite this view'} a={fav} on={()=>up({fav:fav?s.fav.filter(f=>f!==s.scene):[...s.fav,s.scene]})}><Heart size={16} fill={fav?'currentColor':'none'}/></B>
     <B t="Fullscreen" on={tf} a={fs}>{fs?<Minimize size={16}/>:<Maximize size={16}/>}</B>
     <B t="Hide controls (H)" on={()=>setHid(true)}><EyeOff size={16}/></B>
    </div>
   </div>

   <div className="absolute bottom-3 left-[4.75rem] right-3 sm:left-0 sm:right-0 sm:mx-auto sm:w-[min(calc(100vw_-_16rem),620px)] space-y-2">
    {tab&&<div className="glass rounded-3xl p-5 max-h-[52vh] overflow-y-auto space-y-3" style={{animation:'rise .35s ease both'}}>
     {tab==='scenes'&&<><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{SCENES.map((c,i)=>
      <button key={c.name} onClick={()=>pick(i)} aria-pressed={s.scene===i} className={`rounded-2xl p-3 text-left text-xs leading-snug transition ${s.scene===i?'bg-amber-300 text-slate-900':'bg-white/10 hover:bg-white/20'}`}><span className="text-lg">{c.emoji}</span>{s.fav.includes(i)&&' ♥'}<br/>{c.name}</button>)}</div>
      <Sl label="Brightness" v={s.bright} on={v=>up({bright:Math.max(25,v)})}/></>}
     {tab==='weather'&&<>
      <Seg label="Rain" v={s.rain} on={v=>up({rain:v})}/><Seg label="Snow" v={s.snow} on={v=>up({snow:v})}/>
      <Seg label="Fog" v={s.fog} on={v=>up({fog:v})}/><Seg label="Wind" v={s.wind} on={v=>up({wind:v})}/>
      <Seg label="Time" v={s.tod} on={v=>up({tod:v})} opts={TOD.map(t=>t[0])}/>
      <div className="flex items-center justify-between"><span className="text-xs w-16 text-white/65">Lightning</span>
       <button role="switch" aria-checked={s.light} onClick={()=>up({light:!s.light})} className={`px-4 py-1 rounded-full text-xs ${s.light?'bg-amber-300 text-slate-900':'bg-white/10 hover:bg-white/20'}`}>{s.light?'On (soft flashes)':'Off'}</button></div></>}
     {tab==='sound'&&<>
      <div className="flex items-center gap-2">
       <button disabled={!can} onClick={toggleSound} className="flex items-center gap-2 rounded-full bg-amber-300 text-slate-900 px-4 py-2 text-xs font-medium disabled:opacity-40">{on&&!paused?<Pause size={14}/>:<Play size={14}/>}{!on?'Enable sound':paused?'Resume':'Pause'}</button>
       <button disabled={!on} aria-pressed={mute} aria-label="Mute" title="Mute" onClick={()=>setMute(!mute)} className="glass w-9 h-9 grid place-items-center rounded-full disabled:opacity-40">{mute?<VolumeX size={15}/>:<Volume2 size={15}/>}</button>
       <span className="text-xs text-white/50">{can?'Sounds are generated live in your browser.':'Audio is not supported here.'}</span></div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Sound presets">{PRE.map(([n,m])=><button key={n} disabled={!can} onClick={async()=>{if(!on)await toggleSound();up({vol:{...Object.fromEntries(CH.map(([k])=>[k,0])),...m}})}} className="px-3 py-1.5 rounded-full text-xs bg-white/10 hover:bg-white/20 disabled:opacity-40">{n}</button>)}</div>
      {CH.map(([k,l])=><Sl key={k} label={l} dis={!can} v={Math.round((s.vol[k]||0)*100)} on={v=>up({vol:{...s.vol,[k]:v/100}})}/>)}</>}
     {tab==='todo'&&<>
      <div className="space-y-2">
       <input aria-label="Task" placeholder="Add a task, then press Enter" value={td.t} onChange={e=>setTd({...td,t:e.target.value})} onKeyDown={e=>e.key==='Enter'&&addTodo()} className="w-full bg-white/10 rounded-xl px-3 py-2 text-sm placeholder:text-white/40"/>
       <div className="flex gap-2"><input aria-label="Subject" list="subs" placeholder="Subject (e.g. Maths)" value={td.sub} onChange={e=>setTd({...td,sub:e.target.value})} onKeyDown={e=>e.key==='Enter'&&addTodo()} className="flex-1 min-w-0 bg-white/10 rounded-xl px-3 py-2 text-sm placeholder:text-white/40"/>
        <datalist id="subs">{subjects.map(x=><option key={x} value={x}/>)}</datalist>
        <button onClick={addTodo} className="rounded-xl bg-amber-300 text-slate-900 px-4 text-sm font-medium">Add</button></div>
       <Seg label="Priority" v={td.p} on={p=>setTd({...td,p})} opts={['High','Medium','Low']}/></div>
      {subjects.length>1&&<div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by subject">{['All',...subjects].map(x=><button key={x} aria-pressed={flt===x} onClick={()=>setFlt(x)} className={`px-2.5 py-1 rounded-full text-xs ${flt===x?'bg-white/30':'bg-white/10 hover:bg-white/20'}`}>{x}</button>)}</div>}
      {shown.length===0?<p className="text-center text-xs text-white/50 py-3">Nothing here yet. Add your first task above.</p>:
       <ul className="space-y-1.5">{shown.map(x=><li key={x.id} className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
        <button role="checkbox" aria-checked={x.d} aria-label={`Mark "${x.t}" ${x.d?'not done':'done'}`} onClick={()=>setTodos(l=>l.map(y=>y.id===x.id?{...y,d:!y.d,at:y.d?undefined:Date.now()}:y))} className={`w-5 h-5 shrink-0 rounded-full border grid place-items-center text-[11px] ${x.d?'bg-amber-300 border-amber-300 text-slate-900':'border-white/40'}`}>{x.d?'✓':''}</button>
        <span className={`flex-1 min-w-0 text-sm break-words ${x.d?'line-through text-white/40':''}`}>{x.t}</span>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/70 max-w-[7rem] truncate">{x.sub}</span>
        <span title={`${['High','Medium','Low'][x.p]} priority`} aria-label={`${['High','Medium','Low'][x.p]} priority`} className={`w-2.5 h-2.5 rounded-full shrink-0 ${['bg-rose-400','bg-amber-300','bg-sky-300'][x.p]}`}/>
        <button aria-label={`Delete "${x.t}"`} title="Delete" onClick={()=>setTodos(l=>l.filter(y=>y.id!==x.id))} className="text-white/50 hover:text-rose-300 px-1">✕</button></li>)}</ul>}
      <div className="flex justify-between text-xs text-white/55"><span>{todos.filter(x=>!x.d).length} left</span><button onClick={()=>setTodos(l=>l.filter(x=>!x.d))} className="hover:text-amber-200">Clear completed</button></div></>}
     {tab==='progress'&&(()=>{
      const days=Array.from({length:7},(_,i)=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-(6-i));const s=d.getTime();return{l:d.toLocaleDateString(undefined,{weekday:'short'}),n:log.filter(x=>x.t>=s&&x.t<s+864e5).length}})
      const mx=Math.max(1,...days.map(d=>d.n)),done=todos.filter(x=>x.d),mins=log.reduce((a,x)=>a+x.m,0)
      return <>
      <div className="grid grid-cols-3 gap-2 text-center">{([[sess,'Pomodoro sessions'],[fmtMin(mins),'Time focused'],[`${done.length}/${todos.length}`,'Tasks done']] as [string|number,string][]).map(([v,l])=><div key={l} className="bg-white/10 rounded-2xl py-3"><div className="serif text-3xl leading-none">{v}</div><div className="text-[11px] text-white/60 mt-1.5">{l}</div></div>)}</div>
      <div><p className="text-xs text-white/60 mb-2">Focus sessions, last 7 days</p>
       <div className="flex gap-2">{days.map((d,i)=><div key={i} className="flex-1 flex flex-col items-center justify-end h-24" title={`${d.l}: ${d.n} session${d.n===1?'':'s'}`}><span className="text-[11px] text-white/60">{d.n||''}</span><div className="w-full rounded-t-md bg-amber-300/80" style={{height:Math.max(2,Math.round(d.n/mx*56))}}/><span className="text-[11px] text-white/50 mt-1">{d.l}</span></div>)}</div></div>
      <div><p className="text-xs text-white/60 mb-2">Tasks by subject</p>
       {subjects.length===0?<p className="text-xs text-white/50">Add tasks in the To-do tab to track them here.</p>:<ul className="space-y-2">{subjects.map(x=>{const t=todos.filter(y=>y.sub===x),dn=t.filter(y=>y.d).length;return <li key={x} className="text-xs"><div className="flex justify-between mb-1"><span>{x}</span><span className="text-white/60">{dn}/{t.length}</span></div><div className="h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-amber-300" style={{width:`${dn/t.length*100}%`}}/></div></li>})}</ul>}</div>
      <div><p className="text-xs text-white/60 mb-2">Recently completed</p>
       {done.length===0?<p className="text-xs text-white/50">Finished tasks will appear here.</p>:<ul className="space-y-1">{[...done].sort((a,b)=>(b.at||0)-(a.at||0)).slice(0,6).map(x=><li key={x.id} className="flex justify-between gap-2 text-sm"><span className="truncate">✓ {x.t}</span><span className="text-xs text-white/50 shrink-0">{x.sub}</span></li>)}</ul>}</div></>})()}
     {tab==='focus'&&<>
      <div className="text-center serif text-6xl tabular-nums" aria-live="off">{fmt(tm.left)}</div>
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
       {[25,50].map(m=><button key={m} onClick={()=>setMins(m)} className={`px-3 py-1.5 rounded-full ${tm.mins===m?'bg-amber-300 text-slate-900':'bg-white/10 hover:bg-white/20'}`}>{m} min</button>)}
       <label className="flex items-center gap-1 bg-white/10 rounded-full px-3 py-1"><span>Custom</span><input type="number" min={1} max={180} value={tm.mins} aria-label="Custom minutes" onChange={e=>setMins(Math.min(180,Math.max(1,+e.target.value||1)))} className="w-12 bg-transparent text-center"/></label></div>
      <div className="flex justify-center gap-2 text-xs">
       <button onClick={tm.run?()=>setTm(t=>({...t,run:false,left:Math.max(0,t.end-Date.now())})):start} className="rounded-full bg-amber-300 text-slate-900 px-5 py-2 font-medium">{tm.run?'Pause':'Start'}</button>
       <button onClick={()=>setMins(tm.mins)} className="rounded-full bg-white/10 hover:bg-white/20 px-4 py-2">Reset</button>
       <button onClick={zen} className="rounded-full bg-white/10 hover:bg-white/20 px-4 py-2 flex items-center gap-1"><Sparkles size={13}/>Distraction-free</button></div>
      <p className="text-center text-xs text-white/55">{sess} session{sess===1?'':'s'} completed</p></>}
    </div>}
    <nav className="glass fixed left-2 top-1/2 -translate-y-1/2 z-10 rounded-3xl p-1.5 flex flex-col gap-1 max-h-[80vh] overflow-y-auto [scrollbar-width:none]" aria-label="Controls">{tabs.map(([id,l,ic])=>
     <button key={id} aria-expanded={tab===id} onClick={()=>setTab(tab===id?null:id)} className={`shrink-0 whitespace-nowrap flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 rounded-2xl px-2 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-sm transition ${tab===id?'bg-white/20 text-amber-200':'hover:bg-white/10'}`}>{ic}<span>{l}</span></button>)}</nav>
   </div>
  </div>
  {hid&&!tm.run&&<div className="absolute bottom-2 inset-x-0 text-center text-[11px] text-white/30 pointer-events-none">Press H or double-tap to show controls</div>}
 </div>
}
