import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { AuthListener } from "@/components/AuthListener";
import { SyncEngine } from "@/components/SyncEngine";
import { ActivityLogger } from "@/components/ActivityLogger";

const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "MoodCinema | Discover Your Vibe",
  description: "Aesthetic movie discovery platform powered by your mood.",
};

import { DeviceTracker } from "@/components/DeviceTracker";
import { CookieConsent } from "@/components/CookieConsent";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${roboto.variable} antialiased`}
      >
        <AuthListener />
        <SyncEngine />
        <ActivityLogger />
        <DeviceTracker />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
