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
    <Container fluid p="xl" bg="transparent" style={{ minHeight: "100vh" }}>
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="flex-end">
          <Box>
            <Group gap="xs" mb={4}>
              <Button
                component={Link}
                href="/"
                variant="subtle"
                color="gray"
                size="compact-xs"
                leftSection={<IconArrowLeft size={12} />}
              >
                Back to Dashboard
              </Button>
            </Group>
            <Title order={1} fw={800} size="h2">
              Role Openings
            </Title>
            <Text c="dimmed" size="sm" fw={500}>
              Semantic search and smart management across your recruitment
              positions.
            </Text>
          </Box>
          <Group gap="md">
            <Button
              variant="outline"
              color="gray.4"
              c="gray.7"
              radius="md"
              leftSection={<IconDownload size={16} />}
              onClick={handleExport}
            >
              Export
            </Button>
            <Button
              leftSection={<IconPlus size={16} />}
              radius="md"
              color="blue.9"
              px="xl"
              onClick={handleCreateNew}
            >
              New Role
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
                bg="white"
                style={{
                  borderBottom: "1px solid var(--mantine-color-gray-1)",
                }}
              >
                <Group justify="stretch" w="100%">
                  <TextInput
                    placeholder="Search roles, departments..."
                    leftSection={<IconSearch size={16} />}
                    radius="md"
                    size="md"
                    style={{ flex: 1 }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.currentTarget.value)}
                    onKeyDown={handleKeyDown}
                    styles={{
                      input: {
                        border: "none",
                        backgroundColor: "var(--mantine-color-gray-0)",
                      },
                    }}
                  />
                </Group>
              </Box>

              {loading ? (
                <Center py={100}>
                  <Loader color="blue" variant="dots" />
                </Center>
              ) : (
                <DataTable
                  height={500}
                  records={filteredData}
                  idAccessor="role_id"
                  columns={[
                    {
                      accessor: "role_title",
                      title: "POSITION",
                      width: 400,
                      render: ({ role_title, role_department }: any) => (
                        <Group gap="sm">
                          <ThemeIcon
                            variant="light"
                            color="blue"
                            radius="md"
                            size="sm"
                          >
                            <IconBriefcase size={16} />
                          </ThemeIcon>
                          <Box>
                            <Text size="sm" fw={800}>
                              {role_title}
                            </Text>
                            <Text size="10px" c="dimmed" fw={600}>
                              {role_department}
                            </Text>
                          </Box>
                        </Group>
                      ),
                    },
                    {
                      accessor: "status",
                      title: "STATUS",
                      render: () => (
                        <Badge
                          variant="light"
                          size="xs"
                          radius="sm"
                          color="teal.6"
                        >
                          ACTIVE
                        </Badge>
                      ),
                    },
                    {
                      accessor: "role_created_at",
                      title: "CREATED DATE",
                      render: ({ role_created_at }) => (
                        <Text size="xs" fw={700} c="dimmed">
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
                              <ActionIcon variant="subtle" color="gray">
                                <IconDotsVertical size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item
                                leftSection={
                                  <IconEdit
                                    style={{ width: rem(14), height: rem(14) }}
                                  />
                                }
                                onClick={() => handleEditRole(role)}
                              >
                                Edit Role
                              </Menu.Item>
                              <Menu.Item
                                color="red"
                                leftSection={
                                  <IconTrash
                                    style={{ width: rem(14), height: rem(14) }}
                                  />
                                }
                                onClick={() => handleDeleteRoleClick(role)}
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
                      backgroundColor: "white",
                      borderBottom: "1px solid var(--mantine-color-gray-1)",
                    },
                    table: { backgroundColor: "white" },
                  }}
                />
              )}
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 3 }}>
            <Stack gap="xl">
              <Card p="xl" radius="xl" shadow="sm">
                <Title order={5} fw={800} mb="xl">
                  ROLES SUMMARY
                </Title>
                <Stack gap="xl">
                  <Box
                    style={{
                      borderLeft: "4px solid var(--mantine-color-blue-9)",
                      paddingLeft: "16px",
                    }}
                  >
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={4}>
                      Total Roles
                    </Text>
                    <Text size="24px" fw={900}>
                      {stats.total}
                    </Text>
                  </Box>
                  <Box
                    style={{
                      borderLeft: "4px solid var(--mantine-color-violet-6)",
                      paddingLeft: "16px",
                    }}
                  >
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={4}>
                      Departments
                    </Text>
                    <Text size="24px" fw={900}>
                      {stats.departments}
                    </Text>
                  </Box>
                </Stack>
              </Card>

              <Card p="xl" radius="xl" shadow="sm" bg="blue.9" c="white">
                <Group gap="sm" mb="md">
                  <ThemeIcon size="lg" radius="md" color="blue.6">
                    <IconPlus size={20} />
                  </ThemeIcon>
                  <Text fw={800}>Quick Actions</Text>
                </Group>
                <Text size="xs" c="blue.1" fw={500} mb="xl">
                  Define new recruitment pipelines or adjust existing role
                  requirements.
                </Text>
                <Button
                  fullWidth
                  variant="white"
                  color="blue.9"
                  radius="md"
                  onClick={handleCreateNew}
                >
                  Add Position
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
