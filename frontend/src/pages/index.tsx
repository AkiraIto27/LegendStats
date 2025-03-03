import type { NextPage } from 'next';
import Head from 'next/head';
import styled from 'styled-components';
import Link from 'next/link';
import SearchBar from '@/components/common/SearchBar';

const HeroSection = styled.section`
  background: linear-gradient(to right, #1a1a2e, #16213e);
  color: white;
  padding: 4rem 1rem;
  text-align: center;
`;

const HeroTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;

  @media (min-width: 768px) {
    font-size: 3.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  max-width: 800px;
  margin: 0 auto 2rem;
  opacity: 0.9;

  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

const SearchContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const FeatureSection = styled.section`
  padding: 4rem 1rem;
  background-color: white;
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 2rem;
  margin-bottom: 3rem;
  color: #1a1a2e;

  &::after {
    content: '';
    display: block;
    width: 80px;
    height: 3px;
    background-color: #00bcd4;
    margin: 0.5rem auto 0;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 992px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const FeatureCard = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #1a1a2e;
`;

const FeatureDescription = styled.p`
  color: #555;
  margin-bottom: 1.5rem;
`;

const FeatureLink = styled.a`
  color: #00bcd4;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    text-decoration: underline;
  }
`;

const LatestSection = styled.section`
  padding: 4rem 1rem;
  background-color: #f5f5f5;
`;

const LatestGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const LatestCard = styled.div`
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const LatestCardHeader = styled.div`
  background-color: #1a1a2e;
  color: white;
  padding: 1rem;
`;

const LatestCardTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
`;

const LatestCardContent = styled.div`
  padding: 1rem;
`;

const MetaChampsList = styled.ul`
  list-style: none;
  padding: 0;
`;

const MetaChampItem = styled.li`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

const ChampIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #eee;
`;

const ChampInfo = styled.div`
  flex: 1;
`;

const ChampName = styled.span`
  font-weight: 500;
`;

const ChampStats = styled.div`
  font-size: 0.875rem;
  color: #777;
`;

const WinRate = styled.span<{ rate: number }>`
  color: ${(props) => (props.rate >= 52 ? '#43a047' : props.rate <= 48 ? '#e53935' : '#777')};
  font-weight: 500;
`;

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>LOL Stats Hub - LoL統計・分析プラットフォーム</title>
        <meta name="description" content="League of Legends向けの高度な統計分析と洞察を提供するプラットフォーム。" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <HeroSection>
        <HeroTitle>LOL Stats Hub</HeroTitle>
        <HeroSubtitle>
          League of Legendsの統計・分析をAIの力でさらに進化。
          あなたのプレイをより深く理解し、次のレベルへ。
        </HeroSubtitle>
        <SearchContainer>
          <SearchBar />
        </SearchContainer>
      </HeroSection>

      <FeatureSection>
        <SectionTitle>主要機能</SectionTitle>
        <FeatureGrid>
          <FeatureCard>
            <FeatureTitle>高度なデータ分析</FeatureTitle>
            <FeatureDescription>
              プレイヤーのパフォーマンス、メタの時系列分析など詳細な統計情報を可視化。
              パッチごとの勝率変動やポジション別の強さを分析。
            </FeatureDescription>
            <Link href="/meta" passHref>
              <FeatureLink>メタ分析を見る →</FeatureLink>
            </Link>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureTitle>AIによるリプレイ解析</FeatureTitle>
            <FeatureDescription>
              試合リプレイをAIが分析し、改善点を提案。
              あなたのプレイの強みと弱みを客観的に把握できます。
            </FeatureDescription>
            <Link href="/ai-analysis" passHref>
              <FeatureLink>AI分析を試す →</FeatureLink>
            </Link>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureTitle>プレイヤーの成長分析</FeatureTitle>
            <FeatureDescription>
              長期的な成績推移とスキル向上を可視化。
              シーズン間の比較や成長指標で進歩を実感。
            </FeatureDescription>
            <Link href="/growth" passHref>
              <FeatureLink>成長分析を見る →</FeatureLink>
            </Link>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureTitle>対戦予測</FeatureTitle>
            <FeatureDescription>
              チャンピオン構成や各プレイヤーの統計から試合の勝率を予測。
              試合前の戦略立案に役立ちます。
            </FeatureDescription>
            <Link href="/match-prediction" passHref>
              <FeatureLink>対戦予測を試す →</FeatureLink>
            </Link>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureTitle>リアルタイムゲーム情報</FeatureTitle>
            <FeatureDescription>
              現在進行中のゲームの詳細情報をチェック。
              味方と敵のプレイヤーデータを確認できます。
            </FeatureDescription>
            <Link href="/live-game" passHref>
              <FeatureLink>ライブゲームを見る →</FeatureLink>
            </Link>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureTitle>ランキング・リーダーボード</FeatureTitle>
            <FeatureDescription>
              サーバーごとのトッププレイヤーやチャンピオンマスタリーのランキングを表示。
              地域別の傾向も確認できます。
            </FeatureDescription>
            <Link href="/leaderboard" passHref>
              <FeatureLink>ランキングを見る →</FeatureLink>
            </Link>
          </FeatureCard>
        </FeatureGrid>
      </FeatureSection>

      <LatestSection>
        <SectionTitle>最新情報</SectionTitle>
        <LatestGrid>
          <LatestCard>
            <LatestCardHeader>
              <LatestCardTitle>メタチャンピオン TOP 5</LatestCardTitle>
            </LatestCardHeader>
            <LatestCardContent>
              <MetaChampsList>
                <MetaChampItem>
                  <ChampIcon>
                    {/* <Image src="/placeholder.png" alt="Champion Icon" width={40} height={40} /> */}
                  </ChampIcon>
                  <ChampInfo>
                    <ChampName>Ahri</ChampName>
                    <ChampStats>
                      Pick: 24.3% | <WinRate rate={53.7}>Win: 53.7%</WinRate>
                    </ChampStats>
                  </ChampInfo>
                </MetaChampItem>
                <MetaChampItem>
                  <ChampIcon>
                    {/* <Image src="/placeholder.png" alt="Champion Icon" width={40} height={40} /> */}
                  </ChampIcon>
                  <ChampInfo>
                    <ChampName>Kayn</ChampName>
                    <ChampStats>
                      Pick: 18.7% | <WinRate rate={52.1}>Win: 52.1%</WinRate>
                    </ChampStats>
                  </ChampInfo>
                </MetaChampItem>
                <MetaChampItem>
                  <ChampIcon>
                    {/* <Image src="/placeholder.png" alt="Champion Icon" width={40} height={40} /> */}
                  </ChampIcon>
                  <ChampInfo>
                    <ChampName>Lux</ChampName>
                    <ChampStats>
                      Pick: 15.2% | <WinRate rate={51.9}>Win: 51.9%</WinRate>
                    </ChampStats>
                  </ChampInfo>
                </MetaChampItem>
                <MetaChampItem>
                  <ChampIcon>
                    {/* <Image src="/placeholder.png" alt="Champion Icon" width={40} height={40} /> */}
                  </ChampIcon>
                  <ChampInfo>
                    <ChampName>Irelia</ChampName>
                    <ChampStats>
                      Pick: 12.8% | <WinRate rate={50.5}>Win: 50.5%</WinRate>
                    </ChampStats>
                  </ChampInfo>
                </MetaChampItem>
                <MetaChampItem>
                  <ChampIcon>
                    {/* <Image src="/placeholder.png" alt="Champion Icon" width={40} height={40} /> */}
                  </ChampIcon>
                  <ChampInfo>
                    <ChampName>Thresh</ChampName>
                    <ChampStats>
                      Pick: 11.5% | <WinRate rate={50.3}>Win: 50.3%</WinRate>
                    </ChampStats>
                  </ChampInfo>
                </MetaChampItem>
              </MetaChampsList>
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Link href="/meta" passHref>
                  <FeatureLink>すべてのメタデータを見る →</FeatureLink>
                </Link>
              </div>
            </LatestCardContent>
          </LatestCard>

          <LatestCard>
            <LatestCardHeader>
              <LatestCardTitle>最新アップデート</LatestCardTitle>
            </LatestCardHeader>
            <LatestCardContent>
              <div>
                <h4>AIリプレイ解析機能リリース</h4>
                <p style={{ color: '#777', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  2025-03-01
                </p>
                <p style={{ marginBottom: '1.5rem' }}>
                  あなたの試合リプレイをAIが詳細に分析し、改善点を提案する新機能をリリースしました。
                  ゲームプレイを客観的に分析し、次のレベルに進むためのヒントを得ましょう。
                </p>

                <h4>メタ分析ダッシュボードの強化</h4>
                <p style={{ color: '#777', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  2025-02-15
                </p>
                <p>
                  チャンピオンのパッチ間比較や時系列での勝率変動をより詳細に分析できるよう、
                  メタ分析ダッシュボードを強化しました。
                </p>
              </div>
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <Link href="/news" passHref>
                  <FeatureLink>すべてのニュースを見る →</FeatureLink>
                </Link>
              </div>
            </LatestCardContent>
          </LatestCard>
        </LatestGrid>
      </LatestSection>
    </>
  );
};

export default Home;
