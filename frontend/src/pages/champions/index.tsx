import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import styled from 'styled-components';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';

// 型定義
interface Champion {
  id: string;
  key: string;
  name: string;
  title: string;
  image: {
    full: string;
    sprite: string;
    group: string;
    url: string;
  };
  tags: string[];
  stats: {
    hp: number;
    mp: number;
    armor: number;
    spellblock: number;
    attackdamage: number;
    attackspeed: number;
  };
  info: {
    attack: number;
    defense: number;
    magic: number;
    difficulty: number;
  };
}

interface ChampionStats {
  winRate: string;
  pickRate: string;
  banRate: string;
  tier: string;
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

const SearchInput = styled.input`
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  min-width: 200px;
`;

const ChampionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
`;

const ChampionCard = styled.div`
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const ChampionImageContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 100%; // 1:1 アスペクト比
  overflow: hidden;
`;

const ChampionImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const ChampionInfo = styled.div`
  padding: 1rem;
`;

const ChampionName = styled.h3`
  font-size: 1rem;
  margin: 0 0 0.25rem;
  color: #1a1a2e;
`;

const ChampionTitle = styled.p`
  font-size: 0.8rem;
  color: #666;
  margin: 0 0 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ChampionTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
`;

const ChampionTag = styled.span`
  font-size: 0.7rem;
  background-color: #f0f0f0;
  color: #555;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
`;

const ChampionStats = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #555;
`;

const WinRate = styled.span<{ rate: number }>`
  color: ${(props) => (props.rate >= 52 ? '#43a047' : props.rate <= 48 ? '#e53935' : '#555')};
  font-weight: 500;
`;

const TierBadge = styled.span<{ tier: string }>`
  display: inline-block;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
  background-color: ${(props) => {
    switch (props.tier) {
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

// ダミーデータ
const dummyChampionStats: Record<string, ChampionStats> = {
  Ahri: { winRate: '53.2', pickRate: '12.5', banRate: '5.2', tier: 'S' },
  Akali: { winRate: '49.8', pickRate: '8.7', banRate: '15.3', tier: 'A' },
  Aatrox: { winRate: '51.5', pickRate: '7.2', banRate: '4.8', tier: 'B' },
  Ashe: { winRate: '50.2', pickRate: '9.5', banRate: '2.1', tier: 'B' },
  Annie: { winRate: '52.7', pickRate: '3.8', banRate: '0.5', tier: 'C' },
  Alistar: { winRate: '48.9', pickRate: '4.2', banRate: '1.2', tier: 'C' },
  Amumu: { winRate: '52.3', pickRate: '5.1', banRate: '1.8', tier: 'B' },
  Azir: { winRate: '47.5', pickRate: '2.3', banRate: '0.9', tier: 'D' },
  Bard: { winRate: '51.8', pickRate: '3.5', banRate: '0.7', tier: 'B' },
  Blitzcrank: { winRate: '50.5', pickRate: '8.9', banRate: '12.3', tier: 'A' },
  Brand: { winRate: '49.2', pickRate: '5.7', banRate: '2.5', tier: 'C' },
  Braum: { winRate: '48.5', pickRate: '3.2', banRate: '0.6', tier: 'C' },
  Caitlyn: { winRate: '50.8', pickRate: '11.2', banRate: '4.5', tier: 'A' },
  Camille: { winRate: '51.2', pickRate: '6.8', banRate: '5.3', tier: 'B' },
  Cassiopeia: { winRate: '52.1', pickRate: '4.3', banRate: '3.2', tier: 'B' },
  Chogath: { winRate: '49.7', pickRate: '3.9', banRate: '1.1', tier: 'C' },
  Corki: { winRate: '48.2', pickRate: '2.1', banRate: '0.4', tier: 'D' },
  Darius: { winRate: '50.3', pickRate: '7.5', banRate: '8.9', tier: 'A' },
  Diana: { winRate: '51.7', pickRate: '6.2', banRate: '4.7', tier: 'B' },
  DrMundo: { winRate: '49.5', pickRate: '3.7', banRate: '1.3', tier: 'C' },
  Draven: { winRate: '50.9', pickRate: '5.3', banRate: '6.2', tier: 'B' },
  Ekko: { winRate: '52.5', pickRate: '7.8', banRate: '5.9', tier: 'A' },
  Elise: { winRate: '51.3', pickRate: '4.9', banRate: '2.8', tier: 'B' },
  Evelynn: { winRate: '50.7', pickRate: '5.5', banRate: '7.3', tier: 'B' },
  Ezreal: { winRate: '49.8', pickRate: '15.3', banRate: '6.7', tier: 'A' },
  Fiddlesticks: { winRate: '51.9', pickRate: '4.1', banRate: '2.3', tier: 'B' },
  Fiora: { winRate: '50.5', pickRate: '6.7', banRate: '7.8', tier: 'A' },
  Fizz: { winRate: '51.2', pickRate: '5.9', banRate: '8.5', tier: 'A' },
  Galio: { winRate: '49.3', pickRate: '3.2', banRate: '1.1', tier: 'C' },
  Gangplank: { winRate: '50.1', pickRate: '4.8', banRate: '3.2', tier: 'B' },
  Garen: { winRate: '51.5', pickRate: '6.3', banRate: '2.1', tier: 'B' },
  Gnar: { winRate: '48.7', pickRate: '3.5', banRate: '1.3', tier: 'C' },
  Gragas: { winRate: '49.2', pickRate: '3.8', banRate: '1.5', tier: 'C' },
  Graves: { winRate: '50.8', pickRate: '6.2', banRate: '3.7', tier: 'B' },
  Hecarim: { winRate: '52.3', pickRate: '7.1', banRate: '5.2', tier: 'A' },
  Heimerdinger: { winRate: '51.7', pickRate: '2.3', banRate: '1.9', tier: 'C' },
  Illaoi: { winRate: '49.5', pickRate: '3.1', banRate: '2.7', tier: 'C' },
  Irelia: { winRate: '48.9', pickRate: '7.8', banRate: '9.3', tier: 'A' },
  Ivern: { winRate: '50.2', pickRate: '1.5', banRate: '0.3', tier: 'D' },
  Janna: { winRate: '52.7', pickRate: '6.9', banRate: '1.8', tier: 'A' },
  JarvanIV: { winRate: '49.8', pickRate: '4.7', banRate: '1.5', tier: 'C' },
  Jax: { winRate: '51.3', pickRate: '6.5', banRate: '5.7', tier: 'B' },
  Jayce: { winRate: '48.5', pickRate: '3.2', banRate: '1.1', tier: 'C' },
  Jhin: { winRate: '51.9', pickRate: '12.3', banRate: '3.5', tier: 'S' },
  Jinx: { winRate: '52.5', pickRate: '13.7', banRate: '4.2', tier: 'S' },
  Kaisa: { winRate: '50.8', pickRate: '14.5', banRate: '5.3', tier: 'S' },
  Kalista: { winRate: '47.2', pickRate: '2.8', banRate: '1.3', tier: 'D' },
  Karma: { winRate: '49.7', pickRate: '5.3', banRate: '1.7', tier: 'C' },
  Karthus: { winRate: '51.5', pickRate: '3.2', banRate: '2.1', tier: 'C' },
  Kassadin: { winRate: '50.3', pickRate: '4.7', banRate: '6.3', tier: 'B' },
  Katarina: { winRate: '51.2', pickRate: '7.9', banRate: '12.5', tier: 'S' },
  Kayle: { winRate: '50.7', pickRate: '3.5', banRate: '1.2', tier: 'C' },
  Kayn: { winRate: '52.1', pickRate: '8.7', banRate: '7.3', tier: 'A' },
  Kennen: { winRate: '48.9', pickRate: '2.3', banRate: '0.7', tier: 'D' },
  Khazix: { winRate: '51.8', pickRate: '7.5', banRate: '5.2', tier: 'A' },
  Kindred: { winRate: '50.5', pickRate: '3.8', banRate: '1.3', tier: 'C' },
  Kled: { winRate: '51.2', pickRate: '2.7', banRate: '0.9', tier: 'C' },
  KogMaw: { winRate: '51.7', pickRate: '3.5', banRate: '1.1', tier: 'C' },
  Leblanc: { winRate: '49.3', pickRate: '5.7', banRate: '7.2', tier: 'B' },
  LeeSin: { winRate: '48.5', pickRate: '12.3', banRate: '8.7', tier: 'A' },
  Leona: { winRate: '51.9', pickRate: '8.5', banRate: '5.3', tier: 'A' },
  Lillia: { winRate: '50.2', pickRate: '3.7', banRate: '1.5', tier: 'C' },
  Lissandra: { winRate: '49.8', pickRate: '3.2', banRate: '1.3', tier: 'C' },
  Lucian: { winRate: '48.7', pickRate: '7.8', banRate: '3.5', tier: 'B' },
  Lulu: { winRate: '52.3', pickRate: '9.5', banRate: '6.7', tier: 'S' },
  Lux: { winRate: '51.5', pickRate: '10.2', banRate: '3.8', tier: 'A' },
  Malphite: { winRate: '52.7', pickRate: '6.3', banRate: '4.2', tier: 'A' },
  Malzahar: { winRate: '51.9', pickRate: '5.7', banRate: '5.3', tier: 'B' },
  Maokai: { winRate: '50.8', pickRate: '4.3', banRate: '1.7', tier: 'C' },
  MasterYi: { winRate: '49.5', pickRate: '6.8', banRate: '8.3', tier: 'B' },
  MissFortune: { winRate: '52.3', pickRate: '9.7', banRate: '2.5', tier: 'A' },
  Mordekaiser: { winRate: '51.2', pickRate: '6.5', banRate: '5.7', tier: 'B' },
  Morgana: { winRate: '51.7', pickRate: '8.3', banRate: '12.5', tier: 'S' },
  Nami: { winRate: '52.5', pickRate: '7.2', banRate: '1.8', tier: 'A' },
  Nasus: { winRate: '50.3', pickRate: '5.3', banRate: '3.2', tier: 'B' },
  Nautilus: { winRate: '50.7', pickRate: '6.8', banRate: '4.5', tier: 'B' },
  Neeko: { winRate: '49.8', pickRate: '2.7', banRate: '0.9', tier: 'D' },
  Nidalee: { winRate: '48.5', pickRate: '4.3', banRate: '1.5', tier: 'C' },
  Nocturne: { winRate: '51.2', pickRate: '4.7', banRate: '3.8', tier: 'B' },
  Nunu: { winRate: '52.7', pickRate: '5.3', banRate: '2.1', tier: 'B' },
  Olaf: { winRate: '49.5', pickRate: '3.2', banRate: '1.3', tier: 'C' },
  Orianna: { winRate: '50.2', pickRate: '4.8', banRate: '1.7', tier: 'C' },
  Ornn: { winRate: '51.5', pickRate: '4.3', banRate: '1.5', tier: 'C' },
  Pantheon: { winRate: '50.8', pickRate: '5.7', banRate: '2.3', tier: 'B' },
  Poppy: { winRate: '51.2', pickRate: '3.5', banRate: '1.1', tier: 'C' },
  Pyke: { winRate: '49.7', pickRate: '7.8', banRate: '8.5', tier: 'A' },
  Qiyana: { winRate: '48.9', pickRate: '4.2', banRate: '3.7', tier: 'C' },
  Quinn: { winRate: '51.7', pickRate: '2.3', banRate: '1.5', tier: 'C' },
  Rakan: { winRate: '50.5', pickRate: '5.3', banRate: '2.1', tier: 'B' },
  Rammus: { winRate: '52.3', pickRate: '3.7', banRate: '2.5', tier: 'B' },
  RekSai: { winRate: '51.2', pickRate: '2.8', banRate: '1.3', tier: 'C' },
  Rell: { winRate: '49.8', pickRate: '2.1', banRate: '0.7', tier: 'D' },
  Renekton: { winRate: '48.5', pickRate: '5.7', banRate: '3.2', tier: 'C' },
  Rengar: { winRate: '49.3', pickRate: '4.3', banRate: '3.8', tier: 'C' },
  Riven: { winRate: '50.7', pickRate: '6.8', banRate: '5.3', tier: 'B' },
  Rumble: { winRate: '51.5', pickRate: '2.7', banRate: '1.5', tier: 'C' },
  Ryze: { winRate: '47.2', pickRate: '3.5', banRate: '1.1', tier: 'D' },
  Samira: { winRate: '49.5', pickRate: '7.2', banRate: '8.7', tier: 'A' },
  Sejuani: { winRate: '51.2', pickRate: '4.3', banRate: '1.7', tier: 'C' },
  Senna: { winRate: '50.8', pickRate: '8.5', banRate: '4.2', tier: 'A' },
  Seraphine: { winRate: '52.5', pickRate: '6.3', banRate: '3.5', tier: 'A' },
  Sett: { winRate: '51.7', pickRate: '7.8', banRate: '5.7', tier: 'A' },
  Shaco: { winRate: '50.3', pickRate: '5.3', banRate: '7.2', tier: 'B' },
  Shen: { winRate: '52.1', pickRate: '5.7', banRate: '2.3', tier: 'B' },
  Shyvana: { winRate: '51.5', pickRate: '3.2', banRate: '1.3', tier: 'C' },
  Singed: { winRate: '52.7', pickRate: '2.7', banRate: '0.9', tier: 'C' },
  Sion: { winRate: '50.5', pickRate: '3.8', banRate: '1.1', tier: 'C' },
  Sivir: { winRate: '50.2', pickRate: '5.3', banRate: '1.5', tier: 'B' },
  Skarner: { winRate: '51.2', pickRate: '1.7', banRate: '0.5', tier: 'D' },
  Sona: { winRate: '53.5', pickRate: '4.3', banRate: '1.3', tier: 'B' },
  Soraka: { winRate: '52.3', pickRate: '5.7', banRate: '2.1', tier: 'B' },
  Swain: { winRate: '51.7', pickRate: '4.8', banRate: '2.5', tier: 'B' },
  Sylas: { winRate: '49.5', pickRate: '7.2', banRate: '6.3', tier: 'A' },
  Syndra: { winRate: '48.7', pickRate: '4.3', banRate: '2.7', tier: 'C' },
  TahmKench: { winRate: '50.3', pickRate: '2.3', banRate: '1.5', tier: 'D' },
  Taliyah: { winRate: '51.2', pickRate: '2.1', banRate: '0.7', tier: 'D' },
  Talon: { winRate: '50.8', pickRate: '5.7', banRate: '4.3', tier: 'B' },
  Taric: { winRate: '51.5', pickRate: '2.5', banRate: '0.9', tier: 'C' },
  Teemo: { winRate: '49.8', pickRate: '4.7', banRate: '3.5', tier: 'C' },
  Thresh: { winRate: '50.5', pickRate: '12.3', banRate: '7.8', tier: 'S' },
  Tristana: { winRate: '51.2', pickRate: '8.5', banRate: '3.2', tier: 'A' },
  Trundle: { winRate: '50.7', pickRate: '3.7', banRate: '1.3', tier: 'C' },
  Tryndamere: { winRate: '49.5', pickRate: '4.3', banRate: '3.8', tier: 'C' },
  TwistedFate: { winRate: '48.9', pickRate: '3.8', banRate: '1.7', tier: 'C' },
  Twitch: { winRate: '51.7', pickRate: '5.3', banRate: '2.5', tier: 'B' },
  Udyr: { winRate: '52.3', pickRate: '3.2', banRate: '2.1', tier: 'C' },
  Urgot: { winRate: '51.5', pickRate: '4.7', banRate: '2.3', tier: 'B' },
  Varus: { winRate: '49.2', pickRate: '5.7', banRate: '1.5', tier: 'C' },
  Vayne: { winRate: '50.8', pickRate: '9.5', banRate: '8.3', tier: 'A' },
  Veigar: { winRate: '51.2', pickRate: '5.3', banRate: '3.7', tier: 'B' },
  Velkoz: { winRate: '51.7', pickRate: '3.8', banRate: '1.3', tier: 'C' },
  Vi: { winRate: '50.5', pickRate: '4.3', banRate: '1.7', tier: 'C' },
  Viego: { winRate: '49.8', pickRate: '6.8', banRate: '5.3', tier: 'B' },
  Viktor: { winRate: '51.2', pickRate: '5.7', banRate: '3.2', tier: 'B' },
  Vladimir: { winRate: '50.7', pickRate: '4.8', banRate: '3.5', tier: 'B' },
  Volibear: { winRate: '51.5', pickRate: '5.3', banRate: '2.7', tier: 'B' },
  Warwick: { winRate: '52.3', pickRate: '5.7', banRate: '2.3', tier: 'B' },
  Wukong: { winRate: '51.2', pickRate: '4.3', banRate: '2.1', tier: 'C' },
  Xayah: { winRate: '49.5', pickRate: '6.3', banRate: '2.5', tier: 'B' },
  Xerath: { winRate: '51.7', pickRate: '4.7', banRate: '1.5', tier: 'C' },
  XinZhao: { winRate: '50.8', pickRate: '5.3', banRate: '2.3', tier: 'B' },
  Yasuo: { winRate: '48.7', pickRate: '13.5', banRate: '15.7', tier: 'A' },
  Yone: { winRate: '49.2', pickRate: '11.7', banRate: '12.3', tier: 'A' },
  Yorick: { winRate: '51.5', pickRate: '2.7', banRate: '1.3', tier: 'C' },
  Yuumi: { winRate: '50.3', pickRate: '7.8', banRate: '25.3', tier: 'S+' },
  Zac: { winRate: '52.7', pickRate: '5.3', banRate: '2.7', tier: 'B' },
  Zed: { winRate: '49.5', pickRate: '12.7', banRate: '35.3', tier: 'S+' },
  Ziggs: { winRate: '51.2', pickRate: '3.5', banRate: '1.1', tier: 'C' },
  Zilean: { winRate: '52.5', pickRate: '3.2', banRate: '1.5', tier: 'C' },
  Zoe: { winRate: '49.8', pickRate: '4.7', banRate: '3.8', tier: 'C' },
  Zyra: { winRate: '51.7', pickRate: '4.3', banRate: '2.1', tier: 'C' },
};

const ChampionsPage: NextPage = () => {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  
  const router = useRouter();

  // チャンピオンデータをフェッチする関数（実際の実装ではAPIから取得）
  useEffect(() => {
    const fetchChampions = async () => {
      try {
        // 実際の実装ではAPIからデータを取得
        // const response = await fetch('/api/champions');
        // const data = await response.json();
        
        // ダミーデータを使用
        const response = await fetch('https://ddragon.leagueoflegends.com/cdn/13.24.1/data/ja_JP/champion.json');
        const data = await response.json();
        
        const championsArray = Object.values(data.data) as Champion[];
        setChampions(championsArray);
        setLoading(false);
      } catch (err) {
        setError('チャンピオンデータの取得に失敗しました');
        setLoading(false);
      }
    };
    
    fetchChampions();
  }, []);

  // フィルタリングと並び替え
  const filteredChampions = champions.filter(champion => {
    // 検索クエリでフィルタリング
    if (searchQuery && !champion.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // ロールでフィルタリング
    if (roleFilter !== 'all' && !champion.tags.includes(roleFilter)) {
      return false;
    }
    
    // ティアでフィルタリング（ダミーデータを使用）
    if (tierFilter !== 'all') {
      const stats = dummyChampionStats[champion.name];
      if (!stats || stats.tier !== tierFilter) {
        return false;
      }
    }
    
    return true;
  });
  
  // 並び替え
  const sortedChampions = [...filteredChampions].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'winRate':
        const aWinRate = parseFloat(dummyChampionStats[a.name]?.winRate || '0');
        const bWinRate = parseFloat(dummyChampionStats[b.name]?.winRate || '0');
        return bWinRate - aWinRate;
      case 'pickRate':
        const aPickRate = parseFloat(dummyChampionStats[a.name]?.pickRate || '0');
        const bPickRate = parseFloat(dummyChampionStats[b.name]?.pickRate || '0');
        return bPickRate - aPickRate;
      case 'banRate':
        const aBanRate = parseFloat(dummyChampionStats[a.name]?.banRate || '0');
        const bBanRate = parseFloat(dummyChampionStats[b.name]?.banRate || '0');
        return bBanRate - aBanRate;
      case 'tier':
        const tierOrder = { 'S+': 0, 'S': 1, 'A': 2, 'B': 3, 'C': 4, 'D': 5 };
        const aTier = tierOrder[dummyChampionStats[a.name]?.tier as keyof typeof tierOrder] || 999;
        const bTier = tierOrder[dummyChampionStats[b.name]?.tier as keyof typeof tierOrder] || 999;
        return aTier - bTier;
      default:
        return 0;
    }
  });

  return (
    <>
      <Head>
        <title>チャンピオン一覧 - LOL Stats Hub</title>
        <meta name="description" content="League of Legendsのチャンピオン一覧、統計情報、ティアリストを確認できます。" />
      </Head>

      <PageContainer>
        <PageHeader>
          <PageTitle>チャンピオン一覧</PageTitle>
          <PageDescription>
            全チャンピオンの統計情報、勝率、ピック率、バン率、ティアランクを確認できます。
          </PageDescription>
        </PageHeader>

        <FilterContainer>
          <FilterGroup>
            <FilterLabel htmlFor="search">チャンピオン検索</FilterLabel>
            <SearchInput
              id="search"
              type="text"
              placeholder="チャンピオン名..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel htmlFor="role">ロール</FilterLabel>
            <FilterSelect
              id="role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">すべて</option>
              <option value="Fighter">ファイター</option>
              <option value="Tank">タンク</option>
              <option value="Mage">メイジ</option>
              <option value="Assassin">アサシン</option>
              <option value="Marksman">マークスマン</option>
              <option value="Support">サポート</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel htmlFor="tier">ティア</FilterLabel>
            <FilterSelect
              id="tier"
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
            >
              <option value="all">すべて</option>
              <option value="S+">S+</option>
              <option value="S">S</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel htmlFor="sort">並び替え</FilterLabel>
            <FilterSelect
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">名前</option>
              <option value="winRate">勝率</option>
              <option value="pickRate">ピック率</option>
              <option value="banRate">バン率</option>
              <option value="tier">ティア</option>
            </FilterSelect>
          </FilterGroup>
        </FilterContainer>

        {loading ? (
          <div>チャンピオンデータを読み込み中...</div>
        ) : error ? (
          <div>{error}</div>
        ) : (
          <ChampionsGrid>
            {sortedChampions.map((champion) => {
              const stats = dummyChampionStats[champion.name] || {
                winRate: '50.0',
                pickRate: '0.0',
                banRate: '0.0',
                tier: 'C',
              };
              
              return (
                <Link
                  href={`/champions/${champion.id}`}
                  key={champion.id}
                  passHref
                >
                  <a style={{ textDecoration: 'none' }}>
                    <ChampionCard>
                      <ChampionImageContainer>
                        <ChampionImage>
                          <Image
                            src={`https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/${champion.image.full}`}
                            alt={champion.name}
                            layout="fill"
                            objectFit="cover"
                          />
                        </ChampionImage>
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
                          <WinRate rate={parseFloat(stats.winRate)}>
                            勝率: {stats.winRate}%
                          </WinRate>
                          <TierBadge tier={stats.tier}>{stats.tier}</TierBadge>
                        </ChampionStats>
                      </ChampionInfo>
                    </ChampionCard>
                  </a>
                </Link>
              );
            })}
          </ChampionsGrid>
        )}
      </PageContainer>
    </>
  );
};

export default ChampionsPage;
