/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: '/api/webhook',
        destination: '/api/webhook',
      },
    ]
  },
}

export default nextConfig
