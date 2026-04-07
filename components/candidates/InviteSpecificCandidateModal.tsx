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
  ThemeIcon,
  Box,
  rem,
  Badge,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconMail, IconUser, IconLink, IconBrandLinkedin, IconBrandGoogle, IconSearch } from "@tabler/icons-react";
import { useAppDispatch } from "@/lib/store/hooks";
import { addCandidate } from "@/lib/store/candidatesSlice";
import { fetchRoles } from "@/app/actions/get";
import { notifications } from "@mantine/notifications";

interface InviteSpecificCandidateModalProps {
  opened: boolean;
  onClose: () => void;
  platform: string;
}

export default function InviteSpecificCandidateModal({ opened, onClose, platform }: InviteSpecificCandidateModalProps) {
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
      profile_link: "",
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
      // 1. Create the candidate in the database
      const result = await dispatch(addCandidate({
        full_name: values.full_name,
        email: values.email,
        role_id: values.role_id,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${values.full_name.replace(/\s+/g, '')}`
      })).unwrap();

      // 2. Trigger the invitation with platform context
      const { sendCandidateInvite } = await import("@/app/actions/post");
      await sendCandidateInvite({ 
        candidate_ids: [result.candidate_id], 
        platform: platform 
      });

      notifications.show({
        title: "Invitation Dispatched",
        message: `We've successfully reached out to ${values.full_name} via ${platform}.`,
        color: "teal",
      });

      form.reset();
      onClose();
    } catch (error: any) {
      notifications.show({
        title: "Invitation Failed",
        message: error.message || "Something went wrong while sending the invitation. Please try again.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = () => {
    switch (platform.toLowerCase()) {
      case 'linkedin': return <IconBrandLinkedin size={24} color="#0077b5" />;
      case 'indeed': return <IconSearch size={24} color="#2164f3" />;
      case 'glassdoor': return <IconSearch size={24} color="#0caa41" />;
      default: return <IconLink size={24} />;
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <ThemeIcon variant="light" size="lg" radius="md" color="blue">
            {getPlatformIcon()}
          </ThemeIcon>
          <Box>
            <Text fw={800} size="lg">Invite via {platform}</Text>
            <Text size="xs" c="dimmed" fw={600}>RECRUITMENT PIPELINE AUTOMATION</Text>
          </Box>
        </Group>
      }
      radius="lg"
      padding="xl"
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Box bg="blue.0" p="md" style={{ borderRadius: '12px' }}>
             <Text size="xs" fw={700} c="blue.9" mb={4}>AUTOMATED MESSAGE PREVIEW</Text>
             <Text size="xs" c="blue.8" fs="italic">
               "Hello ${form.values.full_name || '[Name]'}, we found your profile on {platform} and would love to invite you to join our team..."
             </Text>
          </Box>

          <TextInput
            label="Candidate Full Name"
            placeholder="John Doe"
            required
            leftSection={<IconUser size={16} />}
            {...form.getInputProps("full_name")}
            radius="md"
          />

          <TextInput
            label="Candidate Email Address"
            placeholder="john@example.com"
            required
            leftSection={<IconMail size={16} />}
            {...form.getInputProps("email")}
            radius="md"
          />

          <Select
            label="Target Position"
            placeholder="Select role for candidate"
            data={roles}
            required
            {...form.getInputProps("role_id")}
            radius="md"
            searchable
          />

          <TextInput
            label={`${platform} Profile Link (Optional)`}
            placeholder={`https://www.${platform.toLowerCase()}.com/in/...`}
            leftSection={<IconLink size={16} />}
            {...form.getInputProps("profile_link")}
            radius="md"
          />

          <Group justify="flex-end" mt="xl">
            <Button variant="subtle" onClick={onClose} radius="md">
              Cancel
            </Button>
            <Button type="submit" loading={loading} radius="md" color="blue.9" px="xl" rightSection={<IconRocket size={16} />}>
              Send Invitation
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

import { IconRocket } from "@tabler/icons-react";
