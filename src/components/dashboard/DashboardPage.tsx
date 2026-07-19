import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Send } from "lucide-react";
import TopBar from "./TopBar";
import RulesBanner from "./RulesBanner";
import PromoCarousel from "./PromoCarousel";
import MyMatches from "./MyMatches";
import EsportsGames from "./EsportsGames";
import BottomNav, { type NavTab } from "./BottomNav";
import type { MatchStatus } from "../../types/dashboard";
import { GAME_MODES } from "../../lib/gameModes";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const navigate = useNavigate();

  function handleTabChange(tab: NavTab) {
    setActiveTab(tab);
    if (tab === "menu") {
      navigate("/menu");
    } else if (tab === "leaderboard") {
      navigate("/leaderboard");
    } else if (tab === "earn") {
      navigate("/wallet");
    }
  }

  function handleMatchStatusSelect(status: MatchStatus) {
    // MyMatches uses "ongoing" (matches the reference UI's wording);
    // the tournaments table's actual status value is "live" — map here
    // rather than rename one of the two vocabularies.
    const statusParam = status === "ongoing" ? "live" : status;
    navigate(`/matches?status=${statusParam}`);
  }

  function handleGameModeSelect(modeId: string) {
    navigate(`/tournaments/category/${modeId}`);
  }

  return (
    <div className="min-h-screen bg-base text-ink font-body max-w-[480px] mx-auto pb-20">
      <TopBar />

      <RulesBanner
        text="CLICK HERE TO READ ALL THE RULES 📌🎮 Every player of Free Fire..."
        onClick={() => navigate("/rules")}
      />

      <PromoCarousel
        slides={[
          {
            id: "telegram",
            eyebrow: "Support · 10AM to 10PM",
            title: "Need Help Fast?",
            subtitle: "Our team replies to every ticket within minutes.",
            ctaLabel: "Contact Support",
            icon: Send,
            accent: "zone",
            onCtaClick: () =>
              window.open("https://t.me/NIKHILY9", "_blank"),
          },
          {
            id: "whatsapp",
            eyebrow: "WhatsApp · Instant Replies",
            title: "Chat With Us",
            subtitle: "Message us on WhatsApp for the quickest response.",
            ctaLabel: "Message on WhatsApp",
            icon: MessageCircle,
            accent: "safe",
            onCtaClick: () =>
              window.open("https://wa.me/qr/JTEWU2BSGKUTO1", "_blank"),
          },
        ]}
      />

      <MyMatches onSelect={handleMatchStatusSelect} />

      <EsportsGames modes={GAME_MODES} onSelect={handleGameModeSelect} />

      <BottomNav active={activeTab} onChange={handleTabChange} />
    </div>
  );
}
