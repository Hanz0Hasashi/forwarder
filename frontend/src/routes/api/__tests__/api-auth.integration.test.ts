import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockFindManyJobs,
  mockFindUniqueBid,
  mockTransaction,
  mockJobUpdate,
  mockBidUpdate,
  mockBidUpdateMany
} = vi.hoisted(() => ({
  mockFindManyJobs: vi.fn(),
  mockFindUniqueBid: vi.fn(),
  mockTransaction: vi.fn(),
  mockJobUpdate: vi.fn(),
  mockBidUpdate: vi.fn(),
  mockBidUpdateMany: vi.fn()
}));

vi.mock('$lib/server/prisma', () => ({
  prisma: {
    job: {
      findMany: mockFindManyJobs,
      update: mockJobUpdate
    },
    bid: {
      findUnique: mockFindUniqueBid,
      update: mockBidUpdate,
      updateMany: mockBidUpdateMany
    },
    $transaction: mockTransaction
  }
}));

import { GET as getJobs } from '../jobs/+server';
import { GET as getTrips } from '../trips/+server';
import { PATCH as clientAcceptBid } from '../jobs/[job_id]/bids/[bid_id]/client-accept/+server';

describe('API route authorization and transaction behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unauthenticated jobs listing requests', async () => {
    const response = await getJobs({
      locals: { auth: { userId: null, role: null } }
    } as any);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
  });

  it('scopes trips query to authenticated customer id', async () => {
    mockFindManyJobs.mockResolvedValueOnce([]);

    const response = await getTrips({
      locals: { auth: { userId: 'user_customer_1', role: 'CUSTOMER' } }
    } as any);

    expect(response.status).toBe(200);
    expect(mockFindManyJobs).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { customerId: 'user_customer_1' }
      })
    );
  });

  it('blocks client bid acceptance when customer does not own the job', async () => {
    mockFindUniqueBid.mockResolvedValueOnce({
      id: 'bid_1',
      jobId: 'job_1',
      amount: 500,
      aiCounterAmount: null,
      forwarderId: 'forwarder_1',
      job: {
        id: 'job_1',
        customerId: 'different_customer'
      }
    });

    const response = await clientAcceptBid({
      params: { job_id: 'job_1', bid_id: 'bid_1' },
      locals: { auth: { userId: 'customer_1', role: 'CUSTOMER' } }
    } as any);

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Forbidden' });
  });

  it('uses a transaction to accept selected bid and update job state', async () => {
    mockFindUniqueBid.mockResolvedValueOnce({
      id: 'bid_1',
      jobId: 'job_1',
      amount: 620,
      aiCounterAmount: 600,
      forwarderId: 'forwarder_1',
      job: {
        id: 'job_1',
        customerId: 'customer_1'
      }
    });

    const updatedJob = { id: 'job_1', status: 'Pending Pickup' };
    mockTransaction.mockResolvedValueOnce([{}, {}, updatedJob]);

    const response = await clientAcceptBid({
      params: { job_id: 'job_1', bid_id: 'bid_1' },
      locals: { auth: { userId: 'customer_1', role: 'CUSTOMER' } }
    } as any);

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(body).toEqual({ status: 'success', data: updatedJob });
  });
});
