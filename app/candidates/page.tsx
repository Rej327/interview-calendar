"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  ActionIcon,
  Avatar,
  Menu,
  rem,
  ThemeIcon,
  Loader,
  Center,
} from "@mantine/core";
import { DataTable } from "mantine-datatable";
import {
  IconSearch,
  IconDotsVertical,
  IconMail,
  IconPhone,
  IconDownload,
  IconFilter,
  IconChevronRight,
  IconUserPlus,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import InterviewReviewModal from "@/components/calendar/InterviewReviewModal";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchCandidates } from "@/lib/store/candidatesSlice";

export default function CandidatesPage() {
  const [query, setQuery] = useState("");
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  const dispatch = useAppDispatch();
  const { candidates, loading } = useAppSelector((state) => state.candidates);

  useEffect(() => {
    if (candidates.length === 0) dispatch(fetchCandidates());
  }, [dispatch, candidates.length]);

  const handleRowClick = (candidate: any) => {
    setSelectedCandidate({
        name: candidate.name,
        role: candidate.role,
        avatar: candidate.avatar,
        status: candidate.status === "HIRED" ? "COMPLETED" : candidate.status === "REJECTED" ? "CANCELLED" : "CONFIRMED",
        time: "Session Details in Pipeline",
        type: "Hiring Process Step",
        assignedHR: "Recruitment Team",
        notes: `Candidate is currently in ${candidate.status} state. Applied on ${new Date(candidate.applied_date).toLocaleDateString()}.`
    });
    open();
  };

  const filteredData = useMemo(() => {
    return candidates.filter((c: any) => 
      c.name.toLowerCase().includes(query.toLowerCase()) || 
      c.role.toLowerCase().includes(query.toLowerCase())
    );
  }, [candidates, query]);

  const stats = useMemo(() => {
    return {
      total: candidates.length,
      interviewing: candidates.filter((c: any) => c.status === 'ACTIVE').length,
    };
  }, [candidates]);

  return (
    <Container fluid p="xl" bg="transparent" style={{ minHeight: "100vh" }}>
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="flex-end">
          <Box>
            <Title order={1} fw={800} size="h2">Candidates Portfolio</Title>
            <Text c="dimmed" size="sm" fw={500}>Track and manage your talent pool pipeline.</Text>
          </Box>
          <Group gap="md">
            <Button variant="outline" color="gray.4" c="gray.7" leftSection={<IconDownload size={16} />} radius="md">
                Export Pool
            </Button>
            <Button leftSection={<IconUserPlus size={16} />} radius="md" color="blue.9" px="xl">
                Add Candidate
            </Button>
          </Group>
        </Group>

        <Grid gutter={40}>
          <Grid.Col span={{ base: 12, lg: 9 }}>
            <Card p={0} radius="xl" shadow="sm" withBorder={false} style={{ overflow: "hidden" }}>
              <Box p="md" bg="white" style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}>
                <Group justify="space-between">
                    <TextInput
                        placeholder="Search candidates, roles, skills..."
                        leftSection={<IconSearch size={16} />}
                        radius="md"
                        w={400}
                        value={query}
                        onChange={(e) => setQuery(e.currentTarget.value)}
                        styles={{ input: { border: "none", backgroundColor: "var(--mantine-color-gray-0)" } }}
                    />
                    <ActionIcon variant="outline" color="gray.4" size="lg" radius="md">
                        <IconFilter size={18} color="gray" />
                    </ActionIcon>
                </Group>
              </Box>

              {loading ? (
                <Center py={100}><Loader color="blue" variant="dots" /></Center>
              ) : (
                <DataTable
                  height={500}
                  records={filteredData}
                  idAccessor="candidate_id"
                  columns={[
                    { 
                      accessor: "name", 
                      title: "CANDIDATE",
                      width: 280,
                      render: ({ name, role, avatar }: any) => (
                        <Group gap="sm">
                          <Avatar src={avatar} radius="xl" size="sm" />
                          <Box>
                            <Text size="sm" fw={800}>{name}</Text>
                            <Text size="10px" c="dimmed" fw={600}>{role}</Text>
                          </Box>
                        </Group>
                      )
                    },
                    { 
                      accessor: "status",
                      render: ({ status }) => (
                        <Badge 
                          variant="filled" 
                          size="xs"
                          radius="sm"
                          color={
                              status === "HIRED" ? "teal.6" : 
                              status === "ACTIVE" ? "blue.6" : 
                              status === "REJECTED" ? "red.6" : 
                              status === "WITHDRAWN" ? "indigo.6" : "gray.6"
                          }
                        >
                          {status}
                        </Badge>
                      )
                    },
                    { 
                      accessor: "applied_date", 
                      title: "APPLIED DATE", 
                      render: (c) => <Text size="xs" fw={700} c="dimmed">{new Date(c.applied_date).toLocaleDateString()}</Text> 
                    },
                    { 
                      accessor: "actions", 
                      title: "", 
                      textAlign: "right",
                      render: () => (
                        <Group gap={4} justify="flex-end">
                          <ActionIcon variant="subtle" color="gray"><IconMail size={16}/></ActionIcon>
                          <Menu position="bottom-end">
                              <Menu.Target>
                                  <ActionIcon variant="subtle" color="gray"><IconDotsVertical size={16}/></ActionIcon>
                              </Menu.Target>
                              <Menu.Dropdown>
                                  <Menu.Item leftSection={<IconPhone style={{ width: rem(14), height: rem(14) }} />}>Call Candidate</Menu.Item>
                                  <Menu.Item leftSection={<IconMail style={{ width: rem(14), height: rem(14) }} />}>Send Email</Menu.Item>
                              </Menu.Dropdown>
                          </Menu>
                        </Group>
                      )
                    },
                  ]}
                  onRowClick={({ record }) => handleRowClick(record)}
                  verticalSpacing="md"
                  horizontalSpacing="xl"
                  styles={{
                      root: { border: "none" },
                      header: { backgroundColor: "white", borderBottom: "1px solid var(--mantine-color-gray-1)" },
                      table: { backgroundColor: "white" }
                  }}
                />
              )}
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 3 }}>
            <Stack gap="xl">
                <Card p="xl" radius="xl" shadow="sm">
                    <Title order={5} fw={800} mb="xl">POOL SUMMARY</Title>
                    <Stack gap="xl">
                        <Box style={{ borderLeft: "4px solid var(--mantine-color-blue-9)", paddingLeft: "16px" }}>
                            <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={4}>Total Candidates</Text>
                            <Text size="24px" fw={900}>{stats.total}</Text>
                        </Box>
                        <Box style={{ borderLeft: "4px solid var(--mantine-color-indigo-6)", paddingLeft: "16px" }}>
                            <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={4}>Active Pipeline</Text>
                            <Text size="24px" fw={900}>{stats.interviewing}</Text>
                        </Box>
                    </Stack>
                </Card>

                <Card p="xl" radius="xl" shadow="sm" bg="blue.9" c="white">
                    <Group gap="sm" mb="md">
                        <ThemeIcon size="lg" radius="md" color="blue.6"><IconUserPlus size={20}/></ThemeIcon>
                        <Text fw={800}>Invite Candidates</Text>
                    </Group>
                    <Text size="xs" c="blue.1" fw={500} mb="xl">
                        Quickly invite people from your favorite job boards or social platforms.
                    </Text>
                    <Stack gap="xs">
                        {["LinkedIn", "Indeed", "Glassdoor"].map(board => (
                            <Group key={board} justify="space-between" bg="blue.8" p="xs" style={{ borderRadius: "8px", cursor: "pointer" }}>
                                <Text size="xs" fw={800}>{board}</Text>
                                <IconChevronRight size={14} />
                            </Group>
                        ))}
                    </Stack>
                </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>

      <InterviewReviewModal 
        opened={opened} 
        onClose={close} 
        candidate={selectedCandidate} 
      />
    </Container>
  );
}
