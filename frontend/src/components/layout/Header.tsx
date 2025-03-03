import React, { useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SearchBar from '../common/SearchBar';

const HeaderContainer = styled.header`
  background-color: #1a1a2e;
  color: #ffffff;
  padding: 1rem 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const Logo = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  a {
    color: #ffffff;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const Navigation = styled.nav`
  display: flex;
  gap: 1.5rem;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    gap: 1rem;
  }
`;

const NavLink = styled.a<{ active?: boolean }>`
  color: ${props => props.active ? '#00bcd4' : '#ffffff'};
  text-decoration: none;
  font-weight: ${props => props.active ? '600' : '400'};
  transition: color 0.2s;

  &:hover {
    color: #00bcd4;
  }
`;

const SearchContainer = styled.div`
  flex: 1;
  max-width: 500px;
  margin: 0 1rem;

  @media (max-width: 768px) {
    width: 100%;
    margin: 0.5rem 0;
  }
`;

const Header: React.FC = () => {
  const router = useRouter();
  
  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo>
          <Link href="/" passHref>
            <a>
              <span>LOL Stats Hub</span>
            </a>
          </Link>
        </Logo>
        
        <SearchContainer>
          <SearchBar />
        </SearchContainer>

        <Navigation>
          <Link href="/champions" passHref>
            <NavLink active={router.pathname.startsWith('/champions')}>
              チャンピオン
            </NavLink>
          </Link>
          <Link href="/leaderboard" passHref>
            <NavLink active={router.pathname.startsWith('/leaderboard')}>
              ランキング
            </NavLink>
          </Link>
          <Link href="/meta" passHref>
            <NavLink active={router.pathname.startsWith('/meta')}>
              メタ分析
            </NavLink>
          </Link>
          <Link href="/ai-analysis" passHref>
            <NavLink active={router.pathname.startsWith('/ai-analysis')}>
              AI分析
            </NavLink>
          </Link>
        </Navigation>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;
