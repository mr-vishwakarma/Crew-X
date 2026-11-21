import React, { useEffect, useState } from 'react';
import { AuthenticatedLayout } from '../../../layouts/AuthenticatedLayout';
import { userService } from '../../../services/user.service';
import type { ManagedUser, CreateUserPayload } from '../../../types/user.types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/Alert';
import { Modal } from '../../../components/ui/Modal';
import {
  UserCheck,
  Plus,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Building2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const SupervisorsListPage: React.FC = () => {
  const [supervisors, setSupervisors] = useState<ManagedUser[]>([]);
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

  const fetchSupervisors = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await userService.listSupervisors({
        page,
        limit: 15,
        search: search.trim() || undefined,
        isActive: statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE' ? 'true' : 'false',
      });
      setSupervisors(data.supervisors);
      setTotalPages(data.pagination.totalPages);
      setTotalCount(data.pagination.total);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to retrieve supervisors');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSupervisors();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchSupervisors();
  };

  const handleCreateSupervisor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setCreateError(null);
    try {
      await userService.createSupervisor(formData);
      setIsCreateModalOpen(false);
      setFormData({ fullName: '', email: '', password: '', phone: '', employeeId: '' });
      fetchSupervisors();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create supervisor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: ManagedUser) => {
    setStatusTogglingId(user.id);
    try {
      await userService.toggleSupervisorStatus(user.id, !user.isActive);
      fetchSupervisors();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update supervisor status');
    } finally {
      setStatusTogglingId(null);
    }
  };

  return (
    <AuthenticatedLayout
      title="Supervisors Management"
      subtitle="Provision and manage operations supervisors and delegate authorized project scopes"
    >
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Operations Supervisors ({totalCount})
            </h2>
            <p className="text-xs text-slate-500">
              Authorized managers who dispatch field inspectors and oversee project sites
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#12141a] hover:bg-slate-800 text-white cursor-pointer"
          >
            Create Supervisor
          </Button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by supervisor name, email, or employee ID..."
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
              onClick={fetchSupervisors}
              title="Refresh list"
            />
          </div>
        </div>

        {errorMessage && (
          <Alert type="error" title="Failed to Load Supervisors" message={errorMessage} />
        )}

        {/* Supervisors List Table / Cards */}
        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-xs">
            <RefreshCw className="h-8 w-8 text-slate-700 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading supervisor accounts...</p>
          </div>
        ) : supervisors.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-xs space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <UserCheck className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No supervisors created yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Create a supervisor account to delegate project authority and enable field inspector assignments.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#12141a] text-white"
            >
              Create First Supervisor
            </Button>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Supervisor</th>
                    <th className="py-3 px-4">Employee ID</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Assigned Projects</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {supervisors.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-[#12141a] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
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
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                          <Building2 className="h-3.5 w-3.5 text-blue-500" />
                          {user.assignedProjectsCount || 0} Project(s)
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

        {/* Create Supervisor Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create Operations Supervisor"
        >
          <form onSubmit={handleCreateSupervisor} className="space-y-4">
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
                placeholder="e.g., Rajesh Sharma"
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
                placeholder="supervisor@organization.com"
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
                  placeholder="e.g., SUP-2026-004"
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
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-800">Role & Scope Permissions:</span>
              <p>
                The account will receive the <strong>SUPERVISOR</strong> role, allowing project scope administration and field inspector site assignments once assigned to an active project.
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
