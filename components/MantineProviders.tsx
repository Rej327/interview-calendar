"use client";

import React, { useMemo } from "react";

import { MantineProvider, createTheme, rem } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/lib/store/store";

export default function MantineProviders({ children }: { children: React.ReactNode }) {

  const theme = useMemo(() => createTheme({
    /** Base font */
    fontFamily: "var(--font-poppins), sans-serif",
    fontFamilyMonospace: "ui-monospace, 'Cascadia Code', monospace",

    /** Heading sizes */
    headings: {
      fontFamily: "var(--font-poppins), sans-serif",
      fontWeight: "700",
      sizes: {
        h1: { fontSize: rem(28), lineHeight: "1.3" },
        h2: { fontSize: rem(22), lineHeight: "1.35" },
        h3: { fontSize: rem(18), lineHeight: "1.4" },
      },
    },

    /** Brand colour */
    primaryColor: "blue",
    primaryShade: { light: 7, dark: 5 },

    /** Border radius */
    radius: {
      xs: rem(4),
      sm: rem(6),
      md: rem(8),
      lg: rem(12),
      xl: rem(16),
    },

    /** Spacing scale */
    spacing: {
      xs: rem(8),
      sm: rem(12),
      md: rem(16),
      lg: rem(24),
      xl: rem(32),
    },

    /** Component defaults */
    components: {
      Button: {
        defaultProps: { radius: "md" },
      },
      Card: {
        defaultProps: { radius: "md", withBorder: true },
      },
      TextInput: {
        defaultProps: { radius: "md" },
      },
      Select: {
        defaultProps: { radius: "md" },
      },
      Modal: {
        defaultProps: { radius: "lg", centered: true },
      },
      Badge: {
        defaultProps: { radius: "sm" },
      },
      Paper: {
        defaultProps: { radius: "md" },
      },
      NavLink: {
        defaultProps: { radius: "sm" },
      },
    },
  }), []);

  return (
    <ReduxProvider store={store}>
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <Notifications position="top-right" zIndex={9999} autoClose={4000} />
        <ModalsProvider>{children}</ModalsProvider>
      </MantineProvider>
    </ReduxProvider>
  );
}

