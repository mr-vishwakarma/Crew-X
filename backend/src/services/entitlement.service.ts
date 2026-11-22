import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { OrganizationSubscription } from '../models/subscription.model.js';
import { SubscriptionPlan, PlanCode } from '../models/subscription-plan.model.js';
import { recordAuditLog } from '../utils/audit.js';

export interface EntitlementCheckResult {
  allowed: boolean;
  reason?: string;
  currentPlan: PlanCode;
  activeSupervisorSeats: number;
  maxSupervisorSeats: number;
  remainingSeats: number;
  requiresUpgrade: boolean;
  suggestedPlan?: PlanCode;
}

export class EntitlementService {
  /**
   * Seeds standard 3-tier subscription catalogue if not present
   */
  static async seedDefaultPlans(): Promise<void> {
    if (mongoose.connection.readyState !== 1) return;

    const count = await SubscriptionPlan.countDocuments();
    if (count > 0) return;

    await SubscriptionPlan.create([
      {
        planCode: 'STARTER',
        name: 'Starter Plan',
        version: 1,
        description: 'For small contractors & emerging inspection agencies (up to 3 Supervisors)',
        monthlyPricePaise: 499900, // ₹4,999 / mo
        annualPricePaise: 4999000, // ₹49,990 / yr (2 months free)
        currency: 'INR',
        minSupervisorSeats: 1,
        maxSupervisorSeats: 3,
        featureEntitlements: {
          maxProjects: 5,
          maxSites: 15,
          advancedAnalytics: false,
          complianceExports: true,
          weeklyEmailReports: false,
          conflictResolution: true,
          customSeatCapacity: false,
        },
        razorpayPlanIds: {
          monthly: 'plan_starter_monthly_test',
          annual: 'plan_starter_annual_test',
        },
        isActive: true,
      },
      {
        planCode: 'GROWTH',
        name: 'Growth Plan',
        version: 1,
        description: 'For growing construction firms managing multi-site packages (4-9 Supervisors)',
        monthlyPricePaise: 1299900, // ₹12,999 / mo
        annualPricePaise: 12999000, // ₹1,29,990 / yr
        currency: 'INR',
        minSupervisorSeats: 4,
        maxSupervisorSeats: 9,
        featureEntitlements: {
          maxProjects: 25,
          maxSites: 75,
          advancedAnalytics: true,
          complianceExports: true,
          weeklyEmailReports: true,
          conflictResolution: true,
          customSeatCapacity: false,
        },
        razorpayPlanIds: {
          monthly: 'plan_growth_monthly_test',
          annual: 'plan_growth_annual_test',
        },
        isActive: true,
      },
      {
        planCode: 'ENTERPRISE',
        name: 'Enterprise Plan',
        version: 1,
        description: 'For large EPC conglomerates, multi-branch operations & smart infrastructure (10+ Supervisors)',
        monthlyPricePaise: 2999900, // ₹29,999 / mo
        annualPricePaise: 29999000, // ₹2,99,990 / yr
        currency: 'INR',
        minSupervisorSeats: 10,
        maxSupervisorSeats: 9999,
        featureEntitlements: {
          maxProjects: 999,
          maxSites: 999,
          advancedAnalytics: true,
          complianceExports: true,
          weeklyEmailReports: true,
          conflictResolution: true,
          customSeatCapacity: true,
        },
        razorpayPlanIds: {
          monthly: 'plan_enterprise_monthly_test',
          annual: 'plan_enterprise_annual_test',
        },
        isActive: true,
      },
    ]);
  }

  /**
   * Retrieves or initializes the organization's subscription record
   */
  static async getOrganizationSubscription(orgId: string) {
    if (mongoose.connection.readyState !== 1) {
      return {
        organizationId: orgId,
        planCode: 'STARTER' as PlanCode,
        status: 'ACTIVE',
        billingInterval: 'MONTHLY',
        amountPaise: 499900,
        activeSupervisorSeats: 1,
        maxSupervisorSeats: 3,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };
    }

    let sub = await OrganizationSubscription.findOne({ organizationId: orgId });
    if (!sub) {
      sub = await OrganizationSubscription.create({
        organizationId: orgId,
        planCode: 'STARTER',
        status: 'ACTIVE',
        billingInterval: 'MONTHLY',
        amountPaise: 499900,
        activeSupervisorSeats: 1,
        maxSupervisorSeats: 3,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }
    return sub;
  }

  /**
   * Central Supervisor Seat Limit Enforcement
   * Verifies if adding an active supervisor exceeds current plan limits
   */
  static async canAddSupervisor(orgId: string): Promise<EntitlementCheckResult> {
    const sub = await this.getOrganizationSubscription(orgId);
    const planCode = sub.planCode as PlanCode;

    let activeSupervisorsCount = 0;
    if (mongoose.connection.readyState === 1) {
      activeSupervisorsCount = await User.countDocuments({
        organizationId: orgId,
        role: 'SUPERVISOR',
        isActive: true,
      });
    }

    // Determine seat limit based on plan
    let maxSeats = 3;
    let suggestedPlan: PlanCode | undefined = undefined;

    if (planCode === 'STARTER') {
      maxSeats = 3;
      if (activeSupervisorsCount >= 3) {
        suggestedPlan = 'GROWTH';
      }
    } else if (planCode === 'GROWTH') {
      maxSeats = 9;
      if (activeSupervisorsCount >= 9) {
        suggestedPlan = 'ENTERPRISE';
      }
    } else if (planCode === 'ENTERPRISE') {
      maxSeats = 9999;
    }

    const remainingSeats = Math.max(0, maxSeats - activeSupervisorsCount);

    if (activeSupervisorsCount >= maxSeats) {
      // Record audit event for blocked seat expansion
      await recordAuditLog({
        organizationId: orgId,
        actorId: 'SYSTEM',
        actorRole: 'SYSTEM',
        action: 'SUPERVISOR_SEAT_BLOCKED',
        entityType: 'SUBSCRIPTION',
        entityId: orgId,
        summary: `Blocked supervisor creation/activation: limit of ${maxSeats} reached for plan ${planCode}`,
        metadata: { activeSupervisorsCount, maxSeats, planCode },
      });

      return {
        allowed: false,
        reason: `Your organization has reached the ${maxSeats} Supervisor limit on the ${planCode} plan. Please upgrade to ${suggestedPlan || 'a higher plan'} to add more supervisors.`,
        currentPlan: planCode,
        activeSupervisorSeats: activeSupervisorsCount,
        maxSupervisorSeats: maxSeats,
        remainingSeats: 0,
        requiresUpgrade: true,
        suggestedPlan,
      };
    }

    return {
      allowed: true,
      currentPlan: planCode,
      activeSupervisorSeats: activeSupervisorsCount,
      maxSupervisorSeats: maxSeats,
      remainingSeats,
      requiresUpgrade: false,
    };
  }

  /**
   * Check feature entitlement
   */
  static async hasFeature(
    orgId: string,
    feature: 'advancedAnalytics' | 'complianceExports' | 'weeklyEmailReports' | 'customSeatCapacity'
  ): Promise<boolean> {
    const sub = await this.getOrganizationSubscription(orgId);
    const planCode = sub.planCode as PlanCode;

    if (planCode === 'ENTERPRISE') return true;
    if (planCode === 'GROWTH') {
      return feature !== 'customSeatCapacity';
    }
    // STARTER plan
    return feature === 'complianceExports';
  }
}
