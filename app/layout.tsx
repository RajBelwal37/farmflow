import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Navbar from '@/components/navbar';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { DataProvider } from "./context/DataContext";
import { ChatInterface } from '@/components/chatbot/ChatInterface';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FarmFlow - Farm Management System',
  description: 'Modern farm management solution for agricultural professionals',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <DataProvider>
              <Navbar />
              <main className="min-h-screen bg-background">
                {children}
              </main>
              <ChatInterface />
            </DataProvider>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}