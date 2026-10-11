'use strict';

(() => {
  const q = selector => document.querySelector(selector);
  const set = (selector, text) => { const el = q(selector); if (el) el.textContent = text; };
  const setAll = (selector, texts) => document.querySelectorAll(selector).forEach((el, i) => { if (texts[i] !== undefined) el.textContent = texts[i]; });

  document.title = 'DACSS — 化学物質過敏症に関連する疾患';
  set('.suite-link', '← MCSの病歴');
  set('.subtitle', '化学物質過敏症に関連する疾患');
  q('.instructions').innerHTML = `
    <h2 id="instr-h">このチェックリストについて</h2>
    <p>DACSSは、化学物質過敏症に関連する医学的疾患のチェックリストです。これらの疾患があるからといって、必ずしもMCSであるとは限りません。しかし、これらの疾患がある人はMCSを有する可能性が高く、MCSの人もこれらの疾患を有する可能性が高いと報告されています。過去、幼少期から継続、または現在の疾患を記録し、臨床医が病歴を把握できるようにします。文献情報は<a href="mailto:Albert@DonnayDetox.com">Albert@DonnayDetox.com</a>までお問い合わせください。</p>
    <p><strong>注：</strong>項目は英語の原名のアルファベット順に掲載されています。</p>
    <h3>回答方法</h3><p>各疾患について1つ選択してください。</p>
    <ul class="legend"><li><span class="code code-N">未</span> <strong>未経験</strong> — 疾患を経験していない、または覚えていない</li><li><span class="code code-P">過</span> <strong>過去</strong> — 過去にあったが現在はない</li><li><span class="code code-A">常</span> <strong>常に</strong> — 幼少期から継続している</li><li><span class="code code-C">現</span> <strong>現在</strong> — 現在あるが、幼少期からではない</li></ul>
    <p>「未」以外を選んだ場合は、現在の影響を0～3で評価してください。</p>
    <ul class="impact-legend"><li><span class="impact-code">0</span> 重大な影響なし</li><li><span class="impact-code">1</span> 軽度の生活障害</li><li><span class="impact-code">2</span> 重度の生活障害があるが自立</li><li><span class="impact-code">3</span> 介助を必要とする生活障害</li></ul>
    <p>回答はこのブラウザに自動保存され、ダッシュボードも自動更新されます。所要時間の目安は約20分です。</p>
    <p class="note"><strong>重要：</strong>関連性は因果関係を意味しません。疾患はMCSの危険因子、結果、併存疾患、または偶然の併存である可能性があります。過去の疾患も臨床的に重要です。</p>
    <details class="privacy"><summary>プライバシーとデータ</summary><p>回答はこのウェブブラウザ内だけに保存され、サーバーには送信されません。共有端末では、終了後に<strong>回答を消去</strong>してください。別の端末へ移すには、ブラウザの印刷機能でPDFとして保存してください。</p></details>`;

  set('#who-h', 'あなたの情報'); set('label[for="patient-id"]', '氏名またはコードネーム');
  q('#patient-id').placeholder = '例：山田花子、または3語のコードネーム';
  set('.field-wide .hint', '臨床医が本人の回答と確認できる氏名、または匿名用のコードネームを入力してください。');
  set('label[for="sex"]', '出生時の性別'); q('#sex').innerHTML = '<option value="">—</option><option value="Female">女性</option><option value="Male">男性</option><option value="Intersex">インターセックス</option><option value="Prefer not to say">回答しない</option>';
  set('label[for="age-years"]', '年齢 — 歳'); q('#age-years').placeholder = '歳'; set('label[for="age-months"]', '年齢 — 月'); q('#age-months').placeholder = '月';
  set('label[for="date-completed"]', '完了日'); set('#date-completed + .hint', 'チェックリストの完了時に自動入力されます。変更もできます。');
  set('#dash-h', 'ダッシュボード'); setAll('.kpi-label', ['経験あり', '未経験', '常に', '過去', '現在', '年齢による変化']);
  q('.dash-foot').innerHTML = `割合は全<span id="total-count">92</span>疾患を分母として算出します。<span class="trend-note">「年齢による負荷」＝現在 − 過去（正は増加、負は減少を示します）。「常に」は含みません。</span><span class="trend-note">「平均影響」は各カテゴリーで入力した0～3の平均値です。— は未入力を示します。</span>`;
  setAll('.dash-table thead th', ['カテゴリー', '未経験', '過去', '常に', '現在', 'いずれか（過・常・現）', '平均影響']);
  set('#check-h', '疾患チェックリスト'); q('#pending-alert').innerHTML = '<strong>続行するには「現在の影響」の入力が必要です。</strong><span id="pending-name"></span><span class="impact-scale">0、1、2、3のいずれかを選択してください。</span>';
  set('#act-h', '完了'); set('.share-tip', 'レポートを共有するには、下のボタンでPDFとして保存し、医療機関へのメールに添付してください。');
  setAll('.actions button', ['白黒レポートを印刷（ダッシュボード付き）', 'カラーPDFとして保存', '回答を消去']);
  set('.actions .hint', '「PDFとして保存」はブラウザの印刷画面で選択できます。回答を消去すると、この端末のDACSSデータがすべて削除されます。');
  q('.site-footer p').innerHTML = '© 2018 Albert Donnay　ACCEPTT（化学物質への曝露・表現型・検査・治療の高度な情報伝達）の一部。お問い合わせ：<a href="mailto:Albert@DonnayDetox.com">Albert@DonnayDetox.com</a>';
})();
