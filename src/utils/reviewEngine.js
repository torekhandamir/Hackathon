const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const usageStrong = [
  'used for',
  'using for',
  'have been using',
  'every day',
  'for 3 years',
  'for 2 weeks',
  'after a month',
  'пользуюсь',
  'использовал',
  'использую',
  'неделю',
  'месяц',
  'год',
  'лет',
  'қолдандым',
  'пайдаландым',
  'апта',
  'ай',
  'жыл',
]

const usageWeak = [
  'bought recently',
  'bought',
  'tried',
  'ordered',
  'used',
  'using',
  'купил',
  'купила',
  'брала',
  'брал',
  'заказал',
  'заказала',
  'сатып алдым',
  'тапсырыс бердім',
]

const detailKeywords = [
  'battery',
  'delivery',
  'size',
  'microphone',
  'sound',
  'taste',
  'service',
  'material',
  'price',
  'packaging',
  'portion',
  'staff',
  'atmosphere',
  'location',
  'smell',
  'fit',
  'connect',
  'comfortable',
  'quality',
  'charging',
  'charge',
  'lasts',
  'long',
  'slowly',
  'звонк',
  'микрофон',
  'звук',
  'доставка',
  'размер',
  'вкус',
  'сервис',
  'материал',
  'цена',
  'упаковка',
  'порция',
  'персонал',
  'атмосфера',
  'посадка',
  'батарея',
  'качество',
  'подключ',
  'улиц',
  'шум',
  'қоңырау',
  'микрофон',
  'дыбыс',
  'жеткізу',
  'өлшем',
  'дәм',
  'қызмет',
  'материал',
  'баға',
  'қаптама',
  'сапа',
]

const weakDetailPhrases = ['sound is okay', 'work fine', 'pretty good', 'все нормально', 'звук хороший']

const prosKeywords = [
  'good',
  'great',
  'clear',
  'comfortable',
  'fast',
  'tasty',
  'polite',
  'useful',
  'affordable',
  'reliable',
  'хорош',
  'нормаль',
  'удоб',
  'быстро',
  'вкус',
  'вежлив',
  'надеж',
  'жақсы',
  'ыңғайлы',
  'дәмді',
  'тез',
  'сапалы',
]

const weakCons = ['not tested', 'do not have many details', "don't know yet", 'не знаю пока']

const adviceKeywords = [
  'good for',
  'best for',
  'suitable for',
  'not ideal for',
  'recommend',
  'worth it if',
  'not worth it',
  'for students',
  'for travel',
  'for daily use',
  'подойдет',
  'подойдут',
  'для учебы',
  'для музыки',
  'не советую',
  'рекомендую',
  'стоит брать',
  'подходит',
  'ұсынамын',
  'қолайлы',
  'кеңес беремін',
]

const toxicKeywords = ['idiot', 'stupid', 'hate you', 'тупой', 'идиот', 'ақымақ']
const genericPositive = ['good', 'nice', 'fine', 'okay', 'very good', 'нормально', 'хорошо', 'жақсы']
const repetitionStopWords = new Set([
  'and',
  'the',
  'for',
  'them',
  'they',
  'that',
  'this',
  'with',
  'because',
  'during',
])

export const countWords = (text) => text.match(/[\p{L}\p{N}'-]+/gu)?.length ?? 0

const getWords = (text) => text.match(/[\p{L}\p{N}'-]+/gu) ?? []
const includesAny = (text, keywords) => keywords.filter((keyword) => text.includes(keyword))

export const hasUsageExperience = (text) => {
  const strong = includesAny(text, usageStrong)
  const weak = includesAny(text, usageWeak)

  return {
    found: strong.length > 0 || weak.length > 0,
    score: strong.length ? 12 + Math.min(strong.length * 2, 3) : weak.length ? 4 + Math.min(weak.length, 3) : 0,
  }
}

export const countConcreteDetails = (text) => {
  const matches = new Set(includesAny(text, detailKeywords))
  const numbers = text.match(/\b\d+([.,]\d+)?\b/g)?.length ?? 0
  const measurements =
    text.match(/\b(hours?|minutes?|days?|weeks?|months?|years?|kzt|%|cm|kg|раз|дня|дней|минут|месяц|апта|ай|жыл)\b/gi)
      ?.length ?? 0
  const weakDetails = includesAny(text, weakDetailPhrases).length
  const score = clamp(matches.size * 4 + numbers * 4 + measurements * 3 + weakDetails * 2, 0, 25)

  return {
    count: matches.size + numbers + measurements,
    score,
  }
}

export const hasPros = (text) => includesAny(text, prosKeywords).length > 0

export const hasCons = (text) =>
  /\b(but|however|although|downside|problem|issue|slow|expensive|bad|weak|minus)\b/.test(text) ||
  /\bnot ideal\b/.test(text) ||
  /(^|[\s,.!?;:])(но|однако|минус|проблема|медленно|дорого|плохо|неудобно|слаб)/.test(text) ||
  /(^|[\s,.!?;:])(бірақ|алайда|минус|мәселе|баяу|қымбат|жаман)/.test(text)

export const hasBuyerAdvice = (text) => {
  const matches = includesAny(text, adviceKeywords)
  const genericOverall = text.includes('overall') || text.includes('в целом') || text.includes('жалпы')

  return {
    found: matches.length > 0,
    score: matches.length ? clamp(matches.length * 5, 7, 15) : genericOverall ? 3 : 0,
  }
}

export const detectSpam = (text, words) => {
  const counts = new Map()

  words.forEach((word) => {
    const token = word.toLowerCase()
    if (token.length < 3 || repetitionStopWords.has(token)) return
    counts.set(token, (counts.get(token) ?? 0) + 1)
  })

  const maxRepeat = [...counts.values()].reduce((max, count) => Math.max(max, count), 0)
  const repeatedLetters = /([\p{L}])\1{4,}/u.test(text)
  const emojiCount = text.match(/\p{Extended_Pictographic}/gu)?.length ?? 0
  const toxic = includesAny(text, toxicKeywords).length > 0

  return {
    toxic,
    penalty: clamp((maxRepeat > 3 ? (maxRepeat - 3) * 5 : 0) + (repeatedLetters ? 15 : 0) + (emojiCount > 3 ? 10 : 0), 0, 25),
  }
}

export const applyScoreCaps = (score, facts) => {
  let capped = score

  const compactButUseful = facts.hasUsage && facts.detailCount >= 3 && facts.hasCons && facts.hasAdvice

  if (facts.wordCount < 20 && !compactButUseful) capped = Math.min(capped, 45)
  if (facts.wordCount < 35 && facts.detailCount === 0) capped = Math.min(capped, 60)
  if (facts.genericOnly) capped = Math.min(capped, 35)
  if (!facts.hasCons && !facts.hasAdvice) capped = Math.min(capped, 70)
  if (facts.detailCount === 0) capped = Math.min(capped, 55)
  if (!facts.hasUsage) capped = Math.min(capped, 65)
  if (!facts.hasRealEvidence && facts.detailCount < 3) capped = Math.min(capped, 55)
  if (facts.wordCount < 10 && !facts.hasAdvice) capped = Math.min(capped, 40)
  if (facts.hasWeakBalance && !facts.hasAdvice) capped = Math.min(capped, 55)
  if (capped > 80 && (!facts.hasUsage || facts.detailCount < 2 || (!facts.hasCons && !facts.hasAdvice))) {
    capped = 80
  }
  if (capped > 90 && (!facts.hasUsage || facts.detailCount < 3 || !facts.hasPros || !facts.hasCons || !facts.hasAdvice)) {
    capped = 90
  }

  return capped
}

export const getQualityLevel = (score) => {
  if (score < 45) return 'Beginner Reviewer'
  if (score < 65) return 'Trusted Reviewer'
  if (score < 85) return 'Review Expert'
  return 'Review Legend'
}

export const getBonusDecision = (score, maxBonusPercent = 15) => {
  let percent = 0

  if (score >= 85) percent = 15
  else if (score >= 70) percent = 10
  else if (score >= 40) percent = 5

  percent = Math.min(percent, maxBonusPercent)

  return {
    percent,
    label: percent ? `${percent}%` : '0%',
    approved: percent > 0,
  }
}

export const generateCouponCode = (percent) => {
  if (!percent) return null
  return `RB${percent}`
}

export const scoreReview = ({ text = '', rating = 0 }) => {
  const normalizedText = text.trim().replace(/\s+/g, ' ')
  const lowerText = normalizedText.toLowerCase()
  const words = getWords(normalizedText)
  const wordCount = words.length

  let lengthScore = 0
  if (wordCount >= 36) lengthScore = 15
  else if (wordCount >= 16) lengthScore = 10
  else if (wordCount >= 6) lengthScore = 7
  else if (wordCount >= 1) lengthScore = 3

  const usage = hasUsageExperience(lowerText)
  const details = countConcreteDetails(lowerText)
  const pros = hasPros(lowerText)
  const weakBalance = weakCons.some((phrase) => lowerText.includes(phrase))
  const cons = hasCons(lowerText) && !weakBalance
  const advice = hasBuyerAdvice(lowerText)
  const spam = detectSpam(lowerText, words)

  const balanceScore = pros && cons ? 15 : pros || cons ? 7 : 0
  const clarityScore = spam.toxic ? 0 : wordCount >= 4 ? 8 : 5
  const genericOnly =
    wordCount <= 8 &&
    genericPositive.some((phrase) => lowerText.includes(phrase)) &&
    details.count === 0 &&
    !cons &&
    !advice.found

  const rawScore = Math.round(
    lengthScore + usage.score + details.score + balanceScore + advice.score + clarityScore - spam.penalty,
  )
  const score = applyScoreCaps(clamp(rawScore, 0, 100), {
    wordCount,
    detailCount: details.count,
    hasUsage: usage.found,
    hasPros: pros,
    hasCons: cons,
    hasAdvice: advice.found,
    genericOnly,
    hasRealEvidence: /\d/.test(lowerText) || /\b(hours?|minutes?|days?|weeks?|months?|years?|kzt|%|раз|дня|дней|минут|месяц|апта|ай|жыл)\b/i.test(lowerText),
    hasWeakBalance: weakBalance,
  })

  const signals = {
    hasSpecificDetails: details.score >= 10,
    hasUsageExperience: usage.found,
    hasPros: pros,
    hasCons: cons,
    hasProsAndCons: pros && cons,
    helpfulForBuyers: details.score >= 10 || advice.found,
    lowSpamRisk: spam.penalty <= 8 && !spam.toxic,
  }

  return {
    score,
    qualityLevel: getQualityLevel(score),
    signals,
    suggestions: {
      ru: [
        details.score < 15 && 'Добавьте больше конкретных деталей: срок использования, цену, качество, доставку, вкус, сервис или один честный минус.',
        !usage.found && 'Напишите, как долго вы пользовались товаром или услугой.',
        !cons && 'Добавьте один честный минус, если он есть.',
        !advice.found && 'Объясните, кому это подойдет или не подойдет.',
      ].filter(Boolean),
      en: [
        details.score < 15 && 'Add more specific details: usage time, price, quality, delivery, taste, service, or one honest downside.',
        !usage.found && 'Mention how long you used the product or service.',
        !cons && 'Add one honest downside if there is one.',
        !advice.found && 'Explain who this is best for.',
      ].filter(Boolean),
      kz: [
        details.score < 15 && 'Көбірек нақты мәлімет қосыңыз: қолдану уақыты, баға, сапа, жеткізу, дәм, қызмет немесе бір шынайы минус.',
        !usage.found && 'Өнімді немесе қызметті қанша уақыт қолданғаныңызды жазыңыз.',
        !cons && 'Бар болса, бір шынайы минус қосыңыз.',
        !advice.found && 'Бұл кімге қолайлы екенін түсіндіріңіз.',
      ].filter(Boolean),
    },
    metrics: {
      words: wordCount,
      rating,
      lengthScore,
      usageScore: usage.score,
      detailScore: details.score,
      detailCount: details.count,
      balanceScore,
      adviceScore: advice.score,
      clarityScore,
      spamPenalty: spam.penalty,
    },
  }
}

export const createReviewRecord = (input, options = {}) => {
  const analysis = scoreReview(input)
  const bonus = getBonusDecision(analysis.score, options.maxBonusPercent ?? 10)

  return {
    id: input.id ?? `review-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    authorFirstName: input.authorFirstName,
    authorLastName: input.authorLastName,
    category: input.category,
    placeId: input.placeId,
    itemId: input.itemId,
    placeName: input.placeName,
    itemName: input.itemName,
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

export const fallbackReviewEvaluationForDevOnly = scoreReview

export const createReviewRecordFromAiEvaluation = (input, evaluation) => {
  const score = clamp(evaluation.aiQualityScore, 0, 100)
  const bonus = getBonusDecision(score, 15)

  return {
    id: input.id ?? `review-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    authorFirstName: input.authorFirstName,
    authorLastName: input.authorLastName,
    category: input.category,
    placeId: input.placeId,
    itemId: input.itemId,
    placeName: input.placeName,
    itemName: input.itemName,
    rating: input.rating,
    text: input.text.trim().replace(/\s+/g, ' '),
    helpfulLikes: input.helpfulLikes ?? 0,
    createdAt: input.createdAt ?? new Date().toISOString(),
    score,
    aiQualityScore: score,
    qualityLevel: getQualityLevel(score),
    bonusPercent: bonus.percent,
    bonusLabel: bonus.label,
    couponCode: bonus.approved ? bonusForPercent(bonus.percent) : null,
    publishable: evaluation.publishable,
    breakdown: evaluation.breakdown,
    aiExplanation: evaluation.aiExplanation,
    suggestions: evaluation.suggestions,
    tags: evaluation.tags ?? [],
    complaints: evaluation.complaints ?? [],
    praises: evaluation.praises ?? [],
    rejectionReason: evaluation.rejectionReason,
    signals: {
      hasSpecificDetails: (evaluation.breakdown?.specificity ?? 0) >= 12,
      hasUsageExperience: (evaluation.breakdown?.experienceDetails ?? 0) >= 12,
      hasProsAndCons: (evaluation.breakdown?.balance ?? 0) >= 12,
      helpfulForBuyers: (evaluation.breakdown?.usefulness ?? 0) >= 12,
      lowSpamRisk: (evaluation.breakdown?.antiSpam ?? 0) >= 12,
    },
    metrics: {
      source: 'openai',
      breakdown: evaluation.breakdown,
    },
  }
}

const bonusForPercent = (percent) => (percent ? `RB${percent}` : null)
