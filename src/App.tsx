import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AuthPage from "./components/auth/AuthPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ProfileCompletionGuard from "./components/auth/ProfileCompletionGuard";
import CompleteProfilePage from "./components/auth/CompleteProfilePage";
import ReferralGate from "./components/auth/ReferralGate";
import RedeemCodePage from "./components/auth/RedeemCodePage";
import DashboardPage from "./components/dashboard/DashboardPage";
import ProfilePage from "./components/profile/ProfilePage";
import PublicProfilePage from "./components/profile/PublicProfilePage";
import MatchesPage from "./components/matches/MatchesPage";
import LeaderboardPage from "./components/leaderboard/LeaderboardPage";
import MenuPage from "./components/menu/MenuPage";
import WalletPage from "./components/wallet/WalletPage";
import StatisticsPage from "./components/menu/StatisticsPage";
import TopPlayersPage from "./components/menu/TopPlayersPage";
import NotificationsPage from "./components/menu/NotificationsPage";
import ContactPage from "./components/menu/ContactPage";
import FaqPage from "./components/menu/FaqPage";
import AboutPage from "./components/menu/AboutPage";
import PrivacyPage from "./components/menu/PrivacyPage";
import TermsPage from "./components/menu/TermsPage";
import RegistrationPage from "./components/registration/RegistrationPage";
import TournamentsBrowsePage from "./components/tournaments/TournamentsBrowsePage";
import GameModeTournamentsPage from "./components/tournaments/GameModeTournamentsPage";
import AdminPage from "./components/admin/AdminPage";

function protect(element: React.ReactNode) {
  return <ProtectedRoute>{element}</ProtectedRoute>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<AuthPage />} />
          <Route
            path="/dashboard"
            element={protect(
              <ProfileCompletionGuard>
                <ReferralGate>
                  <DashboardPage />
                </ReferralGate>
              </ProfileCompletionGuard>
            )}
          />
          <Route
            path="/complete-profile"
            element={protect(<CompleteProfilePage />)}
          />
          <Route
            path="/redeem-code"
            element={protect(<RedeemCodePage />)}
          />
          <Route path="/profile" element={protect(<ProfilePage />)} />
          <Route
            path="/profile/view/:userId"
            element={protect(<PublicProfilePage />)}
          />
          <Route path="/matches" element={protect(<MatchesPage />)} />
          <Route path="/leaderboard" element={protect(<LeaderboardPage />)} />
          <Route path="/menu" element={protect(<MenuPage />)} />
          <Route path="/wallet" element={protect(<WalletPage />)} />
          <Route path="/statistics" element={protect(<StatisticsPage />)} />
          <Route path="/top-players" element={protect(<TopPlayersPage />)} />
          <Route path="/notifications" element={protect(<NotificationsPage />)} />
          <Route path="/contact" element={protect(<ContactPage />)} />
          <Route path="/faq" element={protect(<FaqPage />)} />
          <Route path="/about" element={protect(<AboutPage />)} />
          <Route path="/privacy" element={protect(<PrivacyPage />)} />
          <Route path="/terms" element={protect(<TermsPage />)} />
          <Route
            path="/tournaments/:tournamentId/register"
            element={protect(<RegistrationPage />)}
          />
          <Route path="/tournaments" element={protect(<TournamentsBrowsePage />)} />
          <Route
            path="/tournaments/category/:categoryId"
            element={protect(<GameModeTournamentsPage />)}
          />
          <Route path="/admin" element={protect(<AdminPage />)} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
