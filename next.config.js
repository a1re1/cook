/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['100.70.172.59'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
      },
    ],
  },
}

module.exports = nextConfig
