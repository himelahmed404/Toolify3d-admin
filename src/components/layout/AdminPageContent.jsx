export default function AdminPageContent({ children, className = '', contentClassName = 'space-y-section-padding-v' }) {
  return (
    <main className={`flex-1 overflow-y-auto bg-surface ${className}`}>
      <div className={`mx-auto w-full max-w-container-max p-margin-page pb-section-padding-v ${contentClassName}`}>
        {children}
      </div>
    </main>
  );
}
