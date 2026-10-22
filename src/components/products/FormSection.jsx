export default function FormSection({ label, description, children, className = '' }) {
  return (
    <section
      className={`admin-reveal grid grid-cols-1 gap-gutter border border-outline-variant bg-surface-container-lowest p-6 md:grid-cols-12 ${className}`}
    >
      <div className="flex flex-col md:col-span-4">
        <span className="mb-2 font-spec-label text-spec-label text-primary-container">{label}</span>
        <p className="font-body-md text-sm text-secondary">{description}</p>
      </div>
      <div className="md:col-span-8">{children}</div>
    </section>
  );
}
