import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const fieldClasses =
  "h-11 w-full rounded-lg border border-fnc-border bg-fnc-dark px-3 text-sm text-fnc-text placeholder:text-fnc-text-muted focus:border-fnc-teal focus:outline-none focus:ring-1 focus:ring-fnc-teal disabled:opacity-50";

export function Field({
  label,
  required,
  hint,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="fnc-eyebrow">
        {label}
        {required && <span className="ml-1 text-fnc-teal">*</span>}
      </span>
      <div className="mt-2">{children}</div>
      {hint && <p className="mt-1.5 text-[11px] text-fnc-text-muted">{hint}</p>}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(fieldClasses, props.className)} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        fieldClasses,
        "h-auto min-h-[88px] resize-y py-2.5 leading-relaxed",
        props.className,
      )}
    />
  );
}

export function Select(
  props: SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode },
) {
  return (
    <select {...props} className={cn(fieldClasses, "appearance-none pr-8", props.className)}>
      {props.children}
    </select>
  );
}

export function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-fnc-text">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 cursor-pointer accent-fnc-teal"
      />
      <span>{label}</span>
    </label>
  );
}

export function Button({
  children,
  variant = "primary",
  disabled,
  type = "button",
  onClick,
  className,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  className?: string;
}) {
  const base =
    "h-11 rounded-full px-6 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  const variants = {
    primary: "bg-fnc-teal text-fnc-dark hover:bg-fnc-teal-bright",
    secondary:
      "border border-fnc-teal/40 bg-transparent text-fnc-teal hover:border-fnc-teal hover:bg-fnc-teal/10",
    ghost: "text-fnc-text-muted hover:text-fnc-text",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(base, variants[variant], className)}
    >
      {children}
    </button>
  );
}
