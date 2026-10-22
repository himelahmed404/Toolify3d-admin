import Link from 'next/link';
import AdminShell from '@/components/layout/AdminShell';
import AdminPageContent from '@/components/layout/AdminPageContent';
import AddProductForm from '@/components/products/AddProductForm';

export default function NewProductPage() {
  return (
    <AdminShell>
      <AdminPageContent contentClassName="space-y-stack-lg">
        <header className="admin-reveal flex flex-wrap items-end justify-between gap-4 border-b border-outline-variant pb-4">
          <div>
            <h1 className="font-headline-md text-headline-md tracking-tight text-on-surface">
              Add New Product
            </h1>
            <p className="mt-1 font-body-md text-secondary">
              Configure parameters and upload schematics for new inventory injection.
            </p>
          </div>
          <Link
            href="/products"
            className="font-spec-label text-sm uppercase tracking-wider text-on-surface-variant underline decoration-primary/30 underline-offset-4 transition-colors hover:text-primary"
          >
            View all products →
          </Link>
        </header>

        <AddProductForm />
      </AdminPageContent>
    </AdminShell>
  );
}
