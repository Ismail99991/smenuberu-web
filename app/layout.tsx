import "./globals.css";
import type { Metadata } from "next";
import AppShell from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Smenuberu — Исполнитель",
  description: "Личный кабинет исполнителя",

  applicationName: "Smenuberu",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Smenuberu",
  },

  icons: {
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },

  themeColor: "#0B1220",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-dvh antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
