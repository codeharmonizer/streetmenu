export type ScanRow = {
  scanned_at: string
}

export type CountByDate = {
  date: string
  count: number
}

export type CountByHour = {
  hour: number
  count: number
}

export type CountByWeekday = {
  weekday: number
  count: number
}

export type ScanAnalytics = {
  totalScans: number
  todayScans: number
  weekScans: number
  previousWeekScans: number
  weekChangePercent: number | null
  averagePerDay: number
  bestDay: CountByDate | null
  peakHour: CountByHour | null
  chartData: CountByDate[]
  hourlyData: CountByHour[]
  weekdayData: CountByWeekday[]
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function subDays(date: Date, days: number) {
  const copy = new Date(date)
  copy.setUTCDate(copy.getUTCDate() - days)
  return copy
}

export function buildScanAnalytics(scans: ScanRow[], now = new Date()): ScanAnalytics {
  const today = isoDate(now)
  const sevenDaysAgo = subDays(now, 7)
  const fourteenDaysAgo = subDays(now, 14)

  const byDay: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    byDay[isoDate(subDays(now, i))] = 0
  }

  const hourlyCounts = Array.from({ length: 24 }, () => 0)
  const weekdayCounts = Array.from({ length: 7 }, () => 0)

  let todayScans = 0
  let weekScans = 0
  let previousWeekScans = 0

  for (const scan of scans) {
    const scannedAt = new Date(scan.scanned_at)
    if (Number.isNaN(scannedAt.getTime())) continue

    const day = isoDate(scannedAt)
    if (byDay[day] !== undefined) byDay[day]++
    if (day === today) todayScans++

    if (scannedAt >= sevenDaysAgo && scannedAt <= now) {
      weekScans++
    } else if (scannedAt >= fourteenDaysAgo && scannedAt < sevenDaysAgo) {
      previousWeekScans++
    }

    hourlyCounts[scannedAt.getUTCHours()]++
    weekdayCounts[scannedAt.getUTCDay()]++
  }

  const chartData = Object.entries(byDay).map(([date, count]) => ({ date, count }))
  const nonZeroDays = chartData.filter(day => day.count > 0)
  const bestDay = nonZeroDays.length
    ? nonZeroDays.reduce((best, day) => day.count > best.count ? day : best)
    : null

  const hourlyData = hourlyCounts.map((count, hour) => ({ hour, count }))
  const nonZeroHours = hourlyData.filter(hour => hour.count > 0)
  const peakHour = nonZeroHours.length
    ? nonZeroHours.reduce((best, hour) => hour.count > best.count ? hour : best)
    : null

  const weekChangePercent = previousWeekScans === 0
    ? (weekScans > 0 ? 100 : null)
    : Math.round(((weekScans - previousWeekScans) / previousWeekScans) * 100)

  return {
    totalScans: scans.length,
    todayScans,
    weekScans,
    previousWeekScans,
    weekChangePercent,
    averagePerDay: Math.round((scans.length / 30) * 10) / 10,
    bestDay,
    peakHour,
    chartData,
    hourlyData,
    weekdayData: weekdayCounts.map((count, weekday) => ({ weekday, count })),
  }
}
