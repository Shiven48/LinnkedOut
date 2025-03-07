import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: ['external-preview.redd.it', 'i.redd.it', 'preview.redd.it', 'i.ytimg.com'],
  },
};

export default nextConfig;
