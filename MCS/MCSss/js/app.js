/* CATSS — dual sensory-change responses, dashboard, persistence, custom stimuli, and printing. */
'use strict';

const STORAGE_KEY = 'mcsss.v1';
const CODES = ['N', 'U', 'D', 'M', 'W'];
const DIMENSIONS = ['awareness', 'tolerance'];
const CODE_LABEL = {
  N: 'No change noticed',
  U: 'Up',
  D: 'Down',
  M: 'Mixed: first abnormally up, then down',
  W: 'Reversed: first abnormally down, then up'
};

let DATA = null;
let state = null;

function blankState() {
  return {
    schema: 1,
    report: 'CATSS',
    awareness: {},
    tolerance: {},
    customNames: {},
    patient: {
      comparisonPoint: '',
      id: '',
      sex: '',
      ageYears: '',
      ageMonths: '',
      dateCompleted: ''
    }
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
      awareness: parsed.awareness && typeof parsed.awareness === 'object' ? parsed.awareness : {},
      tolerance: parsed.tolerance && typeof parsed.tolerance === 'object' ? parsed.tolerance : {},
      customNames: parsed.customNames && typeof parsed.customNames === 'object' ? parsed.customNames : {},
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
function itemName(item) {
  if (!item.custom) return item.name;
  return String(state.customNames[item.id] || '').trim();
}
function isActive(item) { return !item.custom || Boolean(itemName(item)); }
function activeItems(items = allItems()) { return items.filter(isActive); }
function codeOf(dimension, id) {
  const value = state[dimension] && state[dimension][id];
  return CODES.includes(value) ? value : 'N';
}
function hasChange(dimension, item) { return codeOf(dimension, item.id) !== 'N'; }

function countsFor(items, dimension) {
  const counts = Object.fromEntries(CODES.map(code => [code, 0]));
  activeItems(items).forEach(item => { counts[codeOf(dimension, item.id)] += 1; });
  return counts;
}

function summarize(items) {
  const active = activeItems(items);
  const awareness = countsFor(active, 'awareness');
  const tolerance = countsFor(active, 'tolerance');
  const any = active.filter(item => hasChange('awareness', item) || hasChange('tolerance', item)).length;
  const both = active.filter(item => hasChange('awareness', item) && hasChange('tolerance', item)).length;
  return {
    total: active.length,
    awareness,
    tolerance,
    awarenessChanged: active.length - awareness.N,
    toleranceChanged: active.length - tolerance.N,
    any,
    both
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
    heading.innerHTML = `<span>${escapeHtml(category.name)}</span><span class="cat-count" id="count-${category.id}"></span>`;
    section.appendChild(heading);

    const columns = document.createElement('div');
    columns.className = 'column-head';
    columns.innerHTML = '<span>Change in Awareness</span><span>Sensory stimulus</span><span>Change in Tolerance</span>';
    section.appendChild(columns);

    let previousGroup = '';
    category.items.forEach(item => {
      if (item.group && item.group !== previousGroup) {
        const subgroup = document.createElement('h4');
        subgroup.className = 'subgroup';
        subgroup.textContent = item.group;
        section.appendChild(subgroup);
        previousGroup = item.group;
      }
      section.appendChild(stimulusRow(item));
    });
    root.appendChild(section);
  });
}

function stimulusRow(item) {
  const row = document.createElement('div');
  row.className = 'stimulus';
  row.id = `row-${item.id}`;

  row.appendChild(optionGroup(item, 'awareness', 'Awareness'));

  const name = document.createElement('div');
  name.className = 'stimulus-name';
  const number = `<span class="item-number">${escapeHtml(item.number)}</span>`;
  if (item.custom) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'custom-name';
    input.id = `custom-${item.id}`;
    input.maxLength = 160;
    input.autocomplete = 'off';
    input.placeholder = 'Add another sensory stimulus';
    input.value = itemName(item);
    input.setAttribute('aria-label', `Name for additional sensory stimulus ${item.number}`);
    input.addEventListener('input', event => setCustomName(item, event.target.value));
    const printName = document.createElement('span');
    printName.className = 'custom-print-name';
    printName.id = `custom-print-${item.id}`;
    printName.textContent = itemName(item);
    name.innerHTML = number;
    name.append(input, printName);
  } else {
    name.innerHTML = `<p>${number}${escapeHtml(item.name)}</p>`;
  }
  row.appendChild(name);

  row.appendChild(optionGroup(item, 'tolerance', 'Tolerance'));
  updateRow(item);
  return row;
}

function optionGroup(item, dimension, labelText) {
  const group = document.createElement('div');
  group.className = `opts opts-${dimension}`;
  group.setAttribute('role', 'radiogroup');
  group.setAttribute('aria-label', `${labelText} change for ${itemName(item) || `additional sensory stimulus ${item.number}`}`);

  const mobileLabel = document.createElement('span');
  mobileLabel.className = 'mobile-label';
  mobileLabel.textContent = labelText;
  group.appendChild(mobileLabel);

  CODES.forEach(code => {
    const inputId = `${dimension}-${item.id}-${code}`;
    const label = document.createElement('label');
    label.htmlFor = inputId;
    label.title = CODE_LABEL[code];
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = `${dimension}-${item.id}`;
    input.id = inputId;
    input.value = code;
    input.checked = codeOf(dimension, item.id) === code;
    input.addEventListener('change', () => setAnswer(dimension, item, code));
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
  return group;
}

function setAnswer(dimension, item, code) {
  if (item.custom && !itemName(item)) return;
  if (code === 'N') delete state[dimension][item.id];
  else state[dimension][item.id] = code;
  maybeAutofillCompletionDate();
  save();
  updateRow(item);
  refreshDashboard();
}

function setCustomName(item, value) {
  const trimmed = value.trim();
  if (trimmed) state.customNames[item.id] = value;
  else {
    delete state.customNames[item.id];
    delete state.awareness[item.id];
    delete state.tolerance[item.id];
  }
  save();
  const printName = document.getElementById(`custom-print-${item.id}`);
  if (printName) printName.textContent = trimmed;
  updateRow(item);
  refreshDashboard();
}

function updateRow(item) {
  const row = document.getElementById(`row-${item.id}`);
  if (!row) return;
  const active = isActive(item);
  const changed = active && (hasChange('awareness', item) || hasChange('tolerance', item));
  row.classList.toggle('is-unused-custom', item.custom && !active);
  row.classList.toggle('has-change', changed);

  DIMENSIONS.forEach(dimension => {
    const group = row.querySelector(`.opts-${dimension}`);
    group.setAttribute('aria-label', `${dimension === 'awareness' ? 'Awareness' : 'Tolerance'} change for ${itemName(item) || `additional sensory stimulus ${item.number}`}`);
    group.querySelectorAll('input').forEach(input => {
      input.disabled = item.custom && !active;
      input.checked = input.value === codeOf(dimension, item.id);
    });
  });
}

function refreshDashboard() {
  const total = summarize(allItems());
  const customCount = allItems().filter(item => item.custom && isActive(item)).length;
  document.getElementById('kpi-total').textContent = total.total;
  document.getElementById('kpi-any').textContent = total.any;
  document.getElementById('kpi-awareness').textContent = total.awarenessChanged;
  document.getElementById('kpi-tolerance').textContent = total.toleranceChanged;
  document.getElementById('kpi-both').textContent = total.both;
  document.getElementById('kpi-custom').textContent = customCount;

  const comparison = state.patient.comparisonPoint.trim();
  const changeText = total.any === 0
    ? `No changes selected among ${total.total} sensory stimuli.`
    : `${total.any} of ${total.total} stimuli have a change in Awareness, Tolerance, or both.`;
  document.getElementById('progress').textContent = `${changeText} Comparison point: ${comparison || 'not yet specified'}.`;

  const body = document.getElementById('dash-rows');
  body.replaceChildren();
  body.appendChild(summaryRow('All sensory stimuli', total, true));
  DATA.categories.forEach(category => {
    const summary = summarize(category.items);
    body.appendChild(summaryRow(category.name, summary));
    const count = document.getElementById(`count-${category.id}`);
    if (count) {
      count.textContent = `${summary.total} stimuli · A changed ${summary.awarenessChanged} · T changed ${summary.toleranceChanged}`;
    }
  });
}

function summaryRow(name, summary, total = false) {
  const row = document.createElement('tr');
  if (total) row.className = 'total-row';
  row.innerHTML = `<th scope="row">${escapeHtml(name)}</th><td>${summary.total}</td>` +
    CODES.map(code => `<td>${summary.awareness[code]}</td>`).join('') +
    CODES.map(code => `<td>${summary.tolerance[code]}</td>`).join('');
  return row;
}

function bindPatientFields() {
  const map = {
    'comparison-point': 'comparisonPoint',
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
      if (key === 'comparisonPoint') refreshDashboard();
    });
  });
}

function maybeAutofillCompletionDate() {
  const input = document.getElementById('date-completed');
  if (!input || input.value) return;
  input.value = todayISO();
  state.patient.dateCompleted = input.value;
}

function todayISO() {
  const now = new Date();
  const pad = number => String(number).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function printReport(color) {
  const comparison = document.getElementById('comparison-point');
  if (!comparison.value.trim()) {
    alert('Enter the prior comparison date or event before printing or saving the report.');
    comparison.focus();
    comparison.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  document.body.classList.toggle('print-color', Boolean(color));
  window.print();
}

function clearAll() {
  if (!confirm('Clear all CATSS answers, added stimuli, and personal details from this device? This cannot be undone.')) return;
  try { localStorage.removeItem(STORAGE_KEY); } catch (error) { /* no-op */ }
  state = blankState();
  ['comparison-point', 'patient-id', 'sex', 'age-years', 'age-months', 'date-completed'].forEach(id => {
    document.getElementById(id).value = '';
  });
  buildChecklist();
  refreshDashboard();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

async function init() {
  state = load();
  save();
  try {
    const response = await fetch('data/list.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    DATA = await response.json();
  } catch (error) {
    document.getElementById('categories').innerHTML =
      '<p class="card">Could not load the sensory stimulus list. Open this app through its web address or a local web server.</p>';
    return;
  }

  document.getElementById('version').textContent = DATA.version || '';
  buildChecklist();
  bindPatientFields();
  refreshDashboard();

  document.getElementById('btn-print-bw').addEventListener('click', () => printReport(false));
  document.getElementById('btn-print-color').addEventListener('click', () => printReport(true));
  document.getElementById('btn-clear').addEventListener('click', clearAll);
  window.addEventListener('afterprint', () => document.body.classList.remove('print-color'));
}

document.addEventListener('DOMContentLoaded', init);
