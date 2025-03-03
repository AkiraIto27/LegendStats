import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 1rem;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #00bcd4;
    box-shadow: 0 0 0 2px rgba(0, 188, 212, 0.2);
  }
`;

const SearchButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #00bcd4;
  border: none;
  border-radius: 4px;
  color: white;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0097a7;
  }
`;

const RegionSelector = styled.select`
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.4rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: #f5f5f5;
  font-size: 0.85rem;
  z-index: 1;
`;

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('JP');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // フォーカスがない場合にスラッシュキーで検索にフォーカス
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/summoner/${region}/${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <SearchContainer>
      <form onSubmit={handleSearch}>
        <SearchInput
          ref={inputRef}
          type="text"
          placeholder="サモナー名を検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ paddingLeft: '60px', paddingRight: '80px' }}
        />
        <RegionSelector
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          <option value="JP">JP</option>
          <option value="KR">KR</option>
          <option value="NA">NA</option>
          <option value="EUW">EUW</option>
          <option value="EUNE">EUNE</option>
          <option value="BR">BR</option>
          <option value="LAN">LAN</option>
          <option value="LAS">LAS</option>
          <option value="OCE">OCE</option>
          <option value="TR">TR</option>
          <option value="RU">RU</option>
        </RegionSelector>
        <SearchButton type="submit">検索</SearchButton>
      </form>
    </SearchContainer>
  );
};

export default SearchBar;
