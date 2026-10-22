'use client';

import HeaderUtilityButtons from '@/components/layout/HeaderUtilityButtons';
import { useAuth } from '@/components/providers/AuthProvider';

export default function TopNavbar() {
  const { session } = useAuth();
  const user = session?.user;
  const displayName = user?.name || user?.email?.split('@')[0] || 'Admin';

  return (
    <header className="sticky top-0 z-40 flex w-full items-center justify-end border-b border-outline-variant bg-surface px-margin-page py-stack-sm">
      <div className="flex items-center gap-6">
        <HeaderUtilityButtons />
        <div className="flex items-center gap-3 rounded-sm border border-outline-variant p-1 pr-3">
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt={displayName} className="h-8 w-8 rounded-sm object-cover" />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-[20px]">person</span>
            </span>
          )}
          <span className="font-spec-label text-spec-label uppercase text-on-surface">
            {displayName}
          </span>
        </div>
      </div>
    </header>
  );
}
