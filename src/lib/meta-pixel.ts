export const META_PIXEL_ID = '1074160848795164'

type MetaStandardEvent =
  | 'PageView'
  | 'ViewContent'
  | 'Lead'
  | 'CompleteRegistration'
  | 'Subscribe'
  | 'Contact'
  | 'InitiateCheckout'

type MetaEventParameters = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    fbq?: (
      action: 'track' | 'trackCustom',
      event: MetaStandardEvent | string,
      parameters?: MetaEventParameters
    ) => void
  }
}

export function trackMetaEvent(event: MetaStandardEvent, parameters?: MetaEventParameters) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return

  if (parameters) {
    window.fbq('track', event, parameters)
    return
  }

  window.fbq('track', event)
}

export function trackMetaCustomEvent(event: string, parameters?: MetaEventParameters) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return

  if (parameters) {
    window.fbq('trackCustom', event, parameters)
    return
  }

  window.fbq('trackCustom', event)
}
