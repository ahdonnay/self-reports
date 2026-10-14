'use strict';

window.renderCATSSPage = function renderCATSSPage() {
  const p = window.CATSS_CONFIG.page;
  document.documentElement.lang = window.CATSS_CONFIG.locale;
  document.title = `CATSS — ${p.subtitle}`;
  document.body.innerHTML = `
    <header class="site-header" role="banner">
      <div class="wrap">
        <a class="suite-link no-print" href="../">&larr; ${p.suiteLink}</a>
        <h1>CATSS</h1>
        <p class="subtitle">${p.subtitle}</p>
        <p class="version" id="version">v.2026.10.13.i</p>
      </div>
    </header>
    <main class="wrap" id="main">
      <section class="card instructions" aria-labelledby="instr-h">
        <h2 id="instr-h">${p.aboutTitle}</h2>
        <p>${p.about}</p>
        <h3>${p.howTitle}</h3>
        <p>${p.chooseOne}</p>
        <ul class="legend">
          ${p.legend.map(entry => `<li><span class="code code-${entry.code}">${entry.code}</span> <strong>${entry.label}</strong>${entry.explanation ? ` = ${entry.explanation}` : ''}</li>`).join('')}
        </ul>
        <p>${p.defaults}</p>
        <p class="note"><strong>${p.distinctionLabel}</strong> ${p.distinction}</p>
        <p class="clinical-note"><strong>${p.clinicalLabel}</strong> ${p.clinical}</p>
        <details class="privacy">
          <summary>${p.privacyTitle}</summary>
          <p>${p.privacy}</p>
        </details>
      </section>
      <section class="card" aria-labelledby="who-h">
        <h2 id="who-h">${p.infoTitle}</h2>
        <div class="fields">
          <div class="field field-wide comparison-field">
            <label for="comparison-point">${p.comparisonLabel}</label>
            <input type="text" id="comparison-point" maxlength="120" autocomplete="off" placeholder="${p.comparisonPlaceholder}">
            <p class="hint">${p.comparisonHint}</p>
          </div>
          <div class="field field-wide">
            <label for="patient-id">${p.patientLabel}</label>
            <input type="text" id="patient-id" maxlength="60" autocomplete="off" placeholder="${p.patientPlaceholder}">
            <p class="hint">${p.patientHint}</p>
          </div>
          <div class="field">
            <label for="sex">${p.sexLabel}</label>
            <select id="sex">
              <option value="">—</option>
              <option value="Female">${p.sexFemale}</option>
              <option value="Male">${p.sexMale}</option>
              <option value="Intersex">${p.sexIntersex}</option>
              <option value="Prefer not to say">${p.sexNoAnswer}</option>
            </select>
          </div>
          <div class="field field-narrow">
            <label for="age-years">${p.ageYearsLabel}</label>
            <input type="number" id="age-years" min="0" max="120" inputmode="numeric" placeholder="${p.yearsPlaceholder}">
          </div>
          <div class="field field-narrow">
            <label for="age-months">${p.ageMonthsLabel}</label>
            <input type="number" id="age-months" min="0" max="11" inputmode="numeric" placeholder="${p.monthsPlaceholder}">
          </div>
          <div class="field">
            <label for="date-completed">${p.dateLabel}</label>
            <input type="date" id="date-completed">
            <p class="hint">${p.dateHint}</p>
          </div>
        </div>
      </section>
      <section class="card dashboard" aria-labelledby="dash-h">
        <h2 id="dash-h">${p.dashboardTitle}</h2>
        <p class="dash-progress" id="progress" aria-live="polite"></p>
        <div class="kpis" role="group" aria-label="${p.overallSummary}">
          <div class="kpi"><span class="kpi-num" id="kpi-total">100</span><span class="kpi-label">${p.kpiTotal}</span></div>
          <div class="kpi"><span class="kpi-num" id="kpi-any">0</span><span class="kpi-label">${p.kpiAny}</span></div>
          <div class="kpi"><span class="kpi-num" id="kpi-awareness">0</span><span class="kpi-label">${p.kpiAwareness}</span></div>
          <div class="kpi"><span class="kpi-num" id="kpi-tolerance">0</span><span class="kpi-label">${p.kpiTolerance}</span></div>
          <div class="kpi"><span class="kpi-num" id="kpi-both">0</span><span class="kpi-label">${p.kpiBoth}</span></div>
          <div class="kpi"><span class="kpi-num" id="kpi-unchanged">100</span><span class="kpi-label">${p.kpiUnchanged}</span></div>
        </div>
        <p class="dash-foot">${p.dashFoot}</p>
        <div class="table-scroll" tabindex="0" aria-label="${p.tableAria}">
          <table class="dash-table" aria-live="polite">
            <caption class="sr-only">${p.tableCaption}</caption>
            <thead>
              <tr>
                <th scope="col" rowspan="2">${p.category}</th><th scope="col" rowspan="2">${p.stimuli}</th>
                <th class="dimension-head" scope="colgroup" colspan="5">${p.awareness}</th>
                <th class="dimension-head" scope="colgroup" colspan="5">${p.tolerance}</th>
              </tr>
              <tr>
                <th scope="col">N</th><th scope="col">Up</th><th scope="col">Dn</th><th scope="col">UD</th><th scope="col">DU</th>
                <th scope="col">N</th><th scope="col">Up</th><th scope="col">Dn</th><th scope="col">UD</th><th scope="col">DU</th>
              </tr>
            </thead>
            <tbody id="dash-rows"></tbody>
          </table>
        </div>
      </section>
      <section class="checklist" aria-labelledby="check-h">
        <h2 id="check-h" class="wrap-h">${p.checklistTitle}</h2>
        <p class="check-help wrap-h">${p.checklistHelp}</p>
        <div id="categories"></div>
      </section>
      <section class="card actions no-print" aria-labelledby="act-h">
        <h2 id="act-h">${p.finishTitle}</h2>
        <p class="share-tip">${p.shareTip}</p>
        <div class="buttons">
          <button type="button" id="btn-print-bw" class="btn btn-primary">${p.printBW}</button>
          <button type="button" id="btn-print-color" class="btn">${p.printColor}</button>
          <button type="button" id="btn-clear" class="btn btn-danger">${p.clear}</button>
        </div>
        <p class="hint">${p.finishHint}</p>
      </section>
    </main>
    <footer class="site-footer no-print"><div class="wrap"></div></footer>`;
};
