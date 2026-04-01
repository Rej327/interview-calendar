"use client";

import React, { useEffect } from 'react';
import { Modal, TextInput, Stack, Button, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAppDispatch } from '@/lib/store/hooks';
import { createRoleAsync, updateRoleAsync } from '@/lib/store/rolesSlice';
import { notifications } from '@mantine/notifications';

interface RoleModalProps {
  opened: boolean;
  onClose: () => void;
  role?: any; // The role to edit (if any)
}

export default function RoleModal({ opened, onClose, role }: RoleModalProps) {
  const dispatch = useAppDispatch();
  const isEditing = !!role;

  const form = useForm({
    initialValues: {
      role_title: '',
      role_department: '',
    },
    validate: {
      role_title: (value) => (value.length < 2 ? 'Title is too short' : null),
      role_department: (value) => (value.length < 2 ? 'Department is too short' : null),
    },
  });

  useEffect(() => {
    if (role) {
      form.setValues({
        role_title: role.role_title,
        role_department: role.role_department,
      });
    } else {
      form.reset();
    }
  }, [role, opened]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (isEditing) {
        await dispatch(updateRoleAsync({ role_id: role.role_id, updates: values })).unwrap();
        notifications.show({
          title: 'Success',
          message: 'Role updated successfully',
          color: 'teal',
        });
      } else {
        await dispatch(createRoleAsync(values)).unwrap();
        notifications.show({
          title: 'Success',
          message: 'Role created successfully',
          color: 'teal',
        });
      }
      form.reset();
      onClose();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || `Failed to ${isEditing ? 'update' : 'create'} role`,
        color: 'red',
      });
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={isEditing ? "Edit Role" : "Create New Role"} centered radius="xl" size="md">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md" p="md">
          <TextInput
            label="Role Title"
            placeholder="e.g. Senior Backend Engineer"
            required
            radius="md"
            {...form.getInputProps('role_title')}
          />
          <TextInput
            label="Department"
            placeholder="e.g. Engineering"
            required
            radius="md"
            {...form.getInputProps('role_department')}
          />
          <Group justify="flex-end" mt="xl">
            <Button variant="subtle" onClick={onClose} radius="md" color="gray">
              Cancel
            </Button>
            <Button type="submit" radius="md" color="blue.9">
              {isEditing ? "Update Role" : "Create Role"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
