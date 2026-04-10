import { updateInterview, updateRole, updateCandidate } from '@/app/actions/update';
import { supabaseAdmin } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

const mockFrom = supabaseAdmin.from as jest.Mock;
const mockRpc = supabaseAdmin.rpc as jest.Mock;

beforeEach(() => jest.clearAllMocks());

// ─── updateInterview ─────────────────────────────────────────────────────────
describe('updateInterview', () => {
  const buildChain = (resolved: any) => ({
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(resolved),
  });

  it('returns updated interview on success', async () => {
    const updated = { interview_id: 'iv1', status: 'DONE' };
    mockFrom.mockReturnValue(buildChain({ data: updated, error: null }));

    const result = await updateInterview('iv1', { status: 'DONE' });

    expect(result.success).toBe(true);
    expect(result.data).toEqual(updated);
    expect(mockFrom).toHaveBeenCalledWith('interviews_table');
  });

  it('returns error message on DB failure', async () => {
    mockFrom.mockReturnValue(buildChain({ data: null, error: { message: 'Constraint violation' } }));
    const result = await updateInterview('iv1', { status: 'INVALID' });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Constraint violation');
  });
});

// ─── updateRole ──────────────────────────────────────────────────────────────
describe('updateRole', () => {
  const buildChain = (resolved: any) => ({
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(resolved),
  });

  it('returns updated role on success', async () => {
    const updated = { role_id: 'r1', role_title: 'Senior Engineer' };
    mockFrom.mockReturnValue(buildChain({ data: updated, error: null }));

    const result = await updateRole('r1', { role_title: 'Senior Engineer' });

    expect(result.success).toBe(true);
    expect(result.data.role_title).toBe('Senior Engineer');
    expect(mockFrom).toHaveBeenCalledWith('roles_table');
  });

  it('returns error message on DB failure', async () => {
    mockFrom.mockReturnValue(buildChain({ data: null, error: { message: 'Role not found' } }));
    const result = await updateRole('r-missing', {});

    expect(result.success).toBe(false);
    expect(result.message).toBe('Role not found');
  });
});

// ─── updateCandidate ─────────────────────────────────────────────────────────
describe('updateCandidate', () => {
  it('calls the update_candidate rpc and returns data', async () => {
    const updated = { candidate_id: 'c1', candidate_full_name: 'Bob Updated' };
    mockRpc.mockResolvedValueOnce({ data: updated, error: null });

    const result = await updateCandidate({ candidate_id: 'c1', full_name: 'Bob Updated' });

    expect(result.success).toBe(true);
    expect(result.data).toEqual(updated);
    expect(mockRpc).toHaveBeenCalledWith('update_candidate', {
      input_data: { candidate_id: 'c1', full_name: 'Bob Updated' },
    });
  });

  it('returns error message when rpc fails', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'Candidate not found' } });
    const result = await updateCandidate({ candidate_id: 'bad', status: 'HIRED' });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Candidate not found');
  });
});
