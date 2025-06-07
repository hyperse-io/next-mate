import withNextIntl from 'next-intl/plugin';
import { z } from 'zod';
import { createNextConfig, createNextConfigEnv } from '@hyperse/next-config';
import bundleAnalyzer from '@next/bundle-analyzer';
import { envSchema } from './src/config/envSchema.mjs';

/**
 * The order of plugins
 * @type {import("@hyperse/next-config").NextConfigPlugin}
 */
const plugins = [];

plugins.push(
  withNextIntl('./src/i18n.ts'),
  bundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
  })
);
const env = envSchema.extend({
  NEXT_BUILD_ENV_OUTPUT: z
    .enum(['standalone', 'export'], {
      description:
        'For standalone mode: https://nextjs.org/docs/app/api-reference/next-config-js/output',
    })
    .optional(),
});

// We use a custom env to validate the build env
const buildEnv = createNextConfigEnv(env, {
  isProd: process.env.ANALYZE === 'production',
});

/**
 * Don't be scared of the generics here.
 * All they do is to give us autocompletion when using this.
 * @type {import("next").NextConfig}
 */
const config = {
  reactStrictMode: true,
  output: buildEnv.NEXT_BUILD_ENV_OUTPUT,
  experimental: {
    // typedRoutes: true,
    // Turbo seemingly supports HMR for JSON files, quite handy to handle i18n messages.
    serverActions: {
      allowedForwardedHosts: ['www.domain.com', 'localhost'],
      allowedOrigins: ['www.domain.com', 'localhost'],
    },
  },
  serverExternalPackages: ['@node-rs/argon2', '@node-rs/bcrypt-darwin-arm64'],
  /** We run eslint as a separate task in CI */
  eslint: { ignoreDuringBuilds: !!process.env.CI },
  // transpilePackages: [
  //   '@hyperse/next-auth',
  //   '@hyperse/next-core',
  //   '@hyperse/next-config',
  // ],
};

export default createNextConfig(config, plugins);
