import type { ReactNode } from "react";

type Base = { name: string; label: string; hint?: string; error?: string; required?: boolean };

export function TextField({ name, label, hint, error, required, type = "text", defaultValue, placeholder, maxLength }: Base & { type?: string; defaultValue?: string | number; placeholder?: string; maxLength?: number }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}{required && <span className="text-coral"> *</span>}</label>
      <input id={name} name={name} type={type} className="input" defaultValue={defaultValue} placeholder={placeholder} maxLength={maxLength} required={required} aria-invalid={error ? "true" : undefined} />
      {error ? <span className="err">{error}</span> : hint ? <span className="hint">{hint}</span> : null}
    </div>
  );
}

export function TextArea({ name, label, hint, error, required, defaultValue, rows = 5, markdown }: Base & { defaultValue?: string; rows?: number; markdown?: boolean }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}{required && <span className="text-coral"> *</span>}</label>
      <textarea id={name} name={name} className="textarea" rows={rows} defaultValue={defaultValue} required={required} aria-invalid={error ? "true" : undefined} />
      {error ? (
        <span className="err">{error}</span>
      ) : (
        <span className="hint">{hint ?? (markdown ? "Поддържа Markdown: **удебелен**, *курсив*, - списък, [линк](https://…). Празен ред = нов абзац." : "")}</span>
      )}
    </div>
  );
}

export function Select({ name, label, hint, error, required, defaultValue, options }: Base & { defaultValue?: string | number; options: Array<{ value: string | number; label: string }> }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}{required && <span className="text-coral"> *</span>}</label>
      <select id={name} name={name} className="select" defaultValue={defaultValue ?? ""} aria-invalid={error ? "true" : undefined}>
        {options.map((o) => (
          <option key={String(o.value)} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error ? <span className="err">{error}</span> : hint ? <span className="hint">{hint}</span> : null}
    </div>
  );
}

export function Checkbox({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <div className="field">
      <label className="checkbox">
        <input type="checkbox" name={name} defaultChecked={defaultChecked} />
        {label}
      </label>
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}

export function FormRow({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 }) {
  return <div className={`grid gap-4 ${cols === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>{children}</div>;
}

export function Fieldset({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="card p-5 md:p-6 grid gap-4">
      <legend className="px-2 font-extrabold text-sm text-ink-soft">{title}</legend>
      {children}
    </fieldset>
  );
}
