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
  const [
    inviteModalOpened,
    { open: inviteModalOpen, close: inviteModalClose },
  ] = useDisclosure(false);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [selectedRecords, setSelectedRecords] = useState<any[]>([]);
  const [sendingInvite, setSendingInvite] = useState(false);

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
    if (!ids || ids.length === 0) {
      if (selectedRecords.length > 0) {
        ids = selectedRecords.map((r) => r.candidate_id);
      } else if (selectedCandidate) {
        ids = [selectedCandidate.candidate_id];
      }
    }

    if (!ids || ids.length === 0) {
      notifications.show({
        title: "No candidates selected",
        message:
          "Please select one or more candidates from the list to send invitations.",
        color: "orange",
      });
      return;
    }

    setSendingInvite(true);
    try {
      const { sendCandidateInvite } = await import("@/app/actions/post");
      const result = await sendCandidateInvite({
        candidate_ids: ids,
        platform,
      });

      if (result.success) {
        notifications.show({
          title: "Invitations Sent",
          message: result.message,
          color: "teal",
        });
        setSelectedRecords([]);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      notifications.show({
        title: "Something went wrong",
        message: error.message || "We couldn't send the invitations.",
        color: "red",
      });
    } finally {
      setSendingInvite(false);
    }
  };

  const handleBulkInvite = () => {
    const ids = selectedRecords.map((r) => r.candidate_id);
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

  useEffect(() => {
    setPage(1);
  }, [query, statusFilters, rolesFilter]);

  return (
    <Container
      fluid
      p="xl"
      bg="transparent"
      style={{ minHeight: "100vh" }}
      className="animate-in"
    >
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end">
          <Box>
            <Badge color="blue.4" variant="light" size="sm" mb={4} radius="sm">
              TALENT PIPELINE
            </Badge>
            <Title
              order={1}
              fw={900}
              size="h1"
              style={{ letterSpacing: "-0.5px" }}
            >
              Candidates Portfolio
            </Title>
            <Text c="gray.9" size="sm" fw={600}>
              Managing {totalCount} profiles across active organizational
              pipelines.
            </Text>
          </Box>
          <Group gap="md">
            {selectedRecords.length > 0 && (
              <Button
                variant="filled"
                color="blue.9"
                leftSection={<IconMail size={18} />}
                radius="md"
                h={48}
                onClick={handleBulkInvite}
                loading={sendingInvite}
                style={{ boxShadow: "0 4px 12px rgba(34, 139, 230, 0.25)" }}
              >
                Dispatch Invite ({selectedRecords.length})
              </Button>
            )}
            <Button
              variant="default"
              leftSection={<IconDownload size={18} />}
              radius="md"
              h={48}
              onClick={handleExport}
              style={{
                border: "1px solid rgba(0,0,0,0.05)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              Export Global Registry
            </Button>
            <Button
              leftSection={<IconUserPlus size={18} />}
              radius="md"
              color="blue.9"
              px="xl"
              h={48}
              onClick={addOpen}
              style={{ boxShadow: "0 4px 12px rgba(34, 139, 230, 0.25)" }}
            >
              New Candidate
            </Button>
          </Group>
        </Group>

        <Grid gutter={40}>
          <Grid.Col span={{ base: 12, lg: 9 }}>
            <Card
              p={0}
              radius="xl"
              className="glass-card"
              style={{ border: "none" }}
            >
              <Box
                p="md"
                style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
              >
                <Group wrap="nowrap" gap="md">
                  <TextInput
                    placeholder="Search candidate registry by name, role, or unique attributes..."
                    leftSection={
                      <IconSearch
                        size={18}
                        color="var(--mantine-color-blue-6)"
                      />
                    }
                    radius="md"
                    size="md"
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
                            size="md"
                          >
                            <IconX size={16} />
                          </ActionIcon>
                        )}
                        <ActionIcon
                          variant="light"
                          color="blue.9"
                          onClick={handleSearch}
                          radius="md"
                          size="md"
                        >
                          <IconArrowRight size={18} />
                        </ActionIcon>
                      </Group>
                    }
                    rightSectionWidth={80}
                    styles={{
                      input: {
                        border: "none",
                        backgroundColor: "transparent",
                        fontWeight: 600,
                      },
                    }}
                  />
                  <ActionIcon
                    variant={
                      statusFilters.length > 0 || rolesFilter.length > 0
                        ? "filled"
                        : "light"
                    }
                    size={42}
                    radius="md"
                    color="blue"
                    onClick={filterOpen}
                    aria-label="Filter candidates"
                  >
                    <IconFilter size={20} aria-hidden="true" />
                  </ActionIcon>
                </Group>
              </Box>

              <DataTable
                height={550}
                records={candidates}
                fetching={loading}
                selectedRecords={selectedRecords}
                onSelectedRecordsChange={setSelectedRecords}
                noRecordsText="Candidate database search yielded no tactical results."
                noRecordsIcon={
                  <div
                    style={{
                      padding: "80px",
                      opacity: 0.4,
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <IconPackageOff
                        size={60}
                        stroke={1.5}
                        color="var(--mantine-color-blue-9)"
                      />
                      <span
                        style={{
                          fontWeight: 900,
                          fontSize: "var(--mantine-font-size-sm)",
                          color: "var(--mantine-color-dimmed)",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          display: "block",
                        }}
                      >
                        Registry currently offline or empty
                      </span>
                    </div>
                  </div>
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
                    title: "CANDIDATE IDENTITY",
                    width: 320,
                    sortable: true,
                    render: ({ name, role, avatar }: any) => (
                      <Group gap="sm">
                        <Avatar
                          src={avatar}
                          alt={`Avatar of ${name}`}
                          radius="xl"
                          size="md"
                          style={{
                            border: "2px solid white",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                          }}
                        />
                        <Box>
                          <Text size="sm" fw={900}>
                            {name}
                          </Text>
                          <Text
                            size="10px"
                            c="gray.9"
                            fw={800}
                            tt="uppercase"
                            style={{ letterSpacing: "0.5px" }}
                          >
                            {role}
                          </Text>
                        </Box>
                      </Group>
                    ),
                  },
                  {
                    accessor: "status",
                    title: "PIPELINE STATUS",
                    sortable: true,
                    render: ({ status }: any) => (
                      <Badge
                        variant="dot"
                        size="sm"
                        radius="md"
                        fw={800}
                        color={
                          status === "HIRED"
                            ? "teal.8"
                            : status === "ACTIVE"
                              ? "blue.8"
                              : status === "REJECTED"
                                ? "red.8"
                                : status === "WITHDRAWN"
                                  ? "indigo.8"
                                  : "gray.8"
                        }
                      >
                        {status}
                      </Badge>
                    ),
                  },
                  {
                    accessor: "applied_date",
                    title: "REGISTRATION DATE",
                    sortable: true,
                    render: (c: any) => (
                      <Text size="xs" fw={800} c="gray.9">
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
                          color="blue.7"
                          radius="md"
                          size={36}
                          loading={sendingInvite}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInvite("Direct Email", [record.candidate_id]);
                          }}
                          aria-label={`Send invitation to ${record.name}`}
                        >
                          <IconMail size={18} aria-hidden="true" />
                        </ActionIcon>
                        <Menu position="bottom-end" shadow="lg" radius="md">
                          <Menu.Target>
                            <ActionIcon
                              variant="subtle"
                              color="gray.8"
                              radius="md"
                              size={36}
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`More actions for ${record.name}`}
                            >
                              <IconDotsVertical size={18} aria-hidden="true" />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Label fw={800}>Communications</Menu.Label>
                            <Menu.Item
                              leftSection={
                                <IconMail
                                  style={{ width: rem(14), height: rem(14) }}
                                />
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInvite("Direct Email", [
                                  record.candidate_id,
                                ]);
                              }}
                              fw={700}
                            >
                              Dispatch Invite
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Label fw={800}>Management</Menu.Label>
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
                              fw={700}
                            >
                              Operational Journey
                            </Menu.Item>
                            <Menu.Item
                              color="blue"
                              leftSection={
                                <IconUserPlus
                                  style={{ width: rem(14), height: rem(14) }}
                                />
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCandidate(record);
                                updateOpen();
                              }}
                              fw={700}
                            >
                              Modify Configuration
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
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                    fontWeight: 900,
                    fontSize: "10px",
                    color: "var(--mantine-color-gray-9)",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  },
                }}
              />
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 3 }}>
            <Stack gap="xl">
              <Card p="xl" radius="xl" className="glass-card">
                <Title order={5} fw={900} mb="xl">
                  POOL SUMMARY
                </Title>
                <Stack gap="xl">
                  <Box
                    style={{
                      borderLeft: "4px solid var(--mantine-color-blue-9)",
                      paddingLeft: "16px",
                    }}
                  >
                    <Text size="xs" fw={800} c="gray.8" tt="uppercase" mb={4}>
                      Global Index
                    </Text>
                    <Text size="32px" fw={900}>
                      {totalCount}
                    </Text>
                  </Box>
                  <Box
                    style={{
                      borderLeft: "4px solid var(--mantine-color-teal-6)",
                      paddingLeft: "16px",
                    }}
                  >
                    <Text size="xs" fw={800} c="gray.8" tt="uppercase" mb={4}>
                      Active Registry
                    </Text>
                    <Text size="32px" fw={900}>
                      {candidates.length}
                    </Text>
                  </Box>
                </Stack>
              </Card>

              <Card
                p="xl"
                radius="xl"
                bg="blue.9"
                c="white"
                style={{ position: "relative", overflow: "hidden" }}
              >
                <Box
                  style={{
                    position: "absolute",
                    top: -40,
                    left: -40,
                    width: 120,
                    height: 120,
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "100px",
                  }}
                />
                <Group gap="sm" mb="md">
                  <ThemeIcon size="lg" radius="md" color="blue.6">
                    <IconUserPlus size={20} />
                  </ThemeIcon>
                  <Text fw={900}>Platform Integration</Text>
                </Group>
                <Text
                  size="xs"
                  c="blue.1"
                  fw={600}
                  mb="xl"
                  style={{ lineHeight: 1.6 }}
                >
                  Orchestrate candidate invites across social registries and
                  high-traffic job boards.
                </Text>
                <Stack gap="xs">
                  {["LinkedIn", "Indeed", "Glassdoor"].map((board) => (
                    <Group
                      key={board}
                      justify="space-between"
                      bg="blue.8"
                      p="xs"
                      style={{
                        borderRadius: "10px",
                        cursor: sendingInvite ? "not-allowed" : "pointer",
                        opacity: sendingInvite ? 0.6 : 1,
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                      onClick={() =>
                        !sendingInvite && handleSidebarInvite(board)
                      }
                      className="invite-board-item"
                    >
                      <Group gap="sm" ml={4}>
                        {sendingInvite && selectedPlatform === board ? (
                          <Loader size="xs" color="blue.2" />
                        ) : (
                          <div
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "rgba(255,255,255,0.4)",
                            }}
                          />
                        )}
                        <Text size="xs" fw={900}>
                          {board}
                        </Text>
                      </Group>
                      <IconChevronRight size={16} />
                    </Group>
                  ))}
                </Stack>
                <style>{`
                  .invite-board-item:hover { background-color: var(--mantine-color-blue-7) !important; transform: translateX(6px); box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
                `}</style>
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
        title={
          <Text fw={900} size="lg">
            Pipeline Filter
          </Text>
        }
        position="right"
        padding="xl"
        radius="lg"
      >
        <Stack gap="xl">
          <Box>
            <Text
              fw={900}
              mb="md"
              size="xs"
              c="dimmed"
              tt="uppercase"
              style={{ letterSpacing: "1px" }}
            >
              PIPELINE STATUS
            </Text>
            <Stack gap="sm">
              {["ACTIVE", "HIRED", "REJECTED", "WITHDRAWN"].map((status) => (
                <Checkbox
                  key={status}
                  label={
                    <Text size="sm" fw={700}>
                      {status}
                    </Text>
                  }
                  checked={statusFilters.includes(status)}
                  radius="md"
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
            <Text
              fw={900}
              mb="md"
              size="xs"
              c="dimmed"
              tt="uppercase"
              style={{ letterSpacing: "1px" }}
            >
              POSITION ARCHITECTURE
            </Text>
            <MultiSelect
              placeholder="Filter by organizational roles"
              data={allRoles}
              value={rolesFilter}
              onChange={setRolesFilter}
              radius="md"
              styles={{ input: { fontWeight: 600 } }}
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
            fw={800}
            h={45}
          >
            Clear
          </Button>
          <Button
            fullWidth
            onClick={filterClose}
            radius="md"
            color="blue.9"
            h={45}
            fw={900}
          >
            Apply
          </Button>
        </Stack>
      </Drawer>
    </Container>
  );
}
