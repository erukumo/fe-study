import { useState, useEffect } from 'react';

const KEY = 'fe-study-progress';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? {}; } catch { return {}; }
}

export function useProgress() {
  const [progress, setProgress] = useState(load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(progress));
  }, [progress]);

  function recordAnswer(questionId, correct) {
    setProgress((prev) => {
      const existing = prev[questionId] ?? { correct: 0, wrong: 0 };
      return {
        ...prev,
        [questionId]: {
          correct: existing.correct + (correct ? 1 : 0),
          wrong: existing.wrong + (correct ? 0 : 1),
          lastAnswered: new Date().toISOString(),
        },
      };
    });
  }

  function resetProgress() {
    setProgress({});
  }

  return { progress, recordAnswer, resetProgress };
}
