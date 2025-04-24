import type { Metadata } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SkipToMain } from "@/components/skip-to-main";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Update Metadata for PWA theme color
export const metadata: Metadata = {
  title: "¡Pura Vida! | Costa Rica Slots",
  description: "Have fun playing slots in Costa Rica. ¡Pura Vida!",
  manifest: "/manifest.json", // Add manifest link here
  themeColor: "#22c55e", // Match theme_color in manifest
  appleWebApp: {
    // Add iOS specific settings
    capable: true,
    statusBarStyle: "black-translucent", // Or 'default', 'black'
    title: "CR Slots",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased flex flex-col`}
        style={{
          backgroundImage: "url('/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <SkipToMain />
        {/* <Header /> */}
        <main id="main" className="grow">
          {children}
        </main>
        {/* <Footer /> */}
      </body>
      <GoogleAnalytics gaId="G-LZ07JNEN9Y" />
    </html>
  );
}
