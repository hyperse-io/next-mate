import { createLocalizedPathnamesNavigation } from 'next-intl/navigation';
import { Pathnames } from 'next-intl/routing';

export const locales = ['en', 'de'] as const;

// https://next-intl-docs.vercel.app/docs/routing/navigation#shared-pathnames
export const pathnames = {
  '/': '/',
  '/pathnames': {
    en: '/pathnames',
    de: '/pfadnamen',
  },
  '/secret': '/secret',
  '/login': '/login',
  '/signup': '/signup',
} satisfies Pathnames<typeof locales>;

export const { Link, redirect, usePathname, useRouter } =
  createLocalizedPathnamesNavigation({
    locales,
    pathnames,
  });
