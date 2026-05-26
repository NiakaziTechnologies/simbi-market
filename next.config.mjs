/** @type {import('next').NextConfig} */
const backendUrl =
  (process.env.BACKEND_URL || "http://31.220.82.129:5003").replace(/\/$/, "")

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
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ]
  },
}

export default nextConfig
