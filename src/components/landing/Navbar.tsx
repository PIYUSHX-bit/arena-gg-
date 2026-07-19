import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[5vw] py-5 backdrop-blur-md bg-base/60 border-b border-line">
      <div className="flex items-center gap-2.5">
        <div className="relative w-[26px] h-[26px] rounded-full border-2 border-ember">
          <span className="absolute inset-[5px] rounded-full bg-ember shadow-[0_0_12px_theme(colors.ember)]" />
        </div>
        <div className="font-display font-bold text-xl tracking-wide">
          ARENA<span className="text-ember">.GG</span>
        </div>
      </div>

      <div className="hidden md:flex gap-9 text-sm text-muted">
        <a href="#tournaments" className="hover:text-ink transition-colors">
          Tournaments
        </a>
        <a href="#how" className="hover:text-ink transition-colors">
          How it works
        </a>
        <a href="#leaderboard" className="hover:text-ink transition-colors">
          Leaderboard
        </a>
      </div>

      {user ? (
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="hidden md:block text-sm text-muted hover:text-ink transition-colors"
          >
            {user.user_metadata?.display_name ?? user.email}
          </Link>
          <button
            onClick={signOut}
            className="bg-ember text-base font-semibold text-sm px-[22px] py-2.5 rounded transition-all hover:shadow-[0_0_24px_rgba(255,74,28,0.5)] hover:-translate-y-px"
          >
            Log Out
          </button>
        </div>
      ) : (
        <Link
          to="/login"
          className="bg-ember text-base font-semibold text-sm px-[22px] py-2.5 rounded transition-all hover:shadow-[0_0_24px_rgba(255,74,28,0.5)] hover:-translate-y-px"
        >
          Register Squad
        </Link>
      )}
    </nav>
  );
}
