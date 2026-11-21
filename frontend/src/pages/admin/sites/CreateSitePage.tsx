import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthenticatedLayout } from '../../../layouts/AuthenticatedLayout';
import { siteService } from '../../../services/site.service';
import { projectService } from '../../../services/project.service';
import type { Project } from '../../../types/project.types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/Alert';
import {
  ArrowLeft,
  Building2,
  Compass,
  Save,
} from 'lucide-react';

const siteFormSchema = z.object({
  projectId: z.string().min(1, 'Please select a parent project'),
  siteName: z
    .string()
    .min(2, 'Site name must be at least 2 characters')
    .max(150, 'Site name cannot exceed 150 characters'),
  siteCode: z
    .string()
    .min(2, 'Site code must be at least 2 characters')
    .max(30, 'Site code cannot exceed 30 characters')
    .regex(/^[A-Za-z0-9-_]+$/, 'Site code may only contain letters, numbers, hyphens, and underscores'),
  description: z.string().max(2000).optional(),
  siteType: z.enum([
    'CONSTRUCTION',
    'MANUFACTURING',
    'AGRICULTURE',
    'INFRASTRUCTURE',
    'WAREHOUSE',
    'OTHER',
  ]),
  address: z.string().min(3, 'Physical address is required').max(300),
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

type SiteFormData = z.infer<typeof siteFormSchema>;

export const CreateSitePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedProjectId = searchParams.get('projectId') || '';

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SiteFormData>({
    resolver: zodResolver(siteFormSchema),
    defaultValues: {
      projectId: preselectedProjectId,
      siteType: 'CONSTRUCTION',
      status: 'ACTIVE',
      country: 'India',
    },
  });

  useEffect(() => {
    const loadProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const res = await projectService.getProjects({ limit: 100 });
        setProjects(res.projects);
        if (preselectedProjectId) {
          setValue('projectId', preselectedProjectId);
        } else if (res.projects.length > 0) {
          setValue('projectId', res.projects[0].id || (res.projects[0] as any)._id);
        }
      } catch (err) {
        setErrorMessage('Failed to load active projects for site creation');
      } finally {
        setIsLoadingProjects(false);
      }
    };
    loadProjects();
  }, [preselectedProjectId, setValue]);

  const onSubmit = async (data: SiteFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const created = await siteService.createSite({
        ...data,
        siteCode: data.siteCode.toUpperCase(),
        latitude: data.latitude ? Number(data.latitude) : undefined,
        longitude: data.longitude ? Number(data.longitude) : undefined,
      });
      const newId = created.id || (created as any)._id;
      navigate(`/admin/sites/${newId}`);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to create site'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthenticatedLayout
      title="Create New Site"
      subtitle="Map a physical inspection site, construction perimeter, or facility boundary to a project."
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Link
            to="/admin/sites"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sites Directory
          </Link>
        </div>

        {errorMessage && (
          <Alert type="error" title="Site Creation Failed" message={errorMessage} />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Parent Project & Identity */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Project Association & Site Identity</h3>
                <p className="text-xs text-slate-500">Associate this facility with an authorized project scope.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Parent Project *
                </label>
                {isLoadingProjects ? (
                  <div className="text-xs text-slate-500">Loading authorized projects...</div>
                ) : projects.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    No active projects found. You must create a project before adding physical sites.
                  </div>
                ) : (
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
                )}
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
                  placeholder="e.g. North Section Underground Station"
                  error={errors.siteName?.message}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Site Code * (Unique per Organization)
                </label>
                <Input
                  {...register('siteCode')}
                  placeholder="e.g. SITE-UG-01"
                  error={errors.siteCode?.message}
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Letters, numbers, and hyphens. Auto-converted to uppercase.
                </p>
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
                  <option value="ACTIVE">Active (Inspections Permitted)</option>
                  <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                  <option value="INACTIVE">Inactive (Suspended)</option>
                  <option value="COMPLETED">Completed</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-xs text-red-600">{errors.status.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Site Manager / Resident Engineer
                </label>
                <Input
                  {...register('siteManager')}
                  placeholder="e.g. Er. Mohan Lal"
                  error={errors.siteManager?.message}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Site Description & Access Notes
                </label>
                <textarea
                  {...register('description')}
                  rows={2}
                  placeholder="Gate instructions, hazards, security protocols..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Location & GPS Geofence */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Geographic Address & GPS Coordinates</h3>
                <p className="text-xs text-slate-500">Provide physical location for offline mobile geofencing.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Physical Street Address *
                </label>
                <Input
                  {...register('address')}
                  placeholder="Plot / Sector / Mile marker details"
                  error={errors.address?.message}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  City
                </label>
                <Input
                  {...register('city')}
                  placeholder="e.g. New Delhi"
                  error={errors.city?.message}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  State / Province
                </label>
                <Input
                  {...register('state')}
                  placeholder="e.g. Delhi"
                  error={errors.state?.message}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Postal / PIN Code
                </label>
                <Input
                  {...register('postalCode')}
                  placeholder="110058"
                  error={errors.postalCode?.message}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Country
                </label>
                <Input
                  {...register('country')}
                  placeholder="India"
                  error={errors.country?.message}
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
                  placeholder="e.g. 28.6289"
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
                  placeholder="e.g. 77.0786"
                  error={errors.longitude?.message}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/sites')}
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
              Create Site
            </Button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
};
