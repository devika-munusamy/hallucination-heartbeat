import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, RefreshCw, ChevronDown, X } from 'lucide-react';
import { RiskBadge, RiskBar, PageHeader } from '../components/UI';

const API = 'http://localhost:3001/api/v1';

const MODELS = ['All Models', 'gpt-4o', 'gpt-3.5-turbo', 'claude-3-haiku', 'llama-3-8b', 'gpt-mini-mock'];
const RISK_FILTERS = ['All Risk Levels', 'High (>70)', 'Medium (40-70)', 'Low (<40)'];

export default function TracesPage() {
  const [traces, setTraces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modelFilter, setModelFilter] = useState('All Models');
  const [riskFilter, setRiskFilter] = useState('All Risk Levels');
  const [selectedTrace, setSelectedTrace] = useState(null);

  const fetchTraces = useCallback(async () => {
    try {
      const r = await fetch(`${API}/traces`);
      const j = await r.json();
      if (j.success) setTraces(j.data);
    } catch (e) {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchTraces();
    const t = setInterval(fetchTraces, 8000);
    return () => clearInterval(t);
  }, [fetchTraces]);

  const filtered = traces.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.prompt?.toLowerCase().includes(q) || t.response?.toLowerCase().includes(q) || t.model?.toLowerCase().includes(q);
    const matchModel = modelFilter === 'All Models' || t.model === modelFilter;
    const s = t.hallucinationScore;
    const matchRisk =
      riskFilter === 'All Risk Levels' ? true :
      riskFilter === 'High (>70)' ? s > 70 :
      riskFilter === 'Medium (40-70)' ? s >= 40 && s <= 70 :
      s < 40;
    return matchSearch && matchModel && matchRisk;
  });

  const clearFilters = () => { setSearch(''); setModelFilter('All Models'); setRiskFilter('All Risk Levels'); };
  const hasFilters = search || modelFilter !== 'All Models' || riskFilter !== 'All Risk Levels';

  return (
    <div>
      <PageHeader
        title={<>Trace <span className="gradient-text">Explorer</span></>}
        sub="Search, filter, and inspect every LLM interaction captured by the ingestion engine"
      >
        <button onClick={fetchTraces} className="p-2.5 glass rounded-xl border-white/10 hover:bg-white/5 transition-all" title="Refresh">
          <RefreshCw size={18} className="text-slate-400" />
        </button>
      </PageHeader>

      {/* Filter Bar — Atatus-style */}
      <div className="glass rounded-2xl border-white/5 p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[220px] glass rounded-xl border-white/5 px-3 py-2">
          <Search size={16} className="text-slate-500 shrink-0" />
          <input
            className="bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none w-full"
            placeholder="Search by prompt, response, model name…"
            value={search} onChange={e => setSearch(e.target.value)}
          />
          {search && <X size={14} className="text-slate-500 cursor-pointer hover:text-white" onClick={() => setSearch('')} />}
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-500" />
          <select value={modelFilter} onChange={e => setModelFilter(e.target.value)}
            className="bg-slate-900 border border-white/10 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none cursor-pointer">
            {MODELS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)}
            className="bg-slate-900 border border-white/10 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none cursor-pointer">
            {RISK_FILTERS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>

        {hasFilters && (
          <button onClick={clearFilters} className="text-[11px] text-slate-500 hover:text-white flex items-center gap-1 transition-colors">
            <X size={12} /> Clear
          </button>
        )}

        <span className="ml-auto text-[11px] text-slate-600 font-mono">{filtered.length} of {traces.length} traces</span>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-white/[0.02] text-slate-500 text-[10px] uppercase tracking-widest font-black border-b border-white/5">
                <th className="px-6 py-4">Trace ID</th>
                <th className="px-6 py-4">Model</th>
                <th className="px-6 py-4">Prompt</th>
                <th className="px-6 py-4">Risk Score</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Latency</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {loading ? (
                <tr><td colSpan="8" className="text-center py-20 text-slate-600 animate-pulse">Fetching trace history...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-20 text-slate-600">No traces match your filters</td></tr>
              ) : filtered.map(t => (
                <tr key={t._id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => setSelectedTrace(t)}>
                  <td className="px-6 py-4">
                    <span className="font-mono text-[11px] text-slate-500 glass px-2 py-0.5 rounded border-white/5">#{t._id.slice(-10)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg">{t.model}</span>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-xs text-slate-300 truncate">{t.prompt}</p>
                  </td>
                  <td className="px-6 py-4"><RiskBadge score={t.hallucinationScore} /></td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/10">
                      cosine-sim
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">{t.latency}ms</td>
                  <td className="px-6 py-4 text-[11px] text-slate-600">{new Date(t.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">Inspect →</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trace Detail Drawer */}
      {selectedTrace && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTrace(null)}>
          <div className="w-full max-w-xl glass border-l border-white/10 p-8 overflow-y-auto h-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-white">Trace Inspection</h2>
              <button onClick={() => setSelectedTrace(null)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-2">Trace ID</p>
                <p className="font-mono text-xs text-slate-400">{selectedTrace._id}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Detail label="Model" value={selectedTrace.model} />
                <Detail label="Latency" value={`${selectedTrace.latency}ms`} />
                <Detail label="Tokens" value={selectedTrace.tokenUsage?.totalTokens ?? '—'} />
                <Detail label="Timestamp" value={new Date(selectedTrace.timestamp).toLocaleTimeString()} />
              </div>
              <div>
                <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-2">Risk Assessment</p>
                <div className="glass p-4 rounded-xl border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <RiskBadge score={selectedTrace.hallucinationScore} />
                    <span className="text-[10px] text-slate-500 font-mono">detection: cosine-similarity</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${selectedTrace.hallucinationScore > 70 ? 'bg-red-500' : selectedTrace.hallucinationScore > 40 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                      style={{ width: `${selectedTrace.hallucinationScore}%` }} />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-2">Prompt</p>
                <div className="glass p-4 rounded-xl border-white/5 text-sm text-blue-300 italic">{selectedTrace.prompt}</div>
              </div>
              <div>
                <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-2">LLM Response</p>
                <div className="glass p-4 rounded-xl border-white/5 text-sm text-slate-300">{selectedTrace.response}</div>
              </div>
              {selectedTrace.alertTriggered && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                  <p className="text-sm text-red-400 font-bold">⚠️ Guardrail Triggered</p>
                  <p className="text-xs text-red-400/70 mt-1">This trace exceeded the hallucination threshold (70) and triggered an alert.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="glass p-3 rounded-xl border-white/5">
      <p className="text-[9px] text-slate-600 uppercase tracking-widest font-bold mb-1">{label}</p>
      <p className="text-sm text-white font-bold">{value}</p>
    </div>
  );
}
