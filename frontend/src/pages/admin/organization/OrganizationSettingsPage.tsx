import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthenticatedLayout } from '../../../layouts/AuthenticatedLayout';
import { organizationService } from '../../../services/organization.service';
import type { Organization } from '../../../types/organization.types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/Alert';
import {
  Building2,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  Save,
  RefreshCw,
  Info,
} from 'lucide-react';

const orgSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters').max(150),
  description: z.string().max(1000).optional(),
  industry: z.string().max(100).optional(),
  officialEmail: z.string().email('Please enter a valid email address'),
  contactNumber: z.string().min(5, 'Contact number is required').max(30),
  address: z.string().min(3, 'Address is required').max(255),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State is required').max(100),
  country: z.string().min(2, 'Country is required').max(100),
  postalCode: z.string().min(3, 'Postal code is required').max(20),
  logoUrl: z.string().optional(),
});

type OrgFormData = z.infer<typeof orgSchema>;

export const OrganizationSettingsPage: React.FC = () => {
  const [org, setOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<OrgFormData>({
    resolver: zodResolver(orgSchema),
  });

  const loadOrganization = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await organizationService.getOrganization();
      setOrg(data);
      reset({
        name: data.name || '',
        description: data.description || '',
        industry: data.industry || '',
        officialEmail: data.officialEmail || '',
        contactNumber: data.contactNumber || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country || 'India',
        postalCode: data.postalCode || '',
        logoUrl: data.logoUrl || '',
      });
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to load organization settings'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrganization();
  }, []);

  const onSubmit = async (formData: OrgFormData) => {
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      const updated = await organizationService.updateOrganization(formData);
      setOrg(updated);
      setSuccessMessage('Organization details updated successfully.');
      reset({
        name: updated.name || '',
        description: updated.description || '',
        industry: updated.industry || '',
        officialEmail: updated.officialEmail || '',
        contactNumber: updated.contactNumber || '',
        address: updated.address || '',
        city: updated.city || '',
        state: updated.state || '',
        country: updated.country || 'India',
        postalCode: updated.postalCode || '',
        logoUrl: updated.logoUrl || '',
      });
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to update organization settings'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AuthenticatedLayout
      title="Organization Settings"
      subtitle="Manage corporate profile, headquarters address, and enterprise compliance defaults."
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {successMessage && (
          <Alert type="success" title="Settings Saved" message={successMessage} />
        )}

        {errorMessage && (
          <Alert type="error" title="Error" message={errorMessage} />
        )}

        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
            <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading organization details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Identity & Status Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-xl shadow-xs">
                    <Building2 className="h-7 w-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{org?.name}</h2>
                    <p className="text-xs font-mono text-slate-500">
                      Organization Code: <span className="font-semibold text-slate-700">{org?.code}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      org?.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {org?.status === 'ACTIVE' ? 'Enterprise Active' : 'Suspended'}
                  </span>
                </div>
              </div>

              {/* Form grid */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Organization Legal Name *
                  </label>
                  <Input
                    {...register('name')}
                    placeholder="e.g. Nirikshan Infrastructure Corp"
                    error={errors.name?.message}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Industry Domain
                  </label>
                  <Input
                    {...register('industry')}
                    placeholder="e.g. Heavy Civil, Infrastructure, Energy"
                    error={errors.industry?.message}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Company Overview & Mission
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    placeholder="Brief description of enterprise operations, compliance standards, and scope..."
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all resize-none"
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Official Contact & Communications */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Mail className="h-4 w-4 text-blue-600" />
                Contact & Communication Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Official Regulatory Email *
                  </label>
                  <div className="relative">
                    <Input
                      type="email"
                      {...register('officialEmail')}
                      placeholder="compliance@organization.org"
                      error={errors.officialEmail?.message}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Headquarters Phone Number *
                  </label>
                  <div className="relative">
                    <Input
                      {...register('contactNumber')}
                      placeholder="+91 98765 43210"
                      error={errors.contactNumber?.message}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Registered Headquarters Location */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4 text-blue-600" />
                Registered Headquarters Address
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Street Address *
                  </label>
                  <Input
                    {...register('address')}
                    placeholder="e.g. 124 Industrial Tech Park, Sector 62"
                    error={errors.address?.message}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    City *
                  </label>
                  <Input
                    {...register('city')}
                    placeholder="Noida"
                    error={errors.city?.message}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    State / Province *
                  </label>
                  <Input
                    {...register('state')}
                    placeholder="Uttar Pradesh"
                    error={errors.state?.message}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Postal / PIN Code *
                  </label>
                  <Input
                    {...register('postalCode')}
                    placeholder="201301"
                    error={errors.postalCode?.message}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Country *
                  </label>
                  <Input
                    {...register('country')}
                    placeholder="India"
                    error={errors.country?.message}
                  />
                </div>
              </div>
            </div>

            {/* Audit & Metadata Information */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-slate-400 shrink-0" />
                <span>
                  Organization identifier is securely anchored to tenant token claims. Multi-tenant partitioning is strictly isolated.
                </span>
              </div>
              <div className="flex items-center gap-4 shrink-0 font-medium">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Created: {org?.createdAt ? new Date(org.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => loadOrganization()}
                disabled={isSaving}
              >
                Reset Changes
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSaving}
                disabled={!isDirty || isSaving}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save Settings
              </Button>
            </div>
          </form>
        )}
      </div>
    </AuthenticatedLayout>
  );
};
