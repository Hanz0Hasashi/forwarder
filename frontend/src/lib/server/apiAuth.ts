export type AppRole = 'ADMIN' | 'CUSTOMER' | 'FORWARDER';

type RoutePolicy = {
  pattern: RegExp;
  methods: string[];
  roles: AppRole[];
};

const PUBLIC_API_RULES: Array<Pick<RoutePolicy, 'pattern' | 'methods'>> = [
  {
    pattern: /^\/api\/driver-requests$/,
    methods: ['POST']
  }
];

const ROLE_POLICIES: RoutePolicy[] = [
  {
    pattern: /^\/api\/users(?:\/.*)?$/,
    methods: ['GET', 'PATCH', 'DELETE'],
    roles: ['ADMIN']
  },
  {
    pattern: /^\/api\/driver-requests$/,
    methods: ['GET'],
    roles: ['ADMIN']
  },
  {
    pattern: /^\/api\/driver-requests\/[^/]+\/(approve|reject)$/,
    methods: ['POST'],
    roles: ['ADMIN']
  }
];

export function normalizeRole(input: unknown): AppRole {
  const role = typeof input === 'string' ? input.toUpperCase() : '';

  if (role === 'ADMIN') {
    return 'ADMIN';
  }

  if (role === 'FORWARDER' || role === 'EMPLOYEE') {
    return 'FORWARDER';
  }

  return 'CUSTOMER';
}

export function isPublicApiRoute(pathname: string, method: string): boolean {
  return PUBLIC_API_RULES.some((rule) => rule.pattern.test(pathname) && rule.methods.includes(method));
}

export function requiredRolesForRoute(pathname: string, method: string): AppRole[] | null {
  const matched = ROLE_POLICIES.find((policy) => policy.pattern.test(pathname) && policy.methods.includes(method));
  return matched ? matched.roles : null;
}

export function hasRequiredRole(role: AppRole, required: AppRole[] | null): boolean {
  if (!required || required.length === 0) {
    return true;
  }

  return required.includes(role);
}
