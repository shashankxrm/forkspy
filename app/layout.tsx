import type { Metadata } from "next";

import "./globals.css";
import Provider from "@/components/Provider";

import { ThemeProvider } from "next-themes";
import { ModeToggle } from '../components/ModeToggle';


export const metadata: Metadata = {
  metadataBase: new URL('https://forkspy.vercel.app'),
  alternates: {
    canonical: '/',
  },
  title: {
    default: "ForkSpy - Github Fork Tracking Made Easy",
    template: "%s | ForkSpy"
  },
  description: "Track and monitor GitHub repository forks in real-time. Get instant notifications when your repositories are forked and stay informed about your code's impact.",
  keywords: [
    "GitHub",
    "Repository tracking",
    "Fork monitoring",
    "Developer tools",
    "GitHub webhooks",
    "Fork notifications",
    "Repository management",
    "gihub fork tracker"
  ],
  authors: [{ name: "Shashank", url: "https://github.com/shashankxrm" }],
  creator: "Shashank",
  publisher: "ForkSpy",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://forkspy.vercel.app",
    siteName: "ForkSpy",
    title: "ForkSpy - GitHub Fork Tracking Made Easy",
    description: "Track and monitor GitHub repository forks in real-time",
    images: [
      {
        url: "https://forkspy.vercel.app/forkspy.jpeg", // Add your OG image
        width: 1200,
        height: 630,
        alt: "ForkSpy Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ForkSpy - GitHub Fork Tracking Made Easy",
    description: "Track and monitor GitHub repository forks in real-time",
    images: ["https://forkspy.vercel.app/forkspy.jpeg"],
    creator: "@shashankxrm",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "eead87da6b52e8bb",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Provider>
      <html lang="en" suppressHydrationWarning>
        <body>
            <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            >
            {/* <UnderConstruction /> */}
            <div style={{ position: 'fixed', bottom: '10px', right: '10px', zIndex: 1000 }}>
              <ModeToggle />
            </div>
            {children}
            </ThemeProvider>
          
        </body>
      </html>
    </Provider>
  );
}