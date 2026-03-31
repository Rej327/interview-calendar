"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  Avatar,
  Box,
  Group,
  Stack,
  Text,
  Title,
  Button,
  Badge,
  ThemeIcon,
  ActionIcon,
  Textarea,
  TextInput,
  Paper,
  Card,
  Tooltip,
} from "@mantine/core";

import { DateTimePicker, TimeInput } from "@mantine/dates";
import {
  IconX,
  IconDots,
  IconCalendar,
  IconClock,
  IconUsers,
  IconVideo,
  IconPlayerPlay,
  IconExternalLink,
  IconClipboardText,
  IconBriefcase,
  IconCheck,
  IconDeviceFloppy,
} from "@tabler/icons-react";

import { InterviewStatus } from "@/lib/types/types";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { updateEvent, fetchEvents } from "@/lib/store/calendarSlice";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { updateInterview } from "@/app/actions/post";
import dayjs from "dayjs";

interface InterviewReviewModalProps {
  opened: boolean;
  onClose: () => void;
  candidate: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    status: string;
    time: string;
    type: string;
    assignedHR: string;
    notes: string;
    recordingLink?: string;
    meetingLink?: string;
    startDate?: Date;
    endDate?: Date;
  } | null;
}

export default function InterviewReviewModal({
  opened,
  onClose,
  candidate,
}: InterviewReviewModalProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const events = useAppSelector((state) => state.calendar.events);

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [isEditingRecording, setIsEditingRecording] = useState(false);
  const [recordingLink, setRecordingLink] = useState("");
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newStartDate, setNewStartDate] = useState<Date | null>(null);
  const [endTimeStr, setEndTimeStr] = useState("16:00");

  useEffect(() => {
    if (candidate) {
      setNotes(candidate.notes || "");
      setRecordingLink(candidate.recordingLink || "");
      setNewStartDate(candidate.startDate || new Date());
      setEndTimeStr(
        candidate.endDate ? dayjs(candidate.endDate).format("HH:mm") : "16:00",
      );
    }
  }, [candidate]);

  if (!candidate) return null;

  const currentEvent = events.find((e) => e.id === candidate.id);

  const handleSaveNotes = async () => {
    if (!currentEvent) return;

    const result = await updateInterview({
      interview_id: candidate.id,
      interview_notes: notes,
    });

    if (result.success) {
      notifications.show({
        title: "Notes Updated",
        message:
          "Candidate notes have been successfully saved to the database.",
        color: "teal",
        icon: <IconCheck size={16} />,
      });
      setIsEditingNotes(false);
      dispatch(fetchEvents());
    }
  };

  const handleSaveRecording = async () => {
    if (!currentEvent) return;

    const result = await updateInterview({
      interview_id: candidate.id,
      interview_recorded_link: recordingLink,
    });

    if (result.success) {
      notifications.show({
        title: "Interview Completed",
        message: "Recording link saved. Interview marked as COMPLETED.",
        color: "teal",
        icon: <IconCheck size={16} />,
      });
      setIsEditingRecording(false);
      dispatch(fetchEvents());
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!currentEvent) return;

    const result = await updateInterview({
      interview_id: candidate.id,
      interview_status: newStatus,
    });

    if (result.success) {
      notifications.show({
        title: `Interview ${newStatus}`,
        message: `The interview status has been updated to ${newStatus} in the database.`,
        color: newStatus === "CANCELLED" ? "red" : "blue",
      });
      dispatch(fetchEvents());
      onClose();
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!currentEvent || !newStartDate || !endTimeStr) return;

    const [hours, minutes] = endTimeStr.split(":").map(Number);
    const endAt = dayjs(newStartDate).hour(hours).minute(minutes);

    const result = await updateInterview({
      interview_id: candidate.id,
      interview_start_at: dayjs(newStartDate).toISOString(),
      interview_end_at: endAt.toISOString(),
      interview_status: "RESCHEDULED",
    });

    if (result.success) {
      notifications.show({
        title: `Interview Rescheduled`,
        message: `The interview has been rescheduled in the database.`,
        color: "indigo",
      });
      dispatch(fetchEvents());
      setIsRescheduling(false);
      onClose();
    }
  };

  const handleJoinMeeting = () => {
    if (candidate.meetingLink) {
      window.open(candidate.meetingLink, "_blank");
    } else {
      notifications.show({
        title: "Join Meeting Failed",
        message: "No meeting link was found for this interview.",
        color: "red",
      });
    }
  };

  const handleViewResume = () => {
    // Mocking an applicant's PDF resume URL
    const mockResumeUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
    window.open(mockResumeUrl, "_blank");
  };


  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      size="70%"
      radius="xl"
      padding={0}
      styles={{
        content: { overflow: "hidden" },
      }}
    >
      <Group
        gap={0}
        wrap="nowrap"
        align="stretch"
        style={{ minHeight: "600px" }}
      >
        {/* Left Section: Profile Info */}
        <Stack
          p={40}
          w={400}
          bg="var(--mantine-color-blue-light)"
          justify="space-between"
          align="center"
          style={{ position: "relative" }}
        >
          <Box style={{ position: "absolute", top: 20, left: 20 }}>
            <Badge
              color={
                candidate?.status === "DONE" ||
                candidate?.status === "COMPLETED"
                  ? "teal.6"
                  : candidate?.status === "CANCELLED"
                    ? "red.6"
                    : candidate?.status === "RESCHEDULED"
                      ? "indigo.6"
                      : "blue.6"
              }
              variant="filled"
              size="sm"
            >
              {candidate?.status}
            </Badge>
          </Box>
          <Box style={{ position: "absolute", top: 20, right: 20 }}>
            <IconDots size={20} color="gray" style={{ cursor: "pointer" }} />
          </Box>

          <Stack align="center" mt="xl" gap="md">
            <Paper radius="xl" p={8} bg="var(--mantine-color-body)" shadow="sm">
              <Avatar src={candidate.avatar} size={120} radius="xl" />
            </Paper>

            <Stack align="center" gap={4}>
              <Title order={3} fw={800}>
                {candidate.name}
              </Title>
              <Text size="sm" c="dimmed" fw={600}>
                {candidate.role}
              </Text>
            </Stack>
          </Stack>

          <Stack w="100%" gap="lg" mt={40}>
            {isRescheduling ? (
              <Stack
                gap="md"
                bg="white"
                p="md"
                style={{
                  borderRadius: "12px",
                  border: "1px solid var(--mantine-color-blue-outline)",
                }}
              >
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  Reschedule Interview
                </Text>
                <Stack gap="xs">
                  <DateTimePicker
                    label="New Start Date-Time"
                    value={newStartDate}
                    onChange={(value) => {
                      if (typeof value === "string") {
                        setNewStartDate(new Date(value));
                      } else {
                        setNewStartDate(value);
                      }
                    }}
                    radius="md"
                    size="sm"
                  />
                  <TimeInput
                    label="Time End"
                    value={endTimeStr}
                    onChange={(e) => setEndTimeStr(e.currentTarget.value)}
                    radius="md"
                    size="sm"
                  />
                </Stack>

                <Group grow gap="xs">
                  <Button
                    variant="subtle"
                    color="gray"
                    size="sm"
                    onClick={() => setIsRescheduling(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="blue.9"
                    size="sm"
                    onClick={handleRescheduleSubmit}
                  >
                    Confirm
                  </Button>
                </Group>
              </Stack>
            ) : (
              <>
                <Group gap="md">
                  <ThemeIcon variant="light" color="blue" size="md" radius="sm">
                    <IconCalendar size={18} />
                  </ThemeIcon>
                  <Box>
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                      Scheduled Time
                    </Text>
                    <Text size="sm" fw={700}>
                      {candidate.time}
                    </Text>
                  </Box>
                </Group>
                <Group gap="md">
                  <ThemeIcon variant="light" color="blue" size="md" radius="sm">
                    <IconBriefcase size={18} />
                  </ThemeIcon>
                  <Box>
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                      Interview Type
                    </Text>
                    <Text size="sm" fw={700}>
                      {candidate.type}
                    </Text>
                  </Box>
                </Group>
                <Group gap="md">
                  <ThemeIcon variant="light" color="blue" size="md" radius="sm">
                    <IconUsers size={18} />
                  </ThemeIcon>
                  <Box>
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                      Assigned HR
                    </Text>
                    <Group gap="xs">
                      <Avatar src={candidate.avatar} size={20} radius="xl" />
                      <Text size="sm" fw={700}>
                        {candidate.assignedHR}
                      </Text>
                    </Group>
                  </Box>
                </Group>
              </>
            )}
          </Stack>
        </Stack>

        {/* Right Section: Details & Actions */}
        <Stack p={40} style={{ flex: 1 }} justify="space-between">
          <Group justify="space-between">
            <Title order={4} fw={800}>
              Interview Review
            </Title>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="xl"
              onClick={onClose}
              radius="xl"
            >
              <IconX size={24} />
            </ActionIcon>
          </Group>

          <Stack gap="xl">
            {/* Join Meeting Box */}
            <Card
              withBorder
              radius="md"
              p="md"
              bg="var(--mantine-color-blue-light)"
              style={{ borderColor: "var(--mantine-color-blue-outline)" }}
            >
              <Group justify="space-between">
                <Group>
                  <ThemeIcon variant="light" color="blue" radius="md" size="xl">
                    <IconVideo size={24} />
                  </ThemeIcon>
                  <Box>
                    <Text fw={700} size="sm">
                      {candidate.meetingLink
                        ? "Meeting Link Available"
                        : "No Meeting Link"}
                    </Text>
                    <Text
                      size="xs"
                      c="dimmed"
                      style={{
                        maxWidth: "250px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {candidate.meetingLink ||
                        "Access original lobby and chat history"}
                    </Text>
                  </Box>
                </Group>
                <Button
                  radius="md"
                  size="sm"
                  color="blue.9"
                  onClick={handleJoinMeeting}
                  disabled={!candidate.meetingLink}
                >
                  Join Meeting
                </Button>
              </Group>
            </Card>

            {/* Recorded Link */}
            <Box>
              <Group justify="space-between" mb={8}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  Recorded Interview Link
                </Text>
                {!isEditingRecording ? (
                  <Text
                    size="xs"
                    fw={700}
                    c="blue.9"
                    style={{ cursor: "pointer" }}
                    onClick={() => setIsEditingRecording(true)}
                  >
                    Edit Link
                  </Text>
                ) : (
                  <Group gap="xs">
                    <ActionButton
                      icon={<IconX size={12} />}
                      label="Cancel"
                      color="gray"
                      onClick={() => setIsEditingRecording(false)}
                    />
                    <ActionButton
                      icon={<IconDeviceFloppy size={12} />}
                      label="Save"
                      color="blue.9"
                      onClick={handleSaveRecording}
                    />
                  </Group>
                )}
              </Group>

              {isEditingRecording ? (
                <TextInput
                  value={recordingLink}
                  onChange={(e) => setRecordingLink(e.currentTarget.value)}
                  placeholder="Paste recording URL here..."
                  radius="md"
                  size="xs"
                />
              ) : (
                <Card
                  withBorder
                  radius="md"
                  p={8}
                  style={{ borderStyle: "dashed", cursor: "pointer" }}
                  onClick={() =>
                    recordingLink && window.open(recordingLink, "_blank")
                  }
                >
                  <Group justify="space-between">
                    <Group>
                      <ThemeIcon
                        variant="light"
                        color="teal"
                        radius="xl"
                        size="sm"
                      >
                        <IconPlayerPlay size={14} />
                      </ThemeIcon>
                      <Text
                        size="xs"
                        fw={600}
                        c={recordingLink ? "blue.6" : "dimmed"}
                      >
                        {recordingLink || "No recording link available"}
                      </Text>
                    </Group>
                    {recordingLink && (
                      <ActionIcon variant="subtle" size="sm">
                        <IconExternalLink size={14} />
                      </ActionIcon>
                    )}
                  </Group>
                </Card>
              )}
            </Box>

            {/* Meeting Notes */}
            <Box>
              <Group justify="space-between" mb={8}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  Meeting Notes
                </Text>
                {!isEditingNotes ? (
                  <Text
                    size="xs"
                    fw={700}
                    c="blue.9"
                    style={{ cursor: "pointer" }}
                    onClick={() => setIsEditingNotes(true)}
                  >
                    Edit Notes
                  </Text>
                ) : (
                  <Group gap="xs">
                    <ActionButton
                      icon={<IconX size={12} />}
                      label="Cancel"
                      color="gray"
                      onClick={() => setIsEditingNotes(false)}
                    />
                    <ActionButton
                      icon={<IconDeviceFloppy size={12} />}
                      label="Save"
                      color="blue.9"
                      onClick={handleSaveNotes}
                    />
                  </Group>
                )}
              </Group>
              <Card
                withBorder
                radius="md"
                p="md"
                bg="var(--mantine-color-gray-light)"
              >
                {isEditingNotes ? (
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.currentTarget.value)}
                    autosize
                    minRows={2}
                    variant="unstyled"
                    size="xs"
                    styles={{ input: { padding: 0 } }}
                  />
                ) : (
                  <Text
                    size="xs"
                    style={{ fontStyle: "italic", lineHeight: 1.6 }}
                    c="var(--mantine-color-text)"
                  >
                    "{notes}"
                  </Text>
                )}
              </Card>
            </Box>

            {/* Metrics */}
            <Group grow gap="md">
              <Card
                withBorder
                radius="md"
                p="sm"
                ta="center"
                bg="var(--mantine-color-gray-light)"
              >
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  Duration
                </Text>
                <Title order={5} fw={900}>
                  82m
                </Title>
              </Card>
              <Card
                withBorder
                radius="md"
                p="sm"
                ta="center"
                bg="var(--mantine-color-gray-light)"
              >
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  Participants
                </Text>
                <Title order={5} fw={900}>
                  04
                </Title>
              </Card>
              <Card
                withBorder
                radius="md"
                p="sm"
                ta="center"
                bg="var(--mantine-color-gray-light)"
              >
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  Avg Score
                </Text>
                <Title order={5} fw={900} c="teal.6">
                  4.8/5
                </Title>
              </Card>
            </Group>
          </Stack>

          <Group justify="flex-end" gap="md">
            <Button
              variant="subtle"
              color="red.6"
              fw={700}
              leftSection={<IconX size={16} />}
              onClick={() => handleStatusChange("CANCELLED")}
              disabled={candidate.status === "CANCELLED"}
            >
              Cancel Interview
            </Button>
            <Button
              variant="light"
              color="blue.9"
              fw={700}
              leftSection={<IconCalendar size={16} />}
              onClick={() => setIsRescheduling(true)}
              disabled={isRescheduling}
            >
              Reschedule
            </Button>
            <Button
              color="blue.9"
              radius="md"
              px="xl"
              fw={700}
              onClick={handleViewResume}
            >
              View Resume
            </Button>

          </Group>
        </Stack>
      </Group>
    </Modal>
  );
}

function ActionButton({ icon, label, color, onClick }: any) {
  return (
    <Group gap={4} style={{ cursor: "pointer" }} onClick={onClick}>
      <ThemeIcon variant="subtle" color={color} size="xs">
        {icon}
      </ThemeIcon>
      <Text size="xs" fw={700} c={color}>
        {label}
      </Text>
    </Group>
  );
}
