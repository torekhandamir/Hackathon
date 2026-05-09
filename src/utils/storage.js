import { SAMPLE_REVIEW_SEEDS } from '../data/sampleData'
import { createReviewRecord } from './reviewEngine'

const PROFILE_KEY = 'review-booster.profile'
const REVIEWS_KEY = 'review-booster.reviews.v2'
const LIKED_REVIEWS_KEY = 'review-booster.likedReviews.v2'

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const readJson = (key, fallback) => {
  if (!canUseStorage()) return fallback

  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const writeJson = (key, value) => {
  if (!canUseStorage()) return
  window.localStorage.setItem(key, JSON.stringify(value))
}

export const buildSeedReviews = () =>
  SAMPLE_REVIEW_SEEDS.map((seed) =>
    createReviewRecord({
      ...seed,
      isSeed: true,
    }),
  )

export const loadProfile = () => readJson(PROFILE_KEY, null)

export const saveProfile = (profile) => writeJson(PROFILE_KEY, profile)

export const clearProfile = () => {
  if (!canUseStorage()) return
  window.localStorage.removeItem(PROFILE_KEY)
}

export const loadReviews = () => {
  const reviews = readJson(REVIEWS_KEY, null)

  if (Array.isArray(reviews) && reviews.length > 0) {
    return reviews
  }

  const seeded = buildSeedReviews()
  writeJson(REVIEWS_KEY, seeded)
  return seeded
}

export const saveReviews = (reviews) => writeJson(REVIEWS_KEY, reviews)

export const loadLikedReviewIds = () => readJson(LIKED_REVIEWS_KEY, [])

export const saveLikedReviewIds = (ids) => writeJson(LIKED_REVIEWS_KEY, ids)
