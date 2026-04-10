"use client";

import React, { useEffect, useState } from "react";
import {
  Drawer,
  Stack,
  Text,
  Group,
  Avatar,
  Badge,
  Box,
  Stepper,
  Paper,
  Timeline,
  ThemeIcon,
  Loader,
  Center,
  ScrollArea,
  Divider,
} from "@mantine/core";
import {
  IconCheck,
  IconClock,
  IconX,
  IconCalendar,
  IconBriefcase,
  IconChevronRight,
} from "@tabler/icons-react";
import { useAppDispatch } from "@/lib/store/hooks";
import { fetchCandidateJourney } from "@/lib/store/candidatesSlice";
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";

interface CandidateJourneyDrawerProps {
  opened: boolean;
  onClose: () => void;
  candidate: any;
}

export default function CandidateJourneyDrawer({
  opened,
  onClose,
  candidate,
}: CandidateJourneyDrawerProps) {
  const dispatch = useAppDispatch();
  const [journey, setJourney] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (opened) {
      if (candidate?.hiring_process_id) {
        const loadJourney = async () => {
          setLoading(true);
          try {
            console.log(
              "Fetching journey for HP ID:",
              candidate.hiring_process_id,
            );
            const result = await dispatch(
              fetchCandidateJourney(candidate.hiring_process_id),
            ).unwrap();
            console.log("Journey Fetch Result:", result);
            setJourney(result);
          } catch (error) {
            console.error("Failed to load journey:", error);
            notifications.show({
              title: "Error",
              message: "Failed to load candidate journey details.",
              color: "red",
            });
          } finally {
            setLoading(false);
          }
        };
        loadJourney();
      } else {
        console.warn(
          "CandidateJourneyDrawer opened but candidate.hiring_process_id is missing!",
          candidate,
        );
      }
    } else {
      setJourney(null);
    }
  }, [opened, candidate, dispatch]);

  if (!candidate) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "teal";
      case "IN_PROGRESS":
        return "blue";
      case "FAILED":
        return "red";
      case "SKIPPED":
        return "gray";
      default:
        return "dimmed";
    }
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="md"
      title={
        <Text fw={900} size="lg">
          Hiring Journey
        </Text>
      }
      padding="xl"
    >
      {loading ? (
        <Center py={100}>
          <Loader color="blue" />
        </Center>
      ) : journey ? (
        <ScrollArea h="calc(100vh - 100px)" scrollbarSize={4}>
          <Stack gap="xl">
            {/* Profile Summary */}
            <Paper withBorder p="md" radius="md" bg="gray.0">
              <Group>
                <Avatar src={candidate.avatar} size={60} radius="xl" />
                <Box>
                  <Text fw={800} size="md">
                    {candidate.name}
                  </Text>
                  <Text size="xs" c="dimmed" fw={600}>
                    {candidate.role}
                  </Text>
                  <Badge
                    mt={4}
                    size="xs"
                    color={
                      candidate.status === "HIRED"
                        ? "teal"
                        : candidate.status === "REJECTED"
                          ? "red"
                          : "blue"
                    }
                  >
                    {candidate.status}
                  </Badge>
                </Box>
              </Group>
            </Paper>

            <Divider label="Process Steps" labelPosition="center" />

            {/* Stepper / Journey Timeline */}
            {journey.steps && journey.steps.length > 0 ? (
              <Timeline
                active={journey.steps.findIndex(
                  (s: any) => s.interview_step_status !== "COMPLETED",
                )}
                bulletSize={24}
                lineWidth={2}
              >
                {journey.steps.map((step: any, index: number) => (
                  <Timeline.Item
                    key={step.interview_step_id}
                    bullet={
                      step.interview_step_status === "COMPLETED" ? (
                        <IconCheck size={12} />
                      ) : step.interview_step_status === "IN_PROGRESS" ? (
                        <IconClock size={12} />
                      ) : null
                    }
                    title={
                      <Group justify="space-between" wrap="nowrap">
                        <Text fw={700} size="sm">
                          {step.interview_step_name}
                        </Text>
                        <Badge
                          size="xs"
                          variant="light"
                          color={getStatusColor(step.interview_step_status)}
                        >
                          {step.interview_step_status.replaceAll("_", " ")}
                        </Badge>
                      </Group>
                    }
                  >
                    <Stack gap="xs" mt="xs">
                      {step.interviews && step.interviews.length > 0 ? (
                        step.interviews.map((interview: any) => (
                          <Paper
                            key={interview.interview_id}
                            withBorder
                            p="xs"
                            radius="sm"
                          >
                            <Group justify="space-between">
                              <Box>
                                <Group gap={6}>
                                  <IconCalendar
                                    size={14}
                                    color="var(--mantine-color-dimmed)"
                                  />
                                  <Text size="xs" fw={600}>
                                    {dayjs(interview.interview_start_at).format(
                                      "MMM D, YYYY",
                                    )}
                                  </Text>
                                </Group>
                                <Group gap={6} mt={2}>
                                  <IconClock
                                    size={14}
                                    color="var(--mantine-color-dimmed)"
                                  />
                                  <Text size="xs" c="dimmed">
                                    {dayjs(interview.interview_start_at).format(
                                      "hh:mm A",
                                    )}{" "}
                                    -{" "}
                                    {dayjs(interview.interview_end_at).format(
                                      "hh:mm A",
                                    )}
                                  </Text>
                                </Group>
                              </Box>
                              <Badge
                                size="xs"
                                variant="outline"
                                color={
                                  interview.interview_status === "CONFIRMED"
                                    ? "blue"
                                    : "gray"
                                }
                              >
                                {interview.interview_status}
                              </Badge>
                            </Group>
                          </Paper>
                        ))
                      ) : (
                        <Text size="xs" c="dimmed" fs="italic">
                          No interview scheduled yet
                        </Text>
                      )}
                    </Stack>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Center py={20}>
                <Text size="sm" c="dimmed" fs="italic">
                  No process steps initialized for this candidate.
                </Text>
              </Center>
            )}

            <Box mt="xl">
              <Text fw={700} size="xs" c="dimmed" tt="uppercase" mb="md">
                General Notes
              </Text>
              <Paper withBorder p="md" radius="md">
                <Text size="sm">
                  Candidate applied on{" "}
                  {dayjs(journey.process_info.hiring_process_created_at).format(
                    "MMMM D, YYYY",
                  )}
                  . Current target role: {journey.process_info.role_title} (
                  {journey.process_info.role_department}).
                </Text>
              </Paper>
            </Box>
          </Stack>
        </ScrollArea>
      ) : (
        <Center py={100}>
          <Text c="dimmed">No journey data found.</Text>
        </Center>
      )}
    </Drawer>
  );
}
