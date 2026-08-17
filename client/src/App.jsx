/* eslint-disable react/prop-types */
import { Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from "./components/auth/layout";
import CheckAuth from "./components/common/check-auth";
import AppLayout from "./components/common/unified/AppLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Auth Pages
import AuthLogin from "./pages/auth/login";
import AuthRegister from "./pages/auth/register";
import ForgotPassword from "./pages/auth/forgot-password";
import VerifyAccount from "./pages/auth/verify-account";
import CheckEmail from "./pages/auth/check-email";
import ResetPassword from "./pages/auth/password-reset";

// Admin Pages
import AdminDashboard from "./pages/admin-view/dashboard";
import AdminUsers from "./pages/admin-view/admin-users";
import AdminTips from "./pages/admin-view/admin-tips";
import AdminAddTips from "./components/admin-view/tips/admin-add-tips";
import AdminViewUser from "./components/admin-view/users/admin-view-user";
import ImageUpload from "./components/admin-view/images/upload";
import AdminFixturePredictions from "./pages/admin-view/admin-fixture-predictions";
import AdminPaymentsHistory from "./pages/admin-view/admin-view-payments";
import AdminVip from "./pages/admin-view/admin-vip";
import AdminAddVip from "./components/admin-view/vip/admin-add-vip";
import AdminPremiumTips from "./pages/admin-view/admin-premium-tips";
import SettingsPage from "./pages/admin-view/SettingsPage";
import SyncPage from "./pages/admin-view/SyncPage";
//import TipDetailsPage from "./pages/user-view/common/TipDetailsPage";

// User Pages
import Home from "./pages/user-view/common/Home";
import PaymentPage from "./pages/user-view/common/PaymentPage";
import FreeTipsPage from "./pages/user-view/common/FreeTipsPage";
import FixturesPage from "./pages/user-view/common/FixturesPage";
import ResultsPage from "./pages/user-view/common/ResultsPage";
import StandingsPage from "./pages/user-view/common/StandingsPage";
import ScorersPage from "./pages/user-view/common/ScorersPage";
import LeaguesPage from "./pages/user-view/common/LeaguesPage";
import StatisticsPage from "./pages/user-view/common/StatisticsPage";
import PremiumPage from "./pages/user-view/common/PremiumPage";
import ContactPage from "./pages/user-view/common/ContactPage";
import JackpotsPage from "./pages/user-view/common/JackpotsPage";
import PredictionDetailsPage from "./pages/user-view/common/PredictionDetailsPage";
import Profile from "./pages/user-view/common/ProfilePage";
import SearchGames from "./pages/user-view/common/search";
import UserJackpots from "./pages/user-view/jackpots/user-jackpots";
import TipDetailsPage from "./pages/user-view/common/TipDetailsPage";

// Common Pages
import UnauthPage from "./pages/unauth-page";
import NotFound from "./pages/not-found/Notfound";
import { loadUser, refreshToken } from "./features/slices/authSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const App = ({ isAuthenticated, user }) => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(refreshToken());
    }
  }, [token, dispatch]);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="!rounded-2xl !bg-slate-900 !text-slate-50 !border !border-white/10"
      />

      <Routes>
        <Route
          path="/auth"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AuthLayout />
            </CheckAuth>
          }
        >
          <Route path="login" element={<AuthLogin />} />
          <Route path="register" element={<AuthRegister />} />
          <Route path="verify-otp" element={<VerifyAccount />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="check-email" element={<CheckEmail />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>

        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="free-tips" element={<FreeTipsPage />} />
          <Route path="premium-tips" element={<PremiumPage />} />
          <Route path="fixtures" element={<FixturesPage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="standings" element={<StandingsPage />} />
          <Route path="scorers" element={<ScorersPage />} />
          <Route path="leagues" element={<LeaguesPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
          <Route path="jackpots" element={<JackpotsPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="payment" element={<CheckAuth requireAuth><PaymentPage /></CheckAuth>} />
          <Route path="prediction/:fixtureId" element={<PredictionDetailsPage />} />
          <Route
  path="/tips/:tipId"
  element={<CheckAuth requireAuth ><TipDetailsPage /></CheckAuth> }
/>
          <Route path="profile" element={<CheckAuth requireAuth><Profile /></CheckAuth>} />
          <Route path="search" element={<CheckAuth requireAuth><SearchGames /></CheckAuth>} />

          <Route path="dashboard" element={<CheckAuth requireAuth requireAdmin><AdminDashboard /></CheckAuth>} />
          <Route path="predictions" element={<CheckAuth requireAuth requireAdmin><AdminFixturePredictions /></CheckAuth>} />
          <Route path="users" element={<CheckAuth requireAuth requireAdmin><AdminUsers /></CheckAuth>} />
          <Route path="payments" element={<CheckAuth requireAuth requireAdmin><AdminPaymentsHistory /></CheckAuth>} />
          <Route path="upload" element={<CheckAuth requireAuth requireAdmin><ImageUpload /></CheckAuth>} />
          <Route path="settings" element={<CheckAuth requireAuth requireAdmin><SettingsPage /></CheckAuth>} />
          <Route path="synchronization" element={<CheckAuth requireAuth requireAdmin><SyncPage /></CheckAuth>} />
          <Route path="vip" element={<CheckAuth requireAuth requireAdmin><AdminVip /></CheckAuth>} />
          <Route path="post" element={<CheckAuth requireAuth requireAdmin><AdminAddTips /></CheckAuth>} />
          <Route path="add-vip" element={<CheckAuth requireAuth requireAdmin><AdminAddVip /></CheckAuth>} />
          <Route path="view/user/:userId" element={<CheckAuth requireAuth requireAdmin><AdminViewUser /></CheckAuth>} />
        </Route>

        <Route path="/user" element={<AppLayout />}>
          <Route index element={<Navigate to="/" replace />} />
          <Route path="dashboard" element={<Home />} />
          <Route path="free-tips" element={<FreeTipsPage />} />
          <Route path="premium-tips" element={<PremiumPage />} />
          <Route path="prediction/:fixtureId" element={<PredictionDetailsPage />} />
          <Route path="profile" element={<CheckAuth requireAuth><Profile /></CheckAuth>} />
          <Route path="search" element={<CheckAuth requireAuth><SearchGames /></CheckAuth>} />
          <Route path="jackpots" element={<JackpotsPage />} />
        </Route>

        <Route path="/admin" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<CheckAuth requireAuth requireAdmin><AdminDashboard /></CheckAuth>} />
          <Route path="users" element={<CheckAuth requireAuth requireAdmin><AdminUsers /></CheckAuth>} />
          <Route path="tips" element={<CheckAuth requireAuth requireAdmin><AdminTips /></CheckAuth>} />
          <Route path="fixtures" element={<CheckAuth requireAuth requireAdmin><AdminFixturePredictions /></CheckAuth>} />
          <Route path="predictions" element={<CheckAuth requireAuth requireAdmin><AdminFixturePredictions /></CheckAuth>} />
          <Route path="vip" element={<CheckAuth requireAuth requireAdmin><AdminVip /></CheckAuth>} />
          <Route path="premium-tips" element={<CheckAuth requireAuth requireAdmin><AdminPremiumTips /></CheckAuth>} />
          <Route path="post" element={<CheckAuth requireAuth requireAdmin><AdminAddTips /></CheckAuth>} />
          <Route path="add-vip" element={<CheckAuth requireAuth requireAdmin><AdminAddVip /></CheckAuth>} />
          <Route path="view/user/:userId" element={<CheckAuth requireAuth requireAdmin><AdminViewUser /></CheckAuth>} />
          <Route path="upload" element={<CheckAuth requireAuth requireAdmin><ImageUpload /></CheckAuth>} />
          <Route path="payments" element={<CheckAuth requireAuth requireAdmin><AdminPaymentsHistory /></CheckAuth>} />
        </Route>

        <Route path="/unauth-page" element={<UnauthPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;
