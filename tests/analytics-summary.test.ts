import { describe, expect, it } from 'vitest'
import { buildScanAnalytics } from '../src/lib/analytics'

describe('buildScanAnalytics', () => {
  it('summarizes scan momentum, peak hour, best day, and activity heatmap from timestamped scans', () => {
    const now = new Date('2026-07-30T12:00:00.000Z')
    const scans = [
      { scanned_at: '2026-07-30T09:00:00.000Z' },
      { scanned_at: '2026-07-30T09:15:00.000Z' },
      { scanned_at: '2026-07-29T18:00:00.000Z' },
      { scanned_at: '2026-07-28T18:00:00.000Z' },
      { scanned_at: '2026-07-28T19:00:00.000Z' },
      { scanned_at: '2026-07-20T11:00:00.000Z' },
    ]

    const result = buildScanAnalytics(scans, now)

    expect(result.totalScans).toBe(6)
    expect(result.todayScans).toBe(2)
    expect(result.weekScans).toBe(5)
    expect(result.previousWeekScans).toBe(1)
    expect(result.weekChangePercent).toBe(400)
    expect(result.averagePerDay).toBe(0.2)
    expect(result.bestDay).toEqual({ date: '2026-07-28', count: 2 })
    expect(result.peakHour).toEqual({ hour: 9, count: 2 })
    expect(result.chartData).toHaveLength(30)
    expect(result.chartData.at(-1)).toEqual({ date: '2026-07-30', count: 2 })
    expect(result.weekdayData.reduce((sum, day) => sum + day.count, 0)).toBe(6)
  })
})
