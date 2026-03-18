"use client";

import {
  ActionIcon,
  Avatar,
  Burger,
  Group,
  Menu,
  Text,
  Tooltip,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconBell,
  IconCalendarEvent,
  IconLogout,
  IconMoon,
  IconSettings,
  IconSun,
  IconUser,
} from "@tabler/icons-react";
import classes from "./AppHeader.module.css";

interface AppHeaderProps {
  opened: boolean;
  toggle: () => void;
}

export default function AppHeader({ opened, toggle }: AppHeaderProps) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Group h="100%" px="md" justify="space-between" className={classes.header}>
      {/* Left: Burger + Logo */}
      <Group gap="sm">
        <Burger
          opened={opened}
          onClick={toggle}
          hiddenFrom="sm"
          size="sm"
          aria-label="Toggle navigation"
        />
        <Group gap={8} visibleFrom="sm">
          <IconCalendarEvent size={26} stroke={1.8} color="var(--mantine-color-blue-6)" />
          <Text fw={700} size="lg" className={classes.logo}>
            InterviewCal
          </Text>
        </Group>
      </Group>

      {/* Right: Actions + User */}
      <Group gap="xs">
        <Tooltip label="Notifications" withArrow position="bottom">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            radius="xl"
            aria-label="Notifications"
          >
            <IconBell size={18} />
          </ActionIcon>
        </Tooltip>

        <Tooltip
          label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          withArrow
          position="bottom"
        >
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            radius="xl"
            onClick={() => toggleColorScheme()}
            aria-label="Toggle color scheme"
          >
            {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
          </ActionIcon>
        </Tooltip>

        <Menu shadow="md" width={200} position="bottom-end">
          <Menu.Target>
            <Avatar
              size={34}
              radius="xl"
              color="blue"
              className={classes.avatar}
              style={{ cursor: "pointer" }}
            >
              EP
            </Avatar>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Account</Menu.Label>
            <Menu.Item leftSection={<IconUser size={14} />}>Profile</Menu.Item>
            <Menu.Item leftSection={<IconSettings size={14} />}>
              Settings
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
}
