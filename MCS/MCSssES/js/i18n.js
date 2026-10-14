'use strict';

window.CATSS_CONFIG = {
  ...window.CATSS_CONFIG,
  locale: 'es-ES',
  storageKey: 'mcsss.es.v1',
  codeLabel: {
    N: 'Ningún cambio percibido',
    U: 'Aumento',
    D: 'Disminución',
    M: 'Mixto: primero aumentó de manera anormal y después disminuyó',
    W: 'Invertido: primero disminuyó de manera anormal y después aumentó'
  },
  text: {
    ...window.CATSS_CONFIG.text,
    noChanges: total => `No se han seleccionado cambios entre ${total} estímulos sensoriales.`,
    comparisonPoint: value => `Punto de comparación: ${value || 'aún no especificado'}.`,
    enterComparison: 'Introduzca la fecha o el suceso anterior de comparación antes de imprimir o guardar el informe.',
    clearConfirmation: '¿Borrar todas las respuestas de CATSS y los datos personales de este dispositivo? Esta acción no se puede deshacer.',
    loadError: 'No se ha podido cargar la lista de estímulos sensoriales. Abra esta aplicación mediante su dirección web o un servidor local.',
    printLegend: 'P = Percepción · T = Tolerancia · N sin cambio · U aumento · D disminución · M primero aumentó y después disminuyó · W primero disminuyó y después aumentó'
  },
  itemNames: {
    ...window.CATSS_CONFIG.itemNames,
    'catss-1-15': 'sonidos de baja frecuencia, como motores al ralentí',
    'catss-2-9': 'teléfonos móviles y antenas de telefonía móvil (5G)',
    'catss-2-19': 'estar de pie sobre un suelo que vibra (como en un ascensor o una escalera mecánica)',
    'catss-3-9': 'motilidad gastrointestinal (como movimientos del estómago)',
    'catss-3-13': 'picor sin motivo aparente (pruricepción)',
    'catss-4-6': 'memoria a largo plazo (nombres de amistades de la escuela primaria)',
    'catss-5-1': 'sensación de enfado y frustración hacia otras personas',
    'catss-5-2': 'sensación de enfado y frustración hacia usted mismo',
    'catss-6-1': 'sensación de conexión estrecha con servicios de chat basados en grandes modelos de lenguaje de IA (aumentada si existe alguna conexión; disminuida si no existe)',
    'catss-6-5': 'sensación de conexión estrecha con animales salvajes, como aves'
  }
};
