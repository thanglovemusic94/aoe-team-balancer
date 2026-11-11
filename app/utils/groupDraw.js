function shuffle(list) {
  const copy = [...list]
  for (let index = copy.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[swap]] = [copy[swap], copy[index]]
  }
  return copy
}

export function drawGroups(teams, groupCount) {
  const count = Math.min(Math.max(1, Number(groupCount) || 1), Math.max(teams.length, 1))
  const shuffled = shuffle(teams)
  const base = Math.floor(shuffled.length / count)
  const extra = shuffled.length % count
  const extraSlots = new Set(shuffle([...Array(count).keys()]).slice(0, extra))
  const groups = []
  let cursor = 0
  for (let index = 0; index < count; index++) {
    const size = base + (extraSlots.has(index) ? 1 : 0)
    groups.push({
      name: `Bảng ${index + 1}`,
      extra: extraSlots.has(index),
      teams: shuffled.slice(cursor, cursor + size)
    })
    cursor += size
  }
  return groups
}

export function teamsFromMatches(matches, bye = null) {
  const list = []
  matches.forEach((match) => {
    list.push({
      name: `Team ${list.length + 1}`,
      players: match.teamA.players,
      totalPoints: match.teamA.totalPoints
    })
    list.push({
      name: `Team ${list.length + 1}`,
      players: match.teamB.players,
      totalPoints: match.teamB.totalPoints
    })
  })
  if (bye) {
    list.push({
      name: `Team ${list.length + 1}`,
      players: bye.players,
      totalPoints: bye.totalPoints
    })
  }
  return list
}
