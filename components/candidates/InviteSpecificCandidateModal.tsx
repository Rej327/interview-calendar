"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  TextInput,
  Select,
  Stack,
  Text,
  Title,
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
import { sendCandidateInvite } from "@/app/actions/post";
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
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon variant="light" size={48} radius="md" color="blue">
            {getPlatformIcon()}
          </ThemeIcon>
          <Box>
            <Badge variant="filled" color="blue.9" size="xs" mb={4}>RECRUITMENT AUTOMATION</Badge>
            <Title order={3} fw={900} size="h3" style={{ letterSpacing: '-0.5px' }}>
              Bulk Invite via {platform}
            </Title>
          </Box>
        </Group>
      }
      radius="xl"
      padding="xl"
      size="lg"
      centered
      withCloseButton={status !== "sending"}
      closeOnClickOutside={status !== "sending"}
      transitionProps={{ transition: 'slide-up', duration: 400, timingFunction: 'ease' }}
      styles={{
        title: { width: '100%' },
        content: { 
          backdropFilter: 'blur(20px)', 
          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
          border: '1px solid rgba(255,255,255,0.4)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
        }
      }}
    >
      {status === "idle" && (
        <form onSubmit={form.onSubmit(handleSubmit)} className="animate-in">
          <Stack gap="lg">
            <Box bg="blue.0" p="md" style={{ borderRadius: "16px", border: '1px solid var(--mantine-color-blue-1)' }}>
              <Group gap="xs" mb={4}>
                 <IconRocket size={14} color="var(--mantine-color-blue-9)" />
                 <Text size="xs" fw={900} c="blue.9" tt="uppercase" style={{ letterSpacing: '0.5px' }}>
                    OUTREACH CONTEXT
                 </Text>
              </Group>
              <Text size="xs" c="blue.8" fw={600} style={{ lineHeight: 1.5 }}>
                "We discovered your professional expertise on {platform}{" "}
                and are highly interested in your background for our current organizational requirements..."
              </Text>
            </Box>

            <Stack gap="md" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
                {fields}
            </Stack>

            <Button
              variant="light"
              leftSection={<IconPlus size={18} />}
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
              h={45}
              fw={800}
            >
              Expand Batch
            </Button>

            <Group justify="flex-end" mt="xl" pt="xl" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <Button variant="subtle" onClick={onClose} radius="md" h={45} fw={700} color="gray">
                Cancel
              </Button>
              <Button
                type="submit"
                radius="md"
                color="blue.9"
                px="xl"
                h={45}
                fw={900}
                rightSection={<IconRocket size={18} />}
                style={{ boxShadow: '0 4px 12px rgba(34, 139, 230, 0.25)' }}
              >
                Dispatch Batch ({form.values.candidates.length})
              </Button>
            </Group>
          </Stack>
        </form>
      )}

      {status === "sending" && (
        <Box py={60} style={{ textAlign: "center" }} className="animate-in">
          <Stack align="center" gap="xl">
            <Box
              style={{
                width: 100,
                height: 100,
                borderRadius: 100,
                backgroundColor: "var(--mantine-color-blue-0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px dashed var(--mantine-color-blue-4)",
                animation: "pulse-orbit 3s ease-in-out infinite",
              }}
            >
              <IconRocket size={48} color="var(--mantine-color-blue-9)" />
            </Box>
            <Box>
              <Title order={3} fw={900} mb={4}>
                Synchronizing Pipeline...
              </Title>
              <Text size="sm" c="dimmed" fw={600} px="xl">
                Registering talent profiles and orchestrating {form.values.candidates.length}{" "}
                professional invitations via secure {platform} relays.
              </Text>
            </Box>
            <Loader size="lg" color="blue" variant="dots" />
          </Stack>
          <style>{`
            @keyframes pulse-orbit {
              0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 139, 230, 0.2); }
              50% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(34, 139, 230, 0); }
              100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 139, 230, 0); }
            }
          `}</style>
        </Box>
      )}

      {status === "success" && (
        <Box py={60} style={{ textAlign: "center" }} className="animate-in">
          <Stack align="center" gap="xl">
            <Box
               style={{
                width: 100,
                height: 100,
                borderRadius: 100,
                backgroundColor: "var(--mantine-color-teal-0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: '2px solid var(--mantine-color-teal-2)'
               }}
            >
              <IconCircleCheck size={56} color="var(--mantine-color-teal-6)" />
            </Box>
            <Box px="xl">
              <Title order={3} fw={900} mb={4}>
                Operation Successful
              </Title>
              <Text size="sm" c="dimmed" fw={600}>
                Organizational bandwidth updated. All {form.values.candidates.length} talent 
                invitations have been successfully dispatched to the target registries.
              </Text>
            </Box>
            <Button
              variant="filled"
              color="teal.8"
              fullWidth
              h={48}
              radius="md"
              fw={900}
              mt="xl"
              onClick={onClose}
              style={{ boxShadow: '0 4px 12px rgba(12, 170, 65, 0.2)' }}
            >
              Acknowledge & Finalize
            </Button>
          </Stack>
        </Box>
      )}

      {status === "error" && (
        <Box py={60} style={{ textAlign: "center" }} className="animate-in">
          <Stack align="center" gap="xl">
            <Box
               style={{
                width: 100,
                height: 100,
                borderRadius: 100,
                backgroundColor: "var(--mantine-color-red-0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: '2px solid var(--mantine-color-red-2)'
               }}
            >
              <IconAlertCircle size={56} color="var(--mantine-color-red-6)" />
            </Box>
            <Box px="xl">
              <Title order={3} fw={900} mb={4} c="red.9">
                Operational Fault Detected
              </Title>
              <Text size="sm" c="red.7" fw={700}>
                {errorMessage}
              </Text>
            </Box>
            <Group grow w="100%" mt="xl">
              <Button variant="default" h={48} radius="md" fw={700} onClick={() => setStatus("idle")}>
                Go Back
              </Button>
              <Button
                color="blue.9"
                h={48}
                radius="md"
                fw={900}
                leftSection={<IconRefresh size={18} />}
                onClick={() => handleSubmit(form.values)}
              >
                Retry Operation
              </Button>
            </Group>
          </Stack>
        </Box>
      )}
    </Modal>
  );
}
