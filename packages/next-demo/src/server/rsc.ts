import { cookies } from 'next/headers';
import { createContext } from '@/server/context';
import { appRouter } from '@/server/routers/_app';
import { cacheExchange, createClient, fetchExchange } from '@urql/core';
import { registerUrql } from '@urql/next/rsc';
import { createTRPCNextLayout, transformer } from '@xpro-js/next-core';
import 'server-only';

/**
 * React server components, only can be run in server side
 */
export const rsc = createTRPCNextLayout({
  router: appRouter,
  transformer,
  createContext() {
    return createContext({});
  },
});

const makeClient = () => {
  return createClient({
    url: 'http://localhost:3001/shop-api',
    exchanges: [cacheExchange, fetchExchange],
    fetchOptions: () => {
      const allCookies = cookies().getAll();
      console.log('allCookies:', allCookies);
      const token = `f7993461ca44c7bf3adab00adfeb505c5c2bf3cb6b6faac2156a866738b21803`;
      return {
        // cache: 'no-store',
        headers: { authorization: token ? `Bearer ${token}` : '' },
      };
    },
  });
};

const { getClient } = registerUrql(makeClient);

export const graphqlRsc = getClient();
