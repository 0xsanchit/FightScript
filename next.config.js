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
    // Hardcode the API URL for production
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? 'https://co3pe.onrender.com' 
      : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
    
    console.log('Using API URL:', apiUrl);
    
    return [
      {
        source: '/api/chess/:path*',
        destination: `${apiUrl}/api/chess/:path*`,
      },
      {
        source: '/api/users/:id',
        destination: `${apiUrl}/api/users/:id`,
      },
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
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