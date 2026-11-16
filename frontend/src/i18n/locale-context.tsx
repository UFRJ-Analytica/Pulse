import type { ReactNode } from 'react';
import { useLocation } from 'react-router';
import { localeFromPath } from './messages';
import { LocaleContext } from './locale';

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return <LocaleContext.Provider value={localeFromPath(pathname) ?? 'en'}>{children}</LocaleContext.Provider>;
}
