const levelStyles = {
  Weak: 'bg-rose-400/15 text-rose-100 border-rose-300/20',
  Average: 'bg-amber-400/15 text-amber-100 border-amber-300/20',
  Good: 'bg-sky-400/15 text-sky-100 border-sky-300/20',
  Excellent: 'bg-emerald-400/15 text-emerald-100 border-emerald-300/20',
}

function ReviewCard({ review, onHelpful, isLiked, isOwnReview }) {
  return (
    <article className="glass-panel flex h-full flex-col gap-5 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-white">{review.author}</span>
            <span className="text-xs text-slate-400">{review.product}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <span>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold tracking-tight text-white">{review.score}/100</div>
          <div
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${levelStyles[review.qualityLevel]}`}
          >
            {review.qualityLevel}
          </div>
        </div>
      </div>

      <p className="text-sm leading-7 text-slate-200">{review.text}</p>

      <div className="grid gap-3 rounded-[1.25rem] border border-white/8 bg-slate-950/55 p-4 sm:grid-cols-2">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Reward</div>
          <div className="mt-2 text-sm font-medium text-white">
            {review.couponCode ? `${review.bonusPercent}% coupon` : 'No coupon unlocked'}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {review.couponCode ?? 'Add more useful detail to qualify.'}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Helpful signals</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {review.signals.hasSpecificDetails && <span className="signal-pill">Specifics</span>}
            {review.signals.hasUsageExperience && <span className="signal-pill">Usage</span>}
            {review.signals.hasProsAndCons && <span className="signal-pill">Balanced</span>}
            {review.signals.helpfulForBuyers && <span className="signal-pill">Buyer advice</span>}
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3">
        <div className="text-sm text-slate-400">
          Helpful votes: <span className="font-medium text-white">{review.helpfulLikes}</span>
        </div>
        <button
          type="button"
          disabled={isLiked || isOwnReview}
          onClick={() => onHelpful(review.id)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            isOwnReview
              ? 'cursor-not-allowed border border-white/10 bg-white/5 text-slate-500'
              : isLiked
                ? 'cursor-not-allowed border border-emerald-300/20 bg-emerald-400/15 text-emerald-100'
                : 'border border-cyan-300/20 bg-cyan-400/15 text-cyan-100 hover:-translate-y-0.5 hover:bg-cyan-400/20'
          }`}
        >
          {isOwnReview ? 'Your review' : isLiked ? 'Counted' : 'Helpful'}
        </button>
      </div>
    </article>
  )
}

export default ReviewCard
