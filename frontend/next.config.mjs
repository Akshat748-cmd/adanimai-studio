/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@adanimai/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:5000';
    return [
      {
        source: '/api/scrape',
        destination: `${backendUrl}/api/scrape`,
      },
      {
        source: '/api/script/:path*',
        destination: `${backendUrl}/api/script/:path*`,
      },
      {
        source: '/api/video/:path*',
        destination: `${backendUrl}/api/video/:path*`,
      },
      {
        source: '/api/businesses',
        destination: `${backendUrl}/api/businesses`,
      },
      {
        source: '/api/cron/:path*',
        destination: `${backendUrl}/api/cron/:path*`,
      },
      {
        source: '/api/user/:path*',
        destination: `${backendUrl}/api/user/:path*`,
      },
    ];
  },
};

export default nextConfig;
