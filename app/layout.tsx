import React from "react";
import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "mantine-datatable/styles.css";
import MantineProviders from "@/components/MantineProviders";
import "./globals.css";




const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: {
    default: "Formsly Interview Calendar | Strategic Recruitment Dashboard",
    template: "%s | Formsly Interview Calendar",
  },
  description: "Formsly Interview Calendar is a high-performance recruitment analytics portal for scheduling, managing, and optimizing your organization's hiring journey and interview sessions.",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#228be6",
};

import NextTopLoader from "nextjs-toploader";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={poppins.variable}>
      <body className={poppins.className}>
        <NextTopLoader
          color="var(--mantine-color-blue-6)"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px var(--mantine-color-blue-6),0 0 5px var(--mantine-color-blue-6)"
        />
        <MantineProviders>
          {children}
        </MantineProviders>
      </body>
    </html>
  );
}


