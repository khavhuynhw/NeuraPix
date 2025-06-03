import React from 'react'
import { Layout } from 'antd'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import ResetPasswordPage from './pages/ResetPasswordPage'
import RegisterPage from './pages/RegisterPage';
import Header from './components/Header'
import Footer from './components/Footer'
import 'antd/dist/reset.css'
import HomePage from './pages/HomePage'
import ConfirmPasswordPage from './pages/ConfirmPasswordPage'

const { Content } = Layout

function App() {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Header />
        <Content
          style={{
            paddingTop: '64px',
            minHeight: 'calc(100vh - 64px)',
            background: '#f5f5f5',
          }}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/confirm-password" element={<ConfirmPasswordPage />} />
          </Routes>
        </Content>
        <Footer />
      </Layout>
    </Router>
  )
}

export default App