import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { internshipsAPI } from '../../api/client'
import toast from 'react-hot-toast'

export function LoginPage() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({ email:'', password:'' })
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault(); setBusy(true)
    try { await login(form); nav('/analytics') }
    catch { toast.error('Invalid email or password') }
    finally { setBusy(false) }
  }

  const demos = [
    {label:'🔑 Admin',  email:'admin@hub.io',  pw:'admin123'},
    {label:'👨‍🏫 Mentor', email:'sarah@hub.io',  pw:'mentor123'},
    {label:'🎒 Intern', email:'priya@hub.io',  pw:'intern123'},
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-7">
          <div className="inline-flex w-14 h-14 bg-indigo-600 rounded-2xl items-center justify-center text-2xl mb-3">🚀</div>
          <h1 className="text-2xl font-black text-gray-900">InternHub</h1>
          <p className="text-gray-500 text-sm">Remote Internship Dashboard</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-black text-gray-900 mb-4">Sign In</h2>
          <form onSubmit={submit} className="space-y-3">
            <input type="email" required placeholder="Email" value={form.email}
              onChange={e=>setForm(p=>({...p,email:e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            <input type="password" required placeholder="Password" value={form.password}
              onChange={e=>setForm(p=>({...p,password:e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            <button type="submit" disabled={busy}
              className="w-full bg-indigo-600 text-white font-black rounded-xl py-2.5 text-sm hover:bg-indigo-700 disabled:opacity-60">
              {busy ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>
          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 font-bold mb-2">QUICK DEMO LOGIN</p>
            <div className="grid grid-cols-3 gap-1.5">
              {demos.map(d => (
                <button key={d.label} onClick={() => setForm({email:d.email, password:d.pw})}
                  className="border border-gray-200 rounded-lg py-1.5 text-xs font-semibold text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-3">
            New? <Link to="/signup" className="text-indigo-600 font-semibold">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export function SignupPage() {
  const { signup } = useAuth()
  const nav = useNavigate()
  const [progs, setProgs] = useState([])
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'intern', internship_id:'' })
  const [busy, setBusy] = useState(false)
  const set = (k,v) => setForm(p=>({...p,[k]:v}))

  useEffect(() => { internshipsAPI.list().then(r=>setProgs(r.data)).catch(()=>{}) }, [])

  async function submit(e) {
    e.preventDefault(); setBusy(true)
    try { await signup(form); nav('/analytics') }
    catch(err) { toast.error(err.response?.data?.detail || 'Signup failed') }
    finally { setBusy(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-7">
          <div className="inline-flex w-14 h-14 bg-indigo-600 rounded-2xl items-center justify-center text-2xl mb-3">🚀</div>
          <h1 className="text-2xl font-black text-gray-900">InternHub</h1>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-black text-gray-900 mb-4">Create Account</h2>
          <div className="grid grid-cols-3 gap-1.5 mb-4">
            {['admin','mentor','intern'].map(r => (
              <button type="button" key={r} onClick={() => set('role', r)}
                className={`py-2 rounded-lg text-xs font-bold border transition-colors capitalize ${form.role===r?'bg-indigo-50 border-indigo-500 text-indigo-700':'border-gray-200 text-gray-500'}`}>
                {r==='admin'?'🔑':r==='mentor'?'👨‍🏫':'🎒'} {r}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="space-y-3">
            <input required placeholder="Full name" value={form.name} onChange={e=>set('name',e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            <input type="email" required placeholder="Email" value={form.email} onChange={e=>set('email',e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            <input type="password" required placeholder="Password" value={form.password} onChange={e=>set('password',e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            {form.role==='intern' && (
              <select value={form.internship_id} onChange={e=>set('internship_id',e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select program (optional)</option>
                {progs.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            )}
            <button type="submit" disabled={busy}
              className="w-full bg-indigo-600 text-white font-black rounded-xl py-2.5 text-sm hover:bg-indigo-700 disabled:opacity-60">
              {busy ? 'Creating…' : 'Create Account →'}
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-3">
            Already have an account? <Link to="/login" className="text-indigo-600 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
