import AdminShell from '@/components/layout/AdminShell';
import AdminPageContent from '@/components/layout/AdminPageContent';
import ProductsIndexTable from '@/components/products/ProductsIndexTable';

export default function ProductsPage() {
  return (
    <AdminShell>
      <AdminPageContent contentClassName="space-y-stack-lg pb-24">
        <header className="admin-reveal space-y-2">
          <span className="system-label">// PRODUCTS</span>
          <h1 className="font-display-lg text-display-lg uppercase tracking-tighter text-on-background">
            Product Catalog
          </h1>
          <p className="font-body-md text-secondary">
            View, edit pricing, toggle stock, and remove products from the storefront.
          </p>
        </header>

        <ProductsIndexTable />
      </AdminPageContent>
    </AdminShell>
  );
}
