const createNextIntlPlugin = require('next-intl/plugin')

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'talabat.dhmedia.io',
        port: '',
        pathname: '/image/talabat/**',
      },
      {
        protocol: 'https',
        hostname: 'relaxedmenu.beyounded.com',
        port: '',
        pathname: '/prospect-photos/**',
      },
    ],
  },
}

module.exports = withNextIntl(nextConfig)
