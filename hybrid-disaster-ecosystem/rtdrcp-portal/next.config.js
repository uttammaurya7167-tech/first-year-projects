/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Leaflet needs to be imported client-side only
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    return config;
  },
};

module.exports = nextConfig;
