"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  TextInput,
  NativeSelect,
  Stack,
  Text,
  Group,
  rem,
} from "@mantine/core";
import { DateTimePicker, TimeInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { 
  IconUser, 
  IconUserCheck, 
  IconBriefcase, 
  IconVideo, 
  IconClock,
  IconCalendarEvent
} from "@tabler/icons-react";
import { useAppDispatch } from "@/lib/store/hooks";
import { fetchCandidates, fetchInterviewers, fetchRoles } from "@/app/actions/get";
import { quickAddInterview } from "@/app/actions/post";
import { fetchInterviews } from "@/lib/store/interviewSlice";
import { fetchEvents } from "@/lib/store/calendarSlice";
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";

interface ScheduleSessionModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function ScheduleSessionModal({ opened, onClose }: ScheduleSessionModalProps) {
  const dispatch = useAppDispatch();
  const [candidates, setCandidates] = useState<string[]>([]);
  const [interviewers, setInterviewers] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [candRes, intRes, roleRes] = await Promise.all([
          fetchCandidates(),
          fetchInterviewers(),
          fetchRoles()
        ]);

        if (candRes.success && Array.isArray(candRes.data)) {
          const names = candRes.data
            .map((c: any) => String(c.name || c.candidate_full_name || ""))
            .filter(n => n.length > 0);
          setCandidates(Array.from(new Set(names)));
        }

        if (intRes.success && Array.isArray(intRes.data)) {
          const names = intRes.data
            .map((i: any) => String(i.full_name || i.interviewer_full_name || ""))
            .filter(n => n.length > 0);
          setInterviewers(Array.from(new Set(names)));
        }

        if (roleRes.success && Array.isArray(roleRes.data)) {
          const titles = roleRes.data
            .map((r: any) => String(r.role_title || ""))
            .filter(t => t.length > 0);
          setRoles(Array.from(new Set(titles)));
        }
      } catch (err) {
        console.error("Failed to load select data:", err);
      }
    };
    if (opened) loadData();
  }, [opened]);

  const form = useForm({
    initialValues: {
      candidate_name: "",
      interviewer_name: "",
      role_title: "",
      type: "HR",
      start_at: new Date(),
      end_time: dayjs().add(1, "hour").format("HH:mm"),
      meeting_link: "https://zoom.us/j/992019202"
    },
    validate: {
      candidate_name: (value) => (value ? null : "Required"),
      interviewer_name: (value) => (value ? null : "Required"),
      role_title: (value) => (value ? null : "Required"),
      start_at: (value) => (value ? null : "Required"),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const [hours, minutes] = values.end_time.split(":").map(Number);
      const endAtDate = dayjs(values.start_at).hour(hours).minute(minutes);

      const result = await quickAddInterview({
        ...values,
        start_at: dayjs(values.start_at).toISOString(),
        end_at: endAtDate.toISOString()
      });

      if (result.success) {
          notifications.show({
            title: "Meeting Scheduled!",
            message: `We've successfully added an interview session for ${values.candidate_name} to the calendar.`,
            color: "teal",
            icon: <IconCalendarEvent size={16} />
          });
          dispatch(fetchInterviews());
          dispatch(fetchEvents());
          form.reset();
          onClose();
      } else {
          throw new Error(result.message);
      }
    } catch (error: any) {
      notifications.show({
        title: "Could Not Save Session",
        message: "We encountered an issue while trying to save this interview. Please check the details and try again.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!opened) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={900} size="lg">Schedule New Interview Session</Text>}
      radius="lg"
      padding="xl"
      size="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
            <Group grow>
                <NativeSelect
                    label="Candidate"
                    data={["Select Candidate...", ...candidates]}
                    required
                    leftSection={<IconUser size={16} />}
                    {...form.getInputProps("candidate_name")}
                    radius="md"
                />
                <NativeSelect
                    label="Interviewer"
                    data={["Select Staff...", ...interviewers]}
                    required
                    leftSection={<IconUserCheck size={16} />}
                    {...form.getInputProps("interviewer_name")}
                    radius="md"
                />
            </Group>

            <Group grow>
                <NativeSelect
                    label="Hiring Role"
                    data={["Select Role...", ...roles]}
                    required
                    leftSection={<IconBriefcase size={16} />}
                    {...form.getInputProps("role_title")}
                    radius="md"
                />
                <NativeSelect
                    label="Interview Stage"
                    data={["HR", "DEPARTMENT", "REQUESTOR"]}
                    required
                    {...form.getInputProps("type")}
                    radius="md"
                />
            </Group>

            <Group grow>
                <DateTimePicker
                    label="Start Time"
                    placeholder="Pick date & time"
                    leftSection={<IconClock size={16} />}
                    required
                    {...form.getInputProps("start_at")}
                    radius="md"
                />
                <TimeInput
                    label="End Time"
                    leftSection={<IconClock size={16} />}
                    required
                    {...form.getInputProps("end_time")}
                    value={form.values.end_time || ""}
                    radius="md"
                />
            </Group>

            <TextInput
                label="Meeting Connection"
                placeholder="Zoom, Google Meet, or Physical Room"
                leftSection={<IconVideo size={16} />}
                {...form.getInputProps("meeting_link")}
                radius="md"
            />

            <Group justify="flex-end" mt="xl">
                <Button variant="subtle" onClick={onClose} radius="md">Cancel</Button>
                <Button type="submit" loading={loading} radius="md" color="blue.9" px="xl">Confirmed & Schedule</Button>
            </Group>
        </Stack>
      </form>
    </Modal>
  );
}
