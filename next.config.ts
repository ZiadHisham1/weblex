import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: false,
  partialPrefetching: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  experimental: {
    serverComponentsExternalPackages: ['@medusajs/framework', '@medusajs/medusa'],
    serverActions: {
      bodySizeLimit: '50mb', // Allows videos up to 50MB (increase if needed)
    },
  },
  trailingSlash: false,
};

export default nextConfig;
