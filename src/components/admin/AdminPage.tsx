import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fetchIsAdmin } from "../../lib/admin";
import WithdrawalRequestsTab from "./WithdrawalRequestsTab";
import AdminTournamentsTab from "./AdminTournamentsTab";
import AdminPayoutsTab from "./AdminPayoutsTab";
import AdminRulesTab from "./AdminRulesTab";
import AdminAnnouncementTab from "./AdminAnnouncementTab";
import AdminBroadcastTab from "./AdminBroadcastTab";
import AdminGiftCardsTab from "./AdminGiftCardsTab";

type Tab =
  | "withdrawals"
  | "tournaments"
  | "payouts"
  | "giftcards"
  | "rules"
  | "announcement"
  | "broadcast";

const TABS: { id: Tab; label: string }[] = [
  { id: "tournaments", label: "Matches" },
  { id: "payouts", label: "Payouts" },
  { id: "giftcards", label: "Gift Cards" },
  { id: "withdrawals", label: "Withdrawals" },
  { id: "rules", label: "Rules" },
  { id: "announcement", label: "Banner" },
  { id: "broadcast", label: "Notify" },
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
    <div className="h-screen flex flex-col bg-base text-ink font-body max-w-[480px] mx-auto">
      <div className="shrink-0 flex items-center gap-3 px-5 py-4 bg-surface border-b border-line">
        <button onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display font-semibold text-xl">Admin Panel</h1>
      </div>

      <div className="shrink-0 flex overflow-x-auto border-b border-line px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 px-4 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "border-ember text-ink"
                : "border-transparent text-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Only this region scrolls — header and tabs stay pinned so long
          lists (matches, payouts, withdrawals) never scroll them away. */}
      <div className="flex-1 overflow-y-auto px-5 py-5 pb-8">
        {isAdmin === null && (
          <p className="text-center text-muted text-sm py-8">Loading...</p>
        )}
        {isAdmin === true && activeTab === "tournaments" && (
          <AdminTournamentsTab />
        )}
        {isAdmin === true && activeTab === "payouts" && <AdminPayoutsTab />}
        {isAdmin === true && activeTab === "giftcards" && (
          <AdminGiftCardsTab />
        )}
        {isAdmin === true && activeTab === "withdrawals" && (
          <WithdrawalRequestsTab />
        )}
        {isAdmin === true && activeTab === "rules" && <AdminRulesTab />}
        {isAdmin === true && activeTab === "announcement" && (
          <AdminAnnouncementTab />
        )}
        {isAdmin === true && activeTab === "broadcast" && <AdminBroadcastTab />}
      </div>
    </div>
  );
}
