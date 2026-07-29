import { AuthProvider } from '@/components/providers/AuthProvider';
import { OrderNotificationsProvider } from '@/components/providers/OrderNotificationsProvider';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata = {
  title: 'Toolify 3D — Admin Panel',
  description: 'Admin dashboard for Toolify 3D custom 3D printing service.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Oxanium:wght@600;700;800&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <AuthProvider>
          <OrderNotificationsProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </OrderNotificationsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
