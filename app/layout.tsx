import "./globals.css";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";

import Header from "@/components/header";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Paaster – Secure Text and File Sharing",
  description: "End-to-end encrypted text and file sharing platform",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="h-full" suppressHydrationWarning>
      <body
        className={cn(
          "h-full scroll-smooth antialiased flex flex-col",
          geistSans.variable,
          geistMono.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <div className="flex-1 bg-accent p-4">
            {children}
            <Toaster position="top-center" richColors />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
