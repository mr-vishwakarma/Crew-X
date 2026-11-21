import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthenticatedLayout } from '../../../layouts/AuthenticatedLayout';
import { siteService } from '../../../services/site.service';
import { projectService } from '../../../services/project.service';
import type { Site } from '../../../types/site.types';
import type { Project } from '../../../types/project.types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/Alert';
import {
  ArrowLeft,
  Building2,
  Compass,
  Save,
  RefreshCw,
} from 'lucide-react';

const editSiteSchema = z.object({
  projectId: z.string().min(1, 'Please select a parent project'),
  siteName: z
    .string()
    .min(2, 'Site name must be at least 2 characters')
    .max(150, 'Site name cannot exceed 150 characters'),
  description: z.string().max(2000).optional(),
  siteType: z.enum([
    'CONSTRUCTION',
    'MANUFACTURING',
    'AGRICULTURE',
    'INFRASTRUCTURE',
    'WAREHOUSE',
    'OTHER',
  ]),
  address: z.string().min(3, 'Address is required').max(300),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100),
  postalCode: z.string().max(20).optional(),
  latitude: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= -90 && Number(val) <= 90), {
      message: 'Latitude must be between -90 and 90',
    }),
  longitude: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= -180 && Number(val) <= 180), {
      message: 'Longitude must be between -180 and 180',
    }),
  siteManager: z.string().max(100).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'COMPLETED']),
});

type EditSiteFormData = z.infer<typeof editSiteSchema>;

export const EditSitePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [site, setSite] = useState<Site | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditSiteFormData>({
    resolver: zodResolver(editSiteSchema),
  });

  useEffect(() => {
    const loadSiteAndProjects = async () => {
      if (!id) return;
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const [siteData, projectsRes] = await Promise.all([
          siteService.getSite(id),
          projectService.getProjects({ limit: 100 }),
        ]);

        setSite(siteData);
        setProjects(projectsRes.projects);

        const projectObj =
          typeof siteData.projectId === 'object' && siteData.projectId !== null
            ? (siteData.projectId as any)
            : null;
        const currentProjectId = projectObj?.id || projectObj?._id || siteData.projectId;

        reset({
          projectId: currentProjectId,
          siteName: siteData.siteName,
          description: siteData.description || '',
          siteType: siteData.siteType,
          address: siteData.address,
          city: siteData.city || '',
          state: siteData.state || '',
          country: siteData.country || 'India',
          postalCode: siteData.postalCode || '',
          latitude: siteData.latitude != null ? String(siteData.latitude) : '',
          longitude: siteData.longitude != null ? String(siteData.longitude) : '',
          siteManager: siteData.siteManager || '',
          status: siteData.status,
        });
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to load site data'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadSiteAndProjects();
  }, [id, reset]);

  const onSubmit = async (formData: EditSiteFormData) => {
    if (!id) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await siteService.updateSite(id, {
        ...formData,
        latitude: formData.latitude ? Number(formData.latitude) : undefined,
        longitude: formData.longitude ? Number(formData.longitude) : undefined,
      });
      navigate(`/admin/sites/${id}`);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to update site'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout title="Edit Site">
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-xs">
          <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading site record...</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout
      title={`Edit: ${site?.siteName || 'Site'}`}
      subtitle={`Site Code: ${site?.siteCode} • Identity preserved`}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Link
            to={`/admin/sites/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Site Details
          </Link>
        </div>

        {errorMessage && (
          <Alert type="error" title="Update Failed" message={errorMessage} />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Project & Identification</h3>
                  <p className="text-xs text-slate-500">Edit facility parameters.</p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold px-3 py-1 rounded-lg bg-slate-100 text-slate-700">
                {site?.siteCode}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Parent Project *
                </label>
                <select
                  {...register('projectId')}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all"
                >
                  {projects.map((p) => {
                    const pId = p.id || (p as any)._id;
                    return (
                      <option key={pId} value={pId}>
                        {p.projectName} ({p.projectCode})
                      </option>
                    );
                  })}
                </select>
                {errors.projectId && (
                  <p className="mt-1 text-xs text-red-600">{errors.projectId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Site Name *
                </label>
                <Input
                  {...register('siteName')}
                  placeholder="Site name"
                  error={errors.siteName?.message}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Facility Type *
                </label>
                <select
                  {...register('siteType')}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all"
                >
                  <option value="CONSTRUCTION">Construction Zone</option>
                  <option value="INFRASTRUCTURE">Civil Infrastructure</option>
                  <option value="MANUFACTURING">Manufacturing Plant</option>
                  <option value="AGRICULTURE">Agricultural Facility</option>
                  <option value="WAREHOUSE">Warehouse / Logistics</option>
                  <option value="OTHER">Other Facility</option>
                </select>
                {errors.siteType && (
                  <p className="mt-1 text-xs text-red-600">{errors.siteType.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Site Status *
                </label>
                <select
                  {...register('status')}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="COMPLETED">Completed</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-xs text-red-600">{errors.status.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Site Manager
                </label>
                <Input
                  {...register('siteManager')}
                  placeholder="Site Manager"
                  error={errors.siteManager?.message}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Site Description & Notes
                </label>
                <textarea
                  {...register('description')}
                  rows={2}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Geographic Address & GPS</h3>
                <p className="text-xs text-slate-500">Update physical location and boundary pins.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Physical Street Address *
                </label>
                <Input
                  {...register('address')}
                  placeholder="Address"
                  error={errors.address?.message}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  City
                </label>
                <Input
                  {...register('city')}
                  placeholder="City"
                  error={errors.city?.message}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  State / Province
                </label>
                <Input
                  {...register('state')}
                  placeholder="State"
                  error={errors.state?.message}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Postal / PIN Code
                </label>
                <Input
                  {...register('postalCode')}
                  placeholder="PIN code"
                  error={errors.postalCode?.message}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  GPS Latitude (-90 to 90)
                </label>
                <Input
                  type="number"
                  step="any"
                  {...register('latitude')}
                  placeholder="Latitude"
                  error={errors.latitude?.message}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  GPS Longitude (-180 to 180)
                </label>
                <Input
                  type="number"
                  step="any"
                  {...register('longitude')}
                  placeholder="Longitude"
                  error={errors.longitude?.message}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/admin/sites/${id}`)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save Site Changes
            </Button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
};
