"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Center,
  Loader,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { DatePicker } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import "@mantine/dates/styles.css";
import InterviewReviewModal from "@/components/calendar/InterviewReviewModal";
import DayView from "@/components/calendar/DayView";
import WeekView from "@/components/calendar/WeekView";
import MonthView from "@/components/calendar/MonthView";
import MonthOverview from "@/components/calendar/MonthOverview";
import WeekSidebar from "@/components/calendar/WeekSidebar";
import NewSlotModal from "@/components/calendar/NewSlotModal";


import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchEvents, setSelectedDate } from "@/lib/store/calendarSlice";

export default function CalendarPage() {
  const dispatch = useAppDispatch();
  const { events, loading, selectedDate: selectedDateStr } = useAppSelector((state) => state.calendar);
  
  const selectedDate = useMemo(() => new Date(selectedDateStr), [selectedDateStr]);

  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<"day" | "week" | "month">("day");
  const [modalOpened, { open, close }] = useDisclosure(false);
  const [newSlotModalOpened, { open: openNewSlot, close: closeNewSlot }] = useDisclosure(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);


  useEffect(() => {
    setMounted(true);
    dispatch(fetchEvents());
  }, [dispatch]);

  const handleDateChange = (value: Date | string | null) => {
    if (value) {
      const date = typeof value === "string" ? new Date(value) : value;
      dispatch(setSelectedDate(date.toISOString()));
    }
  };

  const groupedEvents = useMemo(() => {
    const groups: { [key: string]: any } = {};
    events.forEach((e) => {
      const date = dayjs(e.start).format("DD");
      const dayName = dayjs(e.start).format("ddd").toUpperCase();
      const month = dayjs(e.start).format("MMMM YYYY");
      const key = `${date}-${month}`;

      let friendlyStatus = "UPCOMING";
      if (e.extendedProps.status === "COMPLETED") friendlyStatus = "DONE";
      else if (e.extendedProps.status === "RESCHEDULED") friendlyStatus = "RESCHEDULED";

      if (!groups[key]) {
        groups[key] = { date, day: dayName, month, events: [] };
      }
      groups[key].events.push({
        id: e.id,
        title: e.title,
        time: `${dayjs(e.start).format("hh:mm A")} - ${dayjs(e.end).format("hh:mm A")}`,
        assigned: e.extendedProps.interviewer,
        status: friendlyStatus,
        color: e.extendedProps.color || "blue",
        avatars: [e.extendedProps.avatar].filter(Boolean),
        candidateName: e.extendedProps.candidate,
        role: e.extendedProps.role,
        type: e.extendedProps.type,
        notes: e.extendedProps.notes,
        recordingLink: e.extendedProps.recording_link,
        meetingLink: e.extendedProps.meeting_link,
        startDate: dayjs(e.start).toDate(),


        endDate: dayjs(e.end).toDate(),
        fullDate: dayjs(e.start).toDate(),
      });
    });
    return Object.values(groups);
  }, [events]);

  const handleEventClick = (event: any) => {
    setSelectedCandidate({
      id: event.id,
      name: event.candidateName,
      role: event.role,
      avatar: event.avatars?.[0],
      status: event.status,
      time: event.time,
      type: event.type,
      assignedHR: event.assigned,
      notes: event.notes || "Candidate evaluation and technical progression track.",
      recordingLink: event.recordingLink,
      meetingLink: event.meetingLink,
      startDate: event.startDate,
      endDate: event.endDate,
    });


    open();
  };



  const dayEvents = useMemo(() => {
    if (!selectedDate) return groupedEvents;
    const formatted = dayjs(selectedDate).format("DD-MMMM YYYY");
    return (groupedEvents as any[]).filter((g) => `${g.date}-${g.month}` === formatted);
  }, [selectedDate, groupedEvents]);

  if (!mounted) return null;

  return (
    <Container fluid p="xl" bg="transparent" style={{ minHeight: "100vh" }}>
      <Stack gap="xl">
        <Group justify="space-between" align="flex-start">
          <Box>
            <Title order={1} fw={800} size="h2">
              {view === "day" ? "Day" : view === "week" ? "Weekly" : "Monthly"} Schedule
            </Title>
            <Text c="gray.9" size="sm" fw={600}>
              Manage and track candidate interview progressions.
            </Text>
          </Box>
          <Group gap="md">
            <SegmentedControl
              value={view}
              onChange={(value: any) => setView(value)}
              data={[
                { label: "Week", value: "week" },
                { label: "Month", value: "month" },
                { label: "Day", value: "day" },
              ]}
              radius="md"
              size="sm"
              color="blue.9"
              styles={{
                root: { border: "1px solid var(--mantine-color-default-border)" },
                indicator: { boxShadow: "var(--mantine-shadow-xs)" },
                label: { fontWeight: 700 },
              }}
            />
            <Button leftSection={<IconPlus size={16} aria-hidden="true" />} radius="md" color="blue.9" px="xl" onClick={openNewSlot}>
              New Slot
            </Button>

          </Group>
        </Group>

        <Grid gutter={40}>
          <Grid.Col span={{ base: 12, lg: view === "month" ? 9 : 8 }}>
            <Stack gap="xl">
              {loading ? (
                <Center py={100}>
                  <Loader color="blue" variant="dots" />
                </Center>
              ) : (
                <>
                  {view === "day" && <DayView scheduleData={dayEvents as any} onEventClick={handleEventClick} />}
                  {view === "week" && (
                    <WeekView
                      events={events}
                      onEventClick={handleEventClick}
                      selectedDate={selectedDate}
                      onDateChange={handleDateChange}
                    />
                  )}
                  {view === "month" && (
                    <MonthView
                      events={events}
                      onEventClick={handleEventClick}
                      selectedDate={selectedDate}
                      onDateChange={handleDateChange}
                    />
                  )}
                </>
              )}
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: view === "month" ? 3 : 4 }}>
            <Stack gap="xl">
              {view === "month" ? (
                <MonthOverview events={events} selectedDate={selectedDate} />
              ) : view === "week" ? (
                <WeekSidebar events={events} selectedDate={selectedDate} onEventClick={handleEventClick} />
              ) : (

                <>
                  <Card p="xl" radius="xl" shadow="sm">
                    <Title order={5} fw={800} mb="xl">
                      EFFICIENCY METRICS
                    </Title>
                    <Stack gap="xl">
                      <Box style={{ borderLeft: "4px solid var(--mantine-color-blue-9)", paddingLeft: "20px" }}>
                        <Text size="xs" fw={700} c="gray.8" tt="uppercase" mb={4}>
                          Weekly Interviews
                        </Text>
                        <Text size="38px" fw={900}>
                          {events.filter((e) => dayjs(e.start).isAfter(dayjs().startOf("week"))).length}
                        </Text>
                      </Box>
                      <Box style={{ borderLeft: "4px solid var(--mantine-color-teal-8)", paddingLeft: "20px" }}>
                        <Text size="xs" fw={700} c="gray.8" tt="uppercase" mb={4}>
                          Avg. Time to Hire
                        </Text>
                        <Text size="38px" fw={900}>
                          12d
                        </Text>
                      </Box>
                    </Stack>
                  </Card>

                  <Card p="md" radius="xl" shadow="sm">
                    <DatePicker
                      size="sm"
                      allowDeselect
                      value={selectedDate}
                      onChange={handleDateChange}
                      getDayProps={(date) => {
                        const hasEvent = events.some((e) => dayjs(e.start).isSame(date, "day"));
                        if (hasEvent) {
                          return {
                            style: {
                              backgroundColor: "var(--mantine-color-blue-filled)",
                              color: "var(--mantine-color-white)",
                              fontWeight: 800,
                            },
                          };
                        }
                        return {};
                      }}
                      styles={{
                        calendarHeader: { maxWidth: "none", marginBottom: "10px" },
                        calendarHeaderLevel: { fontWeight: 800, fontSize: "14px", textTransform: "uppercase", flex: 1 },
                        calendarHeaderControl: { borderRadius: "50%" },
                        month: { width: "100%", tableLayout: "fixed" },
                        monthsList: { width: "100%", tableLayout: "fixed" },
                        yearsList: { width: "100%", tableLayout: "fixed" },
                        weekday: { fontWeight: 700, fontSize: "10px", color: "var(--mantine-color-gray-9)" },
                        day: { borderRadius: "100%", fontWeight: 600 },
                      }}
                      hideOutsideDates
                      style={{ width: "100%" }}
                    />
                  </Card>

                  <Card p="xl" radius="xl" shadow="sm" bg="blue.9" c="white">
                    <Title order={6} fw={800} mb="lg" tt="uppercase">
                      Interview Types
                    </Title>
                    <Stack gap="md">
                      <Group gap="sm">
                        <Box w={10} h={10} bg="blue.8" style={{ borderRadius: "50%" }} />
                        <Text size="xs" fw={600} c="blue.0">
                          HR Interview
                        </Text>
                      </Group>
                      <Group gap="sm">
                        <Box w={10} h={10} bg="violet.8" style={{ borderRadius: "50%" }} />
                        <Text size="xs" fw={600} c="blue.0">
                          Department Interview
                        </Text>
                      </Group>
                      <Group gap="sm">
                        <Box w={10} h={10} bg="teal.8" style={{ borderRadius: "50%" }} />
                        <Text size="xs" fw={600} c="blue.0">
                          Requestor Interview
                        </Text>
                      </Group>
                    </Stack>

                  </Card>
                </>
              )}
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>

      <InterviewReviewModal opened={modalOpened} onClose={close} candidate={selectedCandidate} />
      <NewSlotModal opened={newSlotModalOpened} onClose={closeNewSlot} />

    </Container>
  );
}
