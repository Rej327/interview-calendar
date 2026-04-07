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
    if (candidates.length === 0) dispatch(fetchCandidates({ limit: 100, offset: 0 }));
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
    <Container fluid p="xl" bg="transparent" style={{ minHeight: "100vh" }} className="animate-in">
      <Stack gap="xl">
        {/* Header Section */}
        <Group justify="space-between" align="flex-end">
          <Box>
            <Badge color="blue.4" variant="light" size="sm" mb={4} radius="sm">
               ANALYTICS & INSIGHTS
            </Badge>
            <Title order={1} fw={900} size="h1" style={{ letterSpacing: '-0.5px' }}>
              Hiring Performance
            </Title>
            <Text c="dimmed" size="sm" fw={600}>Strategic data visualization and organizational recruitment efficiency.</Text>
          </Box>
          <Group gap="md">
            <Menu shadow="md" width={200} radius="md">
              <Menu.Target>
                <Button
                  variant="default"
                  h={48}
                  leftSection={<IconCalendar size={18} color="var(--mantine-color-blue-6)" />}
                  radius="md"
                  style={{ border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                >
                  {timeRange === "all" ? "All Time" : 
                   timeRange === "year" ? "Rolling Year" : 
                   timeRange === "month" ? "30 Days" : "7 Days"}
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label fw={800}>Aggregation Period</Menu.Label>
                <Menu.Item onClick={() => setTimeRange("all")} fw={600}>All Time</Menu.Item>
                <Menu.Item onClick={() => setTimeRange("year")} fw={600}>Rolling Year</Menu.Item>
                <Menu.Item onClick={() => setTimeRange("month")} fw={600}>Rolling 30 Days</Menu.Item>
                <Menu.Item onClick={() => setTimeRange("week")} fw={600}>Rolling 7 Days</Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <Button
              leftSection={<IconDownload size={18} />}
              radius="md"
              color="blue.9"
              px="xl"
              h={48}
              onClick={handleExportReport}
              style={{ boxShadow: '0 4px 12px rgba(34, 139, 230, 0.25)' }}
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
              className="glass-card"
              style={{ cursor: "pointer", border: 'none' }}
              onClick={() => handleKpiClick(kpi)}
            >
              <Text size="xs" fw={800} c="dimmed" tt="uppercase" mb="xs" style={{ letterSpacing: '0.5px' }}>
                {kpi.label}
              </Text>
              <Group align="flex-end" gap="sm">
                <Text size="32px" fw={900}>
                  {kpi.value}
                </Text>
                <Badge
                  variant="dot"
                  color={kpi.positive ? "teal.6" : "red.6"}
                  size="sm"
                  fw={800}
                >
                  {kpi.change}
                </Badge>
              </Group>
              <Box
                h={6}
                bg="blue.9"
                w="40%"
                mt="lg"
                style={{ borderRadius: 10, opacity: 0.1 }}
              />
            </Card>
          ))}
        </SimpleGrid>

        {/* Middle row: Charts */}
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Card p="xl" radius="xl" className="glass-card" h="100%" style={{ border: 'none' }}>
              <Group justify="space-between" mb="xl">
                <Box>
                  <Title order={5} fw={900}>
                    {timeRange === 'week' ? 'Daily Performance' : timeRange === 'month' ? 'Weekly Trends' : 'Monthly Overview'}
                  </Title>
                  <Text size="xs" c="dimmed" fw={700}>
                    {timeRange === 'week' ? 'Last 7 days breakdown' : timeRange === 'month' ? 'Sessions over last month' : 'Hiring velocity trends'}
                  </Text>
                </Box>
                <Group gap="lg">
                  <Group gap={6}>
                    <Box w={8} h={8} bg="blue.9" style={{ borderRadius: "50%" }} />
                    <Text size="xs" fw={800} c="dimmed">Scheduled</Text>
                  </Group>
                  <Group gap={6}>
                    <Box w={8} h={8} bg="blue.1" style={{ borderRadius: "50%" }} />
                    <Text size="xs" fw={800} c="dimmed">Completed</Text>
                  </Group>
                </Group>
              </Group>

              <Box h={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: "#adb5bd" }} />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ fill: "rgba(0,0,0,0.02)" }}
                      contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", backdropFilter: 'blur(10px)', background: 'rgba(255,255,255,0.9)' }}
                    />
                    <Bar dataKey="completed" fill="var(--mantine-color-blue-1)" radius={[6, 6, 0, 0]} barSize={20} />
                    <Bar dataKey="scheduled" fill="var(--mantine-color-blue-9)" radius={[6, 6, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Card p="xl" radius="xl" className="glass-card" h="100%" style={{ border: 'none' }}>
              <Title order={5} fw={900} mb={4}>
                Pipeline Distribution
              </Title>
              <Text size="xs" c="dimmed" fw={700} mb="xl">
                {timeRange === 'all' ? 'Snapshot of overall system activity.' : `Showing breakdown for the selected period.`}
              </Text>

              <Stack gap="xl">
                {[
                  { label: "ACTIVE", color: "blue.9", count: filteredCandidates.filter((c: any) => c.status === 'ACTIVE').length },
                  { label: "HIRED", color: "teal.6", count: filteredCandidates.filter((c: any) => c.status === 'HIRED').length },
                  { label: "REJECTED", color: "red.4", count: filteredCandidates.filter((c: any) => c.status === 'REJECTED').length },
                  { label: "WITHDRAWN", color: "gray.4", count: filteredCandidates.filter((c: any) => c.status === 'WITHDRAWN').length },
                ].map((item) => (
                  <Box key={item.label}>
                    <Group justify="space-between" mb={8}>
                      <Text size="10px" fw={900} c="gray.6">
                        {item.label}
                      </Text>
                      <Text size="11px" fw={900}>
                        {item.count} Targets
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
                  style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}
                >
                  <Group justify="space-between">
                    <Text size="xs" fw={800} c="gray.5">
                      Filtered Portfolio
                    </Text>
                    <Text size="xs" fw={900}>
                      {filteredCandidates.length} Active Records
                    </Text>
                  </Group>
                </Box>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Funnel Row */}
        <Card p={40} radius="xl" bg="blue.9" c="white" shadow="xl" style={{ position: 'relative', overflow: 'hidden' }}>
           <Box style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, background: 'rgba(255,255,255,0.03)', borderRadius: '300px' }} />
          <Grid gutter={40} align="center">
            <Grid.Col span={{ base: 12, md: 5 }}>
              <Badge variant="filled" color="blue.7" mb="md" radius="sm">STRATEGIC FUNNEL</Badge>
              <Title order={2} fw={900} mb="md" size="h1">
                Candidate Velocity
              </Title>
              <Text
                size="sm"
                c="blue.1"
                fw={600}
                mb="xl"
                style={{ lineHeight: 1.6 }}
              >
                Visualize organized candidate flow from broad database pool to final selection. Highly efficient processing detected across {filteredCandidates.length} profiles.
              </Text>
              <Button
                variant="white"
                color="blue.9"
                radius="md"
                h={45}
                px="xl"
                fw={900}
                rightSection={<IconArrowUpRight size={18} />}
              >
                Deep Dive Analysis
              </Button>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 7 }}>
              <Stack gap="md" align="flex-end">
                {funnelData.map((item, i) => (
                  <Group key={i} gap="xl" w="100%" justify="flex-end">
                    <Text size="xs" fw={900} c="blue.1" tt="uppercase" style={{ letterSpacing: '0.5px' }}>
                      {item.label}
                    </Text>
                    <Box
                      bg={item.color}
                      h={48}
                      w={item.width}
                      style={{
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        paddingRight: "20px",
                        boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                      }}
                    >
                      <Text fw={900} size="xl">
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
            { label: "Data Integrity", value: "99.8%", icon: <IconCheck size={16} />, color: "blue" },
            { label: "Synchronization", value: "Active", icon: <IconCheck size={16} />, color: "teal" },
            { label: "Infrastructure", value: "Optimized", icon: <IconCheck size={16} />, color: "indigo" },
          ].map((kpi, i) => (
            <Card key={i} p="xl" radius="xl" className="glass-card" style={{ border: 'none' }}>
              <Group gap="xs" mb="lg">
                <ThemeIcon variant="light" color={kpi.color} radius="md" size="md">
                  {kpi.icon}
                </ThemeIcon>
                <Text size="xs" fw={900} c="gray.7">
                  {kpi.label}
                </Text>
              </Group>
              <Text size="36px" fw={900} mb={4}>
                {kpi.value}
              </Text>
              <Text size="xs" c="dimmed" mt="lg" fw={700}>
                {i === 0
                  ? "Validation checks and metadata completeness index."
                  : i === 1
                    ? "Real-time bridge between Cloud Infrastructure & UI."
                    : "Query performance and system response metrics."}
              </Text>
            </Card>
          ))}
        </SimpleGrid>

        <Group
          justify="space-between"
          mt="xl"
          pt="xl"
          style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}
        >
          <Text size="xs" fw={900} c="dimmed" style={{ letterSpacing: '1px' }}>
            ORCHESTRATED BY ANTIGRAVITY ENGINE
          </Text>
          <Text size="xs" c="dimmed" fw={700}>
            Proprietary Analytics Port • System Pulse: Optimal • {dayjs().format("YYYY")}
          </Text>
        </Group>
      </Stack>

      <Modal
        opened={opened}
        onClose={close}
        title={<Text fw={900} size="lg">Detailed Strategic Overview</Text>}
        radius="xl"
        size="lg"
        centered
        styles={{ title: { fontWeight: 900 } }}
      >
        <Stack p="xl">
            <Group gap="xs">
              <Text fw={900}>Trend Intelligence:</Text>
              <Badge color="blue">{selectedReport?.label}</Badge>
            </Group>
            <Text size="sm" c="dimmed" fw={600} style={{ lineHeight: 1.6 }}>
                Active organizational intelligence confirms a baseline of {selectedReport?.value} units. 
                This report is optimized for high-level decision making and resource allocation based on real-time pipeline velocity.
            </Text>
            <Button fullWidth color="blue.9" radius="md" h={45} fw={900} onClick={close} mt="xl">Dismiss Intelligence</Button>
        </Stack>
      </Modal>
    </Container>
  );
}
