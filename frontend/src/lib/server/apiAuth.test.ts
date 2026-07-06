import { describe, expect, it } from 'vitest';
import {
  hasRequiredRole,
  isPublicApiRoute,
  normalizeRole,
  requiredRolesForRoute
} from './apiAuth';

describe('apiAuth utilities', () => {
  it('normalizes known role aliases', () => {
    expect(normalizeRole('admin')).toBe('ADMIN');
    expect(normalizeRole('FORWARDER')).toBe('FORWARDER');
    expect(normalizeRole('employee')).toBe('FORWARDER');
    expect(normalizeRole('anything-else')).toBe('CUSTOMER');
  });

  it('marks driver application submit as a public API route', () => {
    expect(isPublicApiRoute('/api/driver-requests', 'POST')).toBe(true);
    expect(isPublicApiRoute('/api/driver-requests', 'GET')).toBe(false);
  });

  it('returns role requirements for protected admin endpoints', () => {
    expect(requiredRolesForRoute('/api/users', 'GET')).toEqual(['ADMIN']);
    expect(requiredRolesForRoute('/api/driver-requests/123/approve', 'POST')).toEqual(['ADMIN']);
    expect(requiredRolesForRoute('/api/jobs', 'GET')).toBeNull();
  });

  it('checks role authorization against route policy', () => {
    expect(hasRequiredRole('ADMIN', ['ADMIN'])).toBe(true);
    expect(hasRequiredRole('CUSTOMER', ['ADMIN'])).toBe(false);
    expect(hasRequiredRole('FORWARDER', null)).toBe(true);
  });
});
