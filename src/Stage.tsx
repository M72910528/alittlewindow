import {useEffect,useMemo,useRef,useState} from 'react'
import {SCENES} from './scenes'
export interface W{rain:number;snow:number;fog:number;wind:number;tod:number;bright:number;flash:boolean}
export const TOD=[['Dawn','rgba(255,170,130,.22)'],['Day','rgba(190,220,255,.10)'],['Dusk','rgba(255,100,70,.22)'],['Night','rgba(5,8,35,.2)']] as const

function Weather({w}:{w:W}){
 const ref=useRef<HTMLCanvasElement>(null),wr=useRef(w);wr.current=w
 useEffect(()=>{
  const c=ref.current!,x=c.getContext('2d')!,rm=matchMedia('(prefers-reduced-motion: reduce)').matches,mob=innerWidth<700
  let id=0,W=0,H=0,s=1,t=0
  const rs=()=>{s=Math.min(devicePixelRatio||1,2);W=c.width=c.clientWidth*s;H=c.height=c.clientHeight*s}
  rs();addEventListener('resize',rs)
  const P=Array.from({length:mob?220:480},()=>({x:Math.random(),y:Math.random(),v:.5+Math.random()}))
  const D=Array.from({length:mob?16:34},()=>({x:Math.random(),y:Math.random(),r:2+Math.random()*5,v:0}))
  const loop=()=>{
   const {rain,snow,wind}=wr.current,wf=wind/3,sp=rm?.25:1;t+=.01;x.clearRect(0,0,W,H)
   const nr=[0,.2,.5,1][rain]*P.length
   x.strokeStyle='rgba(190,210,255,.35)';x.lineWidth=s;x.beginPath()
   for(let i=0;i<nr;i++){const p=P[i],len=(14+p.v*20)*s;x.moveTo(p.x*W,p.y*H);x.lineTo(p.x*W+wf*len*.6,p.y*H+len)
    p.y+=.012*p.v*(1+rain)*sp;p.x+=wf*.004*sp;if(p.y>1){p.y=-.05;p.x=Math.random()}if(p.x>1.1)p.x=-.1}
   x.stroke()
   const ns=[0,.25,.6,1][snow]*P.length;x.fillStyle='rgba(255,255,255,.85)'
   for(let i=0;i<ns;i++){const p=P[P.length-1-i];x.beginPath();x.arc(p.x*W,p.y*H,(1.2+p.v*2.4)*s,0,7);x.fill()
    p.y+=.0016*(p.v+.4)*sp;p.x+=(wf*.0014+Math.sin(t*3+i)*.0004)*sp;if(p.y>1){p.y=-.02;p.x=Math.random()}if(p.x>1.05)p.x=-.05;if(p.x<-.05)p.x=1.05}
   if(rain>0||wr.current.fog>1)for(const d of D){
    if(rain>0&&d.v===0&&Math.random()<.0015*rain*sp)d.v=.0015+Math.random()*.002
    d.y+=d.v;if(d.v)d.v*=.996;if(d.v&&d.v<.0004)d.v=0;if(d.y>1){d.y=0;d.x=Math.random();d.v=0}
    const px=d.x*W,py=d.y*H,r=d.r*s
    x.fillStyle='rgba(200,220,255,.10)';x.beginPath();x.ellipse(px,py,r,r*1.3,0,0,7);x.fill()
    x.strokeStyle='rgba(255,255,255,.28)';x.lineWidth=s*.8;x.beginPath();x.arc(px-r*.2,py-r*.3,r*.55,3.6,5);x.stroke()}
   id=requestAnimationFrame(loop)}
  loop();return()=>{cancelAnimationFrame(id);removeEventListener('resize',rs)}
 },[])
 return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none"/>
}

const GRAIN='url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27160%27 height=%27160%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%27.9%27 numOctaves=%272%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")'
export const Logo=({s=40}:{s?:number})=><svg width={s} height={s} viewBox="0 0 64 64" aria-hidden="true">
<rect x="9" y="3" width="46" height="8" rx="1.5" fill="#f4a3c4"/><rect x="4" y="14" width="10" height="38" fill="#f6ecd9"/><rect x="50" y="14" width="10" height="38" fill="#f6ecd9"/>
<rect x="15" y="12" width="34" height="42" rx="1.5" fill="#f08fb6"/><rect x="18" y="15" width="28" height="36" fill="#b9c4ee"/>
<path d="M32 15v36M18 33h28M25 15v36M39 15v36M18 24h28M18 42h28" stroke="#f08fb6" strokeWidth="1.5"/>
<path d="M20 17l9 13M34 38l10-14" stroke="#fff" strokeOpacity=".4" strokeWidth="3"/>
<rect x="12" y="54" width="40" height="7" rx="1.5" fill="#f4a3c4"/>
<path d="M52 44c-4-3-2-9 3-10M52 50c4-2 5-6 2-9" stroke="#3e9a58" fill="none" strokeWidth="1.6"/><circle cx="55" cy="34" r="2.2" fill="#ff6fa5"/><circle cx="54" cy="41" r="2" fill="#ff6fa5"/></svg>

export default function Stage({scene,w}:{scene:number;w:W}){
 const sc=SCENES[scene],night=w.tod===3,m=innerWidth<700
 const dots=useMemo(()=>Array.from({length:m?14:30},(_,i)=>({x:(i*37.7+Math.sin(i)*20+100)%100,y:38+(i*13.3)%40,r:10+(i*7)%30,c:sc.lights[i%sc.lights.length],d:3+i%5})),[scene])
 const stars=useMemo(()=>Array.from({length:m?35:70},(_,i)=>({x:(i*53.3+17)%100,y:(i*29.7+5)%44,s:1+i%3,d:2+i%5})),[])
 const wins=useMemo(()=>sc.win?Array.from({length:m?70:150},(_,i)=>({x:(i*61.8+7)%100,y:8+(i*37.3)%88,o:.35+((i*7)%10)/14,z:3+i%3})):[],[scene])
 const so=!sc.stars?0:night?1:w.tod===1?0:.45,lit=w.tod===1?.25:1
 const [ok,setOk]=useState('')
 useEffect(()=>{if(!sc.photo)return;let dead=false;const c=[`/scenes/scene-${scene+1}.jpg`,sc.photo]
  const t=(i:number)=>{if(i>=c.length)return;const im=new Image();im.onload=()=>{if(!dead)setOk(c[i])};im.onerror=()=>t(i+1);im.src=c[i]};t(0);return()=>{dead=true}},[scene])
 const showPhoto=!!sc.photo&&!!ok&&(ok===sc.photo||ok===`/scenes/scene-${scene+1}.jpg`)
 const bulb=(x:number)=>6+Math.sin(Math.PI*(x%33.34)/33.34)*38
 return <div className="absolute inset-0 overflow-hidden" style={{filter:`brightness(${w.bright/100})`}}>
  <div key={scene} className="absolute inset-0" style={{background:sc.sky,animation:'rise 1.2s ease both'}}>
   {showPhoto&&<div className="absolute -inset-[3%]" style={{backgroundImage:`url(${ok})`,backgroundSize:'cover',backgroundPosition:'center',filter:'saturate(1.08)',animation:'kb 40s ease-in-out infinite alternate'}}/>}
   {!showPhoto&&<>
   {sc.orb&&<div className="absolute rounded-full" style={{left:sc.orb[0]+'%',top:sc.orb[1]+'%',width:sc.orb[2],height:sc.orb[2],transform:'translate(-50%,-50%)',background:`radial-gradient(circle,${sc.orb[3]} 0,${sc.orb[3]}aa 18%,${sc.orb[3]}33 45%,transparent 70%)`}}/>}
   {sc.stars&&<div className="absolute inset-0 transition-opacity duration-1000" style={{opacity:so}}>{stars.map((t,i)=><i key={i} className="absolute rounded-full bg-white" style={{left:t.x+'%',top:t.y+'%',width:t.s,height:t.s,animation:`drift ${t.d+3}s ease-in-out ${i%3}s infinite`}}/>)}</div>}
   {sc.clouds&&[8,38,62].map((x,i)=><i key={i} className="absolute rounded-full" style={{left:x+'%',top:6+i*9+'%',width:'34%',height:70+i*20,background:sc.clouds,opacity:.45,filter:'blur(22px)',animation:`fog ${50+i*14}s ease-in-out infinite alternate`}}/>)}
   {sc.far&&<div className="absolute inset-x-0 bottom-0 h-[56%]" style={{clipPath:sc.sil,background:sc.far,transform:'scaleX(-1)',opacity:.85}}/>}
   <div className="absolute inset-x-0 bottom-0 h-[62%]" style={{clipPath:sc.sil,background:sc.silC}}>{wins.map((t,i)=><i key={i} className="absolute transition-opacity duration-1000" style={{left:t.x+'%',top:t.y+'%',width:t.z,height:t.z+2,background:sc.win,opacity:t.o*lit,boxShadow:`0 0 6px ${sc.win}`}}/>)}</div>
   {sc.layers?.map((l,i)=><div key={i} className="absolute inset-x-0 bottom-0 h-[62%]" style={{clipPath:l.clip,background:l.bg}}/>)}
   {dots.map((d,i)=><i key={i} className="absolute rounded-full" style={{left:d.x+'%',top:d.y+'%',width:d.r,height:d.r,background:d.c,filter:`blur(${d.r/3}px)`,opacity:night?.7:.3,animation:`drift ${d.d+4}s ease-in-out ${i%4}s infinite`}}/>)}
   {sc.leaves&&[0,1].map(k=>{const p=(x:number)=>k?100-x:x,c=sc.leaves;return <div key={k} className="absolute -bottom-6 w-72 h-64 pointer-events-none" style={{...(k?{right:-30}:{left:-30}),transformOrigin:'bottom center',animation:`sway ${7+k*2}s ease-in-out infinite alternate`,background:`radial-gradient(circle at ${p(30)}% 65%,${c} 0 26%,transparent 27%),radial-gradient(circle at ${p(62)}% 42%,${c} 0 22%,transparent 23%),radial-gradient(circle at ${p(55)}% 82%,${c} 0 28%,transparent 29%),radial-gradient(circle at ${p(18)}% 38%,${c} 0 16%,transparent 17%)`}}/>})}
   {sc.fairy&&<div className="absolute top-0 inset-x-0 h-24 pointer-events-none"><svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline vectorEffect="non-scaling-stroke" fill="none" stroke="#1b1030" strokeWidth="1.5" points={Array.from({length:61},(_,i)=>`${i*100/60},${bulb(i*100/60)}`).join(' ')}/></svg>
    {Array.from({length:19},(_,i)=>{const x=i*100/18;return <i key={i} className="absolute w-2 h-2 rounded-full" style={{left:x+'%',top:bulb(x)+'%',margin:'-4px 0 0 -4px',background:'#ffe3a1',boxShadow:'0 0 12px 4px #ffd27a88',animation:`drift ${3+i%4}s ease-in-out ${i%3}s infinite`}}/>})}</div>}
   {sc.lamps&&[[22,90],[50,140],[78,104]].map(([x,h])=><div key={x} className="absolute top-0 pointer-events-none" style={{left:x+'%'}}><div className="w-px bg-black/60 mx-auto" style={{height:h}}/><div className="w-9 h-9 -ml-[17px] rounded-full" style={{background:'radial-gradient(#fff6d0,#ffc46b 55%,#ff9a3a)',boxShadow:'0 0 44px 20px #ffb45477',animation:'drift 6s ease-in-out infinite'}}/></div>)}
   </>}
  </div>
  <div className="absolute inset-0 transition-colors duration-1000" style={{background:TOD[w.tod][1]}}/>
  {w.fog>0&&<div className="absolute -inset-[10%] transition-opacity duration-1000" style={{opacity:w.fog*.2,background:'radial-gradient(ellipse at 30% 70%,#cdd6ff,transparent 60%),radial-gradient(ellipse at 75% 60%,#e8e0ff,transparent 55%)',filter:'blur(30px)',animation:`fog ${22-w.wind*4}s ease-in-out infinite alternate`}}/>}
  <Weather w={w}/>
  <div className="absolute inset-0 bg-white pointer-events-none transition-opacity" style={{opacity:w.flash?.28:0,transitionDuration:w.flash?'60ms':'900ms'}}/>
  <div className="absolute inset-0 pointer-events-none" style={{boxShadow:'inset 0 0 180px 50px rgba(10,5,30,.5)'}}/>
  {showPhoto&&ok===sc.photo&&sc.credit&&<a href={sc.credit[1]} target="_blank" rel="noreferrer" className="absolute bottom-2 right-3 text-[10px] text-white/50 hover:text-white/85 z-10">Photo: {sc.credit[0]} / Unsplash</a>}
  <div className="absolute inset-0 pointer-events-none mix-blend-overlay" style={{backgroundImage:GRAIN,opacity:.18}}/>
 </div>
}
