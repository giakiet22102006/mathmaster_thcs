/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    return [
      {
        source: '/app-standalone',
        destination: '/mathmaster_thcs.html',
      },
    ];
  },
};

export default nextConfig;
