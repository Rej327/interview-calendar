"use client";

import React from "react";
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
  TextInput,
  Paper,
  Card,
} from "@mantine/core";
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
} from "@tabler/icons-react";

interface InterviewReviewModalProps {
  opened: boolean;
  onClose: () => void;
  candidate: {
    name: string;
    role: string;
    avatar: string;
    status: string;
    time: string;
    type: string;
    assignedHR: string;
    notes: string;
  };
}

export default function InterviewReviewModal({ opened, onClose, candidate }: InterviewReviewModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      size="70%"
      radius="xl"
      padding={0}
      styles={{ content: { overflow: "hidden" } }}
    >
      <Group gap={0} wrap="nowrap" align="stretch">
        {/* Left Section: Profile Info */}
        <Stack p={40} w={400} bg="blue.0" justify="space-between" align="center" style={{ position: "relative" }}>
          <Box style={{ position: "absolute", top: 20, left: 20 }}>
            <Badge 
              color={
                candidate.status === "DONE" ? "teal.6" : 
                candidate.status === "CANCELLED" ? "red.6" : 
                candidate.status === "RESCHEDULED" ? "indigo.6" : 
                candidate.status === "CONFIRMED" ? "blue.6" : "indigo.6"
              } 
              variant="filled" 
              size="sm"
            >
              {candidate.status}
            </Badge>
          </Box>
          <Box style={{ position: "absolute", top: 20, right: 20 }}>
            <IconDots size={20} color="gray" style={{ cursor: "pointer" }} />
          </Box>

          <Stack align="center" mt="xl" gap="md">
            <Paper radius="xl" p={8} bg="white" shadow="sm">
                <Avatar src={candidate.avatar} size={120} radius="xl" />
            </Paper>
            <Stack align="center" gap={4}>
              <Title order={3} fw={800}>{candidate.name}</Title>
              <Text size="sm" c="dimmed" fw={600}>{candidate.role}</Text>
            </Stack>
          </Stack>

          <Stack w="100%" gap="lg" mt={40}>
            <Group gap="md">
                <ThemeIcon variant="light" color="blue" size="md" radius="sm"><IconCalendar size={18} /></ThemeIcon>
                <Box>
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">Scheduled Time</Text>
                    <Text size="sm" fw={700}>{candidate.time}</Text>
                </Box>
            </Group>
            <Group gap="md">
                <ThemeIcon variant="light" color="blue" size="md" radius="sm"><IconBriefcase size={18} /></ThemeIcon>
                <Box>
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">Interview Type</Text>
                    <Text size="sm" fw={700}>{candidate.type}</Text>
                </Box>
            </Group>
            <Group gap="md">
                <ThemeIcon variant="light" color="blue" size="md" radius="sm"><IconUsers size={18} /></ThemeIcon>
                <Box>
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">Assigned HR</Text>
                    <Group gap="xs">
                        <Avatar src={candidate.avatar} size={20} radius="xl" />
                        <Text size="sm" fw={700}>{candidate.assignedHR}</Text>
                    </Group>
                </Box>
            </Group>
          </Stack>
        </Stack>

        {/* Right Section: Details & Actions */}
        <Stack p={40} style={{ flex: 1 }} justify="space-between">
          <Group justify="space-between">
            <Title order={4} fw={800}>Interview Review</Title>
            <ActionIcon variant="subtle" color="gray" size="xl" onClick={onClose} radius="xl">
                <IconX size={24} />
            </ActionIcon>
          </Group>

          <Stack gap="xl">
            {/* Join Meeting Box */}
            <Card withBorder radius="md" p="md" bg="blue.0" style={{ borderColor: "var(--mantine-color-blue-2)" }}>
                <Group justify="space-between">
                    <Group>
                        <ThemeIcon color="blue.9" size="xl" radius="md"><IconVideo size={24} /></ThemeIcon>
                        <Box>
                            <Text fw={800} size="sm" c="blue.9">Microsoft Teams Meeting</Text>
                            <Text size="xs" c="dimmed">Access original lobby and chat history</Text>
                        </Box>
                    </Group>
                    <Button radius="md" size="sm" color="blue.9">Join Meeting</Button>
                </Group>
            </Card>

            {/* Recorded Link */}
            <Box>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={8}>Recorded Interview Link</Text>
                <Card withBorder radius="md" p={8} style={{ borderStyle: "dashed" }}>
                    <Group justify="space-between">
                        <Group>
                            <ThemeIcon variant="light" color="teal" radius="xl" size="sm"><IconPlayerPlay size={14}/></ThemeIcon>
                            <Text size="xs" fw={600} c="blue.6">https://ms-teams.internal/rec/v_8892_holoway_dep...</Text>
                        </Group>
                        <ActionIcon variant="subtle" size="sm"><IconExternalLink size={14} /></ActionIcon>
                    </Group>
                </Card>
            </Box>

            {/* Meeting Notes */}
            <Box>
                <Group justify="space-between" mb={8}>
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase">Meeting Notes</Text>
                    <Text size="xs" fw={700} c="blue.9" style={{ cursor: "pointer" }}>Edit Notes</Text>
                </Group>
                <Card withBorder radius="md" p="md" bg="gray.0">
                    <Text size="xs" style={{ fontStyle: "italic", lineHeight: 1.6 }} c="gray.7">
                        "{candidate.notes}"
                    </Text>
                </Card>
            </Box>

            {/* Metrics */}
            <Group grow gap="md">
                <Card withBorder radius="md" p="sm" ta="center" bg="gray.0">
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">Duration</Text>
                    <Title order={5} fw={900}>82m</Title>
                </Card>
                <Card withBorder radius="md" p="sm" ta="center" bg="gray.0">
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">Participants</Text>
                    <Title order={5} fw={900}>04</Title>
                </Card>
                <Card withBorder radius="md" p="sm" ta="center" bg="gray.0">
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">Avg Score</Text>
                    <Title order={5} fw={900} c="teal.6">4.8/5</Title>
                </Card>
            </Group>
          </Stack>

          <Group justify="flex-end" gap="md">
            <Button variant="subtle" color="red.6" fw={700} leftSection={<IconX size={16} />}>
              Cancel Interview
            </Button>
            <Button variant="light" color="blue.9" fw={700} leftSection={<IconCalendar size={16} />}>
              Reschedule
            </Button>
            <Button color="blue.9" radius="md" px="xl" fw={700}>
                View Full Profile
            </Button>
          </Group>
        </Stack>
      </Group>
    </Modal>
  );
}
