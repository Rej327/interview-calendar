import {
  fetchCalendarEvents,
  fetchCandidates,
  fetchCandidatesPaginated,
  fetchRoles,
  fetchInterviewers,
  fetchRecentChanges,
  fetchCandidateJourney,
  fetchCandidateForInvite,
} from '@/app/actions/get';
import { supabaseAdmin } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    rpc: jest.fn(),
    from: jest.fn(),
  },
}));

const mockRpc = supabaseAdmin.rpc as jest.Mock;
const mockFrom = supabaseAdmin.from as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── fetchCalendarEvents ────────────────────────────────────────────────────
describe('fetchCalendarEvents', () => {
  it('returns data on success', async () => {
    mockRpc.mockResolvedValueOnce({ data: [{ id: 'ev1' }], error: null });
    const result = await fetchCalendarEvents('2024-01-01', '2024-01-31');
    expect(result.success).toBe(true);
    expect(result.data).toEqual([{ id: 'ev1' }]);
    expect(mockRpc).toHaveBeenCalledWith('get_calendar_events', {
      input_data: { start_date: '2024-01-01', end_date: '2024-01-31' },
    });
  });

  it('handles rpc errors gracefully', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'RPC failed' } });
    const result = await fetchCalendarEvents();
    expect(result.success).toBe(false);
    expect(result.message).toBe('RPC failed');
  });

  it('handles empty date parameters', async () => {
    mockRpc.mockResolvedValueOnce({ data: [], error: null });
    const result = await fetchCalendarEvents('', '');
    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
    expect(mockRpc).toHaveBeenCalledWith('get_calendar_events', {
      input_data: { start_date: '', end_date: '' },
    });
  });

  it('handles large data responses sequentially', async () => {
    const largeData = Array.from({ length: 1000 }, (_, i) => ({ id: `ev${i}` }));
    mockRpc.mockResolvedValueOnce({ data: largeData, error: null });
    const result = await fetchCalendarEvents('2020-01-01', '2030-01-01');
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1000);
  });
});

// ─── fetchCandidates ────────────────────────────────────────────────────────
describe('fetchCandidates', () => {
  it('returns candidates on success', async () => {
    mockRpc.mockResolvedValueOnce({ data: [{ candidate_id: 'c1' }], error: null });
    const result = await fetchCandidates();
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
  });

  it('returns error message on failure', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } });
    const result = await fetchCandidates();
    expect(result.success).toBe(false);
    expect(result.message).toBe('DB error');
  });
});

// ─── fetchCandidatesPaginated ───────────────────────────────────────────────
describe('fetchCandidatesPaginated', () => {
  const params = { limit: 10, offset: 0, query: 'alice' };

  it('returns paginated data on success', async () => {
    const mockData = { total_count: 1, records: [{ candidate_id: 'c2' }] };
    mockRpc.mockResolvedValueOnce({ data: mockData, error: null });
    const result = await fetchCandidatesPaginated(params);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockData);
    expect(mockRpc).toHaveBeenCalledWith('get_candidates_portfolio_paginated', {
      input_data: params,
    });
  });

  it('returns error on failure', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'Timeout' } });
    const result = await fetchCandidatesPaginated(params);
    expect(result.success).toBe(false);
    expect(result.message).toBe('Timeout');
  });

  it('handles empty results (0 matches)', async () => {
    const mockData = { total_count: 0, records: [] };
    mockRpc.mockResolvedValueOnce({ data: mockData, error: null });
    const result = await fetchCandidatesPaginated({ limit: 10, offset: 0, query: 'does_not_exist' });
    expect(result.success).toBe(true);
    expect(result.data.records).toHaveLength(0);
    expect(result.data.total_count).toBe(0);
  });

  it('handles large pagination request limits (large data edge cases)', async () => {
    const largeParams = { limit: 10000, offset: 50000 };
    const mockData = { 
      total_count: 60000, 
      records: Array.from({ length: 5000 }, (_, i) => ({ candidate_id: `c${i}` })) 
    };
    mockRpc.mockResolvedValueOnce({ data: mockData, error: null });
    const result = await fetchCandidatesPaginated(largeParams);
    expect(result.success).toBe(true);
    expect(result.data.records).toHaveLength(5000);
    expect(mockRpc).toHaveBeenCalledWith('get_candidates_portfolio_paginated', {
      input_data: largeParams,
    });
  });
});

// ─── fetchRoles ─────────────────────────────────────────────────────────────
describe('fetchRoles', () => {
  it('returns roles on success', async () => {
    mockRpc.mockResolvedValueOnce({ data: [{ role_id: 'r1', role_title: 'Engineer' }], error: null });
    const result = await fetchRoles();
    expect(result.success).toBe(true);
    expect(result.data[0].role_title).toBe('Engineer');
  });

  it('returns error on failure', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });
    const result = await fetchRoles();
    expect(result.success).toBe(false);
  });

  it('handles empty roles data gracefully', async () => {
    mockRpc.mockResolvedValueOnce({ data: [], error: null });
    const result = await fetchRoles();
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(0);
  });
});

// ─── fetchInterviewers ──────────────────────────────────────────────────────
describe('fetchInterviewers', () => {
  it('returns interviewers on success', async () => {
    mockRpc.mockResolvedValueOnce({ data: [{ interviewer_id: 'i1' }], error: null });
    const result = await fetchInterviewers();
    expect(result.success).toBe(true);
    expect(result.data).toEqual([{ interviewer_id: 'i1' }]);
  });

  it('handles error gracefully', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'Unauthorized' } });
    const result = await fetchInterviewers();
    expect(result.success).toBe(false);
    expect(result.message).toBe('Unauthorized');
  });
});

// ─── fetchRecentChanges ─────────────────────────────────────────────────────
describe('fetchRecentChanges', () => {
  it('returns changes on success', async () => {
    mockRpc.mockResolvedValueOnce({ data: [{ change_id: 'ch1' }], error: null });
    const result = await fetchRecentChanges();
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
  });

  it('handles error gracefully', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'No data' } });
    const result = await fetchRecentChanges();
    expect(result.success).toBe(false);
  });
});

// ─── fetchCandidateJourney ──────────────────────────────────────────────────
describe('fetchCandidateJourney', () => {
  it('returns journey data on success', async () => {
    mockRpc.mockResolvedValueOnce({ data: { hiring_process_id: 'hp1', steps: [] }, error: null });
    const result = await fetchCandidateJourney('hp1');
    expect(result.success).toBe(true);
    expect(mockRpc).toHaveBeenCalledWith('get_hiring_process_details', {
      input_data: { hiring_process_id: 'hp1' },
    });
  });

  it('returns error on failure', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });
    const result = await fetchCandidateJourney('hp-missing');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Not found');
  });
});

// ─── fetchCandidateForInvite ─────────────────────────────────────────────────
describe('fetchCandidateForInvite', () => {
  const mockDbRow = {
    candidate_id: 'c3',
    candidate_full_name: 'Alice Brown',
    candidate_email: 'alice@example.com',
    hiring_processes_table: [
      {
        roles_table: { role_title: 'Designer', role_department: 'Product' },
      },
    ],
  };

  beforeEach(() => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockDbRow, error: null }),
    });
  });

  it('flattens candidate data correctly', async () => {
    const result = await fetchCandidateForInvite('c3');
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      id: 'c3',
      name: 'Alice Brown',
      email: 'alice@example.com',
      role: 'Designer',
      department: 'Product',
    });
  });

  it('falls back to default role when missing', async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { ...mockDbRow, hiring_processes_table: [] },
        error: null,
      }),
    });
    const result = await fetchCandidateForInvite('c3');
    expect(result.success).toBe(true);
    expect(result.data?.role).toBe('Specialized Position');
    expect(result.data?.department).toBe('Recruitment');
  });

  it('returns error on db failure', async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Row not found' } }),
    });
    const result = await fetchCandidateForInvite('bad-id');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Row not found');
  });
});
