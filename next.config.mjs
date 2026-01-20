/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  // Empty turbopack config to silence the warning
  turbopack: {},
  output: 'standalone',
}

export default nextConfig
