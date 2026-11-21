import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo Order Tracking | Pâtissö",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function TrackLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
