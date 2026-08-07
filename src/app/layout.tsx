import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "../../providers/providers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: {
    default: "Social Media",
    template: "%s | Social Media",
  },
  description: "Your videos. Your stream 🌎.",
  authors: [{ name: "SocialMedia" }],
  keywords: ["Social Media", "Friends", "Communities", "Fun"],
  applicationName: "SocialMedia",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    title: "SocialMedia",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "Social Media",
    description: "Your videos. Your stream 🌎.",
    siteName: "SocialMedia",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning é obrigatório no <html>: é nele que o
    // next-themes injeta a classe de tema antes da hidratação.
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={poppins.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
