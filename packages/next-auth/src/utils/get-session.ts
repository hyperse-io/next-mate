import { cookies } from 'next/headers.js';
import { type Lucia, type Session, type User } from '../lucia/index.js';

export type IGetSessionReturn = {
  session: Session | null;
  user: User | null;
} | null;

export const getSession = async (lucia: Lucia): Promise<IGetSessionReturn> => {
  const sessionId =
    (await cookies()).get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) return null;
  const { session, user } = await lucia.validateSession(sessionId);

  return {
    session,
    user,
  };
};
