import { cookies } from 'next/headers.js';
import { type Lucia } from '../../lucia/index.js';
import { validateRequest } from './validateRequest.js';

export async function logout(lucia: Lucia) {
  const { session } = await validateRequest(lucia);
  if (!session) {
    return Promise.reject('Unauthorized');
  }

  await lucia.invalidateSession(session.token);

  const sessionCookie = lucia.createBlankSessionCookie();
  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
  return Promise.resolve();
}
