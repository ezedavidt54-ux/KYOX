import type { Metadata, Viewport } from 'next';
import './globals.css';
import './kyo-light.css';
import './kyox-home.css';
import './kx-home-live.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'KYOX | Personal Trading Intelligence',
  description: 'KYOX learns each trader and turns their process into a personal on chain intelligence.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
