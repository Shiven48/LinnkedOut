import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    qualities: [25, 50, 75, 95, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "external-preview.redd.it",
      },
      {
        protocol: "https",
        hostname: "i.redd.it",
      },
      {
        protocol: "https",
        hostname: "preview.redd.it",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
  output: "standalone",
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  experimental: {
    // optimizeCss: true,
  },
  turbopack: {
    resolveAlias: {
      "webworker-threads": "./empty-mock.js",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "webworker-threads": false,
    };
    return config;
  },
};

export default nextConfig;
