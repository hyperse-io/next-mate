import { passwordAuth } from '@/auth/lucia';
import { loginSchema, signUpSchema } from '@/common/validation/auth';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { publicProcedure, router } from '../trpc';

export const authRouter = router({
  signUp: publicProcedure.input(signUpSchema).mutation(async ({ input }) => {
    const { username, email, password } = input;
    try {
      await passwordAuth.register(username, password, { email });

      return {
        status: 201,
        message: 'Account created successfully',
      };
    } catch (err) {
      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        return {
          status: 400,
          message: 'USER_ALREADY_EXISTS',
        };
        // throw new TRPCError({
        //   code: 'CONFLICT',
        //   message: 'USER_ALREADY_EXISTS',
        // });
      }
      return {
        status: 500,
        message: err || 'INTERNAL_SERVER_ERROR',
      };
      // throw new TRPCError({
      //   code: 'INTERNAL_SERVER_ERROR',
      //   message: 'An unknown error occurred',
      // });
    }
  }),
  signIn: publicProcedure.input(loginSchema).mutation(async ({ input }) => {
    const { password, username } = input;
    try {
      await passwordAuth.login(username, password);

      return {
        status: 200,
        message: 'Login created successfully',
      };
    } catch (err) {
      if (
        // 此处自定义错误
        err
      ) {
        // user does not exist, or invalid password
        return {
          err,
          status: 400,
          message: 'CredentialsSignin',
        };
      }
      return {
        err,
        status: 500,
        message: err || 'An unknown error occurred',
      };
    }
  }),
});
