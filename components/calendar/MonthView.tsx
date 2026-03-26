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
import dayjs from "dayjs";
import { CalendarEvent } from "@/lib/types/interview";

interface MonthViewProps {
  events: CalendarEvent[];
  onEventClick: (event: any) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function MonthView({ events, onEventClick, selectedDate, onDateChange }: MonthViewProps) {
    const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    
    // Navigation handler
    const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
        let newDate = dayjs(selectedDate);
        if (direction === 'prev') newDate = newDate.subtract(1, 'month');
        else if (direction === 'next') newDate = newDate.add(1, 'month');
        else newDate = dayjs();
        onDateChange(newDate.toDate());
    };

    // Generate days for the month view based on selectedDate
    const startOfMonth = dayjs(selectedDate).startOf('month');
    const startOfGrid = startOfMonth.startOf('week');
    
    const days = Array.from({ length: 42 }, (_, i) => {
        const d = startOfGrid.add(i, 'day');
        const dayEvents = events.filter(e => dayjs(e.start).isSame(d, 'day'));
        
        return {
            fullDate: d,
            date: d.format("D"),
            isCurrentMonth: d.isSame(startOfMonth, 'month'),
            isToday: d.isSame(dayjs(), 'day'),
            events: dayEvents.map(e => ({
                id: e.id,
                name: e.extendedProps.candidate,
                time: dayjs(e.start).format("h:mm A"),
                color: e.extendedProps.color || 'blue',
                raw: e
            }))
        };
    });

    const monthTitle = dayjs(selectedDate).format("MMMM YYYY");

    return (
        <Stack gap="xl">
            <Group justify="space-between" align="center">
                <Title order={4} fw={800}>{monthTitle}</Title>
                <Group gap={8}>
                    <ActionIcon variant="light" color="blue.9" radius="md" size="lg" onClick={() => handleNavigate('prev')}>
                        <IconChevronLeft size={18}/>
                    </ActionIcon>
                    <Button variant="light" color="blue.9" radius="md" size="sm" fw={800} onClick={() => handleNavigate('today')}>
                        TODAY
                    </Button>
                    <ActionIcon variant="light" color="blue.9" radius="md" size="lg" onClick={() => handleNavigate('next')}>
                        <IconChevronRight size={18}/>
                    </ActionIcon>
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
                            borderBottom: i < 35 ? '1px solid var(--mantine-color-gray-1)' : 'none',
                            backgroundColor: day.isToday ? 'var(--mantine-color-blue-0)' : 'transparent',
                            position: 'relative'
                        }}>
                             <Text size="xs" fw={day.isToday ? 900 : 700} c={day.isCurrentMonth ? (day.isToday ? "blue.9" : "black") : "gray.4"} mb={4}>
                                {day.date}
                            </Text>
                            {day.isToday && <Box h={2} bg="blue.9" style={{ position: "absolute", top: 0, left: 10, right: 10 }} />}
                            
                            <Stack gap={2} style={{ overflow: 'hidden' }}>
                                {day.events.slice(0, 3).map((ev, idx) => (
                                    <Box 
                                        key={ev.id} 
                                        p={4} 
                                        bg={`${ev.color}.1`} 
                                        style={{ borderRadius: "4px", cursor: "pointer" }}
                                        onClick={() => onEventClick({
                                            id: ev.id,
                                            title: ev.raw.title,
                                            candidateName: ev.raw.extendedProps.candidate,
                                            role: ev.raw.extendedProps.role,
                                            avatar: ev.raw.extendedProps.avatar,
                                            status: ev.raw.extendedProps.status === "COMPLETED" ? "DONE" : ev.raw.extendedProps.status,
                                            time: `${dayjs(ev.raw.start).format("hh:mm A")} - ${dayjs(ev.raw.end).format("hh:mm A")}`,
                                            assigned: ev.raw.extendedProps.interviewer,
                                            type: ev.raw.extendedProps.type,
                                            color: ev.color,
                                            avatars: [ev.raw.extendedProps.avatar].filter(Boolean)
                                        })}
                                    >
                                        <Text size="8px" fw={800} c={`${ev.color}.9`} truncate>
                                            {ev.time} • {ev.name}
                                        </Text>
                                    </Box>
                                ))}
                                {day.events.length > 3 && (
                                    <Text size="8px" fw={700} c="blue.6" ta="center">+ {day.events.length - 3} more</Text>
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
                    {events.filter(e => dayjs(e.start).isAfter(dayjs())).slice(0, 2).map(event => (
                        <Card key={event.id} radius="lg" p="lg" withBorder shadow="sm">
                            <Group justify="space-between" align="center">
                                <Group gap="xl">
                                    <Stack gap={0} align="center">
                                        <Text size="xs" fw={800} c="dimmed">{dayjs(event.start).format("MMM")}</Text>
                                        <Text size="xl" fw={900}>{dayjs(event.start).format("DD")}</Text>
                                    </Stack>
                                    <Box>
                                        <Text fw={800} size="md">{event.title}</Text>
                                        <Text size="xs" c="dimmed" fw={600}>
                                            {dayjs(event.start).format("hh:mm A")} — {dayjs(event.end).format("hh:mm A")} • {event.extendedProps.role}
                                        </Text>
                                    </Box>
                                </Group>
                                <Group gap="md">
                                    <Avatar src={event.extendedProps.avatar} size="sm" radius="xl" />
                                    <ActionIcon variant="subtle" color="gray"><IconDots size={16}/></ActionIcon>
                                </Group>
                            </Group>
                        </Card>
                    ))}
                </Stack>
            </Box>
        </Stack>
    );
}
