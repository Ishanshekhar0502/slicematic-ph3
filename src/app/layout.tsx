import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/lib/context/CartContext";
import { ToastProvider } from "@/lib/context/ToastContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SliceMatic Pizza | Artisanal Pizza Ordering System",
  description: "Order premium, customizable artisanal craft pizzas online. 30-minute delivery guaranteed in New Ashok Nagar, Delhi.",
  keywords: "SliceMatic, Pizza, Online Food Ordering, Artisanal Pizza, Custom Pizza, New Ashok Nagar, Delhi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased bg-[#F8F5F0] text-[#2B2B2B] h-full flex flex-col min-h-screen`}
      >
        <ToastProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-grow flex flex-col">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
