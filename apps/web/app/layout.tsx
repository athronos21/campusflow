import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { CartProvider } from '@/lib/cart-context';
import { ToastProvider } from '@/components/ui/toast';

export const metadata: Metadata = {
  title: 'CampusFlow — Haramaya University Campus Ledger',
  description:
    'Unified Ethiopian campus services: cafeteria pre-orders, Dire Dawa & Harar shuttles, housing, past papers, and verified campus commerce.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-background text-foreground">
        <ToastProvider>
          <AuthProvider>
            <CartProvider>{children}</CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
