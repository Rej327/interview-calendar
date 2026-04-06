import { sendCandidateInvite } from '@/app/actions/post';
import { supabaseAdmin } from '@/lib/supabase';
import { resend } from '@/lib/resend';

// Mock the dependencies
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
  },
}));

jest.mock('@/lib/resend', () => ({
  resend: {
    emails: {
      send: jest.fn(),
    },
    batch: {
      send: jest.fn(),
    },
  },
}));

describe('sendCandidateInvite Action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send a single invitation successfully', async () => {
    const mockCandidate = {
      candidate_id: '1',
      candidate_full_name: 'John Doe',
      candidate_email: 'john@example.com',
      hiring_processes_table: [{
        roles_table: { role_title: 'Software Engineer' }
      }]
    };

    (supabaseAdmin.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      in: jest.fn().mockResolvedValue({ data: [mockCandidate], error: null }),
    });

    (resend.emails.send as jest.Mock).mockResolvedValue({ data: { id: 'msg_123' }, error: null });

    const result = await sendCandidateInvite({ candidate_ids: ['1'], platform: 'Web' });

    expect(result.success).toBe(true);
    expect(result.message).toContain('An invitation has been sent to John Doe');
    expect(resend.emails.send).toHaveBeenCalledWith(expect.objectContaining({
      to: ['john@example.com'],
      subject: expect.stringContaining('Software Engineer'),
    }));
  });

  it('should send bulk invitations successfully', async () => {
    const mockCandidates = [
      {
        candidate_id: '1',
        candidate_full_name: 'John Doe',
        candidate_email: 'john@example.com',
        hiring_processes_table: [{ roles_table: { role_title: 'Engineer' } }]
      },
      {
        candidate_id: '2',
        candidate_full_name: 'Jane Smith',
        candidate_email: 'jane@example.com',
        hiring_processes_table: [{ roles_table: { role_title: 'Designer' } }]
      }
    ];

    (supabaseAdmin.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      in: jest.fn().mockResolvedValue({ data: mockCandidates, error: null }),
    });

    (resend.batch.send as jest.Mock).mockResolvedValue({ data: [{ id: '1' }, { id: '2' }], error: null });

    const result = await sendCandidateInvite({ candidate_ids: ['1', '2'], platform: 'Bulk' });

    expect(result.success).toBe(true);
    expect(result.message).toBe('Invitations for 2 candidates have been sent.');
    expect(resend.batch.send).toHaveBeenCalledTimes(1);
    const batchArg = (resend.batch.send as jest.Mock).mock.calls[0][0];
    expect(batchArg).toHaveLength(2);
    expect(batchArg[1].to).toEqual(['jane@example.com']);
  });

  it('should return a user-friendly error message when no candidates are found', async () => {
    (supabaseAdmin.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      in: jest.fn().mockResolvedValue({ data: [], error: null }),
    });

    const result = await sendCandidateInvite({ candidate_ids: ['non-existent'] });

    expect(result.success).toBe(false);
    expect(result.message).toBe("We couldn't send the invitation right now. Please try again.");
  });

  it('should handle database errors gracefully', async () => {
    (supabaseAdmin.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      in: jest.fn().mockResolvedValue({ data: null, error: { message: 'Database down' } }),
    });

    const result = await sendCandidateInvite({ candidate_ids: ['1'] });

    expect(result.success).toBe(false);
    expect(result.message).toBe("We couldn't send the invitation right now. Please try again.");
  });
});
