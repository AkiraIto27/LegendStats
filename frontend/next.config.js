/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: [
      'ddragon.leagueoflegends.com', // Data Dragonから画像を取得
    ],
  },
  // 環境変数
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
    NEXT_PUBLIC_DATA_DRAGON_URL: 'https://ddragon.leagueoflegends.com/cdn',
  },
};

module.exports = nextConfig;
