import type { Metadata } from "next";
import { Outfit, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { cn } from "@/lib/utils";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-outfit" });
const ibmMono = IBM_Plex_Mono({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-ibm-mono" });

export const metadata: Metadata = {
  title: "OMS | Order Management",
  description: "B2B/B2C Order Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("light", outfit.variable, ibmMono.variable)} suppressHydrationWarning>
      <body className={cn("font-sans antialiased", outfit.className)} suppressHydrationWarning>
        <AuthProvider>
            {children}
        </AuthProvider>
      </body>
    </html>
  );
}
