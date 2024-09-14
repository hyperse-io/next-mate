import { type NextRequest } from 'next/server';
import { auth } from '@/auth/lucia';
import { env } from '@/config/env';
import { logoutHandler } from '@xpro-js/next-auth';

const handleLogout = (request: NextRequest) => {
  return logoutHandler(auth, request, {
    logoutPath: env.LUCIA_AUTH_URL,
  });
};

export const GET = (request: NextRequest) => {
  return handleLogout(request);
};

export const POST = (request: NextRequest) => {
  // Modify the implementation of the POST function here
  return handleLogout(request);
};
