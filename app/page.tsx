"use client";

import {
  Badge,
  Box,
  Card,
  Grid,
  GridCol,
  Group,
  Progress,
  RingProgress,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconBriefcase,
  IconCalendarEvent,
  IconCheck,
  IconClock,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";

const stats = [
  {
    label: "Total Interviews",
    value: "48",
    change: "+12%",
    positive: true,
    icon: <IconBriefcase size={20} />,
    color: "blue",
  },
  {
    label: "Candidates",
    value: "132",
    change: "+5%",
    positive: true,
    icon: <IconUsers size={20} />,
    color: "violet",
  },
  {
    label: "Scheduled Today",
    value: "7",
    change: "+2",
    positive: true,
    icon: <IconCalendarEvent size={20} />,
    color: "teal",
  },
  {
    label: "Avg. Duration",
    value: "52m",
    change: "-3m",
    positive: false,
    icon: <IconClock size={20} />,
    color: "orange",
  },
];

const upcomingInterviews = [
  {
    candidate: "Sarah Chen",
    role: "Senior Frontend Engineer",
    time: "10:00 AM",
    type: "Technical",
    status: "confirmed",
  },
  {
    candidate: "Marcus Oliveira",
    role: "Product Designer",
    time: "11:30 AM",
    type: "Portfolio",
    status: "confirmed",
  },
  {
    candidate: "Anya Sharma",
    role: "Backend Engineer",
    time: "2:00 PM",
    type: "System Design",
    status: "pending",
  },
  {
    candidate: "James Whitfield",
    role: "Engineering Manager",
    time: "4:00 PM",
    type: "Leadership",
    status: "confirmed",
  },
];

const pipelineStages = [
  { label: "Applied", value: 132, color: "blue" },
  { label: "Screening", value: 64, color: "indigo" },
  { label: "Technical", value: 28, color: "violet" },
  { label: "Final Round", value: 11, color: "grape" },
  { label: "Offered", value: 5, color: "teal" },
];

export default function DashboardPage() {
  return (
    <Stack gap="lg">
      {/* Page Header */}
      <Box>
        <Title order={2}>Dashboard</Title>
        <Text c="dimmed" size="sm" mt={4}>
          Wednesday, March 18, 2026 — Here&apos;s what&apos;s on your plate today
        </Text>
      </Box>

      {/* Stats Row */}
      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="md">
        {stats.map((stat) => (
          <Card key={stat.label} padding="lg" withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="sm" c="dimmed" fw={500}>
                {stat.label}
              </Text>
              <ThemeIcon variant="light" color={stat.color} size="md" radius="md">
                {stat.icon}
              </ThemeIcon>
            </Group>
            <Text size="xl" fw={700} mb={4}>
              {stat.value}
            </Text>
            <Group gap={4}>
              <IconTrendingUp
                size={12}
                color={
                  stat.positive
                    ? "var(--mantine-color-teal-6)"
                    : "var(--mantine-color-red-6)"
                }
              />
              <Text
                size="xs"
                c={stat.positive ? "teal" : "red"}
                fw={500}
              >
                {stat.change} this week
              </Text>
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      {/* Main Grid */}
      <Grid gutter="md">
        {/* Today's Interviews */}
        <GridCol span={{ base: 12, md: 7 }}>
          <Card withBorder padding="lg" h="100%">
            <Group justify="space-between" mb="md">
              <Text fw={600} size="sm">
                Today&apos;s Interviews
              </Text>
              <Badge variant="light" color="blue" size="sm">
                {upcomingInterviews.length} scheduled
              </Badge>
            </Group>

            <Stack gap="sm">
              {upcomingInterviews.map((item) => (
                <Box
                  key={item.candidate}
                  p="sm"
                  style={{
                    borderRadius: "var(--mantine-radius-sm)",
                    border: "1px solid var(--mantine-color-default-border)",
                  }}
                >
                  <Group justify="space-between">
                    <Box>
                      <Text size="sm" fw={600}>
                        {item.candidate}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {item.role}
                      </Text>
                    </Box>
                    <Group gap="xs">
                      <Badge
                        variant="dot"
                        color={item.status === "confirmed" ? "teal" : "yellow"}
                        size="sm"
                      >
                        {item.status}
                      </Badge>
                      <Box ta="right">
                        <Text size="sm" fw={500}>
                          {item.time}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {item.type}
                        </Text>
                      </Box>
                    </Group>
                  </Group>
                </Box>
              ))}
            </Stack>
          </Card>
        </GridCol>

        {/* Pipeline Summary */}
        <GridCol span={{ base: 12, md: 5 }}>
          <Card withBorder padding="lg" h="100%">
            <Text fw={600} size="sm" mb="md">
              Hiring Pipeline
            </Text>
            <Stack gap="md">
              {pipelineStages.map((stage) => (
                <Box key={stage.label}>
                  <Group justify="space-between" mb={6}>
                    <Text size="sm" c="dimmed">
                      {stage.label}
                    </Text>
                    <Text size="sm" fw={600}>
                      {stage.value}
                    </Text>
                  </Group>
                  <Progress
                    value={(stage.value / 132) * 100}
                    color={stage.color}
                    radius="xl"
                    size="sm"
                  />
                </Box>
              ))}
            </Stack>

            <Box mt="xl" ta="center">
              <RingProgress
                size={120}
                thickness={10}
                roundCaps
                sections={[
                  { value: 38, color: "teal" },
                  { value: 22, color: "blue" },
                  { value: 40, color: "gray" },
                ]}
                label={
                  <Stack gap={2} align="center">
                    <Text size="xs" fw={700}>
                      62%
                    </Text>
                    <Text size="xs" c="dimmed">
                      fill rate
                    </Text>
                  </Stack>
                }
              />
            </Box>
          </Card>
        </GridCol>
      </Grid>
    </Stack>
  );
}
