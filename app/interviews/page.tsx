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
  Tabs,
  ThemeIcon,
  AvatarGroup,
  Loader,
  Center,
} from "@mantine/core";
import {
  IconBriefcase,
  IconVideo,
  IconClock,
  IconCalendarEvent,
  IconDotsVertical,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isToday from "dayjs/plugin/isToday";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

import InterviewReviewModal from "@/components/calendar/InterviewReviewModal";
import { CalendarEvent } from "@/lib/types/interview";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchInterviews, setActiveTab, setSelectedInterview } from "@/lib/store/interviewSlice";

// Register dayjs plugins
dayjs.extend(isBetween);
dayjs.extend(isToday);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export default function InterviewsPage() {
  const dispatch = useAppDispatch();
  const { items: events, loading, activeTab, selectedInterview } = useAppSelector((state) => state.interviews);

  useEffect(() => {
    if (events.length === 0) dispatch(fetchInterviews());
  }, [dispatch, events.length]);

  const stats = useMemo(() => {
    return {
      today: events.filter(e => dayjs(e.start).isToday()).length,
      thisWeek: events.filter(e => dayjs(e.start).isBetween(dayjs().startOf("week"), dayjs().endOf("week"), null, "[]")).length,
      upcoming: events.filter(e => dayjs(e.start).isAfter(dayjs())).length,
    };
  }, [events]);

  const filteredSessions = useMemo(() => {
    const now = dayjs();
    const startOfWeek = now.startOf("week");
    const endOfWeek = now.endOf("week");

    switch (activeTab) {
      case "today":
        return events.filter(e => dayjs(e.start).isToday());
      case "this-week":
        return events.filter(e => dayjs(e.start).isBetween(startOfWeek, endOfWeek, null, "[]"));
      case "upcoming":
        return events.filter(e => dayjs(e.start).isAfter(now));
      case "past":
        return events.filter(e => dayjs(e.start).isBefore(now));
      default:
        return events;
    }
  }, [events, activeTab]);

  const handleCardClick = (event: CalendarEvent) => {
    dispatch(setSelectedInterview(event));
  };

  const handleCloseModal = () => {
      dispatch(setSelectedInterview(null));
  };

  const modalCandidate = useMemo(() => {
      if (!selectedInterview) return null;
      return {
        name: selectedInterview.extendedProps.candidate,
        role: selectedInterview.extendedProps.role,
        avatar: selectedInterview.extendedProps.avatar,
        status: selectedInterview.extendedProps.status,
        time: `${dayjs(selectedInterview.start).format("hh:mm A")} - ${dayjs(selectedInterview.end).format("hh:mm A")}`,
        type: selectedInterview.extendedProps.type,
        assignedHR: selectedInterview.extendedProps.interviewer,
        notes: "Real-time session details synchronized with the global interview management state."
      };
  }, [selectedInterview]);

  return (
    <Container fluid p="xl" bg="transparent" style={{ minHeight: "100vh" }}>
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="flex-end">
          <Box>
            <Title order={1} fw={800} size="h2">Interview Sessions</Title>
            <Text c="dimmed" size="sm" fw={500}>Monitor and manage all candidate interview sessions.</Text>
          </Box>
          <Group gap="md">
            <Button leftSection={<IconCalendarEvent size={16} />} radius="md" color="blue.9" px="xl">
              Schedule New Session
            </Button>
          </Group>
        </Group>

        <Grid gutter={40}>
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Stack gap="xl">
                <Tabs value={activeTab} onChange={(val) => dispatch(setActiveTab(val || "today"))} color="blue" variant="pills" radius="md">
                    <Tabs.List>
                        <Tabs.Tab value="today" fw={700}>Today ({stats.today})</Tabs.Tab>
                        <Tabs.Tab value="this-week" fw={700}>This Week ({stats.thisWeek})</Tabs.Tab>
                        <Tabs.Tab value="upcoming" fw={700}>Upcoming ({stats.upcoming})</Tabs.Tab>
                        <Tabs.Tab value="past" fw={700}>Past Interviews</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value={activeTab} pt="xl">
                        <Stack gap="md">
                            {loading ? (
                                <Center py={100}><Loader color="blue" variant="dots" /></Center>
                            ) : filteredSessions.length > 0 ? (
                                filteredSessions.map(session => (
                                    <Card 
                                        key={session.id} 
                                        p="xl" 
                                        radius="xl" 
                                        shadow="sm" 
                                        withBorder={false} 
                                        onClick={() => handleCardClick(session)}
                                        style={{ 
                                          cursor: "pointer", 
                                          borderLeft: `6px solid ${session.backgroundColor || 'var(--mantine-color-blue-6)'}` 
                                        }}
                                    >
                                        <Grid align="center" gutter={30}>
                                            <Grid.Col span={4}>
                                                <Group gap="md">
                                                    <Avatar src={session.extendedProps.avatar} radius="xl" size="md" />
                                                    <Box>
                                                        <Text size="sm" fw={800}>{session.extendedProps.candidate}</Text>
                                                        <Text size="10px" c="dimmed" fw={600}>{session.extendedProps.role}</Text>
                                                    </Box>
                                                </Group>
                                            </Grid.Col>
                                            <Grid.Col span={3}>
                                                <Stack gap={4}>
                                                    <Text size="xs" fw={800} c="gray.6">{session.extendedProps.type}</Text>
                                                    <Group gap={6}>
                                                        <IconVideo size={14} color="#adb5bd"/>
                                                        <Text size="xs" fw={700}>Zoom Meet</Text>
                                                    </Group>
                                                </Stack>
                                            </Grid.Col>
                                            <Grid.Col span={3}>
                                                <Stack gap={4}>
                                                    <Text size="xs" fw={800} c="gray.6">
                                                      {dayjs(session.start).format("hh:mm A")}
                                                    </Text>
                                                    <Group gap={6}>
                                                        <IconClock size={14} color="#adb5bd"/>
                                                        <Text size="xs" fw={700}>Interviewer: {session.extendedProps.interviewer}</Text>
                                                    </Group>
                                                </Stack>
                                            </Grid.Col>
                                            <Grid.Col span={2}>
                                                <Group justify="flex-end" gap="xs">
                                                    <Badge 
                                                        size="xs" 
                                                        radius="sm" 
                                                        color={session.backgroundColor}
                                                        variant="light"
                                                    >
                                                        {session.extendedProps.status}
                                                    </Badge>
                                                    <ActionIcon variant="subtle" color="gray"><IconDotsVertical size={16}/></ActionIcon>
                                                </Group>
                                            </Grid.Col>
                                        </Grid>
                                    </Card>
                                ))
                            ) : (
                                <Card p={80} radius="xl" withBorder style={{ borderStyle: "dashed" }}>
                                    <Stack align="center" gap="md">
                                        <ThemeIcon size={64} radius="xl" variant="light" color="gray.4">
                                            <IconCalendarEvent size={32} color="gray" />
                                        </ThemeIcon>
                                        <Box ta="center">
                                            <Title order={4} fw={800}>No Sessions Found</Title>
                                            <Text size="sm" c="dimmed" fw={500}>There are no interviews scheduled for this period.</Text>
                                        </Box>
                                        <Button variant="light" color="blue" radius="md">
                                            Clear Filters
                                        </Button>
                                    </Stack>
                                </Card>
                            )}
                        </Stack>
                    </Tabs.Panel>
                </Tabs>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Stack gap="xl">
                <Card p="xl" radius="xl" shadow="sm">
                    <Title order={5} fw={800} mb="xl">SESSION INSIGHTS</Title>
                    <Stack gap="xl">
                        <Box style={{ borderLeft: "4px solid var(--mantine-color-blue-9)", paddingLeft: "16px" }}>
                            <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={4}>Interviews Today</Text>
                            <Text size="24px" fw={900}>{stats.today} Sessions</Text>
                            <Text size="10px" fw={700} c="teal.6">Real-time Data</Text>
                        </Box>
                        <Box style={{ borderLeft: "4px solid var(--mantine-color-teal-6)", paddingLeft: "16px" }}>
                            <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={4}>Planned This Week</Text>
                            <Text size="24px" fw={900}>{stats.thisWeek} Sessions</Text>
                        </Box>
                    </Stack>
                </Card>

                <Card p="xl" radius="xl" shadow="sm" bg="teal.6" c="white">
                    <Group gap="sm" mb="md">
                        <ThemeIcon size="lg" radius="md" color="teal.4"><IconBriefcase size={20}/></ThemeIcon>
                        <Title order={6} fw={800}>Staff Availability</Title>
                    </Group>
                    <Text size="xs" c="teal.0" fw={500} mb="xl">
                        Ensure you have enough interviewers available for upcoming priority rounds.
                    </Text>
                    <AvatarGroup spacing="sm">
                        <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" size="sm" radius="xl" />
                        <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=David" size="sm" radius="xl" />
                        <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=HR" size="sm" radius="xl" />
                        <Avatar size="sm" radius="xl">+5</Avatar>
                    </AvatarGroup>
                    <Button fullWidth mt="xl" radius="md" color="teal.8" fw={700}>Check Full Schedule</Button>
                </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>

      <InterviewReviewModal 
        opened={!!selectedInterview} 
        onClose={handleCloseModal} 
        candidate={modalCandidate} 
      />
    </Container>
  );
}
