import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { DetectorApp } from './components/DetectorApp';
import { Login } from './components/Login';
import ThemeToggle from './components/ThemeToggle';

type AppState = 'landing' | 'login' | 'app';

function App() {
  const [view, setView] = useState<AppState>('landing');

  // Apply saved theme on mount
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
            <nav style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setView('landing')}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                ← Back to Home
              </button>
              <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                Logged in
              </span>
            </nav>
            <DetectorApp />
          </section>
        )}
      </main>
    </>
  );
}

export default App;
