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
import {
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";

interface WeekViewProps {
  onEventClick: (event: any) => void;
}

export default function WeekView({ onEventClick }: WeekViewProps) {
    const hours = ["08 AM", "09 AM", "10 AM", "11 AM", "12 PM", "01 PM", "02 PM", "03 PM", "04 PM", "05 PM"];
    const days = [
        { name: "MON", date: "11" },
        { name: "TUE", date: "12" },
        { name: "WED", date: "13", current: true },
        { name: "THU", date: "14" },
        { name: "FRI", date: "15" },
        { name: "SAT", date: "16" },
        { name: "SUN", date: "17" },
    ];

    return (
        <Stack gap="xl">
            <Group justify="space-between">
                <Title order={4} fw={800}>September 11 – 17, 2023</Title>
                <Group gap={4}>
                    <ActionIcon variant="subtle" color="gray" size="sm"><IconChevronLeft size={16}/></ActionIcon>
                    <Button variant="subtle" color="gray" size="xs" fw={700}>TODAY</Button>
                    <ActionIcon variant="subtle" color="gray" size="sm"><IconChevronRight size={16}/></ActionIcon>
                </Group>
            </Group>

            <Card radius="xl" p={0} withBorder shadow="sm" style={{ overflow: "hidden" }}>
                <Box p="md" bg="blue.0" style={{ borderBottom: "1px solid var(--mantine-color-blue-1)" }}>
                    <Grid columns={15} gutter={0}>
                        <Grid.Col span={1} />
                        {days.map((day) => (
                            <Grid.Col key={day.name} span={2}>
                                <Stack gap={0} align="center">
                                    <Text size="10px" fw={800} c={day.current ? "blue.9" : "gray.6"}>{day.name}</Text>
                                    <Text size="xl" fw={900} c={day.current ? "blue.9" : "black"}>{day.date}</Text>
                                </Stack>
                            </Grid.Col>
                        ))}
                    </Grid>
                </Box>

                <Box style={{ position: "relative" }}>
                    {hours.map((hour) => (
                        <Box key={hour} style={{ borderBottom: "1px solid var(--mantine-color-gray-1)", height: "80px" }}>
                            <Grid columns={15} h="100%" gutter={0}>
                                <Grid.Col span={1} p="xs">
                                    <Text size="9px" fw={700} c="dimmed">{hour}</Text>
                                </Grid.Col>
                                {days.map((day, i) => (
                                    <Grid.Col key={i} span={2} style={{ borderLeft: "1px solid var(--mantine-color-gray-0)" }}>
                                        {day.current && hour === "10 AM" && (
                                            <Box 
                                                m={4} 
                                                p={8} 
                                                bg="blue.6" 
                                                style={{ borderRadius: "8px", cursor: 'pointer', height: '140px', position: 'absolute', width: '13%', zIndex: 10 }}
                                                onClick={() => onEventClick({
                                                    title: "Culture Fit: Alexander Wright",
                                                    avatars: ["https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"],
                                                    status: "UPCOMING",
                                                    time: "10:00 AM - 11:30 AM",
                                                    assigned: "HR Team"
                                                })}
                                            >
                                                <Text size="9px" fw={800} c="blue.1">10:00 AM — 11:30 AM</Text>
                                                <Text size="xs" fw={800} c="white">Interview: Alexander W.</Text>
                                            </Box>
                                        )}
                                    </Grid.Col>
                                ))}
                            </Grid>
                        </Box>
                    ))}
                </Box>
            </Card>
        </Stack>
    );
}
