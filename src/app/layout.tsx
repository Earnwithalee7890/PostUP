import type { Metadata } from "next";
import { Outfit, Space_Grotesk } from "next/font/google";
import "./globals.css";
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from "@/lib/providers";
import FarcasterProvider from "@/providers/FarcasterProvider";
import { Navbar } from "@/components/ui/Navbar";

// Force dynamic rendering to avoid localStorage errors during build
export const dynamic = 'force-dynamic';

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
    'fc:miniapp': JSON.stringify({
      version: "1",
      name: "Post Up",
      iconUrl: "https://post-up-zeta.vercel.app/logos/postup_p.png",
      homeUrl: "https://post-up-zeta.vercel.app",
      imageUrl: "https://post-up-zeta.vercel.app/og-image.png",
      buttonTitle: "Launch Post Up",
      button: {
        title: "Launch Post Up",
        action: {
          type: "link",
          target: "https://post-up-zeta.vercel.app"
        }
      },
      splashImageUrl: "https://post-up-zeta.vercel.app/logos/postup_p.png",
      splashBackgroundColor: "#000000",
    }),
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
