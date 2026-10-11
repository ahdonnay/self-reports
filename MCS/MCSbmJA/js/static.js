'use strict';

(() => {
  const q = selector => document.querySelector(selector);
  const set = (selector, text) => { const el = q(selector); if (el) el.textContent = text; };
  const setAll = (selector, texts) => document.querySelectorAll(selector).forEach((el, i) => { if (texts[i] !== undefined) el.textContent = texts[i]; });
  document.title = 'BAACSS — 化学物質過敏症に関連するバイオマーカー';
  set('.suite-link', '← MCSの病歴'); set('.subtitle', '化学物質過敏症に関連するバイオマーカー');
  q('.instructions').innerHTML = `
    <h2 id="instr-h">このチェックリストについて</h2>
    <p>BAACSSは、MCS研究で報告されたバイオマーカー検査を記録するためのチェックリストです。最新の検査結果と日付をまとめ、臨床医と共有できます。文献情報は<a href="mailto:Albert@DonnayDetox.com">Albert@DonnayDetox.com</a>までお問い合わせください。</p>
    <p><strong>注：</strong>項目は英語の原名のアルファベット順に掲載されています。</p>
    <h3>回答方法</h3><p>各バイオマーカーについて1つ選択してください。</p>
    <ul class="legend"><li><span class="code code-N">未</span> <strong>未検査／結果なし</strong></li><li><span class="code code-R">基</span> <strong>基準範囲内</strong></li><li><span class="code code-L">低</span> <strong>低値</strong></li><li><span class="code code-H">高</span> <strong>高値または陽性</strong></li></ul>
    <p>結果を選択した項目には、最新結果の日付を YYYY、YYYY.MM、または YYYY.MM.DD 形式で入力してください。「MCS研究」欄は、研究で報告された異常方向を示します。</p>
    <p class="clinical-note"><strong>重要：</strong>このチェックリストは診断を行うものではありません。検査の解釈や追加検査については、資格のある臨床医に相談してください。</p>
    <details class="privacy"><summary>プライバシーとデータ</summary><p>回答はこのウェブブラウザ内だけに保存され、サーバーには送信されません。共有端末では、終了後に<strong>回答を消去</strong>してください。別の端末へ移すには、ブラウザの印刷機能でPDFとして保存してください。</p></details>`;
  set('#who-h', 'あなたの情報'); set('label[for="patient-id"]', '氏名またはコードネーム'); q('#patient-id').placeholder = '例：山田花子、または3語のコードネーム'; set('.field-wide .hint', '臨床医が本人の回答と確認できる氏名、または匿名用のコードネームを入力してください。');
  set('label[for="sex"]', '出生時の性別'); q('#sex').innerHTML = '<option value="">—</option><option value="Female">女性</option><option value="Male">男性</option><option value="Intersex">インターセックス</option><option value="Prefer not to say">回答しない</option>';
  set('label[for="age-years"]', '年齢 — 歳'); q('#age-years').placeholder = '歳'; set('label[for="age-months"]', '年齢 — 月'); q('#age-months').placeholder = '月'; set('label[for="date-completed"]', '完了日'); set('#date-completed + .hint', '最初の結果を入力すると自動で設定されます。変更もできます。');
  set('#dash-h', 'ダッシュボード'); setAll('.kpi-label', ['結果入力済み', '未検査／結果なし', '基準範囲内', '低値', '高値／陽性']);
  setAll('.dash-table thead th', ['カテゴリー', '検査数', '結果入力済み', '未検査', '基準内', '低値', '高値／陽性']);
  set('#check-h', 'バイオマーカーチェックリスト'); q('#pending-alert').innerHTML = '<strong>続行するには結果の日付が必要です。</strong><span id="pending-name"></span><span>YYYY、YYYY.MM、またはYYYY.MM.DD形式で入力してください。</span>';
  set('#act-h', '完了'); set('.share-tip', 'レポートを共有するには、下のボタンでPDFとして保存し、医療機関へのメールに添付してください。'); setAll('.actions button', ['白黒レポートを印刷（ダッシュボード付き）', 'カラーPDFとして保存', '回答を消去']); set('.actions .hint', '「PDFとして保存」はブラウザの印刷画面で選択できます。回答を消去すると、この端末のBAACSSデータがすべて削除されます。');
  q('.site-footer p').innerHTML = '© 2018 Albert Donnay　ACCEPTT（化学物質への曝露・表現型・検査・治療の高度な情報伝達）の一部。お問い合わせ：<a href="mailto:Albert@DonnayDetox.com">Albert@DonnayDetox.com</a>';
})();
