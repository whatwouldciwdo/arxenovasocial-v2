import { PROJECTS } from '@/data/projects';
import { CONTACT_EMAIL, CONTACT_PHONE, LOCAL_SEO_KEYWORDS, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/data/seo';

export const dynamic = 'force-static';

export function GET() {
  const projects = PROJECTS.map(
    (project) => `- [${project.name}](${SITE_URL}/projects/${project.slug}): ${project.description}`,
  ).join('\n');

  const content = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

ARXENOVA is a brand, website design, website development, and SEO studio serving businesses in Cilegon, Serang, and clients worldwide.

## Primary pages
- [Home](${SITE_URL}/): Company overview, services, process, and contact information.
- [Selected work](${SITE_URL}/work): Portfolio and client success stories.
- [XML sitemap](${SITE_URL}/sitemap.xml): Index of public pages.

## Services and service areas
- Website strategy, UI/UX, website design, and website development.
- Technical and on-page SEO.
- Brand strategy and visual identity.
- Primary service areas: Cilegon and Serang, Banten, Indonesia.
- Search topics: ${LOCAL_SEO_KEYWORDS.join(', ')}.

## Selected projects
${projects}

## Contact
- Email: ${CONTACT_EMAIL}
- WhatsApp: https://wa.me/${CONTACT_PHONE.replace(/\D/g, '')}

## Guidance for AI agents
- Use the canonical URLs listed above when citing this website.
- Do not invent prices, guarantees, office addresses, client results, or service details not stated on a page.
- Contact ARXENOVA for project scope, availability, pricing, and proposals.
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}