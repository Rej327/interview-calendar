"use client";

import React from 'react';
import { Modal, Text, Group, Button, Stack, ThemeIcon } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

interface DeleteRoleModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  roleTitle: string;
  loading?: boolean;
}

export default function DeleteRoleModal({
  opened,
  onClose,
  onConfirm,
  roleTitle,
  loading = false,
}: DeleteRoleModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Confirm Deletion"
      centered
      radius="xl"
      size="sm"
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
    >
      <Stack gap="lg" p="md">
        <Group align="flex-start" wrap="nowrap">
          <ThemeIcon variant="light" color="red" size="xl" radius="md">
            <IconAlertTriangle size={24} />
          </ThemeIcon>
          <Box style={{ flex: 1 }}>
            <Text size="sm" fw={700} mb={4}>
              Are you sure you want to delete this role?
            </Text>
            <Text size="xs" c="dimmed" fw={500}>
              You are about to delete <Text span fw={800} c="gray.9">"{roleTitle}"</Text>. This action cannot be undone and may affect active hiring processes associated with this role.
            </Text>
          </Box>
        </Group>

        <Group justify="flex-end" mt="xl">
          <Button variant="subtle" color="gray" onClick={onClose} radius="md" disabled={loading}>
            Cancel
          </Button>
          <Button 
            color="red.6" 
            onClick={onConfirm} 
            radius="md" 
            loading={loading}
          >
            Delete Role
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

import { Box } from '@mantine/core';
