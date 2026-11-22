import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Users,
  Zap,
  RefreshCw,
  Calendar,
  Lock,
} from 'lucide-react';
import { AuthenticatedLayout } from '../../../layouts/AuthenticatedLayout';
import { billingService } from '../../../services/billing.service';
import type {
  PlanItem,
  CurrentSubscriptionResponse,
  BillingHistoryItem,
} from '../../../services/billing.service';

export const AdminBillingPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [currentSub, setCurrentSub] = useState<CurrentSubscriptionResponse | null>(null);
  const [history, setHistory] = useState<BillingHistoryItem[]>([]);
  const [billingInterval, setBillingInterval] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [checkoutModal, setCheckoutModal] = useState<PlanItem | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      const [plansData, subData, historyData] = await Promise.all([
        billingService.getPlans(),
        billingService.getCurrentSubscription(),
        billingService.getBillingHistory(),
      ]);
      setPlans(plansData || []);
      setCurrentSub(subData);
      setHistory(historyData || []);
    } catch (err) {
      console.error('Failed to load billing data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBillingData();
  }, []);

  const handleInitiateUpgrade = async (plan: PlanItem) => {
    setCheckoutModal(plan);
  };

  const handleConfirmCheckout = async () => {
    if (!checkoutModal) return;
    try {
      setActionLoading(true);
      const order = await billingService.createSubscription(checkoutModal.planCode, billingInterval);

      // In test mode: simulate Razorpay Checkout modal authorization
      const mockPaymentId = `pay_test_${Date.now()}`;
      await billingService.verifySubscription({
        razorpay_payment_id: mockPaymentId,
        razorpay_subscription_id: order.subscriptionId,
        razorpay_signature: 'mock_valid_signature_for_test',
      });

      setStatusMessage(`Successfully upgraded to ${checkoutModal.name} (${billingInterval})!`);
      setCheckoutModal(null);
      await loadBillingData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Checkout failed');
    } finally {
      setActionLoading(false);
    }
  };

  const activePlanCode = currentSub?.subscription?.planCode || 'STARTER';
  const seatUsage = currentSub?.seatUsage;

  return (
    <AuthenticatedLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-lime-400" />
              Organisation Subscription Plans & Supervisor Seats
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Manage multi-site enterprise licensing, supervisor seat capacity, and Razorpay subscription billing.
            </p>
          </div>
          <button
            onClick={loadBillingData}
            disabled={loading}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Subscription
          </button>
        </div>

        {statusMessage && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs font-semibold text-emerald-400 flex items-center justify-between">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage(null)} className="text-zinc-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Supervisor Seat Limit Threshold Warning */}
        {seatUsage?.isAtSeatLimit && (
          <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-5 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-bold text-amber-300 text-sm">Supervisor Seat Limit Reached ({seatUsage.activeSupervisorsCount} / {seatUsage.maxSupervisorSeats})</h4>
              <p className="mt-1 text-zinc-300 leading-relaxed">
                Your organisation has reached the Supervisor limit for its current <strong>{activePlanCode}</strong> plan.
                Upgrade to add or activate more Supervisors. Organizations with 10 or more active Supervisors require an active Enterprise subscription.
              </p>
            </div>
          </div>
        )}

        {/* Current Plan Overview Card */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-lime-400 bg-lime-400/10 border border-lime-400/30 px-3 py-1 rounded-full uppercase">
                  Current Plan: {activePlanCode}
                </span>
                <span className="text-xs text-zinc-400">Status: {currentSub?.subscription?.status || 'ACTIVE'}</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-2">
                {activePlanCode === 'STARTER'
                  ? 'Starter Field Operations'
                  : activePlanCode === 'GROWTH'
                  ? 'Growth Multi-Site Operations'
                  : 'Enterprise Conglomerate Infrastructure'}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Next billing renewal: {currentSub?.subscription?.currentPeriodEnd ? new Date(currentSub.subscription.currentPeriodEnd).toLocaleDateString() : 'Active'}
              </p>
            </div>

            {/* Seat Capacity Progress Gauge */}
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl min-w-[280px]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-lime-400" /> Active Supervisor Seats
                </span>
                <span className="font-mono font-bold text-white">
                  {seatUsage?.activeSupervisorsCount || 1} / {seatUsage?.maxSupervisorSeats || 3}
                </span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${seatUsage?.isAtSeatLimit ? 'bg-amber-400' : 'bg-lime-400'}`}
                  style={{
                    width: `${Math.min(100, (((seatUsage?.activeSupervisorsCount || 1) / (seatUsage?.maxSupervisorSeats || 3)) * 100))}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1.5">
                {seatUsage?.remainingSeats === 0 ? '0 seats available' : `${seatUsage?.remainingSeats} seats available on this tier`}
              </p>
            </div>
          </div>
        </div>

        {/* Monthly vs. Annual Billing Toggle */}
        <div className="flex items-center justify-center pt-4">
          <div className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-2xl flex items-center gap-1 shadow-inner">
            <button
              onClick={() => setBillingInterval('MONTHLY')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-colors ${
                billingInterval === 'MONTHLY' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingInterval('ANNUAL')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                billingInterval === 'ANNUAL' ? 'bg-lime-400 text-black shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Annual Billing
              <span className="bg-black/20 text-black px-1.5 py-0.2 rounded text-[10px] font-extrabold uppercase">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* 3-Tier Plan Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {plans.map((plan) => {
            const isCurrent = plan.planCode === activePlanCode;
            const price = billingInterval === 'ANNUAL' ? plan.annualPricePaise / 100 : plan.monthlyPricePaise / 100;

            return (
              <div
                key={plan.planCode}
                className={`bg-zinc-900/90 rounded-2xl p-6 border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'border-lime-400 ring-1 ring-lime-400/20 shadow-xl shadow-lime-400/5'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider uppercase text-zinc-400">{plan.name}</span>
                    {isCurrent && (
                      <span className="text-[10px] font-extrabold bg-lime-400 text-black px-2 py-0.5 rounded-full uppercase">
                        Current Tier
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">₹{price.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-zinc-500">/{billingInterval === 'ANNUAL' ? 'yr' : 'mo'}</span>
                  </div>

                  <p className="text-xs text-zinc-400 mt-2">{plan.description}</p>

                  <div className="border-t border-zinc-800 my-5 pt-5 space-y-3 text-xs text-zinc-300">
                    <div className="flex items-center gap-2 font-semibold text-white">
                      <Users className="w-4 h-4 text-lime-400" />
                      <span>Up to {plan.maxSupervisorSeats === 9999 ? 'Unlimited (10+)' : plan.maxSupervisorSeats} Supervisor Seats</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{plan.featureEntitlements?.maxProjects || 'Unlimited'} Projects & Sites</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>PWA Offline Inspection & Dexie.js</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Supervisor QA Review Queue</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Conflict Resolution Engine</span>
                    </div>
                    {plan.featureEntitlements?.advancedAnalytics && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-lime-400" />
                        <span className="text-white font-medium">Executive Compliance Scorecards</span>
                      </div>
                    )}
                    {plan.featureEntitlements?.weeklyEmailReports && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-lime-400" />
                        <span className="text-white font-medium">Automated Weekly Email Summaries</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-zinc-800 text-zinc-400 cursor-default"
                    >
                      Active Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleInitiateUpgrade(plan)}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-lime-400 hover:bg-lime-300 text-black shadow-lg shadow-lime-400/10 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5" /> Upgrade to {plan.name}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Billing & Invoice History Table */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-zinc-400" />
            Billing & Invoicing Ledger
          </h3>

          {history.length === 0 ? (
            <p className="text-xs text-zinc-500 italic">No historical transactions recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[11px] tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Receipt #</th>
                    <th className="py-3 px-4">Event</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 font-medium">
                  {history.map((evt, idx) => (
                    <tr key={idx} className="hover:bg-zinc-800/30">
                      <td className="py-3 px-4 font-mono text-zinc-200">{evt.receiptNumber || 'REC-AUTO'}</td>
                      <td className="py-3 px-4 font-semibold text-white">{evt.eventType}</td>
                      <td className="py-3 px-4 font-mono font-bold text-white">₹{(evt.amountPaise / 100).toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4">
                        <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px] font-semibold">
                          {evt.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-500">{new Date(evt.eventTimestamp).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Razorpay Test Mode Checkout Modal */}
        {checkoutModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-lime-400" />
                  Razorpay Subscription Checkout
                </h3>
                <span className="text-[10px] uppercase font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
                  Test Mode
                </span>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Selected Plan</span>
                  <span className="font-semibold text-white">{checkoutModal.name}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Billing Interval</span>
                  <span className="font-semibold text-white">{billingInterval}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Authorized Supervisor Seats</span>
                  <span className="font-semibold text-lime-400">Up to {checkoutModal.maxSupervisorSeats} Seats</span>
                </div>
                <div className="flex justify-between text-zinc-400 pt-2 border-t border-zinc-800 text-sm">
                  <span className="font-bold text-white">Total Amount</span>
                  <span className="font-bold font-mono text-lime-400">
                    ₹{((billingInterval === 'ANNUAL' ? checkoutModal.annualPricePaise : checkoutModal.monthlyPricePaise) / 100).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCheckoutModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  disabled={actionLoading}
                  onClick={handleConfirmCheckout}
                  className="px-5 py-2 text-xs font-bold bg-lime-400 hover:bg-lime-300 text-black rounded-xl shadow-lg shadow-lime-400/10 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" /> Confirm Subscription (Test)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};
