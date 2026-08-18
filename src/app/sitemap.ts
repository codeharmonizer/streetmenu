import type { MetadataRoute } from 'next'
import { getAppUrl } from '@/lib/app-url'

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = getAppUrl()
  const now = new Date()

  return [
    {
      url: `${appUrl}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${appUrl}/register`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${appUrl}/demo`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${appUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]
}
