import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MemoryVault - Our Story",
  description: "A private collection of our memories together",
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
