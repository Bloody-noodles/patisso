import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://patisso.vercel.app";
const socialImage = "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=1200&q=90";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "pitãssö — Take a taste. Come join us.",
    template: "%s | pitãssö",
  },
  description:
    "A pasta-led food experience with something delicious for every appetite. Explore pasta, savoury favourites, bakery treats and more at pitãssö.",
  applicationName: "pitãssö",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "pitãssö",
    title: "pitãssö — Take a taste. Come join us.",
    description:
      "A pasta-led food experience with something delicious for every appetite. Find your next favourite plate at pitãssö.",
    images: [{
      url: socialImage,
      width: 1200,
      height: 900,
      alt: "A generous plate of pasta from the pitãssö food collection",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "pitãssö — Take a taste. Come join us.",
    description: "A pasta-led food experience with something delicious for every appetite.",
    images: [socialImage],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f7f6f2",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
