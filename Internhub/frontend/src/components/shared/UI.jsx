const COLORS = ['bg-indigo-500','bg-cyan-600','bg-emerald-600','bg-amber-500','bg-rose-500','bg-violet-600']

export function Avatar({ name='', id='', size=36 }) {
  const initials = name.split(' ').map(p=>p[0]).join('').toUpperCase().slice(0,2)
  const bg = COLORS[id.charCodeAt(id.length-1) % COLORS.length]
  return (
    <div className={`${bg} rounded-full flex items-center justify-center text-white font-bold shrink-0`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {initials}
    </div>
  )
}

const BADGE = { blue:'bg-blue-100 text-blue-700', green:'bg-green-100 text-green-700', amber:'bg-amber-100 text-amber-700', red:'bg-red-100 text-red-700', purple:'bg-purple-100 text-purple-700', gray:'bg-gray-100 text-gray-600' }
export function Badge({ children, color='gray' }) {
  return <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${BADGE[color]||BADGE.gray}`}>{children}</span>
}

export function Stat({ label, value, sub, color='border-indigo-500' }) {
  return (
    <div className={`bg-white border border-gray-200 border-l-4 ${color} rounded-xl p-4`}>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export function Ring({ pct=0, size=76, stroke=6, color='#4F46E5', label }) {
  const r = (size-stroke*2)/2, circ = 2*Math.PI*r, off = circ-(pct/100)*circ
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{width:size,height:size}}>
        <svg width={size} height={size}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={stroke}/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
            style={{transform:'rotate(-90deg)',transformOrigin:'50% 50%'}}/>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-gray-900">{pct}%</div>
      </div>
      {label && <p className="text-[11px] text-gray-400">{label}</p>}
    </div>
  )
}

export function Spinner() {
  return <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"/>
}

export function Bar({ pct=0 }) {
  const c = pct>66?'bg-emerald-500':pct>33?'bg-amber-400':'bg-indigo-500'
  return <div className="h-1.5 bg-gray-100 rounded-full"><div className={`h-full ${c} rounded-full`} style={{width:`${pct}%`}}/></div>
}
