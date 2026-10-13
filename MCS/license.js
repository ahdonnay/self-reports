'use strict';

(() => {
  const defaultVersion = 'v.2026.10.13.a';
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
    pt: {
      scope: 'Salvo indicação em contrário, os conteúdos educativos originais e os dados estão licenciados ao abrigo de',
      questions: 'Questões'
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
    sv: {
      scope: 'Om inget annat anges är det ursprungliga utbildningsinnehållet och uppgifterna licensierade enligt',
      questions: 'Frågor'
    },
    fi: {
      scope: 'Ellei toisin mainita, alkuperäinen koulutussisältö ja tiedot on lisensoitu lisenssillä',
      questions: 'Kysymykset'
    },
    he: {
      scope: 'אלא אם צוין אחרת, התוכן החינוכי המקורי והנתונים ניתנים ברישיון',
      questions: 'שאלות'
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
      ${text.questions}: <a href="mailto:Albert@DonnayDetox.com">Albert@DonnayDetox.com</a></p>
    <p class="official-version">The latest version compiled by Albert Donnay for MCS Referral &amp; Resources
      (<a href="https://www.mcsrr.org/">www.mcsrr.org</a>) is available online at
      <a href="https://ahdonnay.github.io/self-reports/MCS/">https://ahdonnay.github.io/self-reports/MCS/</a>.</p>`;

  const existingVersion = document.querySelector('.version');
  if (!existingVersion) {
    const page = document.querySelector('main.page');
    if (page) {
      const version = document.createElement('p');
      version.className = 'suite-version';
      version.textContent = defaultVersion;
      page.prepend(version);
    }
  }

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
