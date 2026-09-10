import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "БарбарониТЕ",
  description: "Творчески център за деца и възрастни в София",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg">
      <body>{children}</body>
    </html>
  );
}
