
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    // config options here
    reactStrictMode: true,
    eslint: {
        ignoreDuringBuilds: true, // Disable ESLint during builds
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'external-preview.redd.it'
            },
            {
                protocol: 'https',
                hostname: 'i.redd.it'
            },
            {
                protocol: 'https',
                hostname: 'preview.redd.it'
            },
            {
                protocol: 'https',
                hostname: 'i.ytimg.com'
            }
        ]
    }
}

export default nextConfig
