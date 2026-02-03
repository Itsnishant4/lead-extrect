import type { Metadata } from "next";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { AutomationProvider } from "@/context/AutomationContext";

export const metadata: Metadata = {
  title: "Lead Extractor Pro",
  description: "Extract business leads from Google Maps to SQLite",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>

      <body className="antialiased min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AutomationProvider>
            <SidebarProvider>
              {children}
              <Toaster />
            </SidebarProvider>
          </AutomationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
