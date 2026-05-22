import "./globals.css";
import type { Metadata, Viewport } from "next";
import AppShell from "@/components/app-shell";
import { AuthProvider } from "@/components/auth-provider";

export const metadata: Metadata = {
  manifest: "/manifest",
  title: "Smenuberu — Исполнитель",
  description: "Личный кабинет исполнителя",

  applicationName: "Smenuberu",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent", // было "default"
    title: "Smenuberu",
  },

  icons: {
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
    // опционально, но иногда помогает iOS/вебкиту:
    icon: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },

  themeColor: "#0B1220",
};

/**
 * 🔒 Запрещаем масштабирование интерфейса
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // добавили для iPhone с вырезом / safe-area
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      {/* Важно: не даём скроллить body, скроллим один контейнер внутри */}
      <body className="min-h-dvh antialiased">
        <AuthProvider>
          <div className="app-viewport">
            <AppShell>{children}</AppShell>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
