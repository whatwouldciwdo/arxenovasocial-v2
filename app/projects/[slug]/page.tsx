import { createHash } from 'node:crypto';
import { notFound } from 'next/navigation';
import { PROJECTS_HTML } from '@/data/html-projects';
import { PROJECT_SHELL_SOURCE_SHA256 } from '@/data/project-shell-tree';
import ProjectShell from '@/components/projects/ProjectShell';
import { FOOTER_SOURCE_SHA256 } from '@/data/shared-footer';

// Rollback is evaluated per request, matching the Home/Work migration switches.
export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return Object.keys(PROJECTS_HTML).map((slug) => ({
    slug,
  }));
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  if (!Object.prototype.hasOwnProperty.call(PROJECTS_HTML, params.slug)) {
    notFound();
  }
  const html = PROJECTS_HTML[params.slug];

  if (process.env.PROJECT_SHELL_USE_LEGACY !== '1') {
    if (createHash('sha256').update(html, 'utf8').digest('hex') !== PROJECT_SHELL_SOURCE_SHA256) {
      throw new Error('Project shell tree is stale. Run node scripts/generate-project-shell.mjs');
    }
    const path = `/projects/${params.slug}` as keyof typeof FOOTER_SOURCE_SHA256;
    if (process.env.FOOTER_USE_LEGACY !== '1' && FOOTER_SOURCE_SHA256[path] !== PROJECT_SHELL_SOURCE_SHA256) {
      throw new Error('Footer data is stale. Run node scripts/generate-footer-data.mjs');
    }
    return <ProjectShell useCanonicalFooter={process.env.FOOTER_USE_LEGACY !== '1'} />;
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      suppressHydrationWarning
    />
  );
}
