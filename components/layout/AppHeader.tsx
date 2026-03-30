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
  TextInput,
  Box,
} from "@mantine/core";
import {
  IconBell,
  IconCalendarEvent,
  IconLogout,
  IconMoon,
  IconSettings,
  IconSun,
  IconUser,
  IconSearch,
  IconHistory,
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
      <Burger
        opened={opened}
        onClick={toggle}
        hiddenFrom="sm"
        size="sm"
        mr="xl"
        aria-label="Toggle navigation"
      />

      <TextInput
        placeholder="Search appointments or candidates..."
        leftSection={<IconSearch size={16} stroke={1.5} />}
        size="sm"
        radius="md"
        style={{ flex: 1 }}
        styles={{
          input: {
            height: "42px",
          },
        }}
      />



      {/* Right: Actions + User */}
      <Group gap="md">
        <Group gap={8}>
          <Tooltip label="Notifications" withArrow position="bottom">
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              radius="xl"
              aria-label="Notifications"
            >
              <IconBell size={20} stroke={1.5} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="History" withArrow position="bottom">
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              radius="xl"
              aria-label="History"
            >
              <IconHistory size={20} stroke={1.5} />
            </ActionIcon>
          </Tooltip>

          <Tooltip
            label={isDark ? "Light mode" : "Dark mode"}
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
              {isDark ? (
                <IconSun size={20} stroke={1.5} />
              ) : (
                <IconMoon size={20} stroke={1.5} />
              )}
            </ActionIcon>
          </Tooltip>
        </Group>

        <Menu shadow="md" width={200} position="bottom-end">
          <Menu.Target>
            <Avatar
              size={36}
              radius="md"
              src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png"
              style={{ cursor: "pointer", border: "2px solid var(--mantine-color-default-border)" }}
            />
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Account</Menu.Label>
            <Menu.Item leftSection={<IconUser size={14} />}>Profile</Menu.Item>
            <Menu.Item leftSection={<IconSettings size={14} />}>
              Settings
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item color="red" leftSection={<IconLogout size={14} />}>
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
}
