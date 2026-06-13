import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { THEMES } from "@/content/themes";
import { PROFILE } from "@/content/resume";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${PROFILE.name} — ${PROFILE.role}`,
  description:
    "Interactive terminal-style portfolio of Alexandro Georgiev — full-stack development, DevOps, and Linux automation.",
};

// Applies the saved theme before first paint to avoid a flash of the default palette.
const themeInitScript = `(function(){try{var T=${JSON.stringify(THEMES)};var n=localStorage.getItem('portfolio-theme');var t=T[n];if(t){var r=document.documentElement;for(var k in t){r.style.setProperty(k,t[k]);}}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
