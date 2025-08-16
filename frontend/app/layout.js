import { Geist, Geist_Mono } from "next/font/google";
import {AuthProvider} from "@/context/AuthProvider";
import RouteLoader from "@/components/RouteLoader/RouteLoader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "skillhire",
  description: "A ai powered job recruitment platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <RouteLoader />
              {children}
          
        
        </AuthProvider>
      </body>
    </html>
  );
}
