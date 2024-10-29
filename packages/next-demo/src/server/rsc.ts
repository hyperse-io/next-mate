import { createContext } from '@/server/context';
import { appRouter } from '@/server/routers/_app';
import { createTRPCNextLayout, transformer } from '@hyperse/next-core';
import { cacheExchange, createClient, fetchExchange } from '@urql/core';
import { registerUrql } from '@urql/next/rsc';
import 'server-only';

const makeClient = () => {
  return createClient({
    url: 'http://localhost:3001/shop-api',
    exchanges: [cacheExchange, fetchExchange],
  });
};

const { getClient } = registerUrql(makeClient);

/**
 * Run in server side only
 * don't supports `cookies()`
 */
export const graphqlRsc = getClient();
/**
 * Run in server side only
 * React server components, only can be run in server side
 * don't supports `cookies()`
 */
export const rsc = createTRPCNextLayout({
  router: appRouter,
  transformer,
  createContext() {
    return createContext({});
  },
});
