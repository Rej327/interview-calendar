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
  Loader,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconMail,
  IconUser,
  IconLink,
  IconBrandLinkedin,
  IconSearch,
  IconRocket,
  IconCircleCheck,
  IconAlertCircle,
  IconRefresh,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { useAppDispatch } from "@/lib/store/hooks";
import {
  addCandidate,
  deleteCandidate as deleteCandidateThunk,
} from "@/lib/store/candidatesSlice";
import { fetchRoles } from "@/app/actions/get";
import { notifications } from "@mantine/notifications";

interface InviteSpecificCandidateModalProps {
  opened: boolean;
  onClose: () => void;
  platform: string;
}

type InviteStatus = "idle" | "sending" | "success" | "error";

export default function InviteSpecificCandidateModal({
  opened,
  onClose,
  platform,
}: InviteSpecificCandidateModalProps) {
  const dispatch = useAppDispatch();
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([]);
  const [status, setStatus] = useState<InviteStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

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

  useEffect(() => {
    if (opened) {
      setStatus("idle");
      setErrorMessage("");
      form.setValues({
        candidates: [
          { full_name: "", email: "", role_id: "", profile_link: "" },
        ],
      });
    }
  }, [opened]);

  const form = useForm({
    initialValues: {
      candidates: [{ full_name: "", email: "", role_id: "", profile_link: "" }],
    },
    validate: {
      candidates: {
        full_name: (value: any) => (value.length < 2 ? "Name too short" : null),
        email: (value: any) =>
          /^\S+@\S+$/.test(value) ? null : "Invalid email",
        role_id: (value: any) => (value ? null : "Select role"),
      },
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setStatus("sending");
    const createdIds: string[] = [];

    try {
      // 1. Create all candidates sequentially
      for (const candidate of values.candidates) {
        const result = await dispatch(
          addCandidate({
            full_name: candidate.full_name,
            email: candidate.email,
            role_id: candidate.role_id,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.full_name.replace(/\s+/g, "")}`,
          }),
        ).unwrap();
        createdIds.push(result.candidate_id);
      }

      // 2. Trigger bulk invitation
      const { sendCandidateInvite } = await import("@/app/actions/post");
      const inviteResult = await sendCandidateInvite({
        candidate_ids: createdIds,
        platform: platform,
      });

      if (!inviteResult.success) {
        // Bulk rollback
        for (const id of createdIds) {
          await dispatch(deleteCandidateThunk(id)).unwrap();
        }
        throw new Error(inviteResult.message);
      }

      setStatus("success");
      form.reset();

      setTimeout(() => {
        if (status === "success") onClose();
      }, 3000);
    } catch (error: any) {
      console.error("Bulk Invite Error:", error);
      setStatus("error");
      setErrorMessage(error.message || "Failed to batch process invitations.");

      // Cleanup any that were created if we crashed before bulk send
      if (createdIds.length > 0 && status !== "success") {
        for (const id of createdIds) {
          try {
            await dispatch(deleteCandidateThunk(id)).unwrap();
          } catch (e) {}
        }
      }
    }
  };

  const getPlatformIcon = () => {
    switch (platform.toLowerCase()) {
      case "linkedin":
        return <IconBrandLinkedin size={24} color="#0077b5" />;
      case "indeed":
        return <IconSearch size={24} color="#2164f3" />;
      case "glassdoor":
        return <IconSearch size={24} color="#0caa41" />;
      default:
        return <IconLink size={24} />;
    }
  };

  const fields = form.values.candidates.map((_, index) => (
    <Box
      key={index}
      p="md"
      style={{
        border: "1px solid #eee",
        borderRadius: "12px",
        position: "relative",
      }}
    >
      {form.values.candidates.length > 1 && (
        <Button
          variant="subtle"
          color="red"
          size="xs"
          style={{ position: "absolute", top: 5, right: 10, zIndex: 10 }}
          onClick={() => form.removeListItem("candidates", index)}
        >
          <IconTrash size={14} />
        </Button>
      )}

      <Group grow align="flex-start">
        <TextInput
          label="Full Name"
          placeholder="John Doe"
          required
          {...form.getInputProps(`candidates.${index}.full_name`)}
          radius="md"
        />
        <TextInput
          label="Email Address"
          placeholder="john@example.com"
          required
          {...form.getInputProps(`candidates.${index}.email`)}
          radius="md"
        />
      </Group>

      <Group grow mt="sm">
        <Select
          label="Target Role"
          placeholder="Select role"
          data={roles}
          required
          {...form.getInputProps(`candidates.${index}.role_id`)}
          radius="md"
          searchable
        />
        <TextInput
          label={`${platform} Link`}
          placeholder="Profile URL"
          {...form.getInputProps(`candidates.${index}.profile_link`)}
          radius="md"
        />
      </Group>
    </Box>
  ));

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
            <Text fw={800} size="lg">
              Bulk Invite via {platform}
            </Text>
            <Text size="xs" c="dimmed" fw={600}>
              BATCH RECRUITMENT AUTOMATION
            </Text>
          </Box>
        </Group>
      }
      radius="lg"
      padding="xl"
      size="lg"
      withCloseButton={status !== "sending"}
      closeOnClickOutside={status !== "sending"}
    >
      {status === "idle" && (
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Box bg="blue.0" p="md" style={{ borderRadius: "12px" }}>
              <Text size="xs" fw={700} c="blue.9" mb={4}>
                MESSAGE CONTEXT
              </Text>
              <Text size="xs" c="blue.8" fs="italic">
                "We recently came across your professional profile on {platform}{" "}
                and were incredibly impressed..."
              </Text>
            </Box>

            {fields}

            <Button
              variant="light"
              leftSection={<IconPlus size={16} />}
              onClick={() =>
                form.insertListItem("candidates", {
                  full_name: "",
                  email: "",
                  role_id: "",
                  profile_link: "",
                })
              }
              fullWidth
              radius="md"
            >
              Add Another Candidate
            </Button>

            <Group justify="flex-end" mt="xl">
              <Button variant="subtle" onClick={onClose} radius="md">
                Cancel
              </Button>
              <Button
                type="submit"
                radius="md"
                color="blue.9"
                px="xl"
                rightSection={<IconRocket size={16} />}
              >
                Send All Invitations ({form.values.candidates.length})
              </Button>
            </Group>
          </Stack>
        </form>
      )}

      {status === "sending" && (
        <Box py={40} style={{ textAlign: "center" }}>
          <Stack align="center" gap="md">
            <Box
              style={{
                width: 80,
                height: 80,
                borderRadius: 80,
                backgroundColor: "var(--mantine-color-blue-0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px dashed var(--mantine-color-blue-4)",
                animation: "spin 4s linear infinite",
              }}
            >
              <IconRocket size={40} color="var(--mantine-color-blue-9)" />
            </Box>
            <Box>
              <Text fw={800} size="lg">
                Processing Batch...
              </Text>
              <Text size="sm" c="dimmed">
                Seeding database and dispatching {form.values.candidates.length}{" "}
                emails via {platform} relays
              </Text>
            </Box>
            <Loader size="sm" color="blue" variant="dots" />
          </Stack>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </Box>
      )}

      {status === "success" && (
        <Box py={40} style={{ textAlign: "center" }}>
          <Stack align="center" gap="md">
            <ThemeIcon size={80} radius={80} color="teal" variant="light">
              <IconCircleCheck size={50} />
            </ThemeIcon>
            <Box>
              <Text fw={800} size="xl">
                Batch Success!
              </Text>
              <Text size="sm" c="dimmed">
                All {form.values.candidates.length} invitations have been
                successfully dispatched.
              </Text>
            </Box>
            <Button
              variant="light"
              color="blue"
              fullWidth
              mt="xl"
              onClick={onClose}
            >
              Finish
            </Button>
          </Stack>
        </Box>
      )}

      {status === "error" && (
        <Box py={40} style={{ textAlign: "center" }}>
          <Stack align="center" gap="md">
            <ThemeIcon size={80} radius={80} color="red" variant="light">
              <IconAlertCircle size={50} />
            </ThemeIcon>
            <Box>
              <Text fw={800} size="xl">
                Batch Process Failed
              </Text>
              <Text size="sm" c="red.7" fw={500}>
                {errorMessage}
              </Text>
            </Box>
            <Group grow w="100%" mt="xl">
              <Button variant="default" onClick={() => setStatus("idle")}>
                Go Back
              </Button>
              <Button
                color="blue"
                leftSection={<IconRefresh size={16} />}
                onClick={() => handleSubmit(form.values)}
              >
                Retry All
              </Button>
            </Group>
          </Stack>
        </Box>
      )}
    </Modal>
  );
}
