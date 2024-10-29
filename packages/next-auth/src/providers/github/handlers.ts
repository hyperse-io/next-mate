import { type ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { cookies } from 'next/headers.js';
import { type NextRequest, NextResponse } from 'next/server.js';
import { generateState, OAuth2RequestError } from 'oslo/oauth2';
import { generateId, type Lucia } from '../../lucia/index.js';
import { createSessionAndCookie } from '../../utils/createSessionAndCookie.js';
import { getSession } from '../../utils/get-session.js';
import { type OAuth2Provider } from '../providerType.js';

interface GitHubUser {
  id: string;
  login: string;
}

export async function authorizeHandler(
  lucia: Lucia,
  provider: OAuth2Provider,
  cookieAttributes: Partial<ResponseCookie>
) {
  const sessionAndUser = await getSession(lucia);
  if (sessionAndUser?.session) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/',
      },
    });
  }

  const state = generateState();
  const url = await provider.createAuthorizationURL(state, []);

  (await cookies()).set('github_oauth_state', state, {
    path: '/',
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    sameSite: 'lax',
    secure: true, // set `Secure` flag in HTTPS
    ...cookieAttributes,
  });

  return NextResponse.redirect(url);
}

export async function authorizeCallbackHandler(
  lucia: Lucia,
  provider: OAuth2Provider,
  request: NextRequest
) {
  const sessions = await getSession(lucia);
  const session = sessions?.session;
  if (session) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/',
      },
    });
  }

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const storedState =
    (await cookies()).get('github_oauth_state')?.value ?? null;
  if (!code || !state || !storedState || state !== storedState) {
    return new NextResponse(null, {
      status: 400,
    });
  }

  try {
    const tokens = await provider.validateAuthorizationCode(code);
    const githubUserResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
    const githubUser = (await githubUserResponse.json()) as GitHubUser;

    const existingUsers = await lucia.getAuthorized({
      providerId: githubUser.id?.toString(),
    });
    const existingUser = existingUsers?.[0];

    if (existingUser) {
      await createSessionAndCookie(lucia, existingUser.userId);
      return new NextResponse(null, {
        status: 302,
        headers: {
          Location: '/',
        },
      });
    }

    const userId = generateId(15);
    const sessionId = generateId(25);
    await lucia.createUser({
      providerId: githubUser.id?.toString(),
      username: githubUser.login,
      userId: userId,
      authId: sessionId,
      providerMethod: 'github',
      userAttributes: {},
    });

    await createSessionAndCookie(lucia, userId);
    return new NextResponse(null, {
      status: 302,
      headers: {
        Location: '/',
      },
    });
  } catch (e) {
    if (
      e instanceof OAuth2RequestError &&
      e.message === 'bad_verification_code'
    ) {
      // invalid code
      return new NextResponse(null, {
        status: 400,
      });
    }
    return new NextResponse(null, {
      status: 500,
    });
  }
}
