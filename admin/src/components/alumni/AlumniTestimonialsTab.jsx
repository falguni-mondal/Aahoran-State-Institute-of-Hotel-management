import React, { useState } from 'react';
import {
  MessageSquare,
  Trash2,
  Eye,
  EyeOff,
  Send,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import apiClient from '../../api/axios.js';

export default function AlumniTestimonialsTab({
  testimonials = [],
  setTestimonials,
  onRefresh,
}) {
  const [replyTextMap, setReplyTextMap] = useState({});
  const [replyingToId, setReplyingToId] = useState(null);

  const handleToggleApprove = async (item) => {
    try {
      const { data } = await apiClient.put(
        `/alumni/admin/testimonials/${item._id}`,
        { isApproved: !item.isApproved }
      );
      if (data?.testimonial) {
        setTestimonials((prev) =>
          prev.map((t) => (t._id === item._id ? data.testimonial : t))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle visibility.');
    }
  };

  const handleToggleReplyApprove = async (testimonialId, reply) => {
    try {
      const { data } = await apiClient.patch(
        `/alumni/admin/testimonials/${testimonialId}/replies/${reply._id}/approve`,
        { isApproved: !reply.isApproved }
      );
      if (data?.testimonial) {
        setTestimonials((prev) =>
          prev.map((t) => (t._id === testimonialId ? data.testimonial : t))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle reply approval.');
    }
  };

  const handleDeleteThread = async (item) => {
    const confirmed = window.confirm(
      `Delete testimonial "${item.heading}" by ${item.authorName} and all its nested replies?`
    );
    if (!confirmed) return;

    try {
      await apiClient.delete(`/alumni/admin/testimonials/${item._id}`);
      setTestimonials((prev) => prev.filter((t) => t._id !== item._id));
      onRefresh?.();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete testimonial.');
    }
  };

  const handleDeleteNestedReply = async (testimonialId, replyId) => {
    try {
      const { data } = await apiClient.delete(
        `/alumni/admin/testimonials/${testimonialId}/replies/${replyId}`
      );
      if (data?.testimonial) {
        setTestimonials((prev) =>
          prev.map((t) => (t._id === testimonialId ? data.testimonial : t))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete reply.');
    }
  };

  const handlePostOfficialAdminReply = async (
    testimonialId,
    parentReplyId = null
  ) => {
    const key = parentReplyId ? `${testimonialId}_${parentReplyId}` : testimonialId;
    const content = (replyTextMap[key] || '').trim();
    if (!content) return;

    try {
      const { data } = await apiClient.post(
        `/alumni/testimonials/${testimonialId}/replies`,
        {
          parentReplyId,
          authorName: 'SIHM Durgapur Alumni Cell',
          authorBatch: 'Official Administration',
          registrationId: 'SIHM-ADMIN',
          content,
          isOfficialAdmin: true,
        }
      );
      if (data?.testimonial) {
        setTestimonials((prev) =>
          prev.map((t) => (t._id === testimonialId ? data.testimonial : t))
        );
        setReplyTextMap((prev) => ({ ...prev, [key]: '' }));
        setReplyingToId(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post official reply.');
    }
  };

  return (
    <div className="space-y-4">
      {testimonials.length === 0 ? (
        <div className="rounded-2xl border border-[#E6E2D8] bg-[#FFFFFF] p-12 text-center text-[#707884]">
          <MessageSquare className="mx-auto h-8 w-8 text-[#D5CEBF]" />
          <p className="mt-3 font-serif text-lg text-[#303030]">
            No Testimonials Submitted Yet
          </p>
        </div>
      ) : (
        testimonials.map((item) => (
          <div
            key={item._id}
            className="rounded-2xl border border-[#E6E2D8] bg-[#FFFFFF] p-6 shadow-[0_10px_30px_rgba(48,48,48,0.03)] space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#E6E2D8] pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-serif text-xl text-[#303030]">
                    &ldquo;{item.heading}&rdquo;
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                      item.isApproved
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {item.isApproved
                      ? 'Approved • Visible on Public Wall'
                      : 'Pending Admin Approval • Hidden'}
                  </span>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-[#303030]/85 italic">
                  {item.content}
                </p>
                <div className="mt-2 text-xs text-[#707884]">
                  — <strong>{item.authorName}</strong> (Batch {item.batchYear}){' '}
                  {item.registrationId && `• ${item.registrationId}`}
                  {item.authorEmail && ` • ${item.authorEmail}`}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleApprove(item)}
                  className="inline-flex items-center gap-1 rounded-xl border border-[#E6E2D8] px-3 py-1.5 text-xs text-[#303030] hover:bg-[#F7F5F0]"
                >
                  {item.isApproved ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Approve Post</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteThread(item)}
                  className="inline-flex items-center gap-1 rounded-xl border border-[#E6E2D8] px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Purge</span>
                </button>
              </div>
            </div>

            {/* Admin Official Reply Box */}
            <div className="flex gap-2">
              <input
                type="text"
                value={replyTextMap[item._id] || ''}
                onChange={(e) =>
                  setReplyTextMap({
                    ...replyTextMap,
                    [item._id]: e.target.value,
                  })
                }
                placeholder="Post an official SIHM Administration reply to this testimonial..."
                className="flex-1 rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2 text-xs outline-none focus:border-[#E85D04]"
              />
              <button
                type="button"
                onClick={() => handlePostOfficialAdminReply(item._id, null)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#303030] px-4 py-2 text-xs font-semibold text-white hover:bg-[#E85D04]"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Official Reply</span>
              </button>
            </div>

            {/* Nested Replies Moderation List */}
            {Array.isArray(item.replies) && item.replies.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#707884]">
                  Nested Replies in Thread ({item.replies.length})
                </div>
                {item.replies.map((rep) => {
                  const subKey = `${item._id}_${rep._id}`;
                  return (
                    <div
                      key={rep._id}
                      className="rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 p-3 text-xs flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-[#303030]">
                              {rep.authorName}
                            </span>
                            {rep.isOfficialAdmin && (
                              <span className="inline-flex items-center gap-1 rounded bg-[#E85D04] px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                                <ShieldCheck className="h-2.5 w-2.5" /> Admin
                              </span>
                            )}
                            {rep.authorBatch && (
                              <span className="text-[11px] text-[#707884]">
                                ({rep.authorBatch})
                              </span>
                            )}
                            {rep.registrationId && (
                              <span className="font-mono text-[10px] text-[#303030]/70">
                                • {rep.registrationId}
                              </span>
                            )}
                            {rep.parentReplyId && (
                              <span className="font-mono text-[10px] text-[#E85D04]">
                                ↳ Nested Reply
                              </span>
                            )}
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                                rep.isApproved
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {rep.isApproved ? 'Approved' : 'Pending Approval'}
                            </span>
                          </div>
                          <p className="mt-1 text-[#303030]/85">{rep.content}</p>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleReplyApprove(item._id, rep)
                            }
                            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-semibold ${
                              rep.isApproved
                                ? 'border-[#E6E2D8] text-[#303030] hover:bg-white'
                                : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{rep.isApproved ? 'Hide' : 'Approve'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setReplyingToId(
                                replyingToId === rep._id ? null : rep._id
                              )
                            }
                            className="text-[11px] font-medium text-[#E85D04] hover:underline"
                          >
                            Reply
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteNestedReply(item._id, rep._id)
                            }
                            className="text-[11px] text-rose-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {replyingToId === rep._id && (
                        <div className="flex gap-2 pt-1">
                          <input
                            type="text"
                            value={replyTextMap[subKey] || ''}
                            onChange={(e) =>
                              setReplyTextMap({
                                ...replyTextMap,
                                [subKey]: e.target.value,
                              })
                            }
                            placeholder={`Official reply to @${rep.authorName}...`}
                            className="flex-1 rounded-lg border border-[#E6E2D8] bg-white px-3 py-1.5 text-xs outline-none focus:border-[#E85D04]"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handlePostOfficialAdminReply(item._id, rep._id)
                            }
                            className="rounded-lg bg-[#E85D04] px-3 py-1.5 text-[11px] font-semibold text-white"
                          >
                            Send
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}