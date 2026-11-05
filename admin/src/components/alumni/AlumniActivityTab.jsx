import React, { useState, useMemo } from 'react';
import {
  Search,
  Activity,
  Flag,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import apiClient from '../../api/axios.js';

export const ACTIVITY_TYPES = [
  'ALL',
  'REGISTRATION_SUBMITTED',
  'PROFILE_APPROVED',
  'PROFILE_UPDATED',
  'REUNION_RSVP_COMING',
  'TESTIMONIAL_POSTED',
  'COMMENT_REPLIED',
  'ADMIN_MODERATION',
];

export default function AlumniActivityTab({
  activities = [],
  setActivities,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredActivities = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return activities.filter((act) => {
      const matchesType =
        typeFilter === 'ALL' || act.activityType === typeFilter;
      const matchesStatus =
        statusFilter === 'ALL' || act.status === statusFilter;

      const blob = [
        act.registrationId,
        act.alumniName,
        act.email,
        act.activityType,
        act.description,
        act.ipAddress,
        JSON.stringify(act.metadata || {}),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesType && matchesStatus && (!q || blob.includes(q));
    });
  }, [activities, searchQuery, typeFilter, statusFilter]);

  const handleUpdateStatus = async (act, nextStatus) => {
    try {
      const { data } = await apiClient.patch(
        `/alumni/admin/activities/${act._id}/status`,
        { status: nextStatus }
      );
      if (data?.activity) {
        setActivities((prev) =>
          prev.map((item) => (item._id === act._id ? data.activity : item))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update activity status.');
    }
  };

  const handleDeleteActivity = async (id) => {
    try {
      await apiClient.delete(`/alumni/admin/activities/${id}`);
      setActivities((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete activity log.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Controls */}
      <div className="rounded-2xl border border-[#E6E2D8] bg-[#FFFFFF] p-5 shadow-[0_10px_30px_rgba(48,48,48,0.03)] flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#707884]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alumni activity by Registration ID, Alumnus Name, Email, Event, or IP..."
            className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[#303030] outline-none focus:border-[#E85D04]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/60 px-3 py-2 text-xs text-[#303030] outline-none focus:border-[#E85D04]"
          >
            {ACTIVITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t === 'ALL' ? 'All Activity Types' : t}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/60 px-3 py-2 text-xs text-[#303030] outline-none focus:border-[#E85D04]"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Flagged">Flagged</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Activity Table */}
      <div className="overflow-hidden rounded-2xl border border-[#E6E2D8] bg-[#FFFFFF] shadow-[0_10px_30px_rgba(48,48,48,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left font-sans text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#E6E2D8] bg-[#F7F5F0]/80 text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                <th className="py-4 pl-6 pr-3">Timestamp</th>
                <th className="py-4 px-3">Alumnus &amp; Reg ID</th>
                <th className="py-4 px-3">Activity Directive</th>
                <th className="py-4 px-3">Description &amp; Telemetry</th>
                <th className="py-4 px-3">Status</th>
                <th className="py-4 pr-6 text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E2D8]/60 text-[#303030]">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-[#707884]">
                    <Activity className="mx-auto h-8 w-8 text-[#D5CEBF]" />
                    <span className="mt-2 block font-serif text-base text-[#303030]">
                      No Matching Alumni Activity Logs Found
                    </span>
                  </td>
                </tr>
              ) : (
                filteredActivities.map((act) => (
                  <tr
                    key={act._id}
                    className="hover:bg-[#F7F5F0]/50 transition-colors"
                  >
                    <td className="py-4 pl-6 pr-3 font-mono text-xs text-[#707884] whitespace-nowrap">
                      {new Date(act.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="py-4 px-3">
                      <div className="font-semibold text-[#303030]">
                        {act.alumniName}
                      </div>
                      <div className="font-mono text-[11px] text-[#E85D04]">
                        {act.registrationId}
                      </div>
                      {act.email && (
                        <div className="font-mono text-[10px] text-[#707884]">
                          {act.email}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-3">
                      <span className="inline-block rounded-md border border-[#E6E2D8] bg-[#F7F5F0] px-2.5 py-1 font-mono text-[11px] font-medium text-[#303030]">
                        {act.activityType}
                      </span>
                    </td>

                    <td className="py-4 px-3 max-w-md">
                      <p className="text-xs text-[#303030] leading-relaxed">
                        {act.description}
                      </p>
                      <span className="block font-mono text-[10px] text-[#707884] mt-0.5">
                        Origin IP: {act.ipAddress}
                      </span>
                    </td>

                    <td className="py-4 px-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          act.status === 'Flagged'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : act.status === 'Archived'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {act.status}
                      </span>
                    </td>

                    <td className="py-4 pr-6 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateStatus(
                              act,
                              act.status === 'Flagged' ? 'Active' : 'Flagged'
                            )
                          }
                          title="Toggle Flag"
                          className="rounded-lg border border-[#E6E2D8] p-1.5 text-[#707884] hover:text-amber-600"
                        >
                          {act.status === 'Flagged' ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Flag className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteActivity(act._id)}
                          title="Delete Activity Record"
                          className="rounded-lg border border-[#E6E2D8] p-1.5 text-[#707884] hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}