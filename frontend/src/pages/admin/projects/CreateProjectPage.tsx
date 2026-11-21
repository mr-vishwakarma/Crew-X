import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthenticatedLayout } from '../../../layouts/AuthenticatedLayout';
import { projectService } from '../../../services/project.service';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/Alert';
import {
  Building2,
  ArrowLeft,
  Calendar,
  Save,
} from 'lucide-react';

const projectFormSchema = z
  .object({
    projectName: z
      .string()
      .min(2, 'Project name must be at least 2 characters')
      .max(150, 'Project name cannot exceed 150 characters'),
    projectCode: z
      .string()
      .min(2, 'Project code must be at least 2 characters')
      .max(30, 'Project code cannot exceed 30 characters')
      .regex(/^[A-Za-z0-9-_]+$/, 'Project code may only contain letters, numbers, hyphens, and underscores'),
    description: z.string().max(2000).optional(),
    industry: z.string().max(100).optional(),
    clientName: z.string().max(150).optional(),
    projectManager: z.string().max(100).optional(),
    startDate: z.string().min(1, 'Start date is required'),
    expectedEndDate: z.string().min(1, 'Expected end date is required'),
    status: z.enum(['PLANNED', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    location: z.string().max(200).optional(),
  })
  .refine(
    (data) => new Date(data.expectedEndDate) >= new Date(data.startDate),
    {
      message: 'Expected completion date cannot be earlier than start date',
      path: ['expectedEndDate'],
    }
  );

type ProjectFormData = z.infer<typeof projectFormSchema>;

export const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      status: 'PLANNED',
      priority: 'MEDIUM',
      startDate: new Date().toISOString().split('T')[0],
      expectedEndDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const created = await projectService.createProject({
        ...data,
        projectCode: data.projectCode.toUpperCase(),
      });
      const newId = created.id || (created as any)._id;
      navigate(`/admin/projects/${newId}`);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to create project'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthenticatedLayout
      title="Create New Project"
      subtitle="Define a new capital project, set governance timelines, and configure management scope."
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Link */}
        <div className="flex items-center gap-2">
          <Link
            to="/admin/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects Directory
          </Link>
        </div>

        {errorMessage && (
          <Alert type="error" title="Project Creation Failed" message={errorMessage} />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Card: Core Project Information */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Project Identity & Identification</h3>
                <p className="text-xs text-slate-500">Provide official project nomenclature and internal tracking code.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Project Name *
                </label>
                <Input
                  {...register('projectName')}
                  placeholder="e.g. Metro Expressway Line 4"
                  error={errors.projectName?.message}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Project Code * (Unique per Organization)
                </label>
                <Input
                  {...register('projectCode')}
                  placeholder="e.g. PRJ-EXP-04"
                  error={errors.projectCode?.message}
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Letters, numbers, and hyphens. Auto-converted to uppercase.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Industry / Sector
                </label>
                <Input
                  {...register('industry')}
                  placeholder="e.g. Infrastructure, Heavy Civil, Solar"
                  error={errors.industry?.message}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Client / Owner Organization
                </label>
                <Input
                  {...register('clientName')}
                  placeholder="e.g. National Highways Authority of India"
                  error={errors.clientName?.message}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Project Manager / Lead
                </label>
                <Input
                  {...register('projectManager')}
                  placeholder="e.g. Er. Vikram Mehta"
                  error={errors.projectManager?.message}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Primary Geographic Location
                </label>
                <Input
                  {...register('location')}
                  placeholder="e.g. Greater Noida Expressway, UP"
                  error={errors.location?.message}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Project Scope & Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Detailed description of capital works, inspection milestones, and compliance standards..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all resize-none"
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Card: Timeline, Governance & Priority */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Timeline & Operational Governance</h3>
                <p className="text-xs text-slate-500">Specify operational milestones and priority status.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Project Start Date *
                </label>
                <Input
                  type="date"
                  {...register('startDate')}
                  error={errors.startDate?.message}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Expected Completion Date *
                </label>
                <Input
                  type="date"
                  {...register('expectedEndDate')}
                  error={errors.expectedEndDate?.message}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Initial Status *
                </label>
                <select
                  {...register('status')}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all"
                >
                  <option value="PLANNED">Planned (Pre-construction)</option>
                  <option value="ACTIVE">Active (In Progress)</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-xs text-red-600">{errors.status.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Project Priority *
                </label>
                <select
                  {...register('priority')}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium (Standard)</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical (Immediate Audit)</option>
                </select>
                {errors.priority && (
                  <p className="mt-1 text-xs text-red-600">{errors.priority.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/projects')}
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
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
};
