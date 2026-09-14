import type { Metadata, Viewport } from "next";
import { PizzaProvider } from "@/components/PizzaProvider";
import { Gate } from "@/components/Gate";
import "./globals.css";

export const metadata: Metadata = {
  title: "PIZZA RANK",
  description: "Momo · Ronit · Amit — ranking de pizzas en Madrid",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "PIZZA RANK",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#f3f2f2",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <PizzaProvider>
          <Gate>{children}</Gate>
        </PizzaProvider>
      </body>
    </html>
  );
}
