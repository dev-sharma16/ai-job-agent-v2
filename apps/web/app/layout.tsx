import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Job Application Agent',
  description: 'Personal job discovery and application assistant',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
