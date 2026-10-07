import { createHash } from 'node:crypto';
import { notFound } from 'next/navigation';
import { PROJECTS_HTML } from '@/data/html-projects';
import { PROJECT_SHELL_SOURCE_SHA256 } from '@/data/project-shell-tree';
import ProjectShell from '@/components/projects/ProjectShell';
import { FOOTER_SOURCE_SHA256 } from '@/data/shared-footer';
import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { PROJECTS } from '@/data/projects';
import { absoluteUrl, SITE_NAME, SITE_URL } from '@/data/seo';

// Rollback is evaluated per request, matching the Home/Work migration switches.
export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return Object.keys(PROJECTS_HTML).map((slug) => ({
    slug,
  }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const project = PROJECTS.find((item) => item.slug === params.slug);
  if (!project || !Object.prototype.hasOwnProperty.call(PROJECTS_HTML, params.slug)) {
    return { title: 'Project tidak ditemukan', robots: { index: false, follow: false } };
  }

  const path = `/projects/${project.slug}`;
  return {
    title: `${project.name} — Website & Branding Project`,
    description: project.description,
    keywords: [...project.keywords, project.client, 'portfolio website ARXENOVA'],
    alternates: { canonical: path },
    openGraph: {
      type: 'article',
      url: path,
      title: `${project.name} — ${SITE_NAME} Project`,
      description: project.description,
      images: [{ url: project.image, alt: `${project.name} project by ${SITE_NAME}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.name} — ${SITE_NAME} Project`,
      description: project.description,
      images: [project.image],
    },
  };
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  if (!Object.prototype.hasOwnProperty.call(PROJECTS_HTML, params.slug)) {
    notFound();
  }
  const html = PROJECTS_HTML[params.slug];
  const project = PROJECTS.find((item) => item.slug === params.slug)!;
  const projectSchema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${absoluteUrl(`/projects/${project.slug}`)}#project`,
    url: absoluteUrl(`/projects/${project.slug}`),
    name: project.name,
    description: project.description,
    image: project.image,
    dateCreated: project.year,
    keywords: project.keywords.join(', '),
    creator: { '@id': `${SITE_URL}/#organization` },
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Work', item: absoluteUrl('/work') },
      { '@type': 'ListItem', position: 3, name: project.name, item: absoluteUrl(`/projects/${project.slug}`) },
    ],
  };

  if (process.env.PROJECT_SHELL_USE_LEGACY !== '1') {
    if (createHash('sha256').update(html, 'utf8').digest('hex') !== PROJECT_SHELL_SOURCE_SHA256) {
      throw new Error('Project shell tree is stale. Run node scripts/generate-project-shell.mjs');
    }
    const path = `/projects/${params.slug}` as keyof typeof FOOTER_SOURCE_SHA256;
    if (process.env.FOOTER_USE_LEGACY !== '1' && FOOTER_SOURCE_SHA256[path] !== PROJECT_SHELL_SOURCE_SHA256) {
      throw new Error('Footer data is stale. Run node scripts/generate-footer-data.mjs');
    }
    return <><JsonLd data={[projectSchema, breadcrumbSchema]} /><ProjectShell useCanonicalFooter={process.env.FOOTER_USE_LEGACY !== '1'} /></>;
  }

  return (
    <>
      <JsonLd data={[projectSchema, breadcrumbSchema]} />
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        suppressHydrationWarning
      />
    </>
  );
}
