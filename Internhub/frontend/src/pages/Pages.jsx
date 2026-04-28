import { useState, useEffect } from 'react'
import { analyticsAPI, tasksAPI, reportsAPI, usersAPI, internshipsAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Avatar, Badge, Stat, Ring, Spinner, Bar } from '../components/shared/UI'
import toast from 'react-hot-toast'
import { LineChart, Line, BarChart, Bar as RBar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const WEEKLY  = [{week:'W1',avg:22},{week:'W2',avg:38},{week:'W3',avg:57},{week:'W4',avg:71}]
const MONTHLY = [{month:'Feb',done:2,total:5},{month:'Mar',done:4,total:6},{month:'Apr',done:6,total:8},{month:'May',done:3,total:9}]
const RING_COLORS = ['#4F46E5','#059669','#D97706','#DC2626','#0891B2','#7C3AED']

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
export function AnalyticsPage() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { analyticsAPI.progress().then(r=>setData(r.data)).catch(()=>{}).finally(()=>setLoading(false)) }, [])

  if (loading) return <div className="flex-1 flex items-center justify-center"><Spinner/></div>
  return (
    <div className="flex-1 overflow-auto p-6 space-y-5">
      <h1 className="text-xl font-black text-gray-900">Analytics</h1>
      <div className="grid grid-cols-4 gap-3">
        <Stat label="Completion"    value={`${data?.overall_completion??0}%`} sub={`${data?.total_completed}/${data?.total_tasks} tasks`} color="border-indigo-500"/>
        <Stat label="Reports"       value={data?.total_reports??0}            sub="submitted"           color="border-emerald-500"/>
        <Stat label="Pending Tasks" value={(data?.total_tasks??0)-(data?.total_completed??0)} sub="remaining" color="border-amber-400"/>
        <Stat label="Interns"       value={data?.interns?.length??0}          sub="tracked"             color="border-cyan-500"/>
      </div>

      {/* Progress rings */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-black text-gray-900 mb-4">Individual Progress</h3>
        <div className="flex gap-8 flex-wrap">
          {(data?.interns??[]).map((intern,i) => (
            <div key={intern.intern_id} className="flex flex-col items-center gap-2">
              <Avatar name={intern.name} id={intern.intern_id} size={40}/>
              <p className="font-bold text-sm text-gray-900">{intern.name.split(' ')[0]}</p>
              <div className="flex gap-3">
                <Ring pct={Math.round(intern.task_completion_pct)} size={68} color={RING_COLORS[i%RING_COLORS.length]} label="Tasks"/>
                <Ring pct={Math.min(100,Math.round(intern.reports_submitted/4*100))} size={68} color="#059669" label="Reports"/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-black text-sm text-gray-900 mb-3">Weekly Progress Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={WEEKLY} margin={{top:5,right:10,left:-20,bottom:5}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6"/>
              <XAxis dataKey="week" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}} domain={[0,100]}/>
              <Tooltip formatter={v=>`${v}%`}/>
              <Line type="monotone" dataKey="avg" stroke="#4F46E5" strokeWidth={2.5} dot={{r:4}} name="Avg"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-black text-sm text-gray-900 mb-3">Monthly Tasks</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={MONTHLY} margin={{top:5,right:10,left:-20,bottom:5}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6"/>
              <XAxis dataKey="month" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}}/>
              <Tooltip/><Legend wrapperStyle={{fontSize:11}}/>
              <RBar dataKey="done"  fill="#4F46E5" name="Done"  radius={[4,4,0,0]}/>
              <RBar dataKey="total" fill="#C7D2FE" name="Total" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

// ─── TASKS (KANBAN) ───────────────────────────────────────────────────────────
const COLS = [
  {id:'todo',       label:'To Do',       color:'#6B7280'},
  {id:'in-progress',label:'In Progress', color:'#D97706'},
  {id:'completed',  label:'Completed',   color:'#059669'},
]

export function TasksPage() {
  const { user }   = useAuth()
  const [tasks,  setTasks]   = useState([])
  const [users,  setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({title:'',description:'',deadline:'',intern_id:''})
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    Promise.all([tasksAPI.list(), usersAPI.list({role:'intern'})])
      .then(([t,u])=>{ setTasks(t.data); setUsers(u.data) })
      .catch(()=>toast.error('Load failed'))
      .finally(()=>setLoading(false))
  }, [])

  function onDrop(e, status) {
    const id = e.dataTransfer.getData('id')
    setTasks(p => p.map(t => t.id===id ? {...t,status} : t))
    tasksAPI.update(id, {status}).catch(()=>toast.error('Update failed'))
  }

  async function create() {
    if (!form.title||!form.intern_id) { toast.error('Fill title + intern'); return }
    try {
      const {data} = await tasksAPI.create(form)
      setTasks(p=>[...p,data]); setForm({title:'',description:'',deadline:'',intern_id:''}); setShowForm(false)
      toast.success('Task created!')
    } catch(err) { toast.error(err.response?.data?.detail||'Failed') }
  }

  const iMap = Object.fromEntries(users.map(u=>[u.id,u]))
  if (loading) return <div className="flex-1 flex items-center justify-center"><Spinner/></div>

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-black text-gray-900">Task Board</h1>
        {user?.role!=='intern' && (
          <button onClick={()=>setShowForm(!showForm)} className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">+ Assign Task</button>
        )}
      </div>

      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input placeholder="Title *" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            <input type="date" value={form.deadline} onChange={e=>setForm(p=>({...p,deadline:e.target.value}))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            <textarea placeholder="Description" rows={2} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"/>
            <select value={form.intern_id} onChange={e=>setForm(p=>({...p,intern_id:e.target.value}))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select intern *</option>
              {users.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={create} className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg text-sm">Create</button>
            <button onClick={()=>setShowForm(false)} className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {COLS.map(col => {
          const ct = tasks.filter(t=>t.status===col.id)
          return (
            <div key={col.id} onDragOver={e=>e.preventDefault()} onDrop={e=>onDrop(e,col.id)}
              className="bg-gray-50 border border-gray-200 rounded-xl p-3 min-h-72">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{background:col.color}}/>
                <span className="font-black text-sm text-gray-700">{col.label}</span>
                <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{background:col.color+'22',color:col.color}}>{ct.length}</span>
              </div>
              {ct.map(task => {
                const intern = iMap[task.intern_id]
                const canDrag = user?.role==='intern' && task.intern_id===user.id
                return (
                  <div key={task.id} draggable={canDrag} onDragStart={e=>e.dataTransfer.setData('id',task.id)}
                    className="bg-white border border-gray-200 rounded-xl p-3 mb-2 hover:shadow-sm"
                    style={{borderTop:`3px solid ${col.color}`,cursor:canDrag?'grab':'default'}}>
                    <p className="font-bold text-sm text-gray-900 mb-1">{task.title}</p>
                    <p className="text-xs text-gray-400 mb-2 line-clamp-2">{task.description}</p>
                    <div className="flex justify-between items-center">
                      {intern && <div className="flex items-center gap-1"><Avatar name={intern.name} id={intern.id} size={20}/><span className="text-xs text-gray-500">{intern.name.split(' ')[0]}</span></div>}
                      {task.deadline && <span className="text-xs text-gray-400">{task.deadline}</span>}
                    </div>
                  </div>
                )
              })}
              {ct.length===0 && <p className="text-center text-gray-300 text-sm pt-10">Drop here</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── REPORTS ──────────────────────────────────────────────────────────────────
function MD({ content }) {
  const html = content
    .replace(/^## (.+)$/gm,"<h2 style='font-size:15px;font-weight:800;margin:10px 0 4px'>$1</h2>")
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br/>')
  return <div className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html:html}}/>
}

export function ReportsPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [tab, setTab] = useState('write')
  const [content, setContent] = useState('## Week Report\n\n**What I worked on:**\n\n**Blockers:**\n\n**Next week:**\n')
  const [fbMap, setFbMap] = useState({})

  useEffect(() => {
    Promise.all([reportsAPI.list(), usersAPI.list()])
      .then(([r,u])=>{ setReports(r.data); setUsers(u.data) })
      .catch(()=>toast.error('Load failed'))
      .finally(()=>setLoading(false))
  }, [])

  async function submit() {
    try { const {data}=await reportsAPI.submit({content}); setReports(p=>[...p,data]); setShowForm(false); toast.success('Report submitted!') }
    catch(err) { toast.error(err.response?.data?.detail||'Failed') }
  }

  async function sendFb(id) {
    const fb = fbMap[id]; if (!fb?.trim()) return
    try { const {data}=await reportsAPI.feedback(id,{feedback:fb}); setReports(p=>p.map(r=>r.id===id?data:r)); setFbMap(p=>({...p,[id]:''})); toast.success('Feedback sent!') }
    catch { toast.error('Failed') }
  }

  const uMap = Object.fromEntries(users.map(u=>[u.id,u]))
  if (loading) return <div className="flex-1 flex items-center justify-center"><Spinner/></div>

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-black text-gray-900">Weekly Reports</h1>
        {user?.role==='intern' && <button onClick={()=>setShowForm(!showForm)} className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">+ Submit Report</button>}
      </div>

      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden w-fit mb-3">
            {['write','preview'].map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-1.5 text-xs font-bold capitalize ${tab===t?'bg-indigo-600 text-white':'bg-white text-gray-500'}`}>{t}</button>)}
          </div>
          {tab==='write'
            ? <textarea rows={10} value={content} onChange={e=>setContent(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"/>
            : <div className="bg-white border border-gray-200 rounded-lg p-4 min-h-40"><MD content={content}/></div>
          }
          <div className="flex gap-2 mt-3">
            <button onClick={submit} className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg text-sm">Submit</button>
            <button onClick={()=>setShowForm(false)} className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3 max-w-3xl">
        {reports.length===0 && <div className="text-center text-gray-400 py-16 bg-gray-50 rounded-xl">No reports yet</div>}
        {reports.map(r => {
          const intern = uMap[r.intern_id]; const reviewer = r.feedback_by ? uMap[r.feedback_by] : null
          return (
            <div key={r.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {intern && <Avatar name={intern.name} id={intern.id} size={28}/>}
                  <div>
                    <p className="font-black text-sm text-gray-900">{intern?.name} — Week {r.week_number}</p>
                    <p className="text-xs text-gray-400">{r.submitted_at}</p>
                  </div>
                </div>
                <Badge color={r.feedback?'green':'gray'}>{r.feedback?'Reviewed':'Pending'}</Badge>
              </div>
              <div className="px-4 py-3"><MD content={r.content}/></div>
              {r.feedback && (
                <div className="mx-4 mb-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <p className="text-xs font-black text-green-700 mb-0.5">Feedback from {reviewer?.name||'Mentor'}</p>
                  <p className="text-sm text-green-800">{r.feedback}</p>
                </div>
              )}
              {(user?.role==='mentor'||user?.role==='admin') && !r.feedback && (
                <div className="px-4 pb-3 flex gap-2">
                  <input placeholder="Add feedback…" value={fbMap[r.id]||''} onChange={e=>setFbMap(p=>({...p,[r.id]:e.target.value}))}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                  <button onClick={()=>sendFb(r.id)} className="bg-emerald-600 text-white font-bold px-4 py-2 rounded-lg text-sm">Send</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── INTERNS ──────────────────────────────────────────────────────────────────
export function InternsPage() {
  const { user } = useAuth()
  const [interns, setInterns] = useState([])
  const [progs,   setProgs]   = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({name:'',email:'',password:'intern123',role:'intern',internship_id:''})

  useEffect(() => {
    Promise.all([usersAPI.list({role:'intern'}), internshipsAPI.list()])
      .then(([u,p])=>{ setInterns(u.data); setProgs(p.data) })
      .catch(()=>toast.error('Load failed'))
      .finally(()=>setLoading(false))
  }, [])

  async function add() {
    if (!form.name||!form.email) { toast.error('Name and email required'); return }
    try { const {data}=await usersAPI.create(form); setInterns(p=>[...p,data]); setShowForm(false); toast.success('Intern added!') }
    catch(err) { toast.error(err.response?.data?.detail||'Failed') }
  }

  async function remove(id) {
    if (!confirm('Remove intern?')) return
    try { await usersAPI.remove(id); setInterns(p=>p.filter(u=>u.id!==id)); toast.success('Removed') }
    catch { toast.error('Failed') }
  }

  const pMap = Object.fromEntries(progs.map(p=>[p.id,p]))
  if (loading) return <div className="flex-1 flex items-center justify-center"><Spinner/></div>

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-black text-gray-900">{user?.role==='mentor'?'My Interns':'Intern Management'}</h1>
        {user?.role==='admin' && <button onClick={()=>setShowForm(!showForm)} className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">+ Add Intern</button>}
      </div>

      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input placeholder="Full name *" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            <input placeholder="Email *" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            <select value={form.internship_id} onChange={e=>setForm(p=>({...p,internship_id:e.target.value}))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select program</option>{progs.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <input placeholder="Password" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
          </div>
          <div className="flex gap-2">
            <button onClick={add} className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg text-sm">Add</button>
            <button onClick={()=>setShowForm(false)} className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {interns.map(intern => {
          const prog = pMap[intern.internship_id]
          return (
            <div key={intern.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={intern.name} id={intern.id} size={42}/>
                <div className="min-w-0">
                  <p className="font-black text-gray-900 text-sm">{intern.name}</p>
                  <p className="text-xs text-gray-400 truncate">{intern.email}</p>
                </div>
              </div>
              {prog && <div className="mb-3"><Badge color="blue">{prog.title}</Badge></div>}
              <div className="bg-gray-50 rounded-lg p-2.5 mb-3">
                <div className="flex justify-between text-xs mb-1.5"><span className="text-gray-400">Progress</span><span className="font-bold text-gray-600">tracked</span></div>
                <Bar pct={50}/>
              </div>
              {user?.role==='admin' && (
                <button onClick={()=>remove(intern.id)} className="w-full text-red-500 border border-red-100 hover:bg-red-50 rounded-lg py-1.5 text-xs font-bold">Remove</button>
              )}
            </div>
          )
        })}
        {interns.length===0 && <div className="col-span-3 text-center text-gray-400 py-16 bg-gray-50 rounded-xl">No interns yet</div>}
      </div>
    </div>
  )
}

// ─── INTERNSHIPS ──────────────────────────────────────────────────────────────
export function InternshipsPage() {
  const [progs,   setProgs]   = useState([])
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({title:'',duration:'',description:'',mentor_id:''})

  useEffect(() => {
    Promise.all([internshipsAPI.list(), usersAPI.list({role:'mentor'})])
      .then(([p,m])=>{ setProgs(p.data); setMentors(m.data) })
      .catch(()=>toast.error('Load failed'))
      .finally(()=>setLoading(false))
  }, [])

  async function create() {
    if (!form.title||!form.mentor_id) { toast.error('Title + mentor required'); return }
    try { const {data}=await internshipsAPI.create(form); setProgs(p=>[...p,data]); setShowForm(false); toast.success('Program created!') }
    catch(err) { toast.error(err.response?.data?.detail||'Failed') }
  }

  async function remove(id) {
    if (!confirm('Delete program?')) return
    try { await internshipsAPI.remove(id); setProgs(p=>p.filter(x=>x.id!==id)); toast.success('Deleted') }
    catch { toast.error('Failed') }
  }

  const mMap = Object.fromEntries(mentors.map(m=>[m.id,m]))
  if (loading) return <div className="flex-1 flex items-center justify-center"><Spinner/></div>

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-black text-gray-900">Internship Programs</h1>
        <button onClick={()=>setShowForm(!showForm)} className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">+ Create Program</button>
      </div>

      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input placeholder="Title *" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            <input placeholder="Duration (e.g. 3 months)" value={form.duration} onChange={e=>setForm(p=>({...p,duration:e.target.value}))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            <textarea placeholder="Description" rows={2} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"/>
            <select value={form.mentor_id} onChange={e=>setForm(p=>({...p,mentor_id:e.target.value}))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Assign mentor *</option>{mentors.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={create} className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg text-sm">Create</button>
            <button onClick={()=>setShowForm(false)} className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {progs.map(p => {
          const mentor = mMap[p.mentor_id]
          return (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-black text-gray-900">{p.title}</h3>
                {p.duration && <Badge color="purple">{p.duration}</Badge>}
              </div>
              <p className="text-sm text-gray-500 mb-3">{p.description}</p>
              {mentor && (
                <div className="flex items-center gap-2 mb-3">
                  <Avatar name={mentor.name} id={mentor.id} size={26}/>
                  <div><p className="text-[10px] text-gray-400">Mentor</p><p className="text-sm font-bold text-gray-700">{mentor.name}</p></div>
                </div>
              )}
              <div className="flex justify-end border-t border-gray-100 pt-2">
                <button onClick={()=>remove(p.id)} className="text-red-500 border border-red-100 hover:bg-red-50 rounded-lg px-3 py-1 text-xs font-bold">Delete</button>
              </div>
            </div>
          )
        })}
        {progs.length===0 && <div className="col-span-3 text-center text-gray-400 py-16 bg-gray-50 rounded-xl">No programs yet</div>}
      </div>
    </div>
  )
}
