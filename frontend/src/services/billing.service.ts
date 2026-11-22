import api from './api';

export interface PlanItem {
  _id?: string;
  planCode: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  name: string;
  description: string;
  monthlyPricePaise: number;
  annualPricePaise: number;
  currency: string;
  maxSupervisorSeats: number;
  featureEntitlements: {
    maxProjects?: number;
    maxSites?: number;
    advancedAnalytics?: boolean;
    complianceExports?: boolean;
    weeklyEmailReports?: boolean;
    conflictResolution?: boolean;
    customSeatCapacity?: boolean;
  };
}

export interface CurrentSubscriptionResponse {
  subscription: {
    organizationId: string;
    planCode: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
    status: string;
    billingInterval: 'MONTHLY' | 'ANNUAL';
    amountPaise: number;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelledAt?: string;
  };
  seatUsage: {
    activeSupervisorsCount: number;
    maxSupervisorSeats: number;
    remainingSeats: number;
    isAtSeatLimit: boolean;
    isApproachingSeatLimit: boolean;
    warningMessage?: string;
  };
  razorpayKeyId: string;
}

export interface BillingHistoryItem {
  _id?: string;
  id?: string;
  eventType: string;
  amountPaise: number;
  currency: string;
  status: string;
  eventTimestamp: string;
  receiptNumber?: string;
}

export const billingService = {
  async getPlans(): Promise<PlanItem[]> {
    const res = await api.get('/billing/plans');
    return res.data.data.plans;
  },

  async getCurrentSubscription(): Promise<CurrentSubscriptionResponse> {
    const res = await api.get('/billing/current');
    return res.data.data;
  },

  async getBillingHistory(): Promise<BillingHistoryItem[]> {
    const res = await api.get('/billing/history');
    return res.data.data.events;
  },

  async createSubscription(planCode: 'STARTER' | 'GROWTH' | 'ENTERPRISE', billingInterval: 'MONTHLY' | 'ANNUAL' = 'MONTHLY') {
    const res = await api.post('/billing/subscriptions', { planCode, billingInterval });
    return res.data.data;
  },

  async verifySubscription(data: {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
  }) {
    const res = await api.post('/billing/subscriptions/verify', data);
    return res.data.data;
  },

  async cancelSubscription(reason?: string) {
    const res = await api.post('/billing/subscriptions/cancel', { reason });
    return res.data.data;
  },
};
