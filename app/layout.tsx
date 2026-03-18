import React from "react";
import type { Metadata, Viewport } from "next";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "mantine-datatable/styles.css";
import "./globals.css";
import Providers from "@/components/Providers";
import AppShellLayout from "@/components/layout/AppShellLayout";

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
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <AppShellLayout>{children}</AppShellLayout>
        </Providers>
      </body>
    </html>
  );
}
