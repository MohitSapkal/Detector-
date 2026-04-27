import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { DetectorApp } from './components/DetectorApp';
import { Login } from './components/Login';

type AppState = 'landing' | 'login' | 'app';

function App() {
  const [view, setView] = useState<AppState>('landing');

  return (
    <>
      {view === 'landing' && <LandingPage onStart={() => setView('login')} />}
      
      {view === 'login' && <Login onLogin={() => setView('app')} />}

      {view === 'app' && (
        <div className="animate-fade-in">
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
        </div>
      )}
    </>
  );
}

export default App;
