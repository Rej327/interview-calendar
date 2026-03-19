"use client";

import React from "react";
import {
  Box,
  Card,
  Group,
  Stack,
  Text,
  Title,
  Button,
  ActionIcon,
  Grid,
  Avatar,
  Badge,
} from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconCalendar,
  IconDots,
} from "@tabler/icons-react";

interface MonthViewProps {
  onEventClick: (event: any) => void;
}

export default function MonthView({ onEventClick }: MonthViewProps) {
    const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const days = Array.from({ length: 35 }, (_, i) => {
        const d = i - 1; // Start from Sep 29
        return {
            date: d <= 0 ? (30 + d) : (d > 31 ? d - 31 : d),
            isCurrentMonth: d > 0 && d <= 31,
            isToday: d === 8,
            events: d === 1 ? [
                { time: "10:00 AM", name: "Sarah Jen", color: "blue" },
                { time: "02:30 PM", name: "Marc Rus", color: "blue" }
            ] : d === 8 ? [
                { time: "09:00 AM", name: "Review S", color: "teal" },
                { time: "11:30 AM", name: "Alex Chen", color: "blue.9" },
                { time: "03:00 PM", name: "Maria Gar", color: "blue.9" }
            ] : d === 17 ? [
                { time: "All Day", name: "Global Sync", color: "teal" }
            ] : []
        };
    });

    return (
        <Stack gap="xl">
            <Group justify="space-between">
                <Title order={4} fw={800}>October 2024</Title>
                <Group gap={4}>
                    <ActionIcon variant="subtle" color="gray" size="sm"><IconChevronLeft size={16}/></ActionIcon>
                    <Button variant="subtle" color="gray" size="xs" fw={700}>TODAY</Button>
                    <ActionIcon variant="subtle" color="gray" size="sm"><IconChevronRight size={16}/></ActionIcon>
                </Group>
            </Group>

            <Card radius="xl" p={0} withBorder style={{ overflow: "hidden" }}>
                <Grid gutter={0} columns={7}>
                    {weekdays.map(wd => (
                        <Grid.Col key={wd} span={1} p="sm" bg="blue.0" ta="center">
                            <Text size="xs" fw={800} c="gray.6">{wd}</Text>
                        </Grid.Col>
                    ))}
                    {days.map((day, i) => (
                        <Grid.Col key={i} span={1} h={120} p="xs" style={{ 
                            borderRight: (i + 1) % 7 === 0 ? 'none' : '1px solid var(--mantine-color-gray-1)',
                            borderBottom: i < 28 ? '1px solid var(--mantine-color-gray-1)' : 'none',
                            backgroundColor: day.isToday ? 'var(--mantine-color-blue-0)' : 'transparent',
                            position: 'relative'
                        }}>
                             <Text size="xs" fw={day.isToday ? 900 : 700} c={day.isCurrentMonth ? (day.isToday ? "blue.9" : "black") : "gray.4"} mb={4}>
                                {day.date}
                            </Text>
                            {day.isToday && <Box h={2} bg="blue.9" style={{ position: "absolute", top: 0, left: 10, right: 10 }} />}
                            
                            <Stack gap={2}>
                                {day.events.map((ev, idx) => (
                                    <Box 
                                        key={idx} 
                                        p={4} 
                                        bg={ev.color === "teal" ? "teal.0" : "blue.1"} 
                                        style={{ borderRadius: "4px", cursor: "pointer" }}
                                        onClick={() => onEventClick({
                                            title: `Interview: ${ev.name}`,
                                            avatars: [`https://api.dicebear.com/7.x/avataaars/svg?seed=${ev.name}`],
                                            status: "UPCOMING",
                                            time: ev.time,
                                            assigned: "Recruiter Hub"
                                        })}
                                    >
                                        <Text size="8px" fw={800} c={ev.color === "teal" ? "teal.9" : "blue.9"} truncate>
                                            {ev.time} • {ev.name}
                                        </Text>
                                    </Box>
                                ))}
                                {day.events.length > 2 && day.isToday && (
                                    <Text size="8px" fw={700} c="blue.6" ta="center">+ 2 more</Text>
                                )}
                            </Stack>
                        </Grid.Col>
                    ))}
                </Grid>
            </Card>

            <Box mt="xl">
                <Group gap="xs" mb="lg">
                    <IconCalendar size={20} color="blue" />
                    <Title order={4} fw={800}>Upcoming Agenda</Title>
                </Group>
                <Stack gap="md">
                    <Card radius="lg" p="lg" withBorder shadow="sm">
                        <Group justify="space-between">
                            <Group gap="xl">
                                <Stack gap={0} align="center">
                                    <Text size="xs" fw={800} c="dimmed">OCT</Text>
                                    <Text size="xl" fw={900}>08</Text>
                                </Stack>
                                <Box>
                                    <Text fw={800} size="md">Technical Assessment • Senior UX Lead</Text>
                                    <Text size="xs" c="dimmed" fw={600}>11:30 AM — 12:30 PM • Zoom Conference</Text>
                                </Box>
                            </Group>
                            <Group gap="md">
                                <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Maria" size="sm" radius="xl" />
                                <ActionIcon variant="subtle" color="gray"><IconDots size={16}/></ActionIcon>
                            </Group>
                        </Group>
                    </Card>

                    <Card radius="lg" p="lg" withBorder shadow="sm">
                        <Group justify="space-between">
                            <Group gap="xl">
                                <Stack gap={0} align="center">
                                    <Text size="xs" fw={800} c="dimmed">OCT</Text>
                                    <Text size="xl" fw={900}>08</Text>
                                </Stack>
                                <Box>
                                    <Text fw={800} size="md">Culture Fit • Maria Garcia</Text>
                                    <Text size="xs" c="dimmed" fw={600}>03:00 PM — 04:00 PM • Meeting Room A</Text>
                                </Box>
                            </Group>
                            <Group gap="md">
                                <Badge color="green.1" c="green.9" radius="sm">In-Person</Badge>
                                <ActionIcon variant="subtle" color="gray"><IconDots size={16}/></ActionIcon>
                            </Group>
                        </Group>
                    </Card>
                </Stack>
            </Box>
        </Stack>
    );
}
