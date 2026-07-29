import AdminShell from '@/components/layout/AdminShell';
import AdminPageContent from '@/components/layout/AdminPageContent';
import PricingIndexTable from '@/components/settings/PricingIndexTable';
import WhatsAppSettings from '@/components/settings/WhatsAppSettings';
import DatabaseManagementSection from '@/components/settings/DatabaseManagementSection';
import PrinterFarmGrid from '@/components/settings/PrinterFarmGrid';
import AdminStatusFooter from '@/components/settings/AdminStatusFooter';

export default function SettingsPage() {
  return (
    <AdminShell>
      <AdminPageContent contentClassName="space-y-16 pb-24">
        <header className="admin-reveal space-y-2">
          <span className="system-label">// SETTINGS</span>
          <h1 className="font-display-lg text-display-lg uppercase tracking-tighter text-on-background">
            System Configuration
          </h1>
        </header>

        <PricingIndexTable />
        <WhatsAppSettings />
        <DatabaseManagementSection />
        <PrinterFarmGrid />
      </AdminPageContent>

      <AdminStatusFooter />
    </AdminShell>
  );
}
