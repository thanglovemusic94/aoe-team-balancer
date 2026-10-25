function sumRank(players) {
  return players.reduce((total, player) => total + player.rank, 0)
}

function shuffle(list) {
  const copy = [...list]
  for (let index = copy.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[swap]] = [copy[swap], copy[index]]
  }
  return copy
}

export function pairingKey(pairs) {
  return pairs
    .map(pair => [...pair].map(player => player._key).sort().join('+'))
    .sort()
    .join('|')
}

export function scorePairs(pairs) {
  const sums = pairs.map(sumRank)
  const max = Math.max(...sums)
  const min = Math.min(...sums)
  const average = sums.reduce((total, value) => total + value, 0) / sums.length
  const variance = sums.reduce((total, value) => total + (value - average) ** 2, 0) / sums.length
  return { diff: max - min, variance, sums }
}

export function matchesFromPairs(pairs) {
  const ordered = [...pairs].sort((a, b) => sumRank(b) - sumRank(a))
  const matches = []
  for (let index = 0; index < ordered.length; index += 2) {
    const left = [...ordered[index]].sort((a, b) => b.rank - a.rank)
    const right = [...ordered[index + 1]].sort((a, b) => b.rank - a.rank)
    const sumA = sumRank(left)
    const sumB = sumRank(right)
    const teamA = sumA >= sumB ? left : right
    const teamB = sumA >= sumB ? right : left
    matches.push({
      id: matches.length + 1,
      teamA: { players: teamA, totalPoints: sumRank(teamA) },
      teamB: { players: teamB, totalPoints: sumRank(teamB) },
      diff: Math.abs(sumA - sumB)
    })
  }
  return matches.sort((a, b) => (b.teamA.totalPoints + b.teamB.totalPoints) - (a.teamA.totalPoints + a.teamB.totalPoints))
}

function highLowPairs(players) {
  const sorted = [...players].sort((a, b) => b.rank - a.rank || a._key.localeCompare(b._key))
  const pairs = []
  for (let index = 0; index < sorted.length / 2; index++) {
    pairs.push([sorted[index], sorted[sorted.length - 1 - index]])
  }
  return pairs
}

function consider(pairs, state, limit) {
  const key = pairingKey(pairs)
  if (state.seen.has(key)) return
  const score = scorePairs(pairs)
  const better = score.diff < state.bestDiff || (score.diff === state.bestDiff && score.variance < state.bestVariance - 1e-6)
  const equal = score.diff === state.bestDiff && Math.abs(score.variance - state.bestVariance) < 1e-6
  if (!better && !equal) return
  if (better) {
    state.bestDiff = score.diff
    state.bestVariance = score.variance
    state.seen.clear()
    state.best = []
  }
  if (state.best.length >= limit) return
  state.seen.add(key)
  state.best.push(pairs.map(pair => pair.map(player => player)))
}

function enumerateBest(players, state) {
  const used = Array(players.length).fill(false)
  const current = []
  const walk = () => {
    const start = used.indexOf(false)
    state.examined += 1
    if (start === -1) {
      consider(current, state, 24)
      return
    }
    used[start] = true
    for (let index = start + 1; index < players.length; index++) {
      if (used[index]) continue
      used[index] = true
      current.push([players[start], players[index]])
      walk()
      current.pop()
      used[index] = false
    }
    used[start] = false
  }
  walk()
}

function improvePairs(pairs, rounds) {
  let current = pairs.map(pair => [...pair])
  let currentScore = scorePairs(current)
  for (let round = 0; round < rounds; round++) {
    const first = Math.floor(Math.random() * current.length)
    let second = Math.floor(Math.random() * current.length)
    if (first === second) continue
    const next = current.map(pair => [...pair])
    const slotA = Math.floor(Math.random() * 2)
    const slotB = Math.floor(Math.random() * 2)
    ;[next[first][slotA], next[second][slotB]] = [next[second][slotB], next[first][slotA]]
    const nextScore = scorePairs(next)
    const better = nextScore.diff < currentScore.diff || (nextScore.diff === currentScore.diff && nextScore.variance <= currentScore.variance)
    if (better || Math.random() < 0.02) {
      current = next
      currentScore = nextScore
    }
  }
  return current
}

function searchBest(players, state) {
  const seeds = [highLowPairs(players)]
  for (let index = 0; index < 40; index++) seeds.push(improvePairs(seeds[0], 30))
  for (let index = 0; index < 80; index++) {
    const shuffled = shuffle(players)
    const randomPairs = []
    for (let cursor = 0; cursor < shuffled.length; cursor += 2) {
      randomPairs.push([shuffled[cursor], shuffled[cursor + 1]])
    }
    seeds.push(improvePairs(randomPairs, players.length * 20))
  }
  seeds.forEach(pairs => {
    state.examined += 1
    consider(pairs, state, 24)
  })
}

export function planTwoVsTwo(players) {
  const state = {
    examined: 0,
    bestDiff: Infinity,
    bestVariance: Infinity,
    best: [],
    seen: new Set()
  }
  if (players.length <= 12) enumerateBest(players, state)
  else searchBest(players, state)

  const options = state.best.map(pairs => {
    const matches = matchesFromPairs(pairs)
    const matchDiff = Math.max(...matches.map(match => match.diff))
    return { matches, pairDiff: state.bestDiff, matchDiff }
  })
  options.sort((a, b) => a.matchDiff - b.matchDiff || a.pairDiff - b.pairDiff)
  const bestMatchDiff = options[0]?.matchDiff ?? 0
  const tied = options.filter(option => option.matchDiff === bestMatchDiff)
  return {
    examined: state.examined,
    exact: players.length <= 12,
    pairDiff: state.bestDiff,
    matchDiff: bestMatchDiff,
    options: tied
  }
}
