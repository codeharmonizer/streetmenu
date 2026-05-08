import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

const SUPPORTED_LOCALES = ['ar', 'en'] as const
type Locale = typeof SUPPORTED_LOCALES[number]

function isSupported(locale: string | undefined): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale)
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const raw = cookieStore.get('NEXT_LOCALE')?.value
  const locale: Locale = isSupported(raw) ? raw : 'ar'

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
