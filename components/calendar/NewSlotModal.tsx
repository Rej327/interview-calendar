"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Group,
  Stack,
  Title,
  Button,
  TextInput,
  Select,
  ActionIcon,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { IconX, IconPlus } from "@tabler/icons-react";
import { useAppDispatch } from "@/lib/store/hooks";
import { addEvent, fetchEvents } from "@/lib/store/calendarSlice";
import {
  CalendarEvent,
  INTERVIEW_STATUS,
  INTERVIEW_TYPE,
} from "@/lib/types/interview";
import { InterviewStatus, InterviewType } from "@/lib/types/types";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import { fetchInterviewers } from "@/app/actions/get";
import { quickAddInterview } from "@/app/actions/post";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";

interface NewSlotModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function NewSlotModal({ opened, onClose }: NewSlotModalProps) {
  const dispatch = useAppDispatch();
  const [candidate, setCandidate] = useState("");
  const [interviewer, setInterviewer] = useState<string | null>(null);
  const [interviewersList, setInterviewersList] = useState<
    { id: string; name: string; role: string }[]
  >([]);
  const [role, setRole] = useState("");
  const [type, setType] = useState<INTERVIEW_TYPE>("SCREENING");
  const [startTime, setStartTime] = useState<Date | null>(new Date());
  const [endTime, setEndTime] = useState<Date | null>(
    dayjs().add(1, "hour").toDate(),
  );
  const [meetingLink, setMeetingLink] = useState("");

  useEffect(() => {
    const getInterviewers = async () => {
      const result = await fetchInterviewers();
      if (result.success && result.data) {
        setInterviewersList(
          result.data.map((i: any) => ({
            id: i.interviewer_id,
            name: i.full_name,
            role: i.role_title,
          })),
        );
      }
    };
    if (opened) getInterviewers();
  }, [opened]);

  const handleInterviewerChange = (value: string | null) => {
    setInterviewer(value);
    const selected = interviewersList.find((i) => i.name === value);
    if (selected) {
      setRole(selected.role);
    }
  };

  const handleCreate = async () => {
    if (!candidate || !interviewer || !role || !startTime || !endTime) return;

    const result = await quickAddInterview({
      candidate_name: candidate,
      interviewer_name: interviewer,
      role_title: role,
      type: type,
      start_at: startTime.toISOString(),
      end_at: endTime.toISOString(),
      meeting_link: meetingLink,
    });

    if (result.success) {
      notifications.show({
        title: "Interview Created",
        message:
          "The interview has been successfully scheduled and saved to the database.",
        color: "teal",
        icon: <IconCheck size={16} />,
      });
      dispatch(fetchEvents());
      onClose();
      // Reset form
      setCandidate("");
      setInterviewer(null);
      setRole("");
      setMeetingLink("");
      setType("SCREENING");
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      size="lg"
      radius="xl"
      padding="xl"
    >
      <Stack gap="xl">
        <Group justify="space-between">
          <Title order={3} fw={800}>
            Create New Interview Slot
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

        <Stack gap="md">
          <TextInput
            label="Candidate Name"
            placeholder="John Doe"
            value={candidate}
            onChange={(e) => setCandidate(e.currentTarget.value)}
            required
            radius="md"
          />
          <Select
            label="Interviewer Name"
            placeholder="Search interviewer..."
            data={interviewersList.map((i) => i.name)}
            value={interviewer}
            onChange={handleInterviewerChange}
            required
            radius="md"
            searchable
          />
          <TextInput
            label="Role"
            placeholder="Senior Frontend Developer"
            value={role}
            onChange={(e) => setRole(e.currentTarget.value)}
            required
            radius="md"
            readOnly
            description="Role is automatically linked to the interviewer"
          />
          <TextInput
            label="Interview Link (Meeting URL)"
            placeholder="https://teams.microsoft.com/l/meetup-join/mock-link"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.currentTarget.value)}
            radius="md"
          />

          <Select
            label="Interview Type"
            placeholder="Select type"
            data={["SCREENING", "TECHNICAL", "BEHAVIORAL", "LEADERSHIP"]}
            value={type}
            onChange={(value) => setType(value as INTERVIEW_TYPE)}
            required
            radius="md"
          />

          <Group grow>
            <DateTimePicker
              label="Start Time"
              placeholder="Pick date and time"
              value={startTime}
              onChange={(value) => {
                if (typeof value === "string") {
                  setStartTime(new Date(value));
                } else {
                  setStartTime(value);
                }
              }}
              required
              radius="md"
            />
            <DateTimePicker
              label="End Time"
              placeholder="Pick date and time"
              value={endTime}
              onChange={(value) => {
                if (typeof value === "string") {
                  setEndTime(new Date(value));
                } else {
                  setEndTime(value);
                }
              }}
              required
              radius="md"
            />
          </Group>
        </Stack>

        <Group justify="flex-end" mt="xl">
          <Button variant="subtle" color="gray" onClick={onClose} radius="md">
            Cancel
          </Button>
          <Button
            color="blue.9"
            radius="md"
            px="xl"
            leftSection={<IconPlus size={16} />}
            onClick={handleCreate}
          >
            Create Slot
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
