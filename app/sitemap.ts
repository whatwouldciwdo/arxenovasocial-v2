import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/data/seo';

export default function sitemap(): MetadataRoute.Sitemap {
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
  ];
}
