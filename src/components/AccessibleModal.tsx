import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react';

interface AccessibleModalProps {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  details?: ReactNode;
  diagnosticsSummary?: {
    issueCount: number;
    messageFa?: string;
  };
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm?: () => void;
  initialFocus?: 'cancel' | 'confirm';
  variant?: 'danger' | 'warning' | 'info' | 'success';
  confirmTone?: 'primary' | 'danger';
  testId?: string;
}

const variantClasses = {
  danger: 'border-rose-300 bg-rose-50 text-rose-950 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100',
  warning: 'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100',
  info: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-100',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100'
};

export function AccessibleModal({
  open,
  title,
  description,
  children,
  details,
  diagnosticsSummary,
  cancelLabel = 'انصراف',
  confirmLabel = 'تایید',
  onCancel,
  onConfirm,
  initialFocus = 'cancel',
  variant = 'info',
  confirmTone = 'primary',
  testId
}: AccessibleModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
    const target = initialFocus === 'confirm' ? confirmButtonRef.current : cancelButtonRef.current;
    target?.focus();
    return () => previousFocus?.focus();
  }, [initialFocus, open]);

  if (!open) return null;

  const focusableButtons = () => [cancelButtonRef.current, confirmButtonRef.current].filter((item): item is HTMLButtonElement => Boolean(item));

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onCancel();
      return;
    }
    if (event.key === 'Enter') {
      if (document.activeElement === confirmButtonRef.current) {
        event.preventDefault();
        onConfirm?.();
      }
      return;
    }
    if (event.key !== 'Tab') return;
    const buttons = focusableButtons();
    if (!buttons.length) return;
    const currentIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const nextIndex = event.shiftKey
      ? currentIndex <= 0 ? buttons.length - 1 : currentIndex - 1
      : currentIndex === buttons.length - 1 ? 0 : currentIndex + 1;
    event.preventDefault();
    buttons[nextIndex]?.focus();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
      onKeyDown={handleKeyDown}
      data-testid={testId}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-5 text-right shadow-xl dark:border-slate-800 dark:bg-slate-900"
        dir="rtl"
      >
        <h3 id={titleId} className="text-lg font-extrabold">{title}</h3>
        {description && <p id={descriptionId} className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{description}</p>}
        <div className="mt-4">{children}</div>
        {details && (
          <div className={`mt-4 rounded-md border p-3 text-sm leading-7 ${variantClasses[variant]}`} data-testid={`${testId ?? 'modal'}-details`}>
            {details}
          </div>
        )}
        {diagnosticsSummary && (
          <div className="mt-3 rounded-md border border-slate-200 p-3 text-sm leading-7 dark:border-slate-800" data-testid={`${testId ?? 'modal'}-diagnostics`}>
            <strong>عیب‌یابی:</strong> {diagnosticsSummary.issueCount.toLocaleString('fa-IR')} مورد
            {diagnosticsSummary.messageFa && <p>{diagnosticsSummary.messageFa}</p>}
          </div>
        )}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            ref={cancelButtonRef}
            onClick={onCancel}
            className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700"
            data-testid={`${testId ?? 'modal'}-cancel`}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            onClick={onConfirm}
            className={`rounded-md px-3 py-2 font-bold text-white ${confirmTone === 'danger' ? 'bg-rose-600' : 'bg-tealish'}`}
            data-testid={`${testId ?? 'modal'}-confirm`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
