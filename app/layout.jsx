'use client';

import Script from 'next/script';
import localFont from "next/font/local";
import CookieBanner from '@/app/components/CookieBanner';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Header from '@/app/components/Header'; // Asegúrate de importar correctamente el Header
import Footer from '@/app/components/Footer'; // Asegúrate de importar correctamente el Footer

import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900">
          <Header /> {/* Añadir el Header aquí */}
          <main className="flex-grow">{children}</main>
          <Footer /> {/* Añadir el Footer aquí */}
          <CookieBanner />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
          {/* Google Analytics Script */}
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
            onLoad={() =>
              console.log("Google Analytics Script cargado correctamente.")
            }
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </div>
      </body>
    </html>
  );
}