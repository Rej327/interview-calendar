"use client";

import React, { useState } from "react";
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
  Select,
  ThemeIcon,
  Avatar,
  ActionIcon,
  SegmentedControl,
} from "@mantine/core";
import {
  IconPlus,
  IconChevronLeft,
  IconChevronRight,
  IconDots,
  IconClock,
  IconHistory,
  IconCalendar,
} from "@tabler/icons-react";
import { DatePicker } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import "@mantine/dates/styles.css";
import InterviewReviewModal from "@/components/calendar/InterviewReviewModal";

const scheduleData = [
  {
    date: "16",
    day: "MON",
    month: "October 2023",
    events: [
      {
        id: "1",
        title: "HR Interview: Alexander Wright",
        time: "09:00 AM - 10:00 AM (1h)",
        assigned: "Sarah Miller",
        status: "DONE",
        color: "teal",
        avatars: ["https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"],
      },
      {
        id: "2",
        title: "Department Interview: Elena Rodriguez",
        time: "02:30 PM - 03:30 PM (1h)",
        assigned: "Tech Lead Team",
        status: "UPCOMING",
        color: "blue",
        avatars: ["https://api.dicebear.com/7.x/avataaars/svg?seed=Elena", "https://api.dicebear.com/7.x/avataaars/svg?seed=Mark"],
      },
    ],
  },
  {
    date: "17",
    day: "TUE",
    month: "October 2023",
    events: [
      {
        id: "3",
        title: "Practical Test: Marcus Thorne",
        time: "11:00 AM - 12:00 PM (1h)",
        assigned: "David Chen",
        status: "RESCHEDULED",
        color: "indigo",
        avatars: ["https://api.dicebear.com/7.x/avataaars/svg?seed=David"],
        icon: <IconHistory size={16} />,
      },
      {
        id: "4",
        title: "Background Check: Julia Vance",
        time: "04:00 PM - 05:00 PM (1h)",
        assigned: "HR Ops",
        status: "UPCOMING",
        color: "blue",
        avatars: ["https://api.dicebear.com/7.x/avataaars/svg?seed=Julia"],
      },
    ],
  },
];

export default function CalendarPage() {
  const [view, setView] = useState<"day" | "week" | "month">("day");
  const [modalOpened, { open, close }] = useDisclosure(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  const handleEventClick = (event: any) => {
    setSelectedCandidate({
      name: event.title.split(": ")[1],
      role: "Senior Product Designer",
      avatar: event.avatars[0],
      status: event.status,
      time: event.time,
      type: event.title.split(": ")[0],
      assignedHR: event.assigned,
      notes: "Candidate demonstrated exceptional understanding of design systems and component architecture. Particularly impressed by their approach to scalability in the enterprise environment. Suggest moving forward to the technical assessment phase. Note: available to start in 2 weeks.",
    });
    open();
  };

  const renderDayView = () => (
    <Stack gap="xl">
        <Group justify="space-between">
            <Group gap="xs">
                <Title order={4} fw={800}>October 2023</Title>
                <Group gap={4}>
                    <ActionIcon variant="subtle" color="gray" size="sm"><IconChevronLeft size={16}/></ActionIcon>
                    <ActionIcon variant="subtle" color="gray" size="sm"><IconChevronRight size={16}/></ActionIcon>
                </Group>
            </Group>
            <Group gap="lg">
                <Group gap={6}>
                    <Box w={8} h={8} bg="teal.5" style={{ borderRadius: "50%" }} />
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase">Done</Text>
                </Group>
                <Group gap={6}>
                    <Box w={8} h={8} bg="blue.5" style={{ borderRadius: "50%" }} />
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase">Upcoming</Text>
                </Group>
                <Group gap={6}>
                    <Box w={8} h={8} bg="indigo.2" style={{ borderRadius: "50%" }} />
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase">Rescheduled</Text>
                </Group>
            </Group>
        </Group>

        {scheduleData.map((day) => (
            <Group key={day.date} align="flex-start" gap="xl" wrap="nowrap">
                <Stack align="center" gap={0} w={60}>
                    <Text size="xs" fw={800} c="gray.6">{day.day}</Text>
                    <Text size="xl" fw={900} style={{ fontSize: "28px" }}>{day.date}</Text>
                </Stack>
                
                <Stack gap="md" style={{ flex: 1 }}>
                    {day.events.map((event) => (
                        <Card 
                            key={event.id} 
                            p="lg" 
                            radius="lg" 
                            shadow={event.status === "UPCOMING" ? "sm" : "none"}
                            withBorder={false}
                            onClick={() => handleEventClick(event)}
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
                                    {event.icon && <ThemeIcon variant="transparent" color="gray.6">{event.icon}</ThemeIcon>}
                                    <Avatar.Group spacing="sm">
                                        {event.avatars.map((src, i) => (
                                            <Avatar key={i} src={src} radius="xl" size="sm" />
                                        ))}
                                        {event.avatars.length > 1 && <Avatar radius="xl" size="sm" color="gray" fw={700} style={{ fontSize: "10px" }}>+3</Avatar>}
                                    </Avatar.Group>
                                </Group>
                            </Group>
                        </Card>
                    ))}
                </Stack>
            </Group>
        ))}

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

  const renderWeekView = () => {
    const hours = ["08 AM", "09 AM", "10 AM", "11 AM", "12 PM", "01 PM", "02 PM", "03 PM", "04 PM", "05 PM"];
    const days = [
        { name: "MON", date: "11" },
        { name: "TUE", date: "12" },
        { name: "WED", date: "13", current: true },
        { name: "THU", date: "14" },
        { name: "FRI", date: "15" },
        { name: "SAT", date: "16" },
        { name: "SUN", date: "17" },
    ];

    return (
        <Stack gap="xl">
            <Group justify="space-between">
                <Title order={4} fw={800}>September 11 – 17, 2023</Title>
                <Group gap={4}>
                    <ActionIcon variant="subtle" color="gray" size="sm"><IconChevronLeft size={16}/></ActionIcon>
                    <Button variant="subtle" color="gray" size="xs" fw={700}>TODAY</Button>
                    <ActionIcon variant="subtle" color="gray" size="sm"><IconChevronRight size={16}/></ActionIcon>
                </Group>
            </Group>

            <Card radius="xl" p={0} withBorder style={{ overflow: 'hidden' }}>
                <Grid gutter={0} columns={15}>
                    {/* Time Column */}
                    <Grid.Col span={1} style={{ borderRight: '1px solid var(--mantine-color-gray-2)' }}>
                        <Stack gap={0}>
                            <Box h={60} /> {/* Spacer for header */}
                            {hours.map(hour => (
                                <Box key={hour} h={80} p="xs">
                                    <Text size="xs" fw={700} c="gray.6" mt={-20}>{hour}</Text>
                                </Box>
                            ))}
                        </Stack>
                    </Grid.Col>

                    {/* Day Columns */}
                    {days.map(day => (
                        <Grid.Col key={day.date} span={2} style={{ 
                            borderRight: day.name === "SUN" ? 'none' : '1px solid var(--mantine-color-gray-2)',
                            backgroundColor: day.current ? 'var(--mantine-color-blue-0)' : 'transparent',
                            position: 'relative'
                        }}>
                            <Stack gap={0} align="center" py="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
                                <Text size="xs" fw={800} c="gray.6">{day.name}</Text>
                                <Text size="md" fw={900} c={day.current ? 'blue.9' : 'black'}>{day.date}</Text>
                                {day.current && <Box w={4} h={4} bg="blue.9" style={{ borderRadius: '50%' }} mt={2}/>}
                            </Stack>

                            <Box style={{ position: 'relative', height: hours.length * 80 }}>
                                {/* Horizontal grid lines */}
                                {hours.map((_, i) => (
                                    <Box key={i} style={{ 
                                        position: 'absolute', 
                                        top: i * 80, 
                                        left: 0, 
                                        right: 0, 
                                        height: '1px', 
                                        backgroundColor: 'var(--mantine-color-gray-1)' 
                                    }} />
                                ))}

                                {/* Example Events */}
                                    <Box 
                                        onClick={() => handleEventClick({
                                            title: "TECH REVIEW: Sarah Jen",
                                            avatars: ["https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"],
                                            status: "UPCOMING",
                                            time: "10:00 AM - 11:00 AM",
                                            assigned: "Sarah Miller"
                                        })}
                                        style={{ 
                                            position: 'absolute', 
                                            top: 180, 
                                            left: 4, 
                                            right: 4, 
                                            height: 60,
                                            backgroundColor: 'var(--mantine-color-blue-1)',
                                            borderLeft: '4px solid var(--mantine-color-blue-9)',
                                            borderRadius: '4px',
                                            padding: '4px 8px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Text size="10px" fw={800} c="blue.9">TECH REVIEW</Text>
                                        <Text size="10px" fw={600} truncate>Sarah J...</Text>
                                    </Box>

                                {day.current && (
                                     <Box 
                                         onClick={() => handleEventClick({
                                             title: "EXECUTIVE FINAL: Liam O'Connell",
                                             avatars: ["https://api.dicebear.com/7.x/avataaars/svg?seed=Liam"],
                                             status: "UPCOMING",
                                             time: "03:00 PM - 04:40 PM",
                                             assigned: "HR Executive"
                                         })}
                                         style={{ 
                                             position: 'absolute', 
                                             top: 420, 
                                             left: 4, 
                                             right: 4, 
                                             height: 100,
                                             backgroundColor: 'var(--mantine-color-indigo-1)',
                                             borderLeft: '4px solid var(--mantine-color-indigo-6)',
                                             borderRadius: '4px',
                                             padding: '8px',
                                             zIndex: 2,
                                             cursor: 'pointer'
                                         }}
                                     >
                                        <Text size="9px" fw={800} c="indigo.9" mb={2}>EXECUTIVE FINAL</Text>
                                        <Text size="11px" fw={800} mb={4}>Liam O'Connell</Text>
                                        <Avatar.Group spacing="xs">
                                            <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Liam" size="xs" radius="xl" />
                                            <Avatar size="xs" radius="xl">+2</Avatar>
                                        </Avatar.Group>
                                    </Box>
                                )}

                                {day.date === "14" && (
                                    <Box 
                                        onClick={() => handleEventClick({
                                            title: "SCREENING: Marcus Thorne",
                                            avatars: ["https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus"],
                                            status: "DONE",
                                            time: "11:30 AM - 12:00 PM",
                                            assigned: "HR Ops"
                                        })}
                                        style={{ 
                                            position: 'absolute', 
                                            top: 260, 
                                            left: 4, 
                                            right: 4, 
                                            height: 40,
                                            backgroundColor: 'var(--mantine-color-teal-1)',
                                            borderLeft: '4px solid var(--mantine-color-teal-6)',
                                            borderRadius: '4px',
                                            padding: '4px 8px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Text size="10px" fw={800} c="teal.9">SCREENING</Text>
                                        <Text size="10px" fw={600} truncate>Marcus T.</Text>
                                    </Box>
                                )}

                                {day.date === "15" && (
                                    <Box 
                                        onClick={() => handleEventClick({
                                            title: "PORTFOLIO REVIEW: Emma Wilson",
                                            avatars: ["https://api.dicebear.com/7.x/avataaars/svg?seed=Emma"],
                                            status: "UPCOMING",
                                            time: "04:00 PM - 05:00 PM",
                                            assigned: "Design Lead"
                                        })}
                                        style={{ 
                                            position: 'absolute', 
                                            top: 600, 
                                            left: 4, 
                                            right: 4, 
                                            height: 80,
                                            backgroundColor: 'var(--mantine-color-blue-1)',
                                            borderLeft: '4px solid var(--mantine-color-blue-9)',
                                            borderRadius: '4px',
                                            padding: '8px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Text size="10px" fw={800} c="blue.9" mb={2}>PORTFOLIO REVIEW</Text>
                                        <Text size="11px" fw={800}>Emma ...</Text>
                                    </Box>
                                )}
                            </Box>
                        </Grid.Col>
                    ))}
                </Grid>
            </Card>
        </Stack>
    );
  };

  const renderMonthView = () => {
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
                                        onClick={() => handleEventClick({
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
                    <Card radius="lg" p="lg" withBorder>
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

                    <Card radius="lg" p="lg" withBorder>
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
  };

  const renderMonthOverview = () => (
    <Stack gap="xl">
        <Card p="xl" radius="xl" bg="blue.9" c="white" shadow="xl">
            <Text size="xs" fw={700} c="blue.2" tt="uppercase" mb="xs">Monthly Overview</Text>
            <Text size="64px" fw={900} mb="xl">42</Text>
            <Text size="sm" fw={600} c="blue.2" mb="xl">SCHEDULED INTERVIEWS</Text>
            
            <Grid gutter="xl" mb="xl">
                <Grid.Col span={6}>
                    <Text size="xl" fw={900}>12</Text>
                    <Text size="10px" fw={600} c="blue.2">PENDING FEEDBACK</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Text size="xl" fw={900}>08</Text>
                    <Text size="10px" fw={600} c="blue.2">COMPLETED</Text>
                </Grid.Col>
            </Grid>

            <Button fullWidth radius="md" color="blue.7" fw={800}>VIEW FULL ANALYTICS</Button>
        </Card>

        <Box>
            <Text size="xs" fw={800} c="dimmed" tt="uppercase" mb="lg">Stage Filter</Text>
            <Stack gap="xs">
                <Group gap="sm">
                    <Box w={8} h={8} bg="blue.9" style={{ borderRadius: "50%" }} />
                    <Text size="xs" fw={700}>Technical Assessment</Text>
                </Group>
                <Group gap="sm">
                    <Box w={8} h={8} bg="teal.5" style={{ borderRadius: "50%" }} />
                    <Text size="xs" fw={700}>Culture Fit</Text>
                </Group>
                <Group gap="sm">
                    <Box w={8} h={8} bg="blue.3" style={{ borderRadius: "50%" }} />
                    <Text size="xs" fw={700}>Executive Review</Text>
                </Group>
            </Stack>
        </Box>

        <Box mt="xl">
            <Text size="xs" fw={800} c="dimmed" tt="uppercase" mb="lg">Recruiters</Text>
            <Avatar.Group spacing="sm">
                <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=1" radius="xl" size="sm" />
                <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=2" radius="xl" size="sm" />
                <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=3" radius="xl" size="sm" />
                <Avatar radius="xl" size="sm" color="gray" fw={700} style={{ fontSize: "10px" }}>+12</Avatar>
            </Avatar.Group>
        </Box>
    </Stack>
  );

  const renderWeekSidebar = () => (
    <Stack gap="xl">
        <Card p="xl" radius="xl" shadow="sm">
            <Text size="xs" fw={800} c="dimmed" tt="uppercase" mb="xl">Today's Load</Text>
            <Grid gutter="md">
                <Grid.Col span={6}>
                    <Box p="lg" bg="blue.0" style={{ borderRadius: "16px" }}>
                        <Text size="28px" fw={900}>08</Text>
                        <Text size="10px" fw={700} c="blue.9">TOTAL SLOTS</Text>
                    </Box>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Box p="lg" bg="teal.0" style={{ borderRadius: "16px" }}>
                        <Text size="28px" fw={900}>03</Text>
                        <Text size="10px" fw={700} c="teal.9">INTERVIEWS</Text>
                    </Box>
                </Grid.Col>
            </Grid>
            <Group justify="space-between" mt="xl">
                <Text size="xs" fw={700} c="dimmed">Calendar Health</Text>
                <Text size="xs" fw={800} c="teal.6">High (92%)</Text>
            </Group>
        </Card>

        <Card p="xl" radius="xl" shadow="sm">
            <Group justify="space-between" mb="xl">
                <Text size="xs" fw={800} c="dimmed" tt="uppercase">Upcoming Priority</Text>
                <ActionIcon variant="transparent" color="gray"><IconDots size={16} /></ActionIcon>
            </Group>
            <Stack gap="md">
                {[
                    { title: "Senior Backend Dev", subtitle: "Technical Round • 2 PM", icon: <IconPlus size={16}/>, color: "blue" },
                    { title: "Product Designer", subtitle: "Portfolio Walk • 4 PM", icon: <IconPlus size={16}/>, color: "indigo" },
                    { title: "Data Scientist", subtitle: "Final Round • Tomorrow", icon: <IconPlus size={16}/>, color: "teal" },
                ].map((item, i) => (
                    <Group key={i} justify="space-between" style={{ cursor: 'pointer' }}>
                        <Group gap="md">
                            <ThemeIcon variant="light" color={item.color} size="md" radius="md">
                                {item.icon}
                            </ThemeIcon>
                            <Box>
                                <Text size="xs" fw={800}>{item.title}</Text>
                                <Text size="10px" c="dimmed" fw={600}>{item.subtitle}</Text>
                            </Box>
                        </Group>
                        <IconChevronRight size={14} color="gray" />
                    </Group>
                ))}
            </Stack>
        </Card>

        <Card radius="xl" p={0} style={{ position: 'relative', overflow: 'hidden', height: 200 }}>
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

  return (
    <Container fluid p="xl" bg="gray.0" style={{ minHeight: "100vh" }}>
      <Stack gap="xl">
        {/* Header Section */}
        <Group justify="space-between" align="flex-start">
          <Box>
            <Title order={1} fw={800} size="h2">Weekly Schedule</Title>
            <Text c="dimmed" size="sm">Manage and track candidate interview progressions.</Text>
          </Box>
          <Group gap="md">
            <SegmentedControl
              value={view}
              onChange={(value: any) => setView(value)}
              data={[
                { label: 'Week', value: 'week' },
                { label: 'Month', value: 'month' },
                { label: 'Day', value: 'day' },
              ]}
              radius="md"
              size="sm"
              color="blue.9"
              styles={{
                root: { backgroundColor: 'white', border: '1px solid var(--mantine-color-gray-2)' },
                indicator: { boxShadow: 'var(--mantine-shadow-xs)' },
                label: { fontWeight: 700 }
              }}
            />
            <Button leftSection={<IconPlus size={16} />} radius="md" color="blue.9" px="xl">
              New Slot
            </Button>
          </Group>
        </Group>

        <Grid gutter={40}>
          {/* Main Content Area */}
          <Grid.Col span={{ base: 12, lg: view === "month" ? 9 : 8 }}>
            <Stack gap="xl">
                {/* View Content */}
                {view === "day" && renderDayView()}
                {view === "week" && renderWeekView()}
                {view === "month" && renderMonthView()}
            </Stack>
          </Grid.Col>

          {/* Sidebar Widgets */}
          <Grid.Col span={{ base: 12, lg: view === "month" ? 3 : 4 }}>
            <Stack gap="xl">
                {view === "month" ? renderMonthOverview() : view === "week" ? renderWeekSidebar() : (
                    <>
                        {/* Efficiency Metrics */}
                        <Card p="xl" radius="xl" shadow="sm">
                            <Title order={5} fw={800} mb="xl">EFFICIENCY METRICS</Title>
                            <Stack gap="xl">
                                <Box style={{ borderLeft: "4px solid var(--mantine-color-blue-9)", paddingLeft: "20px" }}>
                                    <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={4}>Weekly Interviews</Text>
                                    <Text size="38px" fw={900}>24</Text>
                                </Box>
                                <Box style={{ borderLeft: "4px solid var(--mantine-color-teal-6)", paddingLeft: "20px" }}>
                                    <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={4}>Avg. Time to Hire</Text>
                                    <Text size="38px" fw={900}>12d</Text>
                                </Box>
                            </Stack>
                        </Card>

                        {/* mini calendar */}
                        <Card p="lg" radius="xl" shadow="sm">
                            <Group justify="space-between" mb="xs">
                                <Text fw={800} size="sm">October 2023</Text>
                                <Group gap={4}>
                                    <IconChevronLeft size={16} style={{ cursor: "pointer" }} />
                                    <IconChevronRight size={16} style={{ cursor: "pointer" }} />
                                </Group>
                            </Group>
                            <DatePicker size="sm" allowDeselect style={{ width: "100%" }} styles={{ 
                                day: { borderRadius: "4px" }
                            }} hideOutsideDates />
                        </Card>

                        {/* Interview Types */}
                        <Card p="xl" radius="xl" shadow="sm" bg="blue.9" c="white">
                            <Title order={6} fw={800} mb="lg" tt="uppercase">Interview Types</Title>
                            <Stack gap="md">
                                <Group gap="sm">
                                    <Box w={10} h={10} bg="blue.4" style={{ borderRadius: "50%" }} />
                                    <Text size="xs" fw={600} c="blue.0">HR Interview</Text>
                                </Group>
                                <Group gap="sm">
                                    <Box w={10} h={10} bg="violet.4" style={{ borderRadius: "50%" }} />
                                    <Text size="xs" fw={600} c="blue.0">Department Interview</Text>
                                </Group>
                                <Group gap="sm">
                                    <Box w={10} h={10} bg="teal.4" style={{ borderRadius: "50%" }} />
                                    <Text size="xs" fw={600} c="blue.0">Practical Test</Text>
                                </Group>
                                <Group gap="sm">
                                    <Box w={10} h={10} bg="orange.4" style={{ borderRadius: "50%" }} />
                                    <Text size="xs" fw={600} c="blue.0">Background Check</Text>
                                </Group>
                            </Stack>
                        </Card>
                    </>
                )}
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>

      <InterviewReviewModal 
        opened={modalOpened} 
        onClose={close} 
        candidate={selectedCandidate || {
            name: "",
            role: "",
            avatar: "",
            status: "",
            time: "",
            type: "",
            assignedHR: "",
            notes: ""
        }} 
      />
    </Container>
  );
}
