import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "bee-jobs 🐝",
  description: "Personal job tracking CRM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
