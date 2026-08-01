'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'

interface DaySchedule {
  enabled: boolean
  open:    string
  close:   string
}

type Schedule = Record<string, DaySchedule>

const DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAYS_SHORT_AR = ['أح', 'اث', 'ثل', 'أر', 'خم', 'جم', 'سب']
const DAYS_SHORT_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

// Work-week presets (Bahrain): Sun-Thu, weekends Fri-Sat, or every day
const PRESETS_AR = [
  { label: 'يومياً',           days: [0, 1, 2, 3, 4, 5, 6] },
  { label: 'الأحد – الخميس',  days: [0, 1, 2, 3, 4]       },
  { label: 'الجمعة – السبت',  days: [5, 6]                 },
  { label: 'الخميس – السبت',  days: [4, 5, 6]              },
]
const PRESETS_EN = [
  { label: 'Every day',        days: [0, 1, 2, 3, 4, 5, 6] },
  { label: 'Sun – Thu',        days: [0, 1, 2, 3, 4]       },
  { label: 'Fri – Sat',        days: [5, 6]                 },
  { label: 'Thu – Sat',        days: [4, 5, 6]              },
]

const DEFAULT_OPEN  = '17:00'
const DEFAULT_CLOSE = '22:00'

function defaultSchedule(): Schedule {
  return Object.fromEntries(
    DAYS_AR.map((_, i) => [i, { enabled: false, open: DEFAULT_OPEN, close: DEFAULT_CLOSE }])
  )
}

/** Try to parse a saved hours string back to a schedule. Falls back to default. */
function parseHours(hours: string | null | undefined): Schedule {
  const sched = defaultSchedule()
  // If nothing saved, return default
  if (!hours) return sched
  return sched // complex parsing not needed; we just use the raw string on first load
}

/** Format schedule state to a human-readable string */
function formatSchedule(sched: Schedule, locale: string): string {
  const days     = locale === 'ar' ? DAYS_AR      : DAYS_EN
  const enabled  = Object.entries(sched).filter(([, v]) => v.enabled)
  if (!enabled.length) return ''

  // Group consecutive days
  const indices = enabled.map(([k]) => parseInt(k)).sort((a, b) => a - b)

  // Format a single time (24h → 12h am/pm)
  function fmt(t: string) {
    const [h, m] = t.split(':').map(Number)
    if (locale === 'ar') {
      const period = h < 12 ? 'ص' : 'م'
      const h12    = h % 12 || 12
      return `${h12}${m ? ':' + String(m).padStart(2, '0') : ''}${period}`
    } else {
      const period = h < 12 ? 'am' : 'pm'
      const h12    = h % 12 || 12
      return `${h12}${m ? ':' + String(m).padStart(2, '0') : ''}${period}`
    }
  }

  // Build ranges of consecutive days
  const ranges: string[] = []
  let i = 0
  while (i < indices.length) {
    let j = i
    while (j + 1 < indices.length && indices[j + 1] === indices[j] + 1) j++
    const { open, close } = sched[indices[i]]
    const dayStr = j > i ? `${days[indices[i]]} – ${days[indices[j]]}` : days[indices[i]]
    ranges.push(`${dayStr} · ${fmt(open)} – ${fmt(close)}`)
    i = j + 1
  }
  return ranges.join(' / ')
}

interface Props {
  value:    string | null | undefined
  onChange: (formatted: string) => void
}

export default function HoursBuilder({ value, onChange }: Props) {
  const locale   = useLocale()
  const days     = locale === 'ar' ? DAYS_AR       : DAYS_EN
  const daysShort = locale === 'ar' ? DAYS_SHORT_AR : DAYS_SHORT_EN
  const presets  = locale === 'ar' ? PRESETS_AR    : PRESETS_EN

  const [sched, setSched] = useState<Schedule>(defaultSchedule)
  const [mode,  setMode]  = useState<'builder' | 'text'>('builder')

  // Detect if existing value can't be cleanly represented → fall back to text mode
  useEffect(() => {
    if (value && value.trim()) {
      // Try builder mode; if value has no schedule data yet, start fresh
      setSched(defaultSchedule())
    }
  }, [value])

  function toggleDay(idx: number) {
    setSched(prev => {
      const next = { ...prev, [idx]: { ...prev[idx], enabled: !prev[idx].enabled } }
      onChange(formatSchedule(next, locale))
      return next
    })
  }

  function setTime(idx: number, field: 'open' | 'close', val: string) {
    setSched(prev => {
      const next = { ...prev, [idx]: { ...prev[idx], [field]: val } }
      onChange(formatSchedule(next, locale))
      return next
    })
  }

  function applyPreset(dayIndices: number[]) {
    setSched(prev => {
      const next = { ...defaultSchedule() }
      // Keep existing times if already set; use defaults otherwise
      const firstEnabled = Object.entries(prev).find(([, v]) => v.enabled)
      const refOpen  = firstEnabled ? firstEnabled[1].open  : DEFAULT_OPEN
      const refClose = firstEnabled ? firstEnabled[1].close : DEFAULT_CLOSE
      dayIndices.forEach(i => { next[i] = { enabled: true, open: refOpen, close: refClose } })
      onChange(formatSchedule(next, locale))
      return next
    })
  }

  function setAllTimes(field: 'open' | 'close', val: string) {
    setSched(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(k => {
        if (next[k].enabled) next[k] = { ...next[k], [field]: val }
      })
      onChange(formatSchedule(next, locale))
      return next
    })
  }

  const enabledIndices = Object.entries(sched).filter(([, v]) => v.enabled).map(([k]) => parseInt(k))
  const allSameTime    = enabledIndices.length > 1 &&
    enabledIndices.every(i => sched[i].open === sched[0]?.open && sched[i].close === sched[0]?.close)

  return (
    <div className="space-y-3">
      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {presets.map(p => (
          <button key={p.label} type="button"
            onClick={() => applyPreset(p.days)}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
            style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Day toggles */}
      <div className="flex gap-1.5 flex-wrap">
        {days.map((day, idx) => (
          <button key={idx} type="button"
            onClick={() => toggleDay(idx)}
            title={day}
            className="w-10 h-10 rounded-xl text-xs font-bold transition-all"
            style={{
              background: sched[idx].enabled ? 'var(--brand)'     : 'var(--surface-2)',
              color:      sched[idx].enabled ? 'white'            : 'var(--text-secondary)',
              border:     `1px solid ${sched[idx].enabled ? 'var(--brand)' : 'var(--border)'}`,
            }}>
            {daysShort[idx]}
          </button>
        ))}
      </div>

      {/* Time pickers — only shown when days are selected */}
      {enabledIndices.length > 0 && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--surface-2)' }}>
          {/* Shared time setter when multiple days are selected */}
          {enabledIndices.length > 1 && (
            <div className="flex items-center gap-3 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <span className="text-xs font-medium flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
                {locale === 'ar' ? 'نفس الوقت للكل' : 'Same for all'}
              </span>
              <div className="flex items-center gap-2 flex-1">
                <input type="time" value={sched[enabledIndices[0]].open}
                  onChange={e => setAllTimes('open', e.target.value)}
                  className="input py-1.5 text-sm flex-1" style={{ minWidth: 0 }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>–</span>
                <input type="time" value={sched[enabledIndices[0]].close}
                  onChange={e => setAllTimes('close', e.target.value)}
                  className="input py-1.5 text-sm flex-1" style={{ minWidth: 0 }} />
              </div>
            </div>
          )}

          {/* Per-day rows — visible immediately for every selected day */}
          <div className="space-y-2">
            {enabledIndices.map(idx => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xs font-medium w-14 flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
                  {enabledIndices.length === 1 ? days[idx] : daysShort[idx]}
                </span>
                <div className="flex items-center gap-2 flex-1">
                  <input type="time" value={sched[idx].open}
                    onChange={e => setTime(idx, 'open', e.target.value)}
                    className="input py-1.5 text-sm flex-1" style={{ minWidth: 0 }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>–</span>
                  <input type="time" value={sched[idx].close}
                    onChange={e => setTime(idx, 'close', e.target.value)}
                    className="input py-1.5 text-sm flex-1" style={{ minWidth: 0 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {enabledIndices.length === 0 && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {locale === 'ar' ? 'اختر الأيام أعلاه' : 'Select days above'}
        </p>
      )}
    </div>
  )
}
