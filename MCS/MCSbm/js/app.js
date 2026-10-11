/* BAACSS — state, required-date workflow, dashboard, persistence, and printing. */
'use strict';

const CONFIG = window.BAACSS_CONFIG || {};
const TEXT = {
  resultCount: (count, total) => `${count} of ${total} results reported`,
  columns: ['Your result', 'MCS study', 'Biomarker test', 'Most recent result date'],
  resultFor: name => `Your result for ${name}`,
  studyDirection: direction => `Abnormal direction reported in MCS study: ${direction || 'not specified'}`,
  openDefinition: 'Open definition in a new tab',
  resultDateFor: name => `Most recent result date for ${name}`,
  datePlaceholder: 'YYYY / YYYY.MM / YYYY.MM.DD',
  dateRequired: 'Required: YYYY, YYYY.MM, or YYYY.MM.DD',
  progress: (reported, total, notTested) => `${reported} of ${total} biomarker results reported; ${notTested} remain N.`,
  allBiomarkers: 'All biomarkers',
  thisBiomarker: 'this biomarker',
  enterValidDate: name => `Enter a valid result date for ${name} before continuing.`,
  completeDateBeforePrint: 'Complete the highlighted result date before printing or saving the report.',
  clearConfirmation: 'Clear all BAACSS answers, dates, and personal details from this device? This cannot be undone.',
  loadError: 'Could not load the biomarker list. Open this app through its web address or a local web server.',
  ...(CONFIG.text || {})
};
const STORAGE_KEY = CONFIG.storageKey || 'mcsbm.v1';
const CODES = ['N', 'R', 'L', 'H'];
const CODE_LABEL = {
  N: 'Never or no result', R: 'Reference range', L: 'Low', H: 'High or present',
  ...(CONFIG.codeLabel || {})
};
const CODE_DISPLAY = { N: 'N', R: 'R', L: 'L', H: 'H', ...(CONFIG.codeDisplay || {}) };
const STUDY_DISPLAY = { L: CODE_DISPLAY.L, H: CODE_DISPLAY.H, ...(CONFIG.studyDisplay || {}) };

let DATA = null;
let state = null;
let pendingId = '';

function blankState() {
  return {
    schema: 2,
    report: 'BAACSS',
    answers: {},
    dates: {},
    patient: { id: '', sex: '', ageYears: '', ageMonths: '', dateCompleted: '' }
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return blankState();
    const parsed = JSON.parse(raw);
    const answers = parsed.answers && typeof parsed.answers === 'object' ? { ...parsed.answers } : {};
    Object.keys(answers).forEach(id => {
      if (answers[id] === 'C') answers[id] = 'R';
    });
    return {
      ...blankState(),
      ...parsed,
      schema: 2,
      answers,
      dates: parsed.dates && typeof parsed.dates === 'object' ? parsed.dates : {},
      patient: { ...blankState().patient, ...(parsed.patient || {}) }
    };
  } catch (error) {
    return blankState();
  }
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (error) { /* The checklist still works for this session if storage is blocked. */ }
}

function allItems() { return DATA.categories.flatMap(category => category.items); }
function itemById(id) { return allItems().find(item => item.id === id); }
function codeOf(id) { return CODES.includes(state.answers[id]) ? state.answers[id] : 'N'; }
function dateOf(id) { return typeof state.dates[id] === 'string' ? state.dates[id] : ''; }

function validResultDate(value) {
  const text = String(value || '').trim();
  const match = /^(\d{4})(?:\.(\d{2})(?:\.(\d{2}))?)?$/.exec(text);
  if (!match) return false;
  const year = Number(match[1]);
  const month = match[2] ? Number(match[2]) : null;
  const day = match[3] ? Number(match[3]) : null;
  const now = new Date();
  if (year < 1900 || year > now.getFullYear()) return false;
  if (month !== null && (month < 1 || month > 12)) return false;
  if (day !== null) {
    const test = new Date(year, month - 1, day);
    if (test.getFullYear() !== year || test.getMonth() !== month - 1 || test.getDate() !== day) return false;
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (test > today) return false;
  } else if (month !== null && year === now.getFullYear() && month > now.getMonth() + 1) {
    return false;
  }
  return true;
}

function isReported(id) { return codeOf(id) !== 'N' && validResultDate(dateOf(id)); }
function isMatch(item, code = codeOf(item.id)) {
  if (!isReported(item.id)) return false;
  return item.expected === code || (item.expected === 'P' && code === 'H');
}
function pct(number, total) { return total ? Math.round(number / total * 100) : 0; }

function summarize(items) {
  const reportedItems = items.filter(item => isReported(item.id));
  const reported = reportedItems.length;
  const reference = reportedItems.filter(item => codeOf(item.id) === 'R').length;
  const abnormal = reportedItems.filter(item => ['L', 'H'].includes(codeOf(item.id))).length;
  const matching = reportedItems.filter(item => isMatch(item)).length;
  return {
    total: items.length,
    reported,
    notTested: items.length - reported,
    reference,
    abnormal,
    matching,
    reportedPct: pct(reported, items.length),
    referencePct: pct(reference, reported),
    abnormalPct: pct(abnormal, reported),
    matchingPct: pct(matching, reported)
  };
}

function buildChecklist() {
  const root = document.getElementById('categories');
  root.replaceChildren();
  DATA.categories.forEach(category => {
    const section = document.createElement('section');
    section.className = 'cat';
    section.id = `category-${category.id}`;

    const heading = document.createElement('h3');
    const count = category.items.filter(item => isReported(item.id)).length;
    heading.innerHTML = `<span>${escapeHtml(category.name)}</span>` +
      `<span class="cat-count" id="count-${category.id}">${escapeHtml(TEXT.resultCount(count, category.items.length))}</span>`;
    section.appendChild(heading);

    const columns = document.createElement('div');
    columns.className = 'column-head';
    columns.innerHTML = TEXT.columns.map(label => `<span>${escapeHtml(label)}</span>`).join('');
    section.appendChild(columns);

    category.items.forEach(item => section.appendChild(biomarkerRow(item)));
    root.appendChild(section);
  });
}

function biomarkerRow(item) {
  const row = document.createElement('div');
  row.className = 'biomarker';
  row.id = `row-${item.id}`;

  const group = document.createElement('div');
  group.className = 'opts';
  group.setAttribute('role', 'radiogroup');
  group.setAttribute('aria-label', TEXT.resultFor(item.name));
  CODES.forEach(code => {
    const inputId = `${item.id}-${code}`;
    const label = document.createElement('label');
    label.htmlFor = inputId;
    label.title = CODE_LABEL[code];
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = item.id;
    input.id = inputId;
    input.value = code;
    input.checked = codeOf(item.id) === code;
    input.addEventListener('change', () => setAnswer(item.id, code));
    const face = document.createElement('span');
    face.className = 'opt';
    face.textContent = CODE_DISPLAY[code];
    face.setAttribute('aria-hidden', 'true');
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = CODE_LABEL[code];
    label.append(input, face, sr);
    group.appendChild(label);
  });
  row.appendChild(group);

  const studyCell = document.createElement('div');
  studyCell.className = 'study-cell';
  const study = document.createElement('span');
  study.id = `study-${item.id}`;
  study.className = 'study-result';
  const studyDirection = item.expected === 'P' ? 'H' : item.expected;
  study.textContent = studyDirection ? `[${STUDY_DISPLAY[studyDirection] || studyDirection}]` : '—';
  study.title = TEXT.studyDirection(studyDirection ? (STUDY_DISPLAY[studyDirection] || studyDirection) : '');
  studyCell.appendChild(study);
  row.appendChild(studyCell);

  const name = document.createElement('div');
  name.className = 'biomarker-name';
  const labelHtml = item.url
    ? `<a class="definition-link" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(TEXT.openDefinition)}">${escapeHtml(item.name)}</a>`
    : escapeHtml(item.name);
  name.innerHTML = `<p>${labelHtml}</p>`;
  row.appendChild(name);

  const dateCell = document.createElement('div');
  dateCell.className = 'date-cell';
  const date = document.createElement('input');
  date.type = 'text';
  date.className = 'result-date';
  date.id = `date-${item.id}`;
  date.value = dateOf(item.id);
  date.maxLength = 10;
  date.inputMode = 'numeric';
  date.autocomplete = 'off';
  date.placeholder = TEXT.datePlaceholder;
  date.setAttribute('aria-label', TEXT.resultDateFor(item.name));
  date.setAttribute('aria-describedby', `date-help-${item.id}`);
  date.addEventListener('input', event => setResultDate(item.id, event.target.value));
  date.addEventListener('blur', event => {
    event.target.value = event.target.value.trim();
    setResultDate(item.id, event.target.value);
  });
  const help = document.createElement('p');
  help.className = 'date-help';
  help.id = `date-help-${item.id}`;
  help.textContent = TEXT.dateRequired;
  dateCell.append(date, help);
  row.appendChild(dateCell);

  updateRow(item);
  return row;
}

function setAnswer(id, code) {
  if (code === 'N') {
    delete state.answers[id];
    delete state.dates[id];
    if (pendingId === id) pendingId = '';
  } else {
    state.answers[id] = code;
    if (!validResultDate(dateOf(id))) pendingId = id;
  }
  save();
  refreshAll();
  if (pendingId === id) {
    const date = document.getElementById(`date-${id}`);
    date.focus({ preventScroll: true });
    document.getElementById(`row-${id}`).scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    maybeAutofillCompletionDate();
  }
}

function setResultDate(id, value) {
  if (codeOf(id) === 'N') return;
  state.dates[id] = value;
  if (validResultDate(value)) {
    if (pendingId === id) pendingId = '';
    maybeAutofillCompletionDate();
  } else {
    pendingId = id;
  }
  save();
  refreshAll();
}

function updateRow(item) {
  const row = document.getElementById(`row-${item.id}`);
  if (!row) return;
  const code = codeOf(item.id);
  const reported = isReported(item.id);
  const needsDate = code !== 'N' && !reported;
  const locked = Boolean(pendingId && pendingId !== item.id);
  row.classList.toggle('is-reported', reported);
  row.classList.toggle('needs-date', needsDate);
  row.classList.toggle('is-locked', locked);

  row.querySelectorAll('.opts input').forEach(input => {
    input.disabled = locked;
    input.checked = input.value === code;
  });
  const date = document.getElementById(`date-${item.id}`);
  date.disabled = code === 'N' || locked;
  date.required = code !== 'N';
  date.setAttribute('aria-invalid', needsDate ? 'true' : 'false');
  if (date.value !== dateOf(item.id)) date.value = dateOf(item.id);

  const study = document.getElementById(`study-${item.id}`);
  study.classList.toggle('match', reported && isMatch(item));
  study.classList.toggle('mismatch', reported && !isMatch(item));
}

function refreshAll() {
  allItems().forEach(updateRow);
  refreshPendingAlert();
  refreshDashboard();
}

function refreshPendingAlert() {
  const alertBox = document.getElementById('pending-alert');
  alertBox.hidden = !pendingId;
  if (!pendingId) return;
  const item = itemById(pendingId);
  document.getElementById('pending-name').textContent = item ? item.name : '';
}

function refreshDashboard() {
  const total = summarize(allItems());
  const incomplete = allItems().filter(item => codeOf(item.id) !== 'N' && !isReported(item.id)).length;
  document.getElementById('kpi-reported').textContent = `${total.reportedPct}%`;
  document.getElementById('kpi-not-tested').textContent = total.notTested;
  document.getElementById('kpi-reference').textContent = `${total.referencePct}%`;
  document.getElementById('kpi-abnormal').textContent = `${total.abnormalPct}%`;
  document.getElementById('kpi-match').textContent = `${total.matchingPct}%`;
  document.getElementById('kpi-dates').textContent = incomplete;
  document.querySelector('.kpi-attention').classList.toggle('has-pending', incomplete > 0);
  document.getElementById('progress').textContent =
    TEXT.progress(total.reported, total.total, total.notTested);

  const body = document.getElementById('dash-rows');
  body.replaceChildren();
  body.appendChild(summaryRow(TEXT.allBiomarkers, total, true));
  DATA.categories.forEach(category => {
    const summary = summarize(category.items);
    body.appendChild(summaryRow(category.name, summary));
    const count = document.getElementById(`count-${category.id}`);
    if (count) count.textContent = TEXT.resultCount(summary.reported, summary.total);
  });
}

function summaryRow(name, summary, total = false) {
  const row = document.createElement('tr');
  if (total) row.className = 'total-row';
  row.innerHTML = `<th scope="row">${escapeHtml(name)}</th>` +
    `<td>${summary.total}</td>` +
    `<td>${summary.notTested}</td>` +
    `<td>${summary.reported}</td>` +
    `<td>${summary.referencePct}%</td>` +
    `<td>${summary.abnormalPct}%</td>` +
    `<td>${summary.matchingPct}%</td>`;
  return row;
}

function bindPatientFields() {
  const map = {
    'patient-id': 'id',
    'sex': 'sex',
    'age-years': 'ageYears',
    'age-months': 'ageMonths',
    'date-completed': 'dateCompleted'
  };
  Object.entries(map).forEach(([elementId, key]) => {
    const element = document.getElementById(elementId);
    element.value = state.patient[key] || '';
    element.addEventListener('input', () => {
      state.patient[key] = element.value;
      save();
    });
  });
}

function maybeAutofillCompletionDate() {
  const input = document.getElementById('date-completed');
  if (!input || input.value || !allItems().some(item => isReported(item.id))) return;
  input.value = todayISO();
  state.patient.dateCompleted = input.value;
  save();
}

function todayISO() {
  const now = new Date();
  const pad = number => String(number).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function focusPendingDate(message) {
  if (!pendingId) return false;
  const item = itemById(pendingId);
  alert(message || TEXT.enterValidDate(item ? item.name : TEXT.thisBiomarker));
  const date = document.getElementById(`date-${pendingId}`);
  date.focus();
  date.scrollIntoView({ behavior: 'smooth', block: 'center' });
  return true;
}

function printReport(color) {
  if (focusPendingDate(TEXT.completeDateBeforePrint)) return;
  document.body.classList.toggle('print-color', Boolean(color));
  window.print();
}

function clearAll() {
  if (!confirm(TEXT.clearConfirmation)) return;
  try { localStorage.removeItem(STORAGE_KEY); } catch (error) { /* no-op */ }
  state = blankState();
  pendingId = '';
  document.querySelectorAll('.result-date').forEach(input => { input.value = ''; });
  ['patient-id', 'sex', 'age-years', 'age-months', 'date-completed'].forEach(id => {
    document.getElementById(id).value = '';
  });
  refreshAll();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

async function init() {
  state = load();
  save();
  try {
    const response = await fetch(CONFIG.dataPath || 'data/list.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    DATA = await response.json();
    DATA.categories.forEach(category => {
      if (CONFIG.categoryNames && CONFIG.categoryNames[category.id]) {
        category.name = CONFIG.categoryNames[category.id];
      }
      category.items.forEach(item => {
        if (CONFIG.itemNames && CONFIG.itemNames[item.id]) item.name = CONFIG.itemNames[item.id];
      });
    });
  } catch (error) {
    document.getElementById('categories').innerHTML =
      `<p class="card">${escapeHtml(TEXT.loadError)}</p>`;
    return;
  }

  document.getElementById('version').textContent = DATA.version || '';
  const incomplete = allItems().find(item => codeOf(item.id) !== 'N' && !isReported(item.id));
  pendingId = incomplete ? incomplete.id : '';
  buildChecklist();
  bindPatientFields();
  refreshAll();

  document.getElementById('btn-print-bw').addEventListener('click', () => printReport(false));
  document.getElementById('btn-print-color').addEventListener('click', () => printReport(true));
  document.getElementById('btn-clear').addEventListener('click', clearAll);
  window.addEventListener('afterprint', () => document.body.classList.remove('print-color'));
}

document.addEventListener('DOMContentLoaded', init);
