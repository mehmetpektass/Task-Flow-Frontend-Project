import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '../lib/toast';

export const metadata: Metadata = {
  title: 'TaskFlow',
  description: 'Kanban Project Admin Application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

