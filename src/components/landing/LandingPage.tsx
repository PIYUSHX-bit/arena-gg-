import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Hero from "./Hero";
import TournamentGrid from "./TournamentGrid";
import PhaseTimeline from "./PhaseTimeline";
import Leaderboard from "./Leaderboard";
import { FinalCta, Footer } from "./FinalCta";
import { fetchTournaments } from "../../lib/entries";
import { useAuth } from "../../context/AuthContext";
import type { Tournament, LeaderboardEntry, HudStat } from "../../types/tournament";

const HUD_STATS: HudStat[] = [
  { label: "Prize pool this week", value: "₹4,82,000" },
  { label: "Squads registered", value: "1,306" },
  { label: "Matches this week", value: "38" },
  { label: "Avg. payout time", value: "6h 12m" },
];

// Still mock — this is a marketing display separate from the real
// /leaderboard app page, which already pulls from get_leaderboard().
const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, squadName: "Team Vortex", wins: 4, eliminations: 62, points: 1840, earnings: 31200 },
  { rank: 2, squadName: "Ash Kings", wins: 3, eliminations: 58, points: 1705, earnings: 24800 },
  { rank: 3, squadName: "Nightfall", wins: 2, eliminations: 71, points: 1640, earnings: 19300 },
  { rank: 4, squadName: "Ghost Protocol", wins: 2, eliminations: 49, points: 1410, earnings: 14600 },
  { rank: 5, squadName: "Redline", wins: 1, eliminations: 55, points: 1280, earnings: 10050 },
];

export default function LandingPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Don't show the marketing page to someone who's already logged in —
    // send them straight to the app. Waits for authLoading to resolve so
    // it doesn't redirect, then flash back, on first load.
    if (!authLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    fetchTournaments().then(({ tournaments: t }) => {
      setTournaments(t);
      setLoading(false);
    });
  }, []);

  // Avoid rendering the landing page at all while we're still checking
  // auth state, or for the instant before the redirect above fires.
  if (authLoading || user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-base text-ink font-body overflow-x-hidden">
      <Navbar />
      <Hero liveSquadCount={214} stats={HUD_STATS} />

      {!loading && tournaments.length === 0 ? (
        <div className="px-[5vw] py-20 text-center text-muted">
          No tournaments open for registration right now — check back soon.
        </div>
      ) : (
        <TournamentGrid tournaments={tournaments} />
      )}

      <PhaseTimeline />
      <Leaderboard entries={LEADERBOARD} />
      <FinalCta />
      <Footer />
    </div>
  );
}
