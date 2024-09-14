import { notFound } from 'next/navigation';
import { queryMe } from '@/data/queries/query-me';
import { type NextMeQuery } from '@/generated-types';
import { graphqlRsc, rsc } from '@/server/rsc';
import { HydrateClient } from '@xpro-js/next-core';

export default async function Page(props: PageProps<{ id: string }>) {
  const post = await rsc.post.byId.fetch({ id: props.params.id });

  if (!post) {
    return notFound();
  }

  const { data } = await graphqlRsc.query<NextMeQuery>(queryMe, {});

  return (
    <HydrateClient state={await rsc.dehydrate()}>
      <div className="p-4">
        <article className="prose overflow-hidden rounded-md bg-white p-4 shadow-md">
          <h1>
            {post.title} : ID:{data?.me?.identifier}: locale:
            {props.params.locale}
          </h1>

          {post.text.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}

          <details>
            <summary>Raw data</summary>
            <pre>{JSON.stringify(post, null, 4)}</pre>
          </details>
        </article>
      </div>
    </HydrateClient>
  );
}
