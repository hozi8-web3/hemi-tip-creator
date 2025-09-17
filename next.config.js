/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Image optimization
  images: {
    domains: ['ipfs.io', 'gateway.pinata.cloud', 'cloudflare-ipfs.com', 'images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Webpack optimizations
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  
  // PoweredByHeader
  poweredByHeader: false,
};

module.exports = nextConfig;