'use client'

import { LocateFixed, MapPin, X } from 'lucide-react'
import { useLocale } from 'next-intl'

const BAHRAIN_BOUNDS = {
  north: 26.35,
  south: 25.55,
  west: 50.30,
  east: 50.85,
}
const DEFAULT_LOCATION = { lat: 26.0667, lng: 50.5577 }

interface LocationValue {
  lat: number | null
  lng: number | null
  address: string | null
}

interface Props {
  value: LocationValue
  onChange: (value: LocationValue) => void
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function formatCoord(value: number | null) {
  return value == null ? '' : value.toFixed(6)
}

function mapSrc(lat: number, lng: number) {
  const delta = 0.01
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join(',')
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`
}

export default function LocationPicker({ value, onChange }: Props) {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const lat = value.lat ?? DEFAULT_LOCATION.lat
  const lng = value.lng ?? DEFAULT_LOCATION.lng

  function updateLocation(nextLat: number, nextLng: number) {
    onChange({
      ...value,
      lat: Math.round(nextLat * 1_000_000) / 1_000_000,
      lng: Math.round(nextLng * 1_000_000) / 1_000_000,
    })
  }

  function handleMapClick(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1)
    const y = clamp((e.clientY - rect.top) / rect.height, 0, 1)
    const nextLng = BAHRAIN_BOUNDS.west + x * (BAHRAIN_BOUNDS.east - BAHRAIN_BOUNDS.west)
    const nextLat = BAHRAIN_BOUNDS.north - y * (BAHRAIN_BOUNDS.north - BAHRAIN_BOUNDS.south)
    updateLocation(nextLat, nextLng)
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(pos => {
      updateLocation(pos.coords.latitude, pos.coords.longitude)
    })
  }

  function clearLocation() {
    onChange({ ...value, lat: null, lng: null })
  }

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
        <iframe
          title={isAr ? 'خريطة الموقع' : 'Location map'}
          src={mapSrc(lat, lng)}
          className="h-56 w-full"
          style={{ border: 0, pointerEvents: 'none' }}
          loading="lazy"
        />
        <button
          type="button"
          aria-label={isAr ? 'اختر الموقع على الخريطة' : 'Choose location on map'}
          onClick={handleMapClick}
          className="absolute inset-0 cursor-crosshair"
        >
          <span
            className="absolute -translate-x-1/2 -translate-y-full rounded-full p-1 shadow-lg"
            style={{
              left: `${((lng - BAHRAIN_BOUNDS.west) / (BAHRAIN_BOUNDS.east - BAHRAIN_BOUNDS.west)) * 100}%`,
              top: `${((BAHRAIN_BOUNDS.north - lat) / (BAHRAIN_BOUNDS.north - BAHRAIN_BOUNDS.south)) * 100}%`,
              color: 'white',
              background: 'var(--brand)',
            }}
          >
            <MapPin size={24} fill="currentColor" />
          </span>
        </button>
      </div>

      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {isAr
          ? 'اضغط على الخريطة لتحديد موقعك. يمكنك أيضاً تعديل الإحداثيات يدوياً.'
          : 'Click the map to set your location. You can also edit coordinates manually.'}
      </p>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label">{isAr ? 'خط العرض' : 'Latitude'}</label>
          <input
            type="number"
            step="0.000001"
            className="input"
            value={formatCoord(value.lat)}
            onChange={e => onChange({ ...value, lat: e.target.value ? Number(e.target.value) : null })}
          />
        </div>
        <div>
          <label className="label">{isAr ? 'خط الطول' : 'Longitude'}</label>
          <input
            type="number"
            step="0.000001"
            className="input"
            value={formatCoord(value.lng)}
            onChange={e => onChange({ ...value, lng: e.target.value ? Number(e.target.value) : null })}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={useCurrentLocation} className="btn-secondary text-xs">
          <LocateFixed size={13} /> {isAr ? 'استخدم موقعي الحالي' : 'Use current location'}
        </button>
        {(value.lat != null || value.lng != null) && (
          <button type="button" onClick={clearLocation} className="btn-secondary text-xs">
            <X size={13} /> {isAr ? 'مسح الموقع' : 'Clear location'}
          </button>
        )}
      </div>
    </div>
  )
}
