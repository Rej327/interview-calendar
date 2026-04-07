"use client";

import React, { useMemo, useEffect } from "react";
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
  ActionIcon,
  SimpleGrid,
  ThemeIcon,
  Progress,
  AvatarGroup,
  Center,
  Loader,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconCalendarEvent,
  IconClock,
  IconBriefcase,
  IconUsers,
  IconArrowUpRight,
  IconArrowDownRight,
  IconPlus,
  IconSettings,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchEvents } from "@/lib/store/calendarSlice";
import { fetchCandidates } from "@/lib/store/candidatesSlice";
import { fetchRolesAsync } from "@/lib/store/rolesSlice";
import RoleModal from "@/components/calendar/RoleModal";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { events, loading: eventsLoading } = useAppSelector(
    (state) => state.calendar,
  );
  const { candidates, loading: candidatesLoading } = useAppSelector(
    (state) => state.candidates,
  );
  const { items: roles, loading: rolesLoading } = useAppSelector(
    (state) => state.roles,
  );
  const [roleModalOpened, { open: openRoleModal, close: closeRoleModal }] =
    useDisclosure(false);

  const router = useRouter();
  useEffect(() => {
    if (events.length === 0) dispatch(fetchEvents());
    if (candidates.length === 0) dispatch(fetchCandidates({ limit: 10, offset: 0 }));
    if (roles.length === 0) dispatch(fetchRolesAsync());
  }, [dispatch, events.length, candidates.length, roles.length]);

  const stats = useMemo(() => {
    const todayCount = events.filter((e) =>
      dayjs(e.start).isSame(dayjs(), "day"),
    ).length;

    let totalMinutes = 0;
    events.forEach((e) => {
      totalMinutes += dayjs(e.end).diff(dayjs(e.start), "minute");
    });
    const avgDuration =
      events.length > 0 ? Math.round(totalMinutes / events.length) : 0;

    return [
      {
        label: "Total Interviews",
        value: events.length.toString(),
        change: "+5%",
        positive: true,
        icon: <IconBriefcase size={22} />,
        color: "blue",
      },
      {
        label: "Candidates",
        value: candidates.length.toString(),
        change: "+12%",
        positive: true,
        icon: <IconUsers size={22} />,
        color: "indigo",
      },
      {
        label: "Scheduled Today",
        value: todayCount.toString(),
        change: todayCount > 0 ? "+2" : "0",
        positive: true,
        icon: <IconCalendarEvent size={22} />,
        color: "teal",
      },
      {
        label: "Avg. Duration",
        value: `${avgDuration}m`,
        change: "-2m",
        positive: false,
        icon: <IconClock size={22} />,
        color: "orange",
      },
      {
        label: "Active Roles",
        value: roles.length.toString(),
        change: "+2",
        positive: true,
        icon: <IconSettings size={22} />,
        color: "violet",
      },
    ];
  }, [events, candidates, roles]);

  const todaySchedule = useMemo(() => {
    return events
      .filter((e) => dayjs(e.start).isSame(dayjs(), "day"))
      .sort((a, b) => dayjs(a.start).diff(dayjs(b.start)));
  }, [events]);

  const pipeline = useMemo(() => {
    const total = candidates.length;
    const hired = candidates.filter((c: any) => c.status === "HIRED").length;
    const active = candidates.filter((c: any) => c.status === "ACTIVE").length;
    const rejected = candidates.filter(
      (c: any) => c.status === "REJECTED",
    ).length;

    return [
      { label: "Total Candidates", value: total, color: "blue.9", total },
      { label: "Active Pipeline", value: active, color: "blue.7", total },
      { label: "Hired", value: hired, color: "teal.6", total },
      { label: "Rejected", value: rejected, color: "red.4", total },
    ];
  }, [candidates]);

  const activeRecruiters = useMemo(() => {
    const uniqueMap = new Map();
    events.forEach((e) => {
      const name = e.extendedProps?.interviewer;
      if (name && !uniqueMap.has(name)) {
        uniqueMap.set(name, {
          name,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s+/g, '')}`
        });
      }
    });
    return Array.from(uniqueMap.values());
  }, [events]);

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
        <Group justify="space-between" align="flex-end">
          <Box>
            <Badge color="blue.4" variant="light" size="sm" mb={4} radius="sm">
               RECRUITMENT ANALYTICS PORTAL
            </Badge>
            <Title order={1} fw={900} size="h1" style={{ letterSpacing: '-0.5px' }}>
              Strategic Dashboard
            </Title>
            <Text c="dimmed" size="sm" fw={600}>
              Comprehensive overview of your organization's hiring performance.
            </Text>
          </Box>
          <Group gap="md">
            <Button
              component={Link}
              href="/roles"
              variant="default"
              radius="md"
              px="xl"
              h={48}
              leftSection={<IconBriefcase size={18} />}
              style={{ border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
            >
              View Active Roles
            </Button>
            <Button
              leftSection={<IconPlus size={18} />}
              radius="md"
              color="blue.9"
              px="xl"
              h={48}
              onClick={openRoleModal}
              style={{ boxShadow: '0 4px 12px rgba(34, 139, 230, 0.25)' }}
            >
              New Role Definition
            </Button>
          </Group>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }} spacing="xl">
          {stats.map((stat, i) => (
            <Card key={i} p="xl" radius="xl" className="glass-card" style={{ border: 'none' }}>
              <Group justify="space-between" mb="lg">
                <ThemeIcon variant="light" color={stat.color} radius="md" size="xl">
                  {stat.icon}
                </ThemeIcon>
                <Badge variant="dot" color={stat.positive ? "teal.6" : "red.6"} size="sm" fw={800}>
                  {stat.change}
                </Badge>
              </Group>
              <Text size="xs" fw={800} c="dimmed" tt="uppercase" mb={4} style={{ letterSpacing: '0.5px' }}>
                {stat.label}
              </Text>
              <Title order={3} fw={900} size="32px">
                {stat.value}
              </Title>
            </Card>
          ))}
        </SimpleGrid>

        <Grid gutter={40}>
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Stack gap="xl">
              <Card p="xl" radius="xl" className="glass-card">
                <Group justify="space-between" mb="xl">
                  <Box>
                     <Group gap="xs" mb={4}>
                        <IconClock size={20} color="var(--mantine-color-blue-6)" />
                        <Title order={4} fw={900}>Today's Interview Pipeline</Title>
                     </Group>
                    <Text size="xs" c="dimmed" fw={600}>
                      Real-time monitoring of all active and upcoming interview sessions.
                    </Text>
                  </Box>
                  <Button onClick={() => router.push("/calendar")} variant="subtle" color="blue" size="sm" fw={800} radius="md">
                    SEE CALENDAR
                  </Button>
                </Group>

                <Stack gap="md">
                  {todaySchedule.length > 0 ? (
                    todaySchedule.map((item) => (
                      <Card key={item.id} p="lg" radius="lg" withBorder style={{ 
                        borderStyle: 'dashed', 
                        borderColor: 'rgba(0,0,0,0.08)',
                        backgroundColor: 'rgba(255,255,255,0.4)'
                      }}>
                        <Group justify="space-between">
                          <Group gap="lg">
                            <Box style={{ position: 'relative' }}>
                                <Avatar src={item.extendedProps.avatar} radius="xl" size="lg" style={{ border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                                { (item.extendedProps.status === "CONFIRMED" || item.extendedProps.status === "SCHEDULED") && (
                                    <Box style={{ 
                                        position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 14, 
                                        backgroundColor: '#51cf66', border: '2px solid white', animation: 'pulse 2s infinite'
                                    }} />
                                )}
                            </Box>
                            <Box>
                              <Text size="md" fw={900}>{item.extendedProps.candidate}</Text>
                              <Text size="xs" c="blue.6" fw={700}>{item.extendedProps.role}</Text>
                              <Text size="xs" c="dimmed" fw={600} mt={4}>{item.extendedProps.type}</Text>
                            </Box>
                          </Group>
                          <Group gap={60}>
                            <Box ta="right">
                              <Text size="xs" fw={800} c="dimmed">SESSION TIME</Text>
                              <Text size="sm" fw={900}>{dayjs(item.start).format("hh:mm A")}</Text>
                              <Text size="10px" fw={700} c="dimmed">Duration: {dayjs(item.end).diff(dayjs(item.start), 'minute')}m</Text>
                            </Box>
                            <Badge variant="light" size="md" radius="md" color={item.extendedProps.status === "COMPLETED" ? "teal.6" : "blue.6"} px="md" h={32}>
                                {item.extendedProps.status}
                            </Badge>
                          </Group>
                        </Group>
                      </Card>
                    ))
                  ) : (
                    <div style={{ padding: '80px 0', textAlign: "center", border: '2px dashed rgba(0,0,0,0.05)', borderRadius: '24px' }}>
                       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                          <div style={{ padding: '16px', borderRadius: '100px', backgroundColor: 'var(--mantine-color-gray-1)', color: 'var(--mantine-color-gray-6)', display: 'flex', alignItems: 'center' }}>
                             <IconCalendarEvent size={32} />
                          </div>
                          <div>
                             <h4 style={{ margin: 0, fontWeight: 900, fontSize: 'var(--mantine-font-size-lg)', color: 'var(--mantine-color-text)' }}>No Sessions Today</h4>
                             <p style={{ margin: '4px 0 0', fontSize: 'var(--mantine-font-size-xs)', fontWeight: 700, color: 'var(--mantine-color-dimmed)' }}>The recruitment pipeline is currently clear of immediate sessions.</p>
                          </div>
                       </div>
                    </div>
                  )}
                </Stack>
              </Card>

              <Card p="xl" radius="xl" className="glass-card">
                <Title order={4} fw={900} mb="xl">Strategic Hiring Pipeline</Title>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
                   <Stack gap="xl">
                    {pipeline.map((stage, i) => ( stage.label !== "Total Candidates" && (
                        <Box key={i}>
                        <Group justify="space-between" mb={8}>
                            <Text size="xs" fw={800} c="gray.7">{stage.label}</Text>
                            <Text size="xs" fw={900}>{stage.total > 0 ? Math.round((stage.value / stage.total) * 100) : 0}%</Text>
                        </Group>
                        <Progress value={stage.total > 0 ? (stage.value / stage.total) * 100 : 0} color={stage.color} size="lg" radius="xl" />
                        </Box>
                    )))}
                   </Stack>
                   <Box bg="blue.0" p="xl" style={{ borderRadius: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Text size="xs" fw={800} c="blue.9" tt="uppercase" mb="xs">Growth Metrics</Text>
                      <Title order={2} fw={900} c="blue.9" mb="md">{candidates.length} New Targets</Title>
                      <Text size="sm" c="blue.7" fw={600} style={{ lineHeight: 1.6 }}>
                         You have achieved and exceeded current recruitment goals by 12% this quarter. Keep the momentum high.
                      </Text>
                   </Box>
                </SimpleGrid>
              </Card>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Stack gap="xl">
              <Card p="xl" radius="xl" bg="blue.9" c="white" style={{ position: 'relative', overflow: 'hidden' }}>
                 <Box style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, background: 'rgba(255,255,255,0.1)', borderRadius: '100px' }} />
                <Title order={6} fw={800} mb="lg" style={{ letterSpacing: '1px' }}>MONTHLY VELOCITY</Title>
                <Text size="xs" c="blue.1" fw={500} mb="xl">Total system activity analyzed across {events.length} sessions.</Text>
                <Stack gap="xl">
                  <Box style={{ borderLeft: "4px solid rgba(255,255,255,0.3)", paddingLeft: "16px" }}>
                    <Text size="10px" fw={800} c="blue.2" tt="uppercase" mb={4}>Completed This Quarter</Text>
                    <Text size="32px" fw={900}>{events.filter((e) => e.extendedProps.status === "COMPLETED").length}</Text>
                  </Box>
                  <Box style={{ borderLeft: "4px solid #51cf66", paddingLeft: "16px" }}>
                    <Text size="10px" fw={800} c="blue.2" tt="uppercase" mb={4}>Candidate Satisfaction</Text>
                    <Text size="32px" fw={900}>98%</Text>
                  </Box>
                </Stack>
              </Card>

              <Card p="xl" radius="xl" className="glass-card">
                 <Group justify="space-between" mb="xl">
                    <Title order={5} fw={900}>TOP RECRUITERS</Title>
                    <ActionIcon variant="subtle" radius="md"><IconSettings size={18}/></ActionIcon>
                 </Group>
                <Stack gap="md">
                  {activeRecruiters.slice(0, 4).map((recruiter, i) => (
                      <Group key={i} justify="space-between" p="xs" style={{ borderRadius: '12px', transition: 'background-color 0.2s ease' }} className="recruiter-row">
                        <Group gap="sm">
                           <Avatar src={recruiter.avatar} size="md" radius="xl" />
                           <Box>
                              <Text size="sm" fw={900}>{recruiter.name}</Text>
                              <Text size="10px" c="dimmed" fw={700}>Global Recruitment Staff</Text>
                           </Box>
                        </Group>
                        <Badge variant="dot" color="blue">Top Performance</Badge>
                      </Group>
                    ),
                  )}
                </Stack>
                <style>{`
                   @keyframes pulse {
                      0% { box-shadow: 0 0 0 0 rgba(81, 207, 102, 0.4); }
                      70% { box-shadow: 0 0 0 10px rgba(81, 207, 102, 0); }
                      100% { box-shadow: 0 0 0 0 rgba(81, 207, 102, 0); }
                   }
                   .recruiter-row:hover { background-color: rgba(0,0,0,0.03); }
                `}</style>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
      <RoleModal opened={roleModalOpened} onClose={closeRoleModal} />
    </Container>
  );
}
