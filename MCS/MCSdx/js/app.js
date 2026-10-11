/* ===== DACSS website — state, rollup engine, persistence, actions =====
   No dependencies, no network. Everything runs in the browser. */

'use strict';

const CONFIG = window.DACSS_CONFIG || {};
const STORAGE_KEY = CONFIG.storageKey || 'dacss.v1';
const DATA_PATH = CONFIG.dataPath || 'data/list.json';
const CODES = ['N', 'P', 'A', 'C'];
const CODE_DISPLAY = { N: 'N', P: 'P', A: 'A', C: 'C', ...(CONFIG.codeDisplay || {}) };
const CODE_LABEL = { N: 'Never', P: 'Past', A: 'Always', C: 'Current', ...(CONFIG.codeLabel || {}) };
const IMPACT_VALUES = ['0', '1', '2', '3'];
const IMPACT_LABEL = {
  0: 'No significant impact',
  1: 'Mildly disabling',
  2: 'Severely disabling, but still independent',
  3: 'Disabled by the condition to the point of needing assistance',
  ...(CONFIG.impactLabel || {})
};
const TEXT = {
  categoryCount: (marked, total) => `${marked} of ${total} marked`,
  columns: ['Your answer', 'Disorder', 'Current Impact'],
  centralMarker: '* central sensitization syndrome',
  coMarker: '^ reported after CO poisoning',
  currentImpactFor: name => `Current Impact for ${name}`,
  trendRising: 'Load rising with age',
  trendFalling: 'Load falling with age',
  trendNeutral: 'Load with age',
  progress: (marked, total, missing) =>
    `${marked} of ${total} disorders marked as had or having (the rest are Never).` +
    (missing ? ` ${missing} ${missing === 1 ? 'needs' : 'need'} a Current Impact score.` : ''),
  completeImpactBeforePrint: 'Complete the highlighted Current Impact score before printing or saving the report.',
  chooseImpact: name => `Choose a Current Impact score for ${name || 'this disorder'} before continuing.`,
  clearConfirmation: 'Clear all your answers and personal details from this device? This cannot be undone.',
  loadError: 'Could not load the disorder list. If you opened this file directly, please run it from a local web server (see README).',
  ...(CONFIG.text || {})
};
const CATEGORY_NAMES = CONFIG.categoryNames || {};
const ITEM_NAMES = CONFIG.itemNames || {};

let DATA = null;          // list.json
let state = null;         // { answers:{id:code}, impacts:{id:score}, patient:{...} }
let pendingId = '';

/* ---------- persistence ---------- */
function blankState() {
  return {
    schema: 2,
    report: 'DACSS',
    answers: {},          // id -> code; missing = default 'N'
    impacts: {},          // id -> 0–3; required when answer is not N
    patient: { id: '', sex: '', ageYears: '', ageMonths: '', dateCompleted: '' }
  };
}
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...blankState(),
        ...parsed,
        schema: 2,
        answers: parsed.answers && typeof parsed.answers === 'object' ? parsed.answers : {},
        impacts: parsed.impacts && typeof parsed.impacts === 'object' ? parsed.impacts : {},
        patient: { ...blankState().patient, ...(parsed.patient || {}) }
      };
    }
  } catch (e) { /* ignore corrupt storage */ }
  return blankState();
}
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (e) { /* storage may be full/blocked; app still works in-session */ }
}

/* code for an item, defaulting to 'N' (dashboard starts all-N per spec) */
function codeOf(id) { return state.answers[id] || 'N'; }
function impactOf(id) {
  const value = state.impacts[id];
  const text = value === undefined || value === null ? '' : String(value);
  return IMPACT_VALUES.includes(text) ? text : '';
}
function hasImpact(id) { return impactOf(id) !== ''; }

/* ---------- rollup engine (ports of the sheet's COUNTIF logic) ---------- */
function allItems() { return DATA.categories.flatMap(c => c.items); }
function categoryName(cat) { return CATEGORY_NAMES[cat.id] || cat.name; }
function itemName(item) { return ITEM_NAMES[item.id] || item.name; }

function countByCode(items) {
  const t = { N: 0, P: 0, A: 0, C: 0 };
  items.forEach(it => { t[codeOf(it.id)]++; });
  return t;
}
/* percent of TOTAL items (Albert: DACSS shows percent of total) */
function pct(n, total) { return total ? Math.round((n / total) * 100) : 0; }

function rollup(items) {
  const total = items.length;
  const c = countByCode(items);
  const impactScores = items
    .filter(it => codeOf(it.id) !== 'N' && hasImpact(it.id))
    .map(it => Number(impactOf(it.id)));
  return {
    total,
    N: pct(c.N, total), P: pct(c.P, total), A: pct(c.A, total), C: pct(c.C, total),
    any: pct(c.P + c.A + c.C, total),          // ever experienced
    trend: pct(c.C, total) - pct(c.P, total),  // load with age = %Current − %Past
    avgImpact: impactScores.length
      ? impactScores.reduce((sum, score) => sum + score, 0) / impactScores.length
      : null,
    counts: c
  };
}
function formatImpact(value) { return value === null ? '—' : value.toFixed(1); }

/* ---------- rendering: checklist ---------- */
function buildChecklist() {
  const root = document.getElementById('categories');
  root.innerHTML = '';
  DATA.categories.forEach(cat => {
    const sec = document.createElement('section');
    sec.className = 'cat';
    const marked = cat.items.filter(it => codeOf(it.id) !== 'N').length;

    const h = document.createElement('h3');
    h.innerHTML = `<span>${escapeHtml(categoryName(cat))}</span>` +
      `<span class="cat-count" id="count-${cat.id}">${escapeHtml(TEXT.categoryCount(marked, cat.items.length))}</span>`;
    sec.appendChild(h);

    const columns = document.createElement('div');
    columns.className = 'column-head';
    columns.innerHTML = TEXT.columns.map(label => `<span>${escapeHtml(label)}</span>`).join('');
    sec.appendChild(columns);

    cat.items.forEach(it => sec.appendChild(disorderRow(it)));
    root.appendChild(sec);
  });
}

function disorderRow(it) {
  const row = document.createElement('div');
  row.className = 'disorder' + (codeOf(it.id) !== 'N' ? ' is-marked' : '');
  row.id = 'row-' + it.id;

  const displayName = itemName(it);
  const markers = [];
  if (it.centralSensitization) markers.push(TEXT.centralMarker);
  if (it.coPoisoning) markers.push(TEXT.coMarker);

  const name = document.createElement('div');
  const nameHtml = it.url
    ? `<a href="${escapeHtml(it.url)}" target="_blank" rel="noopener noreferrer" ` +
      `style="color: inherit; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 2px;">` +
      `${escapeHtml(displayName)}</a>`
    : escapeHtml(displayName);
  name.innerHTML = `<p class="name">${nameHtml}</p>` +
    (markers.length ? `<p class="markers">${escapeHtml(markers.join('  ·  '))}</p>` : '');
  row.appendChild(name);

  // radio group (radios are clearer than a menu for a long list)
  const group = document.createElement('div');
  group.className = 'opts';
  group.setAttribute('role', 'radiogroup');
  group.setAttribute('aria-label', displayName);
  CODES.forEach(code => {
    const id = `${it.id}-${code}`;
    const label = document.createElement('label');
    label.setAttribute('for', id);
    label.title = CODE_LABEL[code];
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = it.id;
    input.id = id;
    input.value = code;
    input.checked = codeOf(it.id) === code;
    input.addEventListener('change', () => setAnswer(it.id, code));
    const face = document.createElement('span');
    face.className = 'opt';
    face.textContent = CODE_DISPLAY[code];
    face.setAttribute('aria-hidden', 'true');
    // visible text for screen readers
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = CODE_LABEL[code];
    label.append(input, face, sr);
    group.appendChild(label);
  });
  row.appendChild(group);

  const impactGroup = document.createElement('div');
  impactGroup.className = 'impact-opts';
  impactGroup.setAttribute('role', 'radiogroup');
  impactGroup.setAttribute('aria-label', TEXT.currentImpactFor(displayName));
  IMPACT_VALUES.forEach(score => {
    const id = `${it.id}-impact-${score}`;
    const label = document.createElement('label');
    label.setAttribute('for', id);
    label.title = `${score}: ${IMPACT_LABEL[score]}`;
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = `${it.id}-impact`;
    input.id = id;
    input.value = score;
    input.checked = impactOf(it.id) === score;
    input.addEventListener('change', () => setImpact(it.id, score));
    const face = document.createElement('span');
    face.className = 'impact-opt';
    face.textContent = score;
    face.setAttribute('aria-hidden', 'true');
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = IMPACT_LABEL[score];
    label.append(input, face, sr);
    impactGroup.appendChild(label);
  });
  row.appendChild(impactGroup);
  return row;
}

/* ---------- state changes ---------- */
function setAnswer(id, code) {
  if (code === 'N') {
    delete state.answers[id];
    delete state.impacts[id];
    if (pendingId === id) pendingId = '';
  } else {
    state.answers[id] = code;
    if (!hasImpact(id)) pendingId = id;
  }
  save();
  refreshAll();
  if (pendingId === id) {
    const impact = document.querySelector(`#row-${id} .impact-opts input`);
    if (impact) impact.focus({ preventScroll: true });
    document.getElementById('row-' + id).scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    maybeAutofillDate();
  }
}

function setImpact(id, score) {
  if (codeOf(id) === 'N' || !IMPACT_VALUES.includes(score)) return;
  state.impacts[id] = score;
  if (pendingId === id) pendingId = '';
  save();
  refreshAll();
  maybeAutofillDate();
}

function updateRow(id) {
  const row = document.getElementById('row-' + id);
  if (!row) return;
  const code = codeOf(id);
  const needsImpact = code !== 'N' && !hasImpact(id);
  const locked = Boolean(pendingId && pendingId !== id);
  row.classList.toggle('is-marked', code !== 'N');
  row.classList.toggle('needs-impact', needsImpact);
  row.classList.toggle('is-locked', locked);
  row.querySelectorAll('.opts input').forEach(input => {
    input.disabled = locked;
    input.checked = input.value === code;
  });
  row.querySelectorAll('.impact-opts input').forEach(input => {
    input.disabled = code === 'N' || locked;
    input.checked = input.value === impactOf(id);
  });
}

function refreshPendingAlert() {
  const alertBox = document.getElementById('pending-alert');
  alertBox.hidden = !pendingId;
  if (!pendingId) return;
  const item = allItems().find(it => it.id === pendingId);
  document.getElementById('pending-name').textContent = item ? itemName(item) : '';
}

function refreshAll() {
  allItems().forEach(it => updateRow(it.id));
  refreshPendingAlert();
  refreshDashboard();
}

/* autofill "date completed" once every item has been actively touched.
   Since default is N, "complete" = the patient has visited the whole list.
   We treat any non-N answer OR an explicit N tick as "touched" is not tracked;
   instead we autofill when the user has marked at least one item and leaves the
   date blank — a light-touch default the clinician can correct. */
function maybeAutofillDate() {
  const el = document.getElementById('date-completed');
  if (!el.value && Object.keys(state.answers).length > 0) {
    el.value = todayISO();
    state.patient.dateCompleted = el.value;
    save();
  }
}
function todayISO() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/* ---------- rendering: dashboard ---------- */
function refreshDashboard() {
  const items = allItems();
  const r = rollup(items);

  document.getElementById('total-count').textContent = r.total;
  document.getElementById('kpi-experienced').textContent = r.any + '%';
  document.getElementById('kpi-never').textContent = r.N + '%';
  document.getElementById('kpi-past').textContent = r.P + '%';
  document.getElementById('kpi-always').textContent = r.A + '%';
  document.getElementById('kpi-current').textContent = r.C + '%';

  const trendEl = document.getElementById('kpi-trend');
  const sign = r.trend > 0 ? '+' : '';
  trendEl.textContent = sign + r.trend + '%';
  const label = r.trend > 0 ? TEXT.trendRising
              : r.trend < 0 ? TEXT.trendFalling
              : TEXT.trendNeutral;
  document.getElementById('kpi-trend-label').textContent = label;

  const markedTotal = items.filter(it => codeOf(it.id) !== 'N').length;
  const missingImpact = items.filter(it => codeOf(it.id) !== 'N' && !hasImpact(it.id)).length;
  document.getElementById('progress').textContent = TEXT.progress(markedTotal, r.total, missingImpact);

  // category table + per-category counts
  const tb = document.getElementById('dash-rows');
  tb.innerHTML = '';
  DATA.categories.forEach(cat => {
    const cr = rollup(cat.items);
    const tr = document.createElement('tr');
    tr.innerHTML =
      `<th scope="row">${escapeHtml(categoryName(cat))}</th>` +
      `<td>${cr.N}%</td><td>${cr.P}%</td><td>${cr.A}%</td><td>${cr.C}%</td><td>${cr.any}%</td>` +
      `<td>${formatImpact(cr.avgImpact)}</td>`;
    tb.appendChild(tr);
    const cnt = document.getElementById('count-' + cat.id);
    if (cnt) cnt.textContent =
      TEXT.categoryCount(cat.items.filter(it => codeOf(it.id) !== 'N').length, cat.items.length);
  });
}

/* ---------- patient fields ---------- */
function bindPatientFields() {
  const map = {
    'patient-id': 'id', 'sex': 'sex', 'age-years': 'ageYears',
    'age-months': 'ageMonths', 'date-completed': 'dateCompleted'
  };
  Object.entries(map).forEach(([elId, key]) => {
    const el = document.getElementById(elId);
    el.value = state.patient[key] || '';
    el.addEventListener('input', () => { state.patient[key] = el.value; save(); });
  });
}

/* ---------- actions ---------- */
function printReport(color) {
  if (focusPendingImpact(TEXT.completeImpactBeforePrint)) return;
  document.body.classList.toggle('print-color', !!color);
  window.print();
}
function focusPendingImpact(message) {
  if (!pendingId) {
    const missing = allItems().find(it => codeOf(it.id) !== 'N' && !hasImpact(it.id));
    pendingId = missing ? missing.id : '';
    if (pendingId) refreshAll();
  }
  if (!pendingId) return false;
  const item = allItems().find(it => it.id === pendingId);
  alert(message || TEXT.chooseImpact(item ? itemName(item) : ''));
  const impact = document.querySelector(`#row-${pendingId} .impact-opts input`);
  if (impact) impact.focus();
  document.getElementById('row-' + pendingId).scrollIntoView({ behavior: 'smooth', block: 'center' });
  return true;
}
function clearAll() {
  if (!confirm(TEXT.clearConfirmation)) return;
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  state = blankState();
  pendingId = '';
  document.querySelectorAll('.opts input[value="N"]').forEach(i => { i.checked = true; });
  document.querySelectorAll('.impact-opts input').forEach(i => { i.checked = false; });
  ['patient-id', 'sex', 'age-years', 'age-months', 'date-completed']
    .forEach(id => { document.getElementById(id).value = ''; });
  document.querySelectorAll('.disorder.is-marked').forEach(r => r.classList.remove('is-marked'));
  refreshAll();
}

/* ---------- util ---------- */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

/* ---------- boot ---------- */
async function init() {
  state = load();
  try {
    const res = await fetch(DATA_PATH, { cache: 'no-store' });
    DATA = await res.json();
  } catch (e) {
    document.getElementById('categories').innerHTML = `<p class="card">${escapeHtml(TEXT.loadError)}</p>`;
    return;
  }
  document.getElementById('version').textContent = DATA.version || '';
  buildChecklist();
  bindPatientFields();
  const missing = allItems().find(it => codeOf(it.id) !== 'N' && !hasImpact(it.id));
  pendingId = missing ? missing.id : '';
  refreshAll();

  document.getElementById('btn-print-bw').addEventListener('click', () => printReport(false));
  document.getElementById('btn-print-color').addEventListener('click', () => printReport(true));
  document.getElementById('btn-clear').addEventListener('click', clearAll);
}
document.addEventListener('DOMContentLoaded', init);
