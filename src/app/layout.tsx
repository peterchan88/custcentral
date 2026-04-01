"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/components/auth/auth-provider";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function AppContent({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <div className="flex h-screen bg-slate-50 w-full">
      {!isLoginPage && session && <Sidebar />}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <AppContent>
            {children}
          </AppContent>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}