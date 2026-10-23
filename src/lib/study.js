export function shuffle(items, rng = Math.random) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    const swap = result[i]
    result[i] = result[j]
    result[j] = swap
  }
  return result
}

export function progressOf(cards) {
  const total = cards.length
  const known = cards.filter((card) => card.status === 'known').length
  return { total, known, percent: total ? Math.round((known / total) * 100) : 0 }
}

// Advances the study queue. A card rated "learning" is re-inserted a few
// positions later (never right after itself) so the learner sees other cards
// before repeating it.
export function rateCard({ queue, index, repeatCounts, cardId, status, maxRepeats = 2 }) {
  const nextRepeatCounts = { ...repeatCounts }
  let nextQueue = queue

  if (status === 'learning') {
    const count = repeatCounts[cardId] || 0
    const insertAt = Math.min(index + 3, queue.length)
    if (count < maxRepeats && insertAt > index + 1) {
      nextQueue = [...queue.slice(0, insertAt), cardId, ...queue.slice(insertAt)]
    }
    nextRepeatCounts[cardId] = count + 1
  }

  const nextIndex = index + 1
  return {
    queue: nextQueue,
    index: nextIndex,
    repeatCounts: nextRepeatCounts,
    finished: nextIndex >= nextQueue.length,
  }
}

export function buildQuizQuestions(cards, { optionCount = 4, rng = Math.random } = {}) {
  const pool = cards.filter((card) => card.term && card.meaning)
  if (pool.length < 2) return []

  return shuffle(pool, rng).map((card) => {
    const distractors = []
    const seen = new Set([card.meaning])
    for (const candidate of shuffle(pool, rng)) {
      if (candidate.id === card.id || seen.has(candidate.meaning)) continue
      seen.add(candidate.meaning)
      distractors.push(candidate.meaning)
      if (distractors.length >= optionCount - 1) break
    }
    return {
      cardId: card.id,
      term: card.term,
      ipa: card.ipa || '',
      answer: card.meaning,
      options: shuffle([card.meaning, ...distractors], rng),
    }
  })
}
