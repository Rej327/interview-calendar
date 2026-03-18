"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Badge,
  Box,
  Card,
  Container,
  Group,
  Stack,
  Text,
  Title,
  useMantineTheme,
  Grid,
  GridCol,
} from "@mantine/core";
import { mockInterviews, getStatusColor } from "@/lib/data/mock-interviews";
import { Interview } from "@/lib/types/interview";
import dayjs from "dayjs";

// FullCalendar dynamic import to avoid SSR issues
const FullCalendar = dynamic(() => import("@fullcalendar/react"), { ssr: false });

export default function CalendarPage() {
  const theme = useMantineTheme();
  const [selectedEvent, setSelectedEvent] = useState<Interview | null>(null);

  // Map mock data to FullCalendar event format
  const events = mockInterviews.map((interview) => ({
    id: interview.id,
    title: interview.title,
    start: interview.start,
    end: interview.end,
    backgroundColor: getStatusColor(interview.status),
    borderColor: getStatusColor(interview.status),
    extendedProps: {
      ...interview,
    },
  }));

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event.extendedProps);
  };

  return (
    <Container fluid px="md" py="lg">
      <Stack gap="xl">
        {/* Page Header */}
        <Group justify="space-between">
          <Box>
            <Title order={2}>Interview Calendar</Title>
            <Text c="dimmed" size="sm">
              Manage and track all scheduled interview sessions.
            </Text>
          </Box>
        </Group>

        {/* Calendar and Sidebar Layout */}
        <Group align="flex-start" wrap="nowrap" gap="lg">
          {/* Main Calendar Section */}
          <Card withBorder radius="md" p="md" style={{ flex: 1, backgroundColor: "var(--mantine-background-color)" }}>
            <Box style={{ height: "70vh", overflow: "hidden" }}>
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                events={events}
                eventClick={handleEventClick}
                height="100%"
                allDaySlot={false}
                nowIndicator={true}
                slotMinTime="08:00:00"
                slotMaxTime="20:00:00"
                slotDuration="00:30:00"
                expandRows={true}
                themeSystem="standard"
                eventTimeFormat={{
                  hour: "2-digit",
                  minute: "2-digit",
                  meridiem: "narrow",
                }}
              />
            </Box>
          </Card>

          {/* Side Info Section */}
          <Stack w={320} gap="md" visibleFrom="md">
            <Card withBorder radius="md" p="md">
              <Title order={4} mb="md">Event Details</Title>
              {selectedEvent ? (
                <Stack gap="sm">
                  <Box>
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">Candidate</Text>
                    <Text fw={600}>{selectedEvent.candidateName}</Text>
                  </Box>
                  <Box>
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">Interviewer</Text>
                    <Text size="sm">{selectedEvent.interviewerName}</Text>
                  </Box>
                  <Box>
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">Role</Text>
                    <Badge variant="light" size="sm" mt={4}>{selectedEvent.role}</Badge>
                  </Box>
                  <Box>
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">Time</Text>
                    <Text size="sm">
                      {dayjs(selectedEvent.start).format("MMM D, YYYY")} · {dayjs(selectedEvent.start).format("h:mm A")} - {dayjs(selectedEvent.end).format("h:mm A")}
                    </Text>
                  </Box>
                  <Box>
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">Type / Status</Text>
                    <Group gap="xs" mt={4}>
                      <Badge variant="filled" color={selectedEvent.status === "confirmed" ? "teal" : "blue"} size="sm">
                        {selectedEvent.status}
                      </Badge>
                      <Badge color="gray" size="sm">{selectedEvent.type}</Badge>
                    </Group>
                  </Box>
                </Stack>
              ) : (
                <Box py="xl" ta="center">
                  <Text size="sm" c="dimmed">Select an interview to view details.</Text>
                </Box>
              )}
            </Card>

            <Card withBorder radius="md" p="md">
              <Title order={6} mb="xs">Legend</Title>
              <Stack gap={8}>
                <Group gap={8}>
                  <Box w={12} h={12} bg="var(--mantine-color-teal-6)" style={{ borderRadius: "2px" }} />
                  <Text size="xs">Confirmed</Text>
                </Group>
                <Group gap={8}>
                  <Box w={12} h={12} bg="var(--mantine-color-blue-6)" style={{ borderRadius: "2px" }} />
                  <Text size="xs">Scheduled</Text>
                </Group>
                <Group gap={8}>
                  <Box w={12} h={12} bg="var(--mantine-color-yellow-6)" style={{ borderRadius: "2px" }} />
                  <Text size="xs">Pending</Text>
                </Group>
              </Stack>
            </Card>
          </Stack>
        </Group>
      </Stack>
    </Container>
  );
}
