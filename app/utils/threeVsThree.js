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

function teamKey(teams) {
  return teams
    .map(team => [...team].map(player => player._key).sort().join('+'))
    .sort()
    .join('|')
}

function scoreTeams(teams) {
  const sums = teams.map(sumRank)
  const max = Math.max(...sums)
  const min = Math.min(...sums)
  const average = sums.reduce((total, value) => total + value, 0) / sums.length
  const variance = sums.reduce((total, value) => total + (value - average) ** 2, 0) / sums.length
  return { diff: max - min, variance }
}

function matchesFromTeams(teams) {
  const ordered = [...teams].sort((a, b) => sumRank(b) - sumRank(a))
  const matches = []
  for (let index = 0; index < ordered.length; index += 2) {
    const left = [...ordered[index]].sort((a, b) => b.rank - a.rank)
    const right = [...ordered[index + 1]].sort((a, b) => b.rank - a.rank)
    const sumA = sumRank(left)
    const sumB = sumRank(right)
    const teamA = sumA >= sumB ? left : right
    const teamB = sumA >= sumB ? right : left
    matches.push({
      teamA: { players: teamA, totalPoints: sumRank(teamA) },
      teamB: { players: teamB, totalPoints: sumRank(teamB) },
      diff: Math.abs(sumA - sumB)
    })
  }
  return matches.sort((a, b) => (b.teamA.totalPoints + b.teamB.totalPoints) - (a.teamA.totalPoints + a.teamB.totalPoints))
}

function snakeTeams(players) {
  const sorted = [...players].sort((a, b) => b.rank - a.rank || a._key.localeCompare(b._key))
  const teamCount = players.length / 3
  const teams = Array.from({ length: teamCount }, () => [])
  let forward = true
  let cursor = 0
  while (cursor < sorted.length) {
    const order = forward
      ? [...Array(teamCount).keys()]
      : [...Array(teamCount).keys()].reverse()
    for (const teamIndex of order) {
      if (cursor >= sorted.length) break
      teams[teamIndex].push(sorted[cursor])
      cursor += 1
    }
    forward = !forward
  }
  return teams
}

function consider(teams, state, limit) {
  const key = teamKey(teams)
  if (state.seen.has(key)) return
  const score = scoreTeams(teams)
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
  state.best.push(teams.map(team => [...team]))
}

function enumerateBest(players, state) {
  const used = Array(players.length).fill(false)
  const groups = []

  const walk = () => {
    let start = -1
    for (let index = 0; index < used.length; index++) {
      if (!used[index]) {
        start = index
        break
      }
    }
    if (start === -1) {
      state.examined += 1
      consider(groups, state, 24)
      return
    }
    used[start] = true
    const choose = (from, chosen) => {
      if (chosen.length === 2) {
        groups.push([players[start], chosen[0], chosen[1]])
        walk()
        groups.pop()
        return
      }
      for (let index = from; index < players.length; index++) {
        if (used[index]) continue
        used[index] = true
        chosen.push(players[index])
        choose(index + 1, chosen)
        chosen.pop()
        used[index] = false
      }
    }
    choose(start + 1, [])
    used[start] = false
  }
  walk()
}

function improveTeams(teams, rounds) {
  let current = teams.map(team => [...team])
  let currentScore = scoreTeams(current)
  for (let round = 0; round < rounds; round++) {
    const first = Math.floor(Math.random() * current.length)
    let second = Math.floor(Math.random() * current.length)
    if (first === second) continue
    const next = current.map(team => [...team])
    const slotA = Math.floor(Math.random() * next[first].length)
    const slotB = Math.floor(Math.random() * next[second].length)
    ;[next[first][slotA], next[second][slotB]] = [next[second][slotB], next[first][slotA]]
    const nextScore = scoreTeams(next)
    const better = nextScore.diff < currentScore.diff || (nextScore.diff === currentScore.diff && nextScore.variance <= currentScore.variance)
    if (better || Math.random() < 0.02) {
      current = next
      currentScore = nextScore
    }
  }
  return current
}

function randomTeams(players) {
  const shuffled = shuffle(players)
  const teams = []
  for (let index = 0; index < shuffled.length; index += 3) {
    teams.push([shuffled[index], shuffled[index + 1], shuffled[index + 2]])
  }
  return teams
}

function searchBest(players, state) {
  const seeds = [snakeTeams(players)]
  for (let index = 0; index < 30; index++) seeds.push(improveTeams(seeds[0], 40))
  for (let index = 0; index < 60; index++) {
    seeds.push(improveTeams(randomTeams(players), players.length * 15))
  }
  seeds.forEach(teams => {
    state.examined += 1
    consider(teams, state, 24)
  })
}

export function planThreeVsThree(players) {
  const state = {
    examined: 0,
    bestDiff: Infinity,
    bestVariance: Infinity,
    best: [],
    seen: new Set()
  }
  if (players.length <= 12) enumerateBest(players, state)
  else searchBest(players, state)

  const options = state.best.map(teams => {
    const matches = matchesFromTeams(teams)
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
