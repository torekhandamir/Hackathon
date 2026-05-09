import { CURRENT_REVIEWER, SAMPLE_REVIEW_SEEDS } from '../data/sampleData'
import { createReviewRecord } from './reviewEngine'

const REVIEWS_KEY = 'review-booster.reviews'
const LIKED_REVIEWS_KEY = 'review-booster.likedReviews'

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const buildSeedReviews = () => SAMPLE_REVIEW_SEEDS.map((seed) => createReviewRecord(seed))

export const loadReviews = () => {
  if (!canUseStorage()) {
    return buildSeedReviews()
  }

  const raw = window.localStorage.getItem(REVIEWS_KEY)

  if (!raw) {
    const seeded = buildSeedReviews()
    window.localStorage.setItem(REVIEWS_KEY, JSON.stringify(seeded))
    return seeded
  }

  try {
    const parsed = JSON.parse(raw)

    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seeded = buildSeedReviews()
      window.localStorage.setItem(REVIEWS_KEY, JSON.stringify(seeded))
      return seeded
    }

    return parsed
  } catch {
    const seeded = buildSeedReviews()
    window.localStorage.setItem(REVIEWS_KEY, JSON.stringify(seeded))
    return seeded
  }
}

export const saveReviews = (reviews) => {
  if (!canUseStorage()) return
  window.localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews))
}

export const loadLikedReviewIds = () => {
  if (!canUseStorage()) return []

  try {
    return JSON.parse(window.localStorage.getItem(LIKED_REVIEWS_KEY) ?? '[]')
  } catch {
    return []
  }
}

export const saveLikedReviewIds = (ids) => {
  if (!canUseStorage()) return
  window.localStorage.setItem(LIKED_REVIEWS_KEY, JSON.stringify(ids))
}

export const resetMvpState = () => {
  if (!canUseStorage()) return
  window.localStorage.removeItem(REVIEWS_KEY)
  window.localStorage.removeItem(LIKED_REVIEWS_KEY)
}

export { CURRENT_REVIEWER }
