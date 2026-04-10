import { configureStore } from '@reduxjs/toolkit';
import rolesReducer, {
  fetchRolesAsync,
  createRoleAsync,
  updateRoleAsync,
  deleteRoleAsync,
} from '@/lib/store/rolesSlice';

jest.mock('@/app/actions/get', () => ({
  fetchRoles: jest.fn(),
}));
jest.mock('@/app/actions/post', () => ({
  createRole: jest.fn(),
}));
jest.mock('@/app/actions/update', () => ({
  updateRole: jest.fn(),
}));
jest.mock('@/app/actions/delete', () => ({
  deleteRole: jest.fn(),
}));

import { fetchRoles } from '@/app/actions/get';
import { createRole } from '@/app/actions/post';
import { updateRole } from '@/app/actions/update';
import { deleteRole } from '@/app/actions/delete';

const makeStore = () => configureStore({ reducer: { roles: rolesReducer } });

const MOCK_ROLE = {
  role_id: 'r1',
  role_title: 'Software Engineer',
  role_department: 'Engineering',
  role_created_at: '2024-01-01',
};

describe('rolesSlice – initial state', () => {
  it('has correct initial state', () => {
    const store = makeStore();
    const state = store.getState().roles;
    expect(state.items).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });
});

describe('rolesSlice – fetchRolesAsync', () => {
  it('populates items on fulfilled', async () => {
    (fetchRoles as jest.Mock).mockResolvedValueOnce({ success: true, data: [MOCK_ROLE] });

    const store = makeStore();
    await store.dispatch(fetchRolesAsync());
    const state = store.getState().roles;

    expect(state.loading).toBe(false);
    expect(state.items).toHaveLength(1);
    expect(state.items[0].role_title).toBe('Software Engineer');
  });

  it('sets loading=true while pending', () => {
    (fetchRoles as jest.Mock).mockReturnValueOnce(new Promise(() => {})); // never resolves
    const store = makeStore();
    store.dispatch(fetchRolesAsync());
    expect(store.getState().roles.loading).toBe(true);
  });

  it('sets error message on rejected', async () => {
    (fetchRoles as jest.Mock).mockResolvedValueOnce({ success: false, message: 'DB error' });

    const store = makeStore();
    await store.dispatch(fetchRolesAsync());
    const state = store.getState().roles;

    expect(state.loading).toBe(false);
    expect(state.error).toBe('DB error');
  });
});

describe('rolesSlice – createRoleAsync', () => {
  it('appends the new role to items on fulfilled', async () => {
    (createRole as jest.Mock).mockResolvedValueOnce({ success: true, data: MOCK_ROLE });

    const store = makeStore();
    await store.dispatch(createRoleAsync({ role_title: 'Software Engineer', role_department: 'Engineering' }));
    const state = store.getState().roles;

    expect(state.items).toHaveLength(1);
    expect(state.items[0].role_id).toBe('r1');
  });

  it('throws when action fails', async () => {
    (createRole as jest.Mock).mockResolvedValueOnce({ success: false, message: 'Duplicate title' });

    const store = makeStore();
    const action = await store.dispatch(createRoleAsync({ role_title: 'SW Eng', role_department: 'Eng' }));

    expect(action.type).toContain('rejected');
  });
});

describe('rolesSlice – updateRoleAsync', () => {
  it('updates the role in items on fulfilled', async () => {
    (fetchRoles as jest.Mock).mockResolvedValueOnce({ success: true, data: [MOCK_ROLE] });
    const updatedRole = { ...MOCK_ROLE, role_title: 'Senior Engineer' };
    (updateRole as jest.Mock).mockResolvedValueOnce({ success: true, data: updatedRole });

    const store = makeStore();
    await store.dispatch(fetchRolesAsync());
    await store.dispatch(updateRoleAsync({ role_id: 'r1', updates: { role_title: 'Senior Engineer' } }));

    const state = store.getState().roles;
    expect(state.items[0].role_title).toBe('Senior Engineer');
  });

  it('throws on failure', async () => {
    (updateRole as jest.Mock).mockResolvedValueOnce({ success: false, message: 'Not found' });

    const store = makeStore();
    const action = await store.dispatch(updateRoleAsync({ role_id: 'bad', updates: {} }));
    expect(action.type).toContain('rejected');
  });
});

describe('rolesSlice – deleteRoleAsync', () => {
  it('removes the role from items on fulfilled', async () => {
    (fetchRoles as jest.Mock).mockResolvedValueOnce({ success: true, data: [MOCK_ROLE] });
    (deleteRole as jest.Mock).mockResolvedValueOnce({ success: true });

    const store = makeStore();
    await store.dispatch(fetchRolesAsync());
    await store.dispatch(deleteRoleAsync('r1'));

    expect(store.getState().roles.items).toHaveLength(0);
  });

  it('throws on failure', async () => {
    (deleteRole as jest.Mock).mockResolvedValueOnce({ success: false, message: 'FK violation' });

    const store = makeStore();
    const action = await store.dispatch(deleteRoleAsync('r1'));
    expect(action.type).toContain('rejected');
  });
});
