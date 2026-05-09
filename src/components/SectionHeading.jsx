function SectionHeading({ eyebrow, title, description, align = 'left' }) {
  const alignment = align === 'center' ? 'items-center text-center' : 'items-start text-left'

  return (
    <div className={`flex flex-col gap-3 ${alignment}`}>
      <span className="badge-chip">{eyebrow}</span>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h2>
        <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{description}</p>
      </div>
    </div>
  )
}

export default SectionHeading
