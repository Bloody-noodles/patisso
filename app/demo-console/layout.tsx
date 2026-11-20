import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo Operations Console | Pâtissö",
  robots: { index: false, follow: false },
};

export default function DemoConsoleLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
