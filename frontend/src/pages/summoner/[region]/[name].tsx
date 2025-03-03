import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import React, { useState } from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
// import { getSummonerData } from '@/services/api';

// 型定義（TypeScriptインターフェース）
interface SummonerData {
  name: string;
  level: number;
  profileIconId: number;
  rank: {
    tier: string;
    division: string;
    lp: number;
    winRate: number;
    wins: number;
    losses: number;
  };
  recentMatches: Match[];
}

interface Match {
  id: string;
  gameCreation: number;
  gameDuration: number;
  gameMode: string;
  win: boolean;
  championId: number;
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  goldEarned: number;
  visionScore: number;
  items: number[];
  teamPlayers: Player[];
  enemyPlayers: Player[];
}

interface Player {
  summonerName: string;
  championId: number;
  championName: string;
  team: number;
}

// スタイルコンポーネント
const ProfileContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 2rem;
`;

const ProfileHeader = styled.div`
  background-color: #1a1a2e;
  color: white;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const ProfileIcon = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #00bcd4;
`;

const SummonerInfo = styled.div`
  flex: 1;
`;

const SummonerName = styled.h1`
  font-size: 2rem;
  margin: 0 0 0.5rem;
`;

const SummonerLevel = styled.div`
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
`;

const ProfileActions = styled.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const ActionButton = styled.button`
  background-color: #00bcd4;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0097a7;
  }
`;

const ProfileBody = styled.div`
  padding: 2rem;
`;

const ProfileSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0 0 1rem;
  color: #1a1a2e;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.5rem;
`;

const RankedInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const TierIcon = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
`;

const TierInfo = styled.div`
  flex: 1;
`;

const TierName = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const LpInfo = styled.div`
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
`;

const WinRateInfo = styled.div`
  font-size: 1rem;
`;

const WinRate = styled.span<{ rate: number }>`
  color: ${(props) => (props.rate >= 55 ? '#43a047' : props.rate <= 45 ? '#e53935' : '#777')};
  font-weight: 600;
`;

const TabContainer = styled.div`
  margin-bottom: 1rem;
`;

const TabList = styled.div`
  display: flex;
  border-bottom: 1px solid #ddd;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 0.75rem 1.5rem;
  background-color: ${(props) => (props.active ? 'white' : 'transparent')};
  border: none;
  border-bottom: ${(props) => (props.active ? '3px solid #00bcd4' : '3px solid transparent')};
  cursor: pointer;
  font-weight: ${(props) => (props.active ? '600' : '400')};
  transition: all 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const MatchesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MatchCard = styled.div<{ win: boolean }>`
  display: flex;
  background-color: ${(props) => (props.win ? 'rgba(33, 150, 243, 0.05)' : 'rgba(229, 57, 53, 0.05)')};
  border-left: 5px solid ${(props) => (props.win ? '#2196f3' : '#e53935')};
  border-radius: 4px;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const MatchInfo = styled.div`
  display: flex;
  padding: 1rem;
  flex-basis: 25%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-right: 1px solid #eee;

  @media (max-width: 768px) {
    border-right: none;
    border-bottom: 1px solid #eee;
  }
`;

const GameResult = styled.div<{ win: boolean }>`
  font-weight: 600;
  font-size: 1.125rem;
  color: ${(props) => (props.win ? '#2196f3' : '#e53935')};
  margin-bottom: 0.5rem;
`;

const GameMode = styled.div`
  font-size: 0.875rem;
  color: #777;
  margin-bottom: 0.5rem;
`;

const GameTime = styled.div`
  font-size: 0.875rem;
  color: #777;
`;

const MatchDetails = styled.div`
  display: flex;
  flex: 1;
  padding: 1rem;

  @media (max-width: 992px) {
    flex-direction: column;
  }
`;

const ChampionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-basis: 30%;

  @media (max-width: 992px) {
    margin-bottom: 1rem;
  }
`;

const ChampionIcon = styled.div`
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
`;

const ChampionDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const ChampionName = styled.div`
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const StatsInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const KDA = styled.div`
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const KDAValues = styled.span<{ kda: number }>`
  color: ${(props) => {
    if (props.kda >= 5) return '#43a047';
    if (props.kda >= 3) return '#fb8c00';
    if (props.kda >= 2) return '#757575';
    return '#e53935';
  }};
`;

const OtherStats = styled.div`
  font-size: 0.875rem;
  color: #777;
`;

const ItemsInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-basis: 30%;
  flex-wrap: wrap;
  justify-content: flex-end;

  @media (max-width: 992px) {
    justify-content: flex-start;
    margin-top: 1rem;
  }
`;

const ItemIcon = styled.div`
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  overflow: hidden;
  background-color: #f0f0f0;
`;

const PlayersInfo = styled.div`
  display: flex;
  flex-basis: 20%;
  font-size: 0.75rem;

  @media (max-width: 992px) {
    margin-top: 1rem;
  }
`;

const TeamList = styled.div`
  flex: 1;
`;

const TeamHeader = styled.div<{ team: number }>`
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: ${(props) => (props.team === 100 ? '#2196f3' : '#e53935')};
`;

const PlayerItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
`;

const SmallChampIcon = styled.div`
  position: relative;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f0f0f0;
`;

const PlayerName = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
`;

// サンプルデータ（実際はAPIから取得）
const dummySummonerData: SummonerData = {
  name: 'Player123',
  level: 157,
  profileIconId: 4885,
  rank: {
    tier: 'PLATINUM',
    division: 'II',
    lp: 45,
    winRate: 57,
    wins: 124,
    losses: 93,
  },
  recentMatches: [
    {
      id: 'JP1_123456',
      gameCreation: 1646900000000,
      gameDuration: 1825,
      gameMode: 'CLASSIC',
      win: true,
      championId: 103,
      championName: 'Ahri',
      kills: 8,
      deaths: 3,
      assists: 12,
      cs: 187,
      goldEarned: 12500,
      visionScore: 24,
      items: [3020, 3165, 3089, 3135, 3102, 3157],
      teamPlayers: [
        { summonerName: 'Player123', championId: 103, championName: 'Ahri', team: 100 },
        { summonerName: 'TopLaner', championId: 114, championName: 'Fiora', team: 100 },
        { summonerName: 'Jungler', championId: 121, championName: 'Khazix', team: 100 },
        { summonerName: 'ADC', championId: 51, championName: 'Caitlyn', team: 100 },
        { summonerName: 'Support', championId: 432, championName: 'Bard', team: 100 },
      ],
      enemyPlayers: [
        { summonerName: 'Enemy1', championId: 90, championName: 'Malzahar', team: 200 },
        { summonerName: 'Enemy2', championId: 122, championName: 'Darius', team: 200 },
        { summonerName: 'Enemy3', championId: 64, championName: 'LeeSin', team: 200 },
        { summonerName: 'Enemy4', championId: 22, championName: 'Ashe', team: 200 },
        { summonerName: 'Enemy5', championId: 12, championName: 'Alistar', team: 200 },
      ],
    },
    {
      id: 'JP1_123457',
      gameCreation: 1646890000000,
      gameDuration: 2104,
      gameMode: 'CLASSIC',
      win: false,
      championId: 91,
      championName: 'Talon',
      kills: 4,
      deaths: 7,
      assists: 5,
      cs: 156,
      goldEarned: 8900,
      visionScore: 15,
      items: [3147, 3142, 3071, 3158, 3156, 0],
      teamPlayers: [
        { summonerName: 'Player123', championId: 91, championName: 'Talon', team: 100 },
        { summonerName: 'TopLaner', championId: 27, championName: 'Singed', team: 100 },
        { summonerName: 'Jungler', championId: 60, championName: 'Elise', team: 100 },
        { summonerName: 'ADC', championId: 96, championName: 'KogMaw', team: 100 },
        { summonerName: 'Support', championId: 16, championName: 'Soraka', team: 100 },
      ],
      enemyPlayers: [
        { summonerName: 'Enemy1', championId: 238, championName: 'Zed', team: 200 },
        { summonerName: 'Enemy2', championId: 92, championName: 'Riven', team: 200 },
        { summonerName: 'Enemy3', championId: 203, championName: 'Kindred', team: 200 },
        { summonerName: 'Enemy4', championId: 236, championName: 'Lucian', team: 200 },
        { summonerName: 'Enemy5', championId: 25, championName: 'Morgana', team: 200 },
      ],
    },
  ],
};

// サモナーページコンポーネント
const SummonerPage: React.FC = () => {
  const router = useRouter();
  const { region, name } = router.query;
  const [activeTab, setActiveTab] = useState('matches');

  // 実際のAPIリクエスト（実装時はコメントアウトを解除）
  /*
  const { data, isLoading, error } = useQuery(
    ['summonerData', region, name],
    () => getSummonerData(region as string, name as string),
    {
      enabled: !!region && !!name,
      staleTime: 5 * 60 * 1000, // 5分
    }
  );
  */

  // ダミーデータを使用
  const data = dummySummonerData;
  const isLoading = false;
  const error = null;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading summoner data</div>;
  }

  // kda計算ヘルパー関数
  const calculateKDA = (kills: number, deaths: number, assists: number) => {
    if (deaths === 0) return (kills + assists).toFixed(2);
    return ((kills + assists) / deaths).toFixed(2);
  };

  // 時間フォーマットヘルパー関数
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Head>
        <title>{data.name} - LOL Stats Hub</title>
        <meta name="description" content={`View ${data.name}'s League of Legends stats, match history, and more.`} />
      </Head>

      <ProfileContainer>
        <ProfileHeader>
          <ProfileIcon>
            <Image 
              src={`https://ddragon.leagueoflegends.com/cdn/13.24.1/img/profileicon/${data.profileIconId}.png`}
              alt="Summoner Icon"
              layout="fill"
              objectFit="cover"
            />
          </ProfileIcon>

          <SummonerInfo>
            <SummonerName>{data.name}</SummonerName>
            <SummonerLevel>レベル {data.level}</SummonerLevel>
          </SummonerInfo>

          <ProfileActions>
            <ActionButton>更新</ActionButton>
            <ActionButton>ライブゲーム</ActionButton>
          </ProfileActions>
        </ProfileHeader>

        <ProfileBody>
          <ProfileSection>
            <SectionTitle>ランク情報</SectionTitle>
            <RankedInfo>
              <TierIcon>
                <Image 
                  src={`/ranked-emblems/${data.rank.tier.toLowerCase()}.png`}
                  alt={data.rank.tier}
                  layout="fill"
                  objectFit="contain"
                />
              </TierIcon>

              <TierInfo>
                <TierName>
                  {data.rank.tier} {data.rank.division}
                </TierName>
                <LpInfo>{data.rank.lp} LP</LpInfo>
                <WinRateInfo>
                  {data.rank.wins}勝 {data.rank.losses}敗 (
                  <WinRate rate={data.rank.winRate}>{data.rank.winRate}%</WinRate>)
                </WinRateInfo>
              </TierInfo>
            </RankedInfo>
          </ProfileSection>

          <ProfileSection>
            <SectionTitle>試合履歴</SectionTitle>
            <TabContainer>
              <TabList>
                <Tab
                  active={activeTab === 'matches'}
                  onClick={() => setActiveTab('matches')}
                >
                  試合履歴
                </Tab>
                <Tab
                  active={activeTab === 'champions'}
                  onClick={() => setActiveTab('champions')}
                >
                  チャンピオン統計
                </Tab>
                <Tab
                  active={activeTab === 'growth'}
                  onClick={() => setActiveTab('growth')}
                >
                  成長分析
                </Tab>
              </TabList>
            </TabContainer>

            {activeTab === 'matches' && (
              <MatchesList>
                {data.recentMatches.map((match) => {
                  const kda = calculateKDA(match.kills, match.deaths, match.assists);
                  const kdaNum = parseFloat(kda);

                  return (
                    <MatchCard key={match.id} win={match.win}>
                      <MatchInfo>
                        <GameResult win={match.win}>
                          {match.win ? '勝利' : '敗北'}
                        </GameResult>
                        <GameMode>{match.gameMode}</GameMode>
                        <GameTime>
                          {formatDuration(match.gameDuration)}
                        </GameTime>
                      </MatchInfo>

                      <MatchDetails>
                        <ChampionInfo>
                          <ChampionIcon>
                            <Image 
                              src={`https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/${match.championName}.png`}
                              alt={match.championName}
                              layout="fill"
                              objectFit="cover"
                            />
                          </ChampionIcon>

                          <ChampionDetails>
                            <ChampionName>{match.championName}</ChampionName>
                            <div style={{ fontSize: '0.8rem', color: '#777' }}>
                              {new Date(match.gameCreation).toLocaleDateString()}
                            </div>
                          </ChampionDetails>
                        </ChampionInfo>

                        <StatsInfo>
                          <KDA>
                            <KDAValues kda={kdaNum}>
                              {match.kills} / <span style={{ color: '#e53935' }}>{match.deaths}</span> / {match.assists}
                            </KDAValues>
                            <span style={{ marginLeft: '5px', color: '#777', fontSize: '0.9rem' }}>
                              ({kda})
                            </span>
                          </KDA>
                          <OtherStats>
                            CS: {match.cs} ({(match.cs / (match.gameDuration / 60)).toFixed(1)}/分)
                            | Gold: {(match.goldEarned / 1000).toFixed(1)}k
                            | ビジョン: {match.visionScore}
                          </OtherStats>
                        </StatsInfo>

                        <ItemsInfo>
                          {match.items.map((itemId, index) => (
                            <ItemIcon key={index}>
                              {itemId > 0 ? (
                                <Image 
                                  src={`https://ddragon.leagueoflegends.com/cdn/13.24.1/img/item/${itemId}.png`}
                                  alt={`Item ${itemId}`}
                                  layout="fill"
                                  objectFit="cover"
                                />
                              ) : (
                                <div style={{ width: '100%', height: '100%', backgroundColor: '#eee' }} />
                              )}
                            </ItemIcon>
                          ))}
                        </ItemsInfo>

                        <PlayersInfo>
                          <TeamList>
                            <TeamHeader team={100}>味方</TeamHeader>
                            {match.teamPlayers.map((player) => (
                              <PlayerItem key={player.summonerName}>
                                <SmallChampIcon>
                                  <Image 
                                    src={`https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/${player.championName}.png`}
                                    alt={player.championName}
                                    layout="fill"
                                    objectFit="cover"
                                  />
                                </SmallChampIcon>
                                <PlayerName>{player.summonerName}</PlayerName>
                              </PlayerItem>
                            ))}
                          </TeamList>

                          <TeamList>
                            <TeamHeader team={200}>敵チーム</TeamHeader>
                            {match.enemyPlayers.map((player) => (
                              <PlayerItem key={player.summonerName}>
                                <SmallChampIcon>
                                  <Image 
                                    src={`https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/${player.championName}.png`}
                                    alt={player.championName}
                                    layout="fill"
                                    objectFit="cover"
                                  />
                                </SmallChampIcon>
                                <PlayerName>{player.summonerName}</PlayerName>
                              </PlayerItem>
                            ))}
                          </TeamList>
                        </PlayersInfo>
                      </MatchDetails>
                    </MatchCard>
                  );
                })}

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <ActionButton>さらに読み込む</ActionButton>
                </div>
              </MatchesList>
            )}

            {activeTab === 'champions' && (
              <div>
                <p>チャンピオン統計タブの内容（実装予定）</p>
              </div>
            )}

            {activeTab === 'growth' && (
              <div>
                <p>成長分析タブの内容（実装予定）</p>
              </div>
            )}
          </ProfileSection>
        </ProfileBody>
      </ProfileContainer>
    </>
  );
};

// SSR用のデータ取得（実際のAPIが実装されたら使用）
/*
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { region, name } = context.params as { region: string; name: string };

  try {
    const summonerData = await getSummonerData(region, name);
    return {
      props: {
        initialData: summonerData,
      },
    };
  } catch (error) {
    return {
      props: {
        error: 'Failed to fetch summoner data',
      },
    };
  }
};
*/

export default SummonerPage;
