"use client";


import { usePathname, useRouter } from "next/navigation";
import {
  AppShell,
  Group,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  Box,
  Divider,
} from "@mantine/core";
import {
  IconBriefcase,
  IconCalendarEvent,
  IconChartBar,
  IconHelp,
  IconLayoutDashboard,
  IconSettings,
  IconSquareAsterisk,
  IconUsers,
} from "@tabler/icons-react";
import classes from "./AppNavbar.module.css";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: <IconLayoutDashboard size={20} stroke={1.5} />,
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: <IconCalendarEvent size={20} stroke={1.5} />,
  },
  {
    label: "Interviews",
    href: "/interviews",
    icon: <IconBriefcase size={20} stroke={1.5} />,
  },
  {
    label: "Candidates",
    href: "/candidates",
    icon: <IconUsers size={20} stroke={1.5} />,
  },
  {
    label: "Roles",
    href: "/roles",
    icon: <IconSettings size={20} stroke={1.5} />,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: <IconChartBar size={20} stroke={1.5} />,
  },
];

const bottomItems: NavItem[] = [
  {
    label: "Settings",
    href: "/settings",
    icon: <IconSettings size={20} stroke={1.5} />,
  },
  {
    label: "Help",
    href: "/help",
    icon: <IconHelp size={20} stroke={1.5} />,
  },
];

interface AppNavbarProps {
  onClose?: () => void;
}

export default function AppNavbar({ onClose }: AppNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleNav = (href: string) => {
    router.push(href);
    onClose?.();
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);



  return (
    <AppShell.Section className={classes.navbar}>
      <Group px="md" pt="xl" gap="sm">
        <ThemeIcon size={34} radius="md" color="blue.9" variant="filled">
          <IconSquareAsterisk size={24} />
        </ThemeIcon>
        <Box>
          <Text fw={800} size="md" style={{ lineHeight: 1.1 }}>
            Calendar Interview
          </Text>
          <Text size="xs" c="dimmed" fw={500}>
            Powered by Formsly
          </Text>
        </Box>
      </Group>

      <ScrollArea style={{ flex: 1 }}>
        <Stack gap={4} p="md">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              label={item.label}
              leftSection={item.icon}
              active={isActive(item.href)}
              onClick={() => handleNav(item.href)}
              className={classes.link}
              styles={{
                label: { fontWeight: 600, fontSize: "14px" },
                root: {
                  borderRadius: "8px",
                  height: "44px",
                  backgroundColor: isActive(item.href)
                    ? "var(--mantine-color-blue-9)"
                    : "transparent",
                  color: isActive(item.href)
                    ? "white"
                    : "inherit",
                },
              }}
            />
          ))}
        </Stack>
      </ScrollArea>

      <Box p="md">
        <Divider mb="sm" color="var(--mantine-color-default-border)" />
        <Stack gap={4}>
          {bottomItems.map((item) => (
            <NavLink
              key={item.href}
              label={item.label}
              leftSection={item.icon}
              active={isActive(item.href)}
              onClick={() => handleNav(item.href)}
              className={classes.link}
              styles={{
                label: { fontWeight: 600, fontSize: "14px" },
                root: {
                  borderRadius: "8px",
                  height: "44px",
                  color: "inherit",
                },
              }}
            />
          ))}
        </Stack>
        <Box mt="md" px="xs">
          <Text size="10px" c="dimmed" fw={600} tt="uppercase">
            © 2026 FORMSLY INC.
          </Text>
        </Box>
      </Box>
    </AppShell.Section>
  );
}
