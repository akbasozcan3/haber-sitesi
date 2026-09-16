import type { NextConfig } from "next";

const backendStorageUrl = (
  process.env.BACKEND_STORAGE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/api\/?$/, "");

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongodb"],
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.webrazzi.com" },
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  async rewrites() {
    const isLocal =
      backendStorageUrl.includes("localhost") ||
      backendStorageUrl.includes("127.0.0.1");

    if (process.env.VERCEL && isLocal) {
      return [];
    }

    return [
      {
        source: "/storage/:path*",
        destination: `${backendStorageUrl}/storage/:path*`,
      },
    ];
  },
};

export default nextConfig;
