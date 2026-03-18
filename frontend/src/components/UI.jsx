import React from 'react';

export function StatCard({ label, value, sub, icon, isAlert = false }) {
  return (
    <div className={`glass p-6 rounded-2xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:border-white/20 ${isAlert ? 'border-red-500/30 bg-red-500/5' : 'border-white/5'}`}>
      <div className="relative z-10">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${isAlert ? 'bg-red-500/10 border-red-500/20' : 'bg-slate-900 border-white/5'}`}>
          {icon}
        </div>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">{label}</p>
        <p className={`text-3xl font-black font-display ${isAlert ? 'text-red-400' : 'text-white'}`}>{value}</p>
        {sub && <p className="text-[11px] text-slate-500 mt-1">{sub}</p>}
      </div>
      <div className="absolute -right-4 -bottom-4 transition-transform duration-500 group-hover:scale-125 opacity-[0.03] text-blue-500">
        {icon && React.cloneElement(icon, { size: 100 })}
      </div>
    </div>
  );
}

export function RiskBadge({ score }) {
  if (score === null || score === undefined)
    return <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-500 font-bold">Pending</span>;
  if (score > 70)
    return <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 font-bold border border-red-500/20">🔴 HIGH {score}%</span>;
  if (score > 40)
    return <span className="text-[10px] px-2 py-0.5 rounded-md bg-yellow-500/20 text-yellow-400 font-bold border border-yellow-500/20">🟡 MED {score}%</span>;
  return <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/20">🟢 LOW {score}%</span>;
}

export function RiskBar({ score }) {
  const color = score > 70 ? 'bg-red-500' : score > 40 ? 'bg-yellow-500' : 'bg-emerald-500';
  return (
    <div className="flex items-center gap-2 w-36">
      <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${score || 0}%` }} />
      </div>
      <span className="text-[11px] font-mono text-slate-400 w-8 text-right">{score ?? '—'}</span>
    </div>
  );
}

export function PageHeader({ title, sub, children }) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
      <div>
        <h1 className="text-4xl font-black font-display text-white mb-2 tracking-tight">{title}</h1>
        <p className="text-slate-500 text-sm">{sub}</p>
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </header>
  );
}
