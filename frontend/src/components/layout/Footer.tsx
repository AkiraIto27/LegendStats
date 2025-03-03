import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';

const FooterContainer = styled.footer`
  background-color: #1a1a2e;
  color: #e1e1e1;
  padding: 2rem 0;
  margin-top: auto;
`;

const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 2rem;
  }
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FooterTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #ffffff;
`;

const FooterLink = styled.a`
  color: #b0b0b0;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;

  &:hover {
    color: #00bcd4;
  }
`;

const Disclaimer = styled.div`
  max-width: 1200px;
  margin: 2rem auto 0;
  padding: 1rem 20px 0;
  border-top: 1px solid #2a2a3e;
  font-size: 0.8rem;
  color: #a0a0a0;
  text-align: center;
`;

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <FooterTitle>LOL Stats Hub</FooterTitle>
          <FooterLink as="span">LoL統計・分析プラットフォーム</FooterLink>
          <FooterLink as="span">© {new Date().getFullYear()} LOL Stats Hub</FooterLink>
        </FooterSection>

        <FooterSection>
          <FooterTitle>メニュー</FooterTitle>
          <Link href="/" passHref>
            <FooterLink>ホーム</FooterLink>
          </Link>
          <Link href="/champions" passHref>
            <FooterLink>チャンピオン</FooterLink>
          </Link>
          <Link href="/leaderboard" passHref>
            <FooterLink>ランキング</FooterLink>
          </Link>
          <Link href="/meta" passHref>
            <FooterLink>メタ分析</FooterLink>
          </Link>
          <Link href="/ai-analysis" passHref>
            <FooterLink>AI分析</FooterLink>
          </Link>
        </FooterSection>

        <FooterSection>
          <FooterTitle>リソース</FooterTitle>
          <Link href="/faq" passHref>
            <FooterLink>よくある質問</FooterLink>
          </Link>
          <Link href="/guides" passHref>
            <FooterLink>ガイド</FooterLink>
          </Link>
          <Link href="/api-docs" passHref>
            <FooterLink>API ドキュメント</FooterLink>
          </Link>
        </FooterSection>

        <FooterSection>
          <FooterTitle>お問い合わせ</FooterTitle>
          <Link href="/contact" passHref>
            <FooterLink>お問い合わせフォーム</FooterLink>
          </Link>
          <FooterLink href="https://twitter.com/lolstatshub" target="_blank">Twitter</FooterLink>
          <FooterLink href="https://discord.gg/lolstatshub" target="_blank">Discord</FooterLink>
        </FooterSection>
      </FooterContent>

      <Disclaimer>
        League of LegendsはRiot Games, Inc.の登録商標です。本サイトはRiot Gamesによる承認や後援を受けたものではありません。
        ゲームコンテンツとマテリアルはRiot Gamesの所有物であり、Riot Gamesの知的財産ポリシーに基づいて使用しています。
      </Disclaimer>
    </FooterContainer>
  );
};

export default Footer;
