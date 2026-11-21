import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthenticatedLayout } from '../../../layouts/AuthenticatedLayout';
import { siteService } from '../../../services/site.service';
import type { Site, SiteStatus, SiteType } from '../../../types/site.types';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { Modal } from '../../../components/ui/Modal';
import {
  MapPin,
  ArrowLeft,
  Building2,
  Edit2,
  Archive,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  User,
} from 'lucide-react';

const STATUS_BADGE_CLASSES: Record<SiteStatus, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  INACTIVE: 'bg-slate-100 text-slate-700 border-slate-200',
  UNDER_MAINTENANCE: 'bg-amber-50 text-amber-700 border-amber-200',
  COMPLETED: 'bg-blue-50 text-blue-700 border-blue-200',
};

const SITE_TYPE_LABELS: Record<SiteType, string> = {
  CONSTRUCTION: 'Construction Zone',
  MANUFACTURING: 'Manufacturing Plant',
  AGRICULTURE: 'Agricultural Area',
  INFRASTRUCTURE: 'Civil Infrastructure',
  WAREHOUSE: 'Logistics Warehouse',
  OTHER: 'Special Facility',
};

export const SiteDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [site, setSite] = useState<Site | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Archive modal
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSite = async () => {
      if (!id) return;
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await siteService.getSite(id);
        setSite(data);
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to load site details'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSite();
  }, [id]);

  const handleArchive = async () => {
    if (!id) return;
    setIsArchiving(true);
    setArchiveError(null);
    try {
      await siteService.archiveSite(id);
      setIsArchiveModalOpen(false);
      navigate('/admin/sites');
    } catch (err) {
      setArchiveError(
        err instanceof Error ? err.message : 'Failed to archive site'
      );
    } finally {
      setIsArchiving(false);
    }
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout title="Site Details">
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-xs">
          <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading site details...</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (errorMessage || !site) {
    return (
      <AuthenticatedLayout title="Site Details">
        <div className="max-w-4xl mx-auto space-y-4">
          <Link
            to="/admin/sites"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sites Directory
          </Link>
          <Alert
            type="error"
            title="Error Loading Site"
            message={errorMessage || 'Site record not found or inaccessible.'}
          />
        </div>
      </AuthenticatedLayout>
    );
  }

  const siteId = site.id || (site as any)._id;
  const projectObj =
    typeof site.projectId === 'object' && site.projectId !== null
      ? (site.projectId as any)
      : null;
  const projectId = projectObj?.id || projectObj?._id || site.projectId;

  return (
    <AuthenticatedLayout
      title={site.siteName}
      subtitle={`Site Code: ${site.siteCode} • ${SITE_TYPE_LABELS[site.siteType] || site.siteType}`}
    >
      <div className="space-y-6">
        {/* Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/admin/sites"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sites Directory
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/admin/sites/${siteId}/edit`)}
              className="gap-1.5"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit Site
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setArchiveError(null);
                setIsArchiveModalOpen(true);
              }}
              className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
            >
              <Archive className="h-3.5 w-3.5" />
              Archive
            </Button>
          </div>
        </div>

        {/* Site Header Summary */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                    STATUS_BADGE_CLASSES[site.status]
                  }`}
                >
                  {site.status.replace('_', ' ')}
                </span>
                <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {SITE_TYPE_LABELS[site.siteType] || site.siteType}
                </span>
                <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {site.siteCode}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {site.siteName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
                {site.description || 'No detailed site description entered.'}
              </p>
            </div>

            {projectObj && (
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 shrink-0 lg:max-w-xs">
                <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  Parent Project
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{projectObj.projectName}</h4>
                <p className="text-xs font-mono text-slate-500 mb-2">{projectObj.projectCode}</p>
                <Link
                  to={`/admin/projects/${projectId}`}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  View Parent Project <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-indigo-600" />
                Physical Location & Geofence
              </h3>
              <dl className="divide-y divide-slate-100 text-sm">
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500">Address</dt>
                  <dd className="font-medium text-slate-900 text-right">{site.address}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500">City & State</dt>
                  <dd className="font-medium text-slate-900">
                    {[site.city, site.state].filter(Boolean).join(', ') || 'Not specified'}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500">Country & Postal</dt>
                  <dd className="font-medium text-slate-900">
                    {site.country} {site.postalCode && `(${site.postalCode})`}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <dt className="text-slate-500">GPS Coordinates</dt>
                  <dd className="font-mono text-xs font-semibold text-slate-900">
                    {site.latitude != null && site.longitude != null ? (
                      <span className="flex items-center gap-2">
                        {site.latitude.toFixed(6)}, {site.longitude.toFixed(6)}
                        <a
                          href={`https://www.google.com/maps?q=${site.latitude},${site.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                        >
                          Maps <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </span>
                    ) : (
                      'No coordinates set'
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <User className="h-4 w-4 text-indigo-600" />
                Management & Registry
              </h3>
              <dl className="divide-y divide-slate-100 text-sm">
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500">Site Manager</dt>
                  <dd className="font-medium text-slate-900">
                    {site.siteManager || 'Unassigned'}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500">Operational Status</dt>
                  <dd className="font-medium text-slate-900">{site.status}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500">Registered In System</dt>
                  <dd className="font-medium text-slate-900">
                    {new Date(site.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500">Last Updated</dt>
                  <dd className="font-medium text-slate-900">
                    {new Date(site.updatedAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Archive Modal */}
        <Modal
          isOpen={isArchiveModalOpen}
          onClose={() => setIsArchiveModalOpen(false)}
          title="Archive Site"
          description="Are you sure you want to archive this site?"
        >
          <div className="space-y-4">
            {archiveError && (
              <Alert type="error" title="Cannot Archive" message={archiveError} />
            )}

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 mb-1">
                  Safely archiving "{site.siteName}"
                </p>
                <p>
                  Archiving removes the site from active mobile inspection rounds while safely keeping all previous defect reports, photos, and compliance history.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsArchiveModalOpen(false)}
                disabled={isArchiving}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleArchive}
                isLoading={isArchiving}
              >
                Confirm Archive
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AuthenticatedLayout>
  );
};
