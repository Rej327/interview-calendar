"use client";

import React from "react";
import {
  Box,
  Card,
  Group,
  Stack,
  Text,
  Button,
  Grid,
  Avatar,
} from "@mantine/core";
import dayjs from "dayjs";
import { CalendarEvent } from "@/lib/types/interview";

interface MonthOverviewProps {
  events: CalendarEvent[];
  selectedDate: Date;
}

export default function MonthOverview({ events, selectedDate }: MonthOverviewProps) {
  const monthEvents = events.filter(e => dayjs(e.start).isSame(selectedDate, 'month'));
  const completed = monthEvents.filter(e => e.extendedProps.status === "COMPLETED").length;
  const pending = monthEvents.length - completed;

  return (
    <Stack gap="xl">
        <Card p="xl" radius="xl" bg="blue.9" c="white" shadow="xl">
            <Text size="xs" fw={700} c="blue.2" tt="uppercase" mb="xs">Monthly Overview</Text>
            <Text size="64px" fw={900} mb="xl">{monthEvents.length}</Text>
            <Text size="sm" fw={600} c="blue.2" mb="xl">SCHEDULED INTERVIEWS</Text>
            
            <Grid gutter="xl" mb="xl">
                <Grid.Col span={6}>
                    <Text size="xl" fw={900}>{pending}</Text>
                    <Text size="10px" fw={600} c="blue.2">PENDING/UPCOMING</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Text size="xl" fw={900}>{completed}</Text>
                    <Text size="10px" fw={600} c="blue.2">COMPLETED</Text>
                </Grid.Col>
            </Grid>
            
            <Button fullWidth radius="md" color="blue.7" fw={800}>VIEW FULL ANALYTICS</Button>
        </Card>

        <Box>
            <Text size="xs" fw={800} c="dimmed" tt="uppercase" mb="lg">Stage Filter</Text>
            <Stack gap="xs">
                <Group gap="sm">
                    <Box w={8} h={8} bg="blue.9" style={{ borderRadius: "50%" }} />
                    <Text size="xs" fw={700}>Technical Assessment</Text>
                </Group>
                <Group gap="sm">
                    <Box w={8} h={8} bg="teal.5" style={{ borderRadius: "50%" }} />
                    <Text size="xs" fw={700}>Culture Fit</Text>
                </Group>
                <Group gap="sm">
                    <Box w={8} h={8} bg="blue.3" style={{ borderRadius: "50%" }} />
                    <Text size="xs" fw={700}>Executive Review</Text>
                </Group>
            </Stack>
        </Box>

        <Box mt="xl">
            <Text size="xs" fw={800} c="dimmed" tt="uppercase" mb="lg">Recruiters</Text>
            <Avatar.Group spacing="sm">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Avatar key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} radius="xl" size="sm" />
                ))}
                <Avatar radius="xl" size="sm" color="gray" fw={700} style={{ fontSize: "10px" }}>+4</Avatar>
            </Avatar.Group>
        </Box>
    </Stack>
  );
}
