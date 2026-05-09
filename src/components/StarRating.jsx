function StarRating({ rating, onChange }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= rating

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-xl transition duration-200 ${
              active
                ? 'border-cyan-300/60 bg-cyan-400/15 text-cyan-100 shadow-[0_0_24px_rgba(56,189,248,0.28)]'
                : 'border-white/10 bg-white/5 text-slate-500 hover:border-cyan-400/30 hover:text-cyan-100'
            }`}
            aria-label={`Rate ${star} star${star === 1 ? '' : 's'}`}
          >
            ★
          </button>
        )
      })}
      <span className="ml-2 text-sm text-slate-300">{rating}/5</span>
    </div>
  )
}

export default StarRating
