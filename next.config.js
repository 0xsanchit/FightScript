/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    return config
  },
  async rewrites() {
    const apiUrl = process.env.NODE_ENV === 'production'
      ? 'https://co3pe.onrender.com/api'
      : 'http://localhost:5000/api';

    console.log(`Using API URL: ${apiUrl}`);

    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
      {
        source: '/api/users/:id',
        destination: `${apiUrl}/users/:id`,
      },
      {
        source: '/api/health',
        destination: `${apiUrl}/health`,
      },
    ];
  },
  transpilePackages: [
    '@solana/wallet-adapter-react',
    '@solana/wallet-adapter-react-ui',
    '@solana/wallet-adapter-wallets',
    '@solana/wallet-adapter-base'
  ]
}

module.exports = nextConfig 