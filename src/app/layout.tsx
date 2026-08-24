import type { Metadata } from "next";
import type { ReactNode } from "react";
import { APP_NAME } from "@/lib/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: APP_NAME,
  description: "نظام داخلي لإدارة عملاء ومهام ومستندات مكتب حماده امام",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
