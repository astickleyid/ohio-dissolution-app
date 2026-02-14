import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ohio Dissolution Intake Form",
  description: "Confidential intake form for Ohio Dissolution of Marriage document preparation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
