import { createContext, useContext } from 'react';
import type { Locale } from './messages';

// Locale context, hook and text helper, kept apart from the provider component (React Fast Refresh).
export const LocaleContext = createContext<Locale>('pt-BR');

export const useLocale = () => useContext(LocaleContext);

export function tx(locale: Locale, pt: string, en: string): string {
  return locale === 'en' ? en : pt;
}
