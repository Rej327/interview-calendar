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
  IconUserPlus,
  IconArrowRight,
  IconPackageOff,
  IconChevronRight,
  IconX,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import CandidateJourneyDrawer from "@/components/candidates/CandidateJourneyDrawer";
import AddCandidateModal from "@/components/candidates/AddCandidateModal";
import UpdateCandidateModal from "@/components/candidates/UpdateCandidateModal";
import InviteSpecificCandidateModal from "@/components/candidates/InviteSpecificCandidateModal";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchCandidates } from "@/lib/store/candidatesSlice";
import { notifications } from "@mantine/notifications";

export default function CandidatesPage() {
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "applied_date",
    direction: "desc",
  });
  const [detailOpened, { open: detailOpen, close: detailClose }] =
    useDisclosure(false);
  const [addOpened, { open: addOpen, close: addClose }] = useDisclosure(false);
  const [updateOpened, { open: updateOpen, close: updateClose }] =
    useDisclosure(false);
  const [filterOpened, { open: filterOpen, close: filterClose }] =
    useDisclosure(false);
  const [inviteModalOpened, { open: inviteModalOpen, close: inviteModalClose }] =
    useDisclosure(false);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [selectedRecords, setSelectedRecords] = useState<any[]>([]);

  // Filter states
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [rolesFilter, setRolesFilter] = useState<string[]>([]);
  const [allRoles, setAllRoles] = useState<{ value: string; label: string }[]>(
    [],
  );

  const dispatch = useAppDispatch();
  const { candidates, totalCount, loading } = useAppSelector(
    (state) => state.candidates,
  );

  // Fetch data when parameters change
  useEffect(() => {
    dispatch(
      fetchCandidates({
        limit: pageSize,
        offset: (page - 1) * pageSize,
        sort_column: sortStatus.columnAccessor,
        sort_direction: sortStatus.direction.toUpperCase(),
        query: query || undefined,
        status_filters: statusFilters.length > 0 ? statusFilters : undefined,
        role_filters: rolesFilter.length > 0 ? rolesFilter : undefined,
      }),
    );
  }, [dispatch, page, pageSize, sortStatus, query, statusFilters, rolesFilter]);

  // Fetch roles for filter
  useEffect(() => {
    const loadRoles = async () => {
      const { fetchRoles } = await import("@/app/actions/get");
      const result = await fetchRoles();
      if (result.success) {
        setAllRoles(
          result.data.map((r: any) => ({
            value: r.role_title,
            label: r.role_title,
          })),
        );
      }
    };
    loadRoles();
  }, []);

  const handleRowClick = (candidate: any) => {
    setSelectedCandidate({
      ...candidate,
      status_display:
        candidate.status === "HIRED"
          ? "COMPLETED"
          : candidate.status === "REJECTED"
            ? "CANCELLED"
            : "CONFIRMED",
      time: "Session Details in Pipeline",
      type: "Hiring Process Step",
      assignedHR: "Recruitment Team",
      notes_display: `Candidate is currently in ${candidate.status} state. Applied on ${new Date(candidate.applied_date).toLocaleDateString()}.`,
    });
    detailOpen();
  };

  const handleExport = () => {
    // Note: For a real app, export should probably call a separate "fetch all" endpoint.
    // For now, we'll just export what's on the current page to avoid long-running fetches.
    const csvContent = [
      ["ID", "Name", "Role", "Status", "Applied Date"],
      ...candidates.map((c: any) => [
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
    link.setAttribute(
      "download",
      `candidates_page_${page}_${new Date().toLocaleDateString()}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notifications.show({
      title: "Export Complete",
      message: "Your candidate list has been saved to your computer.",
      color: "teal",
    });
  };

  const handleSearch = () => {
    setQuery(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleInvite = async (platform: string, candidateIds?: string[]) => {
    let ids = candidateIds;
    
    // If no specific IDs provided, try to use selected records
    if (!ids || ids.length === 0) {
      if (selectedRecords.length > 0) {
        ids = selectedRecords.map(r => r.candidate_id);
      } else if (selectedCandidate) {
        ids = [selectedCandidate.candidate_id];
      }
    }

    if (!ids || ids.length === 0) {
      notifications.show({
        title: "No candidates selected",
        message: "Please select one or more candidates from the list to send invitations.",
        color: "orange",
      });
      return;
    }

    try {
      const { sendCandidateInvite } = await import("@/app/actions/post");
      const result = await sendCandidateInvite({ candidate_ids: ids, platform });
      
      if (result.success) {
        notifications.show({
          title: "Invitations Sent",
          message: result.message,
          color: "teal",
        });
        setSelectedRecords([]); // Clear selection after successful invite
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      notifications.show({
        title: "Something went wrong",
        message: error.message || "We couldn't send the invitations. Please check your connection and try again.",
        color: "red",
      });
    }
  };

  const handleBulkInvite = () => {
    const ids = selectedRecords.map(r => r.candidate_id);
    handleInvite("Internal Bulk Automation", ids);
  };

  const handleSidebarInvite = (platform: string) => {
    if (selectedRecords.length > 0) {
      handleInvite(platform);
    } else {
      setSelectedPlatform(platform);
      inviteModalOpen();
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [query, statusFilters, rolesFilter]);

  const stats = useMemo(() => {
    return {
      total: totalCount,
      interviewing: candidates.filter((c: any) => c.status === "ACTIVE").length, // This is only for the page, but fine for now
    };
  }, [totalCount, candidates]);

  return (
    <Container fluid p="xl" bg="transparent" style={{ minHeight: "100vh" }}>
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="flex-end">
          <Box>
            <Title order={1} fw={800} size="h2">
              Candidates Portfolio
            </Title>
            <Text c="dimmed" size="sm" fw={500}>
              Showing {candidates.length} of {totalCount} candidates in
              pipeline.
            </Text>
          </Box>
          <Group gap="md">
            {selectedRecords.length > 0 && (
                <Button
                    variant="light"
                    color="blue"
                    leftSection={<IconMail size={16} />}
                    radius="md"
                    onClick={handleBulkInvite}
                >
                    Invite ({selectedRecords.length}) Selected
                </Button>
            )}
            <Button
              variant="default"
              leftSection={<IconDownload size={16} />}
              radius="md"
              onClick={handleExport}
            >
              Export Page
            </Button>
            <Button
              leftSection={<IconUserPlus size={16} />}
              radius="md"
              color="blue.9"
              px="xl"
              onClick={addOpen}
            >
              Add Candidate
            </Button>
          </Group>
        </Group>

        <Grid gutter={40}>
          <Grid.Col span={{ base: 12, lg: 9 }}>
            <Card
              p={0}
              radius="xl"
              shadow="sm"
              withBorder={false}
              style={{ overflow: "hidden" }}
            >
              <Box
                p="md"
                style={{
                  borderBottom: "1px solid var(--mantine-color-default-border)",
                }}
              >
                <Group wrap="nowrap" gap="md">
                  <TextInput
                    placeholder="Search candidates, roles, skills..."
                    leftSection={<IconSearch size={16} />}
                    radius="md"
                    flex={1}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.currentTarget.value)}
                    onKeyDown={handleKeyDown}
                    rightSection={
                      <Group gap={4} px={4}>
                        {searchInput && (
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            onClick={handleClearSearch}
                            size="sm"
                          >
                            <IconX size={14} />
                          </ActionIcon>
                        )}
                        <ActionIcon
                          variant="subtle"
                          color="blue.9"
                          onClick={handleSearch}
                          radius="md"
                        >
                          <IconArrowRight size={16} />
                        </ActionIcon>
                      </Group>
                    }
                    rightSectionWidth={70}
                    styles={{ input: { border: "none" } }}
                  />
                  <ActionIcon
                    variant={
                      statusFilters.length > 0 || rolesFilter.length > 0
                        ? "light"
                        : "default"
                    }
                    size="lg"
                    radius="md"
                    onClick={filterOpen}
                  >
                    <IconFilter size={18} />
                  </ActionIcon>
                </Group>
              </Box>

              <DataTable
                height={500}
                records={candidates}
                fetching={loading}
                selectedRecords={selectedRecords}
                onSelectedRecordsChange={setSelectedRecords}
                noRecordsText="No candidates found matching your criteria."
                noRecordsIcon={
                  <Box p="xl" style={{ opacity: 0.5 }}>
                    <IconPackageOff size={48} stroke={1.5} />
                  </Box>
                }
                idAccessor={(record: any) =>
                  `${record.candidate_id}-${record.hiring_process_id || record.role}`
                }
                totalRecords={totalCount}
                recordsPerPage={pageSize}
                page={page}
                onPageChange={(p) => setPage(p)}
                recordsPerPageOptions={[10, 20, 50]}
                onRecordsPerPageChange={setPageSize}
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
                          <Text size="sm" fw={800}>
                            {name}
                          </Text>
                          <Text size="10px" c="dimmed" fw={600}>
                            {role}
                          </Text>
                        </Box>
                      </Group>
                    ),
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
                          status === "HIRED"
                            ? "teal.6"
                            : status === "ACTIVE"
                              ? "blue.6"
                              : status === "REJECTED"
                                ? "red.6"
                                : status === "WITHDRAWN"
                                  ? "indigo.6"
                                  : "gray.6"
                        }
                      >
                        {status}
                      </Badge>
                    ),
                  },
                  {
                    accessor: "applied_date",
                    title: "APPLIED DATE",
                    sortable: true,
                    render: (c: any) => (
                      <Text size="xs" fw={700} c="dimmed">
                        {new Date(c.applied_date).toLocaleDateString()}
                      </Text>
                    ),
                  },
                  {
                    accessor: "actions",
                    title: "",
                    textAlign: "right",
                    render: (record: any) => (
                      <Group gap={4} justify="flex-end">
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInvite("Direct Email", [record.candidate_id]);
                          }}
                        >
                          <IconMail size={16} />
                        </ActionIcon>
                        <Menu position="bottom-end">
                          <Menu.Target>
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <IconDotsVertical size={16} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item
                              leftSection={
                                <IconMail
                                  style={{ width: rem(14), height: rem(14) }}
                                />
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInvite("Direct Email", [record.candidate_id]);
                              }}
                            >
                              Send Email
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                              leftSection={
                                <IconSearch
                                  style={{ width: rem(14), height: rem(14) }}
                                />
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(record);
                              }}
                            >
                              View Journey
                            </Menu.Item>
                            <Menu.Item
                              color="blue"
                              leftSection={
                                <IconSearch
                                  style={{ width: rem(14), height: rem(14) }}
                                />
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCandidate(record);
                                updateOpen();
                              }}
                            >
                              Update Profile
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                    ),
                  },
                ]}
                onRowClick={({ record }) => handleRowClick(record)}
                verticalSpacing="md"
                horizontalSpacing="xl"
                styles={{
                  root: { border: "none" },
                  header: {
                    borderBottom:
                      "1px solid var(--mantine-color-default-border)",
                  },
                }}
              />
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 3 }}>
            <Stack gap="xl">
              <Card p="xl" radius="xl" shadow="sm">
                <Title order={5} fw={800} mb="xl">
                  POOL SUMMARY
                </Title>
                <Stack gap="xl">
                  <Box
                    style={{
                      borderLeft: "4px solid var(--mantine-color-blue-9)",
                      paddingLeft: "16px",
                    }}
                  >
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={4}>
                      Total Candidates
                    </Text>
                    <Text size="24px" fw={900}>
                      {totalCount}
                    </Text>
                  </Box>
                  <Box
                    style={{
                      borderLeft: "4px solid var(--mantine-color-indigo-6)",
                      paddingLeft: "16px",
                    }}
                  >
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={4}>
                      Current View Count
                    </Text>
                    <Text size="24px" fw={900}>
                      {candidates.length}
                    </Text>
                  </Box>
                </Stack>
              </Card>

              <Card p="xl" radius="xl" shadow="sm" bg="blue.9" c="white">
                <Group gap="sm" mb="md">
                  <ThemeIcon size="lg" radius="md" color="blue.6">
                    <IconUserPlus size={20} />
                  </ThemeIcon>
                  <Text fw={800}>Invite Candidates</Text>
                </Group>
                <Text size="xs" c="blue.1" fw={500} mb="xl">
                  Quickly invite people from your favorite job boards or social
                  platforms.
                </Text>
                <Stack gap="xs">
                  {["LinkedIn", "Indeed", "Glassdoor"].map((board) => (
                    <Group
                      key={board}
                      justify="space-between"
                      bg="blue.8"
                      p="xs"
                      style={{ borderRadius: "8px", cursor: "pointer" }}
                      onClick={() => handleSidebarInvite(board)}
                    >
                      <Text size="xs" fw={800}>
                        {board}
                      </Text>
                      <IconChevronRight size={14} />
                    </Group>
                  ))}
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>

      <CandidateJourneyDrawer
        opened={detailOpened}
        onClose={detailClose}
        candidate={selectedCandidate}
      />

      <AddCandidateModal opened={addOpened} onClose={addClose} />

      <UpdateCandidateModal
        opened={updateOpened}
        onClose={updateClose}
        candidate={selectedCandidate}
      />

      <InviteSpecificCandidateModal 
        opened={inviteModalOpened} 
        onClose={inviteModalClose} 
        platform={selectedPlatform} 
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
            <Text fw={700} mb="sm" size="sm">
              Status
            </Text>
            <Stack gap="xs">
              {["ACTIVE", "HIRED", "REJECTED", "WITHDRAWN"].map((status) => (
                <Checkbox
                  key={status}
                  label={status}
                  checked={statusFilters.includes(status)}
                  onChange={(e) => {
                    if (e.currentTarget.checked)
                      setStatusFilters([...statusFilters, status]);
                    else
                      setStatusFilters(
                        statusFilters.filter((s) => s !== status),
                      );
                  }}
                />
              ))}
            </Stack>
          </Box>

          <Box>
            <Text fw={700} mb="sm" size="sm">
              Roles
            </Text>
            <MultiSelect
              placeholder="Select roles"
              data={allRoles}
              value={rolesFilter}
              onChange={setRolesFilter}
              radius="md"
            />
          </Box>

          <Button
            variant="light"
            color="red"
            fullWidth
            onClick={() => {
              setStatusFilters([]);
              setRolesFilter([]);
            }}
            radius="md"
          >
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
