/* 公開済みのidで記録するので、問題の並べ替え・追加に影響されません。 */
window.QuizStorage = (() => {
  const KEY = 'history-travel.progress.quality-v3.v1';
  let memory = new Set();
  let available = true;
  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      // 壊れた保存形式は空の記録として扱い、遊び始められるようにする。
      let data;
      try { data = raw ? JSON.parse(raw) : null; } catch { data = null; }
      memory = new Set(data?.version === 1 && Array.isArray(data.clearedIds)
        ? data.clearedIds.filter(id => typeof id === 'string') : []);
    } catch { available = false; }
    return new Set(memory);
  }
  function mark(id) {
    memory.add(id);
    try { localStorage.setItem(KEY, JSON.stringify({ version: 1, clearedIds: [...memory] })); available = true; }
    catch { available = false; }
  }
  return { read, mark, isAvailable: () => available };
})();
