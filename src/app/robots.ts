import type { MetadataRoute } from 'next'
import { getAppUrl } from '@/lib/app-url'

export default function robots(): MetadataRoute.Robots {
  const appUrl = getAppUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/dashboard/', '/api/'],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
    host: appUrl,
  }
}
