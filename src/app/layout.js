import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LiveVisuals from "./components/LiveVisuals/LiveVisuals";
import Chatbot from "./components/Chatbot/Chatbot";
import Providers from "./Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SkillMatch AI - Premium AI-Powered Job Matching Platform",
  description:
    "Match your unique skills with the perfect career opportunities using our advanced AI-driven platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <LiveVisuals />
          {children}
          <Chatbot />
        </Providers>
      </body>
    </html>
  );
}
