import { useEffect, useId, useState } from 'react';
import { AccessibleModal } from './AccessibleModal';

interface EditTextModalProps {
  open: boolean;
  title: string;
  description?: string;
  initialValue: string;
  inputLabel: string;
  multiline?: boolean;
  required?: boolean;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: (value: string) => void;
  testId?: string;
}

export function EditTextModal({
  open,
  title,
  description,
  initialValue,
  inputLabel,
  multiline = false,
  required = false,
  confirmLabel = 'ثبت',
  onCancel,
  onConfirm,
  testId = 'edit-text-modal'
}: EditTextModalProps) {
  const inputId = useId();
  const [value, setValue] = useState(initialValue);
  const invalid = required && !value.trim();

  useEffect(() => {
    if (open) setValue(initialValue);
  }, [initialValue, open]);

  return (
    <AccessibleModal
      open={open}
      title={title}
      description={description}
      variant={invalid ? 'warning' : 'info'}
      confirmLabel={confirmLabel}
      onCancel={onCancel}
      onConfirm={() => {
        if (!invalid) onConfirm(value);
      }}
      testId={testId}
    >
      <label htmlFor={inputId} className="block text-sm font-bold text-slate-600 dark:text-slate-300">{inputLabel}</label>
      {multiline ? (
        <textarea
          id={inputId}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="mt-2 min-h-28 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          data-testid={`${testId}-input`}
          dir="rtl"
        />
      ) : (
        <input
          id={inputId}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          data-testid={`${testId}-input`}
          dir="rtl"
        />
      )}
      {invalid && <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">این فیلد نباید خالی باشد.</p>}
    </AccessibleModal>
  );
}
