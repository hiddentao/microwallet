const path = require('path');
const { NormalModuleReplacementPlugin } = require('webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => {
    return [
      {
        // Routes this applies to
        source: '/api/(.*)',
        // Headers
        headers: [
          // Allow for specific domains to have access or * for all
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          // Allows for specific methods accepted
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          // Allows for specific headers accepted (These are a few standard ones)
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  output: 'standalone',
  webpack: (config) => {
    // see https://github.com/sindresorhus/got/issues/2267#issuecomment-1659768856
    config.ignoreWarnings = [{ module: /node_modules\/keyv\/src\/index\.js/ }];

    // see https://github.com/rainbow-me/rainbowkit/blob/main/examples/with-next-app/next.config.js
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    config.externals.push(
      'pino-pretty',
      'lokijs',
      'encoding',
      'bufferutil',
      'utf-8-validate',
    );

    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    config.plugins.push(
      new NormalModuleReplacementPlugin(/node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, '');
      }),
    );

    return config;
  },
};

module.exports = nextConfig;
