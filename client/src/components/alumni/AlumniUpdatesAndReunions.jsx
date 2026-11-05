import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  clientReunionRsvpSchema,
  extractZodErrors,
} from '../../utils/alumniValidation';
import {
  markReunionComing,
  verifyRegistrationId,
} from '../../api/alumniApi';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export const UPDATE_CATEGORIES = [
  { id: 'all', label: 'All Updates' },
  { id: 'reunion', label: 'Upcoming Reunions' },
  { id: 'announcement', label: 'Alumni Announcements' },
  { id: 'achievement', label: 'Professional Achievements' },
  { id: 'institute_news', label: 'Institute News' },
  { id: 'career_opportunity', label: 'Career Opportunities' },
  { id: 'newsletter', label: 'Alumni Newsletters' },
];

const CATEGORY_LABELS = {
  reunion: 'Upcoming Reunion',
  announcement: 'Alumni Announcement',
  achievement: 'Professional Achievement',
  institute_news: 'Institute News',
  career_opportunity: 'Career Opportunity',
  newsletter: 'Alumni Newsletter',
};

export default function AlumniUpdatesAndReunions({
  updates = [],
  initialCategoryFilter = 'all',
  currentUser = null,
  onUpdateRsvpSuccess,
  onCrossTabNavigate,
}) {
  const sectionRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategoryFilter || 'all'
  );

  // Sync category filter when subtab changes in 2nd navbar
  useEffect(() => {
    if (
      initialCategoryFilter &&
      UPDATE_CATEGORIES.some((c) => c.id === initialCategoryFilter)
    ) {
      setSelectedCategory(initialCategoryFilter);
    } else {
      setSelectedCategory('all');
    }
  }, [initialCategoryFilter]);

  // Reunion RSVP Modal State
  const [activeReunion, setActiveReunion] = useState(null);
  const [rsvpForm, setRsvpForm] = useState({
    registrationId: '',
    fullName: '',
    batchYear: '',
    email: '',
    contactNumber: '',
    guestsCount: 0,
    dietaryPreference: 'Standard',
    note: '',
  });
  const [rsvpErrors, setRsvpErrors] = useState({});
  const [isLookingUpId, setIsLookingUpId] = useState(false);
  const [lookupFeedback, setLookupFeedback] = useState(null);
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);
  const [rsvpSuccessBanner, setRsvpSuccessBanner] = useState(null);

  const filteredUpdates =
    selectedCategory === 'all'
      ? updates
      : updates.filter((u) => u.category === selectedCategory);

  useGSAP(
    () => {
      gsap.killTweensOf('.update-card-item');
      gsap.fromTo(
        '.update-card-item',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.05,
          ease: 'power3.out',
          overwrite: 'auto',
          clearProps: 'transform',
        }
      );
    },
    { scope: sectionRef, dependencies: [filteredUpdates] }
  );

  const handleOpenRsvpModal = (reunionItem) => {
    setActiveReunion(reunionItem);
    setRsvpErrors({});
    setLookupFeedback(null);
    setRsvpSuccessBanner(null);

    if (currentUser) {
      setRsvpForm({
        registrationId: currentUser.registrationId || '',
        fullName: currentUser.fullName || '',
        batchYear:
          currentUser.batchYear ||
          `${currentUser.yearOfAdmission}-${currentUser.yearOfPassing}`,
        email: currentUser.email || '',
        contactNumber: currentUser.contactNumber || '',
        guestsCount: 0,
        dietaryPreference: 'Standard',
        note: '',
      });
    } else {
      setRsvpForm({
        registrationId: '',
        fullName: '',
        batchYear: '',
        email: '',
        contactNumber: '',
        guestsCount: 0,
        dietaryPreference: 'Standard',
        note: '',
      });
    }
  };

  const handleCloseRsvpModal = () => {
    if (isSubmittingRsvp) return;
    setActiveReunion(null);
  };

  const handleVerifyRegId = async () => {
    const idToLookup = rsvpForm.registrationId.trim().toUpperCase();
    if (!idToLookup) {
      setRsvpErrors({
        registrationId: 'Please enter your Registration ID first to auto-fill.',
      });
      return;
    }

    setIsLookingUpId(true);
    setLookupFeedback(null);
    setRsvpErrors({});

    try {
      const alum = await verifyRegistrationId(idToLookup);
      setRsvpForm((prev) => ({
        ...prev,
        registrationId: alum.registrationId,
        fullName: alum.fullName || prev.fullName,
        batchYear: alum.batchYear || prev.batchYear,
        email: alum.email || prev.email,
        contactNumber: alum.contactNumber || prev.contactNumber,
      }));
      setLookupFeedback({
        type: 'success',
        text: `Verified record found for ${alum.fullName} (${alum.batchYear}). Details auto-filled!`,
      });
    } catch {
      setLookupFeedback({
        type: 'info',
        text: 'ID not yet in live cache — please fill in your minimum details below to mark yourself as Coming.',
      });
    } finally {
      setIsLookingUpId(false);
    }
  };

  const handleSubmitRsvp = async (e) => {
    e.preventDefault();
    setRsvpErrors({});
    setRsvpSuccessBanner(null);

    const payloadToSubmit = currentUser
      ? {
          ...rsvpForm,
          registrationId: currentUser.registrationId,
          fullName: currentUser.fullName,
          batchYear:
            currentUser.batchYear ||
            `${currentUser.yearOfAdmission}-${currentUser.yearOfPassing}`,
          email: currentUser.email,
          contactNumber: currentUser.contactNumber,
        }
      : rsvpForm;

    const parsed = clientReunionRsvpSchema.safeParse(payloadToSubmit);
    if (!parsed.success) {
      setRsvpErrors(extractZodErrors(parsed.error));
      return;
    }

    setIsSubmittingRsvp(true);
    try {
      const response = await markReunionComing(activeReunion._id, parsed.data);
      setRsvpSuccessBanner(
        response.message ||
          `You are officially marked as "Coming" for ${activeReunion.title}!`
      );
      onUpdateRsvpSuccess?.(
        activeReunion._id,
        parsed.data,
        response.attendeeCount
      );
    } catch (err) {
      setRsvpErrors({
        general: err.message || 'Could not submit Reunion RSVP.',
      });
    } finally {
      setIsSubmittingRsvp(false);
    }
  };

  return (
    <section
      id="alumni-updates"
      ref={sectionRef}
      className="relative w-full py-16 md:py-24 lg:py-28 bg-[#EFECE6] text-[var(--text-main)] border-b border-[var(--text-main)]/10"
    >
      <div className="w-full max-w-[1800px] mx-auto px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <span className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)] block mb-3">
              06 / Alumni Newsletter, Reunions &amp; Updates
            </span>
            <h2 className="head-txt text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tighter leading-none text-[var(--text-main)]">
              Reunions, News &amp; <span className="italic text-[var(--accent)]">Opportunities.</span>
            </h2>
          </div>
          <p className="text-sm md:text-base font-light text-[var(--text-main)]/70 max-w-md">
            Stay connected with official alumni announcements, upcoming batch reunions, career openings, and newsletters.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-12 border-b border-[var(--text-main)]/15 pb-4">
          {UPDATE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 text-xs uppercase tracking-[0.15em] font-semibold transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#303030] text-[var(--background)]'
                    : 'bg-white text-[var(--text-main)]/75 hover:text-[var(--accent)] border border-[#D5CEBF]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Updates & Reunions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredUpdates.map((item, idx) => {
            const isReunion = item.category === 'reunion';
            const isCareer = item.category === 'career_opportunity';
            const isNewsletter = item.category === 'newsletter';

            return (
              <div
                key={item._id || idx}
                className={`update-card-item flex flex-col justify-between p-6 md:p-8 border transition-[border-color,box-shadow] duration-300 ${
                  isReunion
                    ? 'bg-white text-[var(--text-main)] border-2 border-[var(--accent)] shadow-[0_15px_35px_rgba(232,93,4,0.08)]'
                    : 'bg-white text-[var(--text-main)] border-[#D5CEBF] hover:border-[var(--accent)] shadow-[0_10px_30px_rgba(48,48,48,0.03)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${
                        isReunion
                          ? 'bg-[var(--accent)] text-white'
                          : 'bg-[#EFECE6] text-[var(--accent)]'
                      }`}
                    >
                      {CATEGORY_LABELS[item.category] || item.category}
                    </span>

                    {item.isPinned && (
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent)] font-semibold">
                        ★ Featured
                      </span>
                    )}
                  </div>

                  <h3 className="head-txt text-2xl md:text-3xl font-normal leading-snug text-[var(--text-main)]">
                    {item.title}
                  </h3>

                  {item.subtitle && (
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                      {item.subtitle}
                    </p>
                  )}

                  <p className="mt-4 text-sm font-light leading-relaxed text-[var(--text-main)]/80">
                    {item.description}
                  </p>

                  {/* Reunion Metadata */}
                  {isReunion && (
                    <div className="mt-5 pt-4 border-t border-[#E6E2D8] space-y-1.5 text-xs text-[var(--text-main)]/85">
                      {item.eventDate && (
                        <div>
                          <strong className="text-[var(--accent)] uppercase tracking-wider">
                            Date &amp; Time:
                          </strong>{' '}
                          {item.eventDate}
                        </div>
                      )}
                      {item.eventVenue && (
                        <div>
                          <strong className="text-[var(--accent)] uppercase tracking-wider">
                            Venue:
                          </strong>{' '}
                          {item.eventVenue}
                        </div>
                      )}
                      <div className="pt-1 font-mono text-[11px] text-emerald-700 font-semibold">
                        ✓ {item.attendeeCount || 0} Alumni Marked as &ldquo;Coming&rdquo;
                      </div>

                      {Array.isArray(item.attendeesPreview) &&
                        item.attendeesPreview.length > 0 && (
                          <div className="pt-2 flex flex-wrap gap-1.5">
                            {item.attendeesPreview.slice(0, 4).map((att, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-[#EFECE6] text-[10px] text-[var(--text-main)]/85"
                              >
                                {att.fullName} ({att.batchYear})
                              </span>
                            ))}
                          </div>
                        )}
                    </div>
                  )}

                  {/* Career Opportunity Metadata */}
                  {isCareer && (item.company || item.location) && (
                    <div className="mt-4 pt-3 border-t border-[#E6E2D8] text-xs text-[var(--text-main)]/75 space-y-1">
                      {item.company && (
                        <div>
                          <strong>Hiring Brand:</strong> {item.company}
                        </div>
                      )}
                      {item.location && (
                        <div>
                          <strong>Location:</strong> {item.location}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Footer */}
                <div className="mt-6 pt-4 border-t border-[#E6E2D8] flex items-center justify-between gap-4">
                  {isReunion ? (
                    <button
                      type="button"
                      onClick={() => handleOpenRsvpModal(item)}
                      className="w-full py-3 px-4 bg-[#303030] text-[var(--background)] text-xs font-bold uppercase tracking-[0.2em] hover:bg-[var(--accent)] transition-colors cursor-pointer"
                    >
                      {currentUser
                        ? `Mark Me (${currentUser.registrationId}) as "Coming" →`
                        : 'Mark Me as "Coming" →'}
                    </button>
                  ) : item.actionUrl ? (
                    <a
                      href={item.actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)] hover:underline"
                    >
                      {isNewsletter
                        ? 'Read Newsletter Issue ↗'
                        : isCareer
                        ? 'Apply / View Referral Details ↗'
                        : 'View Full Circular ↗'}
                    </a>
                  ) : (
                    <span className="text-[11px] font-mono text-[var(--text-main)]/45">
                      SIHM Alumni Desk
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==========================================
          REUNION RSVP MODAL ("MARK AS COMING")
      ========================================== */}
      {activeReunion && (
        <div
          data-lenis-prevent="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#303030]/60 backdrop-blur-xs overflow-y-auto"
        >
          <div className="relative w-full max-w-xl bg-[var(--background)] text-[var(--text-main)] border border-[#D5CEBF] p-6 sm:p-8 md:p-10 shadow-2xl my-auto">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--text-main)]/15 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--accent)] block">
                  Reunion Attendance Confirmation
                </span>
                <h3 className="head-txt text-2xl sm:text-3xl font-normal mt-1">
                  {activeReunion.title}
                </h3>
                {activeReunion.eventDate && (
                  <p className="text-xs text-[var(--text-main)]/65 mt-0.5">
                    {activeReunion.eventDate} • {activeReunion.eventVenue}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleCloseRsvpModal}
                className="text-sm font-mono uppercase px-2.5 py-1 border border-[var(--text-main)]/20 hover:border-[var(--accent)] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {rsvpSuccessBanner ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center text-xl font-bold">
                  ✓
                </div>
                <h4 className="head-txt text-3xl text-emerald-900">
                  Attendance Confirmed!
                </h4>
                <p className="text-sm text-[var(--text-main)]/80 max-w-md mx-auto">
                  {rsvpSuccessBanner}
                </p>
                <button
                  type="button"
                  onClick={handleCloseRsvpModal}
                  className="mt-4 px-6 py-2.5 bg-[#303030] text-white text-xs font-bold uppercase tracking-widest cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitRsvp} className="mt-5 space-y-4">
                {rsvpErrors.general && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800">
                    {rsvpErrors.general}
                  </div>
                )}

                {currentUser ? (
                  <div className="p-4 bg-[#EFECE6] border-l-4 border-[var(--accent)] space-y-1 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] block">
                      Authenticated SIHM Alumni Session Active
                    </span>
                    <div className="font-semibold text-[var(--text-main)]">
                      {currentUser.fullName} ({currentUser.registrationId})
                    </div>
                    <div className="text-[var(--text-main)]/70">
                      {currentUser.email} • Batch{' '}
                      {currentUser.batchYear ||
                        `${currentUser.yearOfAdmission}-${currentUser.yearOfPassing}`}
                    </div>
                    <p className="text-[11px] text-emerald-800 pt-1">
                      ✓ Your account details are automatically linked — no need to re-enter your profile information.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="p-3 bg-white border border-[#E6E2D8] flex items-center justify-between gap-2 text-xs">
                      <span className="text-[var(--text-main)]/75">
                        Have an Alumni account? Sign in so you never have to type your details.
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          handleCloseRsvpModal();
                          onCrossTabNavigate?.('portal', 'login');
                        }}
                        className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] hover:underline shrink-0 cursor-pointer"
                      >
                        Sign In →
                      </button>
                    </div>

                    {/* Registration ID with Auto-Lookup for Guests */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-main)]/70 mb-1">
                        Your Unique Alumni Registration ID *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={rsvpForm.registrationId}
                          onChange={(e) =>
                            setRsvpForm({
                              ...rsvpForm,
                              registrationId: e.target.value.toUpperCase(),
                            })
                          }
                          placeholder="e.g. SIHM-2021-BSC-AR90F2"
                          className="flex-1 border border-[#D5CEBF] bg-white px-3.5 py-2.5 font-mono text-xs uppercase outline-none focus:border-[var(--accent)]"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyRegId}
                          disabled={isLookingUpId}
                          className="px-4 py-2.5 bg-[#303030] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[var(--accent)] transition-colors cursor-pointer shrink-0"
                        >
                          {isLookingUpId ? 'Checking...' : 'Verify & Auto-Fill'}
                        </button>
                      </div>
                      {rsvpErrors.registrationId && (
                        <p className="mt-1 text-[11px] text-rose-600">
                          {rsvpErrors.registrationId}
                        </p>
                      )}
                      {lookupFeedback && (
                        <p
                          className={`mt-1 text-[11px] ${
                            lookupFeedback.type === 'success'
                              ? 'text-emerald-700 font-medium'
                              : 'text-[var(--text-main)]/70'
                          }`}
                        >
                          {lookupFeedback.text}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-main)]/70 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={rsvpForm.fullName}
                          onChange={(e) =>
                            setRsvpForm({
                              ...rsvpForm,
                              fullName: e.target.value,
                            })
                          }
                          placeholder="Your Full Name"
                          className="w-full border border-[#D5CEBF] bg-white px-3.5 py-2.5 text-xs outline-none focus:border-[var(--accent)]"
                        />
                        {rsvpErrors.fullName && (
                          <p className="mt-1 text-[11px] text-rose-600">
                            {rsvpErrors.fullName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-main)]/70 mb-1">
                          Batch Year *
                        </label>
                        <input
                          type="text"
                          value={rsvpForm.batchYear}
                          onChange={(e) =>
                            setRsvpForm({
                              ...rsvpForm,
                              batchYear: e.target.value,
                            })
                          }
                          placeholder="e.g. 2018-2021"
                          className="w-full border border-[#D5CEBF] bg-white px-3.5 py-2.5 text-xs outline-none focus:border-[var(--accent)]"
                        />
                        {rsvpErrors.batchYear && (
                          <p className="mt-1 text-[11px] text-rose-600">
                            {rsvpErrors.batchYear}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-main)]/70 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={rsvpForm.email}
                          onChange={(e) =>
                            setRsvpForm({ ...rsvpForm, email: e.target.value })
                          }
                          placeholder="you@example.com"
                          className="w-full border border-[#D5CEBF] bg-white px-3.5 py-2.5 text-xs outline-none focus:border-[var(--accent)]"
                        />
                        {rsvpErrors.email && (
                          <p className="mt-1 text-[11px] text-rose-600">
                            {rsvpErrors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-main)]/70 mb-1">
                          Contact Number *
                        </label>
                        <input
                          type="tel"
                          value={rsvpForm.contactNumber}
                          onChange={(e) =>
                            setRsvpForm({
                              ...rsvpForm,
                              contactNumber: e.target.value,
                            })
                          }
                          placeholder="+91 98765 43210"
                          className="w-full border border-[#D5CEBF] bg-white px-3.5 py-2.5 text-xs outline-none focus:border-[var(--accent)]"
                        />
                        {rsvpErrors.contactNumber && (
                          <p className="mt-1 text-[11px] text-rose-600">
                            {rsvpErrors.contactNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-main)]/70 mb-1">
                      Accompanying Guests
                    </label>
                    <select
                      value={rsvpForm.guestsCount}
                      onChange={(e) =>
                        setRsvpForm({
                          ...rsvpForm,
                          guestsCount: Number(e.target.value),
                        })
                      }
                      className="w-full border border-[#D5CEBF] bg-white px-3.5 py-2.5 text-xs outline-none focus:border-[var(--accent)]"
                    >
                      <option value={0}>Solo (0 Guests)</option>
                      <option value={1}>+1 Guest</option>
                      <option value={2}>+2 Guests</option>
                      <option value={3}>+3 Guests</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-main)]/70 mb-1">
                      Culinary Preference
                    </label>
                    <select
                      value={rsvpForm.dietaryPreference}
                      onChange={(e) =>
                        setRsvpForm({
                          ...rsvpForm,
                          dietaryPreference: e.target.value,
                        })
                      }
                      className="w-full border border-[#D5CEBF] bg-white px-3.5 py-2.5 text-xs outline-none focus:border-[var(--accent)]"
                    >
                      <option value="Standard">Standard Gala Menu</option>
                      <option value="Vegetarian">Pure Vegetarian</option>
                      <option value="Vegan">Vegan / Plant-Based</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-main)]/70 mb-1">
                    Note for Batchmates / Organisers (Optional)
                  </label>
                  <input
                    type="text"
                    value={rsvpForm.note}
                    onChange={(e) =>
                      setRsvpForm({ ...rsvpForm, note: e.target.value })
                    }
                    placeholder="Looking forward to meeting everyone!"
                    className="w-full border border-[#D5CEBF] bg-white px-3.5 py-2.5 text-xs outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div className="pt-4 border-t border-[var(--text-main)]/15 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseRsvpModal}
                    className="px-4 py-2.5 border border-[var(--text-main)]/20 text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingRsvp}
                    className="px-6 py-2.5 bg-[var(--accent)] text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#303030] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingRsvp
                      ? 'Confirming...'
                      : 'Submit & Mark as "Coming"'}
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