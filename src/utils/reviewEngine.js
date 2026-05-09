const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'that',
  'this',
  'from',
  'have',
  'has',
  'had',
  'were',
  'was',
  'are',
  'is',
  'but',
  'you',
  'your',
  'they',
  'them',
  'their',
  'very',
  'just',
  'really',
  'into',
  'than',
  'after',
  'before',
  'during',
  'because',
])

const DETAIL_KEYWORDS = [
  'battery',
  'hours',
  'cushion',
  'foam',
  'zipper',
  'strap',
  'stitching',
  'fabric',
  'hood',
  'size',
  'toe box',
  'heel',
  'usb',
  'usb-c',
  'cable',
  'frother',
  'water tank',
  'design',
  'microphone',
  'case',
  'price',
  'value',
  'pocket',
  'laptop sleeve',
  'fit',
  'comfort',
  'call',
  'charge',
  'commute',
]

const USAGE_KEYWORDS = [
  'used',
  'using',
  'after',
  'during',
  'daily',
  'week',
  'weeks',
  'month',
  'months',
  'commute',
  'office',
  'travel',
  'trip',
  'gym',
  'run',
  'running',
  'sessions',
  'washing',
  'washes',
  'kitchen',
  'train ride',
]

const PROS_KEYWORDS = [
  'comfortable',
  'great',
  'quick',
  'strong',
  'durable',
  'soft',
  'clear',
  'solid',
  'premium',
  'simple',
  'worth',
  'value',
  'light',
  'good option',
]

const CONS_KEYWORDS = [
  'but',
  'however',
  'wish',
  'could be',
  'problem',
  'issue',
  'narrow',
  'scratches',
  'warm',
  'hard to read',
  'delivery',
  'longer',
  'deeper',
  'rubbed',
]

const ADVICE_KEYWORDS = [
  'recommend',
  'if you',
  'buyers',
  'worth',
  'keep in mind',
  'good option',
  'strong value',
  'go',
  'consider',
]

const CONSTRUCTIVE_KEYWORDS = [
  'because',
  'could',
  'would',
  'should',
  'improve',
  'wish',
  'recommend',
  'keep in mind',
  'if you',
  'better',
]

const GENERIC_PHRASES = [
  'good product',
  'nice product',
  'excellent quality',
  'love it',
  'amazing',
  'perfect',
  'bad product',
  'terrible',
  'just okay',
]

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const getWords = (text) => text.match(/\b[\p{L}\p{N}'-]+\b/gu) ?? []

const getKeywordMatches = (lowerText, keywords) =>
  keywords.filter((keyword) => lowerText.includes(keyword))

const getCapsRatio = (text) => {
  const letters = text.match(/[A-Za-z]/g) ?? []
  const caps = text.match(/[A-Z]/g) ?? []

  return letters.length ? caps.length / letters.length : 0
}

const getHighestMeaningfulFrequency = (words) => {
  const counts = new Map()

  words.forEach((word) => {
    const token = word.toLowerCase()

    if (token.length < 3 || STOP_WORDS.has(token)) {
      return
    }

    counts.set(token, (counts.get(token) ?? 0) + 1)
  })

  return [...counts.values()].reduce((max, count) => Math.max(max, count), 0)
}

export const getQualityLevel = (score) => {
  if (score < 50) return 'Weak'
  if (score < 70) return 'Average'
  if (score < 85) return 'Good'
  return 'Excellent'
}

export const getBonusDecision = (score) => {
  if (score < 50) return { percent: 0, label: 'No reward', approved: false }
  if (score < 70) return { percent: 5, label: '5% coupon', approved: true }
  if (score < 85) return { percent: 10, label: '10% coupon', approved: true }
  return { percent: 15, label: '15% coupon', approved: true }
}

export const generateCouponCode = (percent) => {
  if (!percent) return null

  const token = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `RB-${percent}-${token}`
}

export const scoreReview = ({ text = '', rating = 0 }) => {
  const normalizedText = text.trim().replace(/\s+/g, ' ')
  const lowerText = normalizedText.toLowerCase()
  const words = getWords(normalizedText)
  const sentences = normalizedText
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
  const longWords = words.map((word) => word.toLowerCase()).filter((word) => word.length > 2)
  const uniqueRatio = new Set(longWords).size / Math.max(longWords.length, 1)
  const avgWordsPerSentence = words.length / Math.max(sentences.length, 1)

  const detailMatches = getKeywordMatches(lowerText, DETAIL_KEYWORDS)
  const usageMatches = getKeywordMatches(lowerText, USAGE_KEYWORDS)
  const prosMatches = getKeywordMatches(lowerText, PROS_KEYWORDS)
  const consMatches = getKeywordMatches(lowerText, CONS_KEYWORDS)
  const adviceMatches = getKeywordMatches(lowerText, ADVICE_KEYWORDS)
  const constructiveMatches = getKeywordMatches(lowerText, CONSTRUCTIVE_KEYWORDS)
  const genericMatches = getKeywordMatches(lowerText, GENERIC_PHRASES)

  const numericMentions = normalizedText.match(/\b\d+([.,]\d+)?\b/g)?.length ?? 0
  const measurementMentions =
    normalizedText.match(/\b(hours?|days?|weeks?|km|mah|size|washes?|sessions?)\b/gi)?.length ?? 0
  const highestMeaningfulFrequency = getHighestMeaningfulFrequency(words)

  const lengthScore = clamp(
    Math.round(words.length * 0.42 + Math.min(sentences.length, 3) * 2),
    0,
    18,
  )
  const detailScore = clamp(
    detailMatches.length * 4 + numericMentions * 2 + measurementMentions * 2,
    0,
    18,
  )
  const usageScore = clamp(
    usageMatches.length * 3 + (sentences.length > 1 ? 2 : 0) + (numericMentions ? 2 : 0),
    0,
    14,
  )
  const prosScore = clamp(prosMatches.length * 3 + (prosMatches.length ? 1 : 0), 0, 10)
  const consScore = clamp(consMatches.length * 3 + (consMatches.length ? 1 : 0), 0, 10)
  const adviceScore = clamp(
    adviceMatches.length * 3 + (lowerText.includes('if you') ? 2 : 0),
    0,
    12,
  )
  const constructiveScore = clamp(
    constructiveMatches.length * 2 + (prosMatches.length && consMatches.length ? 2 : 0),
    0,
    10,
  )
  const readabilityScore = clamp(
    (sentences.length > 1 ? 4 : 0) +
      (avgWordsPerSentence >= 7 && avgWordsPerSentence <= 28 ? 2 : 0) +
      (words.length >= 24 ? 2 : 0),
    0,
    8,
  )

  const genericPenalty = clamp(
    genericMatches.length * 4 +
      (words.length < 16 && detailMatches.length === 0 ? 8 : 0) +
      (words.length < 22 && sentences.length < 2 ? 4 : 0),
    0,
    18,
  )

  const repetitionPenalty = clamp(
    (highestMeaningfulFrequency > 3 ? (highestMeaningfulFrequency - 3) * 3 : 0) +
      (uniqueRatio < 0.48 && words.length > 14 ? 8 : 0) +
      (/([!?])\1{1,}/.test(normalizedText) ? 4 : 0) +
      (getCapsRatio(normalizedText) > 0.34 && words.length > 8 ? 4 : 0),
    0,
    18,
  )

  const score = clamp(
    Math.round(
      lengthScore +
        detailScore +
        usageScore +
        prosScore +
        consScore +
        adviceScore +
        constructiveScore +
        readabilityScore -
        genericPenalty -
        repetitionPenalty,
    ),
    0,
    100,
  )

  const signals = {
    hasSpecificDetails: detailScore >= 10,
    hasUsageExperience: usageScore >= 8,
    hasProsAndCons: prosScore >= 4 && consScore >= 4,
    helpfulForBuyers: adviceScore >= 4 || (detailScore >= 10 && usageScore >= 8),
    lowSpamRisk: repetitionPenalty <= 4 && genericPenalty <= 8,
  }

  const suggestions = []

  if (words.length < 22) {
    suggestions.push('Add more context about what you used, how long you used it, and what happened.')
  }
  if (!signals.hasSpecificDetails) {
    suggestions.push('Mention concrete details such as fit, battery, material, size, or measurable results.')
  }
  if (!signals.hasUsageExperience) {
    suggestions.push('Describe a real usage scenario so buyers understand where the product performs well or poorly.')
  }
  if (!signals.hasProsAndCons) {
    suggestions.push('Balance the review with at least one strength and one drawback to keep it useful and fair.')
  }
  if (!signals.helpfulForBuyers) {
    suggestions.push('Add advice for future buyers, like who the product suits or what to watch out for.')
  }
  if (!signals.lowSpamRisk) {
    suggestions.push('Reduce repeated phrases, excessive punctuation, and generic wording.')
  }

  return {
    score,
    qualityLevel: getQualityLevel(score),
    suggestions: suggestions.slice(0, 4),
    signals,
    metrics: {
      words: words.length,
      sentences: sentences.length,
      uniqueRatio,
      detailScore,
      usageScore,
      prosScore,
      consScore,
      adviceScore,
      constructiveScore,
      genericPenalty,
      repetitionPenalty,
      rating,
    },
  }
}

export const createReviewRecord = (input) => {
  const analysis = scoreReview(input)
  const bonus = getBonusDecision(analysis.score)

  return {
    id: input.id ?? `review-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    author: input.author,
    product: input.product,
    rating: input.rating,
    text: input.text.trim().replace(/\s+/g, ' '),
    helpfulLikes: input.helpfulLikes ?? 0,
    createdAt: input.createdAt ?? new Date().toISOString(),
    score: analysis.score,
    qualityLevel: analysis.qualityLevel,
    bonusPercent: bonus.percent,
    bonusLabel: bonus.label,
    couponCode: bonus.approved ? input.couponCode ?? generateCouponCode(bonus.percent) : null,
    signals: analysis.signals,
    suggestions: analysis.suggestions,
    metrics: analysis.metrics,
  }
}
