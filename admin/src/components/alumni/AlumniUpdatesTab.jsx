import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Calendar,
  Briefcase,
  Bell,
  Users,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  X,
  Loader2,
  Pin,
} from 'lucide-react';
import apiClient from '../../api/axios.js';

export const UPDATE_CATEGORY_OPTIONS = [
  { id: 'reunion', label: 'Upcoming Reunion (Launch & RSVPs)' },
  { id: 'announcement', label: 'Alumni Announcement' },
  { id: 'achievement', label: 'Professional Achievement' },
  { id: 'institute_news', label: 'Institute News' },
  { id: 'career_opportunity', label: 'Career Opportunity / Referral' },
  { id: 'newsletter', label: 'Alumni Newsletter Issue' },
];

export default function AlumniUpdatesTab({
  updates = [],
  setUpdates,
  onRefresh,
}) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Create / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Reunion Attendees Inspector Modal
  const [inspectingReunion, setInspectingReunion] = useState(null);

  const [formData, setFormData] = useState({
    category: 'reunion',
    title: '',
    subtitle: '',
    description: '',
    eventDate: '',
    eventVenue: '',
    company: '',
    location: '',
    actionUrl: '',
    isPinned: false,
    isActive: true,
  });

  const filteredUpdates = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return updates.filter((u) => {
      const matchesCat =
        selectedCategory === 'ALL' || u.category === selectedCategory;
      const blob = [
        u.title,
        u.subtitle,
        u.description,
        u.eventDate,
        u.eventVenue,
        u.company,
        u.location,
        u.category,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesCat && (!q || blob.includes(q));
    });
  }, [updates, selectedCategory, searchQuery]);

  const handleOpenModal = (item = null, presetCategory = 'reunion') => {
    setFormError(null);
    if (item) {
      setEditingItem(item);
      setFormData({
        category: item.category || 'reunion',
        title: item.title || '',
        subtitle: item.subtitle || '',
        description: item.description || '',
        eventDate: item.eventDate || '',
        eventVenue: item.eventVenue || '',
        company: item.company || '',
        location: item.location || '',
        actionUrl: item.actionUrl || '',
        isPinned: Boolean(item.isPinned),
        isActive: item.isActive !== false,
      });
    } else {
      setEditingItem(null);
      setFormData({
        category: presetCategory,
        title: '',
        subtitle: '',
        description: '',
        eventDate: '',
        eventVenue: '',
        company: '',
        location: '',
        actionUrl: '',
        isPinned: false,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (editingItem) {
        const { data } = await apiClient.put(
          `/alumni/admin/updates/${editingItem._id}`,
          formData
        );
        if (data?.update) {
          setUpdates((prev) =>
            prev.map((item) =>
              item._id === editingItem._id ? data.update : item
            )
          );
        }
      } else {
        const { data } = await apiClient.post(
          '/alumni/admin/updates',
          formData
        );
        if (data?.update) {
          setUpdates((prev) => [data.update, ...prev]);
        }
      }
      setIsModalOpen(false);
      onRefresh?.();
    } catch (err) {
      setFormError(
        err.response?.data?.message || 'Failed to save update item.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUpdate = async (item) => {
    const confirmed = window.confirm(`Delete "${item.title}" permanently?`);
    if (!confirmed) return;

    try {
      await apiClient.delete(`/alumni/admin/updates/${item._id}`);
      setUpdates((prev) => prev.filter((u) => u._id !== item._id));
      onRefresh?.();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item.');
    }
  };

  const handleRemoveAttendee = async (reunionId, attendeeId) => {
    try {
      const { data } = await apiClient.delete(
        `/alumni/admin/updates/${reunionId}/attendees/${attendeeId}`
      );
      if (data?.update) {
        setUpdates((prev) =>
          prev.map((u) => (u._id === reunionId ? data.update : u))
        );
        setInspectingReunion(data.update);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove attendee.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Action Bar */}
      <div className="rounded-2xl border border-[#E6E2D8] bg-[#FFFFFF] p-5 shadow-[0_10px_30px_rgba(48,48,48,0.03)] space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#707884]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reunions, announcements, achievements, news, career openings, or newsletters..."
              className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[#303030] outline-none focus:border-[#E85D04]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenModal(null, 'reunion')}
              className="flex items-center gap-1.5 rounded-xl bg-[#E85D04] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#303030]"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Launch Reunion</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenModal(null, 'career_opportunity')}
              className="flex items-center gap-1.5 rounded-xl bg-[#303030] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#E85D04]"
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>Post Career / News / Update</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#E6E2D8]/60">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-[#303030] text-white'
                : 'bg-[#F7F5F0] text-[#707884] hover:text-[#303030]'
            }`}
          >
            All Categories ({updates.length})
          </button>
          {UPDATE_CATEGORY_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedCategory(opt.id)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                selectedCategory === opt.id
                  ? 'bg-[#E85D04] text-white'
                  : 'bg-[#F7F5F0] text-[#707884] hover:text-[#303030]'
              }`}
            >
              {opt.label.split(' (')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Updates Grid */}
      {filteredUpdates.length === 0 ? (
        <div className="rounded-2xl border border-[#E6E2D8] bg-[#FFFFFF] p-12 text-center text-[#707884]">
          <Bell className="mx-auto h-8 w-8 text-[#D5CEBF]" />
          <p className="mt-3 font-serif text-lg text-[#303030]">
            No Alumni Updates or Reunions Found
          </p>
          <p className="mt-1 text-xs">
            Use &ldquo;Launch Reunion&rdquo; or &ldquo;Post Career / News / Update&rdquo; above to publish live content to the Alumni Page.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredUpdates.map((item) => {
            const isReunion = item.category === 'reunion';
            const attendeeCount = Array.isArray(item.attendees)
              ? item.attendees.length
              : 0;

            return (
              <div
                key={item._id}
                className="flex flex-col justify-between rounded-2xl border border-[#E6E2D8] bg-[#FFFFFF] p-5 shadow-[0_10px_30px_rgba(48,48,48,0.03)]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-lg bg-[#F7F5F0] border border-[#E6E2D8] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#E85D04]">
                      {item.category.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {item.isPinned && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#E85D04]">
                          <Pin className="h-3 w-3" /> Pinned
                        </span>
                      )}
                      {item.isActive ? (
                        <Eye className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5 text-[#707884]" />
                      )}
                    </div>
                  </div>

                  <h3 className="mt-3 font-serif text-xl text-[#303030]">
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <p className="text-xs font-medium text-[#707884] mt-0.5">
                      {item.subtitle}
                    </p>
                  )}

                  <p className="mt-2.5 text-xs text-[#707884] line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>

                  {isReunion && (
                    <div className="mt-3 rounded-xl bg-[#F7F5F0] p-3 text-xs space-y-1">
                      {item.eventDate && (
                        <div>
                          <strong>Date:</strong> {item.eventDate}
                        </div>
                      )}
                      {item.eventVenue && (
                        <div>
                          <strong>Venue:</strong> {item.eventVenue}
                        </div>
                      )}
                      <div className="pt-1 flex items-center justify-between">
                        <span className="font-semibold text-emerald-700">
                          {attendeeCount} Alumni Marked &ldquo;Coming&rdquo;
                        </span>
                        <button
                          type="button"
                          onClick={() => setInspectingReunion(item)}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#303030] px-2.5 py-1 text-[10px] font-semibold uppercase text-white hover:bg-[#E85D04]"
                        >
                          <Users className="h-3 w-3" />
                          <span>Inspect RSVPs</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {(item.company || item.location) && (
                    <div className="mt-3 text-xs text-[#303030]">
                      {item.company} {item.location ? `• ${item.location}` : ''}
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#E6E2D8] pt-3">
                  <span className="text-[11px] text-[#707884]">
                    {item.isActive ? 'Published Live' : 'Draft / Hidden'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(item)}
                      className="rounded-lg border border-[#E6E2D8] p-1.5 text-[#707884] hover:text-[#303030]"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteUpdate(item)}
                      className="rounded-lg border border-[#E6E2D8] p-1.5 text-[#707884] hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Update Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#303030]/50 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-[#E6E2D8] bg-[#FFFFFF] p-6 sm:p-8 shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#E6E2D8] pb-4">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-[#303030]">
                  {editingItem ? 'Edit Alumni Dispatch' : 'Publish Alumni Dispatch'}
                </h3>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#707884]">
                  Reunions, News, Career Opportunities &amp; Newsletters
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-1.5 text-[#707884]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveUpdate} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#707884] mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 outline-none focus:border-[#E85D04]"
                >
                  {UPDATE_CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#707884] mb-1">
                  Headline Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g. AAHORAN Grand Alumni Homecoming 2026"
                  className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 outline-none focus:border-[#E85D04]"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#707884] mb-1">
                  Subtitle / Batch Scope
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData({ ...formData, subtitle: e.target.value })
                  }
                  placeholder="e.g. All Batches Reunion • SIHM Durgapur Campus"
                  className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 outline-none focus:border-[#E85D04]"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#707884] mb-1">
                  Full Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 p-3.5 outline-none focus:border-[#E85D04]"
                />
              </div>

              {formData.category === 'reunion' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[#707884] mb-1">
                      Reunion Date &amp; Time
                    </label>
                    <input
                      type="text"
                      value={formData.eventDate}
                      onChange={(e) =>
                        setFormData({ ...formData, eventDate: e.target.value })
                      }
                      placeholder="e.g. 19 December 2026 • 4:00 PM"
                      className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 outline-none focus:border-[#E85D04]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[#707884] mb-1">
                      Event Venue
                    </label>
                    <input
                      type="text"
                      value={formData.eventVenue}
                      onChange={(e) =>
                        setFormData({ ...formData, eventVenue: e.target.value })
                      }
                      placeholder="e.g. SIHM Auditorium, Fuljhore"
                      className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 outline-none focus:border-[#E85D04]"
                    />
                  </div>
                </div>
              )}

              {formData.category === 'career_opportunity' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[#707884] mb-1">
                      Hiring Hotel / Brand
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                      placeholder="e.g. Taj Hotels / Oberoi Group"
                      className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 outline-none focus:border-[#E85D04]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[#707884] mb-1">
                      Job Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="e.g. Kolkata / Mumbai / Dubai"
                      className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 outline-none focus:border-[#E85D04]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#707884] mb-1">
                  External Link / Newsletter PDF / Application URL (Optional)
                </label>
                <input
                  type="text"
                  value={formData.actionUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, actionUrl: e.target.value })
                  }
                  placeholder="https://... or mailto:..."
                  className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 outline-none focus:border-[#E85D04]"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 font-medium text-[#303030]">
                  <input
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={(e) =>
                      setFormData({ ...formData, isPinned: e.target.checked })
                    }
                  />
                  <span>Pin as Featured Item</span>
                </label>

                <label className="flex items-center gap-2 font-medium text-[#303030]">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                  <span>Publish Live on Alumni Page</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-[#E6E2D8] pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-[#E6E2D8] px-4 py-2 text-[#707884]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-[#303030] px-5 py-2 font-semibold uppercase tracking-wider text-white hover:bg-[#E85D04]"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingItem ? 'Save Changes' : 'Publish Item'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reunion Attendees ("Marked as Coming") Inspector Modal */}
      {inspectingReunion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#303030]/50 backdrop-blur-xs">
          <div className="relative max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[#E6E2D8] bg-[#FFFFFF] p-6 sm:p-8 shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#E6E2D8] pb-4">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-[#303030]">
                  Reunion Attendance Roster — &ldquo;Coming&rdquo;
                </h3>
                <p className="text-xs text-[#707884] mt-0.5">
                  {inspectingReunion.title} ({inspectingReunion.attendees?.length || 0} Confirmed)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingReunion(null)}
                className="rounded-xl p-1.5 text-[#707884]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5">
              {!inspectingReunion.attendees ||
              inspectingReunion.attendees.length === 0 ? (
                <p className="py-10 text-center text-xs text-[#707884]">
                  No alumni have marked themselves as &ldquo;Coming&rdquo; yet.
                </p>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E6E2D8] text-[10px] font-semibold uppercase text-[#707884]">
                      <th className="py-2.5">Registration ID</th>
                      <th className="py-2.5">Alumnus Name &amp; Batch</th>
                      <th className="py-2.5">Contact</th>
                      <th className="py-2.5">Guests &amp; Menu</th>
                      <th className="py-2.5 text-right">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E2D8]/60">
                    {inspectingReunion.attendees.map((att) => (
                      <tr key={att._id}>
                        <td className="py-3 font-mono font-semibold text-[#E85D04]">
                          {att.registrationId}
                        </td>
                        <td className="py-3">
                          <div className="font-semibold text-[#303030]">
                            {att.fullName}
                          </div>
                          <div className="text-[11px] text-[#707884]">
                            Batch {att.batchYear}
                          </div>
                        </td>
                        <td className="py-3 font-mono text-[11px]">
                          <div>{att.email}</div>
                          <div className="text-[#707884]">{att.contactNumber}</div>
                        </td>
                        <td className="py-3">
                          <div>+{att.guestsCount || 0} Guests</div>
                          <div className="text-[11px] text-[#707884]">
                            {att.dietaryPreference}
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveAttendee(
                                inspectingReunion._id,
                                att._id
                              )
                            }
                            className="text-rose-600 hover:underline text-[11px]"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}