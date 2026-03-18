"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  AppShell,
  Badge,
  Divider,
  Group,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import {
  IconCalendarEvent,
  IconChartBar,
  IconLayoutDashboard,
  IconMail,
  IconSettings,
  IconUsers,
  IconBriefcase,
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
    icon: <IconLayoutDashboard size={18} />,
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: <IconCalendarEvent size={18} />,
  },
  {
    label: "Interviews",
    href: "/interviews",
    icon: <IconBriefcase size={18} />,
    badge: "3",
  },
  {
    label: "Candidates",
    href: "/candidates",
    icon: <IconUsers size={18} />,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: <IconChartBar size={18} />,
  },
];

const bottomItems: NavItem[] = [
  {
    label: "Email Templates",
    href: "/templates",
    icon: <IconMail size={18} />,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <IconSettings size={18} />,
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
    <AppShell.Section component={ScrollArea} grow className={classes.navbar}>
      {/* Main nav */}
      <Stack gap={2} p="xs" pt="sm">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            label={item.label}
            leftSection={
              <ThemeIcon
                variant={isActive(item.href) ? "light" : "transparent"}
                color={isActive(item.href) ? "blue" : "gray"}
                size="sm"
                radius="sm"
              >
                {item.icon}
              </ThemeIcon>
            }
            rightSection={
              item.badge ? (
                <Badge size="xs" variant="filled" color="blue" circle>
                  {item.badge}
                </Badge>
              ) : undefined
            }
            active={isActive(item.href)}
            onClick={() => handleNav(item.href)}
            className={classes.link}
            variant="light"
          />
        ))}
      </Stack>

      {/* Bottom nav */}
      <Stack gap={2} p="xs" pb="md" style={{ marginTop: "auto" }}>
        <Divider mb="xs" />
        {bottomItems.map((item) => (
          <NavLink
            key={item.href}
            label={item.label}
            leftSection={
              <ThemeIcon
                variant={isActive(item.href) ? "light" : "transparent"}
                color={isActive(item.href) ? "blue" : "gray"}
                size="sm"
                radius="sm"
              >
                {item.icon}
              </ThemeIcon>
            }
            active={isActive(item.href)}
            onClick={() => handleNav(item.href)}
            className={classes.link}
            variant="light"
          />
        ))}
      </Stack>
    </AppShell.Section>
  );
}
