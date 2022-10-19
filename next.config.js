/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['arweave.net', 's3.eu-central-1.amazonaws.com']
  },
  webpack: (config, { isServer }) => {
    if (!isServer) config.resolve.fallback.fs = false;

    return config;
  },

}

module.exports = nextConfig
