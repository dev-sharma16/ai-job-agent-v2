/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@job-agent/config',
    '@job-agent/domain',
    '@job-agent/db',
    '@job-agent/ai',
    '@job-agent/resume',
    '@job-agent/application',
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

module.exports = nextConfig;
