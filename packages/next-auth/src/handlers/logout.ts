import { cookies } from 'next/headers.js';
import { type NextRequest, NextResponse } from 'next/server.js';
import { type Lucia } from '../lucia/core.js';
import { validateRequest } from '../providers/password/validateRequest.js';

export async function logoutHandler(
  lucia: Lucia,
  request: NextRequest,
  options: {
    handler?: (request: NextRequest) => Promise<void>;
    path?: string;
    logoutPath: string;
  } = {
    logoutPath: '',
  }
) {
  const { session } = await validateRequest(lucia);
  if (!session) {
    return new NextResponse('Unauthorized', {
      status: 401,
    });
  }

  if (options?.handler) {
    await options.handler?.(request);
  }

  await lucia.invalidateSession(session.token);

  const sessionCookie = lucia.createBlankSessionCookie();
  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  return NextResponse.redirect(
    new URL(options?.path ?? '/login', options.logoutPath)
  );
}
