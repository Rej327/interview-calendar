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
} from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import dayjs from "dayjs";
import { CalendarEvent } from "@/lib/types/interview";
import { updateInterview } from "@/app/actions/post";
import { useAppDispatch } from "@/lib/store/hooks";
import { fetchEvents } from "@/lib/store/calendarSlice";
import { notifications } from "@mantine/notifications";

interface WeekViewProps {
  events: CalendarEvent[];
  onEventClick: (event: any) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function WeekView({
  events,
  onEventClick,
  selectedDate,
  onDateChange,
}: WeekViewProps) {
  const dispatch = useAppDispatch();

  const hours = [
    "08 AM",
    "09 AM",
    "10 AM",
    "11 AM",
    "12 PM",
    "01 PM",
    "02 PM",
    "03 PM",
    "04 PM",
    "05 PM",
  ];

  // Helper to change the selected date from local navigation
  const handleNavigate = (direction: "prev" | "next" | "today") => {
    let newDate = dayjs(selectedDate);
    if (direction === "prev") newDate = newDate.subtract(1, "week");
    else if (direction === "next") newDate = newDate.add(1, "week");
    else newDate = dayjs();

    onDateChange(newDate.toDate());
  };

  const handleDragStart = (e: React.DragEvent, eventId: string) => {
    e.dataTransfer.setData("eventId", eventId);
  };

  const handleDrop = async (e: React.DragEvent, dayDate: dayjs.Dayjs, hour: string) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData("eventId");
    const event = events.find((ev) => ev.id === eventId);
    if (!event) return;

    const [hourVal, ampm] = hour.split(" ");
    let finalHour = parseInt(hourVal);
    if (ampm === "PM" && finalHour !== 12) finalHour += 12;
    if (ampm === "AM" && finalHour === 12) finalHour = 0;

    const newStart = dayDate.hour(finalHour).minute(0).second(0);
    const newEnd = newStart.add(30, "minute");


    const result = await updateInterview({
      interview_id: eventId,
      interview_start_at: newStart.toISOString(),
      interview_end_at: newEnd.toISOString(),
    });

    if (result.success) {
      notifications.show({
        title: "Interview Rescheduled",
        message: `Updated to ${newStart.format("MMM DD, hh:mm A")}`,
        color: "blue",
      });
      dispatch(fetchEvents());
    }
  };


  // Generate dates for the week containing selectedDate
  const startOfWeek = dayjs(selectedDate).startOf("week");
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = startOfWeek.add(i, "day");
    return {
      name: d.format("ddd").toUpperCase(),
      date: d.format("DD"),
      fullDate: d,
      current: d.isSame(dayjs(), "day"),
      selected: d.isSame(dayjs(selectedDate), "day"),
    };
  });

  const weekTitle = `${startOfWeek.format("MMMM DD")} – ${startOfWeek.add(6, "day").format("DD, YYYY")}`;

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="center">
        <Title order={4} fw={800}>
          {weekTitle}
        </Title>
        <Group gap={8}>
          <ActionIcon
            variant="light"
            color="blue.9"
            radius="md"
            size="lg"
            onClick={() => handleNavigate("prev")}
          >
            <IconChevronLeft size={18} />
          </ActionIcon>
          <Button
            variant="light"
            color="blue.9"
            radius="md"
            size="sm"
            fw={800}
            onClick={() => handleNavigate("today")}
          >
            TODAY
          </Button>
          <ActionIcon
            variant="light"
            color="blue.9"
            radius="md"
            size="lg"
            onClick={() => handleNavigate("next")}
          >
            <IconChevronRight size={18} />
          </ActionIcon>
        </Group>
      </Group>

      <Card
        radius="xl"
        p={0}
        withBorder
        shadow="sm"
        style={{ overflow: "hidden" }}
      >
        <Box
          p="md"
          bg="var(--mantine-color-blue-light)"
          style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}
        >
          <Grid columns={15} gutter={0}>
            <Grid.Col span={1} />
            {days.map((day) => (
              <Grid.Col key={day.name} span={2}>
                <Stack
                  gap={0}
                  align="center"
                  justify="center"
                  h={70}
                  style={{
                    backgroundColor: day.current
                      ? "var(--mantine-color-blue-filled)"
                      : "transparent",
                    borderRadius: "16px",
                    border:
                      day.selected && !day.current
                        ? "2px solid var(--mantine-color-blue-light)"
                        : "none",
                    position: "relative",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: day.current
                      ? "var(--mantine-shadow-md)"
                      : "none",
                  }}
                  onClick={() => onDateChange(day.fullDate.toDate())}
                >
                  <Text
                    size="10px"
                    fw={800}
                    c={
                      day.current ? "white" : day.selected ? "var(--mantine-color-blue-text)" : "dimmed"
                    }
                  >
                    {day.name}
                  </Text>
                  <Text size="xl" fw={900} c={day.current ? "white" : "var(--mantine-color-text)"}>
                    {day.date}
                  </Text>
                  {!day.current && day.selected && (
                    <Box
                      w={4}
                      h={4}
                      bg="var(--mantine-color-blue-filled)"
                      style={{
                        borderRadius: "50%",
                        position: "absolute",
                        bottom: 6,
                      }}
                    />
                  )}
                  {day.current && (
                    <Box
                      w={6}
                      h={6}
                      bg="white"
                      style={{
                        borderRadius: "50%",
                        position: "absolute",
                        bottom: 6,
                      }}
                    />
                  )}
                </Stack>
              </Grid.Col>
            ))}
          </Grid>
        </Box>

        <Box style={{ position: "relative" }}>
          {hours.map((hour) => (
            <Box
              key={hour}
              style={{
                borderBottom: "1px solid var(--mantine-color-default-border)",
                minHeight: "100px",
              }}
            >
              <Grid columns={15} h="100%" gutter={0}>
                <Grid.Col span={1} p="xs">
                  <Text size="9px" fw={800} c="dimmed">
                    {hour}
                  </Text>
                </Grid.Col>
                {days.map((day, i) => {
                  const dayEvents = events.filter((e) => {
                    const eventStart = dayjs(e.start);
                    return (
                      eventStart.isSame(day.fullDate, "day") &&
                      eventStart.format("hh A") === hour
                    );
                  });

                  return (
                    <Grid.Col
                      key={i}
                      span={2}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, day.fullDate, hour)}
                      style={{
                        borderLeft: "1px solid var(--mantine-color-default-border)",
                        position: "relative",
                        display: "flex",
                        flexWrap: "wrap",
                        alignContent: "flex-start",
                        padding: 2,
                        minHeight: "100px"
                      }}
                    >
                      {dayEvents.map((event) => (
                        <Box
                          key={event.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, event.id)}
                          m={2}
                          p={6}

                          style={{
                            borderRadius: "10px",
                            cursor: "pointer",
                            minHeight: "80px",
                            flex:
                              dayEvents.length > 1
                                ? `1 0 calc(${Math.floor(100 / dayEvents.length)}% - 4px)`
                                : "1 0 calc(100% - 4px)",
                            backgroundColor: `var(--mantine-color-${event.extendedProps.color || "blue"}-6)`,
                            transition:
                              "transform 0.2s ease, box-shadow 0.2s ease",
                            boxShadow: "var(--mantine-shadow-xs)",
                          }}
                          onClick={() =>
                            onEventClick({
                              id: event.id,
                              title: event.title,
                              candidateName: event.extendedProps.candidate,
                              role: event.extendedProps.role,
                              avatar: event.extendedProps.avatar,
                              status:
                                event.extendedProps.status === "COMPLETED"
                                  ? "DONE"
                                  : event.extendedProps.status,
                              time: `${dayjs(event.start).format("hh:mm A")} - ${dayjs(event.end).format("hh:mm A")}`,
                              assigned: event.extendedProps.interviewer,
                              type: event.extendedProps.type,
                              color: event.extendedProps.color || "blue",
                              avatars: [event.extendedProps.avatar].filter(
                                Boolean,
                              ),
                              notes: event.extendedProps.notes,
                              recordingLink: event.extendedProps.recording_link,
                              meetingLink: event.extendedProps.meeting_link,
                              startDate: dayjs(event.start).toDate(),
                              endDate: dayjs(event.end).toDate(),
                            })
                          }

                        >
                          <Stack gap={2}>
                            <Text
                              size="8px"
                              fw={900}
                              c="white"
                              style={{ opacity: 0.8 }}
                            >
                              {dayjs(event.start).format("h:mm A")}
                            </Text>
                            <Text
                              size="10px"
                              fw={900}
                              c="white"
                              style={{ lineHeight: 1.1 }}
                            >
                              {event.extendedProps.candidate}
                            </Text>
                            <Text
                              size="7px"
                              fw={700}
                              c="white"
                              style={{ opacity: 0.9 }}
                              truncate
                            >
                              {event.extendedProps.role}
                            </Text>
                          </Stack>
                        </Box>
                      ))}
                    </Grid.Col>
                  );
                })}
              </Grid>
            </Box>
          ))}
        </Box>
      </Card>
    </Stack>
  );
}
