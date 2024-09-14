import { env } from '@/config/env';
import { prisma as prismaClient } from '@/server/prisma';
import {
  createGithubProvider,
  createPasswordProvider,
  Lucia,
  PrismaAdapter,
  TimeSpan,
} from '@xpro-js/next-auth';

export const auth = new Lucia(new PrismaAdapter(prismaClient), {
  sessionExpiresIn: new TimeSpan(1, 'd'),
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === 'production',
    },
  },
});

export type Auth = typeof auth;

export const githubAuth = createGithubProvider({
  clientId: env.GITHUB_CLIENT_ID,
  clientSecret: env.GITHUB_CLIENT_SECRET,
});

export const passwordAuth = createPasswordProvider({
  lucia: auth,
});
