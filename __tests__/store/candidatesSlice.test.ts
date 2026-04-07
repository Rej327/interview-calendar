import { configureStore } from '@reduxjs/toolkit';
import candidatesReducer, {
  fetchCandidates,
  addCandidate,
  updateCandidate,
  deleteCandidate,
} from '@/lib/store/candidatesSlice';

// ─── Mock dynamic imports used inside thunks ─────────────────────────────────
jest.mock('@/app/actions/get', () => ({
  fetchCandidatesPaginated: jest.fn(),
}));
jest.mock('@/app/actions/post', () => ({
  createCandidate: jest.fn(),
}));
jest.mock('@/app/actions/update', () => ({
  updateCandidate: jest.fn(),
}));
jest.mock('@/app/actions/delete', () => ({
  deleteCandidate: jest.fn(),
}));

import { fetchCandidatesPaginated } from '@/app/actions/get';
import { createCandidate } from '@/app/actions/post';
import { updateCandidate as updateCandidateAction } from '@/app/actions/update';
import { deleteCandidate as deleteCandidateAction } from '@/app/actions/delete';

const makeStore = () =>
  configureStore({ reducer: { candidates: candidatesReducer } });

const FETCH_PARAMS = { limit: 10, offset: 0 };

describe('candidatesSlice – reducers', () => {
  it('has correct initial state', () => {
    const store = makeStore();
    const state = store.getState().candidates;
    expect(state.candidates).toEqual([]);
    expect(state.totalCount).toBe(0);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });
});

describe('candidatesSlice – fetchCandidates thunk', () => {
  it('sets loading=true while pending', () => {
    const store = makeStore();
    store.dispatch(fetchCandidates(FETCH_PARAMS));
    expect(store.getState().candidates.loading).toBe(true);
  });

  it('populates candidates and totalCount on fulfilled', async () => {
    const mockData = { total_count: 2, records: [{ candidate_id: 'c1' }, { candidate_id: 'c2' }] };
    (fetchCandidatesPaginated as jest.Mock).mockResolvedValueOnce({ success: true, data: mockData });

    const store = makeStore();
    await store.dispatch(fetchCandidates(FETCH_PARAMS));
    const state = store.getState().candidates;

    expect(state.loading).toBe(false);
    expect(state.candidates).toHaveLength(2);
    expect(state.totalCount).toBe(2);
  });

  it('sets error on rejected', async () => {
    (fetchCandidatesPaginated as jest.Mock).mockResolvedValueOnce({ success: false, message: 'Server error' });

    const store = makeStore();
    await store.dispatch(fetchCandidates(FETCH_PARAMS));
    const state = store.getState().candidates;

    expect(state.loading).toBe(false);
    expect(state.error).toBe('Server error');
  });
});

describe('candidatesSlice – addCandidate thunk', () => {
  const newCandidateInput = {
    full_name: 'Alice',
    email: 'alice@example.com',
    avatar_url: 'https://avatar.url',
    role_id: 'r1',
  };

  it('prepends new candidate to list on fulfilled', async () => {
    const newCandidate = { candidate_id: 'c3', candidate_full_name: 'Alice' };
    (createCandidate as jest.Mock).mockResolvedValueOnce({ success: true, data: newCandidate });

    const store = makeStore();
    await store.dispatch(addCandidate(newCandidateInput));
    const state = store.getState().candidates;

    expect(state.candidates[0]).toEqual(newCandidate);
    expect(state.totalCount).toBe(1);
  });

  it('sets error when action fails', async () => {
    (createCandidate as jest.Mock).mockResolvedValueOnce({ success: false, message: 'Duplicate email' });

    const store = makeStore();
    await store.dispatch(addCandidate(newCandidateInput));
    const state = store.getState().candidates;

    expect(state.error).toBe('Duplicate email');
    expect(state.candidates).toHaveLength(0);
  });
});

describe('candidatesSlice – updateCandidate thunk', () => {
  it('replaces candidate in list on fulfilled', async () => {
    const original = { candidate_id: 'c1', candidate_full_name: 'Old Name' };
    const updated = { candidate_id: 'c1', candidate_full_name: 'New Name' };

    // Seed the store with the original candidate
    (fetchCandidatesPaginated as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: { total_count: 1, records: [original] },
    });
    (updateCandidateAction as jest.Mock).mockResolvedValueOnce({ success: true, data: updated });

    const store = makeStore();
    await store.dispatch(fetchCandidates(FETCH_PARAMS));
    await store.dispatch(updateCandidate({ candidate_id: 'c1', full_name: 'New Name' }));

    const state = store.getState().candidates;
    expect(state.candidates[0].candidate_full_name).toBe('New Name');
  });

  it('sets error when update fails', async () => {
    (updateCandidateAction as jest.Mock).mockResolvedValueOnce({ success: false, message: 'Not found' });

    const store = makeStore();
    await store.dispatch(updateCandidate({ candidate_id: 'bad', status: 'HIRED' }));
    expect(store.getState().candidates.error).toBe('Not found');
  });
});

describe('candidatesSlice – deleteCandidate thunk', () => {
  it('removes candidate from list on fulfilled', async () => {
    (fetchCandidatesPaginated as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: { total_count: 1, records: [{ candidate_id: 'c1' }] },
    });
    (deleteCandidateAction as jest.Mock).mockResolvedValueOnce({ success: true });

    const store = makeStore();
    await store.dispatch(fetchCandidates(FETCH_PARAMS));
    await store.dispatch(deleteCandidate('c1'));

    const state = store.getState().candidates;
    expect(state.candidates).toHaveLength(0);
    expect(state.totalCount).toBe(0);
  });

  it('sets error when delete fails', async () => {
    (deleteCandidateAction as jest.Mock).mockResolvedValueOnce({ success: false, message: 'Cannot delete active candidate' });

    const store = makeStore();
    await store.dispatch(deleteCandidate('c-active'));
    expect(store.getState().candidates.error).toBe('Cannot delete active candidate');
  });
});
