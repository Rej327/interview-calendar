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
  Center,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconMail, IconUser, IconLink, IconTrash } from "@tabler/icons-react";
import { useAppDispatch } from "@/lib/store/hooks";
import { updateCandidate, deleteCandidate } from "@/lib/store/candidatesSlice";
import { fetchRoles } from "@/app/actions/get";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";

interface UpdateCandidateModalProps {
  opened: boolean;
  onClose: () => void;
  candidate: any;
}

export default function UpdateCandidateModal({
  opened,
  onClose,
  candidate,
}: UpdateCandidateModalProps) {
  const dispatch = useAppDispatch();
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadRoles = async () => {
      const result = await fetchRoles();
      if (result.success) {
        setRoles(
          result.data.map((r: any) => ({
            value: r.role_id,
            label: r.role_title,
          })),
        );
      }
    };
    if (opened) loadRoles();
  }, [opened]);

  const form = useForm({
    initialValues: {
      full_name: "",
      email: "",
      role_id: "",
      status: "",
      avatar_url: "",
    },
    validate: {
      full_name: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  useEffect(() => {
    if (candidate && opened && roles.length > 0) {
      // The candidate object from get_candidates_portfolio_paginated has a 'role' field (title)
      // We need to find the corresponding role_id from our roles list
      const roleObj = roles.find((r) => r.label === candidate.role);

      form.setValues({
        full_name: candidate.name || "",
        email: candidate.email || "",
        role_id: roleObj?.value || candidate.role_id || "",
        status: candidate.status || "",
        avatar_url: candidate.avatar || "",
      });
    } else if (candidate && opened) {
      // Fallback if roles aren't loaded yet - set what we have
      form.setValues({
        full_name: candidate.name || "",
        email: candidate.email || "",
        role_id: candidate.role_id || "",
        status: candidate.status || "",
        avatar_url: candidate.avatar || "",
      });
    }
  }, [candidate, opened, roles]);

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      await dispatch(
        updateCandidate({
          candidate_id: candidate.candidate_id,
          full_name: values.full_name,
          email: values.email,
          avatar_url: values.avatar_url,
          status: values.status,
          role_id: values.role_id,
        }),
      ).unwrap();

      notifications.show({
        title: "Profile Updated",
        message: `We've successfully updated ${values.full_name}'s details.`,
        color: "teal",
      });
      onClose();
    } catch (error: any) {
      notifications.show({
        title: "Update failed",
        message: "We couldn't save the changes. Please try again.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    modals.openConfirmModal({
      title: "Delete Candidate",
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete <b>{candidate.name}</b>? This action
          cannot be undone and will remove all related hiring data.
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red", radius: "md" },
      cancelProps: { radius: "md" },
      onConfirm: async () => {
        try {
          await dispatch(deleteCandidate(candidate.candidate_id)).unwrap();
          notifications.show({
            title: "Candidate Removed",
            message:
              "The candidate has been successfully removed from your pipeline.",
            color: "gray",
          });
          onClose();
        } catch (error: any) {
          notifications.show({
            title: "Couldn't remove candidate",
            message:
              "We encountered an issue while trying to remove the candidate. Please try again.",
            color: "red",
          });
        }
      },
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={800} size="lg">
          Update Candidate Profile
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
              <Text size="xs" c="dimmed" fw={600}>
                Profile Preview
              </Text>
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
            leftSection={<IconMail size={16} />}
            {...form.getInputProps("email")}
            radius="md"
          />

          <Select
            label="Target Role"
            placeholder="Select position"
            data={roles}
            {...form.getInputProps("role_id")}
            radius="md"
            searchable
          />

          <Select
            label="Process Status"
            placeholder="Select status"
            data={["ACTIVE", "HIRED", "REJECTED", "WITHDRAWN"]}
            {...form.getInputProps("status")}
            radius="md"
          />

          <TextInput
            label="Avatar URL"
            placeholder="https://..."
            leftSection={<IconLink size={16} />}
            {...form.getInputProps("avatar_url")}
            radius="md"
          />

          <Group justify="space-between">
            <Group gap="sm" w="100%" grow>
              <Button variant="default" onClick={onClose} radius="md">
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                radius="md"
                color="blue.9"
              >
                Save Changes
              </Button>
            </Group>
            <Button
              variant="subtle"
              color="red"
              w={"100%"}
              leftSection={<IconTrash size={16} />}
              onClick={handleDelete}
              radius="md"
              style={{ border: "1px solid red" }}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
