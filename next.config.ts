/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'toituidhtqohyzwkurgm.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;


export default nextConfig;
