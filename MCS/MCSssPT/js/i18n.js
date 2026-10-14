'use strict';

window.CATSS_CONFIG = {
  locale: 'pt-PT', storageKey: 'mcsss.pt.v1', dataPath: '../MCSss/data/list.json?v=2026.10.13.h',
  codeLabel: {
    N: 'Sem alteração', Up: 'Aumento', Dn: 'Diminuição',
    UD: 'Primeiro anormalmente aumentada e depois anormalmente diminuída pelo menos uma vez durante o período',
    DU: 'Primeiro anormalmente diminuída e depois anormalmente aumentada pelo menos uma vez durante o período'
  },
  text: {
    columns: ['Alteração na perceção', 'Estímulo sensorial', 'Alteração na tolerância'], awareness: 'Perceção', tolerance: 'Tolerância',
    changeFor: (dimension, name) => `Alteração na ${dimension.toLowerCase()} para ${name}`,
    noChanges: total => `Não foram selecionadas alterações entre ${total} estímulos sensoriais.`,
    someChanges: (any, total) => `${any} de ${total} estímulo${any === 1 ? '' : 's'} ${any === 1 ? 'apresenta' : 'apresentam'} alteração na perceção, tolerância ou em ambas.`,
    comparisonPoint: value => `Ponto de comparação: ${value || 'ainda não especificado'}.`, allStimuli: 'Todos os estímulos sensoriais',
    categoryCount: s => `${s.total} estímulos · P alterada ${s.awarenessChanged} · T alterada ${s.toleranceChanged}`,
    enterComparison: 'Introduza a data ou o acontecimento anterior de comparação antes de imprimir ou guardar o relatório.',
    clearConfirmation: 'Limpar todas as respostas CATSS e os dados pessoais deste dispositivo? Esta ação não pode ser anulada.',
    loadError: 'Não foi possível carregar a lista de estímulos sensoriais. Abra esta aplicação através do respetivo endereço Web ou de um servidor local.',
    printLegend: 'P = Perceção · T = Tolerância · N sem alteração · Up aumento · Dn diminuição · UD primeiro anormalmente aumentada e depois diminuída · DU primeiro anormalmente diminuída e depois aumentada'
  },
  page: {
    suiteLink: 'Histórico de SQM', subtitle: 'Alterações na Perceção e na Tolerância aos Estímulos Sensoriais',
    aboutTitle: 'Sobre esta lista de verificação',
    about: 'O CATSS regista alterações em duas respostas distintas a estímulos sensoriais desde uma data ou acontecimento anterior que especificar. A <strong>perceção</strong> é o nível de um estímulo que nota. A <strong>tolerância</strong> é o nível máximo desse estímulo que consegue tolerar. Uma alteração numa delas não implica necessariamente a mesma alteração na outra.',
    howTitle: 'Como preencher o CATSS', chooseOne: 'Para a perceção e a tolerância, escolha uma resposta para cada estímulo:',
    legend: [
      {code:'N',label:'Sem alteração'}, {code:'Up',label:'Aumento'}, {code:'Dn',label:'Diminuição'},
      {code:'UD',label:'Aumento e depois diminuição',explanation:'primeiro anormalmente aumentada e depois anormalmente diminuída pelo menos uma vez durante o período'},
      {code:'DU',label:'Diminuição e depois aumento',explanation:'primeiro anormalmente diminuída e depois anormalmente aumentada pelo menos uma vez durante o período'}
    ],
    defaults: 'Cada resposta começa em <strong>N</strong>. Se não souber se a sua perceção ou tolerância se alterou, mantenha N. «Aumento» e «diminuição» indicam a direção da alteração, não se esta foi boa ou má. O painel é atualizado automaticamente e as suas respostas ficam guardadas neste navegador, neste dispositivo.',
    distinctionLabel: 'Distinção importante:', distinction: 'Uma perceção aumentada pode ocorrer com tolerância aumentada, inalterada ou diminuída. Registe cada coluna separadamente.',
    clinicalLabel: 'Nota clínica:', clinical: 'O CATSS é um autorrelato estruturado, não um teste diagnóstico. Fale sobre alterações sensoriais importantes ou súbitas com um profissional de saúde qualificado.',
    privacyTitle: 'Privacidade e os seus dados', privacy: 'As suas respostas são guardadas apenas neste navegador, neste dispositivo. Nada é enviado para qualquer servidor. Qualquer pessoa que utilize este perfil do navegador pode ver as suas respostas; num computador partilhado ou público, utilize <strong>Limpar respostas</strong> quando terminar. Para transferir o relatório para outro dispositivo, utilize Imprimir &rarr; Guardar como PDF no navegador.',
    infoTitle: 'As suas informações e ponto de comparação', comparisonLabel: 'Data ou acontecimento de comparação', comparisonPlaceholder: 'p. ex., antes da doença, da última consulta ou 2024.06', comparisonHint: 'Todas as respostas de perceção e tolerância comparam a sua experiência atual com esta mesma data ou acontecimento anterior.',
    patientLabel: 'Nome ou nome de código', patientPlaceholder: 'p. ex., Maria Silva — ou um nome de código com três palavras', patientHint: 'Introduza o seu nome num relatório destinado a um profissional de saúde, ou utilize um nome de código privado se preferir.',
    sexLabel: 'Sexo à nascença', sexFemale: 'Feminino', sexMale: 'Masculino', sexIntersex: 'Intersexo', sexNoAnswer: 'Prefiro não responder',
    ageYearsLabel: 'Idade — anos', yearsPlaceholder: 'Anos', ageMonthsLabel: 'Idade — meses', monthsPlaceholder: 'Meses', dateLabel: 'Data de preenchimento', dateHint: 'É preenchida automaticamente após a primeira alteração registada; pode modificá-la.',
    dashboardTitle: 'Painel', overallSummary: 'Resumo geral', kpiTotal: 'Estímulos listados', kpiAny: 'Qualquer alteração', kpiAwareness: 'Perceção alterada', kpiTolerance: 'Tolerância alterada', kpiBoth: 'Ambas alteradas', kpiUnchanged: 'Sem alteração em ambas',
    dashFoot: 'As contagens incluem cada estímulo listado. N significa sem alteração. Up, Dn, UD e DU são resumidos separadamente para a perceção (P) e a tolerância (T).',
    tableAria: 'Resumo por categoria com deslocamento', tableCaption: 'Alterações por categoria sensorial', category: 'Categoria', stimuli: 'Estímulos', awareness: 'Perceção', tolerance: 'Tolerância',
    checklistTitle: 'Lista de estímulos sensoriais', checklistHelp: 'Escolha a perceção à esquerda e a tolerância à direita.', finishTitle: 'Concluir',
    shareTip: 'Para partilhar o relatório, guarde-o primeiro como PDF através de um dos botões abaixo e depois anexe o PDF a uma mensagem de correio eletrónico ou de discussão.',
    printBW: 'Imprimir relatório (preto e branco, painel primeiro)', printColor: 'Guardar relatório como PDF a cores', clear: 'Limpar respostas',
    finishHint: '«Guardar como PDF» aparece como destino na janela de impressão do navegador. Limpar as respostas remove todos os dados CATSS deste dispositivo; não limpa os restantes relatórios do Histórico de SQM.'
  },
  categoryNames: {
    'catss-1':'Estímulos físicos externos detetados ou imaginados pelos sentidos primários', 'catss-2':'Estímulos físicos externos detetados pelos sentidos secundários',
    'catss-3':'Estímulos físicos internos detetados pelos sentidos internos', 'catss-4':'Estímulos cognitivos detetados pelos sentidos cognitivos',
    'catss-5':'Estímulos emocionais detetados pelos sentidos emocionais', 'catss-6':'Estímulos sociais detetados pelos sentidos sociais'
  },
  groupNames: {
    Flavors:'Sabores', Lights:'Luzes', Odors:'Odores', Sounds:'Sons', Touch:'Tato', 'Hallucinations (no stimuli)':'Alucinações (sem estímulos)',
    'Barometric Pressure (barosense)':'Pressão barométrica (barossentido)', 'Chemicals (chemesthesis)':'Substâncias químicas (quimioestesia)',
    'Electromagnetic Radiation':'Radiação eletromagnética', 'External Temperature (thermoception)':'Temperatura externa (termoceção)',
    Humidity:'Humidade', Mold:'Bolor', Vibration:'Vibração', 'Additional Sensory Stimuli':'Estímulos sensoriais adicionais'
  },
  itemNames: {
    'catss-1-1':'sabores de que normalmente gosta','catss-1-2':'sabores de que normalmente não gosta','catss-1-3':'sabores distorcidos (diferentes do esperado)','catss-1-4':'sabores amargos','catss-1-5':'sabores doces','catss-1-6':'sabores ácidos','catss-1-7':'sabores umami (saborosos)',
    'catss-1-8':'luz solar intensa','catss-1-9':'luz ténue','catss-1-10':'luz intermitente lenta, como um semáforo','catss-1-11':'luz intermitente rápida, como a de ambulâncias',
    'catss-1-12':'odor de substâncias de que normalmente gosta','catss-1-13':'odor de substâncias de que normalmente não gosta','catss-1-14':'odores distorcidos (diferentes do esperado)',
    'catss-1-15':'sons de baixa frequência, como motores ao ralenti','catss-1-16':'sons de alta frequência, como crianças a brincar','catss-1-17':'sons distorcidos (diferentes do esperado)',
    'catss-1-18':'tipos de toque de que normalmente gosta','catss-1-19':'tipos de toque de que normalmente não gosta','catss-1-20':'sentido estereognóstico (também chamado perceção háptica): capacidade de reconhecer objetos pela forma apenas através do toque, com os olhos fechados',
    'catss-1-21':'água ou suor na pele (higroceção)','catss-1-22':'eletricidade estática na pele (sentido galvânico)','catss-1-23':'corrente de ar na pele (anemoceção)',
    'catss-1-24':'sensação de algo a mover-se sobre a superfície da pele quando nada está presente','catss-1-25':'ouvir sons ou vozes que não estão presentes','catss-1-26':'ver coisas que não estão presentes','catss-1-27':'sentir odores que não estão presentes','catss-1-28':'sentir sabores que não estão presentes quando a boca está vazia',
    'catss-2-1':'baixa pressão (trovoada)','catss-2-2':'alta pressão (tempo limpo)','catss-2-3':'substâncias químicas absorvidas pela pele, como sabão ou loção','catss-2-4':'substâncias químicas inaladas pelo nariz, como fragrâncias','catss-2-5':'substâncias químicas ingeridas pela boca, como medicamentos ou suplementos',
    'catss-2-6':'alimentos e bebidas que provocam sensação de calor (p. ex., malaguetas detetadas pelo TRPV1)','catss-2-7':'alimentos e bebidas que provocam sensação de frio (p. ex., hortelã detetada pelo TRPM8)','catss-2-8':'alimentos e bebidas que provocam sensação de formigueiro (p. ex., bebidas gaseificadas)',
    'catss-2-9':'telemóveis e antenas de telecomunicações móveis (5G)','catss-2-10':'outras fontes de campos eletromagnéticos, como eletrodomésticos (não 5G)','catss-2-11':'tempo frio','catss-2-12':'tempo quente','catss-2-13':'baixa humidade, ar muito seco, por exemplo abaixo de 30% de humidade relativa','catss-2-14':'humidade elevada, ar muito húmido, por exemplo acima de 80% de humidade relativa',
    'catss-2-15':'bolor negro quando visível nas paredes','catss-2-16':'bolor de outras cores quando visível nas paredes','catss-2-17':'bolor presente mas não visível nas paredes, por exemplo em livros ou alimentos','catss-2-18':'segurar uma ferramenta elétrica vibratória (como uma escova de dentes elétrica ou um aspirador)','catss-2-19':'estar sobre um piso vibratório (como num elevador ou numa escada rolante)',
    'catss-3-1':'aceleração e desaceleração durante um movimento real','catss-3-2':'equilíbrio','catss-3-3':'bexiga cheia (detetada pela interoceção)','catss-3-4':'temperatura corporal (termoceção central)','catss-3-5':'tonturas','catss-3-6':'nível de energia (alto ou baixo)','catss-3-7':'falsa sensação de queda livre ou flutuação','catss-3-8':'falsa sensação de rotação','catss-3-9':'motilidade gastrointestinal (como movimentos no estômago)','catss-3-10':'frequência cardíaca (sentida em qualquer local, também chamada sensação de palpitação do pulso)','catss-3-11':'necessidade de ar (sensação de falta de ar)','catss-3-12':'fome','catss-3-13':'comichão sem motivo aparente (pruriceção)','catss-3-14':'orgasmo','catss-3-15':'dor (avaliada por teste de picada com monofilamento ou teste de beliscão da nociceção)','catss-3-16':'proprioceção (perceção da posição dos membros e partes do corpo em cada momento, avaliada pela capacidade de tocar na ponta do nariz com os olhos fechados)','catss-3-17':'velocidade durante um movimento real','catss-3-18':'sede (osmorreceção)','catss-3-19':'passagem do tempo (cronoceção, perceção da duração)',
    'catss-4-1':'sentido de curiosidade (aumentado se tiver mais interesse em aprender; diminuído se tiver menos)','catss-4-2':'sentido de orientação (frequência com que se perde em locais familiares)','catss-4-3':'capacidade de reconhecimento facial','catss-4-4':'sensação de ter perceção extrassensorial (PES), como pressentir acontecimentos futuros ou pensamentos de outras pessoas','catss-4-5':'sentido do objetivo imediato (diminuído se a pessoa esquecer o objetivo enquanto se desloca para um local ou depois de chegar; aumentado se estiver ansiosamente hiperconsciente das suas ações e raramente esquecer para onde vai ou porquê)','catss-4-6':'memória a longo prazo (nomes de amigos da escola primária)','catss-4-7':'sentido dos números (capacidade de subtrair mentalmente 7 a partir de 100)','catss-4-8':'capacidade de leitura (ler palavras impressas e manuscritas)','catss-4-9':'memória a curto prazo (onde deixou as chaves)','catss-4-10':'capacidade de escrita (escrever palavras legíveis sobre uma linha)','catss-4-11':'capacidade de encontrar palavras (palavra na ponta da língua)',
    'catss-5-1':'sensação de raiva e frustração em relação aos outros','catss-5-2':'sensação de raiva e frustração em relação a si próprio','catss-5-3':'sensação de comunicação com seres sobrenaturais ou espíritos de pessoas falecidas','catss-5-4':'sensação de prazer ou alegria','catss-5-5':'sensação de depressão, desespero, desilusão, fatalidade ou apreensão','catss-5-6':'sensação de labilidade emocional (mudanças súbitas de humor)','catss-5-7':'sensação de empatia para com outras pessoas','catss-5-8':'sensação de gratidão','catss-5-9':'sensação de esperança e otimismo','catss-5-10':'sensação de ansiedade irracional','catss-5-11':'sensação de medo irracional','catss-5-12':'sentido do certo e do errado (consciência ética)','catss-5-13':'sensação de autoestima quando está com outras pessoas','catss-5-14':'sensação de sobrecarga sensorial',
    'catss-6-1':'sensação de ligação próxima a serviços de conversação baseados em grandes modelos de linguagem de IA (aumentada se existir alguma ligação; diminuída se não existir)','catss-6-2':'sensação de ligação próxima ao parceiro, se existir, e à família','catss-6-3':'sensação de ligação próxima a pessoas já falecidas','catss-6-4':'sensação de ligação próxima a animais de companhia, como cães, gatos ou cavalos','catss-6-5':'sensação de ligação próxima a animais selvagens, como aves','catss-6-6':'sensação de ligação à comunidade mais próxima (p. ex., igreja, clube social, escola ou equipa)','catss-6-7':'sensação de inibição social (aumento = maior perceção e maior inibição)','catss-6-8':'perceção da densidade de pessoas no ambiente (perceção e tolerância de espaços fisicamente cheios)','catss-6-9':'perceção dos limites do espaço pessoal (proxémica; sensibilidade à proximidade física de outras pessoas em relação ao seu limite pessoal)'
  }
};
