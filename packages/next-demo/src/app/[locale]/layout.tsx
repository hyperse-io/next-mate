import { type PropsWithChildren } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { PublicEnvScript } from 'next-runtime-env';
import { ClientProvider } from '@/common/client-trpc';
import { Navigation } from '@/components/Navigation/Navigation';
import { locales } from '@/navigation';
import './globals.css';

export default async function LocaleLayout({
  children,
  params,
}: PropsWithChildren<PageProps>) {
  const { locale } = await params;
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as never)) notFound();

  // https://next-intl-docs.vercel.app/blog/next-intl-3-0#static-rendering-of-server-components
  setRequestLocale(locale);

  // Receive messages provided in `i18n.ts`
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <PublicEnvScript />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <ClientProvider>
          <Navigation />
          <main>
            <NextIntlClientProvider messages={messages}>
              {children}
            </NextIntlClientProvider>
          </main>
        </ClientProvider>
      </body>
    </html>
  );
}
