import {useState,type FormEvent} from 'react'
import {Lock,User,ArrowRight} from 'lucide-react'
import Stage,{Logo} from './Stage'
const hash=async(p:string)=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(p)))].map(b=>b.toString(16).padStart(2,'0')).join('')
const I='w-full bg-white/10 border border-white/20 rounded-full py-3 pl-11 pr-4 text-sm placeholder:text-white/45 focus:border-pink-300'
export default function Login({onAuth}:{onAuth:(n:string)=>void}){
 const [up,setUp]=useState(false),[n,setN]=useState(''),[p,setP]=useState(''),[err,setErr]=useState(''),[busy,setBusy]=useState(false)
 const go=async(e:FormEvent)=>{e.preventDefault();setErr('');const name=n.trim().toLowerCase()
  if(name.length<3)return setErr('Choose a name with at least 3 characters.')
  if(p.length<6)return setErr('Use a password with at least 6 characters.')
  setBusy(true);const users=JSON.parse(localStorage.getItem('alw_users')||'{}'),h=await hash(p+name);setBusy(false)
  if(up){if(users[name])return setErr('That name is taken. Try signing in instead.');users[name]=h;localStorage.setItem('alw_users',JSON.stringify(users));onAuth(n.trim())}
  else{if(users[name]!==h)return setErr('Name or password is incorrect.');onAuth(n.trim())}}
 return <div className="fixed inset-0 overflow-y-auto text-white bg-[#150a06]">
  <div className="fixed inset-0"><Stage scene={2} w={{rain:1,snow:0,fog:0,wind:0,tod:2,bright:92,flash:false}}/><div className="absolute inset-0 bg-black/20"/></div>
  <div className="relative min-h-full grid place-items-center p-5">
     <form onSubmit={go} className="glass relative w-full max-w-sm rounded-[28px] p-8 sm:p-10" style={{animation:'rise 1s .2s ease both'}}>
      <Logo s={52}/>
      <h1 className="serif text-4xl leading-[1.05] font-semibold mt-3">A Little Window to Another World</h1>
      <p className="mt-3 text-sm text-white/70 leading-relaxed">{up?'Make a quiet place of your own. Your favourites and settings stay with you.':'Welcome back. The rain has been waiting.'}</p>
      <div className="mt-6 space-y-3">
       <label className="relative block"><span className="sr-only">Name</span><User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"/><input className={I} placeholder="Your name" autoComplete="username" value={n} onChange={e=>setN(e.target.value)}/></label>
       <label className="relative block"><span className="sr-only">Password</span><Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"/><input className={I} type="password" placeholder="Password" autoComplete={up?'new-password':'current-password'} value={p} onChange={e=>setP(e.target.value)}/></label>
      </div>
      {err&&<p role="alert" className="mt-3 text-sm text-rose-300">{err}</p>}
      <button disabled={busy} className="mt-6 w-full rounded-full py-3 font-medium text-slate-900 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-300 to-amber-200 hover:brightness-110 transition disabled:opacity-60">{up?'Create account':'Sign in'}<ArrowRight size={16}/></button>
      <div className="mt-5 flex justify-between text-sm text-white/75">
       <button type="button" className="hover:text-pink-200" onClick={()=>{setUp(!up);setErr('')}}>{up?'I have an account':'Create an account'}</button>
       <button type="button" className="hover:text-pink-200" onClick={()=>onAuth('Guest')}>Continue as guest</button>
      </div>
      <p className="mt-6 text-xs text-white/45">Accounts are stored only in this browser (no server). Passwords are hashed before saving.</p>
      <p className="serif italic mt-4 text-center text-base text-pink-100/90">Created with love by Zhang Shui Yue ❤️🌙</p>
     </form>
  </div>
 </div>}
