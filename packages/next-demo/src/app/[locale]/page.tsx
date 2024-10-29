import { Suspense, use } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CreatePostForm } from '@/app/[locale]/post/components/CreatePostForm';
import { PostList } from '@/app/[locale]/post/components/PostList';
import { PostListItem } from '@/app/[locale]/post/components/PostListItem';
import { ProcessEnv } from '@/components/ProcessEnv/ProcessEnv';
import { rsc } from '@/server/rsc';
import { HydrateClient } from '@hyperse/next-core';

function PostListSkeleton() {
  return (
    <ul className="divide-y divide-gray-200">
      {Array.from({ length: 10 }).map((_, i) => (
        <PostListItem.Skeleton key={i} />
      ))}
    </ul>
  );
}

function PostListRSC() {
  use(
    Promise.all([
      rsc.post.list.fetchInfinite({}),
      // Display loading for at least 300ms
      new Promise((resolve) => setTimeout(resolve, 3_00)),
    ])
  );

  return (
    <HydrateClient state={use(rsc.dehydrate())}>
      <PostList />
    </HydrateClient>
  );
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const t = await getTranslations({
    locale: params.locale,
    namespace: 'IndexPage',
  });
  return {
    title: t('title'),
  };
}

export default async function Page(props: PageProps) {
  const params = await props.params;
  setRequestLocale(params.locale);

  const t = await getTranslations('IndexPage');
  // Once the request locale is set, you
  // can call hooks from `next-intl`

  return (
    <div className="space-y-6 p-4">
      <header>
        <h1>Overview {t('title')}</h1>
        <div className="prose rounded-md bg-white p-4 shadow">
          <p>
            First posts are fetched with RSC, the infinite scrolling is through
            client
          </p>
          <p>
            <a
              href="https://github.com/trpc/next-13"
              className="text-indigo-500 underline"
              target="_blank"
              rel="noreferrer"
            >
              View source on GitHub
            </a>
          </p>
          <ProcessEnv />
        </div>
      </header>
      <section>
        <h2>Add post</h2>
        <CreatePostForm />
      </section>
      <section>
        <h2>All posts</h2>
        <div className="overflow-hidden rounded-md bg-white shadow">
          <Suspense fallback={<PostListSkeleton />}>
            <PostListRSC />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
