import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Imagens de demonstração (mocks)
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "media.istockphoto.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      // Storage em Cloudflare R2 (URLs pré-assinadas, com query string de assinatura)
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "*.r2.dev" },
      // Storage do backend — porta deve bater com NEXT_PUBLIC_STORAGE_API (.env)
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/public/storage/**",
      },
      {
        protocol: "http",
        hostname: "host.docker.internal",
        port: "8080",
        pathname: "/public/storage/**",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
