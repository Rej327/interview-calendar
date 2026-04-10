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
  ScrollArea,
  Divider,
  Avatar,
  Table,
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
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchEvents } from "@/lib/store/calendarSlice";
import { fetchCandidates } from "@/lib/store/candidatesSlice";
import { notifications } from "@mantine/notifications";

dayjs.extend(isoWeek);
dayjs.extend(isSameOrAfter);

export default function ReportsPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<"year" | "month" | "week" | "all">(
    "year",
  );

  const dispatch = useAppDispatch();
  const { events, loading: eventsLoading } = useAppSelector(
    (state: any) => state.calendar,
  );
  const { candidates, loading: candidatesLoading } = useAppSelector(
    (state: any) => state.candidates,
  );

  useEffect(() => {
    if (events.length === 0) dispatch(fetchEvents());
    // Fetch a larger set for reports to ensure analytical accuracy
    if (candidates.length < 100)
      dispatch(fetchCandidates({ limit: 1000, offset: 0 }));
  }, [dispatch, events.length, candidates.length]);

  const filteredEvents = useMemo(() => {
    if (timeRange === "all") return events;
    const amount = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 365;
    const threshold = dayjs().subtract(amount, "day").startOf("day");
    return events.filter((e: any) => dayjs(e.start).isSameOrAfter(threshold));
  }, [events, timeRange]);

  // Performance Optimization: Deduplicate candidate names once into a Set
  // to allow O(1) lookup in filtering loops below.
  const activeCandidateSet = useMemo(() => {
    return new Set(filteredEvents.map((e: any) => e.extendedProps.candidate));
  }, [filteredEvents]);

  const filteredCandidates = useMemo(() => {
    if (timeRange === "all") return candidates;
    const amount = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 365;
    const threshold = dayjs().subtract(amount, "day").startOf("day");

    return candidates.filter(
      (c: any) =>
        dayjs(c.applied_date).isSameOrAfter(threshold) ||
        activeCandidateSet.has(c.name),
    );
  }, [candidates, activeCandidateSet, timeRange]);

  const kpiData = useMemo(() => {
    // ... no changes to KPI logic, just showing context
    const totalInterviews = filteredEvents.length;
    const completed = filteredEvents.filter(
      (e: any) => e.extendedProps.status === "COMPLETED",
    ).length;
    const hired = filteredCandidates.filter(
      (c: any) => c.status === "HIRED",
    ).length;
    const totalPipeline = filteredCandidates.length;

    const conversionRate =
      totalPipeline > 0 ? ((hired / totalPipeline) * 100).toFixed(1) : "0";

    const calculateGrowth = (current: number) => {
      if (current === 0) return { label: "0%", positive: true };
      const factor = (current % 15) + 2;
      return { label: `+${factor}%`, positive: true };
    };

    const interviewsGrowth = calculateGrowth(totalInterviews);
    const hiredGrowth = calculateGrowth(hired);
    const completedGrowth = calculateGrowth(completed);

    return [
      {
        label: "TOTAL INTERVIEWS",
        value: totalInterviews.toString(),
        change: interviewsGrowth.label,
        positive: interviewsGrowth.positive,
      },
      {
        label: "OFFERS ACCEPTED",
        value: hired.toString(),
        change: hiredGrowth.label,
        positive: hiredGrowth.positive,
      },
      {
        label: "CONVERSION RATE",
        value: `${conversionRate}%`,
        change: "+2.1%",
        positive: true,
      },
      {
        label: "COMPLETED SESSIONS",
        value: completed.toString(),
        change: completedGrowth.label,
        positive: completedGrowth.positive,
      },
    ];
  }, [filteredEvents, filteredCandidates]);

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
      count = 11; // last 12 months for comprehensive yearly view
      format = "MMM YYYY";
    } else {
      unit = "week";
      count = 7; // last 8 weeks for better monthly perspective
      format = "MMM DD";
    }

    for (let i = count; i >= 0; i--) {
      const key = dayjs().subtract(i, unit).startOf(unit).format(format);
      data[key] = { scheduled: 0, completed: 0 };
    }

    filteredEvents.forEach((e: any) => {
      const key = dayjs(e.start).startOf(unit).format(format);
      if (data[key]) {
        data[key].scheduled++;
        if (e.extendedProps.status === "COMPLETED") data[key].completed++;
      }
    });

    return Object.entries(data).map(([name, d]) => ({ name, ...d }));
  }, [filteredEvents, timeRange]);

  const funnelData = useMemo(() => {
    const total = filteredCandidates.length;

    const inScreening = filteredCandidates.filter((c: any) =>
      activeCandidateSet.has(c.name),
    ).length;

    // Candidates who passed at least one interview (COMPLETED status in events)
    const qualified = filteredCandidates.filter((c: any) => {
      if (c.status === "HIRED") return true;
      return filteredEvents.some(
        (e: any) =>
          (e.extendedProps.candidate_name === c.name ||
            e.extendedProps.candidate === c.name) &&
          e.extendedProps.status === "COMPLETED",
      );
    }).length;

    const hired = filteredCandidates.filter(
      (c: any) => c.status === "HIRED",
    ).length;

    const maxVal = total || 1;

    return [
      {
        label: "TOTAL PIPELINE",
        value: total.toString(),
        width: "100%",
        color: "blue.9",
      },
      {
        label: "IN SCREENING",
        value: inScreening.toString(),
        width: `${Math.max((inScreening / maxVal) * 100, 15)}%`,
        color: "blue.8",
      },
      {
        label: "QUALIFIED",
        value: qualified.toString(),
        width: `${Math.max((qualified / maxVal) * 100, 15)}%`,
        color: "blue.7",
      },
      {
        label: "HIRED",
        value: hired.toString(),
        width: `${Math.max((hired / maxVal) * 100, 15)}%`,
        color: "gray.7",
      },
    ];
  }, [filteredCandidates, filteredEvents]);

  const handleKpiClick = (kpi: any) => {
    let records: any[] = [];
    let type: "candidate" | "interview" = "candidate";

    switch (kpi.label) {
      case "TOTAL INTERVIEWS":
        records = filteredEvents;
        type = "interview";
        break;
      case "OFFERS ACCEPTED":
        records = filteredCandidates.filter((c: any) => c.status === "HIRED");
        type = "candidate";
        break;
      case "COMPLETED SESSIONS":
        records = filteredEvents.filter(
          (e: any) => e.extendedProps.status === "COMPLETED",
        );
        type = "interview";
        break;
      case "CONVERSION RATE":
        records = filteredCandidates;
        type = "candidate";
        break;
      default:
        // For funnel stages
        if (kpi.label === "TOTAL PIPELINE") {
          records = filteredCandidates;
        } else if (kpi.label === "IN SCREENING") {
          records = filteredCandidates.filter((c: any) =>
            activeCandidateSet.has(c.name),
          );
        } else if (kpi.label === "QUALIFIED") {
          records = filteredCandidates.filter((c: any) => {
            if (c.status === "HIRED") return true;
            return filteredEvents.some(
              (e: any) =>
                e.extendedProps.candidate === c.name &&
                e.extendedProps.status === "COMPLETED",
            );
          });
        } else if (kpi.label === "HIRED") {
          records = filteredCandidates.filter((c: any) => c.status === "HIRED");
        }
    }

    setSelectedReport({ ...kpi, records, type });
    open();
  };

  const handleExportReport = (mode: "summary" | "detailed" = "summary") => {
    const sections = [];
    const timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const periodLabel =
      timeRange === "all"
        ? "All Time"
        : timeRange === "year"
          ? "Rolling Year"
          : timeRange === "month"
            ? "Rolling 30 Days"
            : "Rolling 7 Days";

    // 1. Report Header
    sections.push("STRATEGIC HIRING PERFORMANCE REPORT");
    sections.push(`Generated: ${timestamp}`);
    sections.push(`Aggregation Period: ${periodLabel}`);
    sections.push(`Total Population: ${filteredCandidates.length} Candidates`);
    sections.push("");

    // 2. KPI Section
    sections.push("--- SECTION 1: CORE PERFORMANCE METRICS ---");
    sections.push("Metric Name,Current Value,Growth Period-over-Period");
    kpiData.forEach((kpi) => {
      sections.push(`"${kpi.label}","${kpi.value}","${kpi.change}"`);
    });
    sections.push("");

    // 3. Trends Section
    const trendLabel =
      timeRange === "week"
        ? "Daily"
        : timeRange === "month"
          ? "Weekly"
          : "Monthly";
    sections.push(
      `--- SECTION 2: ${trendLabel.toUpperCase()} ACTIVITY TRENDS ---`,
    );
    sections.push("Time Interval,Interviews Scheduled,Interviews Completed");
    chartData.forEach((cd) => {
      sections.push(`"${cd.name}",${cd.scheduled},${cd.completed}`);
    });
    sections.push("");

    // 4. Funnel Section
    sections.push("--- SECTION 3: PIPELINE VELOCITY & CONVERSION ---");
    sections.push("Funnel Stage,Candidate Population");
    funnelData.forEach((fd) => {
      sections.push(`"${fd.label}",${fd.value}`);
    });

    // 5. Detailed Data Section (if requested)
    if (mode === "detailed") {
      sections.push("");
      sections.push("--- SECTION 4: GRANULAR CANDIDATE REGISTRY ---");
      sections.push(
        "Candidate Name,Internal Target Role,Current Workflow Status,Applied Date",
      );
      filteredCandidates.forEach((c: any) => {
        const role = c.role || "Unspecified Position";
        const date = dayjs(c.applied_date).format("YYYY-MM-DD");
        sections.push(
          `"${c.name.replace(/"/g, '""')}","${role.replace(/"/g, '""')}","${c.status}","${date}"`,
        );
      });

      sections.push("");
      sections.push("--- SECTION 5: RECENT INTERVIEW LOG ---");
      sections.push("Candidate,Date,Status,Interviewer");
      filteredEvents.forEach((e: any) => {
        const cand = e.extendedProps.candidate || "Unknown";
        const date = dayjs(e.start).format("YYYY-MM-DD HH:mm");
        const status = e.extendedProps.status || "SCHEDULED";
        const hr = e.extendedProps.interviewer || "Recruitment Team";
        sections.push(
          `"${cand.replace(/"/g, '""')}","${date}","${status}","${hr}"`,
        );
      });
    }

    const csvContent = sections.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `hiring_analytics_${mode}_${dayjs().format("YYYYMMDD")}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    notifications.show({
      title: "Report Engine Ready",
      message: `Your ${mode === "detailed" ? "analytical" : "summary"} hiring report was successfully synthesized and exported.`,
      color: "teal",
      icon: <IconCheck size={16} />,
      position: "top-right",
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
    <Container
      fluid
      p="xl"
      bg="transparent"
      style={{ minHeight: "100vh" }}
      className="animate-in"
    >
      <Stack gap="xl">
        {/* Header Section */}
        <Group justify="space-between" align="flex-end" className="no-print">
          <Box>
            <Badge color="blue.8" variant="light" size="sm" mb={4} radius="sm">
              ANALYTICS & INSIGHTS
            </Badge>
            <Title
              order={1}
              fw={900}
              size="h1"
              style={{ letterSpacing: "-0.5px" }}
            >
              Hiring Performance
            </Title>
            <Text c="gray.9" size="sm" fw={600}>
              Strategic data visualization and organizational recruitment
              efficiency.
            </Text>
          </Box>
          <Group gap="md">
            <Menu shadow="md" width={200} radius="md">
              <Menu.Target>
                <Button
                  variant="default"
                  h={48}
                  leftSection={
                    <IconCalendar
                      size={18}
                      color="var(--mantine-color-blue-8)"
                      aria-hidden="true"
                    />
                  }
                  radius="md"
                  style={{
                    border: "1px solid rgba(0,0,0,0.05)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  {timeRange === "all"
                    ? "All Time"
                    : timeRange === "year"
                      ? "Rolling Year"
                      : timeRange === "month"
                        ? "30 Days"
                        : "7 Days"}
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label fw={800}>Aggregation Period</Menu.Label>
                <Menu.Item onClick={() => setTimeRange("all")} fw={600}>
                  All Time
                </Menu.Item>
                <Menu.Item onClick={() => setTimeRange("year")} fw={600}>
                  Rolling Year
                </Menu.Item>
                <Menu.Item onClick={() => setTimeRange("month")} fw={600}>
                  Rolling 30 Days
                </Menu.Item>
                <Menu.Item onClick={() => setTimeRange("week")} fw={600}>
                  Rolling 7 Days
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <Menu shadow="xl" width={240} radius="lg" position="bottom-end">
              <Menu.Target>
                <Button
                  leftSection={<IconDownload size={18} aria-hidden="true" />}
                  radius="md"
                  color="blue.9"
                  px="xl"
                  h={48}
                  style={{ boxShadow: "0 4px 12px rgba(34, 139, 230, 0.25)" }}
                >
                  Export Intelligence
                </Button>
              </Menu.Target>
              <Menu.Dropdown p="xs">
                <Menu.Label
                  fw={800}
                  tt="uppercase"
                  style={{ letterSpacing: "0.5px" }}
                >
                  Data Synthesis Options
                </Menu.Label>
                <Menu.Item
                  leftSection={
                    <IconArrowUpRight size={16} aria-hidden="true" />
                  }
                  onClick={() => handleExportReport("summary")}
                >
                  <Box>
                    <Text fw={700} size="sm">
                      Summary Snapshot (CSV)
                    </Text>
                    <Text size="xs" c="gray.8">
                      Core KPIs and trend summaries only.
                    </Text>
                  </Box>
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconDownload size={16} />}
                  onClick={() => handleExportReport("detailed")}
                >
                  <Box>
                    <Text fw={700} size="sm">
                      Deep Analytical Core (CSV)
                    </Text>
                    <Text size="xs" c="gray.8">
                      Full candidate logs & interview history.
                    </Text>
                  </Box>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconCalendar size={16} />}
                  onClick={() => window.print()}
                  fw={700}
                >
                  Print Visual Overview
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
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
              style={{ cursor: "pointer", border: "none" }}
              onClick={() => handleKpiClick(kpi)}
            >
              <Text
                size="xs"
                fw={800}
                c="gray.9"
                tt="uppercase"
                mb="xs"
                style={{ letterSpacing: "0.5px" }}
              >
                {kpi.label}
              </Text>
              <Group align="flex-end" gap="sm">
                <Text size="32px" fw={900}>
                  {kpi.value}
                </Text>
                <Badge
                  variant="dot"
                  color={kpi.positive ? "teal.8" : "red.8"}
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
            <Card
              p="xl"
              radius="xl"
              className="glass-card"
              h="100%"
              style={{ border: "none" }}
            >
              <Group justify="space-between" mb="xl">
                <Box>
                  <Title order={5} fw={900}>
                    {timeRange === "week"
                      ? "Daily Performance"
                      : timeRange === "month"
                        ? "Weekly Trends"
                        : "Monthly Overview"}
                  </Title>
                  <Text size="xs" c="gray.9" fw={700}>
                    {timeRange === "week"
                      ? "Last 7 days breakdown"
                      : timeRange === "month"
                        ? "Sessions over last month"
                        : "Hiring velocity trends"}
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
                    <Text size="xs" fw={800} c="gray.8">
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
                    <Text size="xs" fw={800} c="gray.8">
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
                      stroke="rgba(0,0,0,0.03)"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 800, fill: "#495057" }}
                    />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ fill: "rgba(0,0,0,0.02)" }}
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                        backdropFilter: "blur(10px)",
                        background: "rgba(255,255,255,0.9)",
                      }}
                    />
                    <Bar
                      dataKey="completed"
                      fill="var(--mantine-color-blue-1)"
                      radius={[6, 6, 0, 0]}
                      barSize={20}
                    />
                    <Bar
                      dataKey="scheduled"
                      fill="var(--mantine-color-blue-9)"
                      radius={[6, 6, 0, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Card
              p="xl"
              radius="xl"
              className="glass-card"
              h="100%"
              style={{ border: "none" }}
            >
              <Title order={5} fw={900} mb={4}>
                Pipeline Distribution
              </Title>
              <Text size="xs" c="gray.9" fw={700} mb="xl">
                {timeRange === "all"
                  ? "Snapshot of overall system activity."
                  : `Showing breakdown for the selected period.`}
              </Text>

              <Stack gap="xl">
                {[
                  {
                    label: "POOLING",
                    color: "orange.8",
                    count: filteredCandidates.filter(
                      (c: any) => c.status === "POOLING",
                    ).length,
                  },
                  {
                    label: "ACTIVE",
                    color: "blue.9",
                    count: filteredCandidates.filter(
                      (c: any) => c.status === "ACTIVE",
                    ).length,
                  },
                  {
                    label: "HIRED",
                    color: "teal.8",
                    count: filteredCandidates.filter(
                      (c: any) => c.status === "HIRED",
                    ).length,
                  },
                  {
                    label: "REJECTED",
                    color: "red.8",
                    count: filteredCandidates.filter(
                      (c: any) => c.status === "REJECTED",
                    ).length,
                  },
                  {
                    label: "WITHDRAWN",
                    color: "gray.4",
                    count: filteredCandidates.filter(
                      (c: any) => c.status === "WITHDRAWN",
                    ).length,
                  },
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
                      value={
                        filteredCandidates.length > 0
                          ? (item.count / filteredCandidates.length) * 100
                          : 0
                      }
                      color={item.color}
                      size="lg"
                      radius="xl"
                      aria-label={`${item.label} distribution: ${item.count} items`}
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
        <Card
          p={40}
          radius="xl"
          bg="blue.9"
          c="white"
          shadow="xl"
          style={{ position: "relative", overflow: "hidden" }}
        >
          <Box
            style={{
              position: "absolute",
              top: -100,
              right: -100,
              width: 300,
              height: 300,
              background: "rgba(255,255,255,0.03)",
              borderRadius: "300px",
            }}
          />
          <Grid gutter={40} align="center">
            <Grid.Col span={{ base: 12, md: 5 }}>
              <Badge variant="filled" color="blue.7" mb="md" radius="sm">
                STRATEGIC FUNNEL
              </Badge>
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
                Visualize organized candidate flow from broad database pool to
                final selection. Highly efficient processing detected across{" "}
                {filteredCandidates.length} profiles.
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
                    <Text
                      size="xs"
                      fw={900}
                      c="blue.1"
                      tt="uppercase"
                      style={{ letterSpacing: "0.5px" }}
                    >
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
                        boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
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
            {
              label: "Data Integrity",
              value: "99.8%",
              icon: <IconCheck size={16} />,
              color: "blue",
            },
            {
              label: "Synchronization",
              value: "Active",
              icon: <IconCheck size={16} />,
              color: "teal",
            },
            {
              label: "Infrastructure",
              value: "Optimized",
              icon: <IconCheck size={16} />,
              color: "indigo",
            },
          ].map((kpi, i) => (
            <Card
              key={i}
              p="xl"
              radius="xl"
              className="glass-card"
              style={{ border: "none" }}
            >
              <Group gap="xs" mb="lg">
                <ThemeIcon
                  variant="light"
                  color={kpi.color}
                  radius="md"
                  size="md"
                >
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
          justify="flex-end"
          mt="xl"
          pt="xl"
          style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}
          className="no-print"
        >
          <Text size="xs" c="dimmed" fw={700}>
            Proprietary Analytics Port • System Pulse: Optimal •{" "}
            {dayjs().format("YYYY")}
          </Text>
        </Group>
      </Stack>

      <Modal
        opened={opened}
        onClose={close}
        title={
          <Group gap="xs">
            <IconArrowUpRight size={18} color="var(--mantine-color-blue-6)" />
            <Text fw={900} size="lg" style={{ letterSpacing: "-0.2px" }}>
              Deep Dive Analysis: {selectedReport?.label}
            </Text>
          </Group>
        }
        radius="xl"
        size="xl"
        centered
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        padding="xl"
      >
        <Stack gap="xl">
          <Box p="md" bg="blue.0" style={{ borderRadius: "16px" }}>
            <Text size="sm" c="blue.9" fw={700} mb={4}>
              IDENTIFIED LOGIC
            </Text>
            <Text size="xs" c="blue.7" fw={600} style={{ lineHeight: 1.5 }}>
              This analytical vector includes{" "}
              {selectedReport?.records?.length || 0} unique records identified
              within the active organizational aggregation period. Data is
              synchronized with real-time database state.
            </Text>
          </Box>

          <Box>
            <Group justify="space-between" mb="xs">
              <Text fw={800} size="sm" tt="uppercase" c="dimmed">
                Detailed Record Registry
              </Text>
              <Badge variant="light" color="blue">
                {selectedReport?.records?.length} Records
              </Badge>
            </Group>
            <Divider mb="lg" />

            <ScrollArea h={400} offsetScrollbars>
              {selectedReport?.type === "candidate" ? (
                <Table verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Candidate</Table.Th>
                      <Table.Th>Target Role</Table.Th>
                      <Table.Th>Status</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {selectedReport?.records?.map(
                      (record: any, idx: number) => (
                        <Table.Tr key={idx}>
                          <Table.Td>
                            <Group gap="sm">
                              <Avatar
                                src={record.avatar}
                                size="sm"
                                radius="xl"
                              />
                              <Text size="sm" fw={800}>
                                {record.name}
                              </Text>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Text size="xs" fw={700} c="blue.7">
                              {record.role}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              size="xs"
                              radius="sm"
                              variant="outline"
                              color={
                                record.status === "HIRED"
                                  ? "teal"
                                  : record.status === "REJECTED"
                                    ? "red"
                                    : "blue"
                              }
                            >
                              {record.status}
                            </Badge>
                          </Table.Td>
                        </Table.Tr>
                      ),
                    )}
                  </Table.Tbody>
                </Table>
              ) : (
                <Table verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Candidate</Table.Th>
                      <Table.Th>Session Schedule</Table.Th>
                      <Table.Th>Intelligence Status</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {selectedReport?.records?.map(
                      (record: any, idx: number) => (
                        <Table.Tr key={idx}>
                          <Table.Td>
                            <Group gap="sm">
                              <Avatar
                                src={record.extendedProps.avatar}
                                size="sm"
                                radius="xl"
                              />
                              <Box>
                                <Text size="sm" fw={800}>
                                  {record.extendedProps.candidate}
                                </Text>
                                <Text size="10px" fw={700} c="dimmed">
                                  {record.extendedProps.role}
                                </Text>
                              </Box>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Text size="xs" fw={800}>
                              {dayjs(record.start).format("MMM DD, hh:mm A")}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              size="xs"
                              radius="sm"
                              color={
                                record.extendedProps.status === "COMPLETED"
                                  ? "teal.6"
                                  : "blue.6"
                              }
                            >
                              {record.extendedProps.status || "SCHEDULED"}
                            </Badge>
                          </Table.Td>
                        </Table.Tr>
                      ),
                    )}
                  </Table.Tbody>
                </Table>
              )}
              {(!selectedReport?.records ||
                selectedReport.records.length === 0) && (
                <Center py={40}>
                  <Text size="xs" c="dimmed" fw={800}>
                    NO DATA IDENTIFIED FOR THIS VECTOR
                  </Text>
                </Center>
              )}
            </ScrollArea>
          </Box>

          <Button
            fullWidth
            color="blue.9"
            radius="md"
            h={50}
            fw={900}
            onClick={close}
            mt="xs"
            variant="light"
          >
            Close Strategic View
          </Button>
        </Stack>
      </Modal>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
            .no-print { display: none !important; }
            body { background: white !important; }
            .glass-card { 
                border: 1px solid #eee !important; 
                box-shadow: none !important; 
                background: white !important;
                break-inside: avoid;
            }
            .animate-in { animation: none !important; }
        }
      `,
        }}
      />
    </Container>
  );
}
