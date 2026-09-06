# BAACSS

BAACSS is the **Biomarker Abnormalities Associated with Chemical Sensitivity in Some** self-report.

Open the published app at:

<https://ahdonnay.github.io/self-reports/MCS/MCSbm/>

The app is static HTML, CSS, JavaScript, and JSON. It sends no responses to a server. BAACSS progress is stored
locally under the browser key `mcsbm.v1`, separately from DACSS.

For local testing from the repository root:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000/MCS/MCSbm/>.
