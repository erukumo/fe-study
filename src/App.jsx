import { useState, useEffect } from 'react';
import FlashCard from './components/FlashCard';
import Quiz from './components/Quiz';
import StatsView from './components/StatsView';
import { useProgress } from './hooks/useProgress';
import './App.css';

const NAV_ICONS = {
  flash: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="3"/>
      <line x1="8" y1="4" x2="8" y2="20"/>
      <line x1="12" y1="9" x2="17" y2="9"/>
      <line x1="12" y1="13" x2="17" y2="13"/>
    </svg>
  ),
  quiz: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/>
      <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/>
    </svg>
  ),
  stats: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
      <line x1="2"  y1="20" x2="22" y2="20"/>
    </svg>
  ),
};

const TABS = [
  { id: 'flash', label: '用語' },
  { id: 'quiz',  label: '演習' },
  { id: 'stats', label: '成績' },
];

function loadDark() {
  try { return JSON.parse(localStorage.getItem('fe-dark')) ?? false; } catch { return false; }
}

export default function App() {
  const [tab, setTab] = useState('flash');
  const { progress, recordAnswer, resetProgress } = useProgress();
  const [darkMode, setDarkMode] = useState(loadDark);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  function toggleDark() {
    setDarkMode((v) => {
      const next = !v;
      localStorage.setItem('fe-dark', JSON.stringify(next));
      return next;
    });
  }

  const totalAnswered = Object.keys(progress).length;
  const totalCorrect = Object.values(progress).filter((p) => p.correct > p.wrong).length;
  const rate = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : null;

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">FE対策</h1>
        <div className="header-right">
          {rate !== null && (
            <div className="header-rate">
              <span className="header-rate-label">正答率</span>
              <span className="header-rate-value">{rate}%</span>
            </div>
          )}
          <button className="dark-toggle" onClick={toggleDark} aria-label="ダークモード切り替え">
            {darkMode ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"/>
                <line x1="12" y1="2"  x2="12" y2="5"/>
                <line x1="12" y1="19" x2="12" y2="22"/>
                <line x1="4.22" y1="4.22"   x2="6.34" y2="6.34"/>
                <line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
                <line x1="2"  y1="12" x2="5"  y2="12"/>
                <line x1="19" y1="12" x2="22" y2="12"/>
                <line x1="4.22" y1="19.78"  x2="6.34" y2="17.66"/>
                <line x1="17.66" y1="6.34"  x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>
      </header>

      <main className="app-main">
        {tab === 'flash' && <FlashCard />}
        {tab === 'quiz'  && <Quiz progress={progress} recordAnswer={recordAnswer} />}
        {tab === 'stats' && <StatsView progress={progress} resetProgress={resetProgress} />}
      </main>

      <nav className="bottom-nav">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`nav-item ${tab === t.id ? 'active' : ''}`}
          >
            <span className="nav-icon">{NAV_ICONS[t.id]}</span>
            <span className="nav-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
