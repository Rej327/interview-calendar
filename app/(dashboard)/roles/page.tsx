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
  ThemeIcon,
  Loader,
  Center,
  Menu,
  rem,
} from "@mantine/core";
import { DataTable } from "mantine-datatable";
import {
  IconSearch,
  IconDotsVertical,
  IconPlus,
  IconArrowLeft,
  IconBriefcase,
  IconEdit,
  IconTrash,
  IconDownload,
  IconArrowRight,
  IconPackageOff,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchRolesAsync, deleteRoleAsync } from "@/lib/store/rolesSlice";
import RoleModal from "@/components/calendar/RoleModal";
import DeleteRoleModal from "@/components/calendar/DeleteRoleModal";
import Link from "next/link";
import { notifications } from "@mantine/notifications";

export default function RolesPage() {
  const [searchTerm, setSearchTerm] = useState(""); // The current text in the box
  const [query, setQuery] = useState(""); // The text used for actual filtering
  const [editingRole, setEditingRole] = useState<any>(null); // State for the role being edited

  const dispatch = useAppDispatch();
  const { items: roles, loading } = useAppSelector((state) => state.roles);
  const [modalOpened, { open, close }] = useDisclosure(false);
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [roleToDelete, setRoleToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchRolesAsync());
  }, [dispatch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "ArrowRight") {
      setQuery(searchTerm);
    }
  };

  const filteredData = useMemo(() => {
    if (!query) return roles;
    return roles.filter(
      (r) =>
        r.role_title.toLowerCase().includes(query.toLowerCase()) ||
        r.role_department.toLowerCase().includes(query.toLowerCase()),
    );
  }, [roles, query]);

  const stats = useMemo(() => {
    return {
      total: roles.length,
      departments: new Set(roles.map((r) => r.role_department)).size,
    };
  }, [roles]);

  const handleEditRole = (role: any) => {
    setEditingRole(role);
    open();
  };

  const handleDeleteRoleClick = (role: any) => {
    setRoleToDelete(role);
    openDeleteModal();
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteRoleAsync(roleToDelete.role_id)).unwrap();
      notifications.show({
        title: "Deleted",
        message: "Role removed successfully",
        color: "red",
      });
      closeDeleteModal();
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.message || "Failed to delete role",
        color: "red",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateNew = () => {
    setEditingRole(null);
    open();
  };

  const handleExport = () => {
    const headers = ["Position", "Department", "Created Date"];
    const rows = filteredData.map((r) => [
      `"${r.role_title.replace(/"/g, '""')}"`,
      `"${r.role_department.replace(/"/g, '""')}"`,
      `"${new Date(r.role_created_at).toISOString().slice(0, 10)}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `roles-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    notifications.show({
      title: "Export successful",
      message: `${filteredData.length} role(s) exported as CSV`,
      color: "teal",
    });
  };

  return (
    <Container
      fluid
      p="xl"
      bg="transparent"
      style={{ minHeight: "100vh" }}
      className="animate-in"
    >
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="flex-end">
          <Box>
            <Group gap="xs" mb={4}>
              <Button
                component={Link}
                href="/"
                variant="subtle"
                color="blue.6"
                size="compact-xs"
                fw={800}
                leftSection={<IconArrowLeft size={14} />}
              >
                RETURN TO DASHBOARD
              </Button>
            </Group>
            <Title
              order={1}
              fw={900}
              size="h1"
              style={{ letterSpacing: "-0.5px" }}
            >
              Role Openings
            </Title>
            <Text c="gray.9" size="sm" fw={600}>
              Comprehensive management of organizational positions and
              recruitment pipelines.
            </Text>
          </Box>
          <Group gap="md">
            <Button
              variant="default"
              radius="md"
              h={48}
              leftSection={<IconDownload size={18} />}
              onClick={handleExport}
              style={{
                border: "1px solid rgba(0,0,0,0.05)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              Export Global Registry
            </Button>
            <Button
              leftSection={<IconPlus size={18} />}
              radius="md"
              color="blue.9"
              px="xl"
              h={48}
              onClick={handleCreateNew}
              style={{ boxShadow: "0 4px 12px rgba(34, 139, 230, 0.25)" }}
            >
              New Role Definition
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
                style={{
                  borderBottom: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                <Group justify="stretch" w="100%">
                  <TextInput
                    placeholder="Filter by position title or department..."
                    leftSection={
                      <IconSearch
                        size={18}
                        color="var(--mantine-color-blue-6)"
                      />
                    }
                    radius="md"
                    size="md"
                    style={{ flex: 1 }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.currentTarget.value)}
                    onKeyDown={handleKeyDown}
                    rightSection={
                      <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={() => setQuery(searchTerm)}
                        aria-label="Filter"
                      >
                        <IconArrowRight size={16} aria-hidden="true" />
                      </ActionIcon>
                    }
                    styles={{
                      input: {
                        border: "none",
                        backgroundColor: "transparent",
                        fontWeight: 600,
                      },
                    }}
                  />
                </Group>
              </Box>

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                  <Loader color="blue" variant="dots" />
                </div>
              ) : (
                <DataTable
                  height={500}
                  records={filteredData}
                  idAccessor="role_id"
                  noRecordsText="Operational registry currently yielding no tactical results."
                  noRecordsIcon={
                    <div style={{ padding: '80px', opacity: 0.4, textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <IconPackageOff size={60} stroke={1.5} color="var(--mantine-color-blue-9)" />
                          <span style={{ fontWeight: 900, fontSize: 'var(--mantine-font-size-sm)', color: 'var(--mantine-color-dimmed)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>
                             No Role Definitions Detected
                          </span>
                        </div>
                    </div>
                  }
                  columns={[
                    {
                      accessor: "role_title",
                      title: "POSITION ARCHITECTURE",
                      width: 400,
                      render: ({ role_title, role_department }: any) => (
                        <Group gap="sm">
                          <ThemeIcon
                            variant="light"
                            color="blue.1"
                            c="blue.9"
                            radius="md"
                            size="md"
                          >
                            <IconBriefcase size={18} />
                          </ThemeIcon>
                          <Box>
                            <Text size="sm" fw={900}>
                              {role_title}
                            </Text>
                            <Text
                              size="10px"
                              c="gray.9"
                              fw={800}
                              tt="uppercase"
                              style={{ letterSpacing: "0.5px" }}
                            >
                              {role_department}
                            </Text>
                          </Box>
                        </Group>
                      ),
                    },
                    {
                      accessor: "status",
                      title: "DEPLOYMENT STATUS",
                      render: () => (
                        <Badge
                          variant="filled"
                          size="xs"
                          radius="sm"
                          color="teal.8"
                        >
                          ACTIVE
                        </Badge>
                      ),
                    },
                    {
                      accessor: "role_created_at",
                      title: "ESTABLISHED",
                      render: ({ role_created_at }) => (
                        <Text size="xs" fw={800} c="gray.9">
                          {new Date(role_created_at).toLocaleDateString()}
                        </Text>
                      ),
                    },
                    {
                      accessor: "actions",
                      title: "",
                      textAlign: "right",
                      render: (role: any) => (
                        <Group gap={4} justify="flex-end">
                          <Menu position="bottom-end" shadow="md" radius="md">
                            <Menu.Target>
                                <ActionIcon
                                  variant="subtle"
                                  color="gray.8"
                                  radius="md"
                                  size={36}
                                  aria-label="Role Actions"
                                >
                                  <IconDotsVertical size={18} aria-hidden="true" />
                                </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item
                                leftSection={
                                  <IconEdit
                                    style={{ width: rem(14), height: rem(14) }}
                                    aria-hidden="true"
                                  />
                                }
                                onClick={() => handleEditRole(role)}
                                fw={700}
                              >
                                Edit Role
                              </Menu.Item>
                              <Menu.Divider />
                              <Menu.Item
                                color="red"
                                leftSection={
                                  <IconTrash
                                    style={{ width: rem(14), height: rem(14) }}
                                  />
                                }
                                onClick={() => handleDeleteRoleClick(role)}
                                fw={700}
                              >
                                Delete Role
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Group>
                      ),
                    },
                  ]}
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
              )}
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 3 }}>
            <Stack gap="xl">
              <Card p="xl" radius="xl" className="glass-card">
                <Title order={5} fw={900} mb="xl">
                  ROLES SUMMARY
                </Title>
                <Stack gap="xl">
                  <Box
                    style={{
                      borderLeft: "4px solid var(--mantine-color-blue-9)",
                      paddingLeft: "16px",
                    }}
                  >
                    <Text size="xs" fw={800} c="gray.8" tt="uppercase" mb={4}>
                      Total Roles
                    </Text>
                    <Text size="28px" fw={900}>
                      {stats.total}
                    </Text>
                  </Box>
                  <Box
                    style={{
                      borderLeft: "4px solid var(--mantine-color-violet-6)",
                      paddingLeft: "16px",
                    }}
                  >
                    <Text size="xs" fw={800} c="gray.8" tt="uppercase" mb={4}>
                      Departments
                    </Text>
                    <Text size="28px" fw={900}>
                      {stats.departments}
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
                    right: -40,
                    width: 120,
                    height: 120,
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "100px",
                  }}
                />
                <Group gap="sm" mb="md">
                  <ThemeIcon size="lg" radius="md" color="blue.6">
                    <IconPlus size={20} />
                  </ThemeIcon>
                  <Text fw={900}>Strategic Planning</Text>
                </Group>
                <Text
                  size="xs"
                  c="blue.1"
                  fw={600}
                  mb="xl"
                  style={{ lineHeight: 1.6 }}
                >
                  Define new recruitment pipelines or adjust existing role
                  requirements for global scale.
                </Text>
                <Button
                  fullWidth
                  variant="white"
                  color="blue.9"
                  radius="md"
                  h={45}
                  fw={900}
                  onClick={handleCreateNew}
                  style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                >
                  Create New Position
                </Button>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>

      <RoleModal opened={modalOpened} onClose={close} role={editingRole} />
      {roleToDelete && (
        <DeleteRoleModal
          opened={deleteModalOpened}
          onClose={closeDeleteModal}
          onConfirm={handleConfirmDelete}
          roleTitle={roleToDelete.role_title}
          loading={isDeleting}
        />
      )}
    </Container>
  );
}
