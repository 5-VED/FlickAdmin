import { useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

const WIDTH_CLASS = {
  'max-w-sm': styles.widthSm,
  'max-w-md': styles.widthMd,
  'max-w-xl': styles.widthMd,
  'max-w-2xl': styles.widthXl,
  'max-w-lg': styles.widthLg,
};

export default function Modal({ isOpen, onClose, title, children, width = 'max-w-2xl' }) {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.backdrop} />
      <div
        className={`${styles.dialog} ${WIDTH_CLASS[width] ?? styles.widthXl}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button
            onClick={onClose}
            className={styles.closeBtn}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
