import questions from '../data/questions.json';

const CATEGORIES = [...new Set(questions.map((q) => q.category))];

export default function StatsView({ progress, resetProgress }) {
  const total = questions.length;
  const answered = questions.filter((q) => progress[q.id]).length;
  const correct = questions.filter((q) => {
    const p = progress[q.id];
    return p && p.correct > p.wrong;
  }).length;

  const categoryStats = CATEGORIES.map((cat) => {
    const qs = questions.filter((q) => q.category === cat);
    const answeredInCat = qs.filter((q) => progress[q.id]).length;
    const correctInCat = qs.filter((q) => {
      const p = progress[q.id];
      return p && p.correct > p.wrong;
    }).length;
    return { cat, total: qs.length, answered: answeredInCat, correct: correctInCat };
  });

  const weakQuestions = questions.filter((q) => {
    const p = progress[q.id];
    return p && p.wrong > p.correct;
  });

  return (
    <div className="stats-container">
      <div className="stats-summary-card">
        <div className="stats-row">
          <div className="stat-item">
            <p className="stat-value">{answered}<span className="stat-unit">/{total}</span></p>
            <p className="stat-label">解答済み</p>
          </div>
          <div className="stat-item">
            <p className="stat-value correct-color">{answered > 0 ? Math.round((correct / answered) * 100) : 0}<span className="stat-unit">%</span></p>
            <p className="stat-label">正答率</p>
          </div>
          <div className="stat-item">
            <p className="stat-value wrong-color">{weakQuestions.length}</p>
            <p className="stat-label">苦手問題</p>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <h2 className="stats-section-title">分野別正答率</h2>
        {categoryStats.map(({ cat, total, answered, correct }) => {
          const rate = answered > 0 ? Math.round((correct / answered) * 100) : 0;
          return (
            <div key={cat} className="category-stat-item">
              <div className="category-stat-header">
                <span className="category-stat-name">{cat}</span>
                <span className="category-stat-rate">{answered > 0 ? `${rate}%` : '未回答'}</span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${rate}%`,
                    background: rate >= 80 ? '#34c759' : rate >= 50 ? '#ff9500' : '#ff3b30',
                  }}
                />
              </div>
              <p className="category-stat-sub">{answered}/{total}問 解答</p>
            </div>
          );
        })}
      </div>

      {weakQuestions.length > 0 && (
        <div className="stats-section">
          <h2 className="stats-section-title">苦手問題一覧</h2>
          {weakQuestions.map((q) => {
            const p = progress[q.id];
            return (
              <div key={q.id} className="weak-item">
                <p className="weak-category">{q.category}</p>
                <p className="weak-question">{q.question}</p>
                <p className="weak-record">正解 {p.correct}回 / 不正解 {p.wrong}回</p>
              </div>
            );
          })}
        </div>
      )}

      <button className="btn-reset" onClick={() => {
        if (window.confirm('学習履歴をリセットしますか？')) resetProgress();
      }}>
        履歴をリセット
      </button>
    </div>
  );
}
