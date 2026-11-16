// SPDX-License-Identifier: Apache-2.0

export type NavSectionKey =
  | 'home'
  | 'train'
  | 'routines'
  | 'stats'
  | 'science'
  | 'calibration'
  | 'settings';

export interface PageTextDefinition {
  readonly key: NavSectionKey;
  readonly path: string;
  readonly navLabel: string;
  readonly navShortCode: string;
  readonly title: string;
  readonly subtitle: string;
  readonly layerBadge: string;
  readonly comingSoonBody: string;
}

export const STRINGS_ES = {
  appName: 'EVO-AIM-CS2',
  appTagline: 'Plataforma open source de entrenamiento de puntería para CS2',
  skipToMainContent: 'Saltar al contenido principal',
  sidebarLandmarkLabel: 'Navegación principal',
  mainLandmarkLabel: 'Contenido de la sección',
  toggleSidebarCollapse: 'Contraer barra lateral',
  toggleSidebarExpand: 'Expandir barra lateral',
  trademarkFooter:
    'Proyecto independiente open source (Apache-2.0). No afiliado con Valve Corporation.',
  errorBoundaryTitle: 'Se produjo un error en la interfaz',
  errorBoundaryBody:
    'EVO-AIM-CS2 capturó un fallo inesperado de renderizado. Puedes volver a cargar la vista de forma segura.',
  errorBoundaryReloadButton: 'Restablecer vista',
  globalRuntimeErrorBanner:
    'Se registró un error asíncrono no capturado en la ventana.',
  settings: {
    appInfoCardTitle: 'Información de la Aplicación y Entorno',
    appInfoCardBadge: 'IPC: app:getInfo',
    nativeDiagCardTitle: 'Diagnóstico de Módulos Nativos (SQLite)',
    nativeDiagCardBadge: 'SPIKE-4 · diag:nativeModules',
    refreshDiagButton: 'Repetir verificación nativa',
    loadingText: 'Consultando canal IPC seguro...',
    bridgeUnavailableText:
      'Puente preload (window.evoaim) no disponible en este contexto de prueba.',
    ipcErrorPrefix: 'Error al consultar IPC:',
    fields: {
      productName: 'Producto',
      appId: 'Identificador (appId)',
      version: 'Versión',
      platform: 'Plataforma / Arquitectura',
      osRelease: 'Versión del SO',
      userDataSubdir: 'Subcarpeta userData',
      electronVersion: 'Electron',
      chromiumVersion: 'Chromium',
      nodeVersion: 'Node.js (runtime Electron)',
      sqliteStatus: 'Estado better-sqlite3',
      sqliteStatusOk: 'OK — Addon cargado y consulta en memoria verificada',
      sqliteStatusFail: 'FALLO — No se pudo ejecutar la sonda SQLite',
      sqliteEngineVersion: 'Versión motor SQLite',
      sqliteErrorDetail: 'Detalle del error',
    },
  },
  pages: [
    {
      key: 'home',
      path: '/',
      navLabel: 'Inicio',
      navShortCode: '01',
      title: 'Inicio',
      subtitle:
        'Resumen de sesión, estado del perfil y acceso rápido al entrenamiento de Counter-Strike 2.',
      layerBadge: 'Capa 13',
      comingSoonBody:
        'Próximamente (Capa 13): panel de resumen diario, acceso rápido a última rutina y avisos de calibración.',
    },
    {
      key: 'train',
      path: '/train',
      navLabel: 'Entrenar',
      navShortCode: '02',
      title: 'Entrenar',
      subtitle:
        'Escenarios 3D con fidelidad sub-frame invariante a los FPS, armas de CS2 y ejercicios tácticos.',
      layerBadge: 'Capas 4–6 y 11',
      comingSoonBody:
        'Próximamente (Capas 4, 5, 6 y 11): motor WebGL2 de 240 Hz, escenarios data-driven, patrones de recoil y counter-strafing.',
    },
    {
      key: 'routines',
      path: '/routines',
      navLabel: 'Rutinas',
      navShortCode: '03',
      title: 'Rutinas',
      subtitle:
        'Listas estructuradas de calentamiento y planificador adaptativo guiado por tus debilidades.',
      layerBadge: 'Capa 8',
      comingSoonBody:
        'Próximamente (Capa 8): reproductor de rutinas y ajuste automático de dificultad con explicaciones transparentes.',
    },
    {
      key: 'stats',
      path: '/stats',
      navLabel: 'Estadísticas',
      navShortCode: '04',
      title: 'Estadísticas',
      subtitle:
        'Analítica cinemática local: descomposición de flicks, overshoot, TTK y progresión de benchmarks.',
      layerBadge: 'Capas 7 y 12',
      comingSoonBody:
        'Próximamente (Capas 7 y 12): telemetría local en SQLite, intervalos de confianza y niveles de maestría.',
    },
    {
      key: 'science',
      path: '/science',
      navLabel: 'Ciencia',
      navShortCode: '05',
      title: 'Ciencia',
      subtitle:
        'Biblioteca interactiva de control motor y aprendizaje perceptivo-motor con fuentes verificables (DOI).',
      layerBadge: 'Capa 10',
      comingSoonBody:
        'Próximamente (Capa 10): fichas revisadas por pares (Ley de Fitts, submovimientos de Meyer) conectadas con tus métricas.',
    },
    {
      key: 'calibration',
      path: '/calibration',
      navLabel: 'Calibración',
      navShortCode: '06',
      title: 'Calibración',
      subtitle:
        'Herramienta física de giro 360° sobre alfombrilla y protocolo experimental Sensitivity Finder.',
      layerBadge: 'Capas 2 y 9',
      comingSoonBody:
        'Próximamente (Capas 2 y 9): calculadora verificada de eDPI / cm/360, detector de aceleración y test A/B de sensibilidad.',
    },
    {
      key: 'settings',
      path: '/settings',
      navLabel: 'Ajustes',
      navShortCode: '07',
      title: 'Ajustes',
      subtitle:
        'Diagnóstico del sistema, verificación de módulos nativos (SPIKE-4), perfiles y preferencias.',
      layerBadge: 'Capa 1 · Activo',
      comingSoonBody:
        'Próximamente (Capas 3, 13, 15 y 16): gestión de perfiles SQLite, presets gráficos L/M/H, idioma e integración GSI local.',
    },
  ] satisfies readonly PageTextDefinition[],
} as const;
