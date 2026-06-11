import { useState, useRef, useEffect } from 'react';
import terms from '../data/terms.json';

const CATEGORIES = ['すべて', ...new Set(terms.map((t) => t.category))];

const FREQ_CONFIG = {
  '超頻出': { label: '超頻出', className: 'freq-super' },
  '頻出':   { label: '頻出',   className: 'freq-normal' },
  '標準':   { label: '標準',   className: 'freq-standard' },
};

const STORAGE_KEY = 'fe-flashcard-pos';

function loadPos() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}; } catch { return {}; }
}

export default function FlashCard() {
  const saved = loadPos();
  const [selectedCategory, setSelectedCategory] = useState(saved.category ?? 'すべて');
  const [index, setIndex] = useState(saved.index ?? 0);
  const [flipped, setFlipped] = useState(false);
  const [input, setInput] = useState('');
  const [jumpInput, setJumpInput] = useState(String((saved.index ?? 0) + 1));
  const touchStartX = useRef(null);

  useEffect(() => {
    setJumpInput(String(index + 1));
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ category: selectedCategory, index }));
  }, [index, selectedCategory]);

  const filtered = selectedCategory === 'すべて'
    ? terms
    : terms.filter((t) => t.category === selectedCategory);

  const safeIndex = Math.min(index, filtered.length - 1);
  const card = filtered[safeIndex];

  function next() {
    setFlipped(false);
    setInput('');
    setTimeout(() => setIndex((i) => (Math.min(i, filtered.length - 1) + 1) % filtered.length), 150);
  }

  function prev() {
    setFlipped(false);
    setInput('');
    setTimeout(() => setIndex((i) => (Math.min(i, filtered.length - 1) - 1 + filtered.length) % filtered.length), 150);
  }

  function jumpTo(val) {
    const n = parseInt(val, 10);
    if (isNaN(n)) { setJumpInput(String(index + 1)); return; }
    const clamped = Math.max(1, Math.min(n, filtered.length)) - 1;
    setFlipped(false);
    setInput('');
    setIndex(clamped);
  }

  function handleCategoryChange(cat) {
    setSelectedCategory(cat);
    setIndex(0);
    setFlipped(false);
    setInput('');
  }

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 50) return;
    if (delta < 0) next();
    else prev();
  }

  if (!card) return null;

  const freq = FREQ_CONFIG[card.freq];

  return (
    <div className="flash-container">
      <div className="category-scroll">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="card-count-row">
        <input
          className="card-count-jump"
          type="number"
          min={1}
          max={filtered.length}
          value={jumpInput}
          onChange={(e) => setJumpInput(e.target.value)}
          onBlur={(e) => jumpTo(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && jumpTo(e.target.value)}
        />
        <span className="card-count-sep">/ {filtered.length}</span>
      </div>

      <div
        className={`flash-card ${flipped ? 'flipped' : ''}`}
        onClick={() => setFlipped((f) => !f)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flash-card-inner">
          <div className="flash-front">
            <div className="card-top-row">
              <p className="card-label">用語</p>
              {freq && (
                <span className={`freq-badge ${freq.className}`}>{freq.label}</span>
              )}
            </div>
            <span className="card-category-badge">{card.category}</span>
            <p className="card-term">{card.term}</p>
            <p className="card-hint">タップして確認</p>
          </div>
          <div className="flash-back">
            <p className="card-label">意味</p>
            <p className="card-plain">{card.plain}</p>
            <p className="card-detail">{card.detail}</p>
            {card.mnemonic && (
              <div className="card-mnemonic">
                <span className="card-mnemonic-icon">💡</span>
                <p className="card-mnemonic-text">{card.mnemonic}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card-nav">
        <button className="nav-arrow" onClick={(e) => { e.stopPropagation(); prev(); }}>‹</button>
        <button className="nav-arrow" onClick={(e) => { e.stopPropagation(); next(); }}>›</button>
      </div>

      <div className="card-write">
        <textarea
          className="card-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="意味を書いてからカードをめくって確認しよう"
          rows={3}
        />
      </div>
    </div>
  );
}
