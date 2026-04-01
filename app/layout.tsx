import React from "react";
import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "mantine-datatable/styles.css";
import MantineProviders from "@/components/MantineProviders";
import "./globals.css";
import MainLayout from "@/components/layout/MainLayout";




const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: {
    default: "Interview Calendar",
    template: "%s | Interview Calendar",
  },
  description: "Schedule and manage interview sessions with ease",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#228be6",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={poppins.variable}>
      <body className={poppins.className}>
        <MantineProviders>
          <MainLayout>{children}</MainLayout>
        </MantineProviders>

      </body>
    </html>
  );
}


