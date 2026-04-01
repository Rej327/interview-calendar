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
  Drawer,
  Checkbox,
  MultiSelect,
} from "@mantine/core";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
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
import AddCandidateModal from "@/components/candidates/AddCandidateModal";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchCandidates } from "@/lib/store/candidatesSlice";
import { notifications } from "@mantine/notifications";

export default function CandidatesPage() {
  const [query, setQuery] = useState("");
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: "applied_date", direction: "desc" });
  const [detailOpened, { open: detailOpen, close: detailClose }] = useDisclosure(false);
  const [addOpened, { open: addOpen, close: addClose }] = useDisclosure(false);
  const [filterOpened, { open: filterOpen, close: filterClose }] = useDisclosure(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  // Filter states
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [rolesFilter, setRolesFilter] = useState<string[]>([]);

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
    detailOpen();
  };

  const handleExport = () => {
    const csvContent = [
      ["ID", "Name", "Role", "Status", "Applied Date"],
      ...filteredData.map((c: any) => [
        c.candidate_id,
        c.name,
        c.role,
        c.status,
        new Date(c.applied_date).toISOString(),
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `candidates_pool_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notifications.show({ title: "Export Success", message: "Candidate pool exported to CSV", color: "teal" });
  };

  const handleInvite = (platform: string) => {
    notifications.show({
      title: "Invite Sent",
      message: `Scanning for top talent on ${platform}... Initial invitation request dispatched.`,
      color: "blue",
    });
  };

  const roles = useMemo(() => {
    return Array.from(new Set(candidates.map((c: any) => c.role)));
  }, [candidates]);

  const sortedData = useMemo(() => {
    const data = [...candidates];
    data.sort((a, b) => {
      const aValue = a[sortStatus.columnAccessor];
      const bValue = b[sortStatus.columnAccessor];
      
      if (aValue === bValue) return 0;
      
      const multiplier = sortStatus.direction === "asc" ? 1 : -1;
      
      if (typeof aValue === 'string') {
        return aValue.localeCompare(bValue) * multiplier;
      }
      return (aValue > bValue ? 1 : -1) * multiplier;
    });
    return data;
  }, [candidates, sortStatus]);

  const filteredData = useMemo(() => {
    return sortedData.filter((c: any) => {
      const matchesSearch = 
        c.name.toLowerCase().includes(query.toLowerCase()) || 
        c.role.toLowerCase().includes(query.toLowerCase());
      
      const matchesStatus = statusFilters.length === 0 || statusFilters.includes(c.status);
      const matchesRole = rolesFilter.length === 0 || rolesFilter.includes(c.role);
      
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [sortedData, query, statusFilters, rolesFilter]);

  const pagedData = useMemo(() => {
    return filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [filteredData, page]);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilters, rolesFilter]);

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
            <Button variant="default" leftSection={<IconDownload size={16} />} radius="md" onClick={handleExport}>
                Export Pool
            </Button>
            <Button leftSection={<IconUserPlus size={16} />} radius="md" color="blue.9" px="xl" onClick={addOpen}>
                Add Candidate
            </Button>
          </Group>
        </Group>

        <Grid gutter={40}>
          <Grid.Col span={{ base: 12, lg: 9 }}>
            <Card p={0} radius="xl" shadow="sm" withBorder={false} style={{ overflow: "hidden" }}>
              <Box p="md" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
                <Group justify="space-between">
                    <TextInput
                        placeholder="Search candidates, roles, skills..."
                        leftSection={<IconSearch size={16} />}
                        radius="md"
                        w={400}
                        value={query}
                        onChange={(e) => setQuery(e.currentTarget.value)}
                        styles={{ input: { border: "none" } }}
                    />
                    <ActionIcon variant={statusFilters.length > 0 || rolesFilter.length > 0 ? "light" : "default"} size="lg" radius="md" onClick={filterOpen}>
                        <IconFilter size={18} />
                    </ActionIcon>
                </Group>
              </Box>

              {loading ? (
                <Center py={100}><Loader color="blue" variant="dots" /></Center>
              ) : (
                <DataTable
                  height={500}
                  records={pagedData}
                  idAccessor={(record: any) => `${record.candidate_id}-${record.hiring_process_id || record.role}`}
                  totalRecords={filteredData.length}
                  recordsPerPage={PAGE_SIZE}
                  page={page}
                  onPageChange={(p) => setPage(p)}
                  sortStatus={sortStatus}
                  onSortStatusChange={setSortStatus}
                  columns={[
                    { 
                      accessor: "name", 
                      title: "CANDIDATE",
                      width: 280,
                      sortable: true,
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
                      sortable: true,
                      render: ({ status }: any) => (
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
                      sortable: true,
                      render: (c: any) => <Text size="xs" fw={700} c="dimmed">{new Date(c.applied_date).toLocaleDateString()}</Text> 
                    },
                    { 
                      accessor: "actions", 
                      title: "", 
                      textAlign: "right",
                      render: (record: any) => (
                        <Group gap={4} justify="flex-end">
                          <ActionIcon variant="subtle" color="gray" onClick={(e) => { e.stopPropagation(); handleInvite("Direct Email"); }}><IconMail size={16}/></ActionIcon>
                          <Menu position="bottom-end">
                              <Menu.Target>
                                  <ActionIcon variant="subtle" color="gray" onClick={(e) => e.stopPropagation()}><IconDotsVertical size={16}/></ActionIcon>
                              </Menu.Target>
                              <Menu.Dropdown>
                                  <Menu.Item leftSection={<IconPhone style={{ width: rem(14), height: rem(14) }} />}>Call Candidate</Menu.Item>
                                  <Menu.Item leftSection={<IconMail style={{ width: rem(14), height: rem(14) }} />} onClick={() => handleInvite("Direct Email")}>Send Email</Menu.Item>
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
                      header: { borderBottom: "1px solid var(--mantine-color-default-border)" },
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
                            <Group key={board} justify="space-between" bg="blue.8" p="xs" style={{ borderRadius: "8px", cursor: "pointer" }} onClick={() => handleInvite(board)}>
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
        opened={detailOpened} 
        onClose={detailClose} 
        candidate={selectedCandidate} 
      />

      <AddCandidateModal 
        opened={addOpened} 
        onClose={addClose} 
      />

      <Drawer
        opened={filterOpened}
        onClose={filterClose}
        title={<Text fw={800}>Filter Candidates</Text>}
        position="right"
        padding="xl"
      >
        <Stack gap="xl">
            <Box>
                <Text fw={700} mb="sm" size="sm">Status</Text>
                <Stack gap="xs">
                    {["ACTIVE", "HIRED", "REJECTED", "WITHDRAWN"].map(status => (
                        <Checkbox 
                            key={status}
                            label={status}
                            checked={statusFilters.includes(status)}
                            onChange={(e) => {
                                if (e.currentTarget.checked) setStatusFilters([...statusFilters, status]);
                                else setStatusFilters(statusFilters.filter(s => s !== status));
                            }}
                        />
                    ))}
                </Stack>
            </Box>

            <Box>
                <Text fw={700} mb="sm" size="sm">Roles</Text>
                <MultiSelect 
                    placeholder="Select roles"
                    data={roles}
                    value={rolesFilter}
                    onChange={setRolesFilter}
                    radius="md"
                />
            </Box>

            <Button variant="light" color="red" fullWidth onClick={() => { setStatusFilters([]); setRolesFilter([]); }} radius="md">
                Reset Filters
            </Button>
            <Button fullWidth onClick={filterClose} radius="md" color="blue.9">
                Apply Filters
            </Button>
        </Stack>
      </Drawer>
    </Container>
  );
}
