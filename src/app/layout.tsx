import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "kai-asset/styles/main.scss";
import Head from "next/head";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KM Audit Demo",
  description: "KM Audit Demo with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
