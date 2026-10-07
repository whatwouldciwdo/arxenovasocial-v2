import type { MetadataRoute } from 'next';
import { PROJECTS_HTML } from '@/data/html-projects';
import { absoluteUrl } from '@/data/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const projectPages: MetadataRoute.Sitemap = Object.keys(PROJECTS_HTML).map((slug) => ({
    url: absoluteUrl(`/projects/${slug}`),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    {
      url: absoluteUrl('/'),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: absoluteUrl('/work'),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...projectPages,
  ];
}