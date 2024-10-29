import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LayoutPage } from '@/components/LayoutPage/LayoutPage';
import { LogoutButton } from '@/components/LogoutButton/LogoutButton';
import { rsc } from '@/server/rsc';

export default async function Page(props: PageProps) {
  const params = await props.params;
  setRequestLocale(params.locale);

  const t = await getTranslations('Secret');
  const user = await rsc.whoami.fetch();

  return (
    <LayoutPage title={t('title')}>
      <div className="hero bg-base-200 min-h-screen">
        <div className="hero-content text-white">
          <div className="max-w-lg">
            <h1 className="text-center">You are logged in!</h1>
            <p className="my-4 text-center leading-loose">
              You are allowed to visit this page because you have a session,
              otherwise you would be redirected to the login page.
            </p>
            <div className="my-4 rounded-lg bg-gray-700 p-4">
              <pre>
                <code>{JSON.stringify(user, null, 2)}</code>
              </pre>
            </div>
            <div className="text-center">
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </LayoutPage>
  );
}
