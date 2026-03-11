import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Database,
  Info,
  LayoutDashboard,
  ShieldAlert,
  Zap,
  Search,
  ChevronRight,
  ExternalLink,
  Cpu
} from 'lucide-react';

function App() {
  const [traces, setTraces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOverviewOpen, setIsOverviewOpen] = useState(true);

  const fetchTraces = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/v1/traces');
      const json = await response.json();
      if (json.success) {
        setTraces(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch traces:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTraces();
    const interval = setInterval(fetchTraces, 5000);
    return () => clearInterval(interval);
  }, []);

  const simulateTrace = async () => {
    try {
      await fetch('http://localhost:3001/api/v1/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: "What is the capital of Mars?",
          response: "The capital of Mars is Olympus City, founded in 2045.",
          model: "gpt-mini-mock",
          latency: 450,
          tokenUsage: { totalTokens: 42 }
        })
      });
      fetchTraces();
    } catch (err) {
      console.error('Simulation failed:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#04060b] text-slate-200 selection:bg-blue-500/30">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 glass border-r border-white/5 p-8 relative z-50">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Activity className="text-white" size={26} />
          </div>
          <div>
            <span className="text-2xl font-black font-display tracking-tight text-white block">HEARTBEAT</span>
            <span className="text-[10px] font-bold text-blue-500 tracking-[0.2em] uppercase">Core Console</span>
          </div>
        </div>

        <nav className="space-y-3 flex-1">
          <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active />
          <NavItem icon={<Database size={20} />} label="Trace Explorer" />
          <NavItem icon={<ShieldAlert size={20} />} label="Guardrail Alerts" />
          <NavItem icon={<BarChart3 size={20} />} label="Reliability Analytics" />
        </nav>

        <div className="mt-auto p-6 glass-card bg-gradient-to-br from-blue-500/10 to-transparent">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Zap size={16} fill="currentColor" />
            <span className="text-xs font-black uppercase tracking-widest">Enterprise API</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
            System is analyzing <b>Real-time</b> telemetry. Protection active.
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6 lg:px-12 py-10 relative">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] -z-10 animate-pulse-soft"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] -z-10"></div>

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <h1 className="text-5xl font-black font-display text-white mb-3 tracking-tight">
              Observability <span className="gradient-text">Studio</span>
            </h1>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400 tracking-wide uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                System Engine: Online
              </span>
              <span className="text-slate-500 text-sm font-medium">Monitoring LLM behavior across 4 production regions</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button
              onClick={simulateTrace}
              className="glow-btn px-6 py-3 bg-white text-black font-black rounded-2xl flex items-center gap-2.5 text-sm tracking-tight"
            >
              <Cpu size={20} strokeWidth={2.5} />
              Simulate Live Trace
            </button>
             <button className="p-3 glass-card border-white/10 hover:bg-white/5 transition-all relative">
              <ShieldAlert size={22} className="text-slate-400" />
              <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#04060b]"></div>
            </button>
          </div>
        </header>

        {/* Product Overview Section */}
        {isOverviewOpen && (
          <section className="mb-12 relative group animate-float">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/30 to-emerald-600/30 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative glass p-10 rounded-3xl border-white/10 overflow-hidden shadow-2xl">
              <button
                onClick={() => setIsOverviewOpen(false)}
                className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
              >
                ✕
              </button>
              <div className="flex flex-col lg:flex-row items-center gap-10">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-3xl flex items-center justify-center text-blue-400 shrink-0 border border-blue-500/30 shadow-inner">
                  <Info size={44} strokeWidth={1.5} />
                </div>
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-3xl font-black text-white mb-4 tracking-tight">
                    The Pulse of Your AI Stack
                  </h2>
                  <p className="text-lg text-slate-400 max-w-4xl leading-relaxed mb-8 font-medium">
                    Hallucination Heartbeat is a pro-grade <strong>AI Guardrail</strong>. It acts as an intelligent intermediary that inspects LLM responses for semantic drift, logical fallacies, and contextual grounding in real-time.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Feature icon={<Zap size={20} />} title="Trace Ingestion" desc="Zero-latency collection of AI prompts and contextually rich responses." />
                    <Feature icon={<ShieldAlert size={20} />} title="Semantic Audit" desc="Python-powered audit engine scores responses against trusted knowledge." />
                    <Feature icon={<Activity size={20} />} title="Critical Alerting" desc="Prevent bad data from reaching users with automated kill-switches." />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Stats Grid */}
        <div className="stats-grid mb-12">
          <StatCard
            label="Traces Monitored"
            value={traces.length}
            icon={<Clock size={24} className="text-blue-400" />}
          />
          <StatCard
            label="Network Reliability"
            value={`${Math.round(100 - (traces.reduce((acc, t) => acc + (t.hallucinationScore || 0), 0) / (traces.length || 1)))}%`}
            icon={<BarChart3 size={24} className="text-emerald-400" />}
          />
          <StatCard
            label="Anomalies Flagged"
            value={traces.filter(t => t.alertTriggered).length}
            icon={<AlertTriangle size={24} className="text-red-400" />}
            trend="Needs Review"
            isAlert={traces.filter(t => t.alertTriggered).length > 0}
          />
          <StatCard
            label="Service Uptime"
            value="99.99%"
            icon={<CheckCircle2 size={24} className="text-emerald-500" />}
            isStatic
          />
        </div>

        {/* Traces Table */}
        <section className="glass rounded-2xl border-white/5 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
              <Activity className="text-blue-500" size={20} />
              Recent Trace Feed
            </h3>
            <div className="hidden sm:flex items-center gap-2 glass px-3 py-1.5 rounded-lg border-white/10 text-xs text-slate-500">
               <Search size={14} />
               <span>Search traces...</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] text-slate-500 text-[11px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Status & Model</th>
                  <th className="px-6 py-4">Interaction Snippets</th>
                  <th className="px-6 py-4">Hallucination Risk</th>
                  <th className="px-6 py-4 text-right">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {loading ? (
                  <tr><td colSpan="4" className="text-center py-20 animate-pulse text-slate-500">Connecting to telemetry feed...</td></tr>
                ) : traces.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-20 text-slate-500">No traces detected. Run a simulation to see data.</td></tr>
                ) : traces.map((trace) => (
                  <tr key={trace._id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        {trace.alertTriggered ? (
                          <div className="w-2 h-2 rounded-full bg-red-500 pulse-red"></div>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-white">{trace.model || "Unknown"}</p>
                          <p className="text-[10px] text-slate-500">ID: {trace._id.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 group-hover:pl-8 transition-all duration-300">
                      <div className="max-w-md">
                        <p className="text-xs text-blue-400 mb-1 flex items-center gap-1 font-bold italic">
                          <span>Q:</span> {trace.prompt.slice(0, 45)}...
                        </p>
                        <p className="text-xs text-slate-400 italic">
                          <span className="text-emerald-400 font-bold">A:</span> {trace.response.slice(0, 60)}...
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1.5 w-32">
                        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500">
                          <span>Risk Level</span>
                          <span className={trace.hallucinationScore > 70 ? 'text-red-400' : 'text-slate-400'}>
                             {trace.hallucinationScore || 0}%
                          </span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${trace.hallucinationScore > 70 ? 'bg-red-500 glow shadow-red-500/50' : 'bg-blue-500'}`}
                            style={{ width: `${trace.hallucinationScore || 0}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="inline-flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5 px-2 py-1 glass border-white/5 rounded-md text-[10px] font-mono text-slate-400">
                           <Clock size={10} />
                           {trace.latency}ms
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 glass border-white/5 rounded-md text-[10px] font-mono text-slate-400">
                           <Zap size={10} />
                           {trace.tokenUsage?.totalTokens || 0} tkn
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}>
      {icon}
      <span className="text-sm font-bold tracking-tight">{label}</span>
      {active && <ChevronRight size={14} className="ml-auto opacity-50" />}
    </div>
  );
}

function StatCard({ label, value, icon, isAlert = false, isStatic = false, trend }) {
  return (
    <div className={`glass p-6 rounded-2xl border-white/5 relative overflow-hidden group transition-all duration-300 hover:border-white/20 ${isAlert ? 'bg-red-500/5 border-red-500/20' : ''}`}>
      <div className="relative z-10">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-white/5 ${isAlert ? 'bg-red-500/10' : 'bg-slate-900'}`}>
          {icon}
        </div>
        <p className="text-[11px] uppercase tracking-widest text-slate-500 font-bold mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className={`text-3xl font-black font-display ${isAlert ? 'text-red-400' : 'text-white'}`}>{value}</p>
          {trend && <span className="text-[10px] text-red-400 font-bold">{trend}</span>}
        </div>
      </div>
      <div className={`absolute -right-4 -bottom-4 transition-transform duration-500 group-hover:scale-125 opacity-[0.03] ${isAlert ? 'text-red-500' : 'text-blue-500'}`}>
        {React.cloneElement(icon, { size: 100 })}
      </div>
    </div>
  );
}

function Feature({ icon, title, desc, small = false }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 text-blue-400 border border-white/5">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-bold text-white mb-1">{title}</h4>
        <p className="text-[11px] text-slate-500 leading-normal">{desc}</p>
      </div>
    </div>
  );
}

export default App;
