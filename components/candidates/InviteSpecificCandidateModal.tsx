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
} from "@tabler/icons-react";
import { useAppDispatch } from "@/lib/store/hooks";
import { addCandidate } from "@/lib/store/candidatesSlice";
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

  // Reset status when modal opens
  useEffect(() => {
    if (opened) {
      setStatus("idle");
      setErrorMessage("");
    }
  }, [opened]);

  const form = useForm({
    initialValues: {
      full_name: "",
      email: "",
      role_id: "",
      profile_link: "",
    },
    validate: {
      full_name: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      role_id: (value) => (value ? null : "Please select a role"),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setStatus("sending");
    let createdCandidateId = "";
    try {
      // 1. Create the candidate in the database
      const result = await dispatch(
        addCandidate({
          full_name: values.full_name,
          email: values.email,
          role_id: values.role_id,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${values.full_name.replace(/\s+/g, "")}`,
        }),
      ).unwrap();

      createdCandidateId = result.candidate_id;

      // 2. Trigger the invitation with platform context
      const { sendCandidateInvite } = await import("@/app/actions/post");
      const inviteResult = await sendCandidateInvite({
        candidate_ids: [result.candidate_id],
        platform: platform,
      });

      if (!inviteResult.success) {
          // If email fails, rollback candidate creation in both DB and Store
          const { deleteCandidate: deleteCandidateThunk } = await import("@/lib/store/candidatesSlice");
          await dispatch(deleteCandidateThunk(createdCandidateId)).unwrap();
          throw new Error(inviteResult.message);
      }

      setStatus("success");
      form.reset();

      // Auto-close after 2 seconds
      setTimeout(() => {
        if (status === "success") onClose();
      }, 3000);
    } catch (error: any) {
      console.error("Invite Error:", error);
      setStatus("error");
      setErrorMessage(
        error.message ||
          "Failed to send invitation. Please check your connection.",
      );
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
              Invite via {platform}
            </Text>
            <Text size="xs" c="dimmed" fw={600}>
              RECRUITMENT PIPELINE AUTOMATION
            </Text>
          </Box>
        </Group>
      }
      radius="lg"
      padding="xl"
      size="md"
      withCloseButton={status !== "sending"}
      closeOnClickOutside={status !== "sending"}
    >
      {status === "idle" && (
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Box bg="blue.0" p="md" style={{ borderRadius: "12px" }}>
              <Text size="xs" fw={700} c="blue.9" mb={4}>
                AUTOMATED MESSAGE PREVIEW
              </Text>
              <Text size="xs" c="blue.8" fs="italic">
                "Hello ${form.values.full_name || "[Name]"}, we found your
                profile on {platform} and would love to invite you to join our
                team..."
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
              <Button
                type="submit"
                radius="md"
                color="blue.9"
                px="xl"
                rightSection={<IconRocket size={16} />}
              >
                Send Invitation
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
                Sending Invitation...
              </Text>
              <Text size="sm" c="dimmed">
                Establishing secure connection with {platform} relays
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
                Invitation Sent!
              </Text>
              <Text size="sm" c="dimmed">
                We've added <strong>{form.values.full_name}</strong> to the
                pipeline and dispatched the email.
              </Text>
            </Box>
            <Button
              variant="light"
              color="blue"
              fullWidth
              mt="xl"
              onClick={onClose}
            >
              Close
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
                Failed to Send
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
                Try Again
              </Button>
            </Group>
          </Stack>
        </Box>
      )}
    </Modal>
  );
}
