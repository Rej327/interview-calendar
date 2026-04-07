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
  IconPackageOff,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isToday from "dayjs/plugin/isToday";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

import InterviewReviewModal from "@/components/calendar/InterviewReviewModal";
import { CalendarEvent } from "@/lib/types/interview";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchInterviews, setActiveTab, setSelectedInterview } from "@/lib/store/interviewSlice";
import ScheduleSessionModal from "@/components/interviews/ScheduleSessionModal";
import { useRouter } from "next/navigation";

// Register dayjs plugins
dayjs.extend(isBetween);
dayjs.extend(isToday);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export default function InterviewsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items: events, loading, activeTab, selectedInterview } = useAppSelector((state) => state.interviews);
  const [scheduleOpened, { open: openSchedule, close: closeSchedule }] = useDisclosure(false);

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
        id: selectedInterview.id,
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
    <Container fluid p="xl" bg="transparent" style={{ minHeight: "100vh" }} className="animate-in">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="flex-end">
          <Box>
            <Badge color="teal.4" variant="light" size="sm" mb={4} radius="sm">
               SESSION ORCHESTRATION
            </Badge>
            <Title order={1} fw={900} size="h1" style={{ letterSpacing: '-0.5px' }}>
               Interview Sessions
            </Title>
            <Text c="dimmed" size="sm" fw={600}>Monitor and manage all candidate interview sessions in real-time.</Text>
          </Box>
          <Group gap="md">
            <Button 
                leftSection={<IconCalendarEvent size={18} />} 
                radius="md" 
                color="blue.9" 
                px="xl" 
                h={48} 
                onClick={openSchedule}
                style={{ boxShadow: '0 4px 12px rgba(34, 139, 230, 0.25)' }}
            >
              Schedule New Session
            </Button>
          </Group>
        </Group>

        <Grid gutter={40}>
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Stack gap="xl">
                <Tabs value={activeTab} onChange={(val) => dispatch(setActiveTab(val || "today"))} color="blue" variant="pills" radius="md">
                    <Tabs.List>
                        <Tabs.Tab value="today" fw={800} px="xl">Today <Badge ml={8} variant="light" size="xs">{stats.today}</Badge></Tabs.Tab>
                        <Tabs.Tab value="this-week" fw={800} px="xl">Weekly <Badge ml={8} variant="light" size="xs">{stats.thisWeek}</Badge></Tabs.Tab>
                        <Tabs.Tab value="upcoming" fw={800} px="xl">Upcoming <Badge ml={8} variant="light" size="xs">{stats.upcoming}</Badge></Tabs.Tab>
                        <Tabs.Tab value="past" fw={800} px="xl">Archived</Tabs.Tab>
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
                                        className="glass-card"
                                        onClick={() => handleCardClick(session)}
                                        style={{ 
                                          cursor: "pointer", 
                                          borderLeft: `6px solid ${session.backgroundColor || 'var(--mantine-color-blue-6)'}`,
                                          borderTop: 'none', borderRight: 'none', borderBottom: 'none'
                                        }}
                                    >
                                        <Grid align="center" gutter={34}>
                                            <Grid.Col span={4}>
                                                <Group gap="md">
                                                    <Avatar src={session.extendedProps.avatar} radius="xl" size="lg" style={{ border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                                                    <Box>
                                                        <Text size="sm" fw={900}>{session.extendedProps.candidate}</Text>
                                                        <Text size="xs" c="blue.7" fw={700}>{session.extendedProps.role}</Text>
                                                    </Box>
                                                </Group>
                                            </Grid.Col>
                                            <Grid.Col span={3}>
                                                <Stack gap={4}>
                                                    <Text size="xs" fw={800} c="dimmed">SESSION TYPE</Text>
                                                    <Group gap={6}>
                                                        <ThemeIcon size={20} radius="xl" variant="light" color="indigo">
                                                          <IconVideo size={12} />
                                                        </ThemeIcon>
                                                        <Text size="xs" fw={800}>{session.extendedProps.type}</Text>
                                                    </Group>
                                                </Stack>
                                            </Grid.Col>
                                            <Grid.Col span={3}>
                                                <Stack gap={4}>
                                                    <Text size="xs" fw={800} c="dimmed">SCHEDULED BY</Text>
                                                    <Group gap={6}>
                                                        <IconClock size={14} color="var(--mantine-color-blue-6)"/>
                                                        <Text size="xs" fw={800}>{session.extendedProps.interviewer}</Text>
                                                    </Group>
                                                </Stack>
                                            </Grid.Col>
                                            <Grid.Col span={2}>
                                                <Stack gap="xs" align="flex-end">
                                                     <Text size="sm" fw={900} c="dimmed">
                                                      {dayjs(session.start).format("hh:mm A")}
                                                    </Text>
                                                    <Badge 
                                                        size="sm" 
                                                        radius="md" 
                                                        color={session.backgroundColor}
                                                        variant="light"
                                                        h={24}
                                                    >
                                                        {session.extendedProps.status}
                                                    </Badge>
                                                </Stack>
                                            </Grid.Col>
                                        </Grid>
                                    </Card>
                                ))
                            ) : (
                                <div style={{ padding: '100px 0', textAlign: "center", border: '2px dashed rgba(0,0,0,0.05)', borderRadius: '24px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ padding: '16px', borderRadius: '100px', backgroundColor: 'var(--mantine-color-gray-1)', color: 'var(--mantine-color-gray-6)', display: 'flex', alignItems: 'center' }}>
                                            <IconPackageOff size={32} />
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, fontWeight: 900, fontSize: 'var(--mantine-font-size-lg)', color: 'var(--mantine-color-text)' }}>Strategic Registry Clear</h4>
                                            <p style={{ margin: '4px 0 0', fontSize: 'var(--mantine-font-size-xs)', fontWeight: 700, color: 'var(--mantine-color-dimmed)' }}>Operational interview sessions currently yielding no tactical records for this period.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Stack>
                    </Tabs.Panel>
                </Tabs>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Stack gap="xl">
                <Card p="xl" radius="xl" className="glass-card">
                    <Title order={5} fw={900} mb="xl">SESSION INSIGHTS</Title>
                    <Stack gap="xl">
                        <Box style={{ borderLeft: "4px solid var(--mantine-color-blue-6)", paddingLeft: "16px" }}>
                            <Text size="xs" fw={800} c="dimmed" tt="uppercase" mb={4}>Interviews Today</Text>
                            <Text size="28px" fw={900}>{stats.today} Active</Text>
                            <Text size="10px" fw={800} c="teal.6">REAL-TIME DATA FEED</Text>
                        </Box>
                        <Box style={{ borderLeft: "4px solid #51cf66", paddingLeft: "16px" }}>
                            <Text size="xs" fw={800} c="dimmed" tt="uppercase" mb={4}>Planned This Week</Text>
                            <Text size="28px" fw={900}>{stats.thisWeek} Sessions</Text>
                        </Box>
                    </Stack>
                </Card>

                <Card p="xl" radius="xl" bg="teal.9" c="white" style={{ position: 'relative', overflow: 'hidden' }}>
                    <Box style={{ position: 'absolute', top: -30, left: -30, width: 100, height: 100, background: 'rgba(255,255,255,0.05)', borderRadius: '100px' }} />
                    <Group gap="sm" mb="lg">
                        <ThemeIcon size="lg" radius="md" color="teal.5"><IconBriefcase size={20}/></ThemeIcon>
                        <Title order={6} fw={900}>Staff Availability</Title>
                    </Group>
                    <Text size="xs" c="teal.1" fw={600} mb="xl" style={{ lineHeight: 1.6 }}>
                        Ensure you have enough interviewers available for upcoming priority rounds. Current staff capacity is high.
                    </Text>
                    <AvatarGroup spacing="sm">
                        <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" size="md" radius="xl" style={{ border: '2px solid var(--mantine-color-teal-9)' }} />
                        <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=David" size="md" radius="xl" style={{ border: '2px solid var(--mantine-color-teal-9)' }} />
                        <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=HR" size="md" radius="xl" style={{ border: '2px solid var(--mantine-color-teal-9)' }} />
                        <Avatar size="md" radius="xl" style={{ border: '2px solid var(--mantine-color-teal-9)' }}>+5</Avatar>
                    </AvatarGroup>
                    <Button fullWidth mt="xl" radius="md" color="teal.7" h={45} fw={800} onClick={() => router.push("/calendar")}>Verify Schedule</Button>
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
      <ScheduleSessionModal opened={scheduleOpened} onClose={closeSchedule} />
    </Container>
  );
}
