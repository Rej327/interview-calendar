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
  Tooltip,
  Modal,
} from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconCalendar,
  IconDots,
  IconChartBar,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";

import dayjs from "dayjs";
import { CalendarEvent } from "@/lib/types/interview";

import { notifications } from "@mantine/notifications";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from "recharts";

interface MonthViewProps {
  events: CalendarEvent[];
  onEventClick: (event: any) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function MonthView({ events, onEventClick, selectedDate, onDateChange }: MonthViewProps) {
    const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const [analyticsOpened, { open: openAnalytics, close: closeAnalytics }] = useDisclosure(false);

    // Derive unique recruiters and their workload for this month
    const recruiters = React.useMemo(() => {
        const rMap: Record<string, { name: string; avatar?: string; count: number }> = {};
        events.forEach(e => {
            const recruiter = e.extendedProps.interviewer;
            if (recruiter) {
                if (!rMap[recruiter]) {
                    rMap[recruiter] = { name: recruiter, avatar: e.extendedProps.avatar, count: 0 };
                }
                if (dayjs(e.start).isSame(dayjs(selectedDate), 'month')) {
                    rMap[recruiter].count++;
                }
            }
        });
        return Object.values(rMap);
    }, [events, selectedDate]);
    
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
                <Group gap="md">
                    <Title order={4} fw={800}>{monthTitle}</Title>
                    <Button 
                        variant="subtle" 
                        color="blue.9" 
                        size="xs" 
                        leftSection={<IconChartBar size={14} />}
                        onClick={openAnalytics}
                        radius="md"
                    >
                        View Analytics
                    </Button>
                </Group>
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

            <Card radius="xl" p="md" withBorder shadow="sm">
                <Group justify="space-between" mb="xs">
                    <Text size="xs" fw={800} c="dimmed" tt="uppercase">Active Recruiters Load</Text>
                    <Text size="10px" fw={700} c="blue.6">{recruiters.length} Recruiters Assigned</Text>
                </Group>
                <Group gap="md">
                    {recruiters.map((r, i) => (
                        <Tooltip key={i} label={`${r.name}: ${r.count} slots this month`}>
                            <Box 
                                onClick={() => notifications.show({ title: `${r.name}'s Workload`, message: `${r.name} is managing ${r.count} interviews this month.`, color: 'blue' })}
                                style={{ cursor: 'pointer' }}
                            >
                                <Stack align="center" gap={4}>
                                    <Avatar src={r.avatar} size="md" radius="xl" color="blue">
                                        {r.name.charAt(0)}
                                    </Avatar>
                                    <Text size="9px" fw={800} ta="center" w={60} truncate>{r.name.split(' ')[0]}</Text>
                                </Stack>
                            </Box>
                        </Tooltip>
                    ))}
                </Group>
            </Card>


            <Card radius="xl" p={0} withBorder style={{ overflow: "hidden" }}>
                <Grid gutter={0} columns={7}>
                    {weekdays.map(wd => (
                        <Grid.Col key={wd} span={1} p="sm" bg="var(--mantine-color-blue-light)" ta="center">
                            <Text size="xs" fw={800} c="dimmed">{wd}</Text>
                        </Grid.Col>
                    ))}
                    {days.map((day, i) => (
                        <Grid.Col key={i} span={1} h={120} p="xs" style={{ 
                            borderRight: (i + 1) % 7 === 0 ? 'none' : '1px solid var(--mantine-color-default-border)',
                            borderBottom: i < 35 ? '1px solid var(--mantine-color-default-border)' : 'none',
                            backgroundColor: day.isToday ? 'var(--mantine-color-blue-light)' : 'transparent',
                            position: 'relative'
                        }}>
                             <Text size="xs" fw={day.isToday ? 900 : 700} c={day.isCurrentMonth ? (day.isToday ? "var(--mantine-color-blue-text)" : "var(--mantine-color-text)") : "dimmed"} mb={4}>
                                 {day.date}
                             </Text>
                             {day.isToday && <Box h={2} bg="var(--mantine-color-blue-filled)" style={{ position: "absolute", top: 0, left: 10, right: 10 }} />}
                            
                            <Stack gap={2} style={{ overflow: 'hidden' }}>
                                {day.events.slice(0, 3).map((ev, idx) => (
                                    <Box 
                                        key={ev.id} 
                                        p={4} 
                                        bg={`var(--mantine-color-${ev.color}-light)`}
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
                                            avatars: [ev.raw.extendedProps.avatar].filter(Boolean),
                                            notes: ev.raw.extendedProps.notes,
                                            recordingLink: ev.raw.extendedProps.recording_link,
                                            meetingLink: ev.raw.extendedProps.meeting_link,
                                            startDate: dayjs(ev.raw.start).toDate(),
                                            endDate: dayjs(ev.raw.end).toDate(),
                                        })}

                                    >
                                        <Text size="8px" fw={800} c={`var(--mantine-color-${ev.color}-light-color)`} truncate>
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

            <Modal 
                opened={analyticsOpened} 
                onClose={closeAnalytics} 
                title={<Text fw={900} tt="uppercase">Monthly Efficiency Analytics</Text>}
                size="xl"
                radius="xl"
            >
                <Stack gap="xl" p="md">
                    <Grid>
                        <Grid.Col span={4}>
                            <Card shadow="none" p="lg" radius="lg" withBorder>
                                <Text size="xs" fw={800} c="dimmed">TOTAL PLANNED</Text>
                                <Text size="24px" fw={900}>{recruiters.reduce((acc, r) => acc + r.count, 0)}</Text>
                            </Card>
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <Card shadow="none" p="lg" radius="lg" withBorder bg="blue.0">
                                <Text size="xs" fw={800} c="blue.9">AVG PER RECRUITER</Text>
                                <Text size="24px" fw={900} c="blue.9">{(recruiters.reduce((acc, r) => acc + r.count, 0) / (recruiters.length || 1)).toFixed(1)}</Text>
                            </Card>
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <Card shadow="none" p="lg" radius="lg" withBorder bg="teal.0">
                                <Text size="xs" fw={800} c="teal.9">CAPACITY UTILIZATION</Text>
                                <Text size="24px" fw={900} c="teal.9">84%</Text>
                            </Card>
                        </Grid.Col>
                    </Grid>

                    <Box h={300}>
                        <Text size="sm" fw={800} mb="md">RECRUITER WORKLOAD DISTRIBUTION</Text>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={recruiters}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--mantine-color-gray-2)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                                <ChartTooltip />
                                <Bar dataKey="count" fill="var(--mantine-color-blue-6)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </Stack>
            </Modal>
        </Stack>

    );
}
