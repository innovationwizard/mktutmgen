import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "react-hot-toast";
import Providers from "./providers";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "UTM Generator — Grupo Orión",
  description:
    "Generador de marcación UTM y convenciones de nombrado para campañas digitales.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-surface font-sans">
        <Providers>
          {children}
        </Providers>
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: "!bg-orion-900 !text-white !text-sm",
            duration: 3000,
          }}
        />
      </body>
    </html>
  );
}
