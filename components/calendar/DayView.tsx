"use client";

import React, { useEffect, useState } from "react";
import { fetchRecentChanges } from "@/app/actions/get";
import {
  Badge,
  Box,
  Card,
  Group,
  Stack,
  Text,
  Title,
  Avatar,
  ThemeIcon,
  Grid,
} from "@mantine/core";
import {
  IconHistory,
  IconCalendar,
} from "@tabler/icons-react";


interface DayEvent {
  id: string;
  title: string;
  time: string;
  assigned: string;
  status: string;
  color: string;
  avatars: string[];
  candidateName: string;
  role: string;
  type: string;
  notes?: string;
  recordingLink?: string;
  meetingLink?: string;
  startDate: Date;
  endDate: Date;
}


interface DayData {
  date: string;
  day: string;
  month: string;
  events: DayEvent[];
}

interface DayViewProps {
  scheduleData: DayData[];
  onEventClick: (event: any) => void;
}

export default function DayView({ scheduleData, onEventClick }: DayViewProps) {
  const [recentChanges, setRecentChanges] = useState<any[]>([]);

  useEffect(() => {
    const getChanges = async () => {
      const result = await fetchRecentChanges();
      if (result.success && result.data) {
        setRecentChanges(result.data);
      }
    };
    getChanges();
  }, [scheduleData]);

  return (
    <Stack gap="xl">
        {scheduleData.length > 0 ? (
            scheduleData.map((day) => (
                <Group key={`${day.date}-${day.month}`} gap="xl" align="flex-start" wrap="nowrap">
                    <Stack align="center" gap={0} w={60}>
                        <Text fw={800} size="xl" c="var(--mantine-color-text)">{day.date}</Text>
                        <Text fw={800} size="xs" c="dimmed">{day.day}</Text>
                    </Stack>
                    <Stack gap="md" style={{ flex: 1 }}>
                        {day.events.length > 0 ? (
                            day.events.map((event) => (
                                <Card 
                                    key={event.id} 
                                    p="lg" 
                                    radius="lg" 
                                    shadow={event.status === "UPCOMING" ? "sm" : "none"}
                                    withBorder={false}
                                    onClick={() => onEventClick(event)}
                                    style={{ 
                                        cursor: "pointer",
                                        backgroundColor: event.status === "DONE" ? "var(--mantine-color-teal-light)" : 
                                                        event.status === "RESCHEDULED" ? "var(--mantine-color-gray-light)" : "var(--mantine-color-default-hover)",
                                        borderLeft: `4px solid var(--mantine-color-${event.color}-6)`,
                                        position: "relative"
                                    }}
                                >
                                    <Group justify="space-between">
                                        <Stack gap={4}>
                                            <Group gap="xs">
                                                <Badge size="xs" color={event.color} variant="filled" radius="sm">{event.status}</Badge>
                                                <Text size="xs" fw={700} c="dimmed">{event.time}</Text>
                                            </Group>
                                            <Title order={5} fw={800} c="var(--mantine-color-text)">{event.title}</Title>
                                            <Text size="xs" c="dimmed" fw={600}>Assigned to: {event.assigned}</Text>
                                        </Stack>
                                        <Group gap="xs">
                                            {event.id === "3" && <ThemeIcon variant="transparent" color="gray.6"><IconHistory size={16} /></ThemeIcon>}
                                            <Avatar.Group spacing="sm">
                                                {event.avatars.map((src, i) => (
                                                    <Avatar key={i} src={src} radius="xl" size="sm" />
                                                ))}
                                                {event.avatars.length > 2 && <Avatar radius="xl" size="sm" color="gray" fw={700} style={{ fontSize: "10px" }}>+3</Avatar>}
                                            </Avatar.Group>
                                        </Group>
                                    </Group>
                                </Card>
                            ))
                        ) : (
                            <Text size="sm" c="dimmed" py="xl">No events for this day.</Text>
                        )}
                    </Stack>
                </Group>
            ))
        ) : (
            <Card p={100} radius="xl" withBorder style={{ borderStyle: "dashed", backgroundColor: "transparent" }}>
                <Stack align="center" gap="md">
                    <ThemeIcon size={64} radius="xl" variant="light" color="blue">
                        <IconCalendar size={32} />
                    </ThemeIcon>
                    <Box ta="center">
                        <Title order={4} fw={800} c="var(--mantine-color-text)">Nothing Scheduled</Title>
                        <Text size="sm" c="dimmed">Your calendar is clear for this period.</Text>
                    </Box>
                </Stack>
            </Card>
        )}


        <Box mt={60}>
            <Title order={3} fw={800} mb="lg">Recent Changes</Title>
            <Card radius="lg" p={0} withBorder>
                <Box p="md" bg="var(--mantine-color-blue-light)" style={{ borderTopLeftRadius: "12px", borderTopRightRadius: "12px" }}>
                    <Grid>
                        <Grid.Col span={5}><Text size="xs" fw={800} c="blue.9" tt="uppercase">Details</Text></Grid.Col>
                        <Grid.Col span={3}><Text size="xs" fw={800} c="blue.9" tt="uppercase">Type</Text></Grid.Col>
                        <Grid.Col span={2}><Text size="xs" fw={800} c="blue.9" tt="uppercase">By</Text></Grid.Col>
                        <Grid.Col span={2} ta="right"><Text size="xs" fw={800} c="blue.9" tt="uppercase">Time</Text></Grid.Col>
                    </Grid>
                </Box>
                {recentChanges.length > 0 ? (
                    recentChanges.map((log) => (
                        <Box key={log.id} p="md" style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}>
                            <Grid align="center">
                                <Grid.Col span={5}>
                                    <Stack gap={2}>
                                        <Text size="sm" fw={700}>{log.candidate}</Text>
                                        <Text size="10px" c="dimmed" fw={500}>{log.description}</Text>
                                    </Stack>
                                </Grid.Col>
                                <Grid.Col span={3}>
                                    <Badge 
                                        size="xs" 
                                        variant="dot" 
                                        color={
                                            log.type === 'CREATED' ? 'teal' : 
                                            log.type === 'RESCHEDULED' ? 'orange' : 
                                            log.type === 'CANCELLED' ? 'red' : 
                                            'blue'
                                        }

                                    >
                                        {log.type}
                                    </Badge>
                                </Grid.Col>
                                <Grid.Col span={2}>
                                    <Text size="xs" c="dimmed" fw={600}>{log.user}</Text>
                                </Grid.Col>
                                <Grid.Col span={2} ta="right">
                                    <Text size="xs" fw={700}>{log.time}</Text>
                                </Grid.Col>
                            </Grid>
                        </Box>
                    ))
                ) : (

                    <Box p="xl" ta="center">
                        <Text size="sm" c="dimmed" fw={500}>No recent changes to display.</Text>
                    </Box>
                )}
            </Card>
        </Box>
    </Stack>
  );
}
