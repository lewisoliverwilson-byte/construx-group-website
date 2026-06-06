import type { MetadataRoute } from 'next';
import { ventures } from '@/lib/ventures';
import { getAllPostMeta } from '@/lib/posts';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://construxgroup.io';

export default function sitemap(): MetadataRoute.Sitemap {
  const postMeta = getAllPostMeta();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/ventures`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/manifesto`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/founders`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/work-with-us`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/journal`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.6 },
    { url: `${BASE_URL}/uses`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.65 },
    { url: `${BASE_URL}/now`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/stats`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.5 },
  ];

  const ventureRoutes: MetadataRoute.Sitemap = ventures.map((v) => ({
    url: `${BASE_URL}/ventures/${v.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.85,
  }));

  const postRoutes: MetadataRoute.Sitemap = postMeta.map((p) => ({
    url: `${BASE_URL}/journal/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: 'monthly',
    priority: 0.75,
  }));

  return [...staticRoutes, ...ventureRoutes, ...postRoutes];
}
