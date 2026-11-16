export type Locale = 'en' | 'pt-BR';
export type KnownRoute = '/highlights' | '/highlights/biomarkers/sleep-hours' | '/highlights/biomarkers/body-temperature' | '/highlights/biomarkers/heart-rate' | '/highlights/biomarkers/blood-pressure' | '/highlights/biomarkers/blood-glucose' | '/highlights/biomarkers/mood' | '/mission-atlas' | '/indicators' | '/data-sources' | '/activity-history' | '/exam-logs' | '/sensors';

export const messages = {
  en: {
    navigation: {
      highlights: 'Highlights', atlas: 'Mission atlas', indicators: 'Indicators', data: 'About the data',
      language: 'Language', localeName: 'English',
    },
    health: {
      localeName: 'English', clear: 'Light', dark: 'Dark', enableLight: 'Enable light theme', enableDark: 'Enable dark theme',
      missionAtlas: 'Mission atlas', sleepHours: 'Sleep hours', viewSleep: 'View sleep trends',
    },
    groups: {
      environment: 'Space environment', exposure: 'Measured exposure', radiobiology: 'Radiation quality',
      biology: 'Biological response', correlation: 'Correlations',
    },
  },
  'pt-BR': {
    navigation: {
      highlights: 'Highlights', atlas: 'Atlas da missão', indicators: 'Indicadores', data: 'Sobre os dados',
      language: 'Idioma', localeName: 'Português (Brasil)',
    },
    health: {
      localeName: 'Português (Brasil)', clear: 'Claro', dark: 'Escuro', enableLight: 'Ativar tema claro', enableDark: 'Ativar tema escuro',
      missionAtlas: 'Atlas da missão', sleepHours: 'Horas de sono', viewSleep: 'Ver tendências de sono',
    },
    groups: {
      environment: 'Ambiente espacial', exposure: 'Exposição medida', radiobiology: 'Qualidade da radiação',
      biology: 'Resposta biológica', correlation: 'Correlações',
    },
  },
} as const;

export const localeToPath = (locale: Locale) => locale === 'en' ? 'en' : 'pt-br';

export function localeFromPath(pathname: string): Locale | null {
  const prefix = pathname.split('/')[1]?.toLowerCase();
  if (prefix === 'en') return 'en';
  if (prefix === 'pt-br') return 'pt-BR';
  return null;
}

export function routeFromPath(pathname: string): KnownRoute | null {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length < 2) return null;
  const path = `/${parts.slice(1).join('/')}`;
  if (path === '/highlights' || path === '/highlights/biomarkers/sleep-hours' || path === '/highlights/biomarkers/body-temperature' || path === '/highlights/biomarkers/heart-rate' || path === '/highlights/biomarkers/blood-pressure' || path === '/highlights/biomarkers/blood-glucose' || path === '/highlights/biomarkers/mood' || path === '/mission-atlas' || path === '/indicators' || path === '/data-sources' || path === '/activity-history' || path === '/exam-logs' || path === '/sensors') return path;
  return null;
}

export const groupLabels = messages['pt-BR'].groups;
