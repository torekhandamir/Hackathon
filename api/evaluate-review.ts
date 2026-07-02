import OpenAI from 'openai'
import { reviewEvaluationPrompt } from '../src/ai/reviewEvaluationPrompt'

const DEFAULT_OPENAI_MODEL = 'gpt-4.1-mini'
const languages = new Set(['ru', 'en', 'kz'])
const breakdownKeys = ['specificity', 'experienceDetails', 'usefulness', 'balance', 'antiSpam'] as const

const clamp = (value: unknown, min: number, max: number) => {
  const number = Number(value)
  if (!Number.isFinite(number)) return min
  return Math.min(max, Math.max(min, Math.round(number)))
}

const bonusForScore = (score: number) => {
  if (score >= 85) return { bonusPercent: 15, couponCode: 'RB15' }
  if (score >= 70) return { bonusPercent: 10, couponCode: 'RB10' }
  if (score >= 40) return { bonusPercent: 5, couponCode: 'RB5' }
  return { bonusPercent: 0, couponCode: '-' }
}

const textMap = (value: any) => ({
  ru: typeof value?.ru === 'string' ? value.ru : '',
  en: typeof value?.en === 'string' ? value.en : '',
  kz: typeof value?.kz === 'string' ? value.kz : '',
})

const stringArray = (value: any) => (Array.isArray(value) ? value.filter((item) => typeof item === 'string').slice(0, 8) : [])

const parseModelJson = (content: string) => {
  const trimmed = content.trim()
  try {
    return JSON.parse(trimmed)
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('OpenAI did not return JSON.')
    return JSON.parse(match[0])
  }
}

const normalizeEvaluation = (raw: any) => {
  if (!raw || typeof raw !== 'object' || typeof raw.publishable !== 'boolean') {
    throw new Error('OpenAI JSON is missing required fields.')
  }

  const breakdown = Object.fromEntries(
    breakdownKeys.map((key) => [key, clamp(raw.breakdown?.[key], 0, 20)]),
  ) as Record<(typeof breakdownKeys)[number], number>

  const breakdownSum = breakdownKeys.reduce((sum, key) => sum + breakdown[key], 0)
  let aiQualityScore = clamp(raw.aiQualityScore, 0, 100)

  if (Math.abs(aiQualityScore - breakdownSum) > 12) {
    aiQualityScore = breakdownSum
  }

  if (!raw.publishable) {
    aiQualityScore = Math.min(aiQualityScore, 20)
  }

  const bonus = raw.publishable ? bonusForScore(aiQualityScore) : { bonusPercent: 0, couponCode: '-' }

  return {
    publishable: raw.publishable,
    aiQualityScore,
    breakdown,
    ...bonus,
    aiExplanation: textMap(raw.aiExplanation),
    suggestions: {
      ru: stringArray(raw.suggestions?.ru),
      en: stringArray(raw.suggestions?.en),
      kz: stringArray(raw.suggestions?.kz),
    },
    tags: stringArray(raw.tags),
    complaints: stringArray(raw.complaints),
    praises: stringArray(raw.praises),
    rejectionReason: textMap(raw.rejectionReason),
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { reviewText, rating, category, place, product, language } = req.body ?? {}

    if (
      typeof reviewText !== 'string' ||
      reviewText.trim().length === 0 ||
      !Number.isFinite(Number(rating)) ||
      typeof category !== 'string' ||
      typeof place !== 'string' ||
      typeof product !== 'string' ||
      !languages.has(language)
    ) {
      return res.status(400).json({ error: 'Invalid review evaluation input.' })
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key is not configured.' })
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: reviewEvaluationPrompt },
        {
          role: 'user',
          content: JSON.stringify({
            reviewText: reviewText.trim(),
            rating: clamp(rating, 1, 5),
            category,
            place,
            product,
            language,
          }),
        },
      ],
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error('OpenAI returned an empty response.')

    return res.status(200).json(normalizeEvaluation(parseModelJson(content)))
  } catch (error) {
    console.error('Review evaluation failed:', error)
    return res.status(502).json({ error: 'AI evaluation failed.' })
  }
}
