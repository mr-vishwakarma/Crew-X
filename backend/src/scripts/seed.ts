import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../models/user.model.js';
import { Organization } from '../models/organization.model.js';
import { Project } from '../models/project.model.js';
import { Site } from '../models/site.model.js';
import { UserRole } from '../types/auth.types.js';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/nirikshan';

interface SeedAccount {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  organizationId: string;
}

const DEFAULT_ACCOUNTS: SeedAccount[] = [
  {
    fullName: 'System Administrator',
    email: 'admin@nirikshan.com',
    password: 'Admin@12345',
    role: 'ADMIN',
    organizationId: 'org_nirikshan_hq',
  },
  {
    fullName: 'Field Operations Supervisor',
    email: 'supervisor@nirikshan.com',
    password: 'Supervisor@12345',
    role: 'SUPERVISOR',
    organizationId: 'org_nirikshan_hq',
  },
  {
    fullName: 'Senior Field Inspector',
    email: 'inspector@nirikshan.com',
    password: 'Inspector@12345',
    role: 'INSPECTOR',
    organizationId: 'org_nirikshan_hq',
  },
];

async function seed() {
  console.log('[Seed] Starting database seeding process...');
  console.log(`[Seed] Connecting to MongoDB: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Connected to MongoDB successfully');

    const createdUsers: Record<string, any> = {};

    for (const acc of DEFAULT_ACCOUNTS) {
      const existing = await User.findOne({ email: acc.email });
      const passwordHash = await bcrypt.hash(acc.password, 10);

      if (existing) {
        existing.fullName = acc.fullName;
        existing.passwordHash = passwordHash;
        existing.role = acc.role;
        existing.organizationId = acc.organizationId;
        existing.isActive = true;
        await existing.save();
        createdUsers[acc.role] = existing;
        console.log(`[Seed] Updated existing account: ${acc.email} (${acc.role})`);
      } else {
        const newUser = new User({
          fullName: acc.fullName,
          email: acc.email,
          passwordHash,
          role: acc.role,
          organizationId: acc.organizationId,
          isActive: true,
        });
        await newUser.save();
        createdUsers[acc.role] = newUser;
        console.log(`[Seed] Created new account: ${acc.email} (${acc.role})`);
      }
    }

    // Seed Organization
    const orgCode = 'ORG_NIRIKSHAN_HQ';
    let org = await Organization.findOne({ code: orgCode });
    if (!org) {
      org = await Organization.create({
        name: 'Nirikshan Infrastructure Corp',
        code: orgCode,
        description: 'Pioneering infrastructure, construction, and quality compliance management across India.',
        industry: 'Infrastructure & Heavy Civil',
        officialEmail: 'compliance@nirikshan.org',
        contactNumber: '+91 98765 43210',
        address: '124 Industrial Tech Park, Sector 62',
        city: 'Noida',
        state: 'Uttar Pradesh',
        country: 'India',
        postalCode: '201301',
        status: 'ACTIVE',
      });
      console.log(`[Seed] Created organization: ${org.name} (${org.code})`);
    }

    // Seed Projects
    const supervisorId = createdUsers['SUPERVISOR']?._id;
    const adminId = createdUsers['ADMIN']?._id?.toString() || 'admin_seed';

    const projectsData = [
      {
        organizationId: 'org_nirikshan_hq',
        projectName: 'Delhi-NCR Metro Expansion Line 7',
        projectCode: 'PRJ-METRO-07',
        description: 'Underground tunneling, elevated viaducts, and station signaling systems for Phase IV.',
        industry: 'Infrastructure',
        clientName: 'Delhi Metro Rail Corporation (DMRC)',
        projectManager: 'Er. Rajesh K. Sharma',
        startDate: new Date('2025-01-15'),
        expectedEndDate: new Date('2026-12-31'),
        status: 'ACTIVE' as const,
        priority: 'CRITICAL' as const,
        location: 'Delhi NCR, India',
        assignedSupervisors: supervisorId ? [supervisorId] : [],
        createdBy: adminId,
      },
      {
        organizationId: 'org_nirikshan_hq',
        projectName: 'National Expressway NH-48 Corridor Expansion',
        projectCode: 'PRJ-NH48-EXP',
        description: '8-lane access controlled highway civil works, bridge reinforcement, and pavement QA.',
        industry: 'Civil Construction',
        clientName: 'National Highways Authority of India (NHAI)',
        projectManager: 'Er. Anita Deshmukh',
        startDate: new Date('2025-03-01'),
        expectedEndDate: new Date('2027-06-30'),
        status: 'ACTIVE' as const,
        priority: 'HIGH' as const,
        location: 'Gurugram - Jaipur Highway, India',
        assignedSupervisors: supervisorId ? [supervisorId] : [],
        createdBy: adminId,
      },
      {
        organizationId: 'org_nirikshan_hq',
        projectName: 'Rajasthan Solar Photovoltaic Park 500MW',
        projectCode: 'PRJ-SLR-500',
        description: 'Utility-scale solar farm foundations, inverter substations, and high voltage grid tie-ins.',
        industry: 'Renewable Energy',
        clientName: 'Solar Energy Corporation of India (SECI)',
        projectManager: 'Er. Sandeep Rawat',
        startDate: new Date('2026-06-01'),
        expectedEndDate: new Date('2027-12-31'),
        status: 'PLANNED' as const,
        priority: 'MEDIUM' as const,
        location: 'Bhadla, Rajasthan, India',
        assignedSupervisors: [],
        createdBy: adminId,
      },
    ];

    const seededProjects: Record<string, any> = {};

    for (const pData of projectsData) {
      let p = await Project.findOne({
        organizationId: pData.organizationId,
        projectCode: pData.projectCode,
      });

      if (!p) {
        p = await Project.create(pData);
        console.log(`[Seed] Created project: ${p.projectName} (${p.projectCode})`);
      } else {
        if (supervisorId && !p.assignedSupervisors.includes(supervisorId)) {
          p.assignedSupervisors.push(supervisorId);
          await p.save();
        }
      }
      seededProjects[pData.projectCode] = p;
    }

    // Seed Sites
    const metroProject = seededProjects['PRJ-METRO-07'];
    const hwyProject = seededProjects['PRJ-NH48-EXP'];
    const solarProject = seededProjects['PRJ-SLR-500'];

    const sitesData = [
      {
        organizationId: 'org_nirikshan_hq',
        projectId: metroProject._id,
        siteName: 'Metro Central Underground Station 3',
        siteCode: 'SITE-METRO-UG03',
        description: 'Deep excavation box, diaphragm walls, and tunnel boring machine launch shaft.',
        siteType: 'INFRASTRUCTURE' as const,
        address: 'Gate 4, Janakpuri West Interchange',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        postalCode: '110058',
        latitude: 28.6289,
        longitude: 77.0786,
        siteManager: 'Vikram Mehta',
        status: 'ACTIVE' as const,
        createdBy: adminId,
      },
      {
        organizationId: 'org_nirikshan_hq',
        projectId: metroProject._id,
        siteName: 'Elevated Viaduct Sector 12 Segmental Yard',
        siteCode: 'SITE-METRO-VD12',
        description: 'Pre-cast concrete box girder fabrication, curing yard, and cantilever crane assembly.',
        siteType: 'CONSTRUCTION' as const,
        address: 'Sector 12 Outer Ring Road',
        city: 'Dwarka, New Delhi',
        state: 'Delhi',
        country: 'India',
        postalCode: '110075',
        latitude: 28.5921,
        longitude: 77.046,
        siteManager: 'Mohan Lal',
        status: 'ACTIVE' as const,
        createdBy: adminId,
      },
      {
        organizationId: 'org_nirikshan_hq',
        projectId: hwyProject._id,
        siteName: 'Bridge Span Superstructure K-42',
        siteCode: 'SITE-HWY-BR42',
        description: 'Heavy steel girder launch over river basin with seismic bearing pads.',
        siteType: 'INFRASTRUCTURE' as const,
        address: 'KM Stone 42, NH-48 Highway',
        city: 'Manesar',
        state: 'Haryana',
        country: 'India',
        postalCode: '122051',
        latitude: 28.3512,
        longitude: 76.9387,
        siteManager: 'Col. R. S. Rathore',
        status: 'ACTIVE' as const,
        createdBy: adminId,
      },
      {
        organizationId: 'org_nirikshan_hq',
        projectId: solarProject._id,
        siteName: 'Substation Yard & Control Room Alpha',
        siteCode: 'SITE-SLR-SS01',
        description: '33kV step-up transformer bay, SCADA monitoring station, and switchyard.',
        siteType: 'MANUFACTURING' as const,
        address: 'Plot 14, Phase II Solar Park',
        city: 'Bhadla',
        state: 'Rajasthan',
        country: 'India',
        postalCode: '342301',
        latitude: 27.5372,
        longitude: 71.9168,
        siteManager: 'Harish Patel',
        status: 'UNDER_MAINTENANCE' as const,
        createdBy: adminId,
      },
    ];

    for (const sData of sitesData) {
      const existingSite = await Site.findOne({
        organizationId: sData.organizationId,
        siteCode: sData.siteCode,
      });

      if (!existingSite) {
        const s = await Site.create(sData);
        console.log(`[Seed] Created site: ${s.siteName} (${s.siteCode})`);
      }
    }

    console.log('\n=============================================');
    console.log('✅ Nirikshan Seed completed successfully!');
    console.log('Default test credentials:');
    console.log('---------------------------------------------');
    console.log('Administrator: admin@nirikshan.com      / Admin@12345');
    console.log('Supervisor:    supervisor@nirikshan.com / Supervisor@12345');
    console.log('Inspector:     inspector@nirikshan.com  / Inspector@12345');
    console.log('---------------------------------------------');
    console.log('Seeded 1 Organization, 3 Projects, 4 Sites');
    console.log('=============================================\n');
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('[Seed] Database disconnected');
  }
}

seed();
