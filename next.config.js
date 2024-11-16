/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: { unoptimized: true },
    webpack: (config) => {
        config.resolve.fallback = { fs: false, net: false, tls: false }
        return config
    },
}

module.exports = nextConfig
