import React, { useState, useMemo, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  clientTestimonialSchema,
  clientReplySchema,
  extractZodErrors,
} from '../../utils/alumniValidation';
import {
  postAlumniTestimonial,
  postTestimonialReply,
} from '../../api/alumniApi';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Builds a recursive tree from a flat array of approved replies using `parentReplyId`.
 */
const buildReplyTree = (replies = []) => {
  const map = new Map();
  const roots = [];

  replies.forEach((reply) => {
    const id = String(reply._id || reply.id);
    map.set(id, { ...reply, _id: id, children: [] });
  });

  replies.forEach((reply) => {
    const id = String(reply._id || reply.id);
    const parentId = reply.parentReplyId ? String(reply.parentReplyId) : null;
    const node = map.get(id);

    if (parentId && map.has(parentId)) {
      map.get(parentId).children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

const formatRelativeDate = (dateVal) => {
  if (!dateVal) return 'Recently';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Recently';
  }
};

/**
 * Recursive Comment Node (Instagram / Facebook style infinite nesting, NO Likes)
 */
const RecursiveReplyNode = ({
  node,
  testimonialId,
  depth = 0,
  currentUser = null,
  activeReplyTarget,
  setActiveReplyTarget,
  onReplySubmitted,
}) => {
  const [replyForm, setReplyForm] = useState({
    authorName: '',
    authorEmail: '',
    authorBatch: '',
    registrationId: '',
    content: '',
  });
  const [replyErrors, setReplyErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingNotice, setPendingNotice] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isReplyingHere = activeReplyTarget === node._id;

  const handleNestedReplySubmit = async (e) => {
    e.preventDefault();
    setReplyErrors({});
    setPendingNotice(null);

    const payload = currentUser
      ? {
          parentReplyId: node._id,
          authorName: currentUser.fullName,
          authorEmail: currentUser.email,
          authorBatch:
            currentUser.batchYear ||
            `${currentUser.yearOfAdmission}-${currentUser.yearOfPassing}`,
          registrationId: currentUser.registrationId,
          content: replyForm.content,
        }
      : {
          ...replyForm,
          parentReplyId: node._id,
        };

    const parsed = clientReplySchema.safeParse(payload);
    if (!parsed.success) {
      setReplyErrors(extractZodErrors(parsed.error));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onReplySubmitted(testimonialId, parsed.data);
      setReplyForm({
        authorName: '',
        authorEmail: '',
        authorBatch: '',
        registrationId: '',
        content: '',
      });
      setPendingNotice(
        res?.message ||
          'Reply submitted! It will appear publicly once approved by the SIHM Admin.'
      );
      setTimeout(() => {
        setActiveReplyTarget(null);
        setPendingNotice(null);
      }, 2800);
    } catch (err) {
      setReplyErrors({ general: err.message || 'Failed to submit reply.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`mt-3 ${
        depth > 0 ? 'pl-4 sm:pl-6 border-l-2 border-[#D5CEBF]' : ''
      }`}
    >
      <div className="bg-[var(--background)] border border-[#E6E2D8] p-3.5 sm:p-4">
        {/* Author Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#303030] text-[var(--background)] flex items-center justify-center text-[10px] font-bold uppercase">
              {(node.authorName || 'A').charAt(0)}
            </div>
            <span className="text-xs font-semibold text-[var(--text-main)]">
              {node.authorName}
            </span>
            {node.isOfficialAdmin && (
              <span className="px-2 py-0.5 bg-[var(--accent)] text-white text-[9px] font-bold uppercase tracking-wider">
                SIHM Admin
              </span>
            )}
            {node.authorBatch && (
              <span className="text-[10px] font-mono text-[var(--text-main)]/55">
                ({node.authorBatch})
              </span>
            )}
            {node.registrationId && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#EFECE6] text-[var(--text-main)]">
                {node.registrationId}
              </span>
            )}
          </div>

          <span className="text-[10px] text-[var(--text-main)]/45">
            {formatRelativeDate(node.createdAt)}
          </span>
        </div>

        {/* Reply Content */}
        <p className="mt-2 text-xs sm:text-sm font-light text-[var(--text-main)]/90 leading-relaxed">
          {node.content}
        </p>

        {/* Action Bar (Reply & Collapse Only — No Like/Appreciate) */}
        <div className="mt-2.5 flex items-center gap-4 text-[11px] font-semibold text-[var(--text-main)]/60">
          <button
            type="button"
            onClick={() =>
              setActiveReplyTarget(isReplyingHere ? null : node._id)
            }
            className="hover:text-[var(--accent)] transition-colors cursor-pointer"
          >
            {isReplyingHere ? 'Cancel Reply' : '↩ Reply'}
          </button>

          {node.children && node.children.length > 0 && (
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-[var(--text-main)]/70 hover:text-[var(--accent)] cursor-pointer font-mono text-[10px]"
            >
              {isCollapsed
                ? `Show ${node.children.length} ${
                    node.children.length === 1 ? 'reply' : 'replies'
                  }`
                : `Hide replies (${node.children.length})`}
            </button>
          )}
        </div>

        {/* Inline Reply-to-Reply Input Box */}
        {isReplyingHere && (
          <form
            onSubmit={handleNestedReplySubmit}
            className="mt-3 pt-3 border-t border-[#E6E2D8] space-y-2.5"
          >
            {replyErrors.general && (
              <p className="text-[11px] text-rose-600">{replyErrors.general}</p>
            )}
            {pendingNotice && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800">
                ✓ {pendingNotice}
              </div>
            )}

            {currentUser ? (
              <div className="text-[11px] text-[var(--text-main)]/75 bg-[#EFECE6] px-3 py-1.5 flex items-center justify-between">
                <span>
                  Replying as <strong>{currentUser.fullName}</strong> (
                  <span className="font-mono text-[var(--accent)]">
                    {currentUser.registrationId}
                  </span>
                  )
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <input
                    type="text"
                    value={replyForm.authorName}
                    onChange={(e) =>
                      setReplyForm({ ...replyForm, authorName: e.target.value })
                    }
                    placeholder="Your Name *"
                    className="w-full border border-[#D5CEBF] bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[var(--accent)]"
                  />
                  {replyErrors.authorName && (
                    <p className="text-[10px] text-rose-600 mt-0.5">
                      {replyErrors.authorName}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="email"
                    value={replyForm.authorEmail}
                    onChange={(e) =>
                      setReplyForm({
                        ...replyForm,
                        authorEmail: e.target.value,
                      })
                    }
                    placeholder="Your Email *"
                    className="w-full border border-[#D5CEBF] bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[var(--accent)]"
                  />
                  {replyErrors.authorEmail && (
                    <p className="text-[10px] text-rose-600 mt-0.5">
                      {replyErrors.authorEmail}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    value={replyForm.authorBatch}
                    onChange={(e) =>
                      setReplyForm({
                        ...replyForm,
                        authorBatch: e.target.value,
                      })
                    }
                    placeholder="Batch / Role (e.g. 2021) *"
                    className="w-full border border-[#D5CEBF] bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[var(--accent)]"
                  />
                  {replyErrors.authorBatch && (
                    <p className="text-[10px] text-rose-600 mt-0.5">
                      {replyErrors.authorBatch}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={replyForm.content}
                onChange={(e) =>
                  setReplyForm({ ...replyForm, content: e.target.value })
                }
                placeholder={`Replying to @${node.authorName}...`}
                className="flex-1 border border-[#D5CEBF] bg-white px-3 py-2 text-xs outline-none focus:border-[var(--accent)]"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[var(--accent)] text-white text-[10px] font-bold uppercase tracking-widest cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? '...' : 'Submit Reply'}
              </button>
            </div>
            {replyErrors.content && (
              <p className="text-[10px] text-rose-600">{replyErrors.content}</p>
            )}
          </form>
        )}
      </div>

      {/* Render Recursive Children */}
      {!isCollapsed &&
        node.children &&
        node.children.length > 0 &&
        node.children.map((child) => (
          <RecursiveReplyNode
            key={child._id}
            node={child}
            testimonialId={testimonialId}
            depth={depth + 1}
            currentUser={currentUser}
            activeReplyTarget={activeReplyTarget}
            setActiveReplyTarget={setActiveReplyTarget}
            onReplySubmitted={onReplySubmitted}
          />
        ))}
    </div>
  );
};

/**
 * Single Testimonial Thread Card
 */
const TestimonialCard = ({
  testimonial,
  currentUser = null,
  onReplySubmitted,
}) => {
  const [activeReplyTarget, setActiveReplyTarget] = useState(null);
  const [showRootReplyBox, setShowRootReplyBox] = useState(false);
  const [rootReplyForm, setRootReplyForm] = useState({
    authorName: '',
    authorEmail: '',
    authorBatch: '',
    registrationId: '',
    content: '',
  });
  const [rootErrors, setRootErrors] = useState({});
  const [rootSuccessNotice, setRootSuccessNotice] = useState(null);
  const [isSubmittingRoot, setIsSubmittingRoot] = useState(false);

  const replyTree = useMemo(
    () => buildReplyTree(testimonial.replies || []),
    [testimonial.replies]
  );

  const totalRepliesCount = Array.isArray(testimonial.replies)
    ? testimonial.replies.length
    : 0;

  const handleRootReplySubmit = async (e) => {
    e.preventDefault();
    setRootErrors({});
    setRootSuccessNotice(null);

    const payload = currentUser
      ? {
          parentReplyId: null,
          authorName: currentUser.fullName,
          authorEmail: currentUser.email,
          authorBatch:
            currentUser.batchYear ||
            `${currentUser.yearOfAdmission}-${currentUser.yearOfPassing}`,
          registrationId: currentUser.registrationId,
          content: rootReplyForm.content,
        }
      : {
          ...rootReplyForm,
          parentReplyId: null,
        };

    const parsed = clientReplySchema.safeParse(payload);
    if (!parsed.success) {
      setRootErrors(extractZodErrors(parsed.error));
      return;
    }

    setIsSubmittingRoot(true);
    try {
      const res = await onReplySubmitted(testimonial._id, parsed.data);
      setRootReplyForm({
        authorName: '',
        authorEmail: '',
        authorBatch: '',
        registrationId: '',
        content: '',
      });
      setRootSuccessNotice(
        res?.message ||
          'Your reply has been submitted and is queued for Admin approval.'
      );
      setTimeout(() => {
        setShowRootReplyBox(false);
        setRootSuccessNotice(null);
      }, 3000);
    } catch (err) {
      setRootErrors({ general: err.message || 'Could not submit reply.' });
    } finally {
      setIsSubmittingRoot(false);
    }
  };

  return (
    <article className="testimonial-card-item bg-white border border-[#E6E2D8] p-6 sm:p-8 shadow-[0_10px_30px_rgba(48,48,48,0.03)] flex flex-col justify-between">
      <div>
        {/* Catchy Heading + Quote Mark */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <span className="px-2.5 py-1 bg-[#EFECE6] text-[var(--accent)] text-[10px] font-bold uppercase tracking-[0.2em]">
            Alumni Reflection
          </span>
          <span className="head-txt text-5xl leading-none text-[var(--accent)]/30 select-none">
            &ldquo;
          </span>
        </div>

        <h3 className="head-txt text-2xl sm:text-3xl font-normal text-[var(--text-main)] leading-snug">
          {testimonial.heading}
        </h3>

        <p className="mt-4 text-sm sm:text-base font-light italic leading-relaxed text-[var(--text-main)]/85">
          &ldquo;{testimonial.content}&rdquo;
        </p>

        {/* Author Attribution */}
        <div className="mt-6 pt-4 border-t border-[#E6E2D8] flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-[var(--text-main)]">
              — {testimonial.authorName},{' '}
              <span className="text-[var(--accent)]">
                Batch {testimonial.batchYear}
              </span>
            </div>
            {(testimonial.designation || testimonial.organisation) && (
              <div className="text-xs text-[var(--text-main)]/60 mt-0.5">
                {[testimonial.designation, testimonial.organisation]
                  .filter(Boolean)
                  .join(' • ')}
              </div>
            )}
          </div>

          {testimonial.registrationId && (
            <span className="font-mono text-[10px] px-2 py-0.5 bg-[#EFECE6] text-[var(--text-main)]">
              {testimonial.registrationId}
            </span>
          )}
        </div>
      </div>

      {/* Interactive Discussion Bar (Infinite Replies Only — No Likes) */}
      <div className="mt-6 pt-4 border-t border-[#E6E2D8]">
        <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-main)]/70">
          <button
            type="button"
            onClick={() => setShowRootReplyBox(!showRootReplyBox)}
            className="hover:text-[var(--accent)] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>💬 Reply to Reflection</span>
            <span className="font-mono">({totalRepliesCount})</span>
          </button>

          <span className="text-[10px] font-mono text-[var(--text-main)]/45">
            {formatRelativeDate(testimonial.createdAt)}
          </span>
        </div>

        {/* Direct Root Reply Form */}
        {showRootReplyBox && (
          <form
            onSubmit={handleRootReplySubmit}
            className="mt-4 p-4 bg-[var(--background)] border border-[#D5CEBF] space-y-3"
          >
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">
              Replying to {testimonial.authorName}&apos;s Testimonial
            </div>
            {rootErrors.general && (
              <p className="text-xs text-rose-600">{rootErrors.general}</p>
            )}
            {rootSuccessNotice && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                ✓ {rootSuccessNotice}
              </div>
            )}

            {currentUser ? (
              <div className="text-xs bg-[#EFECE6] px-3 py-2 text-[var(--text-main)]/80">
                Commenting as <strong>{currentUser.fullName}</strong> (
                <span className="font-mono text-[var(--accent)]">
                  {currentUser.registrationId}
                </span>{' '}
                • {currentUser.email})
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <input
                    type="text"
                    value={rootReplyForm.authorName}
                    onChange={(e) =>
                      setRootReplyForm({
                        ...rootReplyForm,
                        authorName: e.target.value,
                      })
                    }
                    placeholder="Your Full Name *"
                    className="w-full border border-[#D5CEBF] bg-white px-3 py-2 text-xs outline-none focus:border-[var(--accent)]"
                  />
                  {rootErrors.authorName && (
                    <p className="text-[10px] text-rose-600 mt-0.5">
                      {rootErrors.authorName}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="email"
                    value={rootReplyForm.authorEmail}
                    onChange={(e) =>
                      setRootReplyForm({
                        ...rootReplyForm,
                        authorEmail: e.target.value,
                      })
                    }
                    placeholder="Your Email *"
                    className="w-full border border-[#D5CEBF] bg-white px-3 py-2 text-xs outline-none focus:border-[var(--accent)]"
                  />
                  {rootErrors.authorEmail && (
                    <p className="text-[10px] text-rose-600 mt-0.5">
                      {rootErrors.authorEmail}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    value={rootReplyForm.authorBatch}
                    onChange={(e) =>
                      setRootReplyForm({
                        ...rootReplyForm,
                        authorBatch: e.target.value,
                      })
                    }
                    placeholder="Batch Year (e.g. 2020-2023) *"
                    className="w-full border border-[#D5CEBF] bg-white px-3 py-2 text-xs outline-none focus:border-[var(--accent)]"
                  />
                  {rootErrors.authorBatch && (
                    <p className="text-[10px] text-rose-600 mt-0.5">
                      {rootErrors.authorBatch}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={rootReplyForm.content}
                onChange={(e) =>
                  setRootReplyForm({
                    ...rootReplyForm,
                    content: e.target.value,
                  })
                }
                placeholder="Write a comment or batch memory..."
                className="flex-1 border border-[#D5CEBF] bg-white px-3 py-2 text-xs outline-none focus:border-[var(--accent)]"
              />
              <button
                type="submit"
                disabled={isSubmittingRoot}
                className="px-5 py-2 bg-[#303030] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--accent)] transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmittingRoot ? 'Submitting...' : 'Reply'}
              </button>
            </div>
            {rootErrors.content && (
              <p className="text-[10px] text-rose-600">{rootErrors.content}</p>
            )}
          </form>
        )}

        {/* Nested Discussion Tree */}
        {replyTree.length > 0 && (
          <div className="mt-4 pt-2">
            {replyTree.map((node) => (
              <RecursiveReplyNode
                key={node._id}
                node={node}
                testimonialId={testimonial._id}
                depth={0}
                currentUser={currentUser}
                activeReplyTarget={activeReplyTarget}
                setActiveReplyTarget={setActiveReplyTarget}
                onReplySubmitted={onReplySubmitted}
              />
            ))}
          </div>
        )}
      </div>
    </article>
  );
};

export default function AlumniTestimonials({
  testimonials = [],
  currentUser = null,
  autoOpenShareModal = false,
  onCrossTabNavigate,
}) {
  const sectionRef = useRef(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postForm, setPostForm] = useState({
    authorName: '',
    authorEmail: '',
    batchYear: '',
    registrationId: '',
    designation: '',
    organisation: '',
    heading: '',
    content: '',
  });
  const [postErrors, setPostErrors] = useState({});
  const [isPosting, setIsPosting] = useState(false);
  const [submissionSuccessBanner, setSubmissionSuccessBanner] = useState(null);

  useEffect(() => {
    if (autoOpenShareModal) {
      setIsPostModalOpen(true);
    }
  }, [autoOpenShareModal]);

  useGSAP(
    () => {
      gsap.killTweensOf('.testimonial-card-item');
      gsap.fromTo(
        '.testimonial-card-item',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.06,
          ease: 'power3.out',
          overwrite: 'auto',
          clearProps: 'transform',
        }
      );
    },
    { scope: sectionRef, dependencies: [testimonials] }
  );

  const handleCreateTestimonial = async (e) => {
    e.preventDefault();
    setPostErrors({});
    setSubmissionSuccessBanner(null);

    const payload = currentUser
      ? {
          authorName: currentUser.fullName,
          authorEmail: currentUser.email,
          batchYear:
            currentUser.batchYear ||
            `${currentUser.yearOfAdmission}-${currentUser.yearOfPassing}`,
          registrationId: currentUser.registrationId,
          designation: currentUser.currentDesignation,
          organisation: currentUser.organisation,
          heading: postForm.heading,
          content: postForm.content,
        }
      : postForm;

    const parsed = clientTestimonialSchema.safeParse(payload);
    if (!parsed.success) {
      setPostErrors(extractZodErrors(parsed.error));
      return;
    }

    setIsPosting(true);
    try {
      const response = await postAlumniTestimonial(parsed.data);
      setSubmissionSuccessBanner(
        response.message ||
          'Your testimonial has been submitted and will be published on the public wall after administrative approval.'
      );
      setPostForm({
        authorName: '',
        authorEmail: '',
        batchYear: '',
        registrationId: '',
        designation: '',
        organisation: '',
        heading: '',
        content: '',
      });
    } catch (err) {
      setPostErrors({
        general: err.message || 'Could not submit testimonial.',
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleReplySubmitted = async (testimonialId, replyPayload) => {
    const response = await postTestimonialReply(testimonialId, replyPayload);
    return response;
  };

  return (
    <section
      id="alumni-testimonials"
      ref={sectionRef}
      className="relative w-full py-16 md:py-24 lg:py-28 bg-[var(--background)] text-[var(--text-main)] border-b border-[var(--text-main)]/10"
    >
      <div className="w-full max-w-[1800px] mx-auto px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-6">
          <div>
            <span className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)] block mb-3">
              07 / Voices of SIHM Durgapur
            </span>
            <h2 className="head-txt text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tighter leading-none text-[var(--text-main)]">
              Memories, Reflections &amp; <br />
              <span className="italic text-[var(--accent)]">Interactive Wall.</span>
            </h2>
          </div>

          <div className="flex flex-col items-start md:items-end gap-4">
            <p className="text-sm font-light text-[var(--text-main)]/65 max-w-md md:text-right">
              Read reflections from former students or reply to any testimonial or comment thread. All public posts and replies undergo administrative moderation before publishing.
            </p>
            <button
              type="button"
              onClick={() => {
                setSubmissionSuccessBanner(null);
                setIsPostModalOpen(true);
              }}
              className="px-6 py-3 bg-[#303030] text-[var(--background)] text-xs font-bold uppercase tracking-[0.2em] hover:bg-[var(--accent)] transition-colors cursor-pointer"
            >
              + Share Your Testimonial
            </button>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {testimonials.map((t, idx) => (
            <TestimonialCard
              key={t._id || idx}
              testimonial={t}
              currentUser={currentUser}
              onReplySubmitted={handleReplySubmitted}
            />
          ))}
        </div>
      </div>

      {/* Modal to Post a New Testimonial */}
      {isPostModalOpen && (
        <div
          data-lenis-prevent="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#303030]/60 backdrop-blur-xs overflow-y-auto"
        >
          <div className="relative w-full max-w-xl bg-[var(--background)] text-[var(--text-main)] border border-[#D5CEBF] p-6 sm:p-8 shadow-2xl my-auto">
            <div className="flex items-start justify-between border-b border-[var(--text-main)]/15 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] block">
                  Alumni Community Wall
                </span>
                <h3 className="head-txt text-2xl sm:text-3xl font-normal mt-1">
                  Share Your SIHM Durgapur Experience
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPostModalOpen(false)}
                className="px-2.5 py-1 border border-[var(--text-main)]/20 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {submissionSuccessBanner ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center text-xl font-bold">
                  ✓
                </div>
                <h4 className="head-txt text-3xl text-emerald-900">
                  Submitted for Administrative Approval
                </h4>
                <p className="text-sm text-[var(--text-main)]/80 max-w-md mx-auto">
                  {submissionSuccessBanner}
                </p>
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="mt-4 px-6 py-2.5 bg-[#303030] text-white text-xs font-bold uppercase tracking-widest cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateTestimonial} className="mt-5 space-y-4">
                {postErrors.general && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800">
                    {postErrors.general}
                  </div>
                )}

                {currentUser ? (
                  <div className="p-4 bg-[#EFECE6] border-l-4 border-[var(--accent)] space-y-1 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] block">
                      Posting via Verified Alumni Session
                    </span>
                    <div className="font-semibold text-[var(--text-main)]">
                      {currentUser.fullName} ({currentUser.registrationId})
                    </div>
                    <div className="text-[var(--text-main)]/70">
                      {currentUser.currentDesignation} at{' '}
                      {currentUser.organisation} • Batch{' '}
                      {currentUser.batchYear ||
                        `${currentUser.yearOfAdmission}-${currentUser.yearOfPassing}`}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-3 bg-white border border-[#E6E2D8] flex items-center justify-between gap-2 text-xs">
                      <span className="text-[var(--text-main)]/75">
                        Sign in to your Alumni Account to skip filling out your profile details.
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsPostModalOpen(false);
                          onCrossTabNavigate?.('portal', 'login');
                        }}
                        className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] hover:underline shrink-0 cursor-pointer"
                      >
                        Sign In →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-main)]/70 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={postForm.authorName}
                          onChange={(e) =>
                            setPostForm({
                              ...postForm,
                              authorName: e.target.value,
                            })
                          }
                          placeholder="e.g. Rohan Chatterjee"
                          className="w-full border border-[#D5CEBF] bg-white px-3.5 py-2.5 text-xs outline-none focus:border-[var(--accent)]"
                        />
                        {postErrors.authorName && (
                          <p className="text-[11px] text-rose-600 mt-1">
                            {postErrors.authorName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-main)]/70 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={postForm.authorEmail}
                          onChange={(e) =>
                            setPostForm({
                              ...postForm,
                              authorEmail: e.target.value,
                            })
                          }
                          placeholder="you@domain.com"
                          className="w-full border border-[#D5CEBF] bg-white px-3.5 py-2.5 text-xs outline-none focus:border-[var(--accent)]"
                        />
                        {postErrors.authorEmail && (
                          <p className="text-[11px] text-rose-600 mt-1">
                            {postErrors.authorEmail}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-main)]/70 mb-1">
                          Batch Year *
                        </label>
                        <input
                          type="text"
                          value={postForm.batchYear}
                          onChange={(e) =>
                            setPostForm({
                              ...postForm,
                              batchYear: e.target.value,
                            })
                          }
                          placeholder="2018-2021"
                          className="w-full border border-[#D5CEBF] bg-white px-3 py-2 text-xs outline-none focus:border-[var(--accent)]"
                        />
                        {postErrors.batchYear && (
                          <p className="text-[11px] text-rose-600 mt-1">
                            {postErrors.batchYear}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-main)]/70 mb-1">
                          Current Role
                        </label>
                        <input
                          type="text"
                          value={postForm.designation}
                          onChange={(e) =>
                            setPostForm({
                              ...postForm,
                              designation: e.target.value,
                            })
                          }
                          placeholder="e.g. Sous Chef"
                          className="w-full border border-[#D5CEBF] bg-white px-3 py-2 text-xs outline-none focus:border-[var(--accent)]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-main)]/70 mb-1">
                          Hotel / Organisation
                        </label>
                        <input
                          type="text"
                          value={postForm.organisation}
                          onChange={(e) =>
                            setPostForm({
                              ...postForm,
                              organisation: e.target.value,
                            })
                          }
                          placeholder="e.g. Taj Mahal Palace"
                          className="w-full border border-[#D5CEBF] bg-white px-3 py-2 text-xs outline-none focus:border-[var(--accent)]"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-main)]/70 mb-1">
                    Catchy Headline *
                  </label>
                  <input
                    type="text"
                    value={postForm.heading}
                    onChange={(e) =>
                      setPostForm({ ...postForm, heading: e.target.value })
                    }
                    placeholder="e.g. Where My Culinary Discipline Was Forged"
                    className="w-full border border-[#D5CEBF] bg-white px-3.5 py-2.5 text-xs outline-none focus:border-[var(--accent)]"
                  />
                  {postErrors.heading && (
                    <p className="text-[11px] text-rose-600 mt-1">
                      {postErrors.heading}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-main)]/70 mb-1">
                    Your Testimonial *
                  </label>
                  <textarea
                    rows={4}
                    value={postForm.content}
                    onChange={(e) =>
                      setPostForm({ ...postForm, content: e.target.value })
                    }
                    placeholder="SIHM Durgapur provided me with the foundation, practical knowledge and professional confidence..."
                    className="w-full border border-[#D5CEBF] bg-white p-3.5 text-xs outline-none focus:border-[var(--accent)]"
                  />
                  {postErrors.content && (
                    <p className="text-[11px] text-rose-600 mt-1">
                      {postErrors.content}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-[var(--text-main)]/15 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPostModalOpen(false)}
                    className="px-4 py-2 border border-[var(--text-main)]/20 text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPosting}
                    className="px-6 py-2.5 bg-[var(--accent)] text-white text-xs font-bold uppercase tracking-widest cursor-pointer disabled:opacity-50"
                  >
                    {isPosting ? 'Submitting...' : 'Submit for Approval'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}