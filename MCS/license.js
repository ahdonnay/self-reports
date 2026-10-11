'use strict';

(() => {
  const translations = {
    en: {
      scope: 'Except where otherwise noted, original educational content and data are licensed under',
      questions: 'Questions'
    },
    fr: {
      scope: 'Sauf indication contraire, le contenu éducatif original et les données sont mis à disposition selon les termes de la licence',
      questions: 'Questions'
    },
    es: {
      scope: 'Salvo que se indique lo contrario, el contenido educativo original y los datos se ofrecen bajo la licencia',
      questions: 'Preguntas'
    },
    it: {
      scope: 'Salvo diversa indicazione, i contenuti educativi originali e i dati sono disponibili con licenza',
      questions: 'Domande'
    },
    de: {
      scope: 'Sofern nicht anders angegeben, stehen die ursprünglichen Bildungsinhalte und Daten unter der Lizenz',
      questions: 'Fragen'
    },
    da: {
      scope: 'Medmindre andet er angivet, er det oprindelige undervisningsindhold og data licenseret under',
      questions: 'Spørgsmål'
    },
    ja: {
      scope: '特に記載がない限り、独自の教育コンテンツおよびデータは次のライセンスで提供されます：',
      questions: 'お問い合わせ'
    }
  };

  const language = (document.documentElement.lang || 'en').split('-')[0];
  const text = translations[language] || translations.en;
  const content = `
    <p class="service-line">A Public Service of MCS Referral &amp; Resources</p>
    <p class="license-note">© 2026 Albert Donnay. ${text.scope}
      <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="license noopener noreferrer">CC BY-NC 4.0</a>.
      ${text.questions}: <a href="mailto:Albert@DonnayDetox.com">Albert@DonnayDetox.com</a></p>`;

  const existing = document.querySelector('.site-footer .wrap');
  if (existing) {
    existing.innerHTML = content;
    return;
  }

  const footer = document.createElement('footer');
  footer.className = 'suite-license';
  footer.innerHTML = content;
  document.body.appendChild(footer);
})();
