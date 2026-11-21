import {
  createProjectSchema,
  updateProjectSchema,
  createSiteSchema,
  updateSiteSchema,
  updateOrganizationSchema,
  assignSupervisorsSchema,
} from '../src/schemas/phase3.schema.js';

// Simple lightweight test runner
let testsPassed = 0;
let testsFailed = 0;

function it(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    testsPassed++;
  } catch (error) {
    console.error(`  ✗ ${name}:`, error instanceof Error ? error.message : error);
    testsFailed++;
  }
}

console.log('--- Phase 3 Unit Tests: Schemas, Multi-Tenancy & Business Logic ---\n');

// 1. Project Schemas
it('Validates project creation schema successfully with valid dates and required fields', () => {
  const validProject = {
    projectName: 'Smart Highway Construction',
    projectCode: 'PRJ-HWY-01',
    description: '4-lane highway construction',
    industry: 'Infrastructure',
    clientName: 'NHAI',
    startDate: '2026-01-01',
    expectedEndDate: '2026-12-31',
    status: 'ACTIVE',
    priority: 'HIGH',
    location: 'Mumbai - Pune',
  };

  const parsed = createProjectSchema.safeParse(validProject);
  if (!parsed.success) {
    throw new Error(`Expected success, got: ${JSON.stringify(parsed.error.errors)}`);
  }
});

it('Rejects project creation when expectedEndDate is earlier than startDate', () => {
  const invalidDates = {
    projectName: 'Invalid Date Project',
    projectCode: 'PRJ-ERR-01',
    startDate: '2026-12-31',
    expectedEndDate: '2026-01-01', // Before start
    status: 'PLANNED',
    priority: 'MEDIUM',
  };

  const parsed = createProjectSchema.safeParse(invalidDates);
  if (parsed.success) {
    throw new Error('Expected validation error for end date earlier than start date');
  }
});

it('Rejects project creation when projectCode is too short', () => {
  const shortCode = {
    projectName: 'Valid Project Name',
    projectCode: 'A', // min 2 characters
    startDate: '2026-01-01',
    expectedEndDate: '2026-06-01',
  };

  const parsed = createProjectSchema.safeParse(shortCode);
  if (parsed.success) {
    throw new Error('Expected validation error for short projectCode');
  }
});

// 2. Site Schemas
it('Validates site creation schema with valid coordinates and required address', () => {
  const validSite = {
    projectId: '60d5ec49f1b2c82b8c8e4567',
    siteName: 'Bridge Construction Yard',
    siteCode: 'SITE-BR-01',
    siteType: 'INFRASTRUCTURE',
    address: 'Sector 5, Industrial Area',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    postalCode: '411001',
    latitude: 18.5204,
    longitude: 73.8567,
    status: 'ACTIVE',
  };

  const parsed = createSiteSchema.safeParse(validSite);
  if (!parsed.success) {
    throw new Error(`Expected success, got: ${JSON.stringify(parsed.error.errors)}`);
  }
});

it('Rejects site creation when latitude or longitude are outside world bounds', () => {
  const outOfBoundsSite = {
    projectId: '60d5ec49f1b2c82b8c8e4567',
    siteName: 'Invalid GPS Site',
    siteCode: 'SITE-ERR-GPS',
    address: 'Unknown',
    latitude: 120.5, // > 90
    longitude: 73.8,
  };

  const parsed = createSiteSchema.safeParse(outOfBoundsSite);
  if (parsed.success) {
    throw new Error('Expected validation error for out-of-bounds latitude');
  }
});

// 3. Organization Schema
it('Validates organization update with valid email and name', () => {
  const validOrg = {
    name: 'Nirikshan Global Infrastructure',
    code: 'ORG_NIRIKSHAN_HQ',
    industry: 'Civil Engineering',
    officialEmail: 'contact@nirikshan.org',
    contactNumber: '+91 98765 00000',
    address: 'Connaught Place',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    postalCode: '110001',
  };

  const parsed = updateOrganizationSchema.safeParse(validOrg);
  if (!parsed.success) {
    throw new Error(`Expected success, got: ${JSON.stringify(parsed.error.errors)}`);
  }
});

it('Rejects organization update with invalid email address', () => {
  const invalidOrg = {
    name: 'Nirikshan Global',
    officialEmail: 'not-an-email',
  };

  const parsed = updateOrganizationSchema.safeParse(invalidOrg);
  if (parsed.success) {
    throw new Error('Expected email format validation error');
  }
});

// 4. Supervisor Assignment Schema
it('Validates supervisor assignment payload with array of IDs', () => {
  const validPayload = {
    supervisorIds: ['60d5ec49f1b2c82b8c8e4567', '60d5ec49f1b2c82b8c8e4568'],
  };

  const parsed = assignSupervisorsSchema.safeParse(validPayload);
  if (!parsed.success) {
    throw new Error('Expected supervisor assignment array to be valid');
  }
});

// Summary
console.log(`\nResults: ${testsPassed} passed, ${testsFailed} failed`);
if (testsFailed > 0) {
  process.exit(1);
}
