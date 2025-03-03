import React, { useState, useEffect } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import styled from 'styled-components';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

// 型定義
interface ChampionDetail {
  id: string;
  key: string;
  name: string;
  title: string;
  lore: string;
  allytips: string[];
  enemytips: string[];
  tags: string[];
  info: {
    attack: number;
    defense: number;
    magic: number;
    difficulty: number;
  };
  stats: {
    hp: number;
    hpperlevel: number;
    mp: number;
    mpperlevel: number;
    movespeed: number;
    armor: number;
    armorperlevel: number;
    spellblock: number;
    spellblockperlevel: number;
    attackrange: number;
    hpregen: number;
    hpregenperlevel: number;
    mpregen: number;
    mpregenperlevel: number;
    crit: number;
    critperlevel: number;
    attackdamage: number;
    attackdamageperlevel: number;
    attackspeedperlevel: number;
    attackspeed: number;
  };
  image: {
    full: string;
    sprite: string;
    group: string;
    url: string;
  };
  skins: {
    id: string;
    num: number;
    name: string;
    chromas: boolean;
    imageUrl: string;
  }[];
  spells: {
    id: string;
    name: string;
    description: string;
    tooltip: string;
    maxrank: number;
    cooldown: number[];
    cost: number[];
    range: number[];
    imageUrl: string;
  }[];
  passive: {
    name: string;
    description: string;
    imageUrl: string;
  };
}

interface ChampionStats {
  winRate: string;
  pickRate: string;
  banRate: string;
  tier: string;
  roleDistribution: {
    [key: string]: string;
  };
  bestRole: {
    role: string;
    winRate: string;
    pickRate: string;
  };
  performance: {
    averageKills: string;
    averageDeaths: string;
    averageAssists: string;
    kda: string;
    averageGold: number;
    averageDamage: number;
    averageCS: string;
    averageVisionScore: string;
  };
  trends: {
    winRateTrend: { patch: string; winRate: string }[];
    pickRateTrend: { patch: string; pickRate: string }[];
    banRateTrend: { patch: string; banRate: string }[];
  };
}

interface ChampionBuilds {
  startingItems: {
    items: number[];
    names: string[];
    winRate: string;
    pickRate: string;
    imageUrls: string[];
  }[];
  coreItems: {
    items: number[];
    names: string[];
    winRate: string;
    pickRate: string;
    imageUrls: string[];
  }[];
  boots: {
    itemId: number;
    name: string;
    winRate: string;
    pickRate: string;
    imageUrl: string;
  }[];
  summonerSpells: {
    spells: string[];
    winRate: string;
    pickRate: string;
    imageUrls: string[];
  }[];
  skillOrder: {
    order: string[];
    priority: string;
    winRate: string;
    pickRate: string;
  }[];
  runes: {
    primaryPath: string;
    primaryRunes: string[];
    secondaryPath: string;
    secondaryRunes: string[];
    statRunes: string[];
    winRate: string;
    pickRate: string;
  }[];
}

interface ChampionCounters {
  weakAgainst: {
    championId: string;
    championName: string;
    imageUrl: string;
    winRate: string;
    games: number;
    statsDiff: {
      kills: string;
      deaths: string;
      assists: string;
      gold: number;
      cs: number;
    };
    difficulty: number;
  }[];
  strongAgainst: {
    championId: string;
    championName: string;
    imageUrl: string;
    winRate: string;
    games: number;
    statsDiff: {
      kills: string;
      deaths: string;
      assists: string;
      gold: number;
      cs: number;
    };
    difficulty: number;
  }[];
  tips: {
    whenFacingAgainst: string[];
    whenPlayingAs: string[];
  };
}

// スタイルコンポーネント
const PageContainer = styled.div`
  padding: 2rem 0;
`;

const BreadcrumbNav = styled.div`
  margin-bottom: 1rem;
  font-size: 0.9rem;
  
  a {
    color: #00bcd4;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  span {
    margin: 0 0.5rem;
    color: #777;
  }
`;

const ChampionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const ChampionImageContainer = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #00bcd4;
  flex-shrink: 0;
`;

const ChampionInfo = styled.div`
  flex: 1;
`;

const ChampionName = styled.h1`
  font-size: 2.5rem;
  margin: 0 0 0.25rem;
  color: #1a1a2e;
`;

const ChampionTitle = styled.p`
  font-size: 1.25rem;
  color: #666;
  margin: 0 0 1rem;
`;

const ChampionTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ChampionTag = styled.span`
  font-size: 0.8rem;
  background-color: #f0f0f0;
  color: #555;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
`;

const ChampionStats = styled.div`
  display: flex;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatLabel = styled.span`
  font-size: 0.8rem;
  color: #777;
  margin-bottom: 0.25rem;
`;

const StatValue = styled.span<{ value: number }>`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${(props) => {
    if (props.value >= 8) return '#43a047';
    if (props.value >= 5) return '#fb8c00';
    return '#e53935';
  }};
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

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0 0 1.5rem;
  color: #1a1a2e;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.5rem;
`;

const LoreText = styled.p`
  line-height: 1.6;
  color: #333;
  margin-bottom: 2rem;
`;

const TipsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const TipsSection = styled.div``;

const TipsTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0 0 1rem;
  color: #1a1a2e;
`;

const TipsList = styled.ul`
  padding-left: 1.5rem;
`;

const TipItem = styled.li`
  margin-bottom: 0.75rem;
  line-height: 1.5;
`;

const AbilitiesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const AbilityItem = styled.div`
  display: flex;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const AbilityIconContainer = styled.div`
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
`;

const AbilityInfo = styled.div`
  flex: 1;
`;

const AbilityHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const AbilityName = styled.h3`
  font-size: 1.25rem;
  margin: 0;
  color: #1a1a2e;
`;

const AbilityKey = styled.span`
  font-size: 0.8rem;
  background-color: #1a1a2e;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
`;

const AbilityDescription = styled.p`
  line-height: 1.5;
  color: #333;
  margin-bottom: 0.5rem;
`;

const AbilityDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
`;

const AbilityDetail = styled.div``;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 992px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const StatsChart = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #777;
`;

const StatsInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const StatName = styled.span`
  color: #555;
`;

const StatValueText = styled.span<{ positive?: boolean }>`
  font-weight: 500;
  color: ${(props) => (props.positive ? '#43a047' : '#e53935')};
`;

const RoleDistribution = styled.div`
  margin-top: 2rem;
`;

const RoleBar = styled.div`
  display: flex;
  height: 30px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const RoleBarSegment = styled.div<{ width: string; color: string }>`
  width: ${(props) => props.width};
  background-color: ${(props) => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
`;

const RoleLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const RoleLegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
`;

const RoleColor = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  background-color: ${(props) => props.color};
  border-radius: 4px;
`;

const BuildsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 992px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const BuildSection = styled.div`
  margin-bottom: 2rem;
`;

const BuildTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0 0 1rem;
  color: #1a1a2e;
`;

const ItemsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const ItemBox = styled.div`
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 4px;
  overflow: hidden;
  background-color: #f0f0f0;
`;

const BuildStats = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.5rem;
`;

const WinRate = styled.span<{ rate: number }>`
  color: ${(props) => (props.rate >= 52 ? '#43a047' : props.rate <= 48 ? '#e53935' : '#777')};
  font-weight: 500;
`;

const SkillOrderContainer = styled.div`
  margin-bottom: 2rem;
`;

const SkillOrderTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
`;

const SkillOrderRow = styled.tr`
  &:nth-child(even) {
    background-color: #f8f9fa;
  }
`;

const SkillOrderHeader = styled.th`
  padding: 0.75rem;
  text-align: center;
  border-bottom: 2px solid #eee;
  font-weight: 500;
  color: #555;
`;

const SkillOrderCell = styled.td<{ highlight?: boolean }>`
  padding: 0.75rem;
  text-align: center;
  border-bottom: 1px solid #eee;
  background-color: ${(props) => (props.highlight ? 'rgba(0, 188, 212, 0.1)' : 'transparent')};
  font-weight: ${(props) => (props.highlight ? '600' : '400')};
`;

const RunesContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 992px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const RuneSet = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const RunePathTitle = styled.div`
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1a1a2e;
`;

const RunesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const RuneItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const RuneIcon = styled.div`
  width: 32px;
  height: 32px;
  background-color: #ddd;
  border-radius: 50%;
`;

const RuneName = styled.span`
  font-size: 0.9rem;
  color: #333;
`;

const CountersContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const CountersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CounterItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  gap: 1rem;
`;

const CounterChampIcon = styled.div`
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
`;

const CounterInfo = styled.div`
  flex: 1;
`;

const CounterName = styled.div`
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const CounterStats = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #666;
`;

const CounterWinRate = styled.span<{ favorable: boolean }>`
  color: ${(props) => (props.favorable ? '#43a047' : '#e53935')};
  font-weight: 500;
`;

const DifficultyBadge = styled.span<{ level: number }>`
  display: inline-block;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
  background-color: ${(props) => {
    switch (props.level) {
      case 1: return '#43a047'; // 簡単
      case 2: return '#7cb342';
      case 3: return '#fb8c00';
      case 4: return '#f4511e';
      case 5: return '#e53935'; // 難しい
      default: return '#9e9e9e';
    }
  }};
`;

// ダミーデータ
const dummyChampionStats: ChampionStats = {
  winRate: '51.5',
  pickRate: '7.2',
  banRate: '4.8',
  tier: 'B',
  roleDistribution: {
    TOP: '65.2',
    JUNGLE: '25.3',
    MIDDLE: '8.5',
    BOTTOM: '0.5',
    SUPPORT: '0.5',
  },
  bestRole: {
    role: 'TOP',
    winRate: '52.3',
    pickRate: '12.5',
  },
  performance: {
    averageKills: '5.8',
    averageDeaths: '4.2',
    averageAssists: '6.3',
    kda: '2.88',
    averageGold: 12500,
    averageDamage: 18500,
    averageCS: '185.5',
    averageVisionScore: '22.3',
  },
  trends: {
    winRateTrend: [
      { patch: '14.1', winRate: '49.8' },
      { patch: '14.2', winRate: '50.3' },
      { patch: '14.3', winRate: '51.2' },
      { patch: '14.4', winRate: '51.5' },
      { patch: '14.5', winRate: '51.5' },
    ],
    pickRateTrend: [
      { patch: '14.1', pickRate: '5.3' },
      { patch: '14.2', pickRate: '6.1' },
      { patch: '14.3', pickRate: '6.8' },
      { patch: '14.4', pickRate: '7.2' },
      { patch: '14.5', pickRate: '7.2' },
    ],
    banRateTrend: [
      { patch: '14.1', banRate: '3.2' },
      { patch: '14.2', banRate: '3.8' },
      { patch: '14.3', banRate: '4.5' },
      { patch: '14.4', banRate: '4.8' },
      { patch: '14.5', banRate: '4.8' },
    ],
  },
};

const dummyChampionBuilds: ChampionBuilds = {
  startingItems: [
    {
      items: [1055, 2003],
      names: ['ドーランの剣', 'ヘルスポーション'],
      winRate: '52.5',
      pickRate: '65.3',
      imageUrls: [
        'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/item/1055.png',
        'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/item/2003.png',
      ],
    },
    {
      items: [1054, 2003],
      names: ['ドーランのシールド', 'ヘルスポーション'],
      winRate: '51.2',
      pickRate: '25.8',
      imageUrls: [
        'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/item/1054.png',
        'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/item/2003.png',
      ],
    },
  ],
  coreItems: [
    {
      items: [3153, 3071, 3053],
      names: ['ブレード・オブ・ザ・ルイン・キング', 'ブラック・クリーバー', 'スターラックの籠手'],
      winRate: '53.8',
      pickRate: '42.5',
      imageUrls: [
        'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/item/3153.png',
        'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/item/3071.png',
        'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/item/3053.png',
      ],
    },
    {
      items: [3153, 3074, 3053],
      names: ['ブレード・オブ・ザ・ルイン・キング', 'ラヴェナス・ハイドラ', 'スターラックの籠手'],
      winRate: '52.3',
      pickRate: '28.7',
      imageUrls: [
        'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/item/3153.png',
        'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/item/3074.png',
        'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/item/3053.png',
      ],
    },
  ],
  boots: [
    {
      itemId: 3047,
      name: 'プレートドブーツ',
      winRate: '52.5',
      pickRate: '45.3',
      imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/item/3047.png',
    },
    {
      itemId: 3111,
      name: 'マーキュリー・トレッド',
      winRate: '51.8',
      pickRate: '38.7',
      imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/item/3111.png',
    },
  ],
  summonerSpells: [
    {
      spells: ['Flash', 'Teleport'],
      winRate: '52.3',
      pickRate: '78.5',
      imageUrls: [
        'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/spell/SummonerFlash.png',
        'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/spell/SummonerTeleport.png',
      ],
    },
    {
      spells: ['Flash', 'Ignite'],
      winRate: '53.1',
      pickRate: '15.2',
      imageUrls: [
        'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/spell/SummonerFlash.png',
        'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/spell/SummonerDot.png',
      ],
    },
  ],
  skillOrder: [
    {
      order: ['Q', 'E', 'W', 'Q', 'Q', 'R', 'Q', 'E', 'Q', 'E', 'R', 'E', 'E', 'W', 'W'],
      priority: 'Q > E > W',
      winRate: '52.5',
      pickRate: '65.3',
    },
    {
      order: ['Q', 'W', 'E', 'Q', 'Q', 'R', 'Q', 'W', 'Q', 'W', 'R', 'W', 'W', 'E', 'E'],
      priority: 'Q > W > E',
      winRate: '51.2',
      pickRate: '25.8',
    },
  ],
  runes: [
    {
      primaryPath: 'Precision',
      primaryRunes: ['Conqueror', 'Triumph', 'Legend: Alacrity', 'Last Stand'],
      secondaryPath: 'Resolve',
      secondaryRunes: ['Second Wind', 'Unflinching'],
      statRunes: ['Adaptive Force', 'Adaptive Force', 'Armor'],
      winRate: '52.8',
      pickRate: '58.5',
    },
    {
      primaryPath: 'Precision',
      primaryRunes: ['Press the Attack', 'Triumph', 'Legend: Alacrity', 'Coup de Grace'],
      secondaryPath: 'Domination',
      secondaryRunes: ['Taste of Blood', 'Ravenous Hunter'],
      statRunes: ['Adaptive Force', 'Adaptive Force', 'Armor'],
      winRate: '51.5',
      pickRate: '22.3',
    },
  ],
};

const dummyChampionCounters: ChampionCounters = {
  weakAgainst: [
    {
      championId: 'Fiora',
      championName: 'フィオラ',
      imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Fiora.png',
      winRate: '45.2',
      games: 3250,
      statsDiff: {
        kills: '-1.2',
        deaths: '+0.8',
        assists: '-0.5',
        gold: -850,
        cs: -15,
      },
      difficulty: 4,
    },
    {
      championId: 'Jax',
      championName: 'ジャックス',
      imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Jax.png',
      winRate: '46.5',
      games: 2850,
      statsDiff: {
        kills: '-0.9',
        deaths: '+0.6',
        assists: '-0.3',
        gold: -650,
        cs: -12,
      },
      difficulty: 3,
    },
    {
      championId: 'Darius',
      championName: 'ダリウス',
      imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Darius.png',
      winRate: '47.8',
      games: 3580,
      statsDiff: {
        kills: '-0.7',
        deaths: '+0.5',
        assists: '-0.2',
        gold: -450,
        cs: -8,
      },
      difficulty: 3,
    },
  ],
  strongAgainst: [
    {
      championId: 'Kayle',
      championName: 'ケイル',
      imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Kayle.png',
      winRate: '56.8',
      games: 2150,
      statsDiff: {
        kills: '+1.5',
        deaths: '-0.7',
        assists: '+0.4',
        gold: 950,
        cs: 18,
      },
      difficulty: 2,
    },
    {
      championId: 'Teemo',
      championName: 'ティーモ',
      imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Teemo.png',
      winRate: '55.3',
      games: 1850,
      statsDiff: {
        kills: '+1.2',
        deaths: '-0.5',
        assists: '+0.3',
        gold: 750,
        cs: 15,
      },
      difficulty: 2,
    },
    {
      championId: 'Gnar',
      championName: 'ナー',
      imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Gnar.png',
      winRate: '54.5',
      games: 2350,
      statsDiff: {
        kills: '+0.9',
        deaths: '-0.4',
        assists: '+0.2',
        gold: 550,
        cs: 12,
      },
      difficulty: 3,
    },
  ],
  tips: {
    whenFacingAgainst: [
      'このチャンピオンのQスキルは回避可能なので、使用タイミングを見極めて横に動いて避けましょう。',
      'このチャンピオンはレベル6でのオールインが強力です。体力が低い時は警戒しましょう。',
      'このチャンピオンは序盤が弱いため、早期にプレッシャーをかけると有利になります。',
      'このチャンピオンのアルティメットのクールダウン中に攻めると有利です。',
    ],
    whenPlayingAs: [
      'Qスキルは主要なダメージソースなので、命中率を高めることが重要です。',
      'レベル6になったらオールインのチャンスを狙いましょう。',
      'このチャンピオンはスプリットプッシュが得意なので、サイドレーンでプレッシャーをかけましょう。',
      'チームファイトでは敵のキャリーを狙いましょう。',
    ],
  },
};

const ChampionDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [champion, setChampion] = useState<ChampionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // チャンピオンデータをフェッチする関数（実際の実装ではAPIから取得）
  useEffect(() => {
    if (!id) return;
    
    const fetchChampionDetail = async () => {
      try {
        // 実際の実装ではAPIからデータを取得
        // const response = await fetch(`/api/champions/${id}`);
        // const data = await response.json();
        
        // ダミーデータを使用
        const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/13.24.1/data/ja_JP/champion/${id}.json`);
        const data = await response.json();
        
        if (!data.data || !data.data[id as string]) {
          setError('チャンピオンが見つかりませんでした');
          setLoading(false);
          return;
        }
        
        const championData = data.data[id as string];
        
        // スキン情報を整形
        const skins = championData.skins.map((skin: any) => ({
          id: skin.id,
          num: skin.num,
          name: skin.name,
          chromas: skin.chromas,
          imageUrl: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${id}_${skin.num}.jpg`,
        }));
        
        // スキル情報を整形
        const spells = championData.spells.map((spell: any) => ({
          id: spell.id,
          name: spell.name,
          description: spell.description,
          tooltip: spell.tooltip,
          maxrank: spell.maxrank,
          cooldown: spell.cooldown,
          cost: spell.cost,
          range: spell.range,
          imageUrl: `https://ddragon.leagueoflegends.com/cdn/13.24.1/img/spell/${spell.id}.png`,
        }));
        
        // パッシブ情報を整形
        const passive = {
          name: championData.passive.name,
          description: championData.passive.description,
          imageUrl: `https://ddragon.leagueoflegends.com/cdn/13.24.1/img/passive/${championData.passive.image.full}`,
        };
        
        // チャンピオン詳細情報を整形
        const formattedChampion: ChampionDetail = {
          id: championData.id,
          key: championData.key,
          name: championData.name,
          title: championData.title,
          lore: championData.lore,
          allytips: championData.allytips,
          enemytips: championData.enemytips,
          tags: championData.tags,
          info: championData.info,
          stats: championData.stats,
          image: {
            full: championData.image.full,
            sprite: championData.image.sprite,
            group: championData.image.group,
            url: `https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/${championData.image.full}`,
          },
          skins,
          spells,
          passive,
        };
        
        setChampion(formattedChampion);
        setLoading(false);
      } catch (err) {
        setError('チャンピオンデータの取得に失敗しました');
        setLoading(false);
      }
    };
    
    fetchChampionDetail();
  }, [id]);
  
  if (loading) {
    return <div>チャンピオンデータを読み込み中...</div>;
  }
  
  if (error || !champion) {
    return <div>{error || 'チャンピオンが見つかりませんでした'}</div>;
  }
  
  // ダミーデータを使用
  const stats = dummyChampionStats;
  const builds = dummyChampionBuilds;
  const counters = dummyChampionCounters;
  
  return (
    <>
      <Head>
        <title>{champion.name} - チャンピオン詳細 - LOL Stats Hub</title>
        <meta name="description" content={`${champion.name}の詳細情報、統計、ビルド、カウンターなどを確認できます。`} />
      </Head>
      
      <PageContainer>
        <BreadcrumbNav>
          <Link href="/">
            <a>ホーム</a>
          </Link>
          <span>/</span>
          <Link href="/champions">
            <a>チャンピオン</a>
          </Link>
          <span>/</span>
          <span>{champion.name}</span>
        </BreadcrumbNav>
        
        <ChampionHeader>
          <ChampionImageContainer>
            <Image 
              src={champion.image.url}
              alt={champion.name}
              layout="fill"
              objectFit="cover"
            />
          </ChampionImageContainer>
          
          <ChampionInfo>
            <ChampionName>{champion.name}</ChampionName>
            <ChampionTitle>{champion.title}</ChampionTitle>
            
            <ChampionTags>
              {champion.tags.map((tag) => (
                <ChampionTag key={tag}>{tag}</ChampionTag>
              ))}
            </ChampionTags>
            
            <ChampionStats>
              <StatItem>
                <StatLabel>攻撃力</StatLabel>
                <StatValue value={champion.info.attack}>{champion.info.attack}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>防御力</StatLabel>
                <StatValue value={champion.info.defense}>{champion.info.defense}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>魔法</StatLabel>
                <StatValue value={champion.info.magic}>{champion.info.magic}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>難易度</StatLabel>
                <StatValue value={champion.info.difficulty}>{champion.info.difficulty}</StatValue>
              </StatItem>
            </ChampionStats>
          </ChampionInfo>
        </ChampionHeader>
        
        <TabsContainer>
          <TabsList>
            <Tab
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
            >
              概要
            </Tab>
            <Tab
              active={activeTab === 'abilities'}
              onClick={() => setActiveTab('abilities')}
            >
              アビリティ
            </Tab>
            <Tab
              active={activeTab === 'stats'}
              onClick={() => setActiveTab('stats')}
            >
              統計情報
            </Tab>
            <Tab
              active={activeTab === 'builds'}
              onClick={() => setActiveTab('builds')}
            >
              ビルド
            </Tab>
            <Tab
              active={activeTab === 'counters'}
              onClick={() => setActiveTab('counters')}
            >
              カウンター
            </Tab>
          </TabsList>
          
          <TabContent>
            {activeTab === 'overview' && (
              <>
                <SectionTitle>ストーリー</SectionTitle>
                <LoreText>{champion.lore}</LoreText>
                
                <SectionTitle>プレイのヒント</SectionTitle>
                <TipsContainer>
                  <TipsSection>
                    <TipsTitle>{champion.name}としてプレイする場合</TipsTitle>
                    <TipsList>
                      {champion.allytips.map((tip, index) => (
                        <TipItem key={index}>{tip}</TipItem>
                      ))}
                    </TipsList>
                  </TipsSection>
                  
                  <TipsSection>
                    <TipsTitle>{champion.name}と対峙する場合</TipsTitle>
                    <TipsList>
                      {champion.enemytips.map((tip, index) => (
                        <TipItem key={index}>{tip}</TipItem>
                      ))}
                    </TipsList>
                  </TipsSection>
                </TipsContainer>
              </>
            )}
            
            {activeTab === 'abilities' && (
              <AbilitiesContainer>
                <SectionTitle>アビリティ</SectionTitle>
                
                <AbilityItem>
                  <AbilityIconContainer>
                    <Image 
                      src={champion.passive.imageUrl}
                      alt={champion.passive.name}
                      layout="fill"
                      objectFit="cover"
                    />
                  </AbilityIconContainer>
                  
                  <AbilityInfo>
                    <AbilityHeader>
                      <AbilityName>{champion.passive.name}</AbilityName>
                      <AbilityKey>パッシブ</AbilityKey>
                    </AbilityHeader>
                    <AbilityDescription>{champion.passive.description}</AbilityDescription>
                  </AbilityInfo>
                </AbilityItem>
                
                {champion.spells.map((spell, index) => {
                  const keys = ['Q', 'W', 'E', 'R'];
                  return (
                    <AbilityItem key={spell.id}>
                      <AbilityIconContainer>
                        <Image 
                          src={spell.imageUrl}
                          alt={spell.name}
                          layout="fill"
                          objectFit="cover"
                        />
                      </AbilityIconContainer>
                      
                      <AbilityInfo>
                        <AbilityHeader>
                          <AbilityName>{spell.name}</AbilityName>
                          <AbilityKey>{keys[index]}</AbilityKey>
                        </AbilityHeader>
                        <AbilityDescription>{spell.description}</AbilityDescription>
                        <AbilityDetails>
                          <AbilityDetail>
                            クールダウン: {spell.cooldown.join('/')} 秒
                          </AbilityDetail>
                          <AbilityDetail>
                            コスト: {spell.cost.join('/')}
                          </AbilityDetail>
                          <AbilityDetail>
                            射程: {spell.range[0]}
                          </AbilityDetail>
                        </AbilityDetails>
                      </AbilityInfo>
                    </AbilityItem>
                  );
                })}
              </AbilitiesContainer>
            )}
            
            {activeTab === 'stats' && (
              <>
                <SectionTitle>統計情報</SectionTitle>
                <StatsContainer>
                  <StatsChart>
                    勝率/ピック率/バン率のグラフ（実装予定）
                  </StatsChart>
                  
                  <StatsInfo>
                    <StatRow>
                      <StatName>勝率</StatName>
                      <WinRate rate={parseFloat(stats.winRate)}>{stats.winRate}%</WinRate>
                    </StatRow>
                    <StatRow>
                      <StatName>ピック率</StatName>
                      <span>{stats.pickRate}%</span>
                    </StatRow>
                    <StatRow>
                      <StatName>バン率</StatName>
                      <span>{stats.banRate}%</span>
                    </StatRow>
                    <StatRow>
                      <StatName>ティア</StatName>
                      <span>{stats.tier}</span>
                    </StatRow>
                    <StatRow>
                      <StatName>平均キル</StatName>
                      <span>{stats.performance.averageKills}</span>
                    </StatRow>
                    <StatRow>
                      <StatName>平均デス</StatName>
                      <span>{stats.performance.averageDeaths}</span>
                    </StatRow>
                    <StatRow>
                      <StatName>平均アシスト</StatName>
                      <span>{stats.performance.averageAssists}</span>
                    </StatRow>
                    <StatRow>
                      <StatName>平均KDA</StatName>
                      <span>{stats.performance.kda}</span>
                    </StatRow>
                    <StatRow>
                      <StatName>平均CS</StatName>
                      <span>{stats.performance.averageCS}</span>
                    </StatRow>
                  </StatsInfo>
                </StatsContainer>
                
                <RoleDistribution>
                  <SectionTitle>ロール分布</SectionTitle>
                  <RoleBar>
                    <RoleBarSegment width={`${stats.roleDistribution.TOP}%`} color="#ff4081">
                      TOP
                    </RoleBarSegment>
                    <RoleBarSegment width={`${stats.roleDistribution.JUNGLE}%`} color="#7cb342">
                      JG
                    </RoleBarSegment>
                    <RoleBarSegment width={`${stats.roleDistribution.MIDDLE}%`} color="#29b6f6">
                      MID
                    </RoleBarSegment>
                    <RoleBarSegment width={`${stats.roleDistribution.BOTTOM}%`} color="#ffa726">
                      ADC
                    </RoleBarSegment>
                    <RoleBarSegment width={`${stats.roleDistribution.SUPPORT}%`} color="#9c27b0">
                      SUP
                    </RoleBarSegment>
                  </RoleBar>
                  
                  <RoleLegend>
                    <RoleLegendItem>
                      <RoleColor color="#ff4081" />
                      <span>TOP: {stats.roleDistribution.TOP}%</span>
                    </RoleLegendItem>
                    <RoleLegendItem>
                      <RoleColor color="#7cb342" />
                      <span>JUNGLE: {stats.roleDistribution.JUNGLE}%</span>
                    </RoleLegendItem>
                    <RoleLegendItem>
                      <RoleColor color="#29b6f6" />
                      <span>MID: {stats.roleDistribution.MIDDLE}%</span>
                    </RoleLegendItem>
                    <RoleLegendItem>
                      <RoleColor color="#ffa726" />
                      <span>ADC: {stats.roleDistribution.BOTTOM}%</span>
                    </RoleLegendItem>
                    <RoleLegendItem>
                      <RoleColor color="#9c27b0" />
                      <span>SUPPORT: {stats.roleDistribution.SUPPORT}%</span>
                    </RoleLegendItem>
                  </RoleLegend>
                </RoleDistribution>
              </>
            )}
            
            {activeTab === 'builds' && (
              <>
                <SectionTitle>推奨ビルド</SectionTitle>
                <BuildsContainer>
                  <div>
                    <BuildSection>
                      <BuildTitle>開始アイテム</BuildTitle>
                      {builds.startingItems.map((build, index) => (
                        <div key={index}>
                          <ItemsContainer>
                            {build.imageUrls.map((url, i) => (
                              <ItemBox key={i}>
                                <Image 
                                  src={url}
                                  alt={build.names[i]}
                                  layout="fill"
                                  objectFit="cover"
                                />
                              </ItemBox>
                            ))}
                          </ItemsContainer>
                          <BuildStats>
                            <WinRate rate={parseFloat(build.winRate)}>勝率: {build.winRate}%</WinRate> | ピック率: {build.pickRate}%
                          </BuildStats>
                        </div>
                      ))}
                    </BuildSection>
                    
                    <BuildSection>
                      <BuildTitle>コアアイテム</BuildTitle>
                      {builds.coreItems.map((build, index) => (
                        <div key={index}>
                          <ItemsContainer>
                            {build.imageUrls.map((url, i) => (
                              <ItemBox key={i}>
                                <Image 
                                  src={url}
                                  alt={build.names[i]}
                                  layout="fill"
                                  objectFit="cover"
                                />
                              </ItemBox>
                            ))}
                          </ItemsContainer>
                          <BuildStats>
                            <WinRate rate={parseFloat(build.winRate)}>勝率: {build.winRate}%</WinRate> | ピック率: {build.pickRate}%
                          </BuildStats>
                        </div>
                      ))}
                    </BuildSection>
                    
                    <BuildSection>
                      <BuildTitle>ブーツ</BuildTitle>
                      {builds.boots.map((boot, index) => (
                        <div key={index}>
                          <ItemsContainer>
                            <ItemBox>
                              <Image 
                                src={boot.imageUrl}
                                alt={boot.name}
                                layout="fill"
                                objectFit="cover"
                              />
                            </ItemBox>
                          </ItemsContainer>
                          <BuildStats>
                            <WinRate rate={parseFloat(boot.winRate)}>勝率: {boot.winRate}%</WinRate> | ピック率: {boot.pickRate}%
                          </BuildStats>
                        </div>
                      ))}
                    </BuildSection>
                  </div>
                  
                  <div>
                    <BuildSection>
                      <BuildTitle>サモナースペル</BuildTitle>
                      {builds.summonerSpells.map((spells, index) => (
                        <div key={index}>
                          <ItemsContainer>
                            {spells.imageUrls.map((url, i) => (
                              <ItemBox key={i}>
                                <Image 
                                  src={url}
                                  alt={spells.spells[i]}
                                  layout="fill"
                                  objectFit="cover"
                                />
                              </ItemBox>
                            ))}
                          </ItemsContainer>
                          <BuildStats>
                            <WinRate rate={parseFloat(spells.winRate)}>勝率: {spells.winRate}%</WinRate> | ピック率: {spells.pickRate}%
                          </BuildStats>
                        </div>
                      ))}
                    </BuildSection>
                    
                    <SkillOrderContainer>
                      <BuildTitle>スキルオーダー</BuildTitle>
                      {builds.skillOrder.map((skillOrder, index) => (
                        <div key={index}>
                          <SkillOrderTable>
                            <thead>
                              <SkillOrderRow>
                                <SkillOrderHeader>レベル</SkillOrderHeader>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((level) => (
                                  <SkillOrderHeader key={level}>{level}</SkillOrderHeader>
                                ))}
                              </SkillOrderRow>
                            </thead>
                            <tbody>
                              <SkillOrderRow>
                                <SkillOrderHeader>スキル</SkillOrderHeader>
                                {skillOrder.order.map((skill, i) => (
                                  <SkillOrderCell key={i} highlight={true}>
                                    {skill}
                                  </SkillOrderCell>
                                ))}
                              </SkillOrderRow>
                            </tbody>
                          </SkillOrderTable>
                          <BuildStats>
                            優先順位: {skillOrder.priority} | 
                            <WinRate rate={parseFloat(skillOrder.winRate)}> 勝率: {skillOrder.winRate}%</WinRate> | 
                            ピック率: {skillOrder.pickRate}%
                          </BuildStats>
                        </div>
                      ))}
                    </SkillOrderContainer>
                  </div>
                </BuildsContainer>
              </>
            )}
            
            {activeTab === 'counters' && (
              <>
                <SectionTitle>カウンター情報</SectionTitle>
                <CountersContainer>
                  <div>
                    <h3>苦手なチャンピオン</h3>
                    <CountersList>
                      {counters.weakAgainst.map((counter) => (
                        <CounterItem key={counter.championId}>
                          <CounterChampIcon>
                            <Image 
                              src={counter.imageUrl}
                              alt={counter.championName}
                              layout="fill"
                              objectFit="cover"
                            />
                          </CounterChampIcon>
                          <CounterInfo>
                            <CounterName>{counter.championName}</CounterName>
                            <CounterStats>
                              <CounterWinRate favorable={false}>勝率: {counter.winRate}%</CounterWinRate>
                              <span>試合数: {counter.games}</span>
                              <DifficultyBadge level={counter.difficulty}>
                                難易度: {counter.difficulty}
                              </DifficultyBadge>
                            </CounterStats>
                          </CounterInfo>
                        </CounterItem>
                      ))}
                    </CountersList>
                  </div>
                  
                  <div>
                    <h3>有利なチャンピオン</h3>
                    <CountersList>
                      {counters.strongAgainst.map((counter) => (
                        <CounterItem key={counter.championId}>
                          <CounterChampIcon>
                            <Image 
                              src={counter.imageUrl}
                              alt={counter.championName}
                              layout="fill"
                              objectFit="cover"
                            />
                          </CounterChampIcon>
                          <CounterInfo>
                            <CounterName>{counter.championName}</CounterName>
                            <CounterStats>
                              <CounterWinRate favorable={true}>勝率: {counter.winRate}%</CounterWinRate>
                              <span>試合数: {counter.games}</span>
                              <DifficultyBadge level={counter.difficulty}>
                                難易度: {counter.difficulty}
                              </DifficultyBadge>
                            </CounterStats>
                          </CounterInfo>
                        </CounterItem>
                      ))}
                    </CountersList>
                  </div>
                </CountersContainer>
                
                <SectionTitle>対策のヒント</SectionTitle>
                <TipsContainer>
                  <TipsSection>
                    <TipsTitle>{champion.name}と対峙する場合</TipsTitle>
                    <TipsList>
                      {counters.tips.whenFacingAgainst.map((tip, index) => (
                        <TipItem key={index}>{tip}</TipItem>
                      ))}
                    </TipsList>
                  </TipsSection>
                  
                  <TipsSection>
                    <TipsTitle>{champion.name}としてプレイする場合</TipsTitle>
                    <TipsList>
                      {counters.tips.whenPlayingAs.map((tip, index) => (
                        <TipItem key={index}>{tip}</TipItem>
                      ))}
                    </TipsList>
                  </TipsSection>
                </TipsContainer>
              </>
            )}
          </TabContent>
        </TabsContainer>
      </PageContainer>
    </>
  );
};

export default ChampionDetailPage;
