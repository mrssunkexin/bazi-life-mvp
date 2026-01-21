/** @type {import('next').NextConfig} */
const nextConfig = {
  // 允许生产构建中存在 TypeScript 错误
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
