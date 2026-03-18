"use client";

import React from "react";
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
  ThemeIcon,
  Timeline,
  Textarea,
  Paper,
  Overlay,
  Center,
  ActionIcon,
} from "@mantine/core";
import {
  IconCheck,
  IconClock,
  IconPlayerPlay,
  IconThumbUp,
  IconThumbDown,
  IconReportSearch,
  IconBulb,
  IconTrendingUp,
} from "@tabler/icons-react";

export default function PostReviewPage() {
  return (
    <Container fluid p="xl" bg="gray.0" style={{ minHeight: "100vh" }}>
      <Stack gap="xl">
        <Box>
            <Text size="xs" fw={800} tt="uppercase" c="dimmed">Candidates › Post-Interview Review</Text>
            <Title order={1} fw={900} size={32} mt={4}>Elena Rodriguez</Title>
            <Group gap="xs" mt={4}>
                <Text size="sm" fw={600} c="gray.7">Senior Product Designer • Design Department</Text>
                <Badge variant="light" color="blue" size="sm">UPCOMING REVIEW</Badge>
            </Group>
        </Box>

        <Grid gutter={40}>
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Stack gap="xl">
                {/* Video Player Mock */}
                <Card radius="xl" p={0} style={{ position: "relative", height: 440, overflow: "hidden" }}>
                    <Box 
                        style={{ 
                            backgroundImage: "url('https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1000')", 
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            height: "100%",
                            width: "100%"
                        }} 
                    />
                    <Overlay color="#000" opacity={0.4} zIndex={1} />
                    <Center style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 2 }}>
                        <Stack align="center" gap="md">
                            <ActionIcon variant="filled" color="blue.9" size={80} radius="xl">
                                <IconPlayerPlay size={40} />
                            </ActionIcon>
                            <Text c="white" fw={800} size="lg">Recorded Interview — Session #3 (Final Round)</Text>
                        </Stack>
                    </Center>
                    <Box style={{ position: "absolute", bottom: 20, left: 20, zIndex: 3 }}>
                         <Group gap="xs">
                            <Badge bg="rgba(0,0,0,0.5)" c="white" size="xs">45:12 DURATION</Badge>
                            <Badge bg="rgba(0,0,0,0.5)" c="white" size="xs">1080P HD</Badge>
                         </Group>
                    </Box>
                </Card>

                {/* Feedback Summary */}
                <Card radius="xl" p={40} shadow="sm">
                    <Group justify="space-between" mb="xl">
                        <Title order={3} fw={800} style={{ borderLeft: "4px solid var(--mantine-color-blue-9)", paddingLeft: "16px" }}>HR Feedback Summary</Title>
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase">Authored by Sarah Jenkins</Text>
                    </Group>

                    <Text size="xs" fw={800} tt="uppercase" c="dimmed" mb={8}>Candidate Performance</Text>
                    <Text size="sm" c="gray.7" style={{ lineHeight: 1.8 }}>
                        Elena demonstrated exceptional clarity in her design process. She walked through the "Loom Revamp" project with a strong emphasis on user accessibility and systematic thinking. Her responses to conflict-resolution questions were mature and data-driven. 
                    </Text>

                    <Grid mt={40} gutter="md">
                        <Grid.Col span={6}>
                            <Card bg="blue.0" p="xl" radius="lg">
                                <Group gap="xs" mb="md">
                                    <ThemeIcon variant="transparent" color="teal.6"><IconCheck size={20}/></ThemeIcon>
                                    <Text size="xs" fw={800} tt="uppercase" c="teal.6">Key Strengths</Text>
                                </Group>
                                <Stack gap="sm">
                                    <Group gap="xs" align="flex-start">
                                        <Box w={4} h={4} bg="gray.5" mt={8} style={{ borderRadius: "50%" }} />
                                        <Text size="xs" fw={700}>Systematic approach to complex problems</Text>
                                    </Group>
                                    <Group gap="xs" align="flex-start">
                                        <Box w={4} h={4} bg="gray.5" mt={8} style={{ borderRadius: "50%" }} />
                                        <Text size="xs" fw={700}>Strong visual storytelling skills</Text>
                                    </Group>
                                    <Group gap="xs" align="flex-start">
                                        <Box w={4} h={4} bg="gray.5" mt={8} style={{ borderRadius: "50%" }} />
                                        <Text size="xs" fw={700}>High emotional intelligence</Text>
                                    </Group>
                                </Stack>
                            </Card>
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Card bg="gray.0" p="xl" radius="lg">
                                <Group gap="xs" mb="md">
                                    <ThemeIcon variant="transparent" color="orange.6"><IconBulb size={20}/></ThemeIcon>
                                    <Text size="xs" fw={800} tt="uppercase" c="orange.6">Growth Areas</Text>
                                </Group>
                                <Stack gap="sm">
                                    <Group gap="xs" align="flex-start">
                                        <Box w={4} h={4} bg="gray.5" mt={8} style={{ borderRadius: "50%" }} />
                                        <Text size="xs" fw={700}>Limited experience with React frameworks</Text>
                                    </Group>
                                    <Group gap="xs" align="flex-start">
                                        <Box w={4} h={4} bg="gray.5" mt={8} style={{ borderRadius: "50%" }} />
                                        <Text size="xs" fw={700}>Public speaking confidence could improve</Text>
                                    </Group>
                                </Stack>
                            </Card>
                        </Grid.Col>
                    </Grid>
                </Card>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Stack gap="xl">
                {/* Interview Journey */}
                <Card radius="xl" p="xl" shadow="sm">
                    <Title order={6} fw={800} mb="xl" tt="uppercase">Interview Journey</Title>
                    <Timeline active={2} bulletSize={32} lineWidth={2}>
                        <Timeline.Item 
                            bullet={<ThemeIcon size="lg" radius="xl" color="teal.5"><IconCheck size={18}/></ThemeIcon>}
                            title={<Text size="xs" fw={900}>STEP 1 • PASSED</Text>}
                        >
                            <Box ml={4}>
                                <Text fw={900} size="sm">Initial HR Screening</Text>
                                <Text size="xs" c="dimmed">Oct 12, 2023 • 30 mins</Text>
                            </Box>
                        </Timeline.Item>
                        <Timeline.Item 
                            bullet={<ThemeIcon size="lg" radius="xl" color="teal.5"><IconCheck size={18}/></ThemeIcon>}
                            title={<Text size="xs" fw={900}>STEP 2 • PASSED</Text>}
                        >
                            <Box ml={4}>
                                <Text fw={900} size="sm">Portfolio Review</Text>
                                <Text size="xs" c="dimmed">Oct 15, 2023 • 60 mins</Text>
                            </Box>
                        </Timeline.Item>
                        <Timeline.Item 
                            bullet={<ThemeIcon size="lg" radius="xl" color="blue.9"><IconPlayerPlay size={18}/></ThemeIcon>}
                            title={<Text size="xs" fw={900} c="blue.6">STEP 3 • IN REVIEW</Text>}
                        >
                            <Box ml={4}>
                                <Text fw={900} size="sm">Final Round Technical</Text>
                                <Text size="xs" c="dimmed">Oct 19, 2023 • 90 mins</Text>
                            </Box>
                        </Timeline.Item>
                    </Timeline>
                </Card>

                {/* Final Decision */}
                <Card radius="xl" p="xl" shadow="sm" bg="blue.9" c="white">
                    <Title order={4} fw={800} mb="md">Final Decision</Title>
                    <Text size="xs" c="blue.1" mb="xl" style={{ lineHeight: 1.6 }}>
                        As the Department Head, your review will determine if Elena proceeds to the offer stage.
                    </Text>
                    <Stack gap="md">
                        <Button color="blue.6" radius="md" size="md" leftSection={<IconThumbUp size={20}/>}>Approve Candidate</Button>
                        <Button variant="outline" color="white" radius="md" size="md" leftSection={<IconThumbDown size={20}/>}>Reject Candidate</Button>
                    </Stack>
                    <Box mt="xl">
                        <Text size="xs" fw={800} tt="uppercase" c="blue.2" mb={8}>Decision Notes (Internal)</Text>
                        <Textarea 
                            placeholder="Add additional context for HR..." 
                            radius="md" 
                            styles={{ input: { backgroundColor: "rgba(255,255,255,0.1)", border: "none", color: "white" } }} 
                        />
                    </Box>
                </Card>

                {/* Recruiter Widget */}
                <Card radius="xl" p="lg" shadow="sm" bg="blue.0">
                    <Group gap="md">
                        <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus" size="lg" radius="xl" />
                        <Box>
                            <Text size="xs" fw={700} c="dimmed" tt="uppercase">Recruiter Info</Text>
                            <Text fw={900} size="sm">Marcus Thorne</Text>
                            <Text size="xs" c="dimmed">marcus@formsly.com</Text>
                        </Box>
                    </Group>
                </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
