import { useEffect, useRef, useState } from "react";

interface OtpInputProps {
  length?: number;
  onComplete: (code: string) => void;
  disabled?: boolean;
}

// WebOTP isn't in the standard TS lib yet — minimal shape for what we use.
interface OTPCredential extends Credential {
  code: string;
}

export default function OtpInput({
  length = 6,
  onComplete,
  disabled,
}: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // WebOTP: browser reads the incoming SMS and offers to autofill this
  // field with zero typing — no permission prompt needed on Chrome/Android.
  // Requires the SMS body to end with a domain-bound token, e.g.:
  //   Your ARENA.GG code is 482913
  //   @yourdomain.com #482913
  // Configure this in Supabase → Auth → Templates → SMS Message.
  useEffect(() => {
    if (!("OTPCredential" in window)) return;

    const ac = new AbortController();

    navigator.credentials
      .get({
        // @ts-expect-error — otp is a valid option under the WebOTP spec,
        // just not yet in TypeScript's built-in Credential types.
        otp: { transport: ["sms"] },
        signal: ac.signal,
      })
      .then((cred) => {
        const code = (cred as OTPCredential)?.code;
        if (code && code.length === length) {
          setDigits(code.split(""));
          onComplete(code);
        }
      })
      .catch(() => {
        // User dismissed the prompt, or it timed out — manual entry still works.
      });

    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length]);

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const joined = next.join("");
    if (joined.length === length && !joined.includes("")) {
      onComplete(joined);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    e.preventDefault();
    const next = pasted.slice(0, length).split("");
    while (next.length < length) next.push("");
    setDigits(next);
    if (pasted.length >= length) onComplete(pasted.slice(0, length));
  }

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-12 h-14 text-center text-xl font-mono bg-surface-2 border border-line rounded outline-none transition-colors focus:border-ember disabled:opacity-50"
        />
      ))}
    </div>
  );
}
