import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router';
import { localeFromPath } from './messages';
import type { Locale } from './messages';

const LocaleContext = createContext<Locale>('pt-BR');

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return <LocaleContext.Provider value={localeFromPath(pathname) ?? 'en'}>{children}</LocaleContext.Provider>;
}

export const useLocale = () => useContext(LocaleContext);

export function tx(locale: Locale, pt: string, en: string): string {
  return locale === 'en' ? en : pt;
}
