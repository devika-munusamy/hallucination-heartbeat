import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { BarChart3, TrendingDown, TrendingUp } from 'lucide-react';
import { PageHeader } from '../components/UI';

const API = 'http://localhost:3001/api/v1';

const COLORS = { 'gpt-4o': '#3b82f6', 'gpt-3.5-turbo': '#8b5cf6', 'claude-3-haiku': '#10b981', 'llama-3-8b': '#f59e0b', 'gpt-mini-mock': '#ec4899', default: '#64748b' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass p-3 rounded-xl border-white/10 text-xs">
      <p className="text-slate-400 mb-2 font-bold">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }}></div>
          <span className="text-slate-300">{p.dataKey}: <b className="text-white">{p.value}</b></span>
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [traces, setTraces] = useState([]);

  useEffect(() => {
    fetch(`${API}/traces`)
      .then(r => r.json())
      .then(j => { if (j.success) setTraces(j.data); })
      .catch(() => {});
  }, []);

  // Build time-series data (group by minute)
  const timeSeriesMap = {};
  traces.forEach(t => {
    const key = new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (!timeSeriesMap[key]) timeSeriesMap[key] = { time: key, avgScore: 0, count: 0 };
    timeSeriesMap[key].avgScore += (t.hallucinationScore || 0);
    timeSeriesMap[key].count++;
  });
  const timeSeries = Object.values(timeSeriesMap).map(d => ({
    time: d.time,
    'Avg Risk Score': Math.round(d.avgScore / d.count),
    'Trace Count': d.count,
  })).slice(-12);

  // Per-model stats
  const modelMap = {};
  traces.forEach(t => {
    const m = t.model || 'unknown';
    if (!modelMap[m]) modelMap[m] = { model: m, scores: [], alerts: 0 };
    modelMap[m].scores.push(t.hallucinationScore || 0);
    if (t.alertTriggered) modelMap[m].alerts++;
  });
  const modelData = Object.values(modelMap).map(m => ({
    model: m.model.replace('gpt-', 'GPT-').replace('claude-', 'Claude-').replace('llama-', 'Llama-'),
    'Avg Score': Math.round(m.scores.reduce((a, b) => a + b, 0) / m.scores.length),
    'Alerts': m.alerts,
    'Traces': m.scores.length,
  }));

  // Risk distribution for pie
  const high = traces.filter(t => t.hallucinationScore > 70).length;
  const med  = traces.filter(t => t.hallucinationScore >= 40 && t.hallucinationScore <= 70).length;
  const low  = traces.filter(t => t.hallucinationScore < 40).length;
  const pieData = [
    { name: 'High Risk', value: high, color: '#ef4444' },
    { name: 'Medium Risk', value: med,  color: '#f59e0b' },
    { name: 'Low Risk',  value: low,  color: '#10b981' },
  ].filter(d => d.value > 0);

  const avgScore = Math.round(traces.reduce((a, t) => a + (t.hallucinationScore || 0), 0) / (traces.length || 1));
  const reliability = 100 - avgScore;

  return (
    <div>
      <PageHeader
        title={<>Reliability <span className="gradient-text">Analytics</span></>}
        sub="Model performance over time, risk distribution, and comparative hallucination rates"
      />

      {traces.length < 2 && (
        <div className="mb-8 glass rounded-2xl p-6 border-yellow-500/20 bg-yellow-500/5 text-sm text-yellow-400 font-medium">
          💡 Generate more traces from the Overview page to see populated charts.
        </div>
      )}

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Avg Risk Score', value: `${avgScore}%`, trend: avgScore > 50 ? 'up' : 'down', note: 'Across all models' },
          { label: 'Model Reliability', value: `${reliability}%`, trend: reliability > 50 ? 'up' : 'down', note: 'Inverted risk score' },
          { label: 'Models Tracked', value: Object.keys(modelMap).length, note: 'Unique model IDs' },
          { label: 'Alert Rate', value: `${Math.round((traces.filter(t=>t.alertTriggered).length / (traces.length||1)) * 100)}%`, note: '% traces flagged' },
        ].map(k => (
          <div key={k.label} className="glass rounded-2xl p-5 border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">{k.label}</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white">{k.value}</span>
              {k.trend === 'up' ? <TrendingUp size={16} className="text-red-400" /> : <TrendingDown size={16} className="text-emerald-400" />}
            </div>
            <p className="text-[10px] text-slate-600 mt-1">{k.note}</p>
          </div>
        ))}
      </div>

      {/* Time Series Chart */}
      <div className="glass rounded-2xl border-white/5 p-6 mb-8">
        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
          <BarChart3 size={16} className="text-blue-500" /> Hallucination Risk Over Time
        </h3>
        {timeSeries.length > 1 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={timeSeries}>
              <defs>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Avg Risk Score" stroke="#ef4444" strokeWidth={2} fill="url(#riskGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-slate-600 text-sm">Need more traces to plot timeline</div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Per-Model Bar Chart */}
        <div className="glass rounded-2xl border-white/5 p-6">
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-6">Avg Risk Score by Model</h3>
          {modelData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={modelData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="model" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Avg Score" radius={[6, 6, 0, 0]}>
                  {modelData.map((m, i) => (
                    <Cell key={i} fill={COLORS[m.model.replace('GPT-','gpt-').replace('Claude-','claude-').replace('Llama-','llama-')] || COLORS.default} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-600 text-sm">No model data yet</div>
          )}
        </div>

        {/* Risk Distribution Pie */}
        <div className="glass rounded-2xl border-white/5 p-6">
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-6">Risk Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-600 text-sm">No risk data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
