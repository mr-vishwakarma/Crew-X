import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthenticatedLayout } from '../../../layouts/AuthenticatedLayout';
import { projectService } from '../../../services/project.service';
import type { Project } from '../../../types/project.types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/Alert';
import {
  Building2,
  ArrowLeft,
  Calendar,
  Save,
  RefreshCw,
} from 'lucide-react';

const editProjectSchema = z
  .object({
    projectName: z
      .string()
      .min(2, 'Project name must be at least 2 characters')
      .max(150, 'Project name cannot exceed 150 characters'),
    description: z.string().max(2000).optional(),
    industry: z.string().max(100).optional(),
    clientName: z.string().max(150).optional(),
    projectManager: z.string().max(100).optional(),
    startDate: z.string().min(1, 'Start date is required'),
    expectedEndDate: z.string().min(1, 'Expected end date is required'),
    actualEndDate: z.string().optional().or(z.literal('')),
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

type EditProjectFormData = z.infer<typeof editProjectSchema>;

export const EditProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditProjectFormData>({
    resolver: zodResolver(editProjectSchema),
  });

  useEffect(() => {
    const loadProject = async () => {
      if (!id) return;
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await projectService.getProject(id);
        setProject(data.project);
        reset({
          projectName: data.project.projectName,
          description: data.project.description || '',
          industry: data.project.industry || '',
          clientName: data.project.clientName || '',
          projectManager: data.project.projectManager || '',
          startDate: new Date(data.project.startDate).toISOString().split('T')[0],
          expectedEndDate: new Date(data.project.expectedEndDate).toISOString().split('T')[0],
          actualEndDate: data.project.actualEndDate
            ? new Date(data.project.actualEndDate).toISOString().split('T')[0]
            : '',
          status: data.project.status,
          priority: data.project.priority,
          location: data.project.location || '',
        });
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to load project details'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [id, reset]);

  const onSubmit = async (formData: EditProjectFormData) => {
    if (!id) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await projectService.updateProject(id, formData);
      navigate(`/admin/projects/${id}`);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to update project'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout title="Edit Project">
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-xs">
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading project record...</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout
      title={`Edit: ${project?.projectName || 'Project'}`}
      subtitle={`Project Code: ${project?.projectCode} • Identity preserved`}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Link
            to={`/admin/projects/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Project Details
          </Link>
        </div>

        {errorMessage && (
          <Alert type="error" title="Update Failed" message={errorMessage} />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Project Parameters</h3>
                  <p className="text-xs text-slate-500">Edit project metadata while preserving tracking history.</p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold px-3 py-1 rounded-lg bg-slate-100 text-slate-700">
                {project?.projectCode}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Project Name *
                </label>
                <Input
                  {...register('projectName')}
                  placeholder="Project name"
                  error={errors.projectName?.message}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Industry / Sector
                </label>
                <Input
                  {...register('industry')}
                  placeholder="Industry"
                  error={errors.industry?.message}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Client / Owner Organization
                </label>
                <Input
                  {...register('clientName')}
                  placeholder="Client name"
                  error={errors.clientName?.message}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Project Manager / Lead
                </label>
                <Input
                  {...register('projectManager')}
                  placeholder="Project Manager"
                  error={errors.projectManager?.message}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Primary Location
                </label>
                <Input
                  {...register('location')}
                  placeholder="Location"
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
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all resize-none"
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Timeline & Status Updates</h3>
                <p className="text-xs text-slate-500">Update schedule dates and operational status.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Start Date *
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
                  Actual Completion Date (Optional)
                </label>
                <Input
                  type="date"
                  {...register('actualEndDate')}
                  error={errors.actualEndDate?.message}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Current Status *
                </label>
                <select
                  {...register('status')}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all"
                >
                  <option value="PLANNED">Planned</option>
                  <option value="ACTIVE">Active</option>
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
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
                {errors.priority && (
                  <p className="mt-1 text-xs text-red-600">{errors.priority.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/admin/projects/${id}`)}
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
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
};
