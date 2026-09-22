import { notFound } from 'next/navigation';
import { PROJECTS_HTML } from '@/data/html-projects';

export async function generateStaticParams() {
  return Object.keys(PROJECTS_HTML).map((slug) => ({
    slug,
  }));
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const html = PROJECTS_HTML[params.slug];
  if (!html) {
    notFound();
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      suppressHydrationWarning
    />
  );
}
