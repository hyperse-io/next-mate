import { type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { createAuthMiddleware } from '@xpro-js/next-auth';
import { env } from './config/env';
import { locales, pathnames } from './navigation';

const publicPages = [
  '/',
  '/login',
  '/signup',
  '/post/.*',
  // (/secret requires auth)
];

const intlMiddleware = createIntlMiddleware({
  locales,
  localePrefix: 'always',
  defaultLocale: 'en',
  pathnames,
});

// Note that this callback is only invoked if
// the `authorized` callback has returned `true`
// and not for pages listed in `pages`.
const authMiddleware = createAuthMiddleware(intlMiddleware, {
  port: env.PORT,
  luciaAuthUrl: env.LUCIA_AUTH_URL,
  luciaAuthSecret: env.LUCIA_AUTH_SECRET,
});

export default function middleware(req: NextRequest) {
  const publicPathnameRegex = RegExp(
    `^(/(${locales.join('|')}))?(${publicPages.join('|')})?/?$`,
    'i'
  );
  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);
  if (isPublicPage) {
    return intlMiddleware(req);
  } else {
    return authMiddleware(req);
  }
}

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!api|_next|.*\\..*).*)'],
  runtime: 'nodejs',
};
