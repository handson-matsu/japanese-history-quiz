(() => {
  const app = document.querySelector('#app');
  const core = window.QuizCore;
  const questions = window.QUESTIONS;
  const storage = window.QuizStorage;
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  let cleared = storage.read();
  let selectedEra = 'all';
  let round = [], index = 0, score = 0, answered = false, newlyCleared = 0;
  const clearedCount = () => questions.filter(q => cleared.has(q.id)).length;
  const notice = () => { document.querySelector('#storage-notice').hidden = storage.isAvailable(); };
  const focusTitle = () => app.querySelector('h1, h2')?.focus({ preventScroll: true });
  const badge = '<span class="eyebrow"><span class="tiny-dot"></span> 時代をこえる、10問の冒険</span>';
  const landscape = `<div class="landscape" role="img" aria-label="太陽と山々を背景にそびえる日本のお城"><div class="sun"></div><span class="cloud cloud-one"></span><span class="cloud cloud-two"></span><div class="mountain mountain-back"></div><div class="mountain mountain-front"></div><span class="floating-label label-one">発見！</span><span class="floating-label label-two">いざ、歴史の旅へ</span><div class="castle"><div class="flag"></div><div class="roof roof-top"></div><div class="tower tower-top"><i></i></div><div class="roof roof-middle"></div><div class="tower tower-middle"><i></i><i></i></div><div class="roof roof-bottom"></div><div class="tower tower-bottom"><i></i><i></i><i></i></div><div class="castle-base"></div></div><div class="land-line"></div><span class="art-caption">NEXT STOP: むかしの日本</span></div>`;
  function home() {
    app.innerHTML = `<section class="home-hero"><div class="hero-copy">${badge}<h1 tabindex="-1">「むかし」って、<br>こんなに<span class="orange-text">おもしろい。</span></h1><p class="lead">土器のひみつも、武士のくらしも。<br>10問のクイズで、日本の歴史を旅しよう！</p><div class="hero-tags"><span>4択でチャレンジ</span><span>1回10問</span><span>何度でも遊べる</span></div></div>${landscape}</section>
      <section class="dashboard"><div class="start-card"><div class="section-heading"><span class="step-icon">01</span><div><p class="eyebrow">LET’S TRAVEL</p><h2>今日の旅をはじめよう</h2></div></div><label for="era">旅する時代をえらぶ</label><select id="era"><option value="all">すべての時代をめぐる</option>${core.ERAS.filter(era => questions.some(q => q.era === era)).map(era => { const count = questions.filter(q => q.era === era).length; return `<option value="${escape(era)}" ${count < core.PLAY_SIZE ? 'disabled' : ''}>${escape(era)}（${count}問${count < core.PLAY_SIZE ? '・10問で解放' : ''}）</option>`; }).join('')}</select><p class="field-note">ランダムに10問出題。同じ旅で問題は重複しません。</p><button class="primary" id="start">冒険に出発！ <span aria-hidden="true">→</span></button><p class="small centered">じっくり考えて大丈夫。時間制限はないよ。</p></div>
      <aside class="collection-card"><div class="section-heading"><span class="collection-icon" aria-hidden="true">✦</span><div><p class="eyebrow">YOUR COLLECTION</p><h2>きみの歴史コレクション</h2></div></div><p class="collection-count"><strong>${clearedCount()}</strong><span> / ${questions.length} 問クリア</span></p><div class="meter" role="progressbar" aria-label="全問題のクリア状況" aria-valuenow="${clearedCount()}" aria-valuemin="0" aria-valuemax="${questions.length}"><span style="width:${clearedCount() / questions.length * 100}%"></span></div><p class="collection-copy">正解するたび、歴史の発見がふえていく。<br>いろいろな時代をコンプリートしよう！</p><div class="save-note"><span aria-hidden="true">▣</span> クリア記録はこのブラウザーに自動保存</div></aside></section>
      <div class="bottom-note"><span>小さな一歩で、歴史がぐっと身近に。</span><span>ただいま ${questions.length} 問を収録 · これから続々追加予定</span></div>`;
    app.querySelector('#era').value = selectedEra;
    app.querySelector('#era').addEventListener('change', e => { selectedEra = e.target.value; });
    app.querySelector('#start').addEventListener('click', start);
    notice();
  }
  function start() {
    round = core.select(questions, selectedEra, Math.random, cleared);
    if (round.length < core.PLAY_SIZE) { selectedEra = 'all'; round = core.select(questions, 'all', Math.random, cleared); }
    index = 0; score = 0; newlyCleared = 0;
    showQuestion();
  }
  function showQuestion() {
    answered = false;
    const q = round[index];
    app.innerHTML = `<section class="play-shell"><div class="play-top"><span class="eyebrow">歴史の旅 · ${selectedEra === 'all' ? 'すべての時代' : escape(selectedEra)}</span><span class="score-pill">✦ ${score} 問正解</span></div><div class="question-progress"><strong>第 ${index + 1} 問 <span>/ ${round.length}</span></strong><span>ゴールまで、あと ${round.length - index} 問！</span></div><div class="step-track" aria-label="${round.length}問中${index + 1}問目">${round.map((_, i) => `<span class="${i < index ? 'done' : i === index ? 'current' : ''}"></span>`).join('')}</div><article class="question-card"><div class="question-meta"><span class="era-badge">${escape(q.era)}</span><span>QUESTION ${String(index + 1).padStart(2, '0')}</span></div><h1 tabindex="-1">${escape(q.question)}</h1><p class="answer-hint" id="answer-hint">答えをひとつ、えらんでね。</p><div class="choices" aria-label="4つの選択肢">${q.choices.map((c, i) => `<button class="choice" data-choice="${i}"><span class="choice-letter">${'ABCD'[i]}</span><span>${escape(c)}</span><span class="choice-status" aria-hidden="true"></span></button>`).join('')}</div><div id="feedback" aria-live="polite" aria-atomic="true"></div></article><p class="small centered">ひとつ知るたび、歴史の世界が広がる。</p></section>`;
    app.querySelectorAll('.choice').forEach(button => button.addEventListener('click', () => answer(Number(button.dataset.choice))));
    focusTitle();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function answer(chosen) {
    if (answered) return;
    answered = true;
    const q = round[index], correct = chosen === q.answer;
    if (correct) {
      score++;
      if (!cleared.has(q.id)) newlyCleared++;
      cleared.add(q.id); storage.mark(q.id); notice();
    }
    app.querySelector('.score-pill').textContent = `✦ ${score} 問正解`;
    app.querySelector('#answer-hint').textContent = '答えをチェック！';
    app.querySelectorAll('.choice').forEach((button, i) => {
      button.disabled = true;
      if (i === q.answer) { button.classList.add('correct'); button.querySelector('.choice-status').textContent = '正解 ✓'; }
      else if (i === chosen) { button.classList.add('incorrect'); button.querySelector('.choice-status').textContent = '選択'; }
    });
    app.querySelector('#feedback').innerHTML = `<div class="feedback ${correct ? 'success' : 'learn'}"><div class="feedback-heading"><span class="reaction" aria-hidden="true">${correct ? '✦' : '☀'}</span><div><h2>${correct ? '大正解！その調子！' : 'おしい！新しい発見だね。'}</h2><p>正解は「${escape(q.choices[q.answer])}」</p></div></div><p class="explanation">${escape(q.explanation)}</p></div><button class="primary" id="next">${index + 1 === round.length ? '旅の結果を見る' : '次の問題へ'} <span aria-hidden="true">→</span></button>`;
    app.querySelector('#next').addEventListener('click', () => { index++; index < round.length ? showQuestion() : result(); });
  }
  function result() {
    const perfect = score === round.length;
    app.innerHTML = `<section class="result-shell"><span class="eyebrow">JOURNEY COMPLETE</span><div class="medal" aria-hidden="true">${perfect ? '★' : '✦'}</div><h1 tabindex="-1">${perfect ? '全問正解！歴史マスター！' : '10問の冒険、おつかれさま！'}</h1><p class="lead">${score >= 7 ? 'たくさんの歴史に出会えたね。次の旅も楽しもう！' : '今日の発見が、次の旅のチカラになるよ。'}</p><div class="result-score"><strong>${score}</strong><span> / ${round.length} 問正解</span></div><div class="result-discoveries"><span>今回ふえたクリア <strong>＋${newlyCleared} 問</strong></span><span>歴史コレクション <strong>${clearedCount()} / ${questions.length} 問</strong></span></div><div class="result-actions"><button class="primary" id="again">もう一度、冒険する <span aria-hidden="true">→</span></button><button class="secondary" id="home">タイトルにもどる</button></div><p class="small">${storage.isAvailable() ? 'クリア記録を保存しました。続きは、またいつでも。' : 'クリア記録は、この画面を開いている間だけ残ります。'}</p></section>`;
    app.querySelector('#again').addEventListener('click', start);
    app.querySelector('#home').addEventListener('click', () => { home(); focusTitle(); });
    focusTitle(); window.scrollTo({ top: 0, behavior: 'instant' });
  }
  try {
    core.validate(questions);
    if (questions.length < core.PLAY_SIZE) throw new Error('10問以上の問題を登録してください。');
    home();
  } catch (error) {
    app.innerHTML = `<section class="question-card"><h1>出発の準備ができていないようです</h1><p>${escape(error.message)}</p><p>問題データを確認して、もう一度ページを開いてください。</p></section>`;
  }
})();
