import type { InputHTMLAttributes } from "react";

interface ProfileFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function ProfileField({
  label,
  id,
  ...rest
}: ProfileFieldProps) {
  return (
    <div className="text-left">
      <label
        htmlFor={id}
        className="block text-xs tracking-wider text-muted uppercase mb-2"
      >
        {label}
      </label>
      <input
        id={id}
        {...rest}
        className="w-full bg-surface-2 border border-line rounded px-4 py-3 text-ink text-sm placeholder:text-muted/60 outline-none transition-colors focus:border-ember disabled:opacity-60"
      />
    </div>
  );
}
