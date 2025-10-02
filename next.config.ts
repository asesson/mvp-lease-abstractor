import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript checking during production builds
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude pdf-parse from webpack bundling on server
      config.externals = config.externals || [];
      config.externals.push('pdf-parse', 'canvas');
    }
    return config;
  },
};

export default nextConfig;
