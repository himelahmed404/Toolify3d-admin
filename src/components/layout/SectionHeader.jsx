export default function SectionHeader({
  label,
  title,
  description,
  meta,
  titleClassName = 'font-headline-md text-headline-md',
  className = '',
}) {
  return (
    <section className={`admin-reveal space-y-stack-md ${className}`}>
      <div className="system-label">{label}</div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className={`uppercase text-on-surface ${titleClassName}`}>{title}</h1>
        {meta ? <p className="font-spec-label text-sm text-secondary">{meta}</p> : null}
      </div>

      {description ? (
        <p className="font-body-lg text-body-lg max-w-2xl text-on-surface-variant">{description}</p>
      ) : null}
    </section>
  );
}
