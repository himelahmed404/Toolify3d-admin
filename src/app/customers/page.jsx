'use client';

import { useState } from 'react';
import AdminShell from '@/components/layout/AdminShell';
import AdminPageContent from '@/components/layout/AdminPageContent';
import SectionHeader from '@/components/layout/SectionHeader';
import CustomerLedgerTable from '@/components/customers/CustomerLedgerTable';

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <AdminShell>
      <AdminPageContent>
        <SectionHeader
          label="// CUSTOMERS"
          title="Customer Ledger"
          description="System overview of registered client accounts, contact vectors, and historical transaction volume."
        />

        <CustomerLedgerTable searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      </AdminPageContent>
    </AdminShell>
  );
}
