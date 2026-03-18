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
  TextInput,
  Avatar,
  ThemeIcon,
  Breadcrumbs,
  Anchor,
  Alert,
  Divider,
} from "@mantine/core";
import {
  IconCalendar,
  IconClock,
  IconChevronRight,
  IconCheck,
  IconUserPlus,
  IconExternalLink,
  IconAlertCircle,
} from "@tabler/icons-react";

export default function ReschedulePage() {
  const items = [
    { title: "Interviews", href: "#" },
    { title: "Active", href: "#" },
    { title: "Reschedule Request", href: "#" },
  ].map((item, index) => (
    <Anchor href={item.href} key={index} size="xs" c="dimmed" fw={600}>
      {item.title}
    </Anchor>
  ));

  return (
    <Container fluid p="xl" bg="gray.0" style={{ minHeight: "100vh" }}>
      <Stack gap="xl">
        <Breadcrumbs separator={<IconChevronRight size={12} stroke={3} color="gray" />}>{items}</Breadcrumbs>
        
        <Grid gutter={40}>
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Card radius="xl" p={40} shadow="sm">
                <Stack gap="xl">
                    <Box>
                        <Title order={2} fw={800}>Reschedule Interview</Title>
                        <Text size="sm" c="dimmed" fw={500} mt={4}>Update the scheduling details for Sarah Jenkins' Senior UX position.</Text>
                    </Box>

                    <Grid gutter="xl">
                        <Grid.Col span={6}>
                            <Text size="xs" fw={800} tt="uppercase" mb={8}>New Interview Date</Text>
                            <TextInput 
                                value="11/28/2023" 
                                radius="md" 
                                size="md" 
                                styles={{ input: { borderBottom: "2px solid var(--mantine-color-blue-9)", borderTop: 0, borderLeft: 0, borderRight: 0, borderRadius: 0 } }}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Text size="xs" fw={800} tt="uppercase" mb={8}>Start Time</Text>
                            <TextInput 
                                value="02:30 PM" 
                                radius="md" 
                                size="md" 
                                styles={{ input: { borderBottom: "2px solid var(--mantine-color-blue-9)", borderTop: 0, borderLeft: 0, borderRight: 0, borderRadius: 0 } }}
                            />
                        </Grid.Col>
                    </Grid>

                    <Box>
                         <Text size="xs" fw={800} tt="uppercase" mb={12}>Assigned Interviewer</Text>
                         <Group grow gap="lg">
                            <Card withBorder radius="md" p="md" style={{ borderColor: "var(--mantine-color-blue-9)", borderWidth: "2px" }}>
                                <Group justify="space-between">
                                    <Group>
                                        <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Elena" radius="md" size="lg" />
                                        <Box>
                                            <Text fw={800} size="sm">Elena Rodriguez</Text>
                                            <Text size="xs" c="dimmed">Senior Recruiter</Text>
                                        </Box>
                                    </Group>
                                    <Badge color="teal" variant="filled" size="xs" leftSection={<IconCheck size={10}/>}>AVAILABLE</Badge>
                                </Group>
                            </Card>

                            <Card withBorder radius="md" p="md" style={{ borderStyle: "dashed" }} bg="gray.0">
                                <Group justify="center" gap="sm">
                                    <IconUserPlus size={20} color="gray" />
                                    <Text size="sm" fw={700} c="dimmed">Change Interviewer</Text>
                                </Group>
                            </Card>
                         </Group>
                    </Box>

                    <Group gap="md">
                        <Button color="blue.9" radius="md" size="md" px="xl">Update Interview Schedule</Button>
                        <Button variant="light" color="blue" radius="md" size="md" px="xl">Cancel</Button>
                    </Group>

                    <Divider my="md" />

                    <Grid gutter="lg">
                        <Grid.Col span={6}>
                            <Card withBorder p="lg" radius="lg" style={{ opacity: 0.6 }}>
                                <Text size="xs" fw={800} tt="uppercase" c="dimmed" mb="md">Original Schedule</Text>
                                <Stack gap="sm">
                                    <Group gap="xs">
                                        <IconCalendar size={18} color="gray"/>
                                        <Text fw={700} size="sm">Nov 24, 2023</Text>
                                    </Group>
                                    <Group gap="xs">
                                        <IconClock size={18} color="gray"/>
                                        <Text fw={700} size="sm">10:00 AM — 11:00 AM</Text>
                                    </Group>
                                    <Badge variant="light" color="gray" size="xs">RESCHEDULED</Badge>
                                </Stack>
                            </Card>
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Card withBorder p="lg" radius="lg" style={{ borderColor: "var(--mantine-color-blue-6)", borderWidth: "2px" }} bg="blue.0">
                                <Text size="xs" fw={800} tt="uppercase" c="blue.9" mb="md">Proposed New Schedule</Text>
                                <Stack gap="sm">
                                    <Group gap="xs">
                                        <IconCalendar size={18} color="blue"/>
                                        <Title order={5} fw={900}>Nov 28, 2023</Title>
                                    </Group>
                                    <Group gap="xs">
                                        <IconClock size={18} color="blue"/>
                                        <Title order={5} fw={900}>02:30 PM — 03:30 PM</Title>
                                    </Group>
                                    <Badge variant="light" color="blue" size="xs">NEW PROPOSAL</Badge>
                                </Stack>
                            </Card>
                        </Grid.Col>
                    </Grid>
                </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Stack gap="xl">
                {/* Candidate Widget */}
                <Card radius="xl" p="xl" shadow="sm">
                    <Stack align="center" gap="md">
                        <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" size={100} radius="xl" />
                        <Box ta="center">
                            <Title order={3} fw={900}>Sarah Jenkins</Title>
                            <Text size="sm" c="dimmed" fw={600}>Senior Product Designer</Text>
                        </Box>
                        <Group grow w="100%" gap="xs">
                            <Card bg="blue.0" p="xs" ta="center" radius="md">
                                <Text size="xs" fw={700} c="blue.9" tt="uppercase">Stage</Text>
                                <Text fw={900} size="sm" c="blue.9">Technical</Text>
                            </Card>
                            <Card bg="blue.0" p="xs" ta="center" radius="md">
                                <Text size="xs" fw={700} c="blue.9" tt="uppercase">Rating</Text>
                                <Text fw={900} size="sm" c="blue.9">4.8/5.0</Text>
                            </Card>
                        </Group>
                        <Button variant="transparent" rightSection={<IconChevronRight size={14}/>} size="xs" c="blue.9" fw={800}>View Full Portfolio</Button>
                    </Stack>
                </Card>

                {/* Validation Passed */}
                <Alert color="teal" radius="xl" variant="filled" icon={<IconCheck size={24}/>}>
                    <Title order={5} fw={800} mb={4}>Validation Passed</Title>
                    <Text size="xs" style={{ lineHeight: 1.4 }}>The selected slot is clear for Elena Rodriguez and the conference room.</Text>
                </Alert>

                {/* Recent Activity */}
                <Card radius="xl" p="xl" shadow="sm">
                    <Title order={6} fw={800} mb="xl" tt="uppercase">Recent Activity</Title>
                    <Stack gap="xl">
                        <Group align="flex-start" wrap="nowrap">
                            <Box h={40} style={{ borderLeft: "4px solid var(--mantine-color-blue-9)", marginLeft: "4px" }} pt={0}>
                                <Stack gap={0} ml={12}>
                                    <Text size="xs" fw={800}>Reschedule requested</Text>
                                    <Text size="xs" c="dimmed">Today, 09:15 AM</Text>
                                </Stack>
                            </Box>
                        </Group>
                        <Group align="flex-start" wrap="nowrap">
                            <Box h={40} style={{ borderLeft: "4px solid var(--mantine-color-blue-2)", marginLeft: "4px" }} pt={0}>
                                <Stack gap={0} ml={12}>
                                    <Text size="xs" fw={800}>Candidate confirmed change</Text>
                                    <Text size="xs" c="dimmed">Yesterday, 04:30 PM</Text>
                                </Stack>
                            </Box>
                        </Group>
                        <Group align="flex-start" wrap="nowrap">
                            <Box h={40} style={{ borderLeft: "4px solid var(--mantine-color-blue-2)", marginLeft: "4px" }} pt={0}>
                                <Stack gap={0} ml={12}>
                                    <Text size="xs" fw={800}>Initial interview scheduled</Text>
                                    <Text size="xs" c="dimmed">Nov 20, 2023</Text>
                                </Stack>
                            </Box>
                        </Group>
                    </Stack>
                </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
