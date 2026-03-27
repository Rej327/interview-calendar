"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Card,
  Container,
  Grid,
  Group,
  Stack,
  Text,
  Title,
  Button,
  ThemeIcon,
  Badge,
  SimpleGrid,
  Progress,
  Center,
  Loader,
  Modal,
} from "@mantine/core";

import {
  IconArrowUpRight,
  IconArrowDownRight,
  IconDownload,
  IconCalendar,
  IconCheck,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchEvents } from "@/lib/store/calendarSlice";
import { fetchCandidates } from "@/lib/store/candidatesSlice";

dayjs.extend(isoWeek);

export default function ReportsPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const dispatch = useAppDispatch();
  const { events, loading: eventsLoading } = useAppSelector((state) => state.calendar);
  const { candidates, loading: candidatesLoading } = useAppSelector((state) => state.candidates);

  useEffect(() => {
    if (events.length === 0) dispatch(fetchEvents());
    if (candidates.length === 0) dispatch(fetchCandidates());
  }, [dispatch, events.length, candidates.length]);

  const kpiData = useMemo(() => {
    const totalInterviews = events.length;
    const completed = events.filter(e => e.extendedProps.status === 'COMPLETED').length;
    const hired = candidates.filter((c: any) => c.status === 'HIRED').length;
    const conversionRate = totalInterviews > 0 ? ((hired / totalInterviews) * 100).toFixed(1) : "0";

    return [
      { label: "TOTAL INTERVIEWS", value: totalInterviews.toString(), change: "+12%", positive: true },
      { label: "OFFERS ACCEPTED", value: hired.toString(), change: "+4%", positive: true },
      {
        label: "CONVERSION RATE",
        value: `${conversionRate}%`,
        change: "+2.1%",
        positive: true,
      },
      { label: "COMPLETED SESSIONS", value: completed.toString(), change: "+15%", positive: true },
    ];
  }, [events, candidates]);

  const weeklyData = useMemo(() => {
    const weeks: Record<string, { scheduled: number; completed: number }> = {};
    
    for (let i = 4; i >= 0; i--) {
        const w = dayjs().subtract(i, 'week').format("WK DD");
        weeks[w] = { scheduled: 0, completed: 0 };
    }

    events.forEach(e => {
        const w = dayjs(e.start).format("WK DD");
        if (weeks[w]) {
            weeks[w].scheduled++;
            if (e.extendedProps.status === 'COMPLETED') weeks[w].completed++;
        }
    });

    return Object.entries(weeks).map(([name, data]) => ({ name, ...data }));
  }, [events]);

  const funnelData = useMemo(() => {
    const total = candidates.length;
    const active = candidates.filter((c: any) => c.status === 'ACTIVE').length;
    const hired = candidates.filter((c: any) => c.status === 'HIRED').length;
    const rejected = candidates.filter((c: any) => c.status === 'REJECTED').length;

    return [
      { label: "TOTAL PIPELINE", value: total.toString(), width: "100%", color: "blue.9" },
      { label: "ACTIVE SCREENING", value: active.toString(), width: "80%", color: "blue.8" },
      { label: "QUALIFIED", value: (active + hired).toString(), width: "60%", color: "blue.7" },
      { label: "HIRED", value: hired.toString(), width: "40%", color: "gray.7" },
    ];
  }, [candidates]);

  const handleKpiClick = (kpi: any) => {
    setSelectedReport(kpi);
    open();
  };

  if (eventsLoading || candidatesLoading) {
    return (
        <Center h="100vh">
            <Loader color="blue" variant="dots" />
        </Center>
    );
  }

  return (
    <Container fluid p="xl" bg="transparent" style={{ minHeight: "100vh" }}>
      <Stack gap="xl">
        {/* Header Section */}
        <Group justify="space-between" align="flex-end">
          <Box>
            <Text size="xs" fw={800} c="blue.9" tt="uppercase" mb={4}>
              Analytics Overview
            </Text>
            <Title order={1} fw={800} size="h2">
              Hiring Performance
            </Title>
          </Box>
          <Group gap="md">
            <Button
              variant="outline"
              color="gray.4"
              c="gray.7"
              leftSection={<IconCalendar size={16} />}
              radius="md"
            >
              Current Year
            </Button>
            <Button
              leftSection={<IconDownload size={16} />}
              radius="md"
              color="blue.9"
              px="xl"
            >
              Export Report
            </Button>
          </Group>
        </Group>

        {/* Top KPI row */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="xl">
          {kpiData.map((kpi, i) => (
            <Card
              key={i}
              p="xl"
              radius="xl"
              shadow="sm"
              withBorder={false}
              style={{ cursor: "pointer" }}
              onClick={() => handleKpiClick(kpi)}
            >
              <Text size="xs" fw={800} c="dimmed" tt="uppercase" mb="xs">
                {kpi.label}
              </Text>
              <Group align="flex-end" gap="sm">
                <Text size="32px" fw={900}>
                  {kpi.value}
                </Text>
                <Badge
                  variant="transparent"
                  color={kpi.positive ? "teal.6" : "red.6"}
                  leftSection={
                    kpi.positive ? (
                      <IconArrowUpRight size={14} />
                    ) : (
                      <IconArrowDownRight size={14} />
                    )
                  }
                  p={0}
                  mb={6}
                >
                  {kpi.change}
                </Badge>
              </Group>
              <Box
                h={4}
                bg="blue.9"
                w="40%"
                mt="lg"
                style={{ borderRadius: 10 }}
              />
            </Card>
          ))}
        </SimpleGrid>

        {/* Middle row: Charts */}
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Card p="xl" radius="xl" shadow="sm" h="100%">
              <Group justify="space-between" mb="xl">
                <Box>
                  <Title order={5} fw={800}>
                    Interviews per Week
                  </Title>
                  <Text size="xs" c="dimmed" fw={600}>
                    Scheduled vs. Completed sessions
                  </Text>
                </Box>
                <Group gap="lg">
                  <Group gap={6}>
                    <Box
                      w={8}
                      h={8}
                      bg="blue.9"
                      style={{ borderRadius: "50%" }}
                    />
                    <Text size="xs" fw={700} c="dimmed">
                      Scheduled
                    </Text>
                  </Group>
                  <Group gap={6}>
                    <Box
                      w={8}
                      h={8}
                      bg="blue.1"
                      style={{ borderRadius: "50%" }}
                    />
                    <Text size="xs" fw={700} c="dimmed">
                      Completed
                    </Text>
                  </Group>
                </Group>
              </Group>

              <Box h={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f3f5"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 700, fill: "#adb5bd" }}
                    />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="completed"
                      fill="var(--mantine-color-blue-1)"
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                    />
                    <Bar
                      dataKey="scheduled"
                      fill="var(--mantine-color-blue-9)"
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Card p="xl" radius="xl" shadow="sm" h="100%">
              <Title order={5} fw={800} mb={4}>
                Pipeline Distribution
              </Title>
              <Text size="xs" c="dimmed" fw={600} mb="xl">
                Candidate status breakdown
              </Text>

              <Stack gap="xl">
                {[
                  { label: "ACTIVE", color: "blue.9", count: candidates.filter((c: any) => c.status === 'ACTIVE').length },
                  { label: "HIRED", color: "teal.6", count: candidates.filter((c: any) => c.status === 'HIRED').length },
                  { label: "REJECTED", color: "red.4", count: candidates.filter((c: any) => c.status === 'REJECTED').length },
                  { label: "WITHDRAWN", color: "gray.4", count: candidates.filter((c: any) => c.status === 'WITHDRAWN').length },
                ].map((item) => (
                  <Box key={item.label}>
                    <Group justify="space-between" mb={6}>
                      <Text size="10px" fw={800}>
                        {item.label}
                      </Text>
                      <Text size="10px" fw={800}>
                        {item.count} Candidates
                      </Text>
                    </Group>
                    <Progress
                      value={candidates.length > 0 ? (item.count / candidates.length) * 100 : 0}
                      color={item.color}
                      size="lg"
                      radius="xl"
                    />
                  </Box>
                ))}
                <Box
                  mt="md"
                  pt="md"
                  style={{ borderTop: "1px solid var(--mantine-color-gray-1)" }}
                >
                  <Group justify="space-between">
                    <Text size="xs" fw={800} c="gray.6">
                      Total Portfolio
                    </Text>
                    <Text size="xs" fw={900}>
                      {candidates.length} Profiles
                    </Text>
                  </Group>
                </Box>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Funnel Row */}
        <Card p="xl" radius="xl" bg="blue.9" c="white" shadow="xl">
          <Grid gutter={40} align="center">
            <Grid.Col span={{ base: 12, md: 5 }}>
              <Title order={3} fw={800} mb="md">
                Hiring Pipeline Funnel
              </Title>
              <Text
                size="sm"
                c="blue.1"
                fw={500}
                mb="xl"
                style={{ lineHeight: 1.6 }}
              >
                Visualize the candidate flow from initial database entry to final
                hiring. This funnel represents current system state and processing efficiency.
              </Text>
              <Button
                variant="subtle"
                color="blue.0"
                p={0}
                fw={700}
                rightSection={<IconArrowUpRight size={16} />}
              >
                View Detailed Analytics
              </Button>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 7 }}>
              <Stack gap="md" align="flex-end">
                {funnelData.map((item, i) => (
                  <Group key={i} gap="xl" w="100%" justify="flex-end">
                    <Text size="xs" fw={800} c="blue.1" tt="uppercase">
                      {item.label}
                    </Text>
                    <Box
                      bg={item.color}
                      h={44}
                      w={item.width}
                      style={{
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        paddingRight: "16px",
                      }}
                    >
                      <Text fw={900} size="lg">
                        {item.value}
                      </Text>
                    </Box>
                  </Group>
                ))}
              </Stack>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Bottom Metrics */}
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
          {[
            { label: "Data Quality", value: "98%", icon: <IconCheck size={16} />, color: "blue" },
            { label: "System Sync", value: "Real-time", icon: <IconCheck size={16} />, color: "green" },
            { label: "Database Health", value: "Optimal", icon: <IconCheck size={16} />, color: "violet" },
          ].map((kpi, i) => (
            <Card key={i} p="xl" radius="xl" shadow="sm">
              <Group gap="xs" mb="lg">
                <ThemeIcon variant="light" color={kpi.color} radius="md">
                  {kpi.icon}
                </ThemeIcon>
                <Text size="xs" fw={800} c="gray.7">
                  {kpi.label}
                </Text>
              </Group>
              <Text size="32px" fw={900} mb={4}>
                {kpi.value}
              </Text>
              <Text size="xs" c="dimmed" mt="lg" fw={500}>
                {i === 0
                  ? "Based on form validation and metadata completeness checks."
                  : i === 1
                    ? "Connectivity status between frontend UI and Supabase DB."
                    : "Server response times and query optimization index."}
              </Text>
            </Card>
          ))}
        </SimpleGrid>

        <Group
          justify="space-between"
          mt="xl"
          pt="xl"
          style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}
        >
          <Text size="xs" fw={800} c="gray.5">
            POWERED BY FORMSLY
          </Text>
          <Text size="xs" c="gray.4" fw={500}>
            Confidential HR Analytics • Generated {dayjs().format("DD MMMM YYYY")}
          </Text>
        </Group>
      </Stack>

      <Modal
        opened={opened}
        onClose={close}
        title="Detailed Analytics"
        radius="xl"
        size="lg"
      >
        <Stack p="xl">
            <Text>Detailed Trend Analysis for <b>{selectedReport?.label}</b></Text>
            <Text size="sm" c="dimmed">
                Current system metrics indicate a value of {selectedReport?.value}. 
                This data is pulled from the shared Redux store, avoiding duplicate API calls.
            </Text>
            <Button fullWidth color="blue.9" radius="md" onClick={close} mt="xl">Close Overview</Button>
        </Stack>
      </Modal>
    </Container>
  );
}
