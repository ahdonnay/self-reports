# DACSS website

A static, client-side self-assessment tool for **DACSS** (Disorders Associated with
Chemical Sensitivity in Some), part of ACCEPTT. A patient works through the checklist,
the dashboard rolls up live, and they print/save a PDF to share with a clinician.

No accounts, no backend, no external scripts or fonts. Answers are stored only in the
patient's own browser (`localStorage`).

## Run locally

Because the app fetches `data/list.json`, open it through a local web server rather than
double-clicking `index.html` (browsers block `fetch` from `file://`):

```bash
cd self-reports
python3 -m http.server 8000
# then open http://localhost:8000/MCS/MCSdx/
```

## Deploy

The app is deployed with the rest of the repository through GitHub Pages. No build
step is required. Its public address is:

`https://ahdonnay.github.io/self-reports/MCS/MCSdx/`

## Update the disorder list

When Albert edits the **DACSS LIST** tab in `dacss.xlsx`:

```bash
python3 tools/export-sheet.py ../dacss.xlsx   # regenerates data/list.json
```

Then diff `data/list.json` to review adds/removes/renames before committing (this keeps
patients' saved answers matched to the right item — see the note in `tools/export-sheet.py`).

## Files

```
index.html          # single-page app: instructions, patient info, dashboard, checklist, actions
css/styles.css      # screen + print styles (print puts the dashboard on top; B&W by default)
js/app.js           # state, localStorage, rollup engine (ports of the sheet's COUNTIF logic)
data/list.json      # embedded snapshot of the 92 disorders in 8 categories
tools/export-sheet.py  # regenerate list.json from the workbook
```

## Data model

Each disorder is answered with one status code (default **N**):

| Code | Meaning |
|------|---------|
| N | Never / not known |
| P | Past (had it, not now) |
| A | Always (as long as they can remember) |
| C | Current but not always |

Dashboard percentages are **percent of total disorders** (per Albert). "Load with age" =
%Current − %Past.
