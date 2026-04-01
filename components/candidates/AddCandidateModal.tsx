"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  TextInput,
  Select,
  Stack,
  Text,
  Group,
  Avatar,
  Box,
  rem,
  Center,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconMail, IconUser, IconLink } from "@tabler/icons-react";
import { useAppDispatch } from "@/lib/store/hooks";
import { addCandidate } from "@/lib/store/candidatesSlice";
import { fetchRoles } from "@/app/actions/get";
import { notifications } from "@mantine/notifications";

interface AddCandidateModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function AddCandidateModal({ opened, onClose }: AddCandidateModalProps) {
  const dispatch = useAppDispatch();
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadRoles = async () => {
      const result = await fetchRoles();
      if (result.success) {
        setRoles(result.data.map((r: any) => ({ value: r.role_id, label: r.role_title })));
      }
    };
    if (opened) loadRoles();
  }, [opened]);

  const form = useForm({
    initialValues: {
      full_name: "",
      email: "",
      role_id: "",
      avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=250&q=80",
    },
    validate: {
      full_name: (value) => (value.length < 2 ? "Name must have at least 2 letters" : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      role_id: (value) => (value ? null : "Please select a role"),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      await dispatch(addCandidate(values)).unwrap();
      notifications.show({
        title: "Success",
        message: `${values.full_name} has been added to the pool.`,
        color: "teal",
      });
      form.reset();
      onClose();
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.message || "Failed to add candidate",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={800} size="lg">
          Add New Candidate
        </Text>
      }
      radius="lg"
      padding="xl"
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Center mb="md">
            <Stack align="center" gap={4}>
              <Avatar src={form.values.avatar_url} size={80} radius={80} />
              <Text size="xs" c="dimmed" fw={600}>Candidate Avatar Preview</Text>
            </Stack>
          </Center>

          <TextInput
            label="Full Name"
            placeholder="John Doe"
            required
            leftSection={<IconUser size={16} />}
            {...form.getInputProps("full_name")}
            radius="md"
          />

          <TextInput
            label="Email Address"
            placeholder="john@example.com"
            required
            leftSection={<IconMail size={16} />}
            {...form.getInputProps("email")}
            radius="md"
          />

          <Select
            label="Target Role"
            placeholder="Select position"
            data={roles}
            required
            {...form.getInputProps("role_id")}
            radius="md"
            searchable
          />

          <TextInput
            label="Avatar URL (Optional)"
            placeholder="https://..."
            leftSection={<IconLink size={16} />}
            {...form.getInputProps("avatar_url")}
            radius="md"
          />

          <Group justify="flex-end" mt="xl">
            <Button variant="subtle" onClick={onClose} radius="md">
              Cancel
            </Button>
            <Button type="submit" loading={loading} radius="md" color="blue.9" px="xl">
              Add Candidate
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
