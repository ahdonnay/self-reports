'use strict';

(() => {
  const app = document.currentScript.dataset.app;
  const version = '2026.10.14.a';
  fetch(`../${app}/index.html?v=${version}`, { cache: 'no-store' })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    })
    .then(html => {
      html = html
        .replace(/<html lang="[^"]+">/, '<html lang="ko-KR">')
        .replace(/href="css\/styles\.css(?:\?[^\"]*)?"/, `href="../${app}/css/styles.css?v=${version}"`)
        .replace(/<script src="js\/app\.js[^>]*><\/script>/,
          `<script src="js/i18n.js?v=${version}"><\/script>` +
          `<script src="js/static.js?v=${version}"><\/script>` +
          `<script src="../${app}/js/app.js?v=${version}"><\/script>`)
        .replace(/<script src="\.\.\/license\.js[^>]*><\/script>/,
          `<script src="../license.js?v=${version}"><\/script>`);
      document.open();
      document.write(html);
      document.close();
    })
    .catch(() => {
      document.body.innerHTML = '<main lang="ko"><h1>페이지를 불러올 수 없습니다.</h1><p>온라인 주소에서 다시 열어 주십시오.</p></main>';
    });
})();
