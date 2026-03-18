import { NavLink } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  Database,
  LayoutDashboard,
  ShieldAlert,
  Zap,
  PlayCircle,
} from 'lucide-react';

const navItems = [
  { to: '/',         icon: <LayoutDashboard size={18} />, label: 'Overview',            sub: 'Real-time KPIs' },
  { to: '/traces',   icon: <Database size={18} />,        label: 'Trace Explorer',       sub: 'Search & inspect' },
  { to: '/alerts',   icon: <ShieldAlert size={18} />,     label: 'Guardrail Alerts',     sub: 'Active violations' },
  { to: '/analytics',icon: <BarChart3 size={18} />,       label: 'Reliability Analytics',sub: 'Model performance' },
  { to: '/replay',   icon: <PlayCircle size={18} />,      label: 'Session Replay',       sub: 'Conversation audit' },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-72 sidebar border-r border-white/5 p-8 relative shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-4 mb-12">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Activity className="text-white" size={26} />
        </div>
        <div>
          <span className="text-2xl font-black font-display tracking-tight text-white block">HEARTBEAT</span>
          <span className="text-[10px] font-bold text-blue-500 tracking-[0.2em] uppercase">LLM Observability</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="space-y-1.5 flex-1">
        {navItems.map(({ to, icon, label, sub }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all cursor-pointer group ${
                isActive
                  ? 'bg-blue-600 shadow-lg shadow-blue-600/25 text-white'
                  : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? 'text-white' : 'text-slate-600 group-hover:text-slate-400'}>
                  {icon}
                </span>
                <div>
                  <p className="text-sm font-bold tracking-tight leading-none">{label}</p>
                  <p className={`text-[10px] mt-0.5 ${isActive ? 'text-blue-200' : 'text-slate-600 group-hover:text-slate-500'}`}>{sub}</p>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Status Badge */}
      <div className="mt-auto p-5 glass rounded-2xl border-white/5 bg-gradient-to-br from-blue-500/10 to-transparent">
        <div className="flex items-center gap-2 text-blue-400 mb-1.5">
          <Zap size={14} fill="currentColor" />
          <span className="text-[11px] font-black uppercase tracking-widest">Engine Online</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          AI scoring active · Trace ingestion healthy
        </p>
        <div className="flex items-center gap-1.5 mt-3 text-[10px] text-emerald-400 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          All systems operational
        </div>
      </div>
    </aside>
  );
}
