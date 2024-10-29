import { auth } from '@/auth/lucia';
import { getSession, type IGetSessionReturn } from '@hyperse/next-auth';
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { prisma } from './prisma';

interface CreateContextInnerOptions {
  session: IGetSessionReturn;
  validateSession: () => Promise<IGetSessionReturn>;
}

/**
 * Inner function for `createContext` where we create the context.
 * This is useful for testing when we don't want to mock Next.js' request/response
 */
export async function createContextInner(opts: CreateContextInnerOptions) {
  return {
    prisma,
    session: opts.session,
    validateSession: opts.validateSession,
  };
}

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export async function createContext(
  opts: Partial<FetchCreateContextFnOptions>
): Promise<
  Awaited<ReturnType<typeof createContextInner>> &
    Partial<FetchCreateContextFnOptions>
> {
  // RSC: for API-response caching see https://trpc.io/docs/caching
  const sessionResult = await getSession(auth);
  const innerOpts = {
    session: sessionResult,
    validateSession: async () => {
      const sessionResult = await getSession(auth);
      innerOpts.session = sessionResult;
      return sessionResult;
    },
  };
  const contextInner = await createContextInner(innerOpts);
  return {
    ...contextInner,
    ...opts,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
