"use client";

import React from "react";
import {
  Badge,
  Box,
  Card,
  Container,
  Grid,
  Group,
  Stack,
  Text,
  Title,
  Button,
  Avatar,
  ActionIcon,
  SimpleGrid,
  ThemeIcon,
  Progress,
  AvatarGroup,
} from "@mantine/core";
import {
  IconCalendarEvent,
  IconClock,
  IconBriefcase,
  IconUsers,
  IconArrowUpRight,
  IconArrowDownRight,
  IconChevronRight,
  IconHistory,
  IconDotsVertical,
  IconPlus,
} from "@tabler/icons-react";

const stats = [
  {
    label: "Total Interviews",
    value: "48",
    change: "+12%",
    positive: true,
    icon: <IconBriefcase size={22} />,
    color: "blue",
  },
  {
    label: "Candidates",
    value: "132",
    change: "+5%",
    positive: true,
    icon: <IconUsers size={22} />,
    color: "indigo",
  },
  {
    label: "Scheduled Today",
    value: "7",
    change: "+2",
    positive: true,
    icon: <IconCalendarEvent size={22} />,
    color: "teal",
  },
  {
    label: "Avg. Duration",
    value: "52m",
    change: "-3m",
    positive: false,
    icon: <IconClock size={22} />,
    color: "orange",
  },
];

const upcomingInterviews = [
  {
    candidate: "Sarah Chen",
    role: "Senior Frontend Engineer",
    time: "10:00 AM",
    type: "Technical Interview",
    status: "confirmed",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  },
  {
    candidate: "Marcus Oliveira",
    role: "Product Designer",
    time: "11:30 AM",
    type: "Portfolio Walkthrough",
    status: "confirmed",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
  },
  {
    candidate: "Anya Sharma",
    role: "Backend Engineer",
    time: "2:00 PM",
    type: "System Design Round",
    status: "pending",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anya",
  },
];

export default function DashboardPage() {
  return (
    <Container fluid p="xl" bg="gray.0" style={{ minHeight: "100vh" }}>
      <Stack gap="xl">
        {/* Header Section */}
        <Group justify="space-between" align="flex-end">
          <Box>
            <Title order={1} fw={800} size="h2">
              Recruitment Dashboard
            </Title>
            <Text c="dimmed" size="sm" fw={500}>
              Welcome back! Here's a summary of today's recruitment performance.
            </Text>
          </Box>
          <Group gap="md">
            <Button
              leftSection={<IconPlus size={16} />}
              radius="md"
              color="blue.9"
              px="xl"
            >
              Create New Role
            </Button>
          </Group>
        </Group>

        {/* Stats Grid */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="xl">
          {stats.map((stat, i) => (
            <Card key={i} p="xl" radius="xl" shadow="sm">
              <Group justify="space-between" mb="xs">
                <ThemeIcon
                  variant="light"
                  color={stat.color}
                  radius="md"
                  size="lg"
                >
                  {stat.icon}
                </ThemeIcon>
                <Badge
                  variant="transparent"
                  color={stat.positive ? "teal.6" : "red.6"}
                  leftSection={
                    stat.positive ? (
                      <IconArrowUpRight size={14} />
                    ) : (
                      <IconArrowDownRight size={14} />
                    )
                  }
                  p={0}
                >
                  {stat.change}
                </Badge>
              </Group>
              <Title order={3} fw={900} size="28px" mb={4}>
                {stat.value}
              </Title>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                {stat.label}
              </Text>
            </Card>
          ))}
        </SimpleGrid>

        <Grid gutter={40}>
          {/* Left Column: Today's Schedule */}
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Stack gap="xl">
              <Card p="xl" radius="xl" shadow="sm">
                <Group justify="space-between" mb="xl">
                  <Box>
                    <Title order={4} fw={800}>
                      Today's Schedule
                    </Title>
                    <Text size="xs" c="dimmed" fw={600}>
                      Monitor and manage all candidate interview sessions.
                    </Text>
                  </Box>
                  <Button variant="subtle" color="blue" size="xs" fw={700}>
                    VIEW ALL
                  </Button>
                </Group>

                <Stack gap="md">
                  {upcomingInterviews.map((item, i) => (
                    <Card key={i} p="lg" radius="lg" withBorder>
                      <Group justify="space-between">
                        <Group gap="lg">
                          <Avatar src={item.avatar} radius="xl" size="md" />
                          <Box>
                            <Text size="sm" fw={800}>
                              {item.candidate}
                            </Text>
                            <Text size="xs" c="dimmed" fw={600}>
                              {item.role}
                            </Text>
                          </Box>
                        </Group>
                        <Group gap={40}>
                          <Box>
                            <Text size="xs" fw={800} c="gray.6">
                              {i === 0 || i === 2 ? "Video Call" : "In-Person"}
                            </Text>
                            <Text size="xs" fw={700}>
                              {item.time} — {item.type}
                            </Text>
                          </Box>
                          <Group gap="xs">
                            <Badge
                              size="xs"
                              radius="sm"
                              color={
                                item.status === "confirmed"
                                  ? "teal.6"
                                  : "yellow.6"
                              }
                            >
                              {item.status}
                            </Badge>
                            <ActionIcon variant="subtle" color="gray">
                              <IconDotsVertical size={16} />
                            </ActionIcon>
                          </Group>
                        </Group>
                      </Group>
                    </Card>
                  ))}
                </Stack>
              </Card>

              <Card p="xl" radius="xl" shadow="sm">
                <Title order={4} fw={800} mb="xl">
                  Hiring Pipeline Overview
                </Title>
                <Stack gap="xl">
                  {[
                    {
                      label: "Applied",
                      value: 132,
                      color: "blue.9",
                      total: 132,
                    },
                    {
                      label: "Screening",
                      value: 64,
                      color: "blue.7",
                      total: 132,
                    },
                    {
                      label: "Technical",
                      value: 28,
                      color: "blue.4",
                      total: 132,
                    },
                    {
                      label: "Final Round",
                      value: 11,
                      color: "indigo.3",
                      total: 132,
                    },
                  ].map((stage, i) => (
                    <Box key={i}>
                      <Group justify="space-between" mb={8}>
                        <Text size="xs" fw={800} c="gray.7">
                          {stage.label}
                        </Text>
                        <Text size="xs" fw={900}>
                          {stage.value} Candidates
                        </Text>
                      </Group>
                      <Progress
                        value={(stage.value / stage.total) * 100}
                        color={stage.color}
                        size="lg"
                        radius="xl"
                      />
                    </Box>
                  ))}
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>

          {/* Right Column: Sidebar Widgets */}
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Stack gap="xl">
              <Card p="xl" radius="xl" shadow="sm">
                <Title order={5} fw={900} mb="xl">
                  RECENT CHANGES
                </Title>
                <Stack gap="lg">
                  {[
                    {
                      name: "Elena R.",
                      update: "Moved to Final Round",
                      time: "12m ago",
                      color: "blue",
                    },
                    {
                      name: "Marcus T.",
                      update: "New Application",
                      time: "1h ago",
                      color: "teal",
                    },
                    {
                      name: "Julia V.",
                      update: "Offer Accepted",
                      time: "3h ago",
                      color: "indigo",
                    },
                  ].map((item, i) => (
                    <Group key={i} gap="md">
                      <ThemeIcon
                        variant="light"
                        color={item.color}
                        size="md"
                        radius="md"
                      >
                        <IconHistory size={16} />
                      </ThemeIcon>
                      <Box style={{ flex: 1 }}>
                        <Group justify="space-between">
                          <Text size="xs" fw={800}>
                            {item.name}
                          </Text>
                          <Text size="10px" c="dimmed" fw={600}>
                            {item.time}
                          </Text>
                        </Group>
                        <Text size="10px" c="dimmed" fw={700}>
                          {item.update}
                        </Text>
                      </Box>
                    </Group>
                  ))}
                </Stack>
                <Button
                  fullWidth
                  mt="xl"
                  variant="subtle"
                  color="gray"
                  size="xs"
                  fw={700}
                >
                  VIEW ACTIVITY LOG
                </Button>
              </Card>

              <Card p="xl" radius="xl" shadow="sm" bg="blue.9" c="white">
                <Title order={6} fw={800} mb="lg">
                  WEEKLY EFFICIENCY
                </Title>
                <Text size="xs" c="blue.1" fw={500} mb="xl">
                  Great job! Your team has processed 24% more interviews than
                  last week.
                </Text>
                <Stack gap="xl">
                  <Box
                    style={{
                      borderLeft: "4px solid var(--mantine-color-blue-3)",
                      paddingLeft: "16px",
                    }}
                  >
                    <Text size="10px" fw={700} c="blue.2" tt="uppercase" mb={4}>
                      Avg Time to Hire
                    </Text>
                    <Text size="24px" fw={900}>
                      12 Days
                    </Text>
                  </Box>
                  <Box
                    style={{
                      borderLeft: "4px solid var(--mantine-color-teal-4)",
                      paddingLeft: "16px",
                    }}
                  >
                    <Text size="10px" fw={700} c="blue.2" tt="uppercase" mb={4}>
                      Recruitment Cost
                    </Text>
                    <Text size="24px" fw={900}>
                      $3,420
                    </Text>
                  </Box>
                </Stack>
              </Card>

              <Card p="xl" radius="xl" shadow="sm">
                <Title order={5} fw={800} mb="xl">
                  ACTIVE RECRUITERS
                </Title>
                <Stack gap="md">
                  {["Sarah Miller", "David Chen", "Mark Thompson"].map(
                    (name, i) => (
                      <Group key={i} justify="space-between">
                        <Group gap="sm">
                          <Avatar
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                            size="sm"
                            radius="xl"
                          />
                          <Text size="xs" fw={800}>
                            {name}
                          </Text>
                        </Group>
                        <Badge size="xs" radius="sm" color="blue.1" c="blue.9">
                          Active
                        </Badge>
                      </Group>
                    ),
                  )}
                </Stack>
                <Box
                  mt="xl"
                  pt="md"
                  style={{ borderTop: "1px solid var(--mantine-color-gray-1)" }}
                >
                  <AvatarGroup spacing="sm">
                    <Avatar size="sm" radius="xl">
                      +12
                    </Avatar>
                    <Text size="xs" fw={700} c="dimmed" ml="xs">
                      Others active
                    </Text>
                  </AvatarGroup>
                </Box>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
