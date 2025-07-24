import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConfigProvider, App as AntdApp, Layout, Spin } from "antd";
import { Suspense, lazy } from "react";
import { Header } from "./layouts/Header";
import { Footer } from "./layouts/Footer";
import { AuthProvider } from "./context/AuthContext";

// Immediately loaded components (critical for initial render)
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy loaded pages for better performance
const LoginPage = lazy(() => import("./pages/LoginPage").then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import("./pages/RegisterPage").then(module => ({ default: module.RegisterPage })));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage").then(module => ({ default: module.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage").then(module => ({ default: module.ResetPasswordPage })));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage").then(module => ({ default: module.UserProfilePage })));
const BillingPage = lazy(() => import("./pages/BillingPage").then(module => ({ default: module.BillingPage })));
const GeneratorPage = lazy(() => import("./pages/GeneratorPage").then(module => ({ default: module.GeneratorPage })));
const FeaturesPage = lazy(() => import("./pages/FeaturesPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const ChatPage = lazy(() => import("./pages/ChatPage").then(module => ({ default: module.ChatPage })));

// Admin components (lazy loaded as a separate chunk)
const ProtectedAdminRoute = lazy(() => import("./components/ProtectedAdminRoute"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const ContentManagement = lazy(() => import("./pages/admin/ContentManagement"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));

const { Content } = Layout;

// Loading component with better UX
const PageLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '50vh',
    background: 'transparent'
  }}>
    <Spin size="large" tip="Loading..." />
  </div>
);

// Suspense wrapper component for better error boundaries
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
);

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
            {/* Admin Routes - Lazy loaded */}
            <Route
              path="/admin/*"
              element={
                <SuspenseWrapper>
                  <ProtectedAdminRoute>
                    <AdminLayout />
                  </ProtectedAdminRoute>
                </SuspenseWrapper>
              }
            >
              <Route index element={<SuspenseWrapper><AdminDashboard /></SuspenseWrapper>} />
              <Route path="dashboard" element={<SuspenseWrapper><AdminDashboard /></SuspenseWrapper>} />
              <Route path="users" element={<SuspenseWrapper><UserManagement /></SuspenseWrapper>} />
              <Route path="content" element={<SuspenseWrapper><ContentManagement /></SuspenseWrapper>} />
              <Route path="analytics" element={<SuspenseWrapper><AdminAnalytics /></SuspenseWrapper>} />
              <Route path="billing" element={<SuspenseWrapper><BillingPage /></SuspenseWrapper>} />
              <Route path="settings" element={<SuspenseWrapper><AdminSettings /></SuspenseWrapper>} />
            </Route>
            
            {/* Chat Page - Lazy loaded */}
            <Route path="/chat" element={<SuspenseWrapper><ChatPage /></SuspenseWrapper>} />
            
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
                      {/* Critical pages - loaded immediately */}
                      <Route path="/" element={<Index />} />
                      <Route path="*" element={<NotFound />} />
                      
                      {/* Auth pages - lazy loaded */}
                      <Route path="/login" element={<SuspenseWrapper><LoginPage /></SuspenseWrapper>} />
                      <Route path="/register" element={<SuspenseWrapper><RegisterPage /></SuspenseWrapper>} />
                      <Route path="/forgot-password" element={<SuspenseWrapper><ForgotPasswordPage /></SuspenseWrapper>} />
                      <Route path="/reset-password" element={<SuspenseWrapper><ResetPasswordPage /></SuspenseWrapper>} />
                      
                      {/* User pages - lazy loaded */}
                      <Route path="/profile" element={<SuspenseWrapper><UserProfilePage /></SuspenseWrapper>} />
                      <Route path="/billing" element={<SuspenseWrapper><BillingPage /></SuspenseWrapper>} />
                      
                      {/* Feature pages - lazy loaded */}
                      <Route path="/features" element={<SuspenseWrapper><FeaturesPage /></SuspenseWrapper>} />
                      <Route path="/pricing" element={<SuspenseWrapper><PricingPage /></SuspenseWrapper>} />
                      <Route path="/generator" element={<SuspenseWrapper><GeneratorPage /></SuspenseWrapper>} />
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
