import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./_Components/header.jsx"
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Ryan& Co Platform",
  description: "Agency Staff working platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
       <Header/>
       {children}
      </body>
    </html>
  );
}
