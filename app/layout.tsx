import type { Metadata } from "next";

import "./globals.css";
import Provider from "@/components/Provider";
import UnderConstruction from '../components/under-construction';
import { ThemeProvider } from "next-themes";
import { ModeToggle } from '../components/ModeToggle';


export const metadata: Metadata = {
  title: "ForkSpy",
  description: "Stay informed about your repositories impact effortlessly", 
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
            <UnderConstruction />
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