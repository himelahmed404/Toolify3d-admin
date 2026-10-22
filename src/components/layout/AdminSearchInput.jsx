export default function AdminSearchInput({
  placeholder = 'Search...',
  className = 'w-64 lg:w-96',
  value,
  onChange,
  alwaysVisible = false,
}) {
  const visibilityClass = alwaysVisible ? 'flex' : 'hidden sm:flex';

  return (
    <div className={`relative ${visibilityClass} items-center ${className}`}>
      <span className="material-symbols-outlined absolute left-3 text-secondary">search</span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="admin-input h-10 w-full pl-10 pr-4 font-body-md text-body-md text-on-surface placeholder:text-secondary"
      />
    </div>
  );
}
