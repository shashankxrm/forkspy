import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker optimization
  output: 'standalone',
  
  images: {
    domains: ['hebbkx1anhila5yf.public.blob.vercel-storage.com', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/forkspy-light-sKEDeZLQEnmozK17sO1A1wbZbrY1Vt.png','https://hebbkx1anhila5yf.public.blob.vercel-storage.com/forkspy-light-sKEDeZLQEnmozK17sO1A1wbZbrY1Vt.png', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/forkspy-dark-ViEZTGQPOqJ7kFBZIZ2JH60w1iC0uW.png']
  }
};

export default nextConfig;
