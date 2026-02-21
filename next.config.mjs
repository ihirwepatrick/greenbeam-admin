/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**', pathname: '/**' },
      { protocol: 'http', hostname: '**', pathname: '/**' },
    ],
  },
  async rewrites() {
    if (process.env.NODE_ENV !== 'development') return [];
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://api.greenbeam.online/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
