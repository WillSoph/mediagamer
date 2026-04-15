import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: {
    default: "MediaGamer | Reviews de games, notas e análises",
    template: "%s | MediaGamer",
  },
  description:
    "Descubra reviews de games da mídia brasileira. Notas, análises e rankings dos melhores jogos.",
  metadataBase: new URL("https://mediagamer.com.br"),

  openGraph: {
    title: "MediaGamer | Reviews de games, notas e análises",
    description:
      "Reviews de games da mídia brasileira. Descubra os melhores jogos.",
    url: "https://mediagamer.com.br",
    siteName: "MediaGamer",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MediaGamer",
    description:
      "Descubra reviews de games da mídia brasileira. Notas, análises e rankings dos melhores jogos.",
  },

  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${sora.variable} bg-bg text-text antialiased`}>
        {children}
        <Footer />
      </body>
    </html>
  );
}
