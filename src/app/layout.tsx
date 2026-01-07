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
  description: "Task-based onchain growth engine for social posts.",
  other: {
    'base:app_id': '695ecd383ee38216e9af4b12',
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
