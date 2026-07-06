import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockBidFindUnique,
  mockBidUpdate,
  mockBidUpdateMany,
  mockBidDelete,
  mockBidCount,
  mockJobUpdate,
  mockTransaction,
  mockFetch
} = vi.hoisted(() => ({
  mockBidFindUnique: vi.fn(),
  mockBidUpdate: vi.fn(),
  mockBidUpdateMany: vi.fn(),
  mockBidDelete: vi.fn(),
  mockBidCount: vi.fn(),
  mockJobUpdate: vi.fn(),
  mockTransaction: vi.fn(),
  mockFetch: vi.fn()
}));

vi.mock('$lib/server/prisma', () => ({
  prisma: {
    bid: {
      findUnique: mockBidFindUnique,
      update: mockBidUpdate,
      updateMany: mockBidUpdateMany,
      delete: mockBidDelete,
      count: mockBidCount
    },
    job: {
      update: mockJobUpdate
    },
    $transaction: mockTransaction
  }
}));

vi.stubGlobal('fetch', mockFetch);

import { PATCH as clientAccept } from '../jobs/[job_id]/bids/[bid_id]/client-accept/+server';
import { PATCH as clientReject } from '../jobs/[job_id]/bids/[bid_id]/client-reject/+server';
import { PATCH as forwarderAccept } from '../jobs/[job_id]/bids/[bid_id]/accept/+server';
import { DELETE as deleteBid } from '../jobs/[job_id]/bids/[bid_id]/+server';
import { GET as usersGet, PATCH as usersPatch, DELETE as usersDelete } from '../users/+server';

function auth(userId: string | null, role: 'ADMIN' | 'CUSTOMER' | 'FORWARDER' | null) {
  return { locals: { auth: { userId, role } } } as any;
}

describe('bid lifecycle endpoint contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('client-accept returns 400 when bid does not belong to job', async () => {
    mockBidFindUnique.mockResolvedValueOnce({
      id: 'bid_1',
      jobId: 'other_job',
      amount: 500,
      aiCounterAmount: null,
      forwarderId: 'fwd_1',
      job: { customerId: 'cust_1' }
    });

    const response = await clientAccept({
      params: { job_id: 'job_1', bid_id: 'bid_1' },
      ...auth('cust_1', 'CUSTOMER')
    } as any);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ detail: 'Bid does not belong to this job' });
  });

  it('client-accept returns success contract and uses transaction', async () => {
    mockBidFindUnique.mockResolvedValueOnce({
      id: 'bid_1',
      jobId: 'job_1',
      amount: 500,
      aiCounterAmount: 480,
      forwarderId: 'fwd_1',
      job: { customerId: 'cust_1' }
    });

    const updatedJob = { id: 'job_1', status: 'Pending Pickup' };
    mockTransaction.mockResolvedValueOnce([{}, {}, updatedJob]);

    const response = await clientAccept({
      params: { job_id: 'job_1', bid_id: 'bid_1' },
      ...auth('cust_1', 'CUSTOMER')
    } as any);

    expect(response.status).toBe(200);
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(await response.json()).toEqual({ status: 'success', data: updatedJob });
  });

  it('client-reject returns forbidden for non-owner customer', async () => {
    mockBidFindUnique.mockResolvedValueOnce({
      id: 'bid_1',
      jobId: 'job_1',
      job: { customerId: 'different_customer' }
    });

    const response = await clientReject({
      params: { job_id: 'job_1', bid_id: 'bid_1' },
      ...auth('cust_1', 'CUSTOMER')
    } as any);

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Forbidden' });
  });

  it('client-reject returns success contract with tx callback path', async () => {
    mockBidFindUnique.mockResolvedValueOnce({
      id: 'bid_1',
      jobId: 'job_1',
      job: { customerId: 'cust_1' }
    });

    const updatedJob = { id: 'job_1', status: 'Reviewing' };
    mockTransaction.mockImplementationOnce(async (callback: any) => {
      return callback({
        bid: {
          update: mockBidUpdate,
          count: mockBidCount
        },
        job: {
          update: vi.fn().mockResolvedValue(updatedJob)
        }
      });
    });
    mockBidUpdate.mockResolvedValueOnce({});
    mockBidCount.mockResolvedValueOnce(0);

    const response = await clientReject({
      params: { job_id: 'job_1', bid_id: 'bid_1' },
      ...auth('cust_1', 'CUSTOMER')
    } as any);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'success', data: updatedJob });
  });

  it('forwarder accept returns forbidden for non-owner bid', async () => {
    mockBidFindUnique.mockResolvedValueOnce({
      id: 'bid_1',
      forwarderId: 'other_fwd',
      amount: 500,
      aiCounterAmount: null,
      job: { status: 'Reviewing' }
    });

    const response = await forwarderAccept({
      params: { job_id: 'job_1', bid_id: 'bid_1' },
      ...auth('fwd_1', 'FORWARDER')
    } as any);

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Forbidden' });
  });

  it('forwarder accept returns success contract for valid bid', async () => {
    mockBidFindUnique.mockResolvedValueOnce({
      id: 'bid_1',
      forwarderId: 'fwd_1',
      amount: 520,
      aiCounterAmount: 510,
      job: { status: 'Reviewing' }
    });

    const updatedJob = { id: 'job_1', status: 'Pending Client Approval' };
    mockTransaction.mockResolvedValueOnce([{}, updatedJob]);

    const response = await forwarderAccept({
      params: { job_id: 'job_1', bid_id: 'bid_1' },
      ...auth('fwd_1', 'FORWARDER')
    } as any);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'success', job: updatedJob });
  });

  it('delete bid returns 404 for missing bid', async () => {
    mockBidFindUnique.mockResolvedValueOnce(null);

    const response = await deleteBid({
      params: { bid_id: 'missing' },
      ...auth('fwd_1', 'FORWARDER')
    } as any);

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ detail: 'Bid not found' });
  });

  it('delete bid returns success contract for owner', async () => {
    mockBidFindUnique.mockResolvedValueOnce({ id: 'bid_1', forwarderId: 'fwd_1' });
    const deletedBid = {
      id: 'bid_1',
      status: 'PENDING_AI_REVIEW',
      job: { id: 'job_1', status: 'Reviewing', bids: [] }
    };
    mockBidDelete.mockResolvedValueOnce(deletedBid);

    const response = await deleteBid({
      params: { bid_id: 'bid_1' },
      ...auth('fwd_1', 'FORWARDER')
    } as any);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'success', data: deletedBid });
  });
});

describe('users endpoint contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/users maps successful clerk payload', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [
        {
          id: 'user_1',
          first_name: 'Alice',
          last_name: 'Admin',
          email_addresses: [{ email_address: 'a@example.com' }],
          public_metadata: { role: 'admin' }
        }
      ]
    });

    const response = await usersGet();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([
      { id: 'user_1', name: 'Alice Admin', email: 'a@example.com', role: 'admin' }
    ]);
  });

  it('GET /api/users propagates clerk non-ok status contract', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 429 });

    const response = await usersGet();
    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({ error: 'Failed to fetch users' });
  });

  it('PATCH /api/users returns upstream status contract on failure', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 400 });

    const request = new Request('http://localhost/api/users', {
      method: 'PATCH',
      body: JSON.stringify({ userId: 'user_1', role: 'admin' })
    });

    const response = await usersPatch({ request } as any);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Failed to update role' });
  });

  it('DELETE /api/users returns success contract', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });

    const request = new Request('http://localhost/api/users', {
      method: 'DELETE',
      body: JSON.stringify({ userId: 'user_1' })
    });

    const response = await usersDelete({ request } as any);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
  });
});
