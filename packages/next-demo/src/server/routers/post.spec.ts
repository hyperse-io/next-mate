/**
 * Integration test example for the `post` router
 */
import { type inferProcedureInput } from '@trpc/server';
import { createContextInner } from '../context';
import { createCallerFactory } from '../trpc';
import { type AppRouter, appRouter } from './_app';

test('add and get post', async () => {
  const ctx = await createContextInner({
    session: null,
  });
  const callerFactory = createCallerFactory(appRouter);
  const caller = callerFactory(ctx);

  const input: inferProcedureInput<AppRouter['post']['add']> = {
    text: 'hello test',
    title: 'hello test',
  };

  const post = await caller.post.add(input);
  const byId = await caller.post.byId({ id: post.id });

  expect(byId).toMatchObject(input);
});
