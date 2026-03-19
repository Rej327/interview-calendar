"use client";

import React, { useState } from "react";
import {
  Box,
  Card,
  Container,
  Grid,
  Group,
  Stack,
  Text,
  Title,
  Button,
  SegmentedControl,
} from "@mantine/core";
import {
  IconPlus,
} from "@tabler/icons-react";
import { DatePicker } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import "@mantine/dates/styles.css";
import InterviewReviewModal from "@/components/calendar/InterviewReviewModal";
import DayView from "@/components/calendar/DayView";
import WeekView from "@/components/calendar/WeekView";
import MonthView from "@/components/calendar/MonthView";
import MonthOverview from "@/components/calendar/MonthOverview";
import WeekSidebar from "@/components/calendar/WeekSidebar";

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
  const [mounted, setMounted] = React.useState(false);
  const [view, setView] = useState<"day" | "week" | "month">("day");
  const [modalOpened, { open, close }] = useDisclosure(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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

  return (
    <Container fluid p="xl" bg="transparent" style={{ minHeight: "100vh" }}>
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
                {view === "day" && <DayView scheduleData={scheduleData} onEventClick={handleEventClick} />}
                {view === "week" && <WeekView onEventClick={handleEventClick} />}
                {view === "month" && <MonthView onEventClick={handleEventClick} />}
            </Stack>
          </Grid.Col>

          {/* Sidebar Widgets */}
          <Grid.Col span={{ base: 12, lg: view === "month" ? 3 : 4 }}>
            <Stack gap="xl">
                {view === "month" ? <MonthOverview /> : view === "week" ? <WeekSidebar /> : (
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
                        <Card p="md" radius="xl" shadow="sm">
                            <DatePicker 
                                size="sm" 
                                allowDeselect 
                                styles={{ 
                                    calendarHeader: { maxWidth: "none", marginBottom: "10px" },
                                    calendarHeaderLevel: { fontWeight: 800, fontSize: "14px", textTransform: "uppercase", flex: 1 },
                                    calendarHeaderControl: { borderRadius: "50%" },
                                    month: { width: "100%", tableLayout: "fixed" },
                                    monthsList: { width: "100%", tableLayout: "fixed" },
                                    yearsList: { width: "100%", tableLayout: "fixed" },
                                    weekday: { fontWeight: 700, fontSize: "10px", color: "var(--mantine-color-dimmed)" },
                                    day: { borderRadius: "100%", fontWeight: 600 }
                                }} 
                                hideOutsideDates 
                                style={{ width: "100%" }}
                            />
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
        candidate={selectedCandidate} 
      />
    </Container>
  );
}
