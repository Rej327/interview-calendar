import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchRoles } from '@/app/actions/get';
import { createRole } from '@/app/actions/post';

export interface Role {
  role_id: string;
  role_title: string;
  role_department: string;
  role_created_at: string;
}

interface RolesState {
  items: Role[];
  loading: boolean;
  error: string | null;
}

const initialState: RolesState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchRolesAsync = createAsyncThunk('roles/fetchRoles', async () => {
  const response = await fetchRoles();
  if (!response.success) {
    throw new Error(response.message);
  }
  return response.data;
});

export const createRoleAsync = createAsyncThunk(
  'roles/createRole',
  async (newRole: { role_title: string; role_department: string }) => {
    const response = await createRole(newRole);
    if (!response.success) {
      throw new Error(response.message);
    }
    return response.data;
  }
);

export const updateRoleAsync = createAsyncThunk(
  'roles/updateRole',
  async ({ role_id, updates }: { role_id: string; updates: any }) => {
    const { updateRole } = await import('@/app/actions/update');
    const response = await updateRole(role_id, updates);
    if (!response.success) {
      throw new Error(response.message);
    }
    return response.data;
  }
);

export const deleteRoleAsync = createAsyncThunk(
  'roles/deleteRole',
  async (role_id: string) => {
    const { deleteRole } = await import('@/app/actions/delete');
    const response = await deleteRole(role_id);
    if (!response.success) {
      throw new Error(response.message);
    }
    return role_id;
  }
);

const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRolesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRolesAsync.fulfilled, (state, action: PayloadAction<Role[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchRolesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch roles';
      })
      .addCase(createRoleAsync.fulfilled, (state, action: PayloadAction<Role>) => {
        state.items.push(action.payload);
      })
      .addCase(updateRoleAsync.fulfilled, (state, action: PayloadAction<Role>) => {
        const index = state.items.findIndex(item => item.role_id === action.payload.role_id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteRoleAsync.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter(item => item.role_id !== action.payload);
      });
  },
});

export default rolesSlice.reducer;
