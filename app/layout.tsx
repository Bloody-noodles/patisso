import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "pãtissö — A little more than pasta",
  description:
    "A considered menu of handmade pasta, comfort food and sweet things. Welcome to pãtissö.",
  applicationName: "pãtissö",
};

export const viewport: Viewport = {
  themeColor: "#7F011F",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}