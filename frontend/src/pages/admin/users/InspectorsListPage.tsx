import React, { useEffect, useState } from 'react';
import { AuthenticatedLayout } from '../../../layouts/AuthenticatedLayout';
import { userService } from '../../../services/user.service';
import type { ManagedUser, CreateUserPayload } from '../../../types/user.types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/Alert';
import { Modal } from '../../../components/ui/Modal';
import {
  Users,
  Plus,
  Search,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const InspectorsListPage: React.FC = () => {
  const [inspectors, setInspectors] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateUserPayload>({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    employeeId: '',
  });

  // Toggle Status State
  const [statusTogglingId, setStatusTogglingId] = useState<string | null>(null);

  const fetchInspectors = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await userService.listInspectors({
        page,
        limit: 15,
        search: search.trim() || undefined,
        isActive: statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE' ? 'true' : 'false',
      });
      setInspectors(data.inspectors);
      setTotalPages(data.pagination.totalPages);
      setTotalCount(data.pagination.total);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to retrieve inspectors');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInspectors();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchInspectors();
  };

  const handleCreateInspector = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setCreateError(null);
    try {
      await userService.createInspector(formData);
      setIsCreateModalOpen(false);
      setFormData({ fullName: '', email: '', password: '', phone: '', employeeId: '' });
      fetchInspectors();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create inspector');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: ManagedUser) => {
    setStatusTogglingId(user.id);
    try {
      await userService.toggleInspectorStatus(user.id, !user.isActive);
      fetchInspectors();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update inspector status');
    } finally {
      setStatusTogglingId(null);
    }
  };

  return (
    <AuthenticatedLayout
      title="Field Inspectors Roster"
      subtitle="Organization-wide inspector personnel directory, active site assignments, and credentials"
    >
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Field Inspectors ({totalCount})
            </h2>
            <p className="text-xs text-slate-500">
              Credentialed field auditors executing offline checklists and evidence captures on assigned sites
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#12141a] hover:bg-slate-800 text-white cursor-pointer"
          >
            Create Inspector
          </Button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by inspector name, email, or employee ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>
            <Button type="submit" variant="secondary" size="md">
              Filter
            </Button>
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPage(1);
              }}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Deactivated</option>
            </select>

            <Button
              variant="outline"
              size="md"
              leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
              onClick={fetchInspectors}
              title="Refresh list"
            />
          </div>
        </div>

        {errorMessage && (
          <Alert type="error" title="Failed to Load Inspectors" message={errorMessage} />
        )}

        {/* Inspectors List Table */}
        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-xs">
            <RefreshCw className="h-8 w-8 text-slate-700 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading inspector personnel...</p>
          </div>
        ) : inspectors.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-xs space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
              <Users className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No inspectors created yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Create an inspector account so supervisors can assign them to authorized project sites.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#12141a] text-white"
            >
              Create First Inspector
            </Button>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Inspector</th>
                    <th className="py-3 px-4">Employee ID</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Active Site Assignments</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {inspectors.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-800 border border-amber-300/40 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{user.fullName}</span>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Mail className="h-3 w-3 text-slate-400" />
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                        {user.employeeId || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {user.phone ? (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {user.phone}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                          <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                          {user.assignedSitesCount || 0} Site(s)
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <XCircle className="h-3 w-3" />
                            Deactivated
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={statusTogglingId === user.id}
                          onClick={() => handleToggleStatus(user)}
                          className={`text-xs ${
                            user.isActive
                              ? 'text-rose-600 hover:bg-rose-50 hover:border-rose-200'
                              : 'text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200'
                          }`}
                        >
                          {statusTogglingId === user.id
                            ? 'Updating...'
                            : user.isActive
                            ? 'Deactivate'
                            : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-600">
                <span>
                  Page {page} of {totalPages} ({totalCount} total)
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create Inspector Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create Field Inspector"
        >
          <form onSubmit={handleCreateInspector} className="space-y-4">
            {createError && (
              <Alert type="error" title="Creation Failed" message={createError} />
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name *
              </label>
              <Input
                type="text"
                required
                placeholder="e.g., Arvind Swami"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address *
              </label>
              <Input
                type="email"
                required
                placeholder="inspector@organization.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Initial Password * (minimum 8 characters)
              </label>
              <Input
                type="password"
                required
                placeholder="••••••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Employee ID (optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g., INSP-2026-081"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number (optional)
                </label>
                <Input
                  type="text"
                  placeholder="+91 91234 56789"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-800">Field Access Model:</span>
              <p>
                The account will receive the <strong>INSPECTOR</strong> role. An Inspector can only view and conduct audits on sites explicitly assigned to them by a project supervisor.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting}
                className="bg-[#12141a] text-white"
              >
                {isSubmitting ? 'Creating...' : 'Create Account'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AuthenticatedLayout>
  );
};
