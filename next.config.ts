import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{
      protocol: "https",
      hostname: "**",
    },{
        protocol: 'http',
        hostname: 'localhost',
        port: '8099', // match your backend port
        pathname: '/public/storage/**',
      },
    ]
    // [new URL(process.env.NEXT_PUBLIC_STORAGE_API + '**')],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
