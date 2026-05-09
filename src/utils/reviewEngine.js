const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const usageKeywords = [
  'used',
  'using',
  'for ',
  'after',
  'bought',
  'tried',
  'ordered',
  'пользуюсь',
  'использовал',
  'использую',
  'купил',
  'купила',
  'брала',
  'брал',
  'заказал',
  'заказала',
  'неделю',
  'месяц',
  'год',
  'лет',
  'қолдандым',
  'пайдаландым',
  'сатып алдым',
  'тапсырыс бердім',
  'апта',
  'ай',
  'жыл',
]

const detailKeywords = [
  'size',
  'delivery',
  'taste',
  'comfort',
  'battery',
  'quality',
  'price',
  'service',
  'atmosphere',
  'packaging',
  'speed',
  'smell',
  'design',
  'fit',
  'material',
  'portion',
  'staff',
  'location',
  'размер',
  'доставка',
  'вкус',
  'удобно',
  'батарея',
  'качество',
  'цена',
  'цену',
  'сервис',
  'атмосфера',
  'упаковка',
  'скорость',
  'запах',
  'дизайн',
  'посадка',
  'материал',
  'порция',
  'персонал',
  'орналасуы',
  'өлшем',
  'жеткізу',
  'дәм',
  'ыңғайлы',
  'сапа',
  'баға',
  'қызмет',
  'қаптама',
  'тез',
  'иіс',
  'дизайн',
]

const prosKeywords = [
  'good',
  'great',
  'comfortable',
  'fast',
  'tasty',
  'useful',
  'durable',
  'cheap',
  'quality',
  'nice',
  'excellent',
  'хорошо',
  'хороший',
  'хорошее',
  'удобный',
  'удобно',
  'вкусно',
  'быстро',
  'качественный',
  'приятный',
  'полезный',
  'недорогой',
  'отличный',
  'нормально',
  'жақсы',
  'ыңғайлы',
  'дәмді',
  'сапалы',
  'тез',
  'пайдалы',
  'арзан',
  'керемет',
]

const consKeywords = [
  'but',
  'however',
  'although',
  'downside',
  'problem',
  'issue',
  'slow',
  'expensive',
  'bad',
  'not ideal',
  'но',
  'однако',
  'минус',
  'проблема',
  'медленно',
  'долг',
  'дорого',
  'плохо',
  'неудобно',
  'бірақ',
  'алайда',
  'минус',
  'мәселе',
  'баяу',
  'қымбат',
  'жаман',
]

const adviceKeywords = [
  'recommend',
  'would buy again',
  'suitable for',
  'good for',
  'best for',
  'not ideal for',
  'рекомендую',
  'советую',
  'подойдет',
  'подходит',
  'не подойдет',
  'лучше для',
  'стоит брать',
  'за свою цену',
  'ұсынамын',
  'кеңес беремін',
  'жарайды',
  'қолайлы',
]

const toxicKeywords = ['idiot', 'stupid', 'hate you', 'тупой', 'идиот', 'ақымақ']
const meaninglessShort = ['ok', 'norm', 'bad', 'cool', 'ок', 'норм', 'ужас', 'супер']

const getWords = (text) => text.match(/[\p{L}\p{N}'-]+/gu) ?? []
const includesAny = (text, keywords) => keywords.filter((keyword) => text.includes(keyword))

const getRepetitionPenalty = (words) => {
  const counts = new Map()

  words.forEach((word) => {
    const token = word.toLowerCase()
    if (token.length < 3) return
    counts.set(token, (counts.get(token) ?? 0) + 1)
  })

  const maxRepeat = [...counts.values()].reduce((max, count) => Math.max(max, count), 0)
  return maxRepeat > 3 ? Math.min((maxRepeat - 3) * 5, 18) : 0
}

export const getQualityLevel = (score) => {
  if (score < 45) return 'Beginner Reviewer'
  if (score < 65) return 'Trusted Reviewer'
  if (score < 85) return 'Review Expert'
  return 'Review Legend'
}

export const getBonusDecision = (score, maxBonusPercent = 10) => {
  let percent = 0

  if (score >= 85) percent = maxBonusPercent >= 15 ? 15 : 10
  else if (score >= 65) percent = 10
  else if (score >= 45) percent = 5

  percent = Math.min(percent, maxBonusPercent)

  return {
    percent,
    label: percent ? `${percent}%` : '0%',
    approved: percent > 0,
  }
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
  const wordCount = words.length
  const uniqueRatio = new Set(words.map((word) => word.toLowerCase())).size / Math.max(wordCount, 1)
  const hasNumber = /\d/.test(normalizedText)
  const hasPeriod = /\b(\d+\s*)?(years?|months?|weeks?|days?|лет|год|месяц|недел|ай|жыл|апта)\b/i.test(lowerText)

  const usageMatches = includesAny(lowerText, usageKeywords)
  const detailMatches = includesAny(lowerText, detailKeywords)
  const prosMatches = includesAny(lowerText, prosKeywords)
  const consMatches = includesAny(lowerText, consKeywords)
  const adviceMatches = includesAny(lowerText, adviceKeywords)
  const toxicMatches = includesAny(lowerText, toxicKeywords)

  // The scoring is intentionally local and explainable: each useful review signal
  // contributes a capped score, then spam and low-information patterns subtract points.
  let lengthScore = 0
  if (wordCount >= 35) lengthScore = 30
  else if (wordCount >= 16) lengthScore = 24
  else if (wordCount >= 5) lengthScore = 16
  else if (wordCount >= 2) lengthScore = 8

  const usageScore = usageMatches.length || hasPeriod ? 16 : 0
  const detailScore = clamp(detailMatches.length * 4 + (hasNumber ? 4 : 0) + (hasPeriod ? 4 : 0), 0, 20)
  const prosScore = prosMatches.length ? 10 : 0
  const consScore = consMatches.length ? 10 : 0
  const adviceScore = adviceMatches.length ? 10 : 0
  const constructiveScore = toxicMatches.length === 0 && wordCount >= 3 ? 10 : 0

  const genericOnlyPenalty =
    wordCount <= 3 && meaninglessShort.some((phrase) => lowerText === phrase || lowerText === `very ${phrase}`)
      ? 8
      : 0
  const randomLettersPenalty = /([a-zа-яәғқңөұүһі])\1{4,}/i.test(lowerText) ? 18 : 0
  const emojiPenalty = (normalizedText.match(/\p{Extended_Pictographic}/gu)?.length ?? 0) > 3 ? 10 : 0
  const repetitionPenalty = getRepetitionPenalty(words) + (uniqueRatio < 0.45 && wordCount > 8 ? 10 : 0)

  const score = clamp(
    Math.round(
      lengthScore +
        usageScore +
        detailScore +
        prosScore +
        consScore +
        adviceScore +
        constructiveScore -
        genericOnlyPenalty -
        randomLettersPenalty -
        emojiPenalty -
        repetitionPenalty,
    ),
    0,
    100,
  )

  const signals = {
    hasSpecificDetails: detailScore >= 10,
    hasUsageExperience: usageScore > 0,
    hasPros: prosScore > 0,
    hasCons: consScore > 0,
    hasProsAndCons: prosScore > 0 && consScore > 0,
    helpfulForBuyers: detailScore >= 10 || adviceScore > 0 || usageScore > 0,
    lowSpamRisk: genericOnlyPenalty + randomLettersPenalty + emojiPenalty + repetitionPenalty <= 8,
  }

  return {
    score,
    qualityLevel: getQualityLevel(score),
    signals,
    suggestions: {
      ru: [
        !signals.hasSpecificDetails && 'Добавьте конкретные детали: цену, доставку, размер, вкус, батарею или сервис.',
        !signals.hasUsageExperience && 'Опишите реальный опыт использования или покупки.',
        !signals.hasProsAndCons && 'Добавьте честный плюс и минус, если они есть.',
        !adviceScore && 'Напишите, кому это подойдет или не подойдет.',
      ].filter(Boolean),
      en: [
        !signals.hasSpecificDetails && 'Add concrete details such as price, delivery, size, taste, battery, or service.',
        !signals.hasUsageExperience && 'Describe your real usage or purchase experience.',
        !signals.hasProsAndCons && 'Add an honest strength and drawback if possible.',
        !adviceScore && 'Explain who this is suitable for.',
      ].filter(Boolean),
      kz: [
        !signals.hasSpecificDetails && 'Баға, жеткізу, өлшем, дәм, батарея немесе қызмет туралы нақты деталь қосыңыз.',
        !signals.hasUsageExperience && 'Өзіңіздің қолдану немесе сатып алу тәжірибеңізді жазыңыз.',
        !signals.hasProsAndCons && 'Мүмкін болса, бір артықшылық пен бір кемшілік қосыңыз.',
        !adviceScore && 'Бұл кімге қолайлы екенін жазыңыз.',
      ].filter(Boolean),
    },
    metrics: {
      words: wordCount,
      rating,
      lengthScore,
      usageScore,
      detailScore,
      prosScore,
      consScore,
      adviceScore,
      constructiveScore,
      spamPenalty: genericOnlyPenalty + randomLettersPenalty + emojiPenalty + repetitionPenalty,
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
