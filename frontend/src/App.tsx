import React from 'react'
import { Layout } from 'antd'
import Login from './pages/Login'
import Header from './components/Header'
import Footer from './components/Footer'
import 'antd/dist/reset.css'

const { Content } = Layout

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Content style={{ 
        paddingTop: '64px', // Height of the header
        minHeight: 'calc(100vh - 64px)', // Viewport height minus header height
        background: '#f5f5f5'
      }}>
        <Login />
      </Content>
      <Footer />
    </Layout>
  )
}

export default App
