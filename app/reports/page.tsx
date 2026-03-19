"use client";

import React, { useState } from "react";
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
  Select,
  ThemeIcon,
  Badge,
  ActionIcon,
  SimpleGrid,
  Progress,
  ScrollArea,
} from "@mantine/core";

import {
  IconArrowUpRight,
  IconArrowDownRight,
  IconDownload,
  IconCalendar,
  IconFilter,
  IconCheck,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { Modal } from "@mantine/core";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const kpiData = [
  { label: "TOTAL INTERVIEWS", value: "124", change: "+12%", positive: true },
  { label: "OFFERS SENT", value: "18", change: "+4%", positive: true },
  {
    label: "CONVERSION RATE",
    value: "14.5%",
    change: "-1.2%",
    positive: false,
  },
  { label: "AVG. TIME TO HIRE", value: "22d", change: "-2d", positive: true },
];

const weeklyData = [
  { name: "WK 01", scheduled: 40, completed: 32 },
  { name: "WK 02", scheduled: 55, completed: 42 },
  { name: "WK 03", scheduled: 65, completed: 58 },
  { name: "WK 04", scheduled: 48, completed: 38 },
  { name: "WK 05", scheduled: 52, completed: 48 },
];

const timeToHireData = [
  { dept: "ENGINEERING", days: 28, color: "blue.9" },
  { dept: "MARKETING", days: 14, color: "gray.6" },
  { dept: "SALES", days: 19, color: "blue.2" },
  { dept: "PRODUCT", days: 22, color: "blue.9" },
];

const funnelData = [
  { label: "APPLICATIONS", value: "1,402", width: "100%", color: "blue.9" },
  { label: "SCREENED", value: "384", width: "80%", color: "blue.8" },
  { label: "INTERVIEWED", value: "124", width: "60%", color: "blue.7" },
  { label: "OFFERS", value: "18", width: "40%", color: "gray.7" },
];

const bottomKpis = [
  {
    label: "Candidate Quality Index",
    value: "84%",
    icon: <IconCheck size={16} />,
    color: "blue",
  },
  {
    label: "Cost per Hire",
    value: "$4,250",
    icon: <IconCheck size={16} />,
    color: "green",
    sub: "-$320 compared to last quarter",
  },
  {
    label: "Acceptance Rate",
    value: "92%",
    icon: <IconCheck size={16} />,
    color: "violet",
    sub: "Outstanding offers: 4",
  },
];

export default function ReportsPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const handleKpiClick = (kpi: any) => {
    setSelectedReport(kpi);
    open();
  };
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
              Last 30 Days
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
        {kpiData.length > 0 ? (
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
        ) : (
          <Card p="xl" radius="xl" withBorder ta="center">
            <Text c="dimmed" fw={500}>
              No KPI data available for the selected period.
            </Text>
          </Card>
        )}

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
                Time to Hire
              </Title>
              <Text size="xs" c="dimmed" fw={600} mb="xl">
                Average days by department
              </Text>

              <Stack gap="xl">
                {timeToHireData.map((item) => (
                  <Box key={item.dept}>
                    <Group justify="space-between" mb={6}>
                      <Text size="10px" fw={800}>
                        {item.dept}
                      </Text>
                      <Text size="10px" fw={800}>
                        {item.days} Days
                      </Text>
                    </Group>
                    <Progress
                      value={(item.days / 30) * 100}
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
                      Global Average
                    </Text>
                    <Text size="xs" fw={900}>
                      20.8 Days
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
                Visualize the candidate flow from initial application to final
                offer. Identify where talent drop-off occurs most frequently in
                your current workflow.
              </Text>
              <Button
                variant="subtle"
                color="blue.0"
                p={0}
                fw={700}
                rightSection={<IconArrowUpRight size={16} />}
              >
                View Detailed Breakdown
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

        {/* Bottom KPIs */}
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
          {bottomKpis.map((kpi, i) => (
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
              {kpi.sub ? (
                <Text
                  size="xs"
                  c={kpi.color === "green" ? "teal.6" : "dimmed"}
                  fw={600}
                >
                  {kpi.sub}
                </Text>
              ) : (
                <Box
                  h={4}
                  bg={kpi.color}
                  w="100%"
                  style={{
                    borderRadius: "var(--mantine-radius-xl)",
                    overflow: "hidden",
                  }}
                >
                  <Box h="100%" bg="blue.9" w="84%" />
                </Box>
              )}
              <Text size="xs" c="dimmed" mt="lg" fw={500}>
                {i === 0
                  ? "Based on skills matching and technical assessment scores from the past month."
                  : i === 1
                    ? "Includes advertising spend, referral bonuses, and agency fees."
                    : "Percentage of candidates who accepted the offer after receipt."}
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
            Confidential HR Analytics • Generated 24 March 2026
          </Text>
        </Group>
      </Stack>

      <Modal
        opened={opened}
        onClose={close}
        title="Detailed Analytics"
        radius="xl"
        size="lg"
        scrollAreaComponent={ScrollArea.Autosize}
      >
        <Stack p="xl">
          <Group justify="space-between">
            <Box>
              <Text size="xs" fw={800} c="dimmed" tt="uppercase">
                Metric
              </Text>
              <Title order={3} fw={900}>
                {selectedReport?.label}
              </Title>
            </Box>
            <Box ta="right">
              <Text size="xs" fw={800} c="dimmed" tt="uppercase">
                Current Value
              </Text>
              <Text size="32px" fw={900}>
                {selectedReport?.value}
              </Text>
            </Box>
          </Group>

          <Box
            h={200}
            bg="transparent"
            style={{
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text c="dimmed" fw={600}>
              [ Detailed Trend Visualization ]
            </Text>
          </Box>

          <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
            Detailed breakdown for {selectedReport?.label} shows a consistent
            growth pattern over the last 30 days. The current trend suggests we
            are on track to beat quarterly targets by 15%. Significant
            improvements were noted in the Engineering and Product departments.
          </Text>

          <Group grow mt="xl">
            <Button variant="light" radius="md">
              Download CSV
            </Button>
            <Button color="blue.9" radius="md" onClick={close}>
              Close Overview
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
