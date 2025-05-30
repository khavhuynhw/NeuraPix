import React from 'react';
import { Layout, Input, Button, Typography, Space, Row, Col } from 'antd';
import {
    FacebookOutlined,
    InstagramOutlined,
    TwitterOutlined,
    LinkedinOutlined,
    YoutubeOutlined,
    MailOutlined
} from '@ant-design/icons';
import logo from '../assets/LOGO-01-01.png';
import './Footer.css';

const { Footer: AntFooter } = Layout;
const { Title, Text } = Typography;


const glassmorphismStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px'
};

const sectionTitleStyle = {
    color: '#fff',
    marginBottom: '16px',
    fontSize: '18px',
    fontWeight: '600',
    height: '100px',
    display: 'flex',
    alignItems: 'center',
};

const Footer: React.FC = () => {
    return (
        <AntFooter style={{
            background: '#0079ff',
            padding: '64px 50px 32px',
            color: '#fff',
            marginTop: 'auto'
        }}>
            <div style={{
                maxWidth: '1440px',
                margin: '0 auto',
            }}>
                <Row gutter={[32, 48]}>
                    {/* Left Section - Newsletter */}
                    <Col xs={24} sm={24} md={6}>
                        <div style={sectionTitleStyle}>
                            <img 
                                src={logo} 
                                alt="NeuraPix Logo" 
                                style={{ 
                                    height: '100px',
                                    objectFit: 'contain'
                                }} 
                            />
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <Text style={{ 
                                color: 'rgba(255, 255, 255, 0.9)',
                                fontSize: '16px',
                                lineHeight: '1.6'
                            }}>
                                Subscribe to our newsletter for the latest updates on features and releases.
                            </Text>
                        </div>
                        <Space.Compact style={{ width: '100%' }}>
                            <Input 
                                placeholder="Your email here" 
                                prefix={<MailOutlined />}
                                style={{ 
                                    ...glassmorphismStyle,
                                    color: '#fff',
                                    height: '48px'
                                }}
                            />
                            <Button 
                                type="primary" 
                                className="join-button"
                            >
                                Join
                            </Button>
                        </Space.Compact>
                        
                        <div style={{ marginTop: '16px' }}>
                            <Text style={{ 
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontSize: '14px'
                            }}>
                                By subscribing, you consent to our Privacy Policy and receive updates.
                            </Text>
                        </div>
                    </Col>

                    {/* Quick Links Section */}
                    <Col xs={24} sm={12} md={6}>
                        <Title level={5} style={sectionTitleStyle}>Quick Links</Title>
                        <ul style={{ 
                            listStyle: 'none', 
                            padding: 0,
                            margin: 0
                        }}>
                            {['Home Page', 'About Us', 'Contact Us', 'Blog Posts', 'Support Center'].map((item) => (
                                <li key={item} style={{ marginBottom: '12px' }}>
                                    <a href="#" className="footer-link">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </Col>

                    {/* Resources Section */}
                    <Col xs={24} sm={12} md={6}>
                        <Title level={5} style={sectionTitleStyle}>Resources</Title>
                        <ul style={{ 
                            listStyle: 'none', 
                            padding: 0,
                            margin: 0
                        }}>
                            {['FAQs', 'Case Studies', 'Webinars', 'Guides', 'E-books'].map((item) => (
                                <li key={item} style={{ marginBottom: '12px' }}>
                                    <a href="#" className="footer-link">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </Col>

                    {/* Connect With Us Section */}
                    <Col xs={24} sm={12} md={6}>
                        <Title level={5} style={sectionTitleStyle}>Connect With Us</Title>
                        <ul style={{ 
                            listStyle: 'none', 
                            padding: 0,
                            margin: 0
                        }}>
                            <li style={{ marginBottom: '12px' }}>
                                <a href="#" className="footer-link">
                                    <FacebookOutlined /> Facebook
                                </a>
                            </li>
                            <li style={{ marginBottom: '12px' }}>
                                <a href="#" className="footer-link">
                                    <InstagramOutlined /> Instagram
                                </a>
                            </li>
                            <li style={{ marginBottom: '12px' }}>
                                <a href="#" className="footer-link">
                                    <LinkedinOutlined /> LinkedIn
                                </a>
                            </li>
                            <li style={{ marginBottom: '12px' }}>
                                <a href="#" className="footer-link">
                                    <YoutubeOutlined /> YouTube
                                </a>
                            </li>
                            <li style={{ marginBottom: '12px' }}>
                                <a href="#" className="footer-link">
                                    <TwitterOutlined /> (Twitter)
                                </a>
                            </li>
                        </ul>
                    </Col>
                </Row>

                {/* Copyright Section */}
                <div style={{ 
                    marginTop: '48px',
                    paddingTop: '24px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '14px'
                }}>
                    <span>© 2025 NEURAPIX All rights reserved.</span>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <a href="/privacy-policy" className="policy-link">Privacy Policy</a>
                        <a href="/terms-of-service" className="policy-link">Terms of Service</a>
                        <a href="/cookie-settings" className="policy-link">Cookie Settings</a>
                    </div>
                </div>
            </div>
        </AntFooter>
    );
};

export default Footer; 