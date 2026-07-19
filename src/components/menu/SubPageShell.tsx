import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface SubPageShellProps {
  title: string;
  children: ReactNode;
}

export default function SubPageShell({ title, children }: SubPageShellProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-base text-ink font-body max-w-[480px] mx-auto pb-10">
      <div className="flex items-center gap-3 px-5 py-4 bg-surface border-b border-line sticky top-0 z-10">
        <button onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display font-semibold text-xl">{title}</h1>
      </div>
      <div className="px-5 py-6">{children}</div>
    </div>
  );
}
