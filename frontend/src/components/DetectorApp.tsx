import { useState } from 'react';
import styles from './DetectorApp.module.css';
import { scoreText, type ScoringResult, riskLevel, riskLabel, barColor, SOURCE_SCORES } from '../lib/scoring';

const SAMPLES = [
  { label: "🚨 False health claim", text: "Scientists confirm drinking bleach cures COVID-19 within 24 hours, major study suppressed by government!!", source: "Social media post" },
  { label: "✅ True science fact", text: "The Earth orbits the Sun once every 365.25 days, which is why we add a leap day every four years.", source: "News article" },
  { label: "🗳️ Election misinfo", text: "BREAKING: Voting machines in 3 states were secretly connected to the internet and flipped millions of votes.", source: "Social media post" },
  { label: "📊 Misleading stat", text: "Studies show 9 out of 10 doctors recommend our supplement — cures diabetes in 2 weeks, guaranteed!", source: "Blog / unknown site" }
];

interface HistoryItem {
  text: string;
  pct: number;
  level: "high" | "medium" | "low";
  timestamp: string;
}

export function DetectorApp() {
  const [inputText, setInputText] = useState("");
  const [source, setSource] = useState("Social media post");
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    
    setIsAnalyzing(true);
    // Simulate slight delay for effect
    await new Promise(r => setTimeout(r, 600));
    
    const res = scoreText(inputText.trim(), source);
    setResult(res);
    setIsAnalyzing(false);

    const level = riskLevel(res.risk);
    const newHistory: HistoryItem = {
      text: inputText.trim().substring(0, 70) + (inputText.length > 70 ? "…" : ""),
      pct: Math.round(res.risk * 100),
      level: level,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setHistory(prev => [newHistory, ...prev].slice(0, 5));
  };

  const handleClear = () => {
    setInputText("");
    setResult(null);
  };

  const loadSample = (index: number) => {
    setInputText(SAMPLES[index].text);
    setSource(SAMPLES[index].source);
    setResult(null);
  };

  const renderVerdict = () => {
    if (!result) return null;
    
    const pct = Math.round(result.risk * 100);
    const lvl = riskLevel(result.risk);
    const lbl = riskLabel(result.risk);

    const verdicts = {
      low: { title: "✅ Likely Credible", desc: "No major misinformation signals detected. The text uses measured language and appropriate sourcing. Always verify important claims independently." },
      medium: { title: "⚠️ Potentially Misleading", desc: "Several signals suggest this content may be biased, misleading, or lack proper attribution. Cross-check with trusted sources before sharing." },
      high: { title: "🚨 High Misinformation Risk", desc: "Multiple strong indicators of false or misleading content detected. This matches known misinformation patterns. Do not share without thorough verification." }
    };

    const vInfo = verdicts[lvl];
    const warnFlags = result.flags.filter(f => f[0] !== "#5a9e2f");

    return (
      <div className={styles.resultsArea}>
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>Overall Risk</div>
            <div className={styles.metricValue} style={{ color: barColor(result.risk) }}>{pct}%</div>
            <div className={styles.metricSub}>{lbl}</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>Linguistic</div>
            <div className={styles.metricValue}>{Math.round(result.linguistic * 100)}%</div>
            <div className={styles.metricSub}>Language patterns</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>Source Risk</div>
            <div className={styles.metricValue}>{Math.round(result.source * 100)}%</div>
            <div className={styles.metricSub}>{source}</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>Warning Flags</div>
            <div className={styles.metricValue}>{warnFlags.length}</div>
            <div className={styles.metricSub}>signals detected</div>
          </div>
        </div>

        <div className={`${styles.verdictBanner} ${styles[`verdict-${lvl}`]}`}>
          <h3 className={styles.verdictTitle}>{vInfo.title}</h3>
          <p className={styles.verdictDesc}>{vInfo.desc}</p>
        </div>

        <div className={styles.detailsGrid}>
          <div className={styles.detailCard}>
            <h4>Score Breakdown</h4>
            {[
              { name: "Linguistic patterns", val: result.linguistic },
              { name: "Source credibility risk", val: result.source },
              { name: "Claim pattern match", val: result.pattern },
              { name: "Context risk", val: result.context },
              { name: "Overall risk", val: result.risk }
            ].map((score, i) => (
              <div className={styles.scoreBarWrap} key={i}>
                <span className={styles.scoreLabel}>{score.name}</span>
                <div className={styles.scoreTrack}>
                  <div 
                    className={styles.scoreFill} 
                    style={{ width: `${Math.round(score.val * 100)}%`, backgroundColor: barColor(score.val) }}
                  />
                </div>
                <span className={styles.scorePct}>{Math.round(score.val * 100)}%</span>
              </div>
            ))}
          </div>

          <div className={styles.detailCard}>
            <h4>Detected Signals</h4>
            {result.flags.length > 0 ? (
              result.flags.map(([color, text], i) => (
                <div className={styles.flagItem} key={i}>
                  <span className={styles.flagDot} style={{ backgroundColor: color }} />
                  {text}
                </div>
              ))
            ) : (
              <div className={styles.flagItem}>
                <span className={styles.flagDot} style={{ backgroundColor: "#5a9e2f" }} />
                No major warning signals detected
              </div>
            )}

            {result.entities.length > 0 && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                <h4 style={{ marginBottom: '1rem' }}>Extracted Elements</h4>
                <div className={styles.pillRow}>
                  {result.entities.map(([label, type], i) => (
                    <span key={i} className={`pill pill-${type}`}>{label}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.header} animate-slide-up delay-100`}>
        <div className={styles.headerIcon}>🔍</div>
        <div className={styles.headerText}>
          <h1>Truth Lenx</h1>
          <p>Real-time analysis of claims and headlines</p>
        </div>
      </div>

      <div className={`${styles.samples} animate-slide-up delay-200`}>
        <div className={styles.samplesLabel}>Try a sample</div>
        <div className={styles.sampleButtons}>
          {SAMPLES.map((s, i) => (
            <button key={i} className={styles.sampleBtn} onClick={() => loadSample(i)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`${styles.inputSection} animate-slide-up delay-300`}>
        <textarea
          className={styles.textarea}
          placeholder="Paste a headline, tweet, or paragraph here…&#10;&#10;e.g. 'Scientists confirm drinking bleach cures COVID-19 within 24 hours'"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        
        <div className={styles.controlsRow}>
          <select 
            className={styles.sourceSelect} 
            value={source} 
            onChange={(e) => setSource(e.target.value)}
          >
            {Object.keys(SOURCE_SCORES).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          
          <div className={styles.actionBtns}>
            <button className="btn btn-secondary" onClick={handleClear}>Clear</button>
            <button 
              className="btn btn-primary" 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze →'}
            </button>
          </div>
        </div>
      </div>

      {renderVerdict()}

      {history.length > 0 && (
        <div className={`${styles.historySection} animate-slide-up delay-400`}>
          <div className={styles.historyTitle}>RECENT ANALYSES</div>
          {history.map((h, i) => (
            <div className={styles.historyItem} key={i}>
              <span className={`${styles.historyBadge} ${styles[`hist-${h.level}`]}`}>
                {h.level.charAt(0).toUpperCase() + h.level.slice(1)} · {h.pct}%
              </span>
              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {h.text}
              </span>
              <span style={{ fontFamily: 'DM Mono', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {h.timestamp}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
