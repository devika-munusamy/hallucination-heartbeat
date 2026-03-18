import { useState, useEffect } from 'react';
import { PlayCircle, ChevronRight, SkipBack, SkipForward, Pause, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { RiskBadge, PageHeader } from '../components/UI';

const API = 'http://localhost:3001/api/v1';

export default function ReplayPage() {
  const [traces, setTraces] = useState([]);
  const [selected, setSelected] = useState(null);
  const [step, setStep] = useState(0);  // 0=prompt, 1=thinking, 2=response, 3=audit
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    fetch(`${API}/traces`)
      .then(r => r.json())
      .then(j => { if (j.success) setTraces(j.data); })
      .catch(() => {});
  }, []);

  // Auto-play through steps
  useEffect(() => {
    if (!playing || !selected) return;
    if (step >= 3) { setPlaying(false); return; }
    const t = setTimeout(() => setStep(s => s + 1), step === 1 ? 1500 : 1000);
    return () => clearTimeout(t);
  }, [playing, step, selected]);

  const startReplay = (trace) => {
    setSelected(trace);
    setStep(0);
    setPlaying(false);
  };

  const replaySteps = [
    { label: 'Prompt Sent', key: 'prompt' },
    { label: 'LLM Processing', key: 'thinking' },
    { label: 'Response Received', key: 'response' },
    { label: 'Audit Complete', key: 'audit' },
  ];

  return (
    <div>
      <PageHeader
        title={<>Session <span className="gradient-text">Replay</span></>}
        sub="Step through the full conversation that triggered a hallucination — just like session replay in Atatus"
      />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">

        {/* Session List */}
        <div className="xl:col-span-2">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-4">Select a Trace to Replay</p>
          <div className="space-y-3">
            {traces.length === 0 && (
              <div className="glass rounded-2xl p-8 border-white/5 text-center text-slate-600 text-sm">
                No traces to replay yet.<br />Generate some from the Overview page.
              </div>
            )}
            {traces.map(t => (
              <button key={t._id} onClick={() => startReplay(t)}
                className={`w-full text-left glass rounded-2xl p-5 border transition-all hover:border-white/20 ${selected?._id === t._id ? 'border-blue-500/40 bg-blue-500/5' : 'border-white/5'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300">{t.model}</span>
                  <RiskBadge score={t.hallucinationScore} />
                </div>
                <p className="text-[11px] text-slate-500 italic truncate">"{t.prompt}"</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-slate-600">{new Date(t.timestamp).toLocaleTimeString()}</span>
                  {t.alertTriggered && <span className="text-[10px] text-red-400 font-bold flex items-center gap-1"><AlertTriangle size={10}/>Flagged</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Replay Player */}
        <div className="xl:col-span-3">
          {!selected ? (
            <div className="glass rounded-2xl p-16 border-white/5 text-center h-full flex flex-col items-center justify-center">
              <PlayCircle size={56} className="text-slate-700 mb-4" />
              <p className="text-slate-500 font-bold">Select a trace to replay</p>
              <p className="text-slate-600 text-sm mt-1">Watch the AI conversation step-by-step</p>
            </div>
          ) : (
            <div className="glass rounded-2xl border-white/5 overflow-hidden">
              {/* Player Header */}
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-white">{selected.model}</p>
                  <p className="text-[10px] font-mono text-slate-600">#{selected._id.slice(-12)}</p>
                </div>
                <RiskBadge score={selected.hallucinationScore} />
              </div>

              {/* Step Indicators */}
              <div className="px-6 pt-6 pb-4 flex items-center gap-2">
                {replaySteps.map((s, i) => (
                  <div key={s.key} className="flex items-center gap-2 flex-1">
                    <div className={`flex items-center gap-1.5 ${i <= step ? 'text-blue-400' : 'text-slate-700'}`}>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all ${i <= step ? 'border-blue-500 bg-blue-500/20' : 'border-slate-700'}`}>
                        {i < step ? '✓' : i + 1}
                      </div>
                      <span className="text-[9px] uppercase tracking-wider font-bold hidden lg:block">{s.label}</span>
                    </div>
                    {i < replaySteps.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-blue-500/40' : 'bg-white/5'}`}></div>}
                  </div>
                ))}
              </div>

              {/* Content Area */}
              <div className="px-6 pb-6 space-y-4 min-h-[280px]">
                {/* Step 0: Prompt */}
                {step >= 0 && (
                  <div className="animate-in fade-in duration-500">
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-2">📤 User Prompt</p>
                    <div className="glass p-4 rounded-xl border-blue-500/20 bg-blue-500/5 text-sm text-blue-200 italic">
                      "{selected.prompt}"
                    </div>
                  </div>
                )}

                {/* Step 1: Thinking */}
                {step >= 1 && (
                  <div className="animate-in fade-in duration-500">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">⚙️ LLM Processing</p>
                    <div className="glass p-4 rounded-xl border-white/5 text-xs text-slate-500 space-y-1">
                      <p>→ Tokenizing input ({selected.tokenUsage?.totalTokens ?? '?'} tokens)</p>
                      <p>→ Generating completion...</p>
                      <p>→ Latency: {selected.latency}ms</p>
                    </div>
                  </div>
                )}

                {/* Step 2: Response */}
                {step >= 2 && (
                  <div className="animate-in fade-in duration-500">
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-2">📥 LLM Response</p>
                    <div className="glass p-4 rounded-xl border-white/5 text-sm text-slate-200">
                      "{selected.response}"
                    </div>
                  </div>
                )}

                {/* Step 3: Audit Result */}
                {step >= 3 && (
                  <div className="animate-in fade-in duration-500">
                    <p className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest mb-2">🧠 Audit Engine Result</p>
                    <div className={`glass p-4 rounded-xl border text-sm ${selected.alertTriggered ? 'border-red-500/30 bg-red-500/5' : 'border-emerald-500/30 bg-emerald-500/5'}`}>
                      <div className="flex items-center gap-3 mb-3">
                        {selected.alertTriggered
                          ? <AlertTriangle size={20} className="text-red-400" />
                          : <CheckCircle2 size={20} className="text-emerald-400" />}
                        <div>
                          <p className={`font-black text-sm ${selected.alertTriggered ? 'text-red-400' : 'text-emerald-400'}`}>
                            {selected.alertTriggered ? 'Hallucination Detected' : 'Response Grounded'}
                          </p>
                          <p className="text-[10px] text-slate-500">Method: cosine-similarity vs. context embeddings</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">Risk Score:</span>
                        <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                          <div className={`h-full rounded-full ${selected.hallucinationScore > 70 ? 'bg-red-500' : selected.hallucinationScore > 40 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                            style={{ width: `${selected.hallucinationScore}%` }} />
                        </div>
                        <span className="text-xs font-black text-white">{selected.hallucinationScore}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Player Controls */}
              <div className="px-6 py-4 border-t border-white/5 flex items-center justify-center gap-4">
                <button onClick={() => { setStep(0); setPlaying(false); }} className="p-2 text-slate-500 hover:text-white transition-colors">
                  <SkipBack size={18} />
                </button>
                <button
                  onClick={() => { if (step === 0 && !playing) { setPlaying(true); } else { setPlaying(p => !p); } }}
                  className="w-12 h-12 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 shadow-lg shadow-blue-500/30">
                  {playing ? <Pause size={20} /> : <PlayCircle size={22} />}
                </button>
                <button onClick={() => setStep(s => Math.min(s + 1, 3))} className="p-2 text-slate-500 hover:text-white transition-colors">
                  <SkipForward size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
