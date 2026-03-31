"use client";

import React from "react";
import {
  Box,
  Card,
  Group,
  Stack,
  Text,
  ActionIcon,
  Grid,
  ThemeIcon,
} from "@mantine/core";
import {
  IconDots,
  IconPlus,
  IconChevronRight,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { CalendarEvent } from "@/lib/types/interview";

interface WeekSidebarProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onEventClick: (event: any) => void;
}

export default function WeekSidebar({ events, selectedDate, onEventClick }: WeekSidebarProps) {
  const isSelectedToday = dayjs(selectedDate).isSame(dayjs(), 'day');
  const targetEvents = events.filter(e => dayjs(e.start).isSame(selectedDate, 'day'));
  const upcomingPriority = events
    .filter(e => dayjs(e.start).isAfter(dayjs(selectedDate).subtract(1, 'hour')))
    .sort((a, b) => dayjs(a.start).diff(dayjs(b.start)))
    .slice(0, 3);

  const handlePriorityClick = (event: CalendarEvent) => {
    onEventClick({
        id: event.id,
        title: event.title,
        candidateName: event.extendedProps.candidate,
        role: event.extendedProps.role,
        avatar: event.extendedProps.avatar,
        status: event.extendedProps.status === "COMPLETED" ? "DONE" : event.extendedProps.status,
        time: `${dayjs(event.start).format("hh:mm A")} - ${dayjs(event.end).format("hh:mm A")}`,
        assigned: event.extendedProps.interviewer,
        type: event.extendedProps.type,
        color: event.extendedProps.color || 'blue',
        avatars: [event.extendedProps.avatar].filter(Boolean),
        notes: event.extendedProps.notes,
        recordingLink: event.extendedProps.recording_link,
        meetingLink: event.extendedProps.meeting_link,
        startDate: dayjs(event.start).toDate(),
        endDate: dayjs(event.end).toDate(),
    });
  };


  return (
    <Stack gap="xl">
        <Card p="xl" radius="xl" shadow="sm">
            <Text size="xs" fw={800} c="dimmed" tt="uppercase" mb="xl">
                {isSelectedToday ? "Today's Load" : `${dayjs(selectedDate).format("MMM DD")} Load`}
            </Text>
            <Grid gutter="md">
                <Grid.Col span={6}>
                    <Box p="lg" bg="blue.0" style={{ borderRadius: "16px" }}>
                        <Text size="28px" fw={900}>{Math.max(targetEvents.length, 8)}</Text>
                        <Text size="10px" fw={700} c="blue.9">TOTAL SLOTS</Text>
                    </Box>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Box p="lg" bg="teal.0" style={{ borderRadius: "16px" }}>
                        <Text size="28px" fw={900}>{targetEvents.length}</Text>
                        <Text size="10px" fw={700} c="teal.9">INTERVIEWS</Text>
                    </Box>
                </Grid.Col>
            </Grid>
            <Group justify="space-between" mt="xl">
                <Text size="xs" fw={700} c="dimmed">Calendar Health</Text>
                <Text size="xs" fw={800} c="teal.6">High ({Math.min(95, Math.floor((targetEvents.length / 8) * 100)) || 0}%)</Text>
            </Group>
        </Card>

        <Card p="xl" radius="xl" shadow="sm">
            <Group justify="space-between" mb="xl">
                <Text size="xs" fw={800} c="dimmed" tt="uppercase">Upcoming Priority</Text>
                <ActionIcon variant="transparent" color="gray"><IconDots size={16} /></ActionIcon>
            </Group>
            <Stack gap="md">
                {upcomingPriority.length > 0 ? upcomingPriority.map((item, i) => (
                    <Group key={i} justify="space-between" style={{ cursor: 'pointer' }} onClick={() => handlePriorityClick(item)}>
                        <Group gap="md">
                            <ThemeIcon variant="light" color={item.extendedProps.color || 'blue'} size="md" radius="md">
                                <IconPlus size={16}/>
                            </ThemeIcon>
                            <Box>
                                <Text size="xs" fw={800} truncate w={140}>{item.title}</Text>
                                <Text size="10px" c="dimmed" fw={600}>
                                    {dayjs(item.start).format("MMM DD, h:mm A")}
                                </Text>
                            </Box>
                        </Group>
                        <IconChevronRight size={14} color="gray" />
                    </Group>
                )) : (

                    <Text size="xs" c="dimmed" ta="center">No upcoming interviews</Text>
                )}
            </Stack>
        </Card>

        <Card radius="xl" p={0} style={{ position: 'relative', overflow: 'hidden', height: 100 }}>
             <Box style={{ 
                position: 'absolute', 
                inset: 0, 
                backgroundColor: 'var(--mantine-color-gray-1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
             }}>
                <Text size="xs" c="dimmed" ta="center" px="xl" fw={500}>
                    "Precision in scheduling reflects professionalism in hiring."
                </Text>
             </Box>
        </Card>
    </Stack>
  );
}
