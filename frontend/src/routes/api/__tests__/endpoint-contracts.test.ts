import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockJobFindMany,
  mockJobFindUnique,
  mockJobDelete,
  mockJobCreate,
  mockBidFindUnique,
  mockBidCreate,
  mockBidUpdate,
  mockBidDelete,
  mockUserFindUnique,
  mockUserCreate,
  mockTransaction,
  mockEvaluateJob,
  mockEvaluateDriverBid
} = vi.hoisted(() => ({
  mockJobFindMany: vi.fn(),
  mockJobFindUnique: vi.fn(),
  mockJobDelete: vi.fn(),
  mockJobCreate: vi.fn(),
  mockBidFindUnique: vi.fn(),
  mockBidCreate: vi.fn(),
  mockBidUpdate: vi.fn(),
  mockBidDelete: vi.fn(),
  mockUserFindUnique: vi.fn(),
  mockUserCreate: vi.fn(),
  mockTransaction: vi.fn(),
  mockEvaluateJob: vi.fn(),
  mockEvaluateDriverBid: vi.fn()
}));

vi.mock('$lib/server/prisma', () => ({
  prisma: {
    job: {
      findMany: mockJobFindMany,
      findUnique: mockJobFindUnique,
      delete: mockJobDelete,
      create: mockJobCreate,
      update: vi.fn()
    },
    bid: {
      findUnique: mockBidFindUnique,
      create: mockBidCreate,
      update: mockBidUpdate,
      delete: mockBidDelete,
      updateMany: vi.fn(),
      count: vi.fn()
    },
    user: {
      findUnique: mockUserFindUnique,
      create: mockUserCreate
    },
    $transaction: mockTransaction
  }
}));

vi.mock('$lib/server/ai/intakeAgent', () => ({
  evaluateJob: mockEvaluateJob
}));

vi.mock('$lib/server/ai/brokerAgent', () => ({
  evaluateDriverBid: mockEvaluateDriverBid
}));

import { GET as getJobs } from '../jobs/+server';
import { GET as getJobById, DELETE as deleteJobById } from '../jobs/[job_id]/+server';
import { GET as getTrips } from '../trips/+server';
import { POST as submitJob } from '../submit-job/+server';
import { POST as submitBid } from '../jobs/[job_id]/bids/+server';

function auth(userId: string | null, role: 'ADMIN' | 'CUSTOMER' | 'FORWARDER' | null) {
  return { locals: { auth: { userId, role } } } as any;
}

describe('endpoint contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/jobs', () => {
    it('returns 401 for unauthenticated callers', async () => {
      const response = await getJobs(auth(null, null));
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: 'Unauthorized' });
    });

    it('returns success contract for authenticated customer', async () => {
      const jobs = [{ id: 'job_1' }, { id: 'job_2' }];
      mockJobFindMany.mockResolvedValueOnce(jobs);

      const response = await getJobs(auth('cust_1', 'CUSTOMER'));
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ status: 'success', count: 2, data: jobs });
      expect(mockJobFindMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { customerId: 'cust_1' } })
      );
    });
  });

  describe('GET /api/jobs/[job_id]', () => {
    it('returns 404 when job does not exist', async () => {
      mockJobFindUnique.mockResolvedValueOnce(null);

      const response = await getJobById({
        params: { job_id: 'missing' },
        ...auth('admin_1', 'ADMIN')
      } as any);

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ detail: 'Job not found' });
    });

    it('returns 403 when customer does not own job', async () => {
      mockJobFindUnique.mockResolvedValueOnce({
        id: 'job_1',
        customerId: 'someone_else',
        status: 'Reviewing',
        bids: []
      });

      const response = await getJobById({
        params: { job_id: 'job_1' },
        ...auth('cust_1', 'CUSTOMER')
      } as any);

      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({ error: 'Forbidden' });
    });
  });

  describe('DELETE /api/jobs/[job_id]', () => {
    it('returns 403 for non-admin user', async () => {
      const response = await deleteJobById({
        params: { job_id: 'job_1' },
        ...auth('cust_1', 'CUSTOMER')
      } as any);

      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({ error: 'Forbidden' });
    });

    it('returns success contract for admin delete', async () => {
      mockJobDelete.mockResolvedValueOnce({ id: 'job_1' });

      const response = await deleteJobById({
        params: { job_id: 'job_1' },
        ...auth('admin_1', 'ADMIN')
      } as any);

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ status: 'success', message: 'Job deleted' });
    });
  });

  describe('GET /api/trips', () => {
    it('returns 401 for unauthenticated user', async () => {
      const response = await getTrips(auth(null, null));
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: 'Unauthorized' });
    });

    it('returns success contract for forwarder', async () => {
      const trips = [{ id: 'trip_1' }];
      mockJobFindMany.mockResolvedValueOnce(trips);

      const response = await getTrips(auth('fwd_1', 'FORWARDER'));
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ status: 'success', data: trips });
      expect(mockJobFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [{ forwarderId: 'fwd_1' }, { bids: { some: { forwarderId: 'fwd_1' } } }]
          }
        })
      );
    });
  });

  describe('POST /api/submit-job', () => {
    it('returns 403 for forwarder role', async () => {
      const request = new Request('http://localhost/api/submit-job', {
        method: 'POST',
        body: JSON.stringify({ route: { pickup: 'A', delivery: 'B' } })
      });

      const response = await submitJob({ request, ...auth('fwd_1', 'FORWARDER') } as any);
      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({ error: 'Only customers can submit new jobs.' });
    });

    it('returns success contract for valid customer payload', async () => {
      const request = new Request('http://localhost/api/submit-job', {
        method: 'POST',
        body: JSON.stringify({
          vehicle: { make: 'BMW', model: 'X5', year: '2021', runs: 'yes', notes: '' },
          route: { pickup: 'Berlin', delivery: 'Munich', distance: '560 km' },
          targetPrice: 900,
          customerEmail: 'c@example.com',
          customerName: 'Customer A'
        })
      });

      mockEvaluateJob.mockResolvedValueOnce({
        is_valid: true,
        reasoning: 'ok',
        estimated_complexity: 'Medium'
      });
      mockUserFindUnique.mockResolvedValueOnce({ id: 'cust_1' });
      mockJobCreate.mockResolvedValueOnce({ id: 'job_1', jobNumber: 7 });

      const response = await submitJob({ request, ...auth('cust_1', 'CUSTOMER') } as any);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        status: 'success',
        message: 'Job processed and saved to database',
        job_number: 7,
        job_id: 'job_1',
        ai_analysis: {
          is_valid: true,
          reasoning: 'ok',
          estimated_complexity: 'Medium'
        }
      });
    });

    it('returns 400 for invalid payload contract', async () => {
      const request = new Request('http://localhost/api/submit-job', {
        method: 'POST',
        body: JSON.stringify({ route: { pickup: '' } })
      });

      const response = await submitJob({ request, ...auth('cust_1', 'CUSTOMER') } as any);
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Invalid job payload');
      expect(body.detail).toBeDefined();
    });
  });

  describe('POST /api/jobs/[job_id]/bids', () => {
    it('returns 403 for customer role', async () => {
      const request = new Request('http://localhost/api/jobs/job_1/bids', {
        method: 'POST',
        body: JSON.stringify({ amount: 500 })
      });

      const response = await submitBid({
        request,
        params: { job_id: 'job_1' },
        ...auth('cust_1', 'CUSTOMER')
      } as any);

      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({ error: 'Only forwarders can submit bids.' });
    });

    it('returns 404 when target job is missing', async () => {
      const request = new Request('http://localhost/api/jobs/job_1/bids', {
        method: 'POST',
        body: JSON.stringify({ amount: 500 })
      });

      mockJobFindUnique.mockResolvedValueOnce(null);

      const response = await submitBid({
        request,
        params: { job_id: 'job_1' },
        ...auth('fwd_1', 'FORWARDER')
      } as any);

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ detail: 'Job not found' });
    });

    it('returns success contract for valid forwarder bid', async () => {
      const request = new Request('http://localhost/api/jobs/job_1/bids', {
        method: 'POST',
        body: JSON.stringify({ amount: 540, driverName: 'Driver A' })
      });

      mockJobFindUnique.mockResolvedValueOnce({
        id: 'job_1',
        status: 'Reviewing',
        make: 'Audi',
        model: 'A4',
        targetPrice: 550
      });

      mockBidCreate.mockResolvedValueOnce({ id: 'bid_1' });
      mockEvaluateDriverBid.mockResolvedValueOnce({
        decision: 'ACCEPTED',
        counter_amount: null
      });
      mockBidUpdate.mockResolvedValueOnce({
        id: 'bid_1',
        status: 'ACCEPTED',
        aiCounterAmount: null
      });

      const response = await submitBid({
        request,
        params: { job_id: 'job_1' },
        ...auth('fwd_1', 'FORWARDER')
      } as any);

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        status: 'success',
        data: {
          id: 'bid_1',
          status: 'ACCEPTED',
          aiCounterAmount: null
        }
      });
    });
  });
});
