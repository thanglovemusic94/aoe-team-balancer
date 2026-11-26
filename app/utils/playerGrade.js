const FIXED_BANDS = [
  {
    id: 'TOP',
    label: 'TOP',
    badgeClass: 'bg-red-100 text-red-800 border border-red-300',
    textClass: 'text-red-700',
    low: 9,
    high: null,
    rangeLabel: 'từ 9'
  },
  {
    id: 'A',
    label: 'A',
    badgeClass: 'bg-orange-100 text-orange-800 border border-orange-300',
    textClass: 'text-orange-700',
    low: 8,
    high: 9,
    rangeLabel: '8–8.5'
  },
  {
    id: 'B',
    label: 'B',
    badgeClass: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    textClass: 'text-yellow-700',
    low: 7,
    high: 8,
    rangeLabel: '7–7.5'
  },
  {
    id: 'C',
    label: 'C',
    badgeClass: 'bg-teal-100 text-teal-800 border border-teal-300',
    textClass: 'text-teal-700',
    low: 1,
    high: 7,
    rangeLabel: 'từ 6.5 trở xuống'
  }
]

const emptyBadge = 'bg-gray-100 text-gray-700 border border-gray-300'

function gradeIdForScore(value) {
  if (value >= 9) return 'TOP'
  if (value >= 8) return 'A'
  if (value >= 7) return 'B'
  return 'C'
}

export function normalizeScore(value) {
  if (value === '' || value == null) return null
  const score = Number(value)
  if (!Number.isFinite(score)) return null
  return Math.round(score * 2) / 2
}

export function buildGradeBands() {
  return FIXED_BANDS.map(band => ({ ...band }))
}

export function gradeScale(players) {
  const scores = (players || [])
    .map(player => Number(player?.rank))
    .filter(score => Number.isFinite(score) && score >= 1)

  const min = scores.length ? Math.min(...scores) : null
  const max = scores.length ? Math.max(...scores) : null
  return { min, max, bands: buildGradeBands() }
}

export function gradeForScore(score, bands) {
  const value = Number(score)
  if (!Number.isFinite(value) || value < 1) return null
  const id = gradeIdForScore(value)
  const list = Array.isArray(bands) && bands.some(band => band?.id === id) ? bands : FIXED_BANDS
  return list.find(band => band.id === id) || null
}

export function gradeBadgeClass(score, bands) {
  return gradeForScore(score, bands)?.badgeClass || emptyBadge
}

export function countByGrade(players, gradeId, bands) {
  return (players || []).filter(player => gradeForScore(player?.rank, bands)?.id === gradeId).length
}

export function gradeSummary(players, bands) {
  const list = Array.isArray(bands) && bands.length ? bands : FIXED_BANDS
  return list
    .map(band => ({
      id: band.id,
      label: band.label,
      count: countByGrade(players, band.id, list)
    }))
    .filter(item => item.count > 0)
}
