import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import styled from 'styled-components';
import Link from 'next/link';
import Image from 'next/image';

// 型定義
interface ChampionTier {
  id: string;
  name: string;
  imageUrl: string;
  winRate: string;
  pickRate: string;
  banRate: string;
  tier: string;
  role: string;
  change: number; // 前回のティアからの変化（+1は上昇、-1は下降、0は変化なし）
}

interface MetaTrend {
  patch: string;
  date: string;
  topPicks: {
    role: string;
    champions: {
      id: string;
      name: string;
      imageUrl: string;
      winRate: string;
      pickRate: string;
    }[];
  }[];
  majorChanges: {
    type: 'buff' | 'nerf';
    championId: string;
    championName: string;
    imageUrl: string;
    description: string;
    impact: number; // 1-5のスケール（影響度）
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

const TierContainer = styled.div`
  margin-bottom: 2rem;
`;

const TierRow = styled.div<{ tier: string }>`
  display: flex;
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const TierLabel = styled.div<{ tier: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
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
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  border-radius: 8px 0 0 8px;
  flex-shrink: 0;
`;

const TierChampions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 0 8px 8px 0;
  flex: 1;
`;

const ChampionItem = styled.div`
  position: relative;
  width: 60px;
  text-align: center;
`;

const ChampionImageContainer = styled.div`
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 0.25rem;
  border: 2px solid #eee;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const ChampionName = styled.div`
  font-size: 0.7rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #333;
`;

const WinRateBadge = styled.div<{ rate: number }>`
  position: absolute;
  top: -5px;
  right: 0;
  background-color: ${(props) => (props.rate >= 52 ? '#43a047' : props.rate <= 48 ? '#e53935' : '#757575')};
  color: white;
  font-size: 0.6rem;
  font-weight: 600;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
`;

const ChangeBadge = styled.div<{ change: number }>`
  position: absolute;
  bottom: 15px;
  right: 0;
  background-color: ${(props) => (props.change > 0 ? '#43a047' : props.change < 0 ? '#e53935' : 'transparent')};
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: '${(props) => (props.change > 0 ? '↑' : props.change < 0 ? '↓' : '')}';
  }
`;

const TrendContainer = styled.div`
  margin-bottom: 3rem;
`;

const PatchInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
`;

const PatchVersion = styled.h3`
  font-size: 1.25rem;
  margin: 0;
  color: #1a1a2e;
`;

const PatchDate = styled.span`
  color: #777;
  font-size: 0.9rem;
`;

const RolePicksContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const RolePicksCard = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
`;

const RoleHeader = styled.div`
  background-color: #1a1a2e;
  color: white;
  padding: 0.5rem 1rem;
  font-weight: 500;
`;

const RoleChampions = styled.div`
  padding: 1rem;
`;

const RoleChampionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const RoleChampionRank = styled.span`
  font-weight: 600;
  color: #1a1a2e;
  width: 20px;
  text-align: center;
`;

const RoleChampionIcon = styled.div`
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
`;

const RoleChampionInfo = styled.div`
  flex: 1;
`;

const RoleChampionName = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const RoleChampionStats = styled.div`
  font-size: 0.75rem;
  color: #777;
`;

const ChangesContainer = styled.div`
  margin-top: 2rem;
`;

const ChangesTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0 0 1rem;
  color: #1a1a2e;
`;

const ChangesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;

const ChangeItem = styled.div<{ type: 'buff' | 'nerf' }>`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background-color: ${(props) => (props.type === 'buff' ? 'rgba(67, 160, 71, 0.1)' : 'rgba(229, 57, 53, 0.1)')};
  border-left: 4px solid ${(props) => (props.type === 'buff' ? '#43a047' : '#e53935')};
  border-radius: 4px;
`;

const ChangeChampIcon = styled.div`
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
`;

const ChangeInfo = styled.div`
  flex: 1;
`;

const ChangeChampName = styled.div`
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const ChangeDescription = styled.div`
  font-size: 0.9rem;
  color: #555;
`;

const ImpactBadge = styled.div<{ impact: number }>`
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.2rem 0.5rem;
  background-color: ${(props) => {
    if (props.impact >= 4) return '#e53935';
    if (props.impact >= 3) return '#ff9800';
    return '#757575';
  }};
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 4px;
`;

// ダミーデータ
const dummyTierList: ChampionTier[] = [
  // S+ティア
  { id: 'Yuumi', name: 'ユーミ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Yuumi.png', winRate: '53.2', pickRate: '12.5', banRate: '25.3', tier: 'S+', role: 'SUPPORT', change: 1 },
  { id: 'Zed', name: 'ゼド', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Zed.png', winRate: '52.8', pickRate: '15.7', banRate: '35.3', tier: 'S+', role: 'MIDDLE', change: 0 },
  
  // Sティア
  { id: 'Ahri', name: 'アーリ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Ahri.png', winRate: '53.2', pickRate: '12.5', banRate: '5.2', tier: 'S', role: 'MIDDLE', change: 1 },
  { id: 'Jhin', name: 'ジン', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Jhin.png', winRate: '51.9', pickRate: '12.3', banRate: '3.5', tier: 'S', role: 'BOTTOM', change: 0 },
  { id: 'Jinx', name: 'ジンクス', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Jinx.png', winRate: '52.5', pickRate: '13.7', banRate: '4.2', tier: 'S', role: 'BOTTOM', change: 0 },
  { id: 'Kaisa', name: 'カイサ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Kaisa.png', winRate: '50.8', pickRate: '14.5', banRate: '5.3', tier: 'S', role: 'BOTTOM', change: 0 },
  { id: 'Katarina', name: 'カタリナ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Katarina.png', winRate: '51.2', pickRate: '7.9', banRate: '12.5', tier: 'S', role: 'MIDDLE', change: 0 },
  { id: 'Lulu', name: 'ルル', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Lulu.png', winRate: '52.3', pickRate: '9.5', banRate: '6.7', tier: 'S', role: 'SUPPORT', change: 0 },
  { id: 'Morgana', name: 'モルガナ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Morgana.png', winRate: '51.7', pickRate: '8.3', banRate: '12.5', tier: 'S', role: 'SUPPORT', change: 0 },
  { id: 'Thresh', name: 'スレッシュ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Thresh.png', winRate: '50.5', pickRate: '12.3', banRate: '7.8', tier: 'S', role: 'SUPPORT', change: 0 },
  
  // Aティア
  { id: 'Blitzcrank', name: 'ブリッツクランク', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Blitzcrank.png', winRate: '50.5', pickRate: '8.9', banRate: '12.3', tier: 'A', role: 'SUPPORT', change: 0 },
  { id: 'Caitlyn', name: 'ケイトリン', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Caitlyn.png', winRate: '50.8', pickRate: '11.2', banRate: '4.5', tier: 'A', role: 'BOTTOM', change: 0 },
  { id: 'Darius', name: 'ダリウス', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Darius.png', winRate: '50.3', pickRate: '7.5', banRate: '8.9', tier: 'A', role: 'TOP', change: 0 },
  { id: 'Ekko', name: 'エコー', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Ekko.png', winRate: '52.5', pickRate: '7.8', banRate: '5.9', tier: 'A', role: 'JUNGLE', change: 0 },
  { id: 'Ezreal', name: 'エズリアル', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Ezreal.png', winRate: '49.8', pickRate: '15.3', banRate: '6.7', tier: 'A', role: 'BOTTOM', change: 0 },
  { id: 'Fiora', name: 'フィオラ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Fiora.png', winRate: '50.5', pickRate: '6.7', banRate: '7.8', tier: 'A', role: 'TOP', change: 0 },
  { id: 'Fizz', name: 'フィズ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Fizz.png', winRate: '51.2', pickRate: '5.9', banRate: '8.5', tier: 'A', role: 'MIDDLE', change: 0 },
  { id: 'Hecarim', name: 'ヘカリム', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Hecarim.png', winRate: '52.3', pickRate: '7.1', banRate: '5.2', tier: 'A', role: 'JUNGLE', change: 0 },
  { id: 'Irelia', name: 'イレリア', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Irelia.png', winRate: '48.9', pickRate: '7.8', banRate: '9.3', tier: 'A', role: 'TOP', change: 0 },
  { id: 'Janna', name: 'ジャンナ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Janna.png', winRate: '52.7', pickRate: '6.9', banRate: '1.8', tier: 'A', role: 'SUPPORT', change: 0 },
  { id: 'Khazix', name: 'カジックス', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Khazix.png', winRate: '51.8', pickRate: '7.5', banRate: '5.2', tier: 'A', role: 'JUNGLE', change: 0 },
  { id: 'LeeSin', name: 'リー・シン', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/LeeSin.png', winRate: '48.5', pickRate: '12.3', banRate: '8.7', tier: 'A', role: 'JUNGLE', change: 0 },
  { id: 'Leona', name: 'レオナ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Leona.png', winRate: '51.9', pickRate: '8.5', banRate: '5.3', tier: 'A', role: 'SUPPORT', change: 0 },
  { id: 'Lux', name: 'ラックス', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Lux.png', winRate: '51.5', pickRate: '10.2', banRate: '3.8', tier: 'A', role: 'SUPPORT', change: 0 },
  { id: 'Malphite', name: 'マルファイト', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Malphite.png', winRate: '52.7', pickRate: '6.3', banRate: '4.2', tier: 'A', role: 'TOP', change: 0 },
  { id: 'MissFortune', name: 'ミス・フォーチュン', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/MissFortune.png', winRate: '52.3', pickRate: '9.7', banRate: '2.5', tier: 'A', role: 'BOTTOM', change: 0 },
  { id: 'Nami', name: 'ナミ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Nami.png', winRate: '52.5', pickRate: '7.2', banRate: '1.8', tier: 'A', role: 'SUPPORT', change: 0 },
  { id: 'Pyke', name: 'パイク', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Pyke.png', winRate: '49.7', pickRate: '7.8', banRate: '8.5', tier: 'A', role: 'SUPPORT', change: 0 },
  { id: 'Samira', name: 'サミラ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Samira.png', winRate: '49.5', pickRate: '7.2', banRate: '8.7', tier: 'A', role: 'BOTTOM', change: 0 },
  { id: 'Senna', name: 'セナ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Senna.png', winRate: '50.8', pickRate: '8.5', banRate: '4.2', tier: 'A', role: 'SUPPORT', change: 0 },
  { id: 'Seraphine', name: 'セラフィーン', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Seraphine.png', winRate: '52.5', pickRate: '6.3', banRate: '3.5', tier: 'A', role: 'SUPPORT', change: 0 },
  { id: 'Sett', name: 'セット', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Sett.png', winRate: '51.7', pickRate: '7.8', banRate: '5.7', tier: 'A', role: 'TOP', change: 0 },
  { id: 'Sylas', name: 'サイラス', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Sylas.png', winRate: '49.5', pickRate: '7.2', banRate: '6.3', tier: 'A', role: 'MIDDLE', change: 0 },
  { id: 'Tristana', name: 'トリスターナ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Tristana.png', winRate: '51.2', pickRate: '8.5', banRate: '3.2', tier: 'A', role: 'BOTTOM', change: 0 },
  { id: 'Vayne', name: 'ヴェイン', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Vayne.png', winRate: '50.8', pickRate: '9.5', banRate: '8.3', tier: 'A', role: 'BOTTOM', change: 0 },
  { id: 'Yasuo', name: 'ヤスオ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Yasuo.png', winRate: '48.7', pickRate: '13.5', banRate: '15.7', tier: 'A', role: 'MIDDLE', change: 0 },
  { id: 'Yone', name: 'ヨネ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Yone.png', winRate: '49.2', pickRate: '11.7', banRate: '12.3', tier: 'A', role: 'MIDDLE', change: 0 },
  
  // Bティア
  { id: 'Aatrox', name: 'アートロックス', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Aatrox.png', winRate: '51.5', pickRate: '7.2', banRate: '4.8', tier: 'B', role: 'TOP', change: 0 },
  { id: 'Amumu', name: 'アムム', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Amumu.png', winRate: '52.3', pickRate: '5.1', banRate: '1.8', tier: 'B', role: 'JUNGLE', change: 0 },
  { id: 'Ashe', name: 'アッシュ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Ashe.png', winRate: '50.2', pickRate: '9.5', banRate: '2.1', tier: 'B', role: 'BOTTOM', change: 0 },
  { id: 'Bard', name: 'バード', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Bard.png', winRate: '51.8', pickRate: '3.5', banRate: '0.7', tier: 'B', role: 'SUPPORT', change: 0 },
  { id: 'Camille', name: 'カミール', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Camille.png', winRate: '51.2', pickRate: '6.8', banRate: '5.3', tier: 'B', role: 'TOP', change: 0 },
  { id: 'Cassiopeia', name: 'カシオペア', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Cassiopeia.png', winRate: '52.1', pickRate: '4.3', banRate: '3.2', tier: 'B', role: 'MIDDLE', change: 0 },
  { id: 'Diana', name: 'ダイアナ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Diana.png', winRate: '51.7', pickRate: '6.2', banRate: '4.7', tier: 'B', role: 'JUNGLE', change: 0 },
  { id: 'Draven', name: 'ドレイヴン', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Draven.png', winRate: '50.9', pickRate: '5.3', banRate: '6.2', tier: 'B', role: 'BOTTOM', change: 0 },
  { id: 'Elise', name: 'エリス', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Elise.png', winRate: '51.3', pickRate: '4.9', banRate: '2.8', tier: 'B', role: 'JUNGLE', change: 0 },
  { id: 'Evelynn', name: 'イブリン', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Evelynn.png', winRate: '50.7', pickRate: '5.5', banRate: '7.3', tier: 'B', role: 'JUNGLE', change: 0 },
  { id: 'Fiddlesticks', name: 'フィドルスティックス', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Fiddlesticks.png', winRate: '51.9', pickRate: '4.1', banRate: '2.3', tier: 'B', role: 'JUNGLE', change: 0 },
  { id: 'Gangplank', name: 'ガングプランク', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Gangplank.png', winRate: '50.1', pickRate: '4.8', banRate: '3.2', tier: 'B', role: 'TOP', change: 0 },
  { id: 'Garen', name: 'ガレン', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Garen.png', winRate: '51.5', pickRate: '6.3', banRate: '2.1', tier: 'B', role: 'TOP', change: 0 },
];

// メタトレンドのダミーデータ
const dummyMetaTrends: MetaTrend[] = [
  {
    patch: '14.5',
    date: '2025-03-01',
    topPicks: [
      {
        role: 'TOP',
        champions: [
          { id: 'Aatrox', name: 'アートロックス', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Aatrox.png', winRate: '51.5', pickRate: '7.2' },
          { id: 'Darius', name: 'ダリウス', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Darius.png', winRate: '50.3', pickRate: '7.5' },
          { id: 'Sett', name: 'セット', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Sett.png', winRate: '51.7', pickRate: '7.8' },
        ],
      },
      {
        role: 'JUNGLE',
        champions: [
          { id: 'Khazix', name: 'カジックス', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Khazix.png', winRate: '51.8', pickRate: '7.5' },
          { id: 'LeeSin', name: 'リー・シン', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/LeeSin.png', winRate: '48.5', pickRate: '12.3' },
          { id: 'Hecarim', name: 'ヘカリム', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Hecarim.png', winRate: '52.3', pickRate: '7.1' },
        ],
      },
      {
        role: 'MIDDLE',
        champions: [
          { id: 'Ahri', name: 'アーリ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Ahri.png', winRate: '53.2', pickRate: '12.5' },
          { id: 'Zed', name: 'ゼド', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Zed.png', winRate: '52.8', pickRate: '15.7' },
          { id: 'Yasuo', name: 'ヤスオ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Yasuo.png', winRate: '48.7', pickRate: '13.5' },
        ],
      },
      {
        role: 'BOTTOM',
        champions: [
          { id: 'Jinx', name: 'ジンクス', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Jinx.png', winRate: '52.5', pickRate: '13.7' },
          { id: 'Kaisa', name: 'カイサ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Kaisa.png', winRate: '50.8', pickRate: '14.5' },
          { id: 'Ezreal', name: 'エズリアル', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Ezreal.png', winRate: '49.8', pickRate: '15.3' },
        ],
      },
      {
        role: 'SUPPORT',
        champions: [
          { id: 'Thresh', name: 'スレッシュ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Thresh.png', winRate: '50.5', pickRate: '12.3' },
          { id: 'Lulu', name: 'ルル', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Lulu.png', winRate: '52.3', pickRate: '9.5' },
          { id: 'Yuumi', name: 'ユーミ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Yuumi.png', winRate: '53.2', pickRate: '12.5' },
        ],
      },
    ],
    majorChanges: [
      {
        type: 'buff',
        championId: 'Yuumi',
        championName: 'ユーミ',
        imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Yuumi.png',
        description: 'パッシブシールドの強化とQのダメージ増加により、サポート性能が大幅に向上',
        impact: 4,
      },
      {
        type: 'nerf',
        championId: 'Yasuo',
        championName: 'ヤスオ',
        imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Yasuo.png',
        description: 'Qのクールダウン増加とEのダメージ減少により、初期の戦闘力が低下',
        impact: 3,
      },
      {
        type: 'buff',
        championId: 'Ahri',
        championName: 'アーリ',
        imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Ahri.png',
        description: 'Wのマナコスト減少とRのクールダウン短縮により、機動力が向上',
        impact: 3,
      },
    ],
  },
  {
    patch: '14.4',
    date: '2025-02-15',
    topPicks: [
      {
        role: 'TOP',
        champions: [
          { id: 'Aatrox', name: 'アートロックス', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Aatrox.png', winRate: '51.2', pickRate: '6.8' },
          { id: 'Darius', name: 'ダリウス', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Darius.png', winRate: '50.1', pickRate: '7.2' },
          { id: 'Sett', name: 'セット', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Sett.png', winRate: '51.5', pickRate: '7.5' },
        ],
      },
      {
        role: 'JUNGLE',
        champions: [
          { id: 'Khazix', name: 'カジックス', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Khazix.png', winRate: '51.5', pickRate: '7.2' },
          { id: 'LeeSin', name: 'リー・シン', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/LeeSin.png', winRate: '48.2', pickRate: '11.8' },
          { id: 'Hecarim', name: 'ヘカリム', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Hecarim.png', winRate: '52.0', pickRate: '6.8' },
        ],
      },
      {
        role: 'MIDDLE',
        champions: [
          { id: 'Ahri', name: 'アーリ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Ahri.png', winRate: '52.8', pickRate: '12.0' },
          { id: 'Zed', name: 'ゼド', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Zed.png', winRate: '52.5', pickRate: '15.2' },
          { id: 'Yasuo', name: 'ヤスオ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Yasuo.png', winRate: '49.2', pickRate: '14.0' },
        ],
      },
      {
        role: 'BOTTOM',
        champions: [
          { id: 'Jinx', name: 'ジンクス', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Jinx.png', winRate: '52.2', pickRate: '13.2' },
          { id: 'Kaisa', name: 'カイサ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Kaisa.png', winRate: '50.5', pickRate: '14.0' },
          { id: 'Ezreal', name: 'エズリアル', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Ezreal.png', winRate: '49.5', pickRate: '15.0' },
        ],
      },
      {
        role: 'SUPPORT',
        champions: [
          { id: 'Thresh', name: 'スレッシュ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Thresh.png', winRate: '50.2', pickRate: '12.0' },
          { id: 'Lulu', name: 'ルル', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Lulu.png', winRate: '52.0', pickRate: '9.2' },
          { id: 'Morgana', name: 'モルガナ', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Morgana.png', winRate: '51.5', pickRate: '8.0' },
        ],
      },
    ],
    majorChanges: [
      {
        type: 'nerf',
        championId: 'Zed',
        championName: 'ゼド',
        imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Zed.png',
        description: 'Wのクールダウン増加とRのダメージ減少により、キル能力が低下',
        impact: 2,
      },
      {
        type: 'buff',
        championId: 'Jinx',
        championName: 'ジンクス',
        imageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Jinx.png',
        description: 'Qのダメージ増加とRのクールダウン短縮により、チームファイトでの影響力が向上',
        impact: 3,
      },
    ],
  },
];

const MetaPage: NextPage = () => {
  const [tierFilter, setTierFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('tierList');
  
  // ティアリストのフィルタリング
  const filteredTierList = dummyTierList.filter(champion => {
    if (tierFilter !== 'all' && champion.tier !== tierFilter) {
      return false;
    }
    
    if (roleFilter !== 'all' && champion.role !== roleFilter) {
      return false;
    }
    
    return true;
  });
  
  // ティアごとにグループ化
  const tierGroups = filteredTierList.reduce((groups, champion) => {
    if (!groups[champion.tier]) {
      groups[champion.tier] = [];
    }
    groups[champion.tier].push(champion);
    return groups;
  }, {} as Record<string, ChampionTier[]>);
  
  // ティアの順序
  const tierOrder = ['S+', 'S', 'A', 'B', 'C', 'D'];
  
  return (
    <>
      <Head>
        <title>メタ分析 - LOL Stats Hub</title>
        <meta name="description" content="League of Legendsの最新メタ情報、チャンピオンティアリスト、パッチごとの変化を確認できます。" />
      </Head>
      
      <PageContainer>
        <PageHeader>
          <PageTitle>メタ分析</PageTitle>
          <PageDescription>
            最新のチャンピオンティアリスト、メタトレンド、パッチごとの変化を確認できます。
          </PageDescription>
        </PageHeader>
        
        <FilterContainer>
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
            <FilterLabel htmlFor="role">ロール</FilterLabel>
            <FilterSelect
              id="role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
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
        
        <TabsContainer>
          <TabsList>
            <Tab
              active={activeTab === 'tierList'}
              onClick={() => setActiveTab('tierList')}
            >
              ティアリスト
            </Tab>
            <Tab
              active={activeTab === 'metaTrends'}
              onClick={() => setActiveTab('metaTrends')}
            >
              メタトレンド
            </Tab>
          </TabsList>
          
          <TabContent>
            {activeTab === 'tierList' && (
              <TierContainer>
                {tierOrder.map((tier) => {
                  if (!tierGroups[tier]) return null;
                  
                  return (
                    <TierRow key={tier} tier={tier}>
                      <TierLabel tier={tier}>{tier}</TierLabel>
                      <TierChampions>
                        {tierGroups[tier].map((champion) => (
                          <Link
                            href={`/champions/${champion.id}`}
                            key={champion.id}
                            passHref
                          >
                            <a style={{ textDecoration: 'none' }}>
                              <ChampionItem>
                                <WinRateBadge rate={parseFloat(champion.winRate)}>
                                  {champion.winRate}%
                                </WinRateBadge>
                                {champion.change !== 0 && (
                                  <ChangeBadge change={champion.change} />
                                )}
                                <ChampionImageContainer>
                                  <Image 
                                    src={champion.imageUrl}
                                    alt={champion.name}
                                    layout="fill"
                                    objectFit="cover"
                                  />
                                </ChampionImageContainer>
                                <ChampionName>{champion.name}</ChampionName>
                              </ChampionItem>
                            </a>
                          </Link>
                        ))}
                      </TierChampions>
                    </TierRow>
                  );
                })}
              </TierContainer>
            )}
            
            {activeTab === 'metaTrends' && (
              <div>
                {dummyMetaTrends.map((trend) => (
                  <TrendContainer key={trend.patch}>
                    <PatchInfo>
                      <PatchVersion>パッチ {trend.patch}</PatchVersion>
                      <PatchDate>{trend.date}</PatchDate>
                    </PatchInfo>
                    
                    <SectionTitle>ロール別トップピック</SectionTitle>
                    <RolePicksContainer>
                      {trend.topPicks.map((rolePick) => (
                        <RolePicksCard key={rolePick.role}>
                          <RoleHeader>
                            {rolePick.role === 'TOP' && 'トップ'}
                            {rolePick.role === 'JUNGLE' && 'ジャングル'}
                            {rolePick.role === 'MIDDLE' && 'ミッド'}
                            {rolePick.role === 'BOTTOM' && 'ボトム'}
                            {rolePick.role === 'SUPPORT' && 'サポート'}
                          </RoleHeader>
                          <RoleChampions>
                            {rolePick.champions.map((champion, index) => (
                              <RoleChampionItem key={champion.id}>
                                <RoleChampionRank>{index + 1}</RoleChampionRank>
                                <RoleChampionIcon>
                                  <Image 
                                    src={champion.imageUrl}
                                    alt={champion.name}
                                    layout="fill"
                                    objectFit="cover"
                                  />
                                </RoleChampionIcon>
                                <RoleChampionInfo>
                                  <RoleChampionName>{champion.name}</RoleChampionName>
                                  <RoleChampionStats>
                                    勝率: {champion.winRate}% | ピック率: {champion.pickRate}%
                                  </RoleChampionStats>
                                </RoleChampionInfo>
                              </RoleChampionItem>
                            ))}
                          </RoleChampions>
                        </RolePicksCard>
                      ))}
                    </RolePicksContainer>
                    
                    <ChangesContainer>
                      <ChangesTitle>主要な変更点</ChangesTitle>
                      <ChangesList>
                        {trend.majorChanges.map((change) => (
                          <ChangeItem key={change.championId} type={change.type}>
                            <ChangeChampIcon>
                              <Image 
                                src={change.imageUrl}
                                alt={change.championName}
                                layout="fill"
                                objectFit="cover"
                              />
                            </ChangeChampIcon>
                            <ChangeInfo>
                              <ChangeChampName>
                                {change.championName} ({change.type === 'buff' ? '強化' : '弱体化'})
                              </ChangeChampName>
                              <ChangeDescription>{change.description}</ChangeDescription>
                              <ImpactBadge impact={change.impact}>
                                影響度: {change.impact}/5
                              </ImpactBadge>
                            </ChangeInfo>
                          </ChangeItem>
                        ))}
                      </ChangesList>
                    </ChangesContainer>
                  </TrendContainer>
                ))}
              </div>
            )}
          </TabContent>
        </TabsContainer>
      </PageContainer>
    </>
  );
};

export default MetaPage;
