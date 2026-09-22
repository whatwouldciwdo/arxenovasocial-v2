import { getHomeHtml } from '@/data/html-home';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const html = getHomeHtml();
  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      suppressHydrationWarning
    />
  );
}
