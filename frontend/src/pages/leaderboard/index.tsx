import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import styled from 'styled-components';
import Link from 'next/link';
import Image from 'next/image';

// 型定義
interface LeaderboardPlayer {
  rank: number;
  summonerId: string;
  summonerName: string;
  profileIconId: number;
  tier: string;
  tierRank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  winRate: string;
  hotStreak: boolean;
  veteran: boolean;
  freshBlood: boolean;
  inactive: boolean;
  mainRole: string;
  mainChampions: {
    id: string;
    name: string;
    imageUrl: string;
    games: number;
    winRate: string;
  }[];
}

// スタイルコンポーネント
const PageContainer = styled.div`
  padding: 2rem 0;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #1a1a2e;
`;

const PageDescription = styled.p`
  color: #666;
  margin-bottom: 1.5rem;
`;

const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-weight: 500;
  font-size: 0.9rem;
  color: #555;
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: white;
  min-width: 150px;
`;

const LeaderboardContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const LeaderboardTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background-color: #1a1a2e;
  color: white;
`;

const TableHeaderRow = styled.tr``;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 500;
  
  &:first-child {
    text-align: center;
    width: 60px;
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  
  &:first-child {
    text-align: center;
    font-weight: 600;
  }
`;

const RankCell = styled(TableCell)<{ rank: number }>`
  color: ${(props) => {
    if (props.rank === 1) return '#ffd700'; // Gold
    if (props.rank === 2) return '#c0c0c0'; // Silver
    if (props.rank === 3) return '#cd7f32'; // Bronze
    return '#1a1a2e';
  }};
  font-weight: 700;
`;

const SummonerCell = styled(TableCell)`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ProfileIconContainer = styled.div`
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
`;

const SummonerInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const SummonerName = styled.div`
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const SummonerTier = styled.div`
  font-size: 0.8rem;
  color: #666;
`;

const WinRateCell = styled(TableCell)<{ winRate: number }>`
  color: ${(props) => (props.winRate >= 55 ? '#43a047' : props.winRate <= 45 ? '#e53935' : '#1a1a2e')};
  font-weight: 500;
`;

const MainChampionsCell = styled(TableCell)`
  display: flex;
  gap: 0.5rem;
`;

const ChampionIcon = styled.div`
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
`;

const HotStreakBadge = styled.span`
  display: inline-block;
  padding: 0.2rem 0.4rem;
  background-color: #ff9800;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 4px;
  margin-left: 0.5rem;
`;

const FreshBloodBadge = styled.span`
  display: inline-block;
  padding: 0.2rem 0.4rem;
  background-color: #2196f3;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 4px;
  margin-left: 0.5rem;
`;

const VeteranBadge = styled.span`
  display: inline-block;
  padding: 0.2rem 0.4rem;
  background-color: #9c27b0;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 4px;
  margin-left: 0.5rem;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  gap: 0.5rem;
`;

const PageButton = styled.button<{ active?: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid ${(props) => (props.active ? '#00bcd4' : '#ddd')};
  background-color: ${(props) => (props.active ? '#00bcd4' : 'white')};
  color: ${(props) => (props.active ? 'white' : '#333')};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${(props) => (props.active ? '#00bcd4' : '#f5f5f5')};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// ダミーデータ
const dummyLeaderboardData: LeaderboardPlayer[] = [
  {
    rank: 1,
    summonerId: 'player1',
    summonerName: 'T1 Faker',
    profileIconId: 5026,
    tier: 'CHALLENGER',
    tierRank: 'I',
    leaguePoints: 1456,
    wins: 358,
    losses: 245,
    winRate: '59.4',
    hotStreak: true,
    veteran: true,
    freshBlood: false,
    inactive: false,
    mainRole: 'MIDDLE',
    mainChampions: [
      { id: 'Ahri', name: 'アーリ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Ahri.png', games: 85, winRate: '62.3' },
      { id: 'Zed', name: 'ゼド', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Zed.png', games: 65, winRate: '58.5' },
      { id: 'Syndra', name: 'シンドラ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Syndra.png', games: 52, winRate: '55.8' },
    ],
  },
  {
    rank: 2,
    summonerId: 'player2',
    summonerName: 'DRX Pyosik',
    profileIconId: 5212,
    tier: 'CHALLENGER',
    tierRank: 'I',
    leaguePoints: 1389,
    wins: 325,
    losses: 240,
    winRate: '57.5',
    hotStreak: false,
    veteran: true,
    freshBlood: false,
    inactive: false,
    mainRole: 'JUNGLE',
    mainChampions: [
      { id: 'Hecarim', name: 'ヘカリム', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Hecarim.png', games: 78, winRate: '60.2' },
      { id: 'LeeSin', name: 'リー・シン', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/LeeSin.png', games: 72, winRate: '56.9' },
      { id: 'Khazix', name: 'カジックス', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Khazix.png', games: 65, winRate: '53.8' },
    ],
  },
  {
    rank: 3,
    summonerId: 'player3',
    summonerName: 'GEN Ruler',
    profileIconId: 5187,
    tier: 'CHALLENGER',
    tierRank: 'I',
    leaguePoints: 1352,
    wins: 312,
    losses: 235,
    winRate: '57.0',
    hotStreak: true,
    veteran: true,
    freshBlood: false,
    inactive: false,
    mainRole: 'BOTTOM',
    mainChampions: [
      { id: 'Jinx', name: 'ジンクス', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Jinx.png', games: 92, winRate: '59.8' },
      { id: 'Kaisa', name: 'カイサ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Kaisa.png', games: 85, winRate: '57.6' },
      { id: 'Ezreal', name: 'エズリアル', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Ezreal.png', games: 75, winRate: '54.7' },
    ],
  },
  {
    rank: 4,
    summonerId: 'player4',
    summonerName: 'DK ShowMaker',
    profileIconId: 5312,
    tier: 'CHALLENGER',
    tierRank: 'I',
    leaguePoints: 1298,
    wins: 298,
    losses: 225,
    winRate: '57.0',
    hotStreak: false,
    veteran: true,
    freshBlood: false,
    inactive: false,
    mainRole: 'MIDDLE',
    mainChampions: [
      { id: 'Katarina', name: 'カタリナ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Katarina.png', games: 68, winRate: '58.8' },
      { id: 'Yasuo', name: 'ヤスオ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Yasuo.png', games: 62, winRate: '56.5' },
      { id: 'Zoe', name: 'ゾーイ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Zoe.png', games: 55, winRate: '54.5' },
    ],
  },
  {
    rank: 5,
    summonerId: 'player5',
    summonerName: 'T1 Keria',
    profileIconId: 5102,
    tier: 'CHALLENGER',
    tierRank: 'I',
    leaguePoints: 1265,
    wins: 285,
    losses: 220,
    winRate: '56.4',
    hotStreak: false,
    veteran: true,
    freshBlood: false,
    inactive: false,
    mainRole: 'SUPPORT',
    mainChampions: [
      { id: 'Thresh', name: 'スレッシュ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Thresh.png', games: 95, winRate: '58.9' },
      { id: 'Lulu', name: 'ルル', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Lulu.png', games: 82, winRate: '56.1' },
      { id: 'Yuumi', name: 'ユーミ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Yuumi.png', games: 65, winRate: '53.8' },
    ],
  },
  {
    rank: 6,
    summonerId: 'player6',
    summonerName: 'GEN Chovy',
    profileIconId: 5245,
    tier: 'CHALLENGER',
    tierRank: 'I',
    leaguePoints: 1232,
    wins: 275,
    losses: 215,
    winRate: '56.1',
    hotStreak: true,
    veteran: true,
    freshBlood: false,
    inactive: false,
    mainRole: 'MIDDLE',
    mainChampions: [
      { id: 'Sylas', name: 'サイラス', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Sylas.png', games: 72, winRate: '57.0' },
      { id: 'Akali', name: 'アカリ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Akali.png', games: 65, winRate: '55.4' },
      { id: 'Leblanc', name: 'ルブラン', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Leblanc.png', games: 58, winRate: '53.4' },
    ],
  },
  {
    rank: 7,
    summonerId: 'player7',
    summonerName: 'T1 Zeus',
    profileIconId: 5178,
    tier: 'CHALLENGER',
    tierRank: 'I',
    leaguePoints: 1198,
    wins: 268,
    losses: 212,
    winRate: '55.8',
    hotStreak: false,
    veteran: true,
    freshBlood: false,
    inactive: false,
    mainRole: 'TOP',
    mainChampions: [
      { id: 'Aatrox', name: 'アートロックス', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Aatrox.png', games: 85, winRate: '57.6' },
      { id: 'Fiora', name: 'フィオラ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Fiora.png', games: 75, winRate: '55.0' },
      { id: 'Camille', name: 'カミール', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Camille.png', games: 65, winRate: '53.8' },
    ],
  },
  {
    rank: 8,
    summonerId: 'player8',
    summonerName: 'DK Canyon',
    profileIconId: 5298,
    tier: 'CHALLENGER',
    tierRank: 'I',
    leaguePoints: 1165,
    wins: 255,
    losses: 205,
    winRate: '55.4',
    hotStreak: false,
    veteran: true,
    freshBlood: false,
    inactive: false,
    mainRole: 'JUNGLE',
    mainChampions: [
      { id: 'Graves', name: 'グレイブス', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Graves.png', games: 78, winRate: '56.4' },
      { id: 'Nidalee', name: 'ニダリー', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Nidalee.png', games: 68, winRate: '54.4' },
      { id: 'Viego', name: 'ヴィエゴ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Viego.png', games: 62, winRate: '52.0' },
    ],
  },
  {
    rank: 9,
    summonerId: 'player9',
    summonerName: 'GEN Doran',
    profileIconId: 5156,
    tier: 'CHALLENGER',
    tierRank: 'I',
    leaguePoints: 1132,
    wins: 245,
    losses: 198,
    winRate: '55.3',
    hotStreak: false,
    veteran: true,
    freshBlood: false,
    inactive: false,
    mainRole: 'TOP',
    mainChampions: [
      { id: 'Gnar', name: 'ナー', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Gnar.png', games: 72, winRate: '56.9' },
      { id: 'Jayce', name: 'ジェイス', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Jayce.png', games: 65, winRate: '54.0' },
      { id: 'Kennen', name: 'ケネン', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Kennen.png', games: 58, winRate: '52.0' },
    ],
  },
  {
    rank: 10,
    summonerId: 'player10',
    summonerName: 'DRX Deft',
    profileIconId: 5267,
    tier: 'CHALLENGER',
    tierRank: 'I',
    leaguePoints: 1098,
    wins: 235,
    losses: 192,
    winRate: '55.0',
    hotStreak: true,
    veteran: true,
    freshBlood: false,
    inactive: false,
    mainRole: 'BOTTOM',
    mainChampions: [
      { id: 'Aphelios', name: 'アフェリオス', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Aphelios.png', games: 82, winRate: '56.1' },
      { id: 'Jhin', name: 'ジン', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Jhin.png', games: 75, winRate: '54.7' },
      { id: 'Xayah', name: 'ザヤ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Xayah.png', games: 68, winRate: '52.9' },
    ],
  },
];

const LeaderboardPage: NextPage = () => {
  const [region, setRegion] = useState('kr');
  const [tier, setTier] = useState('challenger');
  const [role, setRole] = useState('all');
  const [page, setPage] = useState(1);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  
  const itemsPerPage = 10;
  const totalPages = Math.ceil(dummyLeaderboardData.length / itemsPerPage);
  
  useEffect(() => {
    // 実際の実装ではAPIからデータを取得
    // const fetchLeaderboard = async () => {
    //   try {
    //     const response = await fetch(`/api/leaderboard?region=${region}&tier=${tier}&role=${role}&page=${page}`);
    //     const data = await response.json();
    //     setLeaderboardData(data);
    //     setLoading(false);
    //   } catch (err) {
    //     console.error('Failed to fetch leaderboard data', err);
    //     setLoading(false);
    //   }
    // };
    
    // fetchLeaderboard();
    
    // ダミーデータを使用
    setLoading(true);
    setTimeout(() => {
      setLeaderboardData(dummyLeaderboardData);
      setLoading(false);
    }, 500);
  }, [region, tier, role, page]);
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };
  
  return (
    <>
      <Head>
        <title>ランキング - LOL Stats Hub</title>
        <meta name="description" content="League of Legendsのトッププレイヤーランキングを確認できます。" />
      </Head>
      
      <PageContainer>
        <PageHeader>
          <PageTitle>ランキング</PageTitle>
          <PageDescription>
            各リージョンのトッププレイヤーランキングを確認できます。
          </PageDescription>
        </PageHeader>
        
        <FilterContainer>
          <FilterGroup>
            <FilterLabel htmlFor="region">リージョン</FilterLabel>
            <FilterSelect
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="kr">韓国</option>
              <option value="jp1">日本</option>
              <option value="na1">北米</option>
              <option value="euw1">西ヨーロッパ</option>
              <option value="eun1">北東ヨーロッパ</option>
              <option value="oc1">オセアニア</option>
              <option value="br1">ブラジル</option>
            </FilterSelect>
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel htmlFor="tier">ティア</FilterLabel>
            <FilterSelect
              id="tier"
              value={tier}
              onChange={(e) => setTier(e.target.value)}
            >
              <option value="challenger">チャレンジャー</option>
              <option value="grandmaster">グランドマスター</option>
              <option value="master">マスター</option>
              <option value="diamond">ダイアモンド</option>
            </FilterSelect>
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel htmlFor="role">ロール</FilterLabel>
            <FilterSelect
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="all">すべて</option>
              <option value="TOP">トップ</option>
              <option value="JUNGLE">ジャングル</option>
              <option value="MIDDLE">ミッド</option>
              <option value="BOTTOM">ボトム</option>
              <option value="SUPPORT">サポート</option>
            </FilterSelect>
          </FilterGroup>
        </FilterContainer>
        
        <LeaderboardContainer>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>ランキングデータを読み込み中...</div>
          ) : (
            <LeaderboardTable>
              <TableHeader>
                <TableHeaderRow>
                  <TableHeaderCell>順位</TableHeaderCell>
                  <TableHeaderCell>サモナー</TableHeaderCell>
                  <TableHeaderCell>LP</TableHeaderCell>
                  <TableHeaderCell>勝率</TableHeaderCell>
                  <TableHeaderCell>メインロール</TableHeaderCell>
                  <TableHeaderCell>得意チャンピオン</TableHeaderCell>
                </TableHeaderRow>
              </TableHeader>
              <TableBody>
                {leaderboardData.map((player) => (
                  <TableRow key={player.summonerId}>
                    <RankCell rank={player.rank}>{player.rank}</RankCell>
                    <SummonerCell>
                      <ProfileIconContainer>
                        <Image 
                          src={`https://ddragon.leagueoflegends.com/cdn/13.24.1/img/profileicon/${player.profileIconId}.png`}
                          alt="Profile Icon"
                          layout="fill"
                          objectFit="cover"
                        />
                      </ProfileIconContainer>
                      <SummonerInfo>
                        <SummonerName>
                          <Link href={`/summoner/kr/${player.summonerName}`}>
                            {player.summonerName}
                          </Link>
                          {player.hotStreak && <HotStreakBadge>連勝中</HotStreakBadge>}
                          {player.freshBlood && <FreshBloodBadge>新規</FreshBloodBadge>}
                          {player.veteran && <VeteranBadge>ベテラン</VeteranBadge>}
                        </SummonerName>
                        <SummonerTier>
                          {tier === 'challenger' && 'チャレンジャー'}
                          {tier === 'grandmaster' && 'グランドマスター'}
                          {tier === 'master' && 'マスター'}
                          {tier === 'diamond' && 'ダイアモンド'}
                        </SummonerTier>
                      </SummonerInfo>
                    </SummonerCell>
                    <TableCell>{player.leaguePoints}</TableCell>
                    <WinRateCell winRate={parseFloat(player.winRate)}>
                      {player.winRate}% ({player.wins}W {player.losses}L)
                    </WinRateCell>
                    <TableCell>
                      {player.mainRole === 'TOP' && 'トップ'}
                      {player.mainRole === 'JUNGLE' && 'ジャングル'}
                      {player.mainRole === 'MIDDLE' && 'ミッド'}
                      {player.mainRole === 'BOTTOM' && 'ボトム'}
                      {player.mainRole === 'SUPPORT' && 'サポート'}
                    </TableCell>
                    <MainChampionsCell>
                      {player.mainChampions.map((champion) => (
                        <ChampionIcon key={champion.id} title={`${champion.name} (${champion.winRate}%, ${champion.games}試合)`}>
                          <Image 
                            src={champion.imageUrl}
                            alt={champion.name}
                            layout="fill"
                            objectFit="cover"
                          />
                        </ChampionIcon>
                      ))}
                    </MainChampionsCell>
                  </TableRow>
                ))}
              </TableBody>
            </LeaderboardTable>
          )}
        </LeaderboardContainer>
        
        <Pagination>
          <PageButton
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            前へ
          </PageButton>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <PageButton
              key={pageNum}
              active={pageNum === page}
              onClick={() => handlePageChange(pageNum)}
            >
              {pageNum}
            </PageButton>
          ))}
          
          <PageButton
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            次へ
          </PageButton>
        </Pagination>
      </PageContainer>
    </>
  );
};

export default LeaderboardPage;
