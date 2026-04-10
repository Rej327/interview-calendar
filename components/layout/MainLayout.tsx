"use client";

import { useState } from "react";
import { AppShell, Burger, useMantineColorScheme, rem } from "@mantine/core";

import { useDisclosure } from "@mantine/hooks";
import AppNavbar from "./AppNavbar";
import AppHeader from "./AppHeader";

export default function MainLayout({

  children,
}: {
  children: React.ReactNode;
}) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      layout="alt"
      header={{ height: rem(60) }}
      navbar={{
        width: rem(240),
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="0"
      withBorder={false}
      styles={{
        main: { 
          backgroundColor: "var(--mantine-color-body)",
          minHeight: "100vh"
        },
        navbar: { 
          backgroundColor: "var(--mantine-color-body)",
          borderRight: "none",
          boxShadow: "0 0 15px rgba(0,0,0,0.03)"
        },

        header: { 
          backgroundColor: "var(--mantine-color-body)",
          borderBottom: "none"
        },
      }}
    >
      <a
        href="#main-content"
        className="skip-link"
      >
        Skip to main content
      </a>


      <AppShell.Header component="header">
        <AppHeader opened={opened} toggle={toggle} />
      </AppShell.Header>

      <AppShell.Navbar component="nav" aria-label="Main Navigation">
        <AppNavbar onClose={toggle} />
      </AppShell.Navbar>

      <AppShell.Main component="main">
        <div id="main-content" style={{ outline: 'none' }} tabIndex={-1}>
          {children}
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
