import { getSession } from '@hyperse-io/next-auth';
import { type inferAsyncReturnType } from '@trpc/server';
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { type Session } from 'lucia';
import { auth } from '@/auth/lucia';
import { prisma } from './prisma';

interface CreateContextInnerOptions {
  session: Session | null;
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
  inferAsyncReturnType<typeof createContextInner> &
    Partial<FetchCreateContextFnOptions>
> {
  // RSC: for API-response caching see https://trpc.io/docs/caching
  const session = await getSession(auth, opts.req?.method ?? 'GET');
  const contextInner = await createContextInner({
    session,
  });
  return {
    ...contextInner,
    ...opts,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
