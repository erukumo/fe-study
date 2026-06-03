import { useState, useMemo } from 'react';
import questions from '../data/questions.json';

const CATEGORIES = ['すべて', ...new Set(questions.map((q) => q.category))];
const COUNT_OPTIONS = [
  { label: '10問', value: 10 },
  { label: '20問', value: 20 },
  { label: '30問', value: 30 },
  { label: '全問', value: null },
];

export default function Quiz({ progress, recordAnswer }) {
  const [selectedCategory, setSelectedCategory] = useState('すべて');
  const [weakOnly, setWeakOnly] = useState(false);
  const [countLimit, setCountLimit] = useState(10);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showPlain, setShowPlain] = useState(false);
  const [finished, setFinished] = useState(false);
  const [sessionResults, setSessionResults] = useState({});
  const [retryWrong, setRetryWrong] = useState(false);
  const [wrongPool, setWrongPool] = useState([]);

  const basePool = useMemo(() => {
    let base = selectedCategory === 'すべて'
      ? questions
      : questions.filter((q) => q.category === selectedCategory);

    if (weakOnly) {
      base = base.filter((q) => {
        const p = progress[q.id];
        if (!p) return true;
        return p.wrong > p.correct;
      });
    }

    const shuffled = [...base].sort(() => Math.random() - 0.5);
    return countLimit ? shuffled.slice(0, countLimit) : shuffled;
  }, [selectedCategory, weakOnly, countLimit]);

  const pool = retryWrong ? wrongPool : basePool;
  const current = pool[currentIndex];

  function handleSelect(idx) {
    if (selected !== null) return;
    const correct = idx === current.answer;
    setSelected(idx);
    recordAnswer(current.id, correct);
    setSessionResults((prev) => ({ ...prev, [current.id]: correct }));
  }

  function handleNext() {
    if (currentIndex + 1 >= pool.length) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setShowPlain(false);
    }
  }

  function restart() {
    setCurrentIndex(0);
    setSelected(null);
    setShowPlain(false);
    setFinished(false);
    setSessionResults({});
    setRetryWrong(false);
    setWrongPool([]);
  }

  function startRetry() {
    const wrongIds = Object.entries(sessionResults)
      .filter(([, correct]) => !correct)
      .map(([id]) => Number(id));
    const retryQ = questions.filter((q) => wrongIds.includes(q.id));
    setWrongPool([...retryQ].sort(() => Math.random() - 0.5));
    setRetryWrong(true);
    setCurrentIndex(0);
    setSelected(null);
    setShowPlain(false);
    setFinished(false);
    setSessionResults({});
  }

  if (pool.length === 0 && !finished) {
    return (
      <div className="quiz-container">
        <FilterBar
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          setSelectedCategory={(c) => { setSelectedCategory(c); restart(); }}
          weakOnly={weakOnly}
          setWeakOnly={(v) => { setWeakOnly(v); restart(); }}
          countLimit={countLimit}
          setCountLimit={(v) => { setCountLimit(v); restart(); }}
        />
        <p className="empty-text">該当する問題がありません</p>
      </div>
    );
  }

  if (finished) {
    const correctCount = Object.values(sessionResults).filter(Boolean).length;
    const totalCount = Object.keys(sessionResults).length;
    const rate = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    const hasWrong = correctCount < totalCount;

    return (
      <div className="quiz-container">
        <div className="result-card">
          <p className="result-title">セッション完了</p>
          <div className="result-stats">
            <div className="result-stat-item">
              <span className="result-stat-value correct-color">{correctCount}</span>
              <span className="result-stat-label">正解</span>
            </div>
            <div className="result-stat-item">
              <span className="result-stat-value wrong-color">{totalCount - correctCount}</span>
              <span className="result-stat-label">不正解</span>
            </div>
            <div className="result-stat-item">
              <span className="result-stat-value">{rate}%</span>
              <span className="result-stat-label">正答率</span>
            </div>
          </div>
          {hasWrong && (
            <button className="btn-retry" onClick={startRetry}>
              間違えた問題をやり直す ({totalCount - correctCount}問)
            </button>
          )}
          <button className="btn-primary" onClick={restart}>もう一度</button>
        </div>
      </div>
    );
  }

  const isCorrect = selected === current.answer;

  return (
    <div className="quiz-container">
      <FilterBar
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        setSelectedCategory={(c) => { setSelectedCategory(c); restart(); }}
        weakOnly={weakOnly}
        setWeakOnly={(v) => { setWeakOnly(v); restart(); }}
        countLimit={countLimit}
        setCountLimit={(v) => { setCountLimit(v); restart(); }}
      />

      <div className="quiz-progress-bar">
        <div
          className="quiz-progress-fill"
          style={{ width: `${((currentIndex + 1) / pool.length) * 100}%` }}
        />
      </div>
      <p className="quiz-count">{currentIndex + 1} / {pool.length}</p>

      <div className="question-card">
        <span className="question-category">{current.category}</span>

        <button
          className="plain-toggle"
          onClick={() => setShowPlain((v) => !v)}
        >
          {showPlain ? '元の問題文を見る' : '💡 わかりやすく言うと？'}
        </button>

        <p className="question-text">
          {showPlain ? current.plain : current.question}
        </p>
      </div>

      <ul className="choices-list">
        {current.choices.map((choice, idx) => {
          let cls = 'choice-btn';
          if (selected !== null) {
            if (idx === current.answer) cls += ' correct';
            else if (idx === selected) cls += ' wrong';
          }
          return (
            <li key={idx}>
              <button className={cls} onClick={() => handleSelect(idx)}>
                <span className="choice-label">{['ア', 'イ', 'ウ', 'エ'][idx]}</span>
                {choice}
              </button>
            </li>
          );
        })}
      </ul>

      {selected !== null && (
        <div className={`explanation-card ${isCorrect ? 'correct-bg' : 'wrong-bg'}`}>
          <p className="explanation-result">{isCorrect ? '✓ 正解' : '✗ 不正解'}</p>
          <p className="explanation-text">{current.explanation}</p>
          <button className="btn-primary btn-next" onClick={handleNext}>
            {currentIndex + 1 >= pool.length ? '結果を見る' : '次の問題 →'}
          </button>
        </div>
      )}
    </div>
  );
}

function FilterBar({ categories, selectedCategory, setSelectedCategory, weakOnly, setWeakOnly, countLimit, setCountLimit }) {
  return (
    <div className="filter-bar">
      <div className="category-scroll">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="filter-row">
        <button
          className={`weak-toggle ${weakOnly ? 'active' : ''}`}
          onClick={() => setWeakOnly((v) => !v)}
        >
          苦手のみ
        </button>
        <div className="count-selector">
          {COUNT_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              className={`count-btn ${countLimit === opt.value ? 'active' : ''}`}
              onClick={() => setCountLimit(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
