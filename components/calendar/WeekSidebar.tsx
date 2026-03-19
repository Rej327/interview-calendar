"use client";

import React from "react";
import {
  Box,
  Card,
  Group,
  Stack,
  Text,
  ActionIcon,
  Grid,
  ThemeIcon,
} from "@mantine/core";
import {
  IconDots,
  IconPlus,
  IconChevronRight,
} from "@tabler/icons-react";

export default function WeekSidebar() {
  return (
    <Stack gap="xl">
        <Card p="xl" radius="xl" shadow="sm">
            <Text size="xs" fw={800} c="dimmed" tt="uppercase" mb="xl">Today's Load</Text>
            <Grid gutter="md">
                <Grid.Col span={6}>
                    <Box p="lg" bg="blue.0" style={{ borderRadius: "16px" }}>
                        <Text size="28px" fw={900}>08</Text>
                        <Text size="10px" fw={700} c="blue.9">TOTAL SLOTS</Text>
                    </Box>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Box p="lg" bg="teal.0" style={{ borderRadius: "16px" }}>
                        <Text size="28px" fw={900}>03</Text>
                        <Text size="10px" fw={700} c="teal.9">INTERVIEWS</Text>
                    </Box>
                </Grid.Col>
            </Grid>
            <Group justify="space-between" mt="xl">
                <Text size="xs" fw={700} c="dimmed">Calendar Health</Text>
                <Text size="xs" fw={800} c="teal.6">High (92%)</Text>
            </Group>
        </Card>

        <Card p="xl" radius="xl" shadow="sm">
            <Group justify="space-between" mb="xl">
                <Text size="xs" fw={800} c="dimmed" tt="uppercase">Upcoming Priority</Text>
                <ActionIcon variant="transparent" color="gray"><IconDots size={16} /></ActionIcon>
            </Group>
            <Stack gap="md">
                {[
                    { title: "Senior Backend Dev", subtitle: "Technical Round • 2 PM", icon: <IconPlus size={16}/>, color: "blue" },
                    { title: "Product Designer", subtitle: "Portfolio Walk • 4 PM", icon: <IconPlus size={16}/>, color: "indigo" },
                    { title: "Data Scientist", subtitle: "Final Round • Tomorrow", icon: <IconPlus size={16}/>, color: "teal" },
                ].map((item, i) => (
                    <Group key={i} justify="space-between" style={{ cursor: 'pointer' }}>
                        <Group gap="md">
                            <ThemeIcon variant="light" color={item.color} size="md" radius="md">
                                {item.icon}
                            </ThemeIcon>
                            <Box>
                                <Text size="xs" fw={800}>{item.title}</Text>
                                <Text size="10px" c="dimmed" fw={600}>{item.subtitle}</Text>
                            </Box>
                        </Group>
                        <IconChevronRight size={14} color="gray" />
                    </Group>
                ))}
            </Stack>
        </Card>

        <Card radius="xl" p={0} style={{ position: 'relative', overflow: 'hidden', height: 200 }}>
             <Box style={{ 
                position: 'absolute', 
                inset: 0, 
                backgroundColor: 'var(--mantine-color-gray-1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
             }}>
                <Text size="xs" c="dimmed" ta="center" px="xl" fw={500}>
                    "Precision in scheduling reflects professionalism in hiring."
                </Text>
             </Box>
        </Card>
    </Stack>
  );
}
