/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['kaistudio-sdk-js'],
  webpack: (config) => {
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
    };
    return config;
  },
};

module.exports = nextConfig;