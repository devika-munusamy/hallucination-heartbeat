import { useState, useEffect } from 'react';
import { AlertTriangle, Bell, CheckCircle2, Clock, Settings } from 'lucide-react';
import { PageHeader } from '../components/UI';

const API = 'http://localhost:3001/api/v1';

const DEFAULT_RULES = [
  { id: 1, name: 'High Hallucination Risk', model: 'All Models', threshold: 70, action: 'Slack Webhook', enabled: true },
  { id: 2, name: 'Prompt Injection Detected', model: 'gpt-3.5-turbo', threshold: 60, action: 'Email Alert', enabled: true },
  { id: 3, name: 'Low Confidence Response', model: 'llama-3-8b', threshold: 50, action: 'Log Only', enabled: false },
];

export default function AlertsPage() {
  const [traces, setTraces] = useState([]);
  const [rules, setRules] = useState(DEFAULT_RULES);

  useEffect(() => {
    fetch(`${API}/traces`)
      .then(r => r.json())
      .then(j => { if (j.success) setTraces(j.data); })
      .catch(() => {});
  }, []);

  const alerts = traces.filter(t => t.alertTriggered);
  const toggleRule = (id) => setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));

  return (
    <div>
      <PageHeader
        title={<>Guardrail <span className="gradient-text">Alerts</span></>}
        sub="Manage threshold rules and review triggered violations"
      >
        <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold border ${alerts.length > 0 ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${alerts.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
          {alerts.length > 0 ? `${alerts.length} Active Violations` : 'No Violations'}
        </span>
      </PageHeader>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* Alert Rules */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Settings size={16} className="text-slate-500" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Threshold Rules</h3>
          </div>
          <div className="space-y-4">
            {rules.map(rule => (
              <div key={rule.id} className={`glass rounded-2xl p-6 border transition-all ${rule.enabled ? 'border-blue-500/20' : 'border-white/5 opacity-60'}`}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm font-black text-white">{rule.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Model: {rule.model}</p>
                  </div>
                  <button onClick={() => toggleRule(rule.id)}
                    className={`relative w-11 h-6 rounded-full transition-all shrink-0 ${rule.enabled ? 'bg-blue-600' : 'bg-slate-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${rule.enabled ? 'left-6' : 'left-1'}`}></div>
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500"
                      style={{ width: `${rule.threshold}%` }} />
                  </div>
                  <span className="text-xs font-mono text-slate-400 w-16 text-right">
                    Trigger @ {rule.threshold}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 border border-blue-500/10 px-2 py-0.5 rounded">
                    {rule.action}
                  </span>
                  <span className={`text-[10px] font-bold ${rule.enabled ? 'text-emerald-400' : 'text-slate-600'}`}>
                    {rule.enabled ? '● Active' : '○ Disabled'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Triggered Alerts Feed */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Bell size={16} className="text-red-500" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Triggered Violations</h3>
          </div>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="glass rounded-2xl p-12 border-white/5 text-center">
                <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-3 opacity-60" />
                <p className="text-slate-500 text-sm">No guardrail violations detected.</p>
                <p className="text-slate-600 text-[11px] mt-1">Your LLMs are operating within threshold boundaries.</p>
              </div>
            ) : alerts.map(t => (
              <div key={t._id} className="glass rounded-2xl p-5 border-red-500/20 bg-red-500/5 hover:border-red-500/40 transition-all">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0 mt-0.5"></div>
                    <div>
                      <p className="text-sm font-bold text-white">{t.model}</p>
                      <p className="font-mono text-[10px] text-slate-600">#{t._id.slice(-10)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-lg font-black text-red-400">{t.hallucinationScore}</span>
                    <p className="text-[9px] text-slate-600 uppercase tracking-wider">Score</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 italic border-l-2 border-red-500/30 pl-3 mb-3">"{t.prompt?.slice(0, 80)}..."</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/15">
                    <AlertTriangle size={10} /> Guardrail Triggered
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-600">
                    <Clock size={10} /> {new Date(t.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
