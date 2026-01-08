import type { Metadata } from "next";
import { Outfit, Space_Grotesk } from "next/font/google";
import "./globals.css";
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from "@/lib/providers";
import FarcasterProvider from "@/providers/FarcasterProvider";
import { Navbar } from "@/components/ui/Navbar";

const outfit = Outfit({
  subsets: ["latin"],
  variable: '--font-outfit',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: '--font-space',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Post Up | Onchain Promotion Engine",
  description: "Task-based onchain growth engine. Promote content, earn rewards, and grow your Farcaster presence.",
  applicationName: 'Post Up',
  authors: [{ name: 'Aleekhoso', url: 'https://warpcast.com/aleekhoso' }],
  keywords: ['Farcaster', 'Base', 'Crypto', 'Tasks', 'Rewards', 'Growth'],
  metadataBase: new URL('https://post-up-zeta.vercel.app'),
  openGraph: {
    title: "Post Up | Onchain Promotion Engine",
    description: "Task-based onchain growth engine. Promote content, earn rewards, and grow your Farcaster presence.",
    url: 'https://post-up-zeta.vercel.app',
    siteName: 'Post Up',
    images: [
      {
        url: '/og-image.png', // Uses the file we just copied
        width: 1200,
        height: 630,
        alt: 'Post Up Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Post Up",
    description: "Task-based onchain growth engine.",
    images: ['/og-image.png'],
    creator: '@aleekhoso',
  },
  icons: {
    icon: '/logos/postup_p.png',
    shortcut: '/logos/postup_p.png',
    apple: '/logos/postup_p.png',
  },
  other: {
    'base:app_id': '695ecd383ee38216e9af4b12',
    // Farcaster Mini App tags
    'of:version': 'vNext',
    'of:accepts:farcaster': 'vNext',
    'of:image': 'https://post-up-zeta.vercel.app/og-image.png',
    'of:button:1': 'Launch Post Up',
    'of:button:1:action': 'link',
    'of:button:1:target': 'https://post-up-zeta.vercel.app',
    // Legacy Frame tags for compatibility
    'fc:frame': 'vNext',
    'fc:frame:image': 'https://post-up-zeta.vercel.app/og-image.png',
    'fc:frame:button:1': 'Launch Post Up',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': 'https://post-up-zeta.vercel.app',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${spaceGrotesk.variable}`}>
      <body>
        <Providers>
          <FarcasterProvider>
            <Navbar />
            <div className="full-screen">
              {children}
            </div>
          </FarcasterProvider>
        </Providers>
      </body>
    </html>
  );
}
