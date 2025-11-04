/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'robohash.org',
      },
    ],
  },
  webpack: (config) => {
    // Exclude applesauce directory from webpack processing
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', '**/applesauce/**'],
    };
    return config;
  },
}

module.exports = nextConfig
