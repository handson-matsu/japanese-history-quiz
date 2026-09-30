/* UIと保存処理に依存しない出題ロジック */
window.QuizCore = (() => {
  const PLAY_SIZE = 10;
  const ERAS = ['旧石器・縄文・弥生・古墳時代', '縄文時代', '弥生時代', '古墳時代', '飛鳥時代', '奈良時代', '平安時代', '鎌倉時代', '室町時代', '安土桃山時代', '江戸時代', '幕末', '明治時代', '大正時代', '昭和時代', '平成時代', '令和時代'];
  function validate(questions) {
    if (!Array.isArray(questions) || !questions.length) throw new Error('問題が登録されていません。');
    const ids = new Set();
    questions.forEach(q => {
      if (!q || typeof q.id !== 'string' || !q.id.trim() || ids.has(q.id) || !ERAS.includes(q.era) ||
          typeof q.question !== 'string' || !q.question.trim() || typeof q.explanation !== 'string' || !q.explanation.trim() ||
          !Array.isArray(q.choices) || q.choices.length !== 4 || q.choices.some(c => typeof c !== 'string' || !c.trim()) ||
          new Set(q.choices).size !== 4 || !Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) {
        throw new Error(`問題データを確認してください: ${q?.id || 'idなし'}`);
      }
      ids.add(q.id);
    });
  }
  // 未クリアは重み2、クリア済みは重み1。復習の機会も残す重み付き抽出。
  // IDが異なっても問題文が同じものは、1プレイに1問までにする。
  function select(questions, era = 'all', random = Math.random, cleared = new Set()) {
    let pool = questions.filter(q => era === 'all' || q.era === era);
    const selected = [];
    while (pool.length && selected.length < PLAY_SIZE) {
      const weight = q => cleared.has(q.id) ? 1 : 2;
      const total = pool.reduce((sum, q) => sum + weight(q), 0);
      let cursor = random() * total;
      const chosen = pool.find(q => (cursor -= weight(q)) < 0) || pool[pool.length - 1];
      selected.push(chosen);
      pool = pool.filter(q => q.id !== chosen.id && q.question !== chosen.question);
    }
    return selected;
  }
  return { PLAY_SIZE, ERAS, validate, select };
})();
