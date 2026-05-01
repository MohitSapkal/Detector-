import { useState, useEffect, useRef } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
} from 'recharts';
import { scoreText, type ScoringResult, riskLevel, barColor, SOURCE_SCORES } from '../lib/scoring';
import styles from './EvaluationPage.module.css';

const SAMPLES = [
  { label: "🚨 False health claim", text: "Scientists confirm drinking bleach cures COVID-19 within 24 hours, major study suppressed by government!!", source: "Social media post" },
  { label: "✅ True science fact", text: "The Earth orbits the Sun once every 365.25 days, which is why we add a leap day every four years.", source: "News article" },
  { label: "🗳️ Election misinfo", text: "BREAKING: Voting machines in 3 states were secretly connected to the internet and flipped millions of votes.", source: "Social media post" },
  { label: "📊 Misleading stat", text: "Studies show 9 out of 10 doctors recommend our supplement — cures diabetes in 2 weeks, guaranteed!", source: "Blog / unknown site" }
];

const DARK_BG = 'transparent';

interface AnimatedGaugeProps {
  value: number; // 0-100
  color: string;
}

function AnimatedGauge({ value, color }: AnimatedGaugeProps) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 900;
    const from = 0;
    const to = value;
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(from + (to - from) * ease));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  // Donut/gauge via SVG
  const r = 70;
  const cx = 90, cy = 90;
  const circumference = Math.PI * r; // half-circle
  const dash = (displayed / 100) * circumference;
  const gap = circumference - dash;

  return (
    <div className={styles.gaugeWrap}>
      <svg width="180" height="110" viewBox="0 0 180 110">
        {/* Track */}
        <path
          d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
          fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="14" strokeLinecap="round"
        />
        {/* Fill */}
        <path
          d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
          fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
          style={{ transition: 'stroke-dasharray 0.1s linear', filter: `drop-shadow(0 0 6px ${color})` }}
        />
        {/* Center text */}
        <text x={cx} y={cy - 6} textAnchor="middle" fill={color} fontSize="26" fontWeight="700" fontFamily="DM Mono, monospace">
          {displayed}%
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="11" fontFamily="DM Sans, sans-serif">
          RISK SCORE
        </text>
      </svg>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; fill: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        <p className={styles.tooltipValue} style={{ color: payload[0].fill || '#fff' }}>
          {Math.round(payload[0].value)}%
        </p>
      </div>
    );
  }
  return null;
};

export function EvaluationPage() {
  const [inputText, setInputText] = useState('');
  const [source, setSource] = useState('News article');
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [evalHistory, setEvalHistory] = useState<{ text: string; pct: number; level: string }[]>([]);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    await new Promise(r => setTimeout(r, 700));
    const res = scoreText(inputText.trim(), source);
    setResult(res);
    setIsAnalyzing(false);
    const lvl = riskLevel(res.risk);
    setEvalHistory(prev => [
      { text: inputText.trim().substring(0, 55) + (inputText.length > 55 ? '…' : ''), pct: Math.round(res.risk * 100), level: lvl },
      ...prev
    ].slice(0, 8));
  };

  const loadSample = (i: number) => {
    setInputText(SAMPLES[i].text);
    setSource(SAMPLES[i].source);
    setResult(null);
  };

  // ---- derived chart data ----
  const radarData = result ? [
    { subject: 'Linguistic', value: Math.round(result.linguistic * 100) },
    { subject: 'Source Risk', value: Math.round(result.source * 100) },
    { subject: 'Pattern', value: Math.round(result.pattern * 100) },
    { subject: 'Context', value: Math.round(result.context * 100) },
    { subject: 'Overall', value: Math.round(result.risk * 100) },
  ] : [];

  const barData = result ? [
    { name: 'Linguistic', value: Math.round(result.linguistic * 100), fill: barColor(result.linguistic) },
    { name: 'Source', value: Math.round(result.source * 100), fill: barColor(result.source) },
    { name: 'Pattern', value: Math.round(result.pattern * 100), fill: barColor(result.pattern) },
    { name: 'Context', value: Math.round(result.context * 100), fill: barColor(result.context) },
    { name: 'Overall', value: Math.round(result.risk * 100), fill: barColor(result.risk) },
  ] : [];

  const credScore = result ? Math.round(result.risk * 100) : 0;
  const fakeScore = credScore;
  const realScore = 100 - credScore;
  const pieData = result ? [
    { name: 'Real / Credible', value: realScore },
    { name: 'Fake / Misleading', value: fakeScore },
  ] : [];

  const lvl = result ? riskLevel(result.risk) : 'low';
  const riskColor = result ? barColor(result.risk) : '#5a9e2f';

  const historyDistData = evalHistory.length > 0 ? [
    { name: 'Low Risk', value: evalHistory.filter(h => h.level === 'low').length, fill: '#5a9e2f' },
    { name: 'Medium Risk', value: evalHistory.filter(h => h.level === 'medium').length, fill: '#d4850a' },
    { name: 'High Risk', value: evalHistory.filter(h => h.level === 'high').length, fill: '#e04040' },
  ].filter(d => d.value > 0) : [];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>📊</div>
          <div>
            <h1 className={styles.title}>Evaluation Dashboard</h1>
            <p className={styles.subtitle}>Visual analysis of misinformation risk scores</p>
          </div>
        </div>
        <div className={styles.headerBadge}>
          <span className={styles.badgeDot} />
          Live Analysis
        </div>
      </div>

      {/* Sample buttons */}
      <div className={styles.samplesRow}>
        <span className={styles.samplesLabel}>TRY A SAMPLE</span>
        <div className={styles.sampleBtns}>
          {SAMPLES.map((s, i) => (
            <button key={i} className={styles.sampleBtn} onClick={() => loadSample(i)}>{s.label}</button>
          ))}
        </div>
      </div>

      {/* Input card */}
      <div className={styles.inputCard}>
        <textarea
          className={styles.textarea}
          placeholder="Paste a headline, tweet, or paragraph to evaluate…"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
        />
        <div className={styles.controlsRow}>
          <select className={styles.select} value={source} onChange={e => setSource(e.target.value)}>
            {Object.keys(SOURCE_SCORES).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className={styles.actionBtns}>
            <button className="btn btn-secondary" onClick={() => { setInputText(''); setResult(null); }}>Clear</button>
            <button className="btn btn-primary" onClick={handleAnalyze} disabled={isAnalyzing || !inputText.trim()}>
              {isAnalyzing ? (
                <span className={styles.spinnerWrap}><span className={styles.spinner} /> Evaluating…</span>
              ) : 'Evaluate →'}
            </button>
          </div>
        </div>
      </div>

      {/* ═══ RESULTS ═══ */}
      {result && (
        <div className={styles.resultsGrid}>

          {/* ── Gauge Card ── */}
          <div className={`${styles.card} ${styles.gaugeCard}`}>
            <div className={styles.cardLabel}>OVERALL RISK SCORE</div>
            <AnimatedGauge value={Math.round(result.risk * 100)} color={riskColor} />
            <div className={styles.gaugeVerdict} style={{ color: riskColor }}>
              {lvl === 'low' ? '✅ Likely Credible' : lvl === 'medium' ? '⚠️ Potentially Misleading' : '🚨 High Risk'}
            </div>
            <div className={styles.gaugeSub}>
              {lvl === 'low' ? 'No major red flags detected' : lvl === 'medium' ? 'Cross-verify with trusted sources' : 'Do not share without verification'}
            </div>
          </div>

          {/* ── Real vs Fake Pie ── */}
          <div className={`${styles.card} ${styles.pieCard}`}>
            <div className={styles.cardLabel}>CONTENT CREDIBILITY</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  <Cell fill="#5a9e2f" stroke="none" />
                  <Cell fill="#e04040" stroke="none" />
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#141418', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 13 }}
                  itemStyle={{ color: '#f0ede6' }}
                />
                <Legend
                  iconType="circle"
                  formatter={(value) => <span style={{ color: '#a0a0a8', fontSize: '0.8rem' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.pieStats}>
              <div className={styles.pieStat}>
                <span className={styles.pieStatDot} style={{ background: '#5a9e2f' }} />
                <span className={styles.pieStatLabel}>Real</span>
                <span className={styles.pieStatPct} style={{ color: '#5a9e2f' }}>{realScore}%</span>
              </div>
              <div className={styles.pieStat}>
                <span className={styles.pieStatDot} style={{ background: '#e04040' }} />
                <span className={styles.pieStatLabel}>Fake</span>
                <span className={styles.pieStatPct} style={{ color: '#e04040' }}>{fakeScore}%</span>
              </div>
            </div>
          </div>

          {/* ── Metric Cards Row ── */}
          <div className={`${styles.card} ${styles.metricsCard}`}>
            <div className={styles.cardLabel}>SCORE BREAKDOWN</div>
            <div className={styles.metricsList}>
              {barData.map((item, i) => (
                <div className={styles.metricRow} key={i}>
                  <span className={styles.metricName}>{item.name}</span>
                  <div className={styles.metricTrack}>
                    <div
                      className={styles.metricFill}
                      style={{ width: `${item.value}%`, backgroundColor: item.fill, boxShadow: `0 0 8px ${item.fill}55` }}
                    />
                  </div>
                  <span className={styles.metricPct} style={{ color: item.fill }}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Bar Chart ── */}
          <div className={`${styles.card} ${styles.barCard}`}>
            <div className={styles.cardLabel}>RISK METRICS — BAR CHART</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#6b6b75', fontSize: 12, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#6b6b75', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ── Radar Chart ── */}
          <div className={`${styles.card} ${styles.radarCard}`}>
            <div className={styles.cardLabel}>RISK RADAR</div>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={85} style={{ background: DARK_BG }}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#a0a0a8', fontSize: 11, fontFamily: 'DM Mono' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#6b6b75', fontSize: 10 }} axisLine={false} />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke={riskColor}
                  fill={riskColor}
                  fillOpacity={0.18}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{ background: '#141418', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 13 }}
                  itemStyle={{ color: riskColor }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* ── Signals Card ── */}
          <div className={`${styles.card} ${styles.signalsCard}`}>
            <div className={styles.cardLabel}>DETECTED SIGNALS</div>
            <div className={styles.signalsList}>
              {result.flags.length > 0 ? result.flags.map(([color, text], i) => (
                <div className={styles.signalItem} key={i}>
                  <span className={styles.signalDot} style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                  <span className={styles.signalText}>{text}</span>
                </div>
              )) : (
                <div className={styles.signalItem}>
                  <span className={styles.signalDot} style={{ background: '#5a9e2f' }} />
                  <span className={styles.signalText}>No major warning signals detected</span>
                </div>
              )}
            </div>
            {result.entities.length > 0 && (
              <div className={styles.entities}>
                <div className={styles.entitiesLabel}>EXTRACTED ELEMENTS</div>
                <div className={styles.pillRow}>
                  {result.entities.map(([label, type], i) => (
                    <span key={i} className={`pill pill-${type}`}>{label}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ═══ Session History + Distribution (if 2+ entries) ═══ */}
      {evalHistory.length > 0 && (
        <div className={styles.historySection}>
          <div className={styles.historySplit}>

            <div className={styles.historyList}>
              <div className={styles.sectionLabel}>SESSION HISTORY</div>
              {evalHistory.map((h, i) => (
                <div className={styles.histItem} key={i}>
                  <div className={styles.histRank}>#{i + 1}</div>
                  <span className={styles.histText}>{h.text}</span>
                  <span className={styles.histBadge} style={{
                    color: h.level === 'low' ? '#82d44b' : h.level === 'medium' ? '#f0a030' : '#f06060',
                    background: h.level === 'low' ? 'rgba(90,158,47,0.12)' : h.level === 'medium' ? 'rgba(212,133,10,0.12)' : 'rgba(224,64,64,0.12)'
                  }}>
                    {h.pct}% · {h.level.charAt(0).toUpperCase() + h.level.slice(1)}
                  </span>
                </div>
              ))}
            </div>

            {historyDistData.length >= 1 && (
              <div className={`${styles.card} ${styles.distCard}`}>
                <div className={styles.cardLabel}>SESSION DISTRIBUTION</div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={historyDistData} cx="50%" cy="50%" outerRadius={75} dataKey="value" paddingAngle={3}>
                      {historyDistData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#141418', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 13 }}
                      itemStyle={{ color: '#f0ede6' }}
                    />
                    <Legend
                      iconType="circle"
                      formatter={(value) => <span style={{ color: '#a0a0a8', fontSize: '0.78rem' }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className={styles.distStats}>
                  {historyDistData.map((d, i) => (
                    <div className={styles.distRow} key={i}>
                      <span className={styles.distDot} style={{ background: d.fill }} />
                      <span className={styles.distName}>{d.name}</span>
                      <span className={styles.distVal} style={{ color: d.fill }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📈</div>
          <p className={styles.emptyTitle}>No evaluation yet</p>
          <p className={styles.emptySub}>Enter text above and click <strong>Evaluate →</strong> to see live graphs</p>
        </div>
      )}
    </div>
  );
}
