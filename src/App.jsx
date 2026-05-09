import { useEffect, useState } from 'react'
import ReviewCard from './components/ReviewCard'
import SectionHeading from './components/SectionHeading'
import StarRating from './components/StarRating'
import { CURRENT_REVIEWER, PRODUCT_OPTIONS } from './data/sampleData'
import { createReviewRecord, getBonusDecision } from './utils/reviewEngine'
import { loadLikedReviewIds, loadReviews, saveLikedReviewIds, saveReviews } from './utils/storage'

const getReviewerLevel = ({ averageScore, reviewCount, helpfulLikes }) => {
  if (averageScore >= 90 && reviewCount >= 3 && helpfulLikes >= 12) return 'Review Legend'
  if (averageScore >= 84 && reviewCount >= 2) return 'Review Expert'
  if (averageScore >= 72 && helpfulLikes >= 6) return 'Trusted Reviewer'
  return 'Beginner Reviewer'
}

const getReviewerBadges = (stats, rank) => {
  const badges = []

  if (stats.bestScore >= 85) badges.push('Detail Master')
  if (stats.hasConstructiveLowRating) badges.push('Honest Critic')
  if (stats.helpfulLikes >= 8) badges.push('Helpful Voice')
  if (rank <= 3) badges.push('Top Reviewer')

  return badges
}

const buildReviewerStats = (reviews) => {
  const grouped = reviews.reduce((accumulator, review) => {
    if (!accumulator[review.author]) {
      accumulator[review.author] = []
    }

    accumulator[review.author].push(review)
    return accumulator
  }, {})

  return Object.entries(grouped).map(([author, authorReviews]) => {
    const totalReviews = authorReviews.length
    const totalScore = authorReviews.reduce((sum, review) => sum + review.score, 0)
    const helpfulLikes = authorReviews.reduce((sum, review) => sum + review.helpfulLikes, 0)
    const lowQualityCount = authorReviews.filter((review) => review.score < 45).length
    const averageScore = Number((totalScore / totalReviews).toFixed(1))
    const consistencyBonus = Math.min(totalReviews * 2, 10)
    const helpfulBonus = Math.min(helpfulLikes * 0.8, 8)
    const spamPenalty = lowQualityCount * 5
    const reviewerScore = Number((averageScore + helpfulBonus + consistencyBonus - spamPenalty).toFixed(1))
    const couponsEarned = authorReviews.filter((review) => review.couponCode).length
    const bestScore = Math.max(...authorReviews.map((review) => review.score))
    const hasConstructiveLowRating = authorReviews.some(
      (review) => review.rating <= 3 && review.score >= 70,
    )

    return {
      author,
      totalReviews,
      averageScore,
      helpfulLikes,
      reviewerScore,
      couponsEarned,
      bestScore,
      hasConstructiveLowRating,
      level: getReviewerLevel({ averageScore, reviewCount: totalReviews, helpfulLikes }),
    }
  })
}

const getTopItems = (entries, fallbackOrder) => {
  const sorted = [...entries].sort((a, b) => b.count - a.count || fallbackOrder.indexOf(a.label) - fallbackOrder.indexOf(b.label))
  return sorted.slice(0, 3)
}

const getInsights = (reviews) => {
  const complaintBuckets = {
    'delivery time': ['delivery', 'promised', 'late', 'days longer'],
    'battery life': ['battery', 'charge', 'hours', 'warm'],
    'size mismatch': ['size', 'fit', 'toe box', 'oversized', 'wide feet'],
  }

  const praiseBuckets = {
    price: ['price', 'value', 'worth'],
    comfort: ['comfortable', 'comfort', 'soft', 'foam', 'cushions', 'straps'],
    design: ['design', 'premium', 'color', 'looks'],
  }

  const buildCounts = (buckets) =>
    Object.entries(buckets).map(([label, keywords]) => ({
      label,
      count: reviews.reduce((count, review) => {
        const lower = review.text.toLowerCase()
        return count + (keywords.some((keyword) => lower.includes(keyword)) ? 1 : 0)
      }, 0),
    }))

  return {
    complaints: getTopItems(buildCounts(complaintBuckets), [
      'delivery time',
      'battery life',
      'size mismatch',
    ]),
    praises: getTopItems(buildCounts(praiseBuckets), ['price', 'comfort', 'design']),
  }
}

const getDashboardMetrics = (reviews) => {
  const totalReviews = reviews.length
  const averageQuality = Number(
    (reviews.reduce((sum, review) => sum + review.score, 0) / Math.max(totalReviews, 1)).toFixed(1),
  )
  const couponsIssued = reviews.filter((review) => review.couponCode).length
  const helpfulVotes = reviews.reduce((sum, review) => sum + review.helpfulLikes, 0)
  const estimatedTrustGrowth = Math.min(
    38,
    Math.round(averageQuality * 0.22 + couponsIssued * 1.5 + helpfulVotes * 0.35),
  )

  return { totalReviews, averageQuality, couponsIssued, helpfulVotes, estimatedTrustGrowth }
}

const getAnalysisChecks = (review) => [
  { label: 'Specific details found', passed: review.signals.hasSpecificDetails },
  { label: 'Usage experience found', passed: review.signals.hasUsageExperience },
  { label: 'Pros and cons included', passed: review.signals.hasProsAndCons },
  { label: 'Helpful for buyers', passed: review.signals.helpfulForBuyers },
  { label: 'Spam risk low', passed: review.signals.lowSpamRisk },
]

function App() {
  const [reviews, setReviews] = useState(() => loadReviews())
  const [likedReviewIds, setLikedReviewIds] = useState(() => loadLikedReviewIds())
  const [selectedProduct, setSelectedProduct] = useState(PRODUCT_OPTIONS[0])
  const [rating, setRating] = useState(4)
  const [reviewText, setReviewText] = useState('')
  const [analysisResult, setAnalysisResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    saveReviews(reviews)
  }, [reviews])

  useEffect(() => {
    saveLikedReviewIds(likedReviewIds)
  }, [likedReviewIds])

  const reviewerStats = buildReviewerStats(reviews).sort(
    (left, right) => right.reviewerScore - left.reviewerScore,
  )

  const rankedReviewers = reviewerStats.map((reviewer, index) => ({
    ...reviewer,
    rank: index + 1,
    badges: getReviewerBadges(reviewer, index + 1),
  }))

  const currentReviewer = rankedReviewers.find(
    (reviewer) => reviewer.author === CURRENT_REVIEWER.name,
  ) ?? {
    author: CURRENT_REVIEWER.name,
    totalReviews: 0,
    averageScore: 0,
    helpfulLikes: 0,
    reviewerScore: 0,
    couponsEarned: 0,
    bestScore: 0,
    hasConstructiveLowRating: false,
    level: 'Beginner Reviewer',
    rank: rankedReviewers.length + 1,
    badges: [],
  }

  const dashboardMetrics = getDashboardMetrics(reviews)
  const insights = getInsights(reviews)
  const topUsefulReviews = [...reviews].sort((left, right) => right.score - left.score).slice(0, 3)
  const defaultAnalysisReview =
    reviews.find((review) => review.author === CURRENT_REVIEWER.name) ?? reviews[0]
  const displayedAnalysis = analysisResult ?? defaultAnalysisReview
  const bonusPreview = getBonusDecision(displayedAnalysis?.score ?? 0)

  const handleHelpful = (reviewId) => {
    if (likedReviewIds.includes(reviewId)) return

    setReviews((currentReviews) =>
      currentReviews.map((review) =>
        review.id === reviewId
          ? { ...review, helpfulLikes: Math.min(review.helpfulLikes + 1, 12) }
          : review,
      ),
    )
    setLikedReviewIds((currentIds) => [...currentIds, reviewId])
  }

  const handleAnalyze = () => {
    if (reviewText.trim().length < 12) {
      setErrorMessage('Write at least one clear sentence so the engine has something useful to score.')
      return
    }

    setErrorMessage('')
    setIsAnalyzing(true)

    const newReview = createReviewRecord({
      author: CURRENT_REVIEWER.name,
      product: selectedProduct,
      rating,
      text: reviewText,
    })

    window.setTimeout(() => {
      setReviews((currentReviews) => [newReview, ...currentReviews])
      setAnalysisResult(newReview)
      setReviewText('')
      setRating(4)
      setSelectedProduct(PRODUCT_OPTIONS[0])
      setIsAnalyzing(false)
    }, 420)
  }

  return (
    <div className="app-shell">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="aurora aurora-one" />
        <div className="aurora aurora-two" />
        <div className="aurora aurora-three" />
      </div>

      <main className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <header className="glass-panel overflow-hidden px-5 py-6 sm:px-7 sm:py-7">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-6">
              <div className="flex flex-wrap gap-3">
                <span className="badge-chip">Review Booster</span>
                <span className="badge-chip subtle-chip">Better reviews. Smarter rewards.</span>
              </div>
              <div className="space-y-4">
                <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Reward useful feedback, not fake positivity.
                </h1>
                <p className="max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
                  We reward helpful reviews, not fake positivity. A negative review can still earn a
                  bonus when it is detailed, specific, and constructive.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="status-chip">&lt; 5 sec analysis</span>
                <span className="status-chip">Mobile ready</span>
                <span className="status-chip">Fair bonus system</span>
              </div>
            </div>

            <div className="grid w-full max-w-md gap-4 sm:grid-cols-2">
              <div className="metric-tile">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Avg review quality</div>
                <div className="mt-3 text-3xl font-semibold text-white">{dashboardMetrics.averageQuality}</div>
                <p className="mt-2 text-sm text-slate-400">Usefulness-first scoring for every submission.</p>
              </div>
              <div className="metric-tile">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Coupons issued</div>
                <div className="mt-3 text-3xl font-semibold text-white">{dashboardMetrics.couponsIssued}</div>
                <p className="mt-2 text-sm text-slate-400">Instant local coupon generation after scoring.</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
          <div className="glass-panel p-5 sm:p-6">
            <SectionHeading
              eyebrow="Submit Review"
              title="Fast local review analysis"
              description="The scoring engine runs entirely in the browser, which keeps the experience fast enough for a normal smartphone and reliable enough for a live demo."
            />

            <div className="mt-6 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="field-label">Product</span>
                  <select
                    value={selectedProduct}
                    onChange={(event) => setSelectedProduct(event.target.value)}
                    className="field-input"
                  >
                    {PRODUCT_OPTIONS.map((product) => (
                      <option key={product} value={product}>
                        {product}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="space-y-2">
                  <span className="field-label">Rating</span>
                  <StarRating rating={rating} onChange={setRating} />
                </div>
              </div>

              <label className="space-y-2">
                <span className="field-label">Review text</span>
                <textarea
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  rows={7}
                  placeholder="Tell future buyers what you used, what worked, what did not, and what they should know before buying."
                  className="field-input min-h-44 resize-none"
                />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="rounded-2xl border border-cyan-300/12 bg-cyan-400/8 px-4 py-3 text-sm text-slate-300">
                  Signed in as <span className="font-medium text-white">{CURRENT_REVIEWER.name}</span>. Bonuses
                  depend on usefulness, not positivity.
                </div>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="inline-flex items-center justify-center rounded-full border border-cyan-300/20 bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_60px_rgba(14,165,233,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_80px_rgba(14,165,233,0.45)] disabled:cursor-wait disabled:opacity-80"
                >
                  {isAnalyzing ? 'Analyzing review...' : 'Analyze Review'}
                </button>
              </div>

              {errorMessage && (
                <div className="rounded-2xl border border-rose-300/18 bg-rose-400/12 px-4 py-3 text-sm text-rose-100">
                  {errorMessage}
                </div>
              )}
            </div>
          </div>

          <aside className="glass-panel p-5 sm:p-6">
            <SectionHeading
              eyebrow="Result"
              title="Useful reviews unlock smarter rewards"
              description="Negative reviews still score well when they include specifics, real usage, and advice for other buyers."
            />

            <div className="mt-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="metric-tile">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Quality score</div>
                  <div className="mt-3 text-4xl font-semibold text-white">
                    {isAnalyzing ? '...' : `${displayedAnalysis.score}/100`}
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{displayedAnalysis.qualityLevel}</p>
                </div>
                <div className="metric-tile">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Bonus decision</div>
                  <div className="mt-3 text-4xl font-semibold text-white">{bonusPreview.percent}%</div>
                  <p className="mt-2 text-sm text-slate-400">
                    {displayedAnalysis.couponCode ?? 'No coupon unlocked yet'}
                  </p>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Latest coupon</div>
                  <div className="mt-2 text-lg font-medium text-white">
                      {displayedAnalysis.couponCode ?? 'Keep improving the review'}
                  </div>
                </div>
                <div className="rounded-full border border-emerald-300/15 bg-emerald-400/12 px-3 py-1 text-xs font-medium text-emerald-100">
                    {displayedAnalysis.bonusLabel}
                </div>
              </div>
            </div>

              <div className="space-y-3">
                {getAnalysisChecks(displayedAnalysis).map((check) => (
                  <div
                    key={check.label}
                    className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-4 py-3"
                  >
                    <span className="text-sm text-slate-200">{check.label}</span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        check.passed
                          ? 'bg-emerald-400/15 text-emerald-100'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {check.passed ? 'Found' : 'Missing'}
                    </span>
                  </div>
                ))}
              </div>

              {displayedAnalysis.suggestions.length > 0 && (
                <div className="rounded-[1.5rem] border border-amber-300/10 bg-amber-400/8 p-4">
                  <div className="text-sm font-medium text-white">Suggestions for improvement</div>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                    {displayedAnalysis.suggestions.map((suggestion) => (
                      <li key={suggestion}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
          <div className="glass-panel p-5 sm:p-6">
            <SectionHeading
              eyebrow="Reviewer Profile"
              title={`${CURRENT_REVIEWER.name}'s reputation`}
              description="Helpful likes have capped impact on ranking so quality stays more important than popularity."
            />

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="metric-tile">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Level</div>
                <div className="mt-3 text-2xl font-semibold text-white">{currentReviewer.level}</div>
                <p className="mt-2 text-sm text-slate-400">Rank #{currentReviewer.rank} this week</p>
              </div>
              <div className="metric-tile">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Coupons earned</div>
                <div className="mt-3 text-3xl font-semibold text-white">{currentReviewer.couponsEarned}</div>
                <p className="mt-2 text-sm text-slate-400">Usefulness-based rewards only</p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                ['Total reviews', currentReviewer.totalReviews],
                ['Average quality score', currentReviewer.averageScore],
                ['Helpful likes received', currentReviewer.helpfulLikes],
                ['Reviewer score', currentReviewer.reviewerScore],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[1.4rem] border border-white/8 bg-slate-950/55 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</div>
                  <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-white/8 bg-white/4 p-4">
              <div className="text-sm font-medium text-white">Badges</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {currentReviewer.badges.length > 0 ? (
                  currentReviewer.badges.map((badge) => <span key={badge} className="signal-pill">{badge}</span>)
                ) : (
                  <span className="text-sm text-slate-400">Submit a stronger review to unlock badges.</span>
                )}
              </div>
            </div>
          </div>

          <div className="glass-panel p-5 sm:p-6">
            <SectionHeading
              eyebrow="Leaderboard"
              title="Top Reviewers This Week"
              description="Reviewer score = average review quality + helpful likes bonus + consistency bonus - spam penalty."
            />

            <div className="mt-6 space-y-3">
              {rankedReviewers.map((reviewer) => (
                <div
                  key={reviewer.author}
                  className={`rounded-[1.45rem] border px-4 py-4 sm:px-5 ${
                    reviewer.author === CURRENT_REVIEWER.name
                      ? 'border-cyan-300/20 bg-cyan-400/10'
                      : 'border-white/8 bg-white/4'
                  }`}
                >
                  <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto_auto_auto] sm:items-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/65 text-sm font-semibold text-white">
                      #{reviewer.rank}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{reviewer.author}</div>
                      <div className="text-xs text-slate-400">
                        {reviewer.level} • {reviewer.totalReviews} review{reviewer.totalReviews === 1 ? '' : 's'}
                      </div>
                    </div>
                    <div className="text-sm text-slate-300">Avg {reviewer.averageScore}</div>
                    <div className="text-sm text-slate-300">Likes {reviewer.helpfulLikes}</div>
                    <div className="text-sm font-medium text-white">Score {reviewer.reviewerScore}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="glass-panel p-5 sm:p-6">
          <SectionHeading
            eyebrow="Reviews Feed"
            title="Recent reviews from the community"
            description="Helpful likes can add a small capped bonus to reputation, but review quality remains the main ranking factor."
          />

          <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onHelpful={handleHelpful}
                isLiked={likedReviewIds.includes(review.id)}
                isOwnReview={review.author === CURRENT_REVIEWER.name}
              />
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="glass-panel p-5 sm:p-6">
            <SectionHeading
              eyebrow="Business Dashboard"
              title="What the brand learns from useful reviews"
              description="The same feedback that unlocks rewards also turns into structured business insight for product, CX, and retention teams."
            />

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {[
                ['Total Reviews', dashboardMetrics.totalReviews],
                ['Average Review Quality', dashboardMetrics.averageQuality],
                ['Coupons Issued', dashboardMetrics.couponsIssued],
                ['Helpful Votes', dashboardMetrics.helpfulVotes],
                ['Estimated Trust Growth', `${dashboardMetrics.estimatedTrustGrowth}%`],
              ].map(([label, value]) => (
                <div key={label} className="metric-tile">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</div>
                  <div className="mt-3 text-2xl font-semibold text-white">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/8 bg-slate-950/55 p-4">
                <div className="text-sm font-medium text-white">Most common complaints</div>
                <div className="mt-3 space-y-3">
                  {insights.complaints.map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-sm text-slate-300">
                      <span className="capitalize">{item.label}</span>
                      <span className="rounded-full bg-white/6 px-3 py-1 text-xs text-white">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/8 bg-slate-950/55 p-4">
                <div className="text-sm font-medium text-white">Most praised features</div>
                <div className="mt-3 space-y-3">
                  {insights.praises.map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-sm text-slate-300">
                      <span className="capitalize">{item.label}</span>
                      <span className="rounded-full bg-white/6 px-3 py-1 text-xs text-white">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-5 sm:p-6">
            <SectionHeading
              eyebrow="Top Useful Reviews"
              title="Best review examples"
              description="These cards show the kind of detailed and balanced feedback the system rewards most."
            />

            <div className="mt-6 space-y-4">
              {topUsefulReviews.map((review) => (
                <div key={review.id} className="rounded-[1.5rem] border border-white/8 bg-white/4 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-white">{review.author}</div>
                      <div className="text-xs text-slate-400">{review.product}</div>
                    </div>
                    <div className="rounded-full border border-cyan-300/15 bg-cyan-400/12 px-3 py-1 text-xs font-medium text-cyan-100">
                      {review.score}/100
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="glass-panel p-5 sm:p-6">
            <SectionHeading
              eyebrow="Fairness"
              title="Anti-abuse rules built into the MVP"
              description="The reward engine is designed to encourage honesty and detail, while keeping manipulation low-value."
            />
            <div className="mt-6 grid gap-3">
              {[
                'Bonuses are based on usefulness, not positive sentiment.',
                'Repetitive or generic reviews get lower scores.',
                'Helpful likes have a capped ranking impact to reduce manipulation.',
                'Negative but constructive reviews can still receive coupons.',
                'The local algorithm keeps analysis comfortably under 5 seconds.',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-5 sm:p-6">
            <SectionHeading
              eyebrow="How It Works"
              title="Technical architecture"
              description="A lightweight browser-side pipeline keeps the MVP fast, deterministic, and easy to demo."
            />

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ['1. User writes review', 'Mobile-first form captures product, rating, and text.'],
                ['2. Local scoring engine analyzes text', 'Rule-based NLP checks detail, usage, advice, and spam risk.'],
                ['3. Coupon generator issues reward', 'Approved reviews instantly receive a unique RB coupon code.'],
                ['4. Reviews are stored', 'LocalStorage keeps the feed, profile, and likes after refresh.'],
                ['5. Dashboard turns reviews into insight', 'Leaderboard and business analytics reuse the same review data.'],
                ['Built with React + Vite + Tailwind', 'Fast frontend stack with no main scoring dependency on external AI APIs.'],
              ].map(([title, body]) => (
                <div key={title} className="rounded-[1.45rem] border border-white/8 bg-slate-950/55 p-4">
                  <div className="text-sm font-medium text-white">{title}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
