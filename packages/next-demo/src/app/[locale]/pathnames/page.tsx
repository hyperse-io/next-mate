import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LayoutPage } from '@/components/LayoutPage/LayoutPage';

export default async function Page(props: PageProps) {
  const params = await props.params;
  // Enable static rendering
  setRequestLocale(params.locale);

  const t = await getTranslations('PathnamesPage');

  return (
    <LayoutPage title={t('title')}>
      <div className="max-w-[490px] text-white">
        {t.rich('description', {
          p: (chunks) => <p className="mt-4">{chunks}</p>,
          code: (chunks) => (
            <code className="font-mono text-white">{chunks}</code>
          ),
        })}
      </div>
    </LayoutPage>
  );
}
