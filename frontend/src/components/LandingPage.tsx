
import styles from './LandingPage.module.css';

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className={styles.hero}>
      <div className={`${styles.heroContent} animate-fade-in`}>
        <div className={`${styles.badge} animate-slide-up delay-100`}>
          <span style={{ fontSize: '1.2rem' }}>🔍</span> v2.0 Live
        </div>
        
        <h1 className={`${styles.title} animate-slide-up delay-200`}>
          Detect Misinformation <br />
          <span>At The Speed of Light</span>
        </h1>
        
        <p className={`${styles.subtitle} animate-slide-up delay-300`}>
          Paste any claim, headline, or social media post to analyze its credibility in real time. 
          Our advanced linguistic and pattern-matching engine identifies clickbait, bias, and false claims instantly.
        </p>
        
        <div className={`${styles.ctaGroup} animate-slide-up delay-400`}>
          <button 
            className={`btn btn-primary ${styles.btnLarge}`}
            onClick={onStart}
          >
            Launch Truth Lenx →
          </button>
          <a href="#features" className={`btn btn-secondary ${styles.btnLarge}`}>
            How it works
          </a>
        </div>

        <div id="features" className={styles.featuresGrid}>
          <div className={`${styles.featureCard} animate-slide-up delay-100`}>
            <div className={styles.featureIcon}>⚡</div>
            <h3 className={styles.featureTitle}>Instant Analysis</h3>
            <p className={styles.featureDesc}>
              Powered by advanced pattern matching, get a comprehensive risk score and credibility breakdown the moment you paste text.
            </p>
          </div>
          
          <div className={`${styles.featureCard} animate-slide-up delay-200`}>
            <div className={styles.featureIcon}>🎯</div>
            <h3 className={styles.featureTitle}>Deep Linguistics</h3>
            <p className={styles.featureDesc}>
              Identifies sensationalism, emotional manipulation, unverified statistics, and debunked narrative structures.
            </p>
          </div>
          
          <div className={`${styles.featureCard} animate-slide-up delay-300`}>
            <div className={styles.featureIcon}>🔒</div>
            <h3 className={styles.featureTitle}>100% Private</h3>
            <p className={styles.featureDesc}>
              Everything runs locally in your browser. No data is sent to external servers, ensuring your analysis remains completely private.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
