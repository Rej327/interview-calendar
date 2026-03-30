"use client";

import React, { useMemo, useEffect } from "react";
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
  Center,
  Loader,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconCalendarEvent,
  IconClock,
  IconBriefcase,
  IconUsers,
  IconArrowUpRight,
  IconArrowDownRight,
  IconDotsVertical,
  IconPlus,
  IconSettings,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchEvents } from "@/lib/store/calendarSlice";
import { fetchCandidates } from "@/lib/store/candidatesSlice";
import { fetchRolesAsync } from "@/lib/store/rolesSlice";
import RoleModal from "@/components/calendar/RoleModal";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { events, loading: eventsLoading } = useAppSelector(
    (state) => state.calendar,
  );
  const { candidates, loading: candidatesLoading } = useAppSelector(
    (state) => state.candidates,
  );
  const { items: roles, loading: rolesLoading } = useAppSelector(
    (state) => state.roles,
  );
  const [roleModalOpened, { open: openRoleModal, close: closeRoleModal }] =
    useDisclosure(false);

  const router = useRouter();
  useEffect(() => {
    // Only fetch if data is empty or we specifically want to refresh on mount
    if (events.length === 0) dispatch(fetchEvents());
    if (candidates.length === 0) dispatch(fetchCandidates());
    if (roles.length === 0) dispatch(fetchRolesAsync());
  }, [dispatch, events.length, candidates.length, roles.length]);

  const stats = useMemo(() => {
    const todayCount = events.filter((e) =>
      dayjs(e.start).isSame(dayjs(), "day"),
    ).length;

    // Calculate avg duration
    let totalMinutes = 0;
    events.forEach((e) => {
      totalMinutes += dayjs(e.end).diff(dayjs(e.start), "minute");
    });
    const avgDuration =
      events.length > 0 ? Math.round(totalMinutes / events.length) : 0;

    return [
      {
        label: "Total Interviews",
        value: events.length.toString(),
        change: "+5%",
        positive: true,
        icon: <IconBriefcase size={22} />,
        color: "blue",
      },
      {
        label: "Candidates",
        value: candidates.length.toString(),
        change: "+12%",
        positive: true,
        icon: <IconUsers size={22} />,
        color: "indigo",
      },
      {
        label: "Scheduled Today",
        value: todayCount.toString(),
        change: todayCount > 0 ? "+2" : "0",
        positive: true,
        icon: <IconCalendarEvent size={22} />,
        color: "teal",
      },
      {
        label: "Avg. Duration",
        value: `${avgDuration}m`,
        change: "-2m",
        positive: false,
        icon: <IconClock size={22} />,
        color: "orange",
      },
      {
        label: "Active Roles",
        value: roles.length.toString(),
        change: "+2",
        positive: true,
        icon: <IconSettings size={22} />,
        color: "violet",
      },
    ];
  }, [events, candidates, roles]);

  const todaySchedule = useMemo(() => {
    return events
      .filter((e) => dayjs(e.start).isSame(dayjs(), "day"))
      .sort((a, b) => dayjs(a.start).diff(dayjs(b.start)));
  }, [events]);

  const pipeline = useMemo(() => {
    const total = candidates.length;
    const hired = candidates.filter((c: any) => c.status === "HIRED").length;
    const active = candidates.filter((c: any) => c.status === "ACTIVE").length;
    const rejected = candidates.filter(
      (c: any) => c.status === "REJECTED",
    ).length;

    return [
      { label: "Total Candidates", value: total, color: "blue.9", total },
      { label: "Active Pipeline", value: active, color: "blue.7", total },
      { label: "Hired", value: hired, color: "teal.6", total },
      { label: "Rejected", value: rejected, color: "red.4", total },
    ];
  }, [candidates]);

  const activeRecruiters = useMemo(() => {
    const uniqueMap = new Map();
    events.forEach((e) => {
      const name = e.extendedProps?.interviewer;
      if (name && !uniqueMap.has(name)) {
        uniqueMap.set(name, {
          name,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s+/g, '')}`
        });
      }
    });
    return Array.from(uniqueMap.values());
  }, [events]);

  if (eventsLoading || candidatesLoading) {
    return (
      <Center h="100vh">
        <Loader color="blue" variant="dots" />
      </Center>
    );
  }

  return (
    <Container fluid p="xl" bg="transparent" style={{ minHeight: "100vh" }}>
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
              component={Link}
              href="/roles"
              variant="outline"
              color="gray.4"
              c="gray.7"
              radius="md"
              px="xl"
              leftSection={<IconBriefcase size={16} />}
            >
              View All Roles
            </Button>
            <Button
              leftSection={<IconPlus size={16} />}
              radius="md"
              color="blue.9"
              px="xl"
              onClick={openRoleModal}
            >
              Create New Role
            </Button>
          </Group>
        </Group>

        {/* Stats Grid */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }} spacing="xl">
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
                  <Button
                    onClick={() => router.push("/calendar")}
                    variant="subtle"
                    color="blue"
                    size="xs"
                    fw={700}
                  >
                    VIEW ALL
                  </Button>
                </Group>

                <Stack gap="md">
                  {todaySchedule.length > 0 ? (
                    todaySchedule.map((item) => (
                      <Card key={item.id} p="lg" radius="lg" withBorder>
                        <Group justify="space-between">
                          <Group gap="lg">
                            <Avatar
                              src={item.extendedProps.avatar}
                              radius="xl"
                              size="md"
                            />
                            <Box>
                              <Text size="sm" fw={800}>
                                {item.extendedProps.candidate}
                              </Text>
                              <Text size="xs" c="dimmed" fw={600}>
                                {item.extendedProps.role}
                              </Text>
                            </Box>
                          </Group>
                          <Group gap={40}>
                            <Box>
                              <Text size="xs" fw={800} c="gray.6">
                                {item.extendedProps.type}
                              </Text>
                              <Text size="xs" fw={700}>
                                {dayjs(item.start).format("hh:mm A")} —{" "}
                                {item.title}
                              </Text>
                            </Box>
                            <Group gap="xs">
                              <Badge
                                size="xs"
                                radius="sm"
                                color={
                                  item.extendedProps.status === "COMPLETED"
                                    ? "teal.6"
                                    : "yellow.6"
                                }
                              >
                                {item.extendedProps.status}
                              </Badge>
                            </Group>
                          </Group>
                        </Group>
                      </Card>
                    ))
                  ) : (
                    <Center py={40}>
                      <Text c="dimmed" fw={500}>
                        No interviews scheduled for today.
                      </Text>
                    </Center>
                  )}
                </Stack>
              </Card>

              <Card p="xl" radius="xl" shadow="sm">
                <Title order={4} fw={800} mb="xl">
                  Hiring Pipeline Overview
                </Title>
                <Stack gap="xl">
                  {pipeline.map((stage, i) => (
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
                        value={
                          stage.total > 0
                            ? (stage.value / stage.total) * 100
                            : 0
                        }
                        color={stage.color}
                        size="lg"
                        radius="xl"
                      />
                    </Box>
                  ))}
                </Stack>
              </Card>

              <Card p="xl" radius="xl" shadow="sm">
                <Group justify="space-between" mb="xl">
                  <Title order={4} fw={800}>
                    Open Roles
                  </Title>
                  <Button
                    component={Link}
                    href="/roles"
                    variant="subtle"
                    color="blue"
                    size="xs"
                    fw={700}
                  >
                    VIEW ALL
                  </Button>
                </Group>
                <Stack gap="md">
                  {roles.slice(0, 3).map((role) => (
                    <Group key={role.role_id} justify="space-between">
                      <Box>
                        <Text size="sm" fw={800}>
                          {role.role_title}
                        </Text>
                        <Text size="xs" c="dimmed" fw={600}>
                          {role.role_department}
                        </Text>
                      </Box>
                      <Badge variant="light" color="blue" size="sm">
                        Active
                      </Badge>
                    </Group>
                  ))}
                  {roles.length === 0 && !rolesLoading && (
                    <Text size="xs" c="dimmed" ta="center" py="md">
                      No active roles found.
                    </Text>
                  )}
                  {rolesLoading && (
                    <Center py="md">
                      <Loader size="sm" />
                    </Center>
                  )}
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>

          {/* Right Column: Sidebar Widgets */}
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Stack gap="xl">
              <Card p="xl" radius="xl" shadow="sm" bg="blue.9" c="white">
                <Title order={6} fw={800} mb="lg">
                  WEEKLY EFFICIENCY
                </Title>
                <Text size="xs" c="blue.1" fw={500} mb="xl">
                  Performance summary based on {events.length} system entries.
                </Text>
                <Stack gap="xl">
                  <Box
                    style={{
                      borderLeft: "4px solid var(--mantine-color-blue-3)",
                      paddingLeft: "16px",
                    }}
                  >
                    <Text size="10px" fw={700} c="blue.2" tt="uppercase" mb={4}>
                      Completed This Month
                    </Text>
                    <Text size="24px" fw={900}>
                      {
                        events.filter(
                          (e) =>
                            dayjs(e.start).isSame(dayjs(), "month") &&
                            e.extendedProps.status === "COMPLETED",
                        ).length
                      }
                    </Text>
                  </Box>
                  <Box
                    style={{
                      borderLeft: "4px solid var(--mantine-color-teal-4)",
                      paddingLeft: "16px",
                    }}
                  >
                    <Text size="10px" fw={700} c="blue.2" tt="uppercase" mb={4}>
                      Avg. Preparation Time
                    </Text>
                    <Text size="24px" fw={900}>
                      15m
                    </Text>
                  </Box>
                </Stack>
              </Card>

              <Card p="xl" radius="xl" shadow="sm">
                <Title order={5} fw={800} mb="xl">
                  ACTIVE RECRUITERS
                </Title>
                <Stack gap="md">
                  {activeRecruiters.slice(0, 3).map(
                    (recruiter, i) => (
                      <Group key={i} justify="space-between">
                        <Group gap="sm">
                          <Avatar
                            src={recruiter.avatar}
                            size="sm"
                            radius="xl"
                          />
                          <Text size="xs" fw={800}>
                            {recruiter.name}
                          </Text>
                        </Group>
                        <Badge size="xs" radius="sm" color="blue.1" c="blue.9">
                          Active
                        </Badge>
                      </Group>
                    ),
                  )}
                  {activeRecruiters.length === 0 && (
                    <Center py="sm">
                        <Text size="xs" c="dimmed" fw={600}>No active recruiters found.</Text>
                    </Center>
                  )}
                </Stack>
                {activeRecruiters.length > 3 && (
                  <Box
                    mt="xl"
                    pt="md"
                    style={{ borderTop: "1px solid var(--mantine-color-gray-1)" }}
                  >
                    <AvatarGroup spacing="sm">
                      <Avatar size="sm" radius="xl">
                        +{activeRecruiters.length - 3}
                      </Avatar>
                      <Text size="xs" fw={700} c="dimmed" ml="xs">
                        Team members active
                      </Text>
                    </AvatarGroup>
                  </Box>
                )}
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
      <RoleModal opened={roleModalOpened} onClose={closeRoleModal} />
    </Container>
  );
}
