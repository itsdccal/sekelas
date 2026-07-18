import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations for bundle size and loading speed
  // Next.js App Router automatically code-splits per route, but these
  // additional settings help ensure optimal bundle delivery.

  // Enable React strict mode for development performance insights
  reactStrictMode: true,

  // Set turbopack root to this project directory
  turbopack: {
    root: '..',
  },

  // Optimize package imports - tree-shake heavy dependencies
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-popover',
    ],
  },

  // Note: video.js is dynamically imported client-side only (in VideoPlayer.tsx),
  // so no serverExternalPackages configuration needed.

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Compress responses
  compress: true,

  // Power header to improve FCP: ensures proper caching
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
      ],
    },
    {
      // Static assets cache
      source: '/(.*)\\.(js|css|woff|woff2|ttf|ico|svg|png|jpg|jpeg|webp|avif)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
};

export default nextConfig;
