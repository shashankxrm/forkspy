/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  async redirects() {
    return [
      {
        source: '/api/webhook',
        destination: '/api/webhook/',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
