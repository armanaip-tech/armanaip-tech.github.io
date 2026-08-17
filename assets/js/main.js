// ============================================================================
// Закупки АО «Самрук-Қазына»: порядок, процессы и практика
// Логика интерактивного учебного портала. Контент отделён от разметки —
// см. assets/data/*.json (загружаются fetch'ем при старте).
// ============================================================================

const DATA_BASE = 'assets/data/';
const LS_PROGRESS = 'skk-portal-progress-v1';
const LS_QUIZ_HISTORY = 'skk-portal-quiz-history-v1';
const LS_LAST_SECTION = 'skk-portal-last-section-v1';

const state = {
  articles: [],
  glossary: [],
  changes: [],
  timeline: [],
  quiz: [],
  modules: [],
  changesFilter: 'all',
};

async function loadJSON(name) {
  const res = await fetch(DATA_BASE + name, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load ${name}`);
  return res.json();
}

function esc(str) {
  if (str == null) return '';
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function svgIcon(name) {
  const icons = {
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
    route: '<circle cx="6" cy="19" r="3"/><circle cx="18" cy="5" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/>',
    'file-signature': '<path d="M20 19.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v13.5"/><path d="M14 3v5h5"/><path d="M4 21h16"/>',
    flag: '<path d="M4 22V4a1 1 0 0 1 1-1h13l-2.5 5L20 13H5"/>',
    'help-circle': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  };
  return `<svg class="icon" viewBox="0 0 24 24">${icons[name] || icons.book}</svg>`;
}

// ============================================================================
// РЕНДЕР: ГЛАВНАЯ
// ============================================================================
function renderHeroKpis() {
  const items = [
    { value: '74', label: 'Статьи Порядка' },
    { value: '№193 / 03.03.2022', label: 'Дата утверждения' },
    { value: '№274 / 25.05.2026', label: 'Последняя редакция' },
    { value: 'zakup.sk.kz', label: 'Портал закупок' },
  ];
  document.getElementById('hero-kpis').innerHTML = items.map(i => `
    <div class="kpi"><div class="value mono">${esc(i.value)}</div><div class="label">${esc(i.label)}</div></div>
  `).join('');
}

const PROCESS_MAP = [
  { n: '01', t: 'Планирование', d: 'Консолидация потребности и формирование Плана закупок (статьи 11–12).', href: '#planning' },
  { n: '02', t: 'Квалификация', d: 'Ведение реестров и предварительный квалификационный отбор поставщиков (статьи 14–26).', href: '#registries' },
  { n: '03', t: 'Выбор способа', d: 'Тендер, ЗЦП, электронный магазин или один источник — в зависимости от объёма и оснований (статья 29).', href: '#supplier-selection' },
  { n: '04', t: 'Приём и оценка заявок', d: 'Публикация, вскрытие, рассмотрение заявок закупочной комиссией (статьи 40–43).', href: '#supplier-selection' },
  { n: '05', t: 'Определение победителя', d: 'Победителем признаётся заявка, соответствующая требованиям и предложившая наиболее выгодные условия.', href: '#supplier-selection' },
  { n: '06', t: 'Договор', d: 'Заключение договора о закупках на условиях тендерной документации (статья 61).', href: '#contract-management' },
  { n: '07', t: 'Исполнение', d: 'Мониторинг обязательств, приёмка, оплата и закрытие договора (статьи 63–69).', href: '#contract-management' },
];

function renderProcessMap() {
  const track = document.getElementById('process-map');
  track.innerHTML = PROCESS_MAP.map((s, i) => `
    <div class="map-step" data-idx="${i}" tabindex="0" role="button" aria-label="${esc(s.t)}">
      <div class="num mono">${s.n}</div>
      <div class="t">${esc(s.t)}</div>
    </div>
  `).join('');
  const detail = document.getElementById('map-detail');
  function show(i) {
    track.querySelectorAll('.map-step').forEach(el => el.classList.remove('active'));
    const el = track.querySelector(`[data-idx="${i}"]`);
    if (el) el.classList.add('active');
    const s = PROCESS_MAP[i];
    detail.innerHTML = `<strong style="color:#fff">${esc(s.t)}.</strong> ${esc(s.d)} <a href="${s.href}">Перейти в раздел →</a>`;
  }
  track.addEventListener('click', (e) => {
    const step = e.target.closest('.map-step');
    if (step) show(Number(step.dataset.idx));
  });
  track.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const step = e.target.closest('.map-step');
      if (step) { e.preventDefault(); show(Number(step.dataset.idx)); }
    }
  });
}

const NAVIGATOR_CARDS = [
  { icon: 'book', title: 'О Порядке', desc: 'Нормативная основа, редакции и хронология изменений', href: '#order-overview' },
  { icon: 'calendar', title: 'Планирование закупок', desc: 'Как формируется и утверждается План закупок', href: '#planning' },
  { icon: 'database', title: 'Реестры и перечни', desc: 'Предварительная квалификация и Перечень ненадёжных поставщиков', href: '#registries' },
  { icon: 'route', title: 'Выбор поставщика', desc: 'Тендер, ЗЦП, электронный магазин, один источник', href: '#supplier-selection' },
  { icon: 'file-signature', title: 'Управление договорами', desc: 'Исполнение, изменение и закрытие договора', href: '#contract-management' },
  { icon: 'flag', title: 'Изменения Порядка', desc: 'Утверждённые изменения и проектные предложения', href: '#changes' },
  { icon: 'help-circle', title: 'Проверка знаний', desc: '10 вопросов по структуре Порядка', href: '#quiz' },
  { icon: 'user', title: 'О лекторе', desc: 'Айып А., ТОО «Самрук-Қазына Контракт»', href: '#lecturer' },
];

function renderNavigator() {
  document.getElementById('navigator-grid').innerHTML = NAVIGATOR_CARDS.map(c => `
    <a class="nav-card" href="${c.href}">
      <div class="ic">${svgIcon(c.icon)}</div>
      <h4>${esc(c.title)}</h4>
      <p>${esc(c.desc)}</p>
    </a>
  `).join('');
}

// ============================================================================
// РЕНДЕР: О ПОРЯДКЕ
// ============================================================================
function renderOrderOverview() {
  const cards = [
    { label: 'Полное название', value: 'Порядок осуществления закупок акционерным обществом «Фонд национального благосостояния «Самрук-Қазына» и юридическими лицами, пятьдесят и более процентов голосующих акций (долей участия) которых прямо или косвенно принадлежат АО «Самрук-Қазына» на праве собственности или доверительного управления' },
    { label: 'Первоначальное утверждение', value: 'Протокол №193 от 3 марта 2022 года' },
    { label: 'Используемая редакция', value: 'Консолидированная редакция с изменениями по состоянию на 30 апреля 2026 года' },
    { label: 'Последнее учитываемое решение', value: 'Решение Совета директоров №274 от 30 апреля 2026 года' },
    { label: 'Дата введения изменений по решению №274', value: '25 мая 2026 года' },
    { label: 'Официальный портал закупок', value: 'zakup.sk.kz' },
  ];
  document.getElementById('order-cards').innerHTML = cards.map(c => `
    <div class="data-card"><div class="label">${esc(c.label)}</div><div class="value">${esc(c.value)}</div></div>
  `).join('');
}

function renderTimeline() {
  document.getElementById('timeline').innerHTML = state.timeline.map(t => `
    <div class="timeline-item ${t.milestone ? 'milestone' : ''}">
      <div class="timeline-date">${formatDate(t.date)}</div>
      <div class="timeline-label">${esc(t.label)} <span class="timeline-protocol">— протокол №${esc(t.protocol)}</span></div>
      ${t.desc ? `<div class="timeline-desc">${esc(t.desc)}</div>` : ''}
    </div>
  `).join('');
}

function formatDate(iso) {
  const [y, m, d] = iso.split('-');
  const months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
  return `${Number(d)} ${months[Number(m) - 1]} ${y}`;
}

// ============================================================================
// РЕНДЕР: УЧЕБНЫЕ МОДУЛИ
// ============================================================================
function articlesForModule(moduleId) {
  return state.articles.filter(a => a.module === moduleId).sort((a, b) => a.number - b.number);
}

function renderArticleParagraphs(paragraphs) {
  return paragraphs.map(p => {
    if (!p.text) return '';
    const prefixHtml = p.prefix ? `<span class="prefix">${esc(p.prefix)}</span>` : '<span class="prefix"></span>';
    const isExcludedLine = /^(исключ|Исключ)/.test(p.text.trim());
    return `<div class="article-para${isExcludedLine ? ' excluded-note' : ''}">${prefixHtml}<span>${esc(p.text)}</span></div>`;
  }).join('');
}

function renderModuleArticleReader(moduleId) {
  const arts = articlesForModule(moduleId);
  if (!arts.length) return '';
  const items = arts.map(a => `
    <div class="article-item${a.excluded ? ' excluded' : ''}" data-article="${a.number}">
      <div class="article-summary" role="button" tabindex="0" aria-expanded="false">
        <div class="left">
          <span class="article-num">Ст. ${a.number}</span>
          <span class="article-title">${esc(a.title)}</span>
        </div>
        <svg class="icon article-chevron" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <div class="article-body">
        <div class="article-body-inner">
          ${a.excluded ? '' : '<div class="official-badge">Официальный текст статьи</div>'}
          ${renderArticleParagraphs(a.paragraphs)}
        </div>
      </div>
    </div>
  `).join('');
  return `
    <div class="article-reader">
      <div class="official-badge" style="margin-top:0">Официальный текст Порядка · раздел статей ${arts[0].number}–${arts[arts.length - 1].number}</div>
      ${items}
    </div>
  `;
}

function renderModuleQuiz(mod) {
  if (!mod.quiz || !mod.quiz.length) return '';
  const qs = mod.quiz.map(idx => state.quiz[idx]).filter(Boolean);
  if (!qs.length) return '';
  return `<div class="mini-quiz" data-module="${mod.id}" style="margin-top:36px">
    <h3>Проверить себя</h3>
    <div class="mini-quiz-body"></div>
  </div>`;
}

function renderModules() {
  const root = document.getElementById('modules-root');
  root.innerHTML = state.modules.map((mod, i) => `
    <section class="section ${i % 2 === 1 ? 'section--alt' : ''}" id="${mod.id}">
      <div class="section-head reveal">
        <div class="eyebrow">${esc(mod.eyebrow)}</div>
        <h2>${esc(mod.title)}</h2>
        <p>${esc(mod.purpose)}</p>
      </div>

      <div class="flow-row reveal">
        ${mod.flow.map((f, fi) => `<span class="chip${fi === 0 ? ' on' : ''}">${esc(f)}</span>${fi < mod.flow.length - 1 ? '<span class="arrow">→</span>' : ''}`).join('')}
      </div>

      <div class="steps-row reveal">
        ${mod.process.map((p, pi) => `
          <div class="step-pill">
            <div class="n">${String(pi + 1).padStart(2, '0')}${p.ref ? ` · ст.${p.ref}` : ''}</div>
            <div class="t">${esc(p.title)}</div>
          </div>
        `).join('')}
      </div>
      <div class="reveal" style="margin-top:18px">
        ${mod.process.map(p => `<p style="font-size:.9rem"><strong style="color:#fff">${esc(p.title)}.</strong> ${esc(p.desc)}</p>`).join('')}
      </div>

      <div class="reveal">
        <h3>Официальный текст Порядка</h3>
        ${renderModuleArticleReader(mod.id)}
      </div>

      <div class="practical reveal">
        <div class="p-ic"><svg class="icon" style="stroke:#04121c" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg></div>
        <div>
          <div class="p-label">Практический пример</div>
          <p>${esc(mod.example)}</p>
        </div>
      </div>

      <div class="reveal" style="margin-top:36px">
        <h3>Типичные ошибки</h3>
        <div class="mistakes-list">
          ${mod.mistakes.map(m => `
            <div class="mistake-item">
              <svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p>${esc(m)}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="reveal" style="margin-top:32px">
        <button class="lecturer-toggle" data-toggle-lecturer="${mod.id}">
          ${svgIcon('user')} Комментарий лектора
        </button>
        <div class="lecturer-panel" id="lecturer-${mod.id}" style="display:none">
          ${mod.lecturerTips.map(t => `
            <div class="lecturer-card">
              <div class="lecturer-head">
                <div class="lecturer-avatar">АА</div>
                <div><div class="lecturer-name">Айып А. поясняет</div><div class="lecturer-role">Лектор · ТОО «Самрук-Қазына Контракт»</div></div>
              </div>
              <div class="lecturer-body">
                <div class="lecturer-row"><span class="tag">Комментарий</span><p>${esc(t.comment)}</p></div>
                <div class="lecturer-row"><span class="tag">Пример</span><p>${esc(t.example)}</p></div>
                <div class="lecturer-row"><span class="tag">Ошибка</span><p>${esc(t.mistake)}</p></div>
                ${t.ref ? `<div class="lecturer-row"><span class="tag">Статья</span><p class="mono">Статья ${t.ref} Порядка</p></div>` : ''}
                ${t.question ? `<div class="lecturer-row"><span class="tag">Вопрос из зала</span><p><em>«${esc(t.question)}»</em></p></div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      ${renderModuleQuiz(mod)}

      <label class="module-check" data-module-check="${mod.id}">
        <input type="checkbox"> <span class="check-label">Отметить раздел как изученный</span>
      </label>
    </section>
  `).join('');

  // article accordion toggling
  root.querySelectorAll('.article-summary').forEach(sum => {
    sum.addEventListener('click', () => toggleArticle(sum));
    sum.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleArticle(sum); }
    });
  });

  // lecturer toggle
  root.querySelectorAll('[data-toggle-lecturer]').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = document.getElementById('lecturer-' + btn.dataset.toggleLecturer);
      const open = panel.style.display !== 'none';
      panel.style.display = open ? 'none' : 'block';
    });
  });

  // module mini quiz
  state.modules.forEach(mod => mountMiniQuiz(mod));

  // progress checkboxes
  root.querySelectorAll('[data-module-check]').forEach(label => {
    const id = label.dataset.moduleCheck;
    const input = label.querySelector('input');
    input.checked = getProgress()[id] === true;
    if (input.checked) label.classList.add('done');
    input.addEventListener('change', () => {
      setModuleDone(id, input.checked);
      label.classList.toggle('done', input.checked);
    });
  });

  observeReveal(root);
}

function toggleArticle(summaryEl) {
  const item = summaryEl.closest('.article-item');
  const open = item.classList.toggle('open');
  summaryEl.setAttribute('aria-expanded', String(open));
}

// ============================================================================
// МИНИ-ТЕСТ ВНУТРИ МОДУЛЯ
// ============================================================================
function mountMiniQuiz(mod) {
  const container = document.querySelector(`.mini-quiz[data-module="${mod.id}"] .mini-quiz-body`);
  if (!container) return;
  const qs = (mod.quiz || []).map(idx => state.quiz[idx]).filter(Boolean);
  let current = 0;
  function render() {
    if (current >= qs.length) {
      container.innerHTML = `<p style="color:var(--green)">Мини-проверка пройдена — переходите к следующему разделу.</p>`;
      return;
    }
    const q = qs[current];
    container.innerHTML = `
      <p class="quiz-q" style="font-size:1rem;margin-bottom:14px">${esc(q.q)}</p>
      <div class="quiz-options">
        ${q.options.map((o, i) => `<button class="quiz-opt" data-i="${i}"><span class="letter">${String.fromCharCode(65 + i)}</span>${esc(o)}</button>`).join('')}
      </div>
      <div class="quiz-explain" id="mini-explain-${mod.id}"></div>
    `;
    container.querySelectorAll('.quiz-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.i);
        container.querySelectorAll('.quiz-opt').forEach(b => b.disabled = true);
        container.querySelectorAll('.quiz-opt').forEach((b, bi) => {
          if (bi === q.answer) b.classList.add('correct');
          else if (bi === i && i !== q.answer) b.classList.add('incorrect');
        });
        const ex = document.getElementById(`mini-explain-${mod.id}`);
        ex.classList.add('show');
        ex.innerHTML = `${i === q.answer ? '✓ Верно.' : '✕ Неверно.'} ${esc(q.explain)} <button class="btn-ghost" style="margin-top:12px;padding:8px 14px;font-size:.8rem" id="mini-next-${mod.id}">Далее →</button>`;
        document.getElementById(`mini-next-${mod.id}`).addEventListener('click', () => { current++; render(); });
      });
    });
  }
  render();
}

// ============================================================================
// РЕНДЕР: ИЗМЕНЕНИЯ ПОРЯДКА
// ============================================================================
const CHANGE_FILTERS = [
  { id: 'all', label: 'Все изменения' },
  { id: 'approved', label: 'Утверждённые' },
  { id: 'draft', label: 'Проект изменения' },
  { id: 'new-norm', label: 'Новые нормы' },
  { id: 'changed-norm', label: 'Изменённая редакция' },
  { id: 'excluded-norm', label: 'Исключённые нормы' },
  { id: 'registry', label: 'Реестры и классификаторы' },
  { id: 'contract', label: 'Договоры' },
  { id: 'supplier', label: 'Поставщики' },
];

function renderChangesFilters() {
  document.getElementById('changes-filters').innerHTML = CHANGE_FILTERS.map(f => `
    <button class="filter-chip${f.id === state.changesFilter ? ' active' : ''}" data-filter="${f.id}">${esc(f.label)}</button>
  `).join('');
  document.getElementById('changes-filters').querySelectorAll('.filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      state.changesFilter = btn.dataset.filter;
      renderChangesFilters();
      renderChangesList();
    });
  });
}

function matchesFilter(c, filter) {
  if (filter === 'all') return true;
  if (filter === 'approved') return c.status !== 'draft';
  if (filter === 'draft') return c.status === 'draft';
  return c.category === filter;
}

function renderChangesList() {
  const list = state.changes.filter(c => matchesFilter(c, state.changesFilter));
  const el = document.getElementById('changes-list');
  if (!list.length) {
    el.innerHTML = `<p style="color:var(--ink-faint)">Изменений по выбранному фильтру не найдено.</p>`;
    return;
  }
  el.innerHTML = list.map(c => `
    <article class="change-card">
      <div class="change-head">
        <span class="change-ref mono">${esc(c.ref)}</span>
        <span class="status-badge ${c.status === 'draft' ? 'draft' : 'approved'}">${c.status === 'draft' ? 'Проект изменения' : 'Действует'}</span>
      </div>
      <h3>${esc(c.title)}</h3>
      <div class="change-compare">
        <div class="compare-col before">
          <span class="compare-label">Прежняя редакция</span>
          ${c.before ? esc(c.before) : '<em>Положение отсутствовало — рассматриваемая норма является дополнением.</em>'}
        </div>
        <div class="compare-col after">
          <span class="compare-label">${c.status === 'draft' ? 'Предлагаемая редакция' : 'Новая редакция'}</span>
          ${esc(c.after)}
        </div>
      </div>
      <div class="change-explain">
        <div class="lbl">Простыми словами</div>
        <p style="margin-bottom:10px">${esc(c.explain)}</p>
        <div class="lbl">Практическое значение</div>
        <p style="margin:0">${esc(c.practical)}</p>
      </div>
      <div class="change-meta">
        <span class="meta-tag">${esc(c.decision)}</span>
        ${c.decisionRef ? `<span class="meta-tag">${esc(c.decisionRef)}</span>` : ''}
        ${c.effective ? `<span class="meta-tag">Вступает в силу: ${esc(c.effective)}</span>` : ''}
        ${c.articleLink ? `<a class="meta-tag" href="#" data-goto-article="${c.articleLink}">См. статью ${c.articleLink} →</a>` : ''}
      </div>
    </article>
  `).join('');

  el.querySelectorAll('[data-goto-article]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      gotoArticle(Number(a.dataset.gotoArticle));
    });
  });
}

function gotoArticle(num) {
  const art = state.articles.find(a => a.number === num);
  if (!art) return;
  const target = document.querySelector(`.article-item[data-article="${num}"]`);
  if (target) {
    document.getElementById(art.module).scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      target.classList.add('open');
      target.querySelector('.article-summary').setAttribute('aria-expanded', 'true');
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 400);
  }
}

// ============================================================================
// РЕНДЕР: ПРОВЕРКА ЗНАНИЙ (главный тест)
// ============================================================================
function mountMainQuiz() {
  const root = document.getElementById('quiz-root');
  let current = 0;
  let score = 0;
  const answers = [];

  function renderQuestion() {
    const q = state.quiz[current];
    root.innerHTML = `
      <div class="quiz-shell">
        <div class="quiz-progress-row">
          <span>Вопрос ${current + 1} из ${state.quiz.length}</span>
          <span>Баллы: ${score}</span>
        </div>
        <div class="quiz-bar"><div class="quiz-bar-fill" style="width:${(current / state.quiz.length) * 100}%"></div></div>
        <div class="quiz-q">${esc(q.q)}</div>
        <div class="quiz-options">
          ${q.options.map((o, i) => `<button class="quiz-opt" data-i="${i}"><span class="letter">${String.fromCharCode(65 + i)}</span>${esc(o)}</button>`).join('')}
        </div>
        <div class="quiz-explain" id="quiz-explain"></div>
        <div class="quiz-actions" id="quiz-actions">
          <button class="btn-ghost" id="quiz-hint">Получить подсказку</button>
          <button class="btn-ghost" id="quiz-reveal">Показать правильный ответ</button>
        </div>
      </div>
    `;
    document.getElementById('quiz-hint').addEventListener('click', () => {
      const ex = document.getElementById('quiz-explain');
      ex.classList.add('show');
      ex.innerHTML = `<strong style="color:var(--amber)">Подсказка:</strong> ${esc(q.hint)}`;
    });
    document.getElementById('quiz-reveal').addEventListener('click', () => lockAnswer(q.answer, true));

    root.querySelectorAll('.quiz-opt').forEach(btn => {
      btn.addEventListener('click', () => lockAnswer(Number(btn.dataset.i), false));
    });

    function lockAnswer(selected, isReveal) {
      root.querySelectorAll('.quiz-opt').forEach(b => b.disabled = true);
      root.querySelectorAll('.quiz-opt').forEach((b, bi) => {
        if (bi === q.answer) b.classList.add('correct');
        else if (bi === selected && !isReveal) b.classList.add('incorrect');
      });
      if (!isReveal) {
        const correct = selected === q.answer;
        if (correct) score++;
        answers[current] = correct;
      } else {
        answers[current] = false;
      }
      const ex = document.getElementById('quiz-explain');
      ex.classList.add('show');
      ex.innerHTML = `<strong style="color:${selected === q.answer ? 'var(--green)' : 'var(--red)'}">${isReveal ? 'Правильный ответ показан.' : (selected === q.answer ? 'Верно!' : 'Неверно.')}</strong> ${esc(q.explain)}`;
      const actions = document.getElementById('quiz-actions');
      actions.innerHTML = `<button class="btn-cta" id="quiz-next" style="padding:10px 22px">${current + 1 < state.quiz.length ? 'Следующий вопрос →' : 'Показать результат →'}</button>`;
      document.getElementById('quiz-next').addEventListener('click', () => {
        current++;
        if (current < state.quiz.length) renderQuestion();
        else renderResult();
      });
    }
  }

  function renderResult() {
    const pct = Math.round((score / state.quiz.length) * 100);
    let grade = 'Стоит повторить материал';
    if (pct >= 90) grade = 'Отлично!';
    else if (pct >= 70) grade = 'Хорошо';
    else if (pct >= 50) grade = 'Удовлетворительно';
    saveQuizResult(pct);
    root.innerHTML = `
      <div class="quiz-shell quiz-result">
        <div class="score">${score}/${state.quiz.length}</div>
        <div class="grade">${pct}% · ${grade}</div>
        <button class="btn-cta" id="quiz-retry">Пройти ещё раз</button>
      </div>
    `;
    document.getElementById('quiz-retry').addEventListener('click', () => {
      current = 0; score = 0; answers.length = 0;
      renderQuestion();
    });
  }

  renderQuestion();
}

// ============================================================================
// РЕНДЕР: СЛОВАРЬ
// ============================================================================
function renderGlossary(filterText = '') {
  const q = filterText.trim().toLowerCase();
  const items = state.glossary.filter(g => !q || g.term.toLowerCase().includes(q) || g.def.toLowerCase().includes(q));
  const el = document.getElementById('glossary-list');
  if (!items.length) {
    el.innerHTML = `<p style="color:var(--ink-faint)">Ничего не найдено.</p>`;
    return;
  }
  el.innerHTML = items.map(g => `
    <div class="glossary-item">
      <div class="glossary-term">${esc(g.term)}</div>
      <p class="glossary-def">${esc(g.def)}</p>
    </div>
  `).join('');
}

// ============================================================================
// ПРОГРЕСС ОБУЧЕНИЯ (localStorage)
// ============================================================================
function getProgress() {
  try { return JSON.parse(localStorage.getItem(LS_PROGRESS) || '{}'); } catch { return {}; }
}
function setModuleDone(id, done) {
  const p = getProgress();
  p[id] = done;
  localStorage.setItem(LS_PROGRESS, JSON.stringify(p));
  renderSidebarProgress();
}
function saveQuizResult(pct) {
  let hist = [];
  try { hist = JSON.parse(localStorage.getItem(LS_QUIZ_HISTORY) || '[]'); } catch {}
  hist.push({ date: new Date().toISOString(), pct });
  localStorage.setItem(LS_QUIZ_HISTORY, JSON.stringify(hist.slice(-20)));
}
function renderSidebarProgress() {
  const p = getProgress();
  const total = state.modules.length;
  const done = state.modules.filter(m => p[m.id]).length;
  const pct = total ? done / total : 0;
  const r = 14, c = 2 * Math.PI * r;
  const el = document.getElementById('sidebar-progress');
  el.innerHTML = `
    <div class="progress-ring-wrap">
      <svg width="34" height="34" viewBox="0 0 34 34">
        <circle class="progress-track" cx="17" cy="17" r="${r}" fill="none" stroke-width="3"/>
        <circle class="progress-fill" cx="17" cy="17" r="${r}" fill="none" stroke-width="3"
          stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}"/>
      </svg>
    </div>
    <span style="font-size:.78rem;color:var(--ink-soft)">${done}/${total} разделов изучено</span>
  `;
}

// ============================================================================
// ПОИСК
// ============================================================================
function buildSearchIndex() {
  const idx = [];
  state.articles.forEach(a => idx.push({ type: 'Статья', title: `Ст. ${a.number}. ${a.title}`, text: a.paragraphs.map(p => p.text).join(' '), href: null, action: () => gotoArticle(a.number) }));
  state.changes.forEach(c => idx.push({ type: c.status === 'draft' ? 'Проект изменения' : 'Изменение', title: c.title, text: (c.explain || '') + ' ' + (c.after || ''), href: '#changes' }));
  state.glossary.forEach(g => idx.push({ type: 'Термин', title: g.term, text: g.def, href: '#glossary' }));
  state.modules.forEach(m => idx.push({ type: 'Раздел', title: m.menuTitle, text: m.purpose, href: '#' + m.id }));
  return idx;
}
let searchIndex = [];

function openSearch() {
  document.getElementById('search-modal').classList.add('open');
  document.getElementById('global-search-input').value = '';
  document.getElementById('global-search-results').innerHTML = `<div class="search-empty">Начните вводить запрос…</div>`;
  setTimeout(() => document.getElementById('global-search-input').focus(), 50);
}
function closeSearch() {
  document.getElementById('search-modal').classList.remove('open');
}
function runSearch(q) {
  const results = document.getElementById('global-search-results');
  const query = q.trim().toLowerCase();
  if (!query) { results.innerHTML = `<div class="search-empty">Начните вводить запрос…</div>`; return; }
  const matches = searchIndex.filter(i => i.title.toLowerCase().includes(query) || i.text.toLowerCase().includes(query)).slice(0, 24);
  if (!matches.length) { results.innerHTML = `<div class="search-empty">Ничего не найдено.</div>`; return; }
  results.innerHTML = matches.map((m, i) => `
    <a class="search-result" href="${m.href || '#'}" data-idx="${i}">
      <div class="sr-title">${highlightMatch(m.title, query)}</div>
      <div class="sr-meta">${esc(m.type)}</div>
    </a>
  `).join('');
  results.querySelectorAll('.search-result').forEach((a, i) => {
    a.addEventListener('click', (e) => {
      const m = matches[i];
      if (m.action) { e.preventDefault(); closeSearch(); m.action(); }
      else closeSearch();
    });
  });
}
function highlightMatch(text, q) {
  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return esc(text);
  return esc(text.slice(0, idx)) + '<mark>' + esc(text.slice(idx, idx + q.length)) + '</mark>' + esc(text.slice(idx + q.length));
}

// ============================================================================
// РЕЖИМ ПРЕЗЕНТАЦИИ
// ============================================================================
function togglePresentation(on) {
  document.body.classList.toggle('presenting', on);
  if (on) document.documentElement.requestFullscreen?.().catch(() => {});
  else if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
}
function presentNextSection(dir) {
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const scrollPos = window.scrollY + 100;
  let idx = sections.findIndex(s => s.offsetTop > scrollPos);
  if (idx === -1) idx = sections.length - 1;
  let targetIdx = dir > 0 ? idx : Math.max(0, idx - 2);
  targetIdx = Math.max(0, Math.min(sections.length - 1, targetIdx));
  sections[targetIdx]?.scrollIntoView({ behavior: 'smooth' });
}

// ============================================================================
// SCROLLSPY + REVEAL + MISC UI
// ============================================================================
function setupScrollspy() {
  const links = Array.from(document.querySelectorAll('.sidebar a[href^="#"]'));
  const sections = links.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  function onScroll() {
    const pos = window.scrollY + 140;
    let activeIdx = 0;
    sections.forEach((s, i) => { if (s.offsetTop <= pos) activeIdx = i; });
    links.forEach((l, i) => l.classList.toggle('active', i === activeIdx));
    const progress = document.getElementById('scroll-progress');
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = h > 0 ? `${Math.min(100, (window.scrollY / h) * 100)}%` : '0%';
    document.getElementById('back-to-top').classList.toggle('show', window.scrollY > 600);
    if (sections[activeIdx]) localStorage.setItem(LS_LAST_SECTION, sections[activeIdx].id);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function observeReveal(root = document) {
  const els = root.querySelectorAll('.reveal:not(.in)');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  els.forEach(el => io.observe(el));
}

function setupMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  function close() { sidebar.classList.remove('open'); backdrop.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
  toggle.addEventListener('click', () => {
    const open = sidebar.classList.toggle('open');
    backdrop.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  backdrop.addEventListener('click', close);
  sidebar.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
}

function setupGlobalHandlers() {
  document.getElementById('search-open').addEventListener('click', openSearch);
  document.getElementById('search-modal').addEventListener('click', (e) => { if (e.target.id === 'search-modal') closeSearch(); });
  document.getElementById('global-search-input').addEventListener('input', (e) => runSearch(e.target.value));

  document.getElementById('present-open').addEventListener('click', () => togglePresentation(true));
  document.getElementById('present-close').addEventListener('click', () => togglePresentation(false));

  document.getElementById('back-to-top').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  document.getElementById('glossary-search').addEventListener('input', (e) => renderGlossary(e.target.value));

  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); openSearch(); }
    if (e.key === 'Escape') {
      if (document.getElementById('search-modal').classList.contains('open')) closeSearch();
      else if (document.body.classList.contains('presenting')) togglePresentation(false);
    }
    if (document.body.classList.contains('presenting')) {
      if (e.key === 'ArrowRight') presentNextSection(1);
      if (e.key === 'ArrowLeft') presentNextSection(-1);
    }
  });
}

// ============================================================================
// INIT
// ============================================================================
async function init() {
  const [articles, glossary, changes, timeline, quiz, modules] = await Promise.all([
    loadJSON('articles.json'),
    loadJSON('glossary.json'),
    loadJSON('changes.json'),
    loadJSON('timeline.json'),
    loadJSON('quiz.json'),
    loadJSON('modules.json'),
  ]);
  state.articles = articles;
  state.glossary = glossary;
  state.changes = changes;
  state.timeline = timeline;
  state.quiz = quiz;
  state.modules = modules;

  renderHeroKpis();
  renderProcessMap();
  renderNavigator();
  renderOrderOverview();
  renderTimeline();
  renderModules();
  renderChangesFilters();
  renderChangesList();
  mountMainQuiz();
  renderGlossary();
  renderSidebarProgress();

  searchIndex = buildSearchIndex();

  setupScrollspy();
  setupMobileMenu();
  setupGlobalHandlers();
  observeReveal(document);
}

init().catch(err => {
  console.error(err);
  document.getElementById('main').innerHTML = `<div class="container" style="padding:80px 0"><p style="color:var(--red)">Не удалось загрузить данные портала. Обновите страницу.</p></div>`;
});
