import { cookies } from 'next/headers.js';
import { type Lucia } from '../lucia/index.js';

export const createSessionAndCookie = async (lucia: Lucia, userId: string) => {
  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.token);
  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
};
