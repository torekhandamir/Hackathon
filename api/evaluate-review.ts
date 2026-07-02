const DEFAULT_OPENAI_MODEL = 'gpt-4.1-mini'
const PLACEHOLDER_MODELS = new Set(['', 'your_model_here', 'your-model-here', 'model'])
const languages = new Set(['ru', 'en', 'kz'])
const breakdownKeys = ['specificity', 'experienceDetails', 'usefulness', 'balance', 'antiSpam'] as const

// EDIT THIS PROMPT TO CHANGE OPENAI EVALUATION BEHAVIOR
const reviewEvaluationPrompt = `
You are an AI/NLP review quality evaluator for Review Booster.
Evaluate the usefulness and authenticity of a customer review.
Do not evaluate whether the review is positive. Evaluate whether it is helpful, honest, detailed, balanced, authentic, and useful for future customers and businesses.

Important rules:
- Do not reward positive reviews automatically.
- A detailed 4-star review with pros and cons can get a high score.
- A 5-star review like "good" should get a low score.
- Reject gibberish, spam, offensive text, repeated words, meaningless text, or inappropriate content.
- The bonus is for useful, honest, detailed reviews, not for positive reviews.
- Use the input fields: review text, star rating, category, place, product, selected language.

Score five dimensions from 0 to 20:
1. specificity
2. experienceDetails
3. usefulness
4. balance
5. antiSpam

Total AI Quality Score is 0-100 and should roughly equal the sum of the five dimensions.

Return ONLY valid JSON in this exact schema:
{
  "publishable": true,
  "aiQualityScore": 88,
  "breakdown": {
    "specificity": 18,
    "experienceDetails": 18,
    "usefulness": 17,
    "balance": 17,
    "antiSpam": 18
  },
  "bonusPercent": 15,
  "couponCode": "RB15",
  "aiExplanation": {
    "ru": "",
    "en": "",
    "kz": ""
  },
  "suggestions": {
    "ru": [],
    "en": [],
    "kz": []
  },
  "tags": [],
  "complaints": [],
  "praises": [],
  "rejectionReason": {
    "ru": "",
    "en": "",
    "kz": ""
  }
}

If publishable is false, set aiQualityScore to 0 or very low, bonusPercent to 0, couponCode to null or "-", and explain why in rejectionReason in RU, EN, and KZ.
`

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

const getConfiguredModel = () => {
  const configured = process.env.OPENAI_MODEL?.trim() ?? ''
  return PLACEHOLDER_MODELS.has(configured.toLowerCase()) ? DEFAULT_OPENAI_MODEL : configured
}

const getBody = (req: any) => {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      return null
    }
  }
  return null
}

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
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      route: '/api/evaluate-review',
      openaiKeyConfigured: Boolean(process.env.OPENAI_API_KEY),
      model: getConfiguredModel(),
    })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = getBody(req)
    const { reviewText, rating, category, place, product, language } = body ?? {}

    if (
      typeof reviewText !== 'string' ||
      reviewText.trim().length === 0 ||
      !Number.isFinite(Number(rating)) ||
      typeof category !== 'string' ||
      typeof place !== 'string' ||
      typeof product !== 'string' ||
      !languages.has(language)
    ) {
      return res.status(400).json({ error: 'Invalid review evaluation input.', code: 'INVALID_INPUT' })
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key is not configured.', code: 'OPENAI_KEY_MISSING' })
    }

    const model = getConfiguredModel()

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
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
      }),
    })

    const completion = await openaiResponse.json()
    if (!openaiResponse.ok) {
      throw new Error(completion?.error?.message || `OpenAI request failed with ${openaiResponse.status}`)
    }

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error('OpenAI returned an empty response.')

    return res.status(200).json(normalizeEvaluation(parseModelJson(content)))
  } catch (error) {
    console.error('Review evaluation failed:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(502).json({ error: 'AI evaluation failed.', code: 'OPENAI_EVALUATION_FAILED', detail: message })
  }
}
