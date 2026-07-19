import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fetchIsAdmin } from "../../lib/admin";
import WithdrawalRequestsTab from "./WithdrawalRequestsTab";
import AdminTournamentsTab from "./AdminTournamentsTab";
import AdminPayoutsTab from "./AdminPayoutsTab";

type Tab = "withdrawals" | "tournaments" | "payouts";

const TABS: { id: Tab; label: string }[] = [
  { id: "tournaments", label: "Matches" },
  { id: "payouts", label: "Payouts" },
  { id: "withdrawals", label: "Withdrawals" },
];

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("tournaments");

  useEffect(() => {
    if (!user) return;
    fetchIsAdmin(user.id).then(setIsAdmin);
  }, [user]);

  if (isAdmin === false) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-base text-ink font-body max-w-[480px] mx-auto pb-8">
      <div className="flex items-center gap-3 px-5 py-4 bg-surface border-b border-line sticky top-0 z-10">
        <button onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display font-semibold text-xl">Admin Panel</h1>
      </div>

      <div className="flex border-b border-line px-5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-ember text-ink"
                : "border-transparent text-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-5 py-5">
        {isAdmin === null && (
          <p className="text-center text-muted text-sm py-8">Loading...</p>
        )}
        {isAdmin === true && activeTab === "tournaments" && (
          <AdminTournamentsTab />
        )}
        {isAdmin === true && activeTab === "payouts" && <AdminPayoutsTab />}
        {isAdmin === true && activeTab === "withdrawals" && (
          <WithdrawalRequestsTab />
        )}
      </div>
    </div>
  );
}
