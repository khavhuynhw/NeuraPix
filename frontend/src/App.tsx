import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConfigProvider, App as AntdApp, Layout } from "antd";
import { Header } from "./layouts/Header";
import { Footer } from "./layouts/Footer";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { UserProfilePage } from "./pages/UserProfilePage";
import { BillingPage } from "./pages/BillingPage";
import { GeneratorPage } from "./pages/GeneratorPage";

import FeaturesPage from "./pages/FeaturesPage";
import PricingPage from "./pages/PricingPage";
import { AuthProvider } from "./context/AuthContext";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import ContentManagement from "./pages/admin/ContentManagement";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";
import { ChatPage } from "./pages/ChatPage";
const { Content } = Layout;

const App = () => (
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: "#0079FF",
        colorPrimaryHover: "#3399FF",
        colorPrimaryActive: "#0056B3",
      },
    }}
  >
    <AntdApp>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedAdminRoute>
                  <AdminLayout />
                </ProtectedAdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="content" element={<ContentManagement />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            <Route path="/chat" element={<ChatPage />} />
            {/* Regular Routes */}
            <Route
              path="/*"
              element={
                <Layout
                  style={{
                    minHeight: "100vh",
                    width: "100vw",
                    margin: 0,
                    padding: 0,
                    overflowX: "hidden",
                  }}
                >
                  <Header />
                  <Content
                    style={{
                      marginTop: 64,
                      width: "100%",
                      padding: 0,
                      margin: 0,
                    }}
                  >
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route
                        path="/forgot-password"
                        element={<ForgotPasswordPage />}
                      />
                      <Route
                        path="/reset-password"
                        element={<ResetPasswordPage />}
                      />
                      <Route path="/profile" element={<UserProfilePage />} />
                      <Route path="/billing" element={<BillingPage />} />
                      <Route path="/features" element={<FeaturesPage />} />
                      <Route path="/pricing" element={<PricingPage />} />
                      <Route path="/generator" element={<GeneratorPage />} />

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Content>
                  <Footer />
                </Layout>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </AntdApp>
  </ConfigProvider>
);

export default App;
