// All sound is synthesized with the Web Audio API: no audio files to license or break.
let ctx:AudioContext|null=null,master:GainNode
const ch:Record<string,GainNode>={}
const bufs:Record<string,AudioBuffer>={}
export const canAudio=()=>!!(window.AudioContext||(window as any).webkitAudioContext)
const buf=(t:'w'|'b')=>bufs[t]??(()=>{const c=ctx!,b=c.createBuffer(1,c.sampleRate*4,c.sampleRate),d=b.getChannelData(0);let l=0
 for(let i=0;i<d.length;i++){const w=Math.random()*2-1;if(t==='w')d[i]=w*.5;else{l=(l+.02*w)/1.02;d[i]=l*3.5}}return bufs[t]=b})()
const src=(t:'w'|'b')=>{const s=ctx!.createBufferSource();s.buffer=buf(t);s.loop=true;s.start();return s}
const f=(type:BiquadFilterType,hz:number)=>{const x=ctx!.createBiquadFilter();x.type=type;x.frequency.value=hz;return x}
const lfo=(hz:number,depth:number,p:AudioParam)=>{const o=ctx!.createOscillator(),g=ctx!.createGain();o.frequency.value=hz;g.gain.value=depth;o.connect(g).connect(p);o.start()}
export async function startAudio(){
 if(ctx){await ctx.resume();return}
 ctx=new((window.AudioContext||(window as any).webkitAudioContext))();master=ctx.createGain();master.connect(ctx.destination)
 for(const k of ['rain','thunder','wind','waves','forest','music','lofi','snow']){ch[k]=ctx.createGain();ch[k].gain.value=0;ch[k].connect(master)}
 src('w').connect(f('highpass',700)).connect(f('lowpass',9000)).connect(ch.rain)
 const w=ctx.createGain();w.gain.value=.6;lfo(.08,.4,w.gain);src('b').connect(f('lowpass',450)).connect(w).connect(ch.wind)
 const v=ctx.createGain();v.gain.value=.5;lfo(.1,.45,v.gain);src('b').connect(f('lowpass',800)).connect(v).connect(ch.waves)
 const fo=ctx.createGain();fo.gain.value=.1;src('b').connect(f('highpass',1500)).connect(fo).connect(ch.forest)
 setInterval(()=>{if(!ctx||ctx.state!=='running'||Math.random()<.55)return
  const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime,b=2200+Math.random()*2400
  o.frequency.setValueAtTime(b,t);o.frequency.exponentialRampToValueAtTime(b*1.3,t+.12);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05,t+.03);g.gain.exponentialRampToValueAtTime(.0001,t+.2)
  o.connect(g).connect(ch.forest);o.start(t);o.stop(t+.25)},1100)
 const lp=f('lowpass',1100),pad=ctx.createGain();pad.gain.value=.5;lfo(.12,.25,pad.gain);lp.connect(pad).connect(ch.music)
 for(const hz of [110,220,261.6,329.6,392,493.9]){const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=hz;o.detune.value=Math.random()*12-6;g.gain.value=.05;o.connect(g).connect(lp);o.start()}
 const sn=ctx.createGain();sn.gain.value=.9;lfo(.05,.3,sn.gain);src('b').connect(f('lowpass',300)).connect(sn).connect(ch.snow)
 const hs=ctx.createGain();hs.gain.value=.05;lfo(.07,.03,hs.gain);src('w').connect(f('highpass',5000)).connect(hs).connect(ch.snow)
 lof=f('lowpass',1500);lof.connect(ch.lofi);setInterval(tick,120)
}
export const setVol=(k:string,v:number)=>ch[k]&&ctx&&ch[k].gain.setTargetAtTime(v,ctx.currentTime,.25)
export const pauseAudio=()=>ctx?.suspend()
export const resumeAudio=()=>ctx?.resume()
export const setMuted=(m:boolean)=>master&&ctx&&master.gain.setTargetAtTime(m?0:1,ctx.currentTime,.1)
export function thunder(){if(!ctx||ctx.state!=='running')return
 const t=ctx.currentTime,s=ctx.createBufferSource(),g=ctx.createGain();s.buffer=buf('b');s.connect(f('lowpass',220)).connect(g).connect(ch.thunder)
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(1.6,t+.4);g.gain.exponentialRampToValueAtTime(.001,t+4.5);s.start(t,Math.random()*2);s.stop(t+5)}
export async function chime(){await startAudio();const c=ctx!,t=c.currentTime
 ;[523.25,659.25,783.99].forEach((hz,i)=>{const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=hz;g.gain.setValueAtTime(0,t+i*.35);g.gain.linearRampToValueAtTime(.18,t+i*.35+.05);g.gain.exponentialRampToValueAtTime(.0001,t+i*.35+2.2);o.connect(g).connect(c.destination);o.start(t+i*.35);o.stop(t+i*.35+2.3)})}

// Lo-fi beat: 72 BPM, swung hats, soft kick/snare, warm 7th chords, vinyl crackle (all synthesized)
let lof:BiquadFilterNode,nt=0,st=0
const CHORDS=[[57,60,64,67,71],[62,65,69,72,76],[55,59,62,65,69],[60,64,67,71,74]]
const mf=(n:number)=>440*2**((n-69)/12)
function note(m:number,t:number,d:number,v:number,ty:OscillatorType='sine'){const c=ctx!,o=c.createOscillator(),g=c.createGain();o.type=ty;o.frequency.value=mf(m);o.detune.value=Math.random()*10-5;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(lof);o.start(t);o.stop(t+d+.05)}
function hit(t:number,hz:number,ty:BiquadFilterType,d:number,v:number){const c=ctx!,s=c.createBufferSource(),g=c.createGain();s.buffer=buf('w');g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f(ty,hz)).connect(g).connect(ch.lofi);s.start(t,Math.random()*2);s.stop(t+d+.02)}
function kick(t:number){const c=ctx!,o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(42,t+.18);g.gain.setValueAtTime(.55,t);g.gain.exponentialRampToValueAtTime(.0001,t+.28);o.connect(g).connect(ch.lofi);o.start(t);o.stop(t+.3)}
function tick(){const c=ctx;if(!c||c.state!=='running')return;if(nt<c.currentTime)nt=c.currentTime+.05
 const sp=60/72/2
 while(nt<c.currentTime+.4){const s=st%32,b=s%8,cd=CHORDS[Math.floor(s/8)],t=nt+(s%2?sp*.2:0)
  if(b===0){cd.forEach((m,i)=>note(m,t+i*.025,3,.06,'triangle'));note(cd[0]-24,t,1.8,.25)}
  if(b===0||b===5)kick(t);if(b===2||b===6)hit(t,1800,'bandpass',.14,.28)
  hit(t,7000,'highpass',.04,b%2?.05:.09)
  if(!(s%2)&&Math.random()<.4)note(cd[Math.floor(Math.random()*5)]+12,t,1.4,.05)
  if(Math.random()<.5)hit(t+Math.random()*sp,4000,'highpass',.008,.06)
  nt+=sp;st++}}
