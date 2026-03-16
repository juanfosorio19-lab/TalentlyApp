// src/App.jsx — Definición de rutas de Talently v2
// Reemplaza el patrón app.showView('vistaId') por react-router-dom v6
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import RoleRedirect from './components/RoleRedirect';

// ─── Public Views ──────────────────────────
import {
  WelcomeView,
  LoginView,
  RegisterView,
  RecoveryView,
  NewPasswordView,
  AuthCallbackView,
  TermsView,
  PrivacyView,
  FAQView,
  SupportView,
  DeleteAccountView,
} from './views';

// ─── Candidate Views ───────────────────────
import {
  MainApp,
  SwipeView,
  MatchesView,
  MessagesListView,
  MessagesChatView,
  ProfileView,
  FiltersView,
  CvView,
  NotificationsView,
  SettingsView,
  OfferDetailsView,
  CompanyPublicProfileView,
} from './views';

// ─── Company Views ─────────────────────────
import {
  CompanyDashboardView,
  CreateOfferView,
  CompanySwipeView,
  CompanyFiltersView,
  CompanyChatView,
  CompanyStatsView,
  CompanyNotificationsView,
  CompanySettingsView,
  CompanyProfileCreatedView,
  CandidatePublicProfileView,
} from './views';

// ─── Onboarding ────────────────────────────
import CandidateOnboarding from './views/onboarding/CandidateOnboarding';
import CompanyOnboarding from './views/onboarding/CompanyOnboarding';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          {/* ═══════ RUTAS PÚBLICAS ═══════ */}
          <Route path="/" element={<WelcomeView />} />
          <Route path="/login" element={<LoginView />} />
          <Route path="/register" element={<RegisterView />} />
          <Route path="/recovery" element={<RecoveryView />} />
          <Route path="/new-password" element={<NewPasswordView />} />
          <Route path="/auth/callback" element={<AuthCallbackView />} />
          <Route path="/terms" element={<TermsView />} />
          <Route path="/privacy" element={<PrivacyView />} />
          <Route path="/faq" element={<FAQView />} />
          <Route path="/support" element={<SupportView />} />

          {/* ═══════ RUTAS PRIVADAS ═══════ */}
          <Route element={<PrivateRoute />}>

            {/* Redirect inteligente por rol */}
            <Route path="/dashboard" element={<RoleRedirect />} />

            {/* ── Onboarding ── */}
            <Route path="/onboarding/candidate" element={<CandidateOnboarding />} />
            <Route path="/onboarding/company" element={<CompanyOnboarding />} />

            {/* ── Candidato ── */}
            <Route path="/app" element={<MainApp />} />
            <Route path="/app/swipe" element={<SwipeView />} />
            <Route path="/app/matches" element={<MatchesView />} />
            <Route path="/app/messages" element={<MessagesListView />} />
            <Route path="/app/messages/:matchId" element={<MessagesChatView />} />
            <Route path="/app/profile" element={<ProfileView />} />
            <Route path="/app/filters" element={<FiltersView />} />
            <Route path="/app/cv" element={<CvView />} />
            <Route path="/app/notifications" element={<NotificationsView />} />
            <Route path="/app/settings" element={<SettingsView />} />
            <Route path="/app/offer/:offerId" element={<OfferDetailsView />} />
            <Route path="/app/company/:companyUserId" element={<CompanyPublicProfileView />} />

            {/* ── Empresa ── */}
            <Route path="/company/dashboard" element={<CompanyDashboardView />} />
            <Route path="/company/create-offer" element={<CreateOfferView />} />
            <Route path="/company/swipe" element={<CompanySwipeView />} />
            <Route path="/company/filters" element={<CompanyFiltersView />} />
            <Route path="/company/chat/:matchId" element={<CompanyChatView />} />
            <Route path="/company/stats" element={<CompanyStatsView />} />
            <Route path="/company/notifications" element={<CompanyNotificationsView />} />
            <Route path="/company/settings" element={<CompanySettingsView />} />
            <Route path="/company/profile-created" element={<CompanyProfileCreatedView />} />
            <Route path="/company/candidate/:profileId" element={<CandidatePublicProfileView />} />
            <Route path="/delete-account" element={<DeleteAccountView />} />
          </Route>

          {/* Fallback → Welcome */}
          <Route path="*" element={<WelcomeView />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
