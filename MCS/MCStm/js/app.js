/* TRACTSS — treatment status, stopping reasons, dashboard, persistence, and printing. */
'use strict';

const STORAGE_KEY = 'mcstm.v1';
const CODES = ['N', 'R', 'A', 'C'];
const CODE_LABEL = {
  N: 'Never tried or no memory',
  R: 'Would retry',
  A: 'Would avoid',
  C: 'Currently take or use'
};

let DATA = null;
let state = null;
let pendingId = '';

function blankState() {
  return {
    schema: 1,
    report: 'TRACTSS',
    answers: {},
    reasons: {},
    patient: { id: '', sex: '', ageYears: '', ageMonths: '', dateCompleted: '' }
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return blankState();
    const parsed = JSON.parse(raw);
    return {
      ...blankState(),
      ...parsed,
      schema: 1,
      answers: parsed.answers && typeof parsed.answers === 'object' ? parsed.answers : {},
      reasons: parsed.reasons && typeof parsed.reasons === 'object' ? parsed.reasons : {},
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
function validReasonCodes() { return DATA.reasons.map(reason => reason.code); }
function reasonsOf(id) {
  const selected = Array.isArray(state.reasons[id]) ? state.reasons[id] : [];
  return selected.filter(code => validReasonCodes().includes(code));
}
function needsReasons(id) { return ['R', 'A'].includes(codeOf(id)) && reasonsOf(id).length === 0; }
function isReported(id) { return codeOf(id) === 'C' || (['R', 'A'].includes(codeOf(id)) && !needsReasons(id)); }
function firstIncompleteId() {
  const item = allItems().find(candidate => needsReasons(candidate.id));
  return item ? item.id : '';
}
function pct(number, total) { return total ? Math.round(number / total * 100) : 0; }

function summarize(items) {
  const reportedItems = items.filter(item => isReported(item.id));
  const reported = reportedItems.length;
  const retry = reportedItems.filter(item => codeOf(item.id) === 'R').length;
  const avoid = reportedItems.filter(item => codeOf(item.id) === 'A').length;
  const current = reportedItems.filter(item => codeOf(item.id) === 'C').length;
  const never = items.filter(item => codeOf(item.id) === 'N').length;
  const reasonsNeeded = items.filter(item => needsReasons(item.id)).length;
  return {
    total: items.length,
    reported,
    never,
    retry,
    avoid,
    current,
    reasonsNeeded,
    reportedPct: pct(reported, items.length),
    retryPct: pct(retry, reported),
    avoidPct: pct(avoid, reported),
    currentPct: pct(current, reported)
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
      `<span class="cat-count" id="count-${category.id}">${count} of ${category.items.length} treatments entered</span>`;
    section.appendChild(heading);

    const columns = document.createElement('div');
    columns.className = 'column-head';
    columns.innerHTML = '<span>Status</span><span>Treatment</span><span>Reason(s) stopped — required for R or A</span>';
    section.appendChild(columns);

    category.items.forEach(item => section.appendChild(treatmentRow(item)));
    root.appendChild(section);
  });
}

function treatmentRow(item) {
  const row = document.createElement('div');
  row.className = 'treatment';
  row.id = `row-${item.id}`;

  const group = document.createElement('div');
  group.className = 'opts';
  group.setAttribute('role', 'radiogroup');
  group.setAttribute('aria-label', `Status for ${item.name}`);
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
    face.textContent = code;
    face.setAttribute('aria-hidden', 'true');
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = CODE_LABEL[code];
    label.append(input, face, sr);
    group.appendChild(label);
  });
  row.appendChild(group);

  const name = document.createElement('div');
  name.className = 'treatment-name';
  const labelHtml = item.url
    ? `<a class="definition-link" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" title="Open reference in a new tab">${escapeHtml(item.name)}</a>`
    : escapeHtml(item.name);
  name.innerHTML = `<p>${labelHtml}</p>`;
  row.appendChild(name);

  const reasonCell = document.createElement('fieldset');
  reasonCell.className = 'reason-cell';
  reasonCell.id = `reasons-${item.id}`;
  const reasonLegend = document.createElement('legend');
  reasonLegend.className = 'sr-only';
  reasonLegend.textContent = `Reasons for stopping ${item.name}`;
  reasonCell.appendChild(reasonLegend);

  const reasonOptions = document.createElement('div');
  reasonOptions.className = 'reason-options';
  DATA.reasons.forEach(reason => {
    const reasonId = `${item.id}-reason-${reason.code.replace(/[^a-z0-9]/gi, 'money')}`;
    const label = document.createElement('label');
    label.htmlFor = reasonId;
    label.title = reason.label;
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = reasonId;
    input.value = reason.code;
    input.checked = reasonsOf(item.id).includes(reason.code);
    input.addEventListener('change', () => setReason(item.id, reason.code, input.checked));
    const code = document.createElement('span');
    code.className = 'reason-button';
    code.textContent = reason.code;
    const text = document.createElement('span');
    text.className = 'reason-label';
    text.textContent = reason.label;
    label.append(input, code, text);
    reasonOptions.appendChild(label);
  });
  reasonCell.appendChild(reasonOptions);
  row.appendChild(reasonCell);

  updateRow(item);
  return row;
}

function setAnswer(id, code) {
  const prior = codeOf(id);
  if (code === 'N') {
    delete state.answers[id];
    delete state.reasons[id];
  } else {
    state.answers[id] = code;
    if (code === 'C' || prior === 'N' || prior === 'C') delete state.reasons[id];
  }
  pendingId = firstIncompleteId();
  save();
  refreshAll();
  if (pendingId === id) {
    const firstReason = document.querySelector(`#reasons-${CSS.escape(id)} input`);
    if (firstReason) firstReason.focus({ preventScroll: true });
    document.getElementById(`row-${id}`).scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    maybeAutofillCompletionDate();
  }
}

function setReason(id, reasonCode, checked) {
  if (!['R', 'A'].includes(codeOf(id))) return;
  const selected = new Set(reasonsOf(id));
  if (checked) selected.add(reasonCode);
  else selected.delete(reasonCode);
  if (selected.size) state.reasons[id] = Array.from(selected);
  else delete state.reasons[id];
  pendingId = firstIncompleteId();
  save();
  refreshAll();
  if (pendingId === id) return;
  maybeAutofillCompletionDate();
}

function updateRow(item) {
  const row = document.getElementById(`row-${item.id}`);
  if (!row) return;
  const code = codeOf(item.id);
  const reported = isReported(item.id);
  const needs = needsReasons(item.id);
  const showReasons = ['R', 'A'].includes(code);
  const locked = Boolean(pendingId && pendingId !== item.id);
  row.classList.toggle('is-reported', reported);
  row.classList.toggle('show-reasons', showReasons);
  row.classList.toggle('needs-reasons', needs);
  row.classList.toggle('is-locked', locked);

  row.querySelectorAll('.opts input').forEach(input => {
    input.disabled = locked;
    input.checked = input.value === code;
  });
  row.querySelectorAll('.reason-cell input').forEach(input => {
    input.disabled = !showReasons || locked;
    input.checked = reasonsOf(item.id).includes(input.value);
    input.setAttribute('aria-invalid', needs ? 'true' : 'false');
  });
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
  document.getElementById('kpi-reported').textContent = `${total.reportedPct}%`;
  document.getElementById('kpi-never').textContent = total.never;
  document.getElementById('kpi-retry').textContent = `${total.retryPct}%`;
  document.getElementById('kpi-avoid').textContent = `${total.avoidPct}%`;
  document.getElementById('kpi-current').textContent = `${total.currentPct}%`;
  document.getElementById('kpi-reasons-needed').textContent = total.reasonsNeeded;
  document.querySelector('.kpi-attention').classList.toggle('has-pending', total.reasonsNeeded > 0);
  const pendingText = total.reasonsNeeded ? `; ${total.reasonsNeeded} need stopping reasons` : '';
  document.getElementById('progress').textContent =
    `${total.reported} of ${total.total} treatments entered; ${total.never} remain N${pendingText}.`;

  const body = document.getElementById('dash-rows');
  body.replaceChildren();
  body.appendChild(summaryRow('All treatments', total, true));
  DATA.categories.forEach(category => {
    const summary = summarize(category.items);
    body.appendChild(summaryRow(category.name, summary));
    const count = document.getElementById(`count-${category.id}`);
    if (count) count.textContent = `${summary.reported} of ${summary.total} treatments entered`;
  });

  const stoppedItems = allItems().filter(item => isReported(item.id) && ['R', 'A'].includes(codeOf(item.id)));
  const reasonBody = document.getElementById('reason-rows');
  reasonBody.replaceChildren();
  DATA.reasons.forEach(reason => {
    const count = stoppedItems.filter(item => reasonsOf(item.id).includes(reason.code)).length;
    const row = document.createElement('tr');
    row.innerHTML = `<th scope="row"><span class="reason-code">${escapeHtml(reason.code)}</span> ${escapeHtml(reason.label)}</th>` +
      `<td>${count}</td><td>${pct(count, stoppedItems.length)}%</td>`;
    reasonBody.appendChild(row);
  });
}

function summaryRow(name, summary, total = false) {
  const row = document.createElement('tr');
  if (total) row.className = 'total-row';
  row.innerHTML = `<th scope="row">${escapeHtml(name)}</th>` +
    `<td>${summary.total}</td>` +
    `<td>${summary.never}</td>` +
    `<td>${summary.reported}</td>` +
    `<td>${summary.retryPct}%</td>` +
    `<td>${summary.avoidPct}%</td>` +
    `<td>${summary.currentPct}%</td>`;
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

function focusPendingReasons(message) {
  if (!pendingId) return false;
  const item = itemById(pendingId);
  alert(message || `Select at least one reason for stopping ${item ? item.name : 'this treatment'} before continuing.`);
  const firstReason = document.querySelector(`#reasons-${CSS.escape(pendingId)} input`);
  if (firstReason) firstReason.focus();
  document.getElementById(`row-${pendingId}`).scrollIntoView({ behavior: 'smooth', block: 'center' });
  return true;
}

function printReport(color) {
  if (focusPendingReasons('Complete the highlighted stopping reason before printing or saving the report.')) return;
  document.body.classList.toggle('print-color', Boolean(color));
  window.print();
}

function clearAll() {
  if (!confirm('Clear all TRACTSS answers, reasons, and personal details from this device? This cannot be undone.')) return;
  try { localStorage.removeItem(STORAGE_KEY); } catch (error) { /* no-op */ }
  state = blankState();
  pendingId = '';
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
  try {
    const response = await fetch('data/list.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    DATA = await response.json();
  } catch (error) {
    document.getElementById('categories').innerHTML =
      '<p class="card">Could not load the treatment list. Open this app through its web address or a local web server.</p>';
    return;
  }

  document.getElementById('version').textContent = DATA.version || '';
  pendingId = firstIncompleteId();
  buildChecklist();
  bindPatientFields();
  refreshAll();
  save();

  document.getElementById('btn-print-bw').addEventListener('click', () => printReport(false));
  document.getElementById('btn-print-color').addEventListener('click', () => printReport(true));
  document.getElementById('btn-clear').addEventListener('click', clearAll);
  window.addEventListener('afterprint', () => document.body.classList.remove('print-color'));
}

document.addEventListener('DOMContentLoaded', init);
