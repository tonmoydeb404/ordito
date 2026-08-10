import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@packages/ui"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "placehold.co" }],
  },
};

export default nextConfig;
