import { useState, useEffect, useRef } from 'react';
import styles from './LandingPage.module.css';

interface LandingPageProps {
  onStart: () => void;
}

/* ── Animated counter hook ── */
function useCounter(target: number, duration = 1800, start = false) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    if (!start) return;
    const began = Date.now();
    const tick = () => {
      const p = Math.min(1, (Date.now() - began) / duration);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * ease));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, start]);
  return val;
}

const STATS = [
  { value: 94, suffix: '%', label: 'Detection Accuracy' },
  { value: 12, suffix: '+', label: 'Risk Signals Analysed' },
  { value: 5,  suffix: ' types', label: 'Source Categories' },
  { value: 100, suffix: '%', label: 'Private & Local' },
];

const FEATURES = [
  {
    icon: '⚡',
    title: 'Instant Analysis',
    desc: 'Get a comprehensive credibility score the moment you paste text. No waiting, no servers — real-time feedback powered by advanced pattern matching.',
    tag: 'Real-time',
  },
  {
    icon: '🎯',
    title: 'Deep Linguistic Engine',
    desc: 'Detects sensationalism, emotional manipulation, clickbait structures, unverified statistics, and debunked conspiracy narrative patterns.',
    tag: 'NLP-powered',
  },
  {
    icon: '📊',
    title: 'Visual Evaluation',
    desc: 'Go beyond a single score. Our Evaluation Dashboard renders Gauge, Radar, Bar, and Pie charts so you can see every dimension of risk visually.',
    tag: 'Interactive',
  },
  {
    icon: '🔒',
    title: '100% Private',
    desc: 'Everything runs locally in your browser using client-side JavaScript. Zero data ever leaves your device — no tracking, no telemetry.',
    tag: 'Zero-server',
  },
  {
    icon: '🗂️',
    title: 'Source Intelligence',
    desc: 'Adjusts risk scores based on the source type — social media, news articles, blogs, official statements, and satire sites are all weighted differently.',
    tag: '5 source types',
  },
  {
    icon: '🧬',
    title: 'Pattern Library',
    desc: 'Built-in library of known false-claim patterns including dangerous health misinformation, election fraud narratives, and debunked conspiracy theories.',
    tag: 'Continuously updated',
  },
];

const STEPS = [
  { num: '01', title: 'Paste your text', desc: 'Copy any headline, tweet, social post, or paragraph into the analysis field.' },
  { num: '02', title: 'Select the source', desc: 'Tell us where the content comes from — news, social media, blog, or official source.' },
  { num: '03', title: 'Run the analysis', desc: 'Hit Analyze. The engine runs 12+ signals across linguistic, pattern, and context dimensions.' },
  { num: '04', title: 'Read the verdict', desc: 'Get an overall risk score, detected signals, extracted entities, and a clear credibility verdict.' },
];

const SIGNALS = [
  { icon: '🔤', label: 'Sensational keywords' },
  { icon: '😡', label: 'Emotional language' },
  { icon: '🔠', label: 'Excessive capitals' },
  { icon: '❗', label: 'Exclamation abuse' },
  { icon: '📈', label: 'Unattributed stats' },
  { icon: '🕵️', label: 'Conspiracy framing' },
  { icon: '💊', label: 'Health misinformation' },
  { icon: '🗳️', label: 'Election narratives' },
  { icon: '🌐', label: 'Source credibility' },
  { icon: '📝', label: 'Hedge phrases' },
  { icon: '🔗', label: 'Attribution check' },
  { icon: '🧩', label: 'Claim pattern match' },
];

export function LandingPage({ onStart }: LandingPageProps) {
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setStatsVisible(true);
    }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div className={styles.page}>

      {/* ═══ HERO ═══ */}
      <section className={styles.hero}>
        {/* Glow orbs */}
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.orb3} />

        <div className={styles.heroInner}>
          <div className={`${styles.badge} animate-slide-up delay-100`}>
            <span className={styles.badgeDot} />
            🔍 Truth Lenx v2.0 — Live Detection Engine
          </div>

          <h1 className={`${styles.heroTitle} animate-slide-up delay-200`}>
            Stop Misinformation<br />
            <span className={styles.gradient}>Before It Spreads</span>
          </h1>

          <p className={`${styles.heroSub} animate-slide-up delay-300`}>
            Paste any claim, headline, or social media post and get an instant credibility score.
            Our advanced linguistic engine analyses <strong>12+ risk signals</strong> including
            sensationalism, false-claim patterns, emotional manipulation, and source credibility —
            all in real time, completely in your browser.
          </p>

          <div className={`${styles.ctaRow} animate-slide-up delay-400`}>
            <button className={`btn btn-primary ${styles.btnHero}`} onClick={onStart}>
              🚀 Launch Truth Lenx
            </button>
            <a href="#how-it-works" className={`btn btn-secondary ${styles.btnHero}`}>
              How it works ↓
            </a>
          </div>

          {/* Trust bar */}
          <div className={`${styles.trustBar} animate-slide-up delay-500`}>
            <span className={styles.trustItem}><span className={styles.trustCheck}>✓</span> No sign-up required</span>
            <span className={styles.trustDivider} />
            <span className={styles.trustItem}><span className={styles.trustCheck}>✓</span> Zero data sent to servers</span>
            <span className={styles.trustDivider} />
            <span className={styles.trustItem}><span className={styles.trustCheck}>✓</span> Open-source scoring engine</span>
          </div>
        </div>
      </section>

      {/* ═══ ANIMATED STATS ═══ */}
      <section className={styles.statsSection} ref={statsRef}>
        <div className={styles.statsGrid}>
          {STATS.map((s, i) => (
            <StatCard key={i} {...s} animate={statsVisible} delay={i * 120} />
          ))}
        </div>
      </section>

      {/* ═══ SIGNAL PILLS ═══ */}
      <section className={styles.signalsSection}>
        <p className={styles.signalsHeading}>12 Risk Signals Analysed Every Time</p>
        <div className={styles.signalPills}>
          {SIGNALS.map((s, i) => (
            <div className={styles.signalPill} key={i} style={{ animationDelay: `${i * 60}ms` }}>
              <span>{s.icon}</span> {s.label}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>CAPABILITIES</span>
          <h2 className={styles.sectionTitle}>Everything You Need to<br /><span className={styles.gradient}>Fight Fake News</span></h2>
          <p className={styles.sectionSub}>A professional-grade misinformation detector that fits in a browser tab.</p>
        </div>

        <div className={styles.featuresGrid}>
          {FEATURES.map((f, i) => (
            <div className={styles.featureCard} key={i} style={{ animationDelay: `${i * 100}ms` }}>
              <div className={styles.featureTop}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <span className={styles.featureTag}>{f.tag}</span>
              </div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>WORKFLOW</span>
          <h2 className={styles.sectionTitle}>Analyse in <span className={styles.gradient}>4 Simple Steps</span></h2>
          <p className={styles.sectionSub}>From paste to verdict in under a second.</p>
        </div>

        <div className={styles.stepsGrid}>
          {STEPS.map((step, i) => (
            <div className={styles.stepCard} key={i}>
              <div className={styles.stepNum}>{step.num}</div>
              {i < STEPS.length - 1 && <div className={styles.stepConnector} />}
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ RISK LEVELS EXPLAINER ═══ */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>SCORING</span>
          <h2 className={styles.sectionTitle}>Understanding the <span className={styles.gradient}>Risk Score</span></h2>
          <p className={styles.sectionSub}>Every piece of content is evaluated and assigned a risk level from 0–100%.</p>
        </div>

        <div className={styles.riskLevels}>
          <div className={`${styles.riskCard} ${styles.riskLow}`}>
            <div className={styles.riskIcon}>✅</div>
            <div className={styles.riskRange}>0 – 35%</div>
            <div className={styles.riskLabel}>Low Risk</div>
            <p className={styles.riskDesc}>No major red flags. Measured language, appropriate sourcing, no known false-claim patterns. Always independently verify before sharing.</p>
          </div>
          <div className={`${styles.riskCard} ${styles.riskMed}`}>
            <div className={styles.riskIcon}>⚠️</div>
            <div className={styles.riskRange}>35 – 65%</div>
            <div className={styles.riskLabel}>Medium Risk</div>
            <p className={styles.riskDesc}>Several warning signals present — possible bias, emotional framing, or missing attribution. Cross-check with trusted sources before sharing.</p>
          </div>
          <div className={`${styles.riskCard} ${styles.riskHigh}`}>
            <div className={styles.riskIcon}>🚨</div>
            <div className={styles.riskRange}>65 – 100%</div>
            <div className={styles.riskLabel}>High Risk</div>
            <p className={styles.riskDesc}>Multiple strong indicators of false or misleading content detected. Matches known misinformation patterns. Do not share without thorough verification.</p>
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaGlow} />
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Ready to Cut Through the Noise?</h2>
          <p className={styles.ctaSub}>Join thousands of fact-conscious readers using Truth Lenx to verify claims before they spread.</p>
          <button className={`btn btn-primary ${styles.btnHero}`} onClick={onStart}>
            Get Started Free →
          </button>
          <p className={styles.ctaNote}>No account needed · Completely private · Works offline</p>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <span className={styles.footerLogo}>🔍 Truth Lenx</span>
          <span className={styles.footerTagline}>Real-time misinformation detection</span>
        </div>
        <div className={styles.footerLinks}>
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <button className={styles.footerBtn} onClick={onStart}>Launch App</button>
        </div>
        <p className={styles.footerNote}>© 2026 Truth Lenx · Client-side analysis · No data collected</p>
      </footer>

    </div>
  );
}

/* ── Stat card with animated counter ── */
function StatCard({ value, suffix, label, animate, delay }: { value: number; suffix: string; label: string; animate: boolean; delay: number }) {
  const count = useCounter(value, 1600, animate);
  return (
    <div className={styles.statCard} style={{ transitionDelay: `${delay}ms` }}>
      <div className={styles.statValue}>
        {animate ? count : 0}{suffix}
      </div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}
