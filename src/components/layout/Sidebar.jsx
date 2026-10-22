'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { clearAccessToken } from '@/lib/api/client';

const SIDEBAR_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCCg8dcpWzzTE-xsHFkUjTOYpWf1q5EVoq8S3Rd-jUnJ-odUOomeASMUd6G_SccWp0F7j-BrwScB3wBkNe1cyi9PJMS4UfYw4J7xw2JibnpMWP6BTbuTwFhDfNPtf7fSXkRc_elqOJc0_ai-XsbwsDPk_BCC2QIL6w8Jf45P5q5NxaWYe4ADt-BWy5ON1Q5QsjnH7NKgjDeBDq-kRYgmwLjtSAUM-jBvbysUcm8aDw58maZ2tpwcdgnnVqe7Ro_oKQ9bXnS8JsdLb5J';

const navItems = [
  { label: 'Dashboard', icon: 'dashboard', href: '/' },
  { label: 'Orders', icon: 'inventory_2', href: '/orders' },
  { label: 'Customers', icon: 'group', href: '/customers' },
  { label: 'New Product', icon: 'add_box', href: '/products/new' },
  { label: 'Settings', icon: 'settings', href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    clearAccessToken();
    router.push('/login');
  };

  return (
    <nav className="bg-inverse-surface fixed left-0 top-0 z-50 flex h-full w-60 flex-col border-r border-outline-variant">
      <div className="flex items-center gap-4 border-b border-outline-variant/30 p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={SIDEBAR_AVATAR}
          alt="Admin"
          className="h-10 w-10 rounded-sm border border-outline-variant/50 object-cover"
        />
        <div>
          <h1 className="font-headline-sm text-headline-sm font-bold tracking-tighter text-primary">
            TOOLIFY 3D
          </h1>
          <p className="font-spec-label text-[10px] uppercase text-surface-variant">// SYS_ADMIN_v1.0</p>
        </div>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : item.href !== '#' && pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={
                isActive
                  ? 'flex items-center gap-3 border-l-4 border-primary bg-on-surface-variant/10 px-4 py-3 font-body-md text-body-md uppercase tracking-wider text-primary transition-none'
                  : 'flex items-center gap-3 px-4 py-3 font-body-md text-body-md uppercase tracking-wider text-surface-variant transition-none hover:bg-primary/10 hover:text-primary'
              }
            >
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="border-t border-outline-variant/30 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-sm border border-outline-variant/50 px-4 py-3 font-spec-label text-spec-label uppercase text-surface-variant transition-colors duration-0 hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Log Out
        </button>
      </div>

      <div className="border-t border-outline-variant/30 p-4">
        <Link
          href="#"
          className="flex items-center gap-3 px-4 py-2 font-body-md text-body-md uppercase tracking-wider text-surface-variant transition-none hover:bg-primary/10 hover:text-primary"
        >
          <span className="material-symbols-outlined animate-pulse text-primary-container">sensors</span>
          System Status
        </Link>
      </div>
    </nav>
  );
}
