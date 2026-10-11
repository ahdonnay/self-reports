'use strict';

(() => {
  const q = selector => document.querySelector(selector);
  const set = (selector, text) => { const el = q(selector); if (el) el.textContent = text; };
  const setAll = (selector, texts) => document.querySelectorAll(selector).forEach((el, i) => { if (texts[i] !== undefined) el.textContent = texts[i]; });
  document.title = 'TRACTSS — 化学物質・感覚過敏症の治療歴';
  set('.suite-link', '← MCSの病歴'); set('.subtitle', '化学物質・感覚過敏症の治療歴');
  q('.instructions').innerHTML = `
    <h2 id="instr-h">このチェックリストについて</h2>
    <p>TRACTSSは、化学物質またはその他の感覚過敏症に対して試した治療を記録します。各治療について、再試行したい、避けたい、現在使用中、または未経験／記憶なしを選び、臨床医に治療経験を簡潔に伝えることができます。文献情報は<a href="mailto:Albert@DonnayDetox.com">Albert@DonnayDetox.com</a>までお問い合わせください。</p>
    <p><strong>注：</strong>項目は英語の原名のアルファベット順に掲載されています。</p>
    <h3>回答方法</h3><p>各治療について1つ選択してください。</p>
    <ul class="legend"><li><span class="code code-N">未</span> <strong>未経験／記憶なし</strong></li><li><span class="code code-R">再</span> <strong>再試行</strong> — 試したことがあり、再び試したい</li><li><span class="code code-A">避</span> <strong>避ける</strong> — 試したことがあり、今後は避けたい</li><li><span class="code code-C">現</span> <strong>現在</strong> — 現在服用または使用している</li></ul>
    <p>「再」または「避」を選んだ場合は、続行する前に中止理由を1つ以上選択してください。回答とダッシュボードはこのブラウザに自動保存されます。</p>
    <h3>治療を中止した理由</h3><ul class="reason-legend"><li><span class="reason-code">eRx</span> 処方終了</li><li><span class="reason-code">$$$</span> 費用</li><li><span class="reason-code">MDa</span> 医師の助言</li><li><span class="reason-code">NLN</span> 不要になった</li><li><span class="reason-code">NLA</span> 利用できなくなった</li><li><span class="reason-code">NLE</span> 効果がなくなった</li><li><span class="reason-code">ROT</span> 他の治療に変更</li><li><span class="reason-code">sFx</span> 副作用</li></ul>
    <p class="clinical-note"><strong>重要：</strong>TRACTSSは経験と希望を記録するもので、治療の安全性や有効性を判定するものではありません。このチェックリストだけを根拠に治療を開始、中止、回避、再試行せず、変更は資格のある臨床医と相談してください。</p>
    <details class="privacy"><summary>プライバシーとデータ</summary><p>回答はこのウェブブラウザ内だけに保存され、サーバーには送信されません。共有端末では、終了後に<strong>回答を消去</strong>してください。別の端末へ移すには、ブラウザの印刷機能でPDFとして保存してください。</p></details>`;
  set('#who-h', 'あなたの情報'); set('label[for="patient-id"]', '氏名またはコードネーム'); q('#patient-id').placeholder = '例：山田花子、または3語のコードネーム'; set('.field-wide .hint', '臨床医が本人の回答と確認できる氏名、または匿名用のコードネームを入力してください。');
  set('label[for="sex"]', '出生時の性別'); q('#sex').innerHTML = '<option value="">—</option><option value="Female">女性</option><option value="Male">男性</option><option value="Intersex">インターセックス</option><option value="Prefer not to say">回答しない</option>';
  set('label[for="age-years"]', '年齢 — 歳'); q('#age-years').placeholder = '歳'; set('label[for="age-months"]', '年齢 — 月'); q('#age-months').placeholder = '月'; set('label[for="date-completed"]', '完了日'); set('#date-completed + .hint', '最初の治療を入力すると自動で設定されます。変更もできます。');
  set('#dash-h', 'ダッシュボード'); setAll('.kpi-label', ['試した治療', '未経験／記憶なし', '再試行', '避ける', '現在使用中', '理由未入力']);
  set('.dash-foot', '「試した治療」は再試行、避ける、現在使用中の合計です。各割合は試した治療を分母とします。「再」または「避」は中止理由の入力後に集計されます。');
  setAll('.dash-table:not(.reason-table) thead th', ['種類', '治療数', '未経験', '試した治療', '再試行', '避ける', '現在']);
  set('.reason-summary-h', '治療を中止した理由'); setAll('.reason-summary-h + .dash-foot', ['治療には複数の理由を選択できるため、割合の合計が100%を超える場合があります。']);
  setAll('.reason-table thead th', ['理由', '件数', '中止治療に占める割合']);
  set('#check-h', '治療チェックリスト'); q('#pending-alert').innerHTML = '<strong>続行する前に、中止理由を1つ以上選択してください。</strong><span id="pending-name"></span><span>強調表示された行に当てはまる理由を選んでください。</span>';
  set('#act-h', '完了'); set('.share-tip', 'レポートを共有するには、下のボタンでPDFとして保存し、医療機関へのメールに添付してください。'); setAll('.actions button', ['白黒レポートを印刷（ダッシュボード付き）', 'カラーPDFとして保存', '回答を消去']); set('.actions .hint', '「PDFとして保存」はブラウザの印刷画面で選択できます。回答を消去すると、この端末のTRACTSSデータがすべて削除されます。DACSSやBAACSSの回答は消去されません。');
  q('.site-footer p').innerHTML = '© 2018 Albert Donnay　ACCEPTT（化学物質への曝露・表現型・検査・治療の高度な情報伝達）の一部。お問い合わせ：<a href="mailto:Albert@DonnayDetox.com">Albert@DonnayDetox.com</a>';
})();
