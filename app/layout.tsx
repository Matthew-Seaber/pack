import type { Metadata } from "next";
import { Poppins, Montserrat, Roboto_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import PageConfig from "../components/page-config";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700",],
  variable: "--font-montserrat",
  display: "swap",
});

const roboto_mono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-roboto-mono",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pack",
  description:
    "The future of education is here. Level up your learning today, and boost your exam grades to new heights! 🚀",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      {
        url: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      { url: "/icon0.svg", type: "image/svg+xml" },
      { url: "/icon1.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="Pack" />
      </head>
      <body
        className={`${inter.variable} ${roboto_mono.variable} ${poppins.variable} ${montserrat.variable} antialiased`}
      >
        <PageConfig>{children}</PageConfig>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
