import { deleteInterview, deleteRole, deleteCandidate } from '@/app/actions/delete';
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

// ─── deleteInterview ─────────────────────────────────────────────────────────
describe('deleteInterview', () => {
  const buildChain = (resolved: any) => ({
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockResolvedValue(resolved),
  });

  it('returns success when interview is deleted', async () => {
    mockFrom.mockReturnValue(buildChain({ error: null }));
    const result = await deleteInterview('iv1');

    expect(result.success).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('interviews_table');
  });

  it('returns error when deletion fails', async () => {
    mockFrom.mockReturnValue(buildChain({ error: { message: 'Interview not found' } }));
    const result = await deleteInterview('bad-id');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Interview not found');
  });
});

// ─── deleteRole ──────────────────────────────────────────────────────────────
describe('deleteRole', () => {
  const buildChain = (resolved: any) => ({
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockResolvedValue(resolved),
  });

  it('returns success when role is deleted', async () => {
    mockFrom.mockReturnValue(buildChain({ error: null }));
    const result = await deleteRole('r1');

    expect(result.success).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('roles_table');
  });

  it('returns error when deletion fails', async () => {
    mockFrom.mockReturnValue(buildChain({ error: { message: 'FK violation' } }));
    const result = await deleteRole('r1');

    expect(result.success).toBe(false);
    expect(result.message).toBe('FK violation');
  });
});

// ─── deleteCandidate ─────────────────────────────────────────────────────────
describe('deleteCandidate', () => {
  it('calls delete_candidate rpc and returns success', async () => {
    mockRpc.mockResolvedValueOnce({ data: { deleted: true }, error: null });
    const result = await deleteCandidate('c1');

    expect(result.success).toBe(true);
    expect(mockRpc).toHaveBeenCalledWith('delete_candidate', {
      input_data: { candidate_id: 'c1' },
    });
  });

  it('returns error when rpc fails', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'Cannot delete active candidate' } });
    const result = await deleteCandidate('c-active');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Cannot delete active candidate');
  });
});
