import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "Euclid's Elements";
const description =
  "A searchable, modern reader for all thirteen books of Euclid's Elements in Thomas L. Heath's translation.";
const imageUrl =
  "https://raw.githubusercontent.com/avyfain/euclid/main/public/og-hero.png";

export const metadata: Metadata = {
  title: {
    default: title,
    template: "%s | Euclid's Elements",
  },
  description,
  authors: [
    { name: "Euclid" },
    {
      name: "Thomas L. Heath",
      url: "https://www.perseus.tufts.edu/hopper/text?doc=Euc.+1",
    },
  ],
  category: "education",
  openGraph: {
    type: "website",
    title,
    description,
    images: [{ url: imageUrl, width: 1731, height: 909, alt: title }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [imageUrl],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
