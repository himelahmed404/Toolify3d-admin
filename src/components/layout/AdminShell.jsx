import Sidebar from '@/components/layout/Sidebar';
import TopNavbar from '@/components/layout/TopNavbar';

export default function AdminShell({ children }) {
  return (
    <div className="font-body-md text-body-md flex h-screen overflow-hidden bg-background text-on-background antialiased">
      <Sidebar />

      <div className="ml-60 flex h-full flex-1 flex-col">
        <TopNavbar />
        {children}
      </div>
    </div>
  );
}
