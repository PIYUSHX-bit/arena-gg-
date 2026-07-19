import type { InputHTMLAttributes } from "react";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function AuthInput({ label, id, ...rest }: AuthInputProps) {
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
        className="w-full bg-surface-2 border border-line rounded px-4 py-3 text-ink text-sm placeholder:text-muted/60 outline-none transition-colors focus:border-ember"
      />
    </div>
  );
}
