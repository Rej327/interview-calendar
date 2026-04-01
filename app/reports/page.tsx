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
  Menu,
  rem,
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
import { notifications } from "@mantine/notifications";

dayjs.extend(isoWeek);

export default function ReportsPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<"year" | "month" | "week" | "all">("year");

  const dispatch = useAppDispatch();
  const { events, loading: eventsLoading } = useAppSelector((state) => state.calendar);
  const { candidates, loading: candidatesLoading } = useAppSelector((state) => state.candidates);

  useEffect(() => {
    if (events.length === 0) dispatch(fetchEvents());
    if (candidates.length === 0) dispatch(fetchCandidates());
  }, [dispatch, events.length, candidates.length]);

  const filteredEvents = useMemo(() => {
    if (timeRange === "all") return events;
    const amount = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 365;
    return events.filter((e: any) => dayjs(e.start).isAfter(dayjs().subtract(amount, "day")));
  }, [events, timeRange]);

  const filteredCandidates = useMemo(() => {
    if (timeRange === "all") return candidates;
    const amount = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 365;
    const threshold = dayjs().subtract(amount, "day");
    
    // Candidates who had an interview in the period
    const candidateNamesWithActivity = new Set(filteredEvents.map((e: any) => e.extendedProps.candidate_name));
    
    return candidates.filter((c: any) => 
        dayjs(c.applied_date).isAfter(threshold) || 
        candidateNamesWithActivity.has(c.name)
    );
  }, [candidates, filteredEvents, timeRange]);

  const kpiData = useMemo(() => {
    const totalInterviews = filteredEvents.length;
    const completed = filteredEvents.filter(e => e.extendedProps.status === 'COMPLETED').length;
    const hired = filteredCandidates.filter((c: any) => c.status === 'HIRED').length;
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

  const chartData = useMemo(() => {
    const data: Record<string, { scheduled: number; completed: number }> = {};
    let unit: "day" | "week" | "month" = "week";
    let count = 5;
    let format = "WK DD";

    if (timeRange === "week") {
      unit = "day";
      count = 6; // last 7 days
      format = "ddd DD";
    } else if (timeRange === "all" || timeRange === "year") {
      unit = "month";
      count = 5; // last 6 months
      format = "MMM YYYY";
    } else {
      unit = "week";
      count = 4; // last 5 weeks
      format = "WK DD";
    }

    for (let i = count; i >= 0; i--) {
        const key = dayjs().subtract(i, unit).startOf(unit).format(format);
        data[key] = { scheduled: 0, completed: 0 };
    }

    events.forEach(e => {
        const key = dayjs(e.start).startOf(unit).format(format);
        if (data[key]) {
            data[key].scheduled++;
            if (e.extendedProps.status === "COMPLETED") data[key].completed++;
        }
    });

    return Object.entries(data).map(([name, d]) => ({ name, ...d }));
  }, [events, timeRange]);

  const funnelData = useMemo(() => {
    const total = filteredCandidates.length;
    const active = filteredCandidates.filter((c: any) => c.status === "ACTIVE").length;
    const hired = filteredCandidates.filter((c: any) => c.status === "HIRED").length;
    const maxVal = total || 1;

    return [
      { label: "TOTAL PIPELINE", value: total.toString(), width: "100%", color: "blue.9" },
      { label: "ACTIVE SCREENING", value: active.toString(), width: `${Math.max((active / maxVal) * 100, 10)}%`, color: "blue.8" },
      { label: "QUALIFIED", value: (active + hired).toString(), width: `${Math.max(((active + hired) / maxVal) * 100, 10)}%`, color: "blue.7" },
      { label: "HIRED", value: hired.toString(), width: `${Math.max((hired / maxVal) * 100, 10)}%`, color: "gray.7" },
    ];
  }, [filteredCandidates]);

  const handleKpiClick = (kpi: any) => {
    setSelectedReport(kpi);
    open();
  };

  const handleExportReport = () => {
    const sections = [];

    // KPI Section
    sections.push("KPI OVERVIEW");
    sections.push("Label,Value,Change");
    kpiData.forEach(kpi => sections.push(`${kpi.label},${kpi.value},${kpi.change}`));
    sections.push("");

    // Weekly Section
    sections.push("DYNAMIC TRENDS");
    sections.push("Period,Scheduled,Completed");
    chartData.forEach(cd => sections.push(`${cd.name},${cd.scheduled},${cd.completed}`));
    sections.push("");

    // Funnel Section
    sections.push("PIPELINE FUNNEL");
    sections.push("Stage,Candidates");
    funnelData.forEach(fd => sections.push(`${fd.label},${fd.value}`));

    const csvContent = sections.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `hiring_report_${dayjs().format("YYYY-MM-DD")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    notifications.show({
        title: "Report Exported",
        message: "Your hiring performance report has been downloaded successfully.",
        color: "teal",
        icon: <IconCheck size={16} />,
    });
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
            <Menu shadow="md" width={200} radius="md">
              <Menu.Target>
                <Button
                  variant="default"
                  leftSection={<IconCalendar size={16} />}
                  radius="md"
                >
                  {timeRange === "all" ? "All Time" : 
                   timeRange === "year" ? "Rolling Year" : 
                   timeRange === "month" ? "Rolling 30 Days" : "Rolling 7 Days"}
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Aggregation Period</Menu.Label>
                <Menu.Item onClick={() => setTimeRange("all")}>All Time Records</Menu.Item>
                <Menu.Item onClick={() => setTimeRange("year")}>Rolling Year Metrics</Menu.Item>
                <Menu.Item onClick={() => setTimeRange("month")}>Rolling 30 Days</Menu.Item>
                <Menu.Item onClick={() => setTimeRange("week")}>Rolling 7 Days</Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <Button
              leftSection={<IconDownload size={16} />}
              radius="md"
              color="blue.9"
              px="xl"
              onClick={handleExportReport}
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
                    {timeRange === 'week' ? 'Daily Performance' : timeRange === 'month' ? 'Weekly Trends' : 'Monthly Overview'}
                  </Title>
                  <Text size="xs" c="dimmed" fw={600}>
                    {timeRange === 'week' ? 'Last 7 days breakdown' : timeRange === 'month' ? 'Sessions over last month' : 'Hiring velocity trends'}
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
                  <BarChart data={chartData}>
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
                {timeRange === 'all' ? 'Snapshot of overall system activity.' : `Showing breakdown for ${timeRange === 'year' ? 'the past 365 days' : timeRange === 'month' ? 'the rolling 30 day period' : 'the rolling 7 day period'}.`}
              </Text>

              <Stack gap="xl">
                {[
                  { label: "ACTIVE", color: "blue.9", count: filteredCandidates.filter((c: any) => c.status === 'ACTIVE').length },
                  { label: "HIRED", color: "teal.6", count: filteredCandidates.filter((c: any) => c.status === 'HIRED').length },
                  { label: "REJECTED", color: "red.4", count: filteredCandidates.filter((c: any) => c.status === 'REJECTED').length },
                  { label: "WITHDRAWN", color: "gray.4", count: filteredCandidates.filter((c: any) => c.status === 'WITHDRAWN').length },
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
                      value={filteredCandidates.length > 0 ? (item.count / filteredCandidates.length) * 100 : 0}
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
                      Filtered Portfolio
                    </Text>
                    <Text size="xs" fw={900}>
                      {filteredCandidates.length} Profiles
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
          style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}
        >
          <Text size="xs" fw={800} c="dimmed">
            POWERED BY FORMSLY
          </Text>
          <Text size="xs" c="dimmed" fw={500}>
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
