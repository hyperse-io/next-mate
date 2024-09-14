import { type NextRequest } from 'next/server';
import { auth } from '@/auth/lucia';
import { env } from '@/config/env';
import { sessionHandler } from '@hyperse/next-auth';

export const POST = async (req: NextRequest) => {
  return sessionHandler(auth, req, env.LUCIA_AUTH_SECRET);
};
