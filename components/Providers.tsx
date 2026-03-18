"use client";

import { MantineProvider, createTheme } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/lib/store/store";

const theme = createTheme({
  primaryColor: "blue",
  fontFamily: "Inter, sans-serif",
  // Extend the theme here as needed
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <Notifications position="top-right" zIndex={1000} />
        <ModalsProvider>{children}</ModalsProvider>
      </MantineProvider>
    </ReduxProvider>
  );
}
