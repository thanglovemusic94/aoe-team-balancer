const GRADE_STYLES = [
  { id: 'A', label: 'A', badgeClass: 'bg-red-100 text-red-800 border border-red-300', textClass: 'text-red-700' },
  { id: 'A-', label: 'A-', badgeClass: 'bg-rose-100 text-rose-800 border border-rose-300', textClass: 'text-rose-700' },
  { id: 'B', label: 'B', badgeClass: 'bg-orange-100 text-orange-800 border border-orange-300', textClass: 'text-orange-700' },
  { id: 'B-', label: 'B-', badgeClass: 'bg-amber-100 text-amber-800 border border-amber-300', textClass: 'text-amber-700' },
  { id: 'C', label: 'C', badgeClass: 'bg-yellow-100 text-yellow-800 border border-yellow-300', textClass: 'text-yellow-700' },
  { id: 'C-', label: 'C-', badgeClass: 'bg-lime-100 text-lime-800 border border-lime-300', textClass: 'text-lime-700' },
  { id: 'D', label: 'D', badgeClass: 'bg-green-100 text-green-800 border border-green-300', textClass: 'text-green-700' },
  { id: 'D-', label: 'D-', badgeClass: 'bg-teal-100 text-teal-800 border border-teal-300', textClass: 'text-teal-700' }
]

const emptyBadge = 'bg-gray-100 text-gray-700 border border-gray-300'

function emptyBand(style) {
  return {
    ...style,
    low: null,
    high: null,
    rangeLabel: '—'
  }
}

export function buildGradeBands(min, max) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return GRADE_STYLES.map(emptyBand)
  }

  if (min === max) {
    return GRADE_STYLES.map((style, index) => (
      index === 0
        ? { ...style, low: min, high: max, rangeLabel: String(min) }
        : emptyBand(style)
    ))
  }

  const span = max - min
  const bands = []
  let cursor = max

  for (let index = 0; index < GRADE_STYLES.length; index++) {
    const style = GRADE_STYLES[index]
    if (cursor < min) {
      bands.push(emptyBand(style))
      continue
    }

    const isLast = index === GRADE_STYLES.length - 1
    const rawLow = isLast ? min : Math.floor(max - ((index + 1) * span) / GRADE_STYLES.length) + 1
    const low = Math.max(min, Math.min(rawLow, cursor))
    bands.push({
      ...style,
      low,
      high: cursor,
      rangeLabel: low === cursor ? String(cursor) : `${low}–${cursor}`
    })
    cursor = low - 1
  }

  return bands
}

export function gradeScale(players) {
  const scores = (players || [])
    .map(player => Number(player?.rank))
    .filter(score => Number.isFinite(score) && score >= 1)

  if (scores.length === 0) {
    return { min: null, max: null, bands: GRADE_STYLES.map(emptyBand) }
  }

  const min = Math.min(...scores)
  const max = Math.max(...scores)
  return { min, max, bands: buildGradeBands(min, max) }
}

export function gradeForScore(score, bands) {
  const value = Number(score)
  if (!Number.isFinite(value) || value < 1 || !bands) return null
  return bands.find(band => band.low != null && value >= band.low && value <= band.high) || null
}

export function gradeBadgeClass(score, bands) {
  return gradeForScore(score, bands)?.badgeClass || emptyBadge
}

export function countByGrade(players, gradeId, bands) {
  return (players || []).filter(player => gradeForScore(player?.rank, bands)?.id === gradeId).length
}

export function gradeSummary(players, bands) {
  return (bands || [])
    .map(band => ({
      id: band.id,
      label: band.label,
      count: countByGrade(players, band.id, bands)
    }))
    .filter(item => item.count > 0)
}
