import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { DetectorApp } from './components/DetectorApp';
import { EvaluationPage } from './components/EvaluationPage';
import { Login } from './components/Login';
import ThemeToggle from './components/ThemeToggle';

type AppState = 'landing' | 'login' | 'app';
type AppTab = 'detector' | 'evaluation';

const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: '0.5rem 1.2rem',
  borderRadius: '10px',
  border: active ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
  background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
  color: active ? '#6366f1' : 'var(--text-secondary)',
  fontSize: '0.88rem',
  fontWeight: active ? 600 : 400,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontFamily: 'inherit',
});

function App() {
  const [view, setView] = useState<AppState>('landing');
  const [tab, setTab] = useState<AppTab>('detector');

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.dataset.theme = saved;
  }, []);

  return (
    <>
      {/* Header */}
      <header className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid var(--border-color)' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--accent-primary)' }}>Truth Lenx</h1>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="container" style={{ paddingTop: '2rem' }}>
        {view === 'landing' && (
          <section className="animate-fade-in">
            <LandingPage onStart={() => setView('login')} />
          </section>
        )}

        {view === 'login' && (
          <section className="animate-fade-in">
            <Login onLogin={() => setView('app')} />
          </section>
        )}

        {view === 'app' && (
          <section className="animate-fade-in">
            {/* App nav bar */}
            <nav style={{
              padding: '1rem 2rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <button
                className="btn btn-secondary"
                onClick={() => setView('landing')}
                style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem', marginRight: '1.5rem' }}
              >
                ← Home
              </button>

              {/* Tabs */}
              <button style={tabStyle(tab === 'detector')} onClick={() => setTab('detector')}>
                🔍 Analysis Tool
              </button>
              <button style={tabStyle(tab === 'evaluation')} onClick={() => setTab('evaluation')}>
                📊 Evaluation
              </button>

              <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
                Logged in
              </span>
            </nav>

            {tab === 'detector' && <DetectorApp />}
            {tab === 'evaluation' && <EvaluationPage />}
          </section>
        )}
      </main>
    </>
  );
}

export default App;
