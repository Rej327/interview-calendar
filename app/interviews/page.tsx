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
  Avatar,
  ActionIcon,
  Tabs,
  rem,
  ThemeIcon,
  AvatarGroup,
} from "@mantine/core";
import {
  IconBriefcase,
  IconVideo,
  IconMapPin,
  IconClock,
  IconChevronRight,
  IconCalendarEvent,
  IconDotsVertical,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import InterviewReviewModal from "@/components/calendar/InterviewReviewModal";

const interviewSessions = [
  { id: 1, candidate: "Marcus Thorne", role: "Senior Frontend Engineer", time: "11:00 AM - 12:00 PM", type: "PRACTICAL TEST", status: "PENDING", color: "indigo", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus", interviewer: "Sarah Miller" },
  { id: 2, candidate: "Elena Rodriguez", role: "Technical Lead", time: "2:30 PM - 3:30 PM", type: "DEPARTMENT INTERVIEW", status: "CONFIRMED", color: "blue", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena", interviewer: "David Chen" },
  { id: 3, candidate: "Julia Vance", role: "Backend Engineer", time: "4:00 PM - 5:00 PM", type: "BACKGROUND CHECK", status: "COMPLETED", color: "teal", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Julia", interviewer: "HR Ops" },
  { id: 4, candidate: "Aiden Scott", role: "UX Researcher", time: "9:00 AM - 10:00 AM", type: "HR INTERVIEW", status: "CANCELLED", color: "red", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aiden", interviewer: "Sarah Miller" },
];

export default function InterviewsPage() {
  const [activeTab, setActiveTab] = useState<string | null>("today");
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  const handleCardClick = (session: any) => {
    setSelectedCandidate({
        name: session.candidate,
        role: session.role,
        avatar: session.avatar,
        status: session.status,
        time: session.time,
        type: session.type,
        assignedHR: session.interviewer,
        notes: "Candidate has strong initial performance in general screening. Expected to perform well in deep tech rounds. High aptitude for systemic thinking."
    });
    open();
  };

  return (
    <Container fluid p="xl" bg="transparent" style={{ minHeight: "100vh" }}>
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="flex-end">
          <Box>
            <Title order={1} fw={800} size="h2">Interview Sessions</Title>
            <Text c="dimmed" size="sm" fw={500}>Monitor and manage all candidate interview sessions.</Text>
          </Box>
          <Group gap="md">
            <Button leftSection={<IconCalendarEvent size={16} />} radius="md" color="blue.9" px="xl">
                Schedule New Session
            </Button>
          </Group>
        </Group>

        <Grid gutter={40}>
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Stack gap="xl">
                <Tabs value={activeTab} onChange={setActiveTab} color="blue" variant="pills" radius="md">
                    <Tabs.List>
                        <Tabs.Tab value="today" fw={700}>Today (4)</Tabs.Tab>
                        <Tabs.Tab value="this-week" fw={700}>This Week (12)</Tabs.Tab>
                        <Tabs.Tab value="upcoming" fw={700}>Upcoming (28)</Tabs.Tab>
                        <Tabs.Tab value="past" fw={700}>Past Interviews</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="today" pt="xl">
                        <Stack gap="md">
                            {interviewSessions.length > 0 ? (
                                interviewSessions.map(session => (
                                    <Card 
                                        key={session.id} 
                                        p="xl" 
                                        radius="xl" 
                                        shadow="sm" 
                                        withBorder={false} 
                                        onClick={() => handleCardClick(session)}
                                        style={{ cursor: "pointer", borderLeft: `6px solid var(--mantine-color-${session.color}-6)` }}
                                    >
                                        <Grid align="center" gutter={30}>
                                            <Grid.Col span={4}>
                                                <Group gap="md">
                                                    <Avatar src={session.avatar} radius="xl" size="md" />
                                                    <Box>
                                                        <Text size="sm" fw={800}>{session.candidate}</Text>
                                                        <Text size="10px" c="dimmed" fw={600}>{session.role}</Text>
                                                    </Box>
                                                </Group>
                                            </Grid.Col>
                                            <Grid.Col span={3}>
                                                <Stack gap={4}>
                                                    <Text size="xs" fw={800} c="gray.6">{(session.id === 2 || session.id === 3) ? "Video Call" : "In-Person"}</Text>
                                                    <Group gap={6}>
                                                        {(session.id === 2 || session.id === 3) ? <IconVideo size={14} color="#adb5bd"/> : <IconMapPin size={14} color="#adb5bd"/>}
                                                        <Text size="xs" fw={700}>{session.id % 2 === 0 ? "Zoom Meet" : "HQ • Office 204"}</Text>
                                                    </Group>
                                                </Stack>
                                            </Grid.Col>
                                            <Grid.Col span={3}>
                                                <Stack gap={4}>
                                                    <Text size="xs" fw={800} c="gray.6">{session.time}</Text>
                                                    <Group gap={6}>
                                                        <IconClock size={14} color="#adb5bd"/>
                                                        <Text size="xs" fw={700}>Interviewers: 2</Text>
                                                    </Group>
                                                </Stack>
                                            </Grid.Col>
                                            <Grid.Col span={2}>
                                                <Group justify="flex-end" gap="xs">
                                                    <Badge 
                                                        size="xs" 
                                                        radius="sm" 
                                                        color={session.status === "COMPLETED" ? "teal.6" : session.status === "CANCELLED" ? "red.6" : session.status === "CONFIRMED" ? "blue.6" : "indigo.6"}
                                                    >
                                                        {session.status}
                                                    </Badge>
                                                    <ActionIcon variant="subtle" color="gray"><IconDotsVertical size={16}/></ActionIcon>
                                                </Group>
                                            </Grid.Col>
                                        </Grid>
                                    </Card>
                                ))
                            ) : (
                                <Card p={80} radius="xl" withBorder style={{ borderStyle: "dashed" }}>
                                    <Stack align="center" gap="md">
                                        <ThemeIcon size={64} radius="xl" variant="light" color="gray.4">
                                            <IconCalendarEvent size={32} color="gray" />
                                        </ThemeIcon>
                                        <Box ta="center">
                                            <Title order={4} fw={800}>No Sessions Found</Title>
                                            <Text size="sm" c="dimmed" fw={500}>There are no interviews scheduled for this period.</Text>
                                        </Box>
                                        <Button variant="light" color="blue" radius="md">
                                            Clear Filters
                                        </Button>
                                    </Stack>
                                </Card>
                            )}
                        </Stack>

                    </Tabs.Panel>
                </Tabs>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Stack gap="xl">
                <Card p="xl" radius="xl" shadow="sm">
                    <Title order={5} fw={800} mb="xl">SESSION INSIGHTS</Title>
                    <Stack gap="xl">
                        <Box style={{ borderLeft: "4px solid var(--mantine-color-blue-9)", paddingLeft: "16px" }}>
                            <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={4}>Interviews Today</Text>
                            <Text size="24px" fw={900}>12 Sessions</Text>
                            <Text size="10px" fw={700} c="teal.6">+2 From Yesterday</Text>
                        </Box>
                        <Box style={{ borderLeft: "4px solid var(--mantine-color-teal-6)", paddingLeft: "16px" }}>
                            <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={4}>Avg. Satisfaction</Text>
                            <Text size="24px" fw={900}>4.8/5.0</Text>
                        </Box>
                    </Stack>
                </Card>

                <Card p="xl" radius="xl" shadow="sm" bg="teal.6" c="white">
                    <Group gap="sm" mb="md">
                        <ThemeIcon size="lg" radius="md" color="teal.4"><IconBriefcase size={20}/></ThemeIcon>
                        <Title order={6} fw={800}>Staff Availability</Title>
                    </Group>
                    <Text size="xs" c="teal.0" fw={500} mb="xl">
                        Ensure you have enough interviewers available for upcoming priority rounds.
                    </Text>
                    <AvatarGroup spacing="sm">
                        <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" size="sm" radius="xl" />
                        <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=David" size="sm" radius="xl" />
                        <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=HR" size="sm" radius="xl" />
                        <Avatar size="sm" radius="xl">+5</Avatar>
                    </AvatarGroup>
                    <Button fullWidth mt="xl" radius="md" color="teal.8" fw={700}>Check Full Schedule</Button>
                </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>

      <InterviewReviewModal 
        opened={opened} 
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

