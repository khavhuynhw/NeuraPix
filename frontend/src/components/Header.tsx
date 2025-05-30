import React from 'react';
import { Layout } from 'antd';
import styled from '@emotion/styled';

const { Header: AntHeader } = Layout;

const StyledHeader = styled(AntHeader)`
  background: #0079ff;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
  position: fixed;
  width: 100%;
  z-index: 1000;
  padding: 0;
`;

const Logo = styled.div`
  font-size: 2.2rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2px;
  user-select: none;
  .dot {
    color: #ff4d4f;
  }
`;

const Header: React.FC = () => {
  return (
    <StyledHeader>
      <Logo>
        NEURA<span className="dot">.</span>PIX
      </Logo>
    </StyledHeader>
  );
};

export default Header; 