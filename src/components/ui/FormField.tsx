'use client';

import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  useId,
} from 'react';

/**
 * Form text input with label, helper text, and error state wired up
 * through aria-describedby. Standardizes input styling across cart,
 * future contact pages, and any other form surface.
 *
 *   <FormField
 *     label="E-mail"
 *     type="email"
 *     placeholder="váš@email.cz"
 *     value={email}
 *     onChange={(e) => setEmail(e.target.value)}
 *     error={emailError}
 *   />
 */
type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode;
  helper?: ReactNode;
  error?: ReactNode;
  required?: boolean;
};

export const FormField = forwardRef<HTMLInputElement, Props>(function FormField(
  { label, helper, error, required, id: providedId, className, ...rest },
  ref,
) {
  const reactId = useId();
  const id = providedId ?? `field-${reactId}`;
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;
  const describedBy =
    [error ? errorId : null, helper ? helperId : null].filter(Boolean).join(' ') ||
    undefined;

  return (
    <div className={['flex flex-col gap-1.5', className ?? ''].join(' ')}>
      <label
        htmlFor={id}
        className="font-poppins-medium"
        style={{
          fontSize: 'var(--text-small)',
          color: 'var(--color-text-muted)',
          letterSpacing: '0.04em',
        }}
      >
        {label}
        {required ? (
          <span
            aria-hidden="true"
            style={{ color: 'var(--color-danger)', marginLeft: '0.25rem' }}
          >
            *
          </span>
        ) : null}
      </label>
      <input
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        className="font-poppins-regular w-full bg-transparent outline-none transition-colors"
        style={{
          fontSize: 'var(--text-body)',
          color: 'var(--color-ink)',
          padding: '0.85rem 1rem',
          minHeight: '48px',
          borderRadius: 'var(--radius-md)',
          border: `1.5px solid ${
            error ? 'var(--color-danger)' : 'var(--color-border-strong)'
          }`,
          background: '#fff',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error
            ? 'var(--color-danger)'
            : 'var(--color-forest)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error
            ? 'var(--color-danger)'
            : 'var(--color-border-strong)';
        }}
        {...rest}
      />
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="font-poppins-medium"
          style={{
            fontSize: 'var(--text-small)',
            color: 'var(--color-danger)',
          }}
        >
          {error}
        </p>
      ) : helper ? (
        <p
          id={helperId}
          style={{
            fontSize: 'var(--text-small)',
            color: 'var(--color-text-muted)',
          }}
        >
          {helper}
        </p>
      ) : null}
    </div>
  );
});
