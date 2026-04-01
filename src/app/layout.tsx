import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import SupabaseProvider from "../components/providers/supabase-provider";
import { SidebarWithAuth } from "../components/layout/sidebar-with-auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CustCentral | Bank X",
  description: "AI-Powered Feedback Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex h-screen bg-slate-50`}>
        <SupabaseProvider>
          <div className="flex w-full">
            <SidebarWithAuth />
            <main className="flex-1 overflow-auto p-8">
              {children}
            </main>
          </div>
          <Toaster position="top-right" />
        </SupabaseProvider>
      </body>
    </html>
  );
}