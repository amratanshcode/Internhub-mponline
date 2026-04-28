import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Avatar } from './UI'

const NAV = {
  admin:  [{to:'/analytics',label:'Analytics',icon:'📊'},{to:'/interns',label:'Interns',icon:'👥'},{to:'/internships',label:'Programs',icon:'🎓'},{to:'/tasks',label:'Tasks',icon:'📋'},{to:'/reports',label:'Reports',icon:'📝'}],
  mentor: [{to:'/analytics',label:'Analytics',icon:'📊'},{to:'/interns',label:'My Interns',icon:'👥'},{to:'/tasks',label:'Tasks',icon:'📋'},{to:'/reports',label:'Reports',icon:'📝'}],
  intern: [{to:'/analytics',label:'Analytics',icon:'📊'},{to:'/tasks',label:'My Tasks',icon:'📋'},{to:'/reports',label:'Reports',icon:'📝'}],
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  if (!user) return null
  return (
    <aside className="w-52 bg-[#1E1B4B] flex flex-col shrink-0">
      <div className="px-4 pt-5 pb-4 flex-1">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-lg">🚀</div>
          <div>
            <p className="font-black text-white text-sm leading-none">InternHub</p>
            <p className="text-[10px] text-indigo-300 uppercase tracking-widest">{user.role}</p>
          </div>
        </div>
        {/* User pill */}
        <div className="flex items-center gap-2 bg-[#312E81] rounded-lg px-2.5 py-2 mb-5">
          <Avatar name={user.name} id={user.id} size={28}/>
          <div className="min-w-0">
            <p className="text-indigo-100 font-semibold text-xs truncate">{user.name}</p>
            <p className="text-indigo-400 text-[10px] truncate">{user.email}</p>
          </div>
        </div>
        {/* Nav */}
        <nav className="space-y-0.5">
          {(NAV[user.role]||[]).map(item => (
            <NavLink key={item.to} to={item.to} className={({isActive}) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isActive?'bg-indigo-600 text-white font-bold':'text-indigo-300 hover:bg-[#312E81] hover:text-white'}`}>
              <span>{item.icon}</span>{item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="px-4 pb-4 border-t border-[#312E81] pt-3">
        <button onClick={logout} className="w-full text-indigo-300 border border-[#312E81] rounded-lg py-1.5 text-xs hover:bg-[#312E81]">
          🚪 Sign Out
        </button>
      </div>
    </aside>
  )
}
