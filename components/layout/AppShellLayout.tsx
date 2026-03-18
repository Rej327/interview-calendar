"use client";

import { useState } from "react";
import { AppShell, Burger, useMantineColorScheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import AppNavbar from "./AppNavbar";
import AppHeader from "./AppHeader";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 240,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <AppHeader opened={opened} toggle={toggle} />
      </AppShell.Header>

      <AppShell.Navbar>
        <AppNavbar onClose={toggle} />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
