import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../models/user.model.js';
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
        console.log(`[Seed] Created new account: ${acc.email} (${acc.role})`);
      }
    }

    console.log('\n=============================================');
    console.log('✅ Nirikshan Seed completed successfully!');
    console.log('Default test credentials:');
    console.log('---------------------------------------------');
    console.log('Administrator: admin@nirikshan.com      / Admin@12345');
    console.log('Supervisor:    supervisor@nirikshan.com / Supervisor@12345');
    console.log('Inspector:     inspector@nirikshan.com  / Inspector@12345');
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
