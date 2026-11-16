import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useLocale, tx } from '../i18n/locale';

export function Modal({ title, children, onClose, className = '' }: { title: string; children: React.ReactNode; onClose: () => void; className?: string }) {
  const locale = useLocale();
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    element?.showModal();
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { element?.close(); document.body.style.overflow = oldOverflow; previous?.focus(); };
  }, []);
  return <dialog ref={dialog} className={`modal ${className}`} onCancel={onClose} onClick={event => { if (event.target === dialog.current) onClose(); }} aria-label={title}>
    <div className="modal-header"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label={tx(locale, 'Fechar diálogo', 'Close dialog')}><X size={18} /></button></div>{children}
  </dialog>;
}
