import { auth } from '@/auth/lucia';
import { getSession, type IGetSessionReturn } from '@hyperse/next-auth';
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { prisma } from './prisma';

interface CreateContextInnerOptions {
  session: IGetSessionReturn;
}

/**
 * Inner function for `createContext` where we create the context.
 * This is useful for testing when we don't want to mock Next.js' request/response
 */
export async function createContextInner(opts: CreateContextInnerOptions) {
  return {
    prisma,
    session: opts.session,
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
  const contextInner = await createContextInner({
    session: sessionResult,
  });
  return {
    ...contextInner,
    ...opts,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
