import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import styled from 'styled-components';
import Image from 'next/image';

// 型定義
interface MatchAnalysis {
  matchId: string;
  date: string;
  duration: string;
  result: 'win' | 'loss';
  champion: {
    id: string;
    name: string;
    imageUrl: string;
  };
  kda: {
    kills: number;
    deaths: number;
    assists: number;
    ratio: string;
  };
  cs: {
    total: number;
    perMinute: string;
    difference: number;
  };
  vision: {
    score: number;
    wardsPlaced: number;
    wardsDestroyed: number;
  };
  performance: {
    score: number; // 0-100
    rating: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D';
  };
  insights: {
    strengths: string[];
    weaknesses: string[];
    tips: string[];
  };
  timeline: {
    phase: 'early' | 'mid' | 'late';
    events: {
      time: string;
      type: 'kill' | 'death' | 'objective' | 'teamfight';
      description: string;
      impact: number; // -5 to 5
    }[];
  }[];
}

interface PerformanceTrend {
  category: string;
  data: {
    date: string;
    value: number;
  }[];
  average: number;
  improvement: number; // パーセンテージ
}

interface AIRecommendation {
  category: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  tips: string[];
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

const SummonerSearchContainer = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
`;

const SearchTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #1a1a2e;
`;

const SearchForm = styled.form`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: 200px;
`;

const FormLabel = styled.label`
  font-weight: 500;
  font-size: 0.9rem;
  color: #555;
`;

const FormInput = styled.input`
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  font-size: 1rem;
`;

const FormSelect = styled.select`
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  font-size: 1rem;
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #00bcd4;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #00a0b7;
  }
`;

const TabsContainer = styled.div`
  margin-bottom: 2rem;
`;

const TabsList = styled.div`
  display: flex;
  border-bottom: 1px solid #ddd;
  overflow-x: auto;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 0.75rem 1.5rem;
  background-color: ${(props) => (props.active ? 'white' : 'transparent')};
  border: none;
  border-bottom: ${(props) => (props.active ? '3px solid #00bcd4' : '3px solid transparent')};
  cursor: pointer;
  font-weight: ${(props) => (props.active ? '600' : '400')};
  white-space: nowrap;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const TabContent = styled.div`
  background-color: white;
  border-radius: 0 0 8px 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0 0 1.5rem;
  color: #1a1a2e;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.5rem;
`;

const MatchAnalysisContainer = styled.div`
  margin-bottom: 2rem;
`;

const MatchHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const MatchInfo = styled.div`
  flex: 1;
`;

const MatchTitle = styled.h4`
  font-size: 1.1rem;
  margin: 0 0 0.5rem;
  color: #1a1a2e;
`;

const MatchMeta = styled.div`
  display: flex;
  gap: 1rem;
  color: #666;
  font-size: 0.9rem;
`;

const MatchResult = styled.div<{ result: 'win' | 'loss' }>`
  padding: 0.5rem 1rem;
  background-color: ${(props) => (props.result === 'win' ? 'rgba(67, 160, 71, 0.1)' : 'rgba(229, 57, 53, 0.1)')};
  color: ${(props) => (props.result === 'win' ? '#43a047' : '#e53935')};
  border-radius: 4px;
  font-weight: 600;
`;

const ChampionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ChampionImageContainer = styled.div`
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
`;

const ChampionInfo = styled.div``;

const ChampionName = styled.div`
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const KDAContainer = styled.div`
  font-size: 0.9rem;
`;

const KDAValue = styled.span`
  font-weight: 600;
`;

const KDARatio = styled.span<{ ratio: number }>`
  color: ${(props) => {
    if (props.ratio >= 4) return '#43a047';
    if (props.ratio >= 3) return '#fb8c00';
    return props.ratio >= 2 ? '#757575' : '#e53935';
  }};
  font-weight: 600;
  margin-left: 0.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
`;

const StatTitle = styled.div`
  font-weight: 500;
  margin-bottom: 1rem;
  color: #1a1a2e;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const StatCompare = styled.div<{ positive: boolean }>`
  font-size: 0.9rem;
  color: ${(props) => (props.positive ? '#43a047' : '#e53935')};
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  &::before {
    content: '${(props) => (props.positive ? '↑' : '↓')}';
  }
`;

const PerformanceScore = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ScoreCircle = styled.div<{ score: number }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  background-color: ${(props) => {
    if (props.score >= 90) return '#43a047';
    if (props.score >= 80) return '#7cb342';
    if (props.score >= 70) return '#fb8c00';
    if (props.score >= 60) return '#f4511e';
    return '#e53935';
  }};
`;

const RatingBadge = styled.div<{ rating: string }>`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 600;
  color: white;
  background-color: ${(props) => {
    switch (props.rating) {
      case 'S+': return '#ff4081';
      case 'S': return '#f44336';
      case 'A': return '#ff9800';
      case 'B': return '#4caf50';
      case 'C': return '#2196f3';
      case 'D': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  }};
`;

const InsightsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const InsightCard = styled.div<{ type: 'strength' | 'weakness' | 'tip' }>`
  background-color: ${(props) => {
    switch (props.type) {
      case 'strength': return 'rgba(67, 160, 71, 0.1)';
      case 'weakness': return 'rgba(229, 57, 53, 0.1)';
      case 'tip': return 'rgba(33, 150, 243, 0.1)';
      default: return '#f8f9fa';
    }
  }};
  border-left: 4px solid ${(props) => {
    switch (props.type) {
      case 'strength': return '#43a047';
      case 'weakness': return '#e53935';
      case 'tip': return '#2196f3';
      default: return '#9e9e9e';
    }
  }};
  border-radius: 4px;
  padding: 1.5rem;
`;

const InsightTitle = styled.div`
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1a1a2e;
`;

const InsightList = styled.ul`
  padding-left: 1.5rem;
  margin: 0;
`;

const InsightItem = styled.li`
  margin-bottom: 0.5rem;
  line-height: 1.5;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const TimelineContainer = styled.div`
  margin-bottom: 2rem;
`;

const PhaseTitle = styled.h4`
  font-size: 1.1rem;
  margin: 1.5rem 0 1rem;
  color: #1a1a2e;
`;

const TimelineList = styled.div`
  position: relative;
  padding-left: 2rem;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 8px;
    width: 2px;
    height: 100%;
    background-color: #ddd;
  }
`;

const TimelineEvent = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 4px;
    left: -2rem;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: #1a1a2e;
  }
`;

const EventTime = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #1a1a2e;
`;

const EventDescription = styled.div`
  line-height: 1.5;
`;

const EventImpact = styled.div<{ impact: number }>`
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  color: white;
  background-color: ${(props) => {
    if (props.impact >= 4) return '#43a047';
    if (props.impact >= 2) return '#7cb342';
    if (props.impact >= 0) return '#757575';
    if (props.impact >= -2) return '#f4511e';
    return '#e53935';
  }};
`;

const TrendsContainer = styled.div`
  margin-bottom: 2rem;
`;

const TrendCard = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const TrendHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const TrendTitle = styled.div`
  font-weight: 500;
  color: #1a1a2e;
`;

const TrendImprovement = styled.div<{ value: number }>`
  color: ${(props) => (props.value > 0 ? '#43a047' : props.value < 0 ? '#e53935' : '#757575')};
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  &::before {
    content: '${(props) => (props.value > 0 ? '↑' : props.value < 0 ? '↓' : '')}';
  }
`;

const TrendChart = styled.div`
  height: 200px;
  background-color: #eee;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #777;
`;

const RecommendationsContainer = styled.div`
  margin-bottom: 2rem;
`;

const RecommendationCard = styled.div<{ priority: 'high' | 'medium' | 'low' }>`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-left: 4px solid ${(props) => {
    switch (props.priority) {
      case 'high': return '#e53935';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  }};
`;

const RecommendationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const RecommendationTitle = styled.div`
  font-weight: 500;
  color: #1a1a2e;
`;

const PriorityBadge = styled.div<{ priority: 'high' | 'medium' | 'low' }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  color: white;
  background-color: ${(props) => {
    switch (props.priority) {
      case 'high': return '#e53935';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  }};
`;

const RecommendationDescription = styled.div`
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const RecommendationTips = styled.ul`
  padding-left: 1.5rem;
  margin: 0;
`;

const RecommendationTip = styled.li`
  margin-bottom: 0.5rem;
  line-height: 1.5;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

// ダミーデータ
const dummyMatchAnalysis: MatchAnalysis = {
  matchId: '12345678',
  date: '2025-03-01',
  duration: '32:45',
  result: 'win',
  champion: {
    id: 'Ahri',
    name: 'アーリ',
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Ahri.png',
  },
  kda: {
    kills: 8,
    deaths: 3,
    assists: 12,
    ratio: '6.67',
  },
  cs: {
    total: 215,
    perMinute: '6.5',
    difference: 15,
  },
  vision: {
    score: 28,
    wardsPlaced: 12,
    wardsDestroyed: 4,
  },
  performance: {
    score: 85,
    rating: 'S',
  },
  insights: {
    strengths: [
      'レーン戦での優れたCS取得能力',
      'チームファイトでの効果的なポジショニング',
      'マップ全体への影響力が高い',
      'スキルショットの命中率が高い',
    ],
    weaknesses: [
      'ワードの設置数が平均より少ない',
      '中盤のローミングが不十分',
      'オブジェクト争奪への参加が遅い場面があった',
    ],
    tips: [
      'Eの命中後は必ずQとWを当てるコンボを意識しよう',
      'レベル6到達後は積極的にサイドレーンへのローミングを試みよう',
      'ドラゴン争奪の30秒前にはミッドのウェーブをプッシュしておこう',
      'ビジョンコントロールをより意識し、特に川周辺のワード設置を増やそう',
    ],
  },
  timeline: [
    {
      phase: 'early',
      events: [
        {
          time: '3:45',
          type: 'kill',
          description: '相手ミッドレーナーをソロキル',
          impact: 3,
        },
        {
          time: '6:20',
          type: 'death',
          description: '敵ジャングラーのガンクで死亡',
          impact: -2,
        },
        {
          time: '8:15',
          type: 'objective',
          description: 'スカットルクラブの確保を支援',
          impact: 1,
        },
      ],
    },
    {
      phase: 'mid',
      events: [
        {
          time: '12:30',
          type: 'teamfight',
          description: 'ドラゴン争奪戦で2キル1アシスト獲得',
          impact: 4,
        },
        {
          time: '15:45',
          type: 'objective',
          description: 'ミッドの第一タワーを破壊',
          impact: 3,
        },
        {
          time: '18:20',
          type: 'death',
          description: '敵陣深くで視界なしに進入して死亡',
          impact: -3,
        },
      ],
    },
    {
      phase: 'late',
      events: [
        {
          time: '24:10',
          type: 'teamfight',
          description: 'バロン付近の戦闘で敵キャリーをキャッチして倒す',
          impact: 5,
        },
        {
          time: '27:35',
          type: 'objective',
          description: 'バロンの確保に貢献',
          impact: 4,
        },
        {
          time: '31:20',
          type: 'teamfight',
          description: '最終チームファイトで3キル2アシスト',
          impact: 5,
        },
      ],
    },
  ],
};

const dummyPerformanceTrends: PerformanceTrend[] = [
  {
    category: 'KDA',
    data: [
      { date: '2025-02-01', value: 2.5 },
      { date: '2025-02-08', value: 2.8 },
      { date: '2025-02-15', value: 3.2 },
      { date: '2025-02-22', value: 3.5 },
      { date: '2025-03-01', value: 4.1 },
    ],
    average: 3.2,
    improvement: 15.3,
  },
  {
    category: 'CS/分',
    data: [
      { date: '2025-02-01', value: 5.8 },
      { date: '2025-02-08', value: 6.0 },
      { date: '2025-02-15', value: 6.2 },
      { date: '2025-02-22', value: 6.3 },
      { date: '2025-03-01', value: 6.5 },
    ],
    average: 6.2,
    improvement: 8.5,
  },
  {
    category: 'ビジョンスコア',
    data: [
      { date: '2025-02-01', value: 18 },
      { date: '2025-02-08', value: 20 },
      { date: '2025-02-15', value: 22 },
      { date: '2025-02-22', value: 25 },
      { date: '2025-03-01', value: 28 },
    ],
    average: 22.6,
    improvement: 22.8,
  },
  {
    category: 'ダメージ割合',
    data: [
      { date: '2025-02-01', value: 22 },
      { date: '2025-02-08', value: 24 },
      { date: '2025-02-15', value: 23 },
      { date: '2025-02-22', value: 25 },
      { date: '2025-03-01', value: 27 },
    ],
    average: 24.2,
    improvement: 10.5,
  },
];

const dummyAIRecommendations: AIRecommendation[] = [
  {
    category: 'ビジョンコントロール',
    priority: 'high',
    description: 'ワードの設置数と配置場所に改善の余地があります。特に中盤以降のオブジェクト周辺のビジョン確保が不足しています。',
    tips: [
      'ドラゴンやバロンの争奪戦の1分前には必ずエリア周辺にワードを設置する',
      'コントロールワードを常に1つ所持し、重要なオブジェクト付近に設置する',
      '敵のワードを積極的に排除し、視界の優位性を確保する',
      'サポートと協力して川や敵のジャングル入口にワードを設置する',
    ],
  },
  {
    category: 'マッププレゼンス',
    priority: 'medium',
    description: 'レーン戦は強いですが、他レーンへの影響力をさらに高める余地があります。特にアーリのような機動力の高いチャンピオンでは、マップ全体への圧力が重要です。',
    tips: [
      'レベル6到達後は積極的にサイドレーンへのローミングを行う',
      'ミニマップを頻繁にチェックし、ガンクの機会を見逃さない',
      'テレポートの使用タイミングを工夫し、サイドレーンの戦闘に参加する',
      'ウェーブをプッシュした後の時間を有効活用してジャングラーと連携する',
    ],
  },
  {
    category: 'ポジショニング',
    priority: 'low',
    description: 'チームファイトでのポジショニングは概ね良好ですが、時折危険な位置取りが見られます。特に視界のない場所での単独行動には注意が必要です。',
    tips: [
      'チームから離れて単独行動する際は、敵の位置を常に把握する',
      '視界のない場所に進入する前に、安全を確認する',
      'チームファイトでは後方から参加し、CCを重要なターゲットに使用する',
      'フラッシュなどの生存スキルがない場合は、より慎重なポジショニングを心がける',
    ],
  },
];

const AIAnalysisPage: NextPage = () => {
  const [activeTab, setActiveTab] = useState('matchAnalysis');
  const [summonerName, setSummonerName] = useState('');
  const [region, setRegion] = useState('jp1');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    
    // 実際の実装ではAPIリクエストを行う
    // ダミーデータを使用するため、タイマーでローディング状態を模倣
    setTimeout(() => {
      setIsAnalyzing(false);
      setHasResults(true);
    }, 2000);
  };
  
  return (
    <>
      <Head>
        <title>AI分析 - LOL Stats Hub</title>
        <meta name="description" content="League of Legendsのプレイデータを人工知能で分析し、パフォーマンス向上のためのアドバイスを提供します。" />
      </Head>
      
      <PageContainer>
        <PageHeader>
          <PageTitle>AI分析</PageTitle>
          <PageDescription>
            あなたのプレイデータをAIが分析し、パフォーマンス向上のためのアドバイスを提供します。
            試合の詳細分析、長期的な成長トレンド、カスタマイズされた改善提案を確認できます。
          </PageDescription>
        </PageHeader>
        
        <SummonerSearchContainer>
          <SearchTitle>サモナー検索</SearchTitle>
          <SearchForm onSubmit={handleSubmit}>
            <FormGroup>
              <FormLabel htmlFor="summonerName">サモナー名</FormLabel>
              <FormInput
                id="summonerName"
                type="text"
                placeholder="サモナー名を入力..."
                value={summonerName}
                onChange={(e) => setSummonerName(e.target.value)}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <FormLabel htmlFor="region">リージョン</FormLabel>
              <FormSelect
                id="region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="jp1">日本</option>
                <option value="kr">韓国</option>
                <option value="na1">北米</option>
                <option value="euw1">西ヨーロッパ</option>
                <option value="eun1">北東ヨーロッパ</option>
                <option value="oc1">オセアニア</option>
                <option value="br1">ブラジル</option>
              </FormSelect>
            </FormGroup>
            
            <SubmitButton type="submit" disabled={isAnalyzing}>
              {isAnalyzing ? '分析中...' : '分析する'}
            </SubmitButton>
          </SearchForm>
        </SummonerSearchContainer>
        
        {hasResults && (
          <TabsContainer>
            <TabsList>
              <Tab
                active={activeTab === 'matchAnalysis'}
                onClick={() => setActiveTab('matchAnalysis')}
              >
                試合分析
              </Tab>
              <Tab
                active={activeTab === 'performanceTrends'}
                onClick={() => setActiveTab('performanceTrends')}
              >
                成長トレンド
              </Tab>
              <Tab
                active={activeTab === 'aiRecommendations'}
                onClick={() => setActiveTab('aiRecommendations')}
              >
                AI提案
              </Tab>
            </TabsList>
            
            <TabContent>
              {activeTab === 'matchAnalysis' && (
                <MatchAnalysisContainer>
                  <SectionTitle>最新の試合分析</SectionTitle>
                  
                  <MatchHeader>
                    <ChampionContainer>
                      <ChampionImageContainer>
                        <Image 
                          src={dummyMatchAnalysis.champion.imageUrl}
                          alt={dummyMatchAnalysis.champion.name}
                          layout="fill"
                          objectFit="cover"
                        />
                      </ChampionImageContainer>
                      <ChampionInfo>
                        <ChampionName>{dummyMatchAnalysis.champion.name}</ChampionName>
                        <KDAContainer>
                          <KDAValue>{dummyMatchAnalysis.kda.kills} / {dummyMatchAnalysis.kda.deaths} / {dummyMatchAnalysis.kda.assists}</KDAValue>
                          <KDARatio ratio={parseFloat(dummyMatchAnalysis.kda.ratio)}>
                            ({dummyMatchAnalysis.kda.ratio}:1)
                          </KDARatio>
                        </KDAContainer>
                      </ChampionInfo>
                    </ChampionContainer>
                    
                    <MatchInfo>
                      <MatchTitle>試合ID: {dummyMatchAnalysis.matchId}</MatchTitle>
                      <MatchMeta>
                        <span>{dummyMatchAnalysis.date}</span>
                        <span>プレイ時間: {dummyMatchAnalysis.duration}</span>
                        <MatchResult result={dummyMatchAnalysis.result}>
                          {dummyMatchAnalysis.result === 'win' ? '勝利' : '敗北'}
                        </MatchResult>
                      </MatchMeta>
                    </MatchInfo>
                  </MatchHeader>
                  
                  <PerformanceScore>
                    <ScoreCircle score={dummyMatchAnalysis.performance.score}>
                      {dummyMatchAnalysis.performance.score}
                    </ScoreCircle>
                    <div>
                      <div>パフォーマンススコア</div>
                      <RatingBadge rating={dummyMatchAnalysis.performance.rating}>
                        {dummyMatchAnalysis.performance.rating} ランク
                      </RatingBadge>
                    </div>
                  </PerformanceScore>
                  
                  <StatsGrid>
                    <StatCard>
                      <StatTitle>CS</StatTitle>
                      <StatValue>{dummyMatchAnalysis.cs.total} ({dummyMatchAnalysis.cs.perMinute}/分)</StatValue>
                      <StatCompare positive={dummyMatchAnalysis.cs.difference > 0}>
                        相手より {Math.abs(dummyMatchAnalysis.cs.difference)} {dummyMatchAnalysis.cs.difference > 0 ? '多い' : '少ない'}
                      </StatCompare>
                    </StatCard>
                    
                    <StatCard>
                      <StatTitle>ビジョンスコア</StatTitle>
                      <StatValue>{dummyMatchAnalysis.vision.score}</StatValue>
                      <div>ワード設置: {dummyMatchAnalysis.vision.wardsPlaced}</div>
                      <div>ワード破壊: {dummyMatchAnalysis.vision.wardsDestroyed}</div>
                    </StatCard>
                  </StatsGrid>
                  
                  <SectionTitle>AIインサイト</SectionTitle>
                  <InsightsContainer>
                    <InsightCard type="strength">
                      <InsightTitle>強み</InsightTitle>
                      <InsightList>
                        {dummyMatchAnalysis.insights.strengths.map((strength, index) => (
                          <InsightItem key={index}>{strength}</InsightItem>
                        ))}
                      </InsightList>
                    </InsightCard>
                    
                    <InsightCard type="weakness">
                      <InsightTitle>改善点</InsightTitle>
                      <InsightList>
                        {dummyMatchAnalysis.insights.weaknesses.map((weakness, index) => (
                          <InsightItem key={index}>{weakness}</InsightItem>
                        ))}
                      </InsightList>
                    </InsightCard>
                    
                    <InsightCard type="tip">
                      <InsightTitle>アドバイス</InsightTitle>
                      <InsightList>
                        {dummyMatchAnalysis.insights.tips.map((tip, index) => (
                          <InsightItem key={index}>{tip}</InsightItem>
                        ))}
                      </InsightList>
                    </InsightCard>
                  </InsightsContainer>
                  
                  <SectionTitle>試合タイムライン</SectionTitle>
                  <TimelineContainer>
                    {dummyMatchAnalysis.timeline.map((phase) => (
                      <div key={phase.phase}>
                        <PhaseTitle>
                          {phase.phase === 'early' && '序盤 (0:00-10:00)'}
                          {phase.phase === 'mid' && '中盤 (10:00-20:00)'}
                          {phase.phase === 'late' && '終盤 (20:00-)'}
                        </PhaseTitle>
                        <TimelineList>
                          {phase.events.map((event, index) => (
                            <TimelineEvent key={index}>
                              <EventTime>{event.time}</EventTime>
                              <EventDescription>{event.description}</EventDescription>
                              <EventImpact impact={event.impact}>
                                影響度: {event.impact > 0 ? '+' : ''}{event.impact}
                              </EventImpact>
                            </TimelineEvent>
                          ))}
                        </TimelineList>
                      </div>
                    ))}
                  </TimelineContainer>
                </MatchAnalysisContainer>
              )}
              
              {activeTab === 'performanceTrends' && (
                <TrendsContainer>
                  <SectionTitle>成長トレンド分析</SectionTitle>
                  
                  {dummyPerformanceTrends.map((trend) => (
                    <TrendCard key={trend.category}>
                      <TrendHeader>
                        <TrendTitle>{trend.category}</TrendTitle>
                        <TrendImprovement value={trend.improvement}>
                          {trend.improvement > 0 ? '+' : ''}{trend.improvement}% (過去30日)
                        </TrendImprovement>
                      </TrendHeader>
                      <TrendChart>
                        グラフ表示エリア（実装時にはChart.jsなどで実装）
                      </TrendChart>
                      <div>平均: {trend.average}</div>
                    </TrendCard>
                  ))}
                  
                  <div>
                    <p>
                      過去30日間のデータを分析した結果、特にビジョンスコアとKDAに大きな改善が見られます。
                      CSの取得効率も徐々に向上しており、全体的なプレイスキルの成長が確認できます。
                    </p>
                  </div>
                </TrendsContainer>
              )}
              
              {activeTab === 'aiRecommendations' && (
                <RecommendationsContainer>
                  <SectionTitle>AI改善提案</SectionTitle>
                  
                  <p>
                    あなたのプレイスタイルと統計データを分析した結果、以下の改善点が見つかりました。
                    優先度の高い項目から取り組むことで、より効率的にスキル向上が期待できます。
                  </p>
                  
                  {dummyAIRecommendations.map((recommendation) => (
                    <RecommendationCard key={recommendation.category} priority={recommendation.priority}>
                      <RecommendationHeader>
                        <RecommendationTitle>{recommendation.category}</RecommendationTitle>
                        <PriorityBadge priority={recommendation.priority}>
                          {recommendation.priority === 'high' && '優先度: 高'}
                          {recommendation.priority === 'medium' && '優先度: 中'}
                          {recommendation.priority === 'low' && '優先度: 低'}
                        </PriorityBadge>
                      </RecommendationHeader>
                      <RecommendationDescription>
                        {recommendation.description}
                      </RecommendationDescription>
                      <RecommendationTips>
                        {recommendation.tips.map((tip, index) => (
                          <RecommendationTip key={index}>{tip}</RecommendationTip>
                        ))}
                      </RecommendationTips>
                    </RecommendationCard>
                  ))}
                </RecommendationsContainer>
              )}
            </TabContent>
          </TabsContainer>
        )}
      </PageContainer>
    </>
  );
};

export default AIAnalysisPage;
