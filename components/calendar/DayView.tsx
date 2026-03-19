"use client";

import React from "react";
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
  return (
    <Stack gap="xl">
        {scheduleData.length > 0 ? (
            scheduleData.map((day) => (
                <Group key={day.date} gap="xl" align="flex-start" wrap="nowrap">
                    <Stack align="center" gap={0} w={60}>
                        <Text fw={800} size="xl" c="blue.9">{day.date}</Text>
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
                                        backgroundColor: event.status === "DONE" ? "var(--mantine-color-teal-0)" : 
                                                        event.status === "RESCHEDULED" ? "var(--mantine-color-gray-0)" : "white",
                                        borderLeft: `4px solid var(--mantine-color-${event.color}-6)`,
                                        position: "relative"
                                    }}
                                >
                                    <Group justify="space-between">
                                        <Stack gap={4}>
                                            <Group gap="xs">
                                                <Badge size="xs" color={event.color} variant="filled" radius="sm">{event.status}</Badge>
                                                <Text size="xs" fw={700} c="gray.7">{event.time}</Text>
                                            </Group>
                                            <Title order={5} fw={800}>{event.title}</Title>
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
            <Card p={100} radius="xl" withBorder style={{ borderStyle: "dashed" }}>
                <Stack align="center" gap="md">
                    <ThemeIcon size={64} radius="xl" variant="light" color="blue">
                        <IconCalendar size={32} />
                    </ThemeIcon>
                    <Box ta="center">
                        <Title order={4} fw={800}>Nothing Scheduled</Title>
                        <Text size="sm" c="dimmed">Your calendar is clear for this period.</Text>
                    </Box>
                </Stack>
            </Card>
        )}


        <Box mt={60}>
            <Title order={3} fw={800} mb="lg">Recent Changes</Title>
            <Card radius="lg" p={0} withBorder>
                <Box p="md" bg="blue.0" style={{ borderTopLeftRadius: "12px", borderTopRightRadius: "12px" }}>
                    <Grid>
                        <Grid.Col span={3}><Text size="xs" fw={800} c="blue.9" tt="uppercase">Candidate</Text></Grid.Col>
                        <Grid.Col span={3}><Text size="xs" fw={800} c="blue.9" tt="uppercase">Update Type</Text></Grid.Col>
                        <Grid.Col span={3}><Text size="xs" fw={800} c="blue.9" tt="uppercase">Modified By</Text></Grid.Col>
                        <Grid.Col span={3} ta="right"><Text size="xs" fw={800} c="blue.9" tt="uppercase">Time</Text></Grid.Col>
                    </Grid>
                </Box>
                <Box p="xl" ta="center">
                    <Text size="sm" c="dimmed" fw={500}>No recent changes to display.</Text>
                </Box>
            </Card>
        </Box>
    </Stack>
  );
}
