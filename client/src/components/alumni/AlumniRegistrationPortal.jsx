import React, { useState, useRef, useEffect } from 'react';
import {
  ALUMNI_SECTORS,
  ALUMNI_COURSES,
  clientAlumniRegistrationSchema,
  clientAlumniLoginSchema,
  extractZodErrors,
} from '../../utils/alumniValidation';
import {
  uploadAlumniPortrait,
  submitAlumniRegistration,
  loginAlumnusAccount,
} from '../../api/alumniApi';

export default function AlumniRegistrationPortal({
  initialMode = 'register',
  currentUser = null,
  onAuthSuccess,
  onLogout,
  onCrossTabNavigate,
}) {
  const fileInputRef = useRef(null);
  const [authTab, setAuthTab] = useState(
    initialMode === 'login' ? 'login' : 'register'
  );

  useEffect(() => {
    if (initialMode === 'login' || initialMode === 'register') {
      setAuthTab(initialMode);
    }
  }, [initialMode]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    yearOfAdmission: '2020',
    yearOfPassing: '2023',
    courseCompleted: ALUMNI_COURSES[0],
    industrySector: ALUMNI_SECTORS[0],
    currentDesignation: '',
    organisation: '',
    currentLocation: '',
    contactNumber: '',
    linkedInProfile: '',
    achievements: '',
    publicConsent: true,
    showEmailPublicly: false,
    showPhonePublicly: false,
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('/alumni-bg.webp');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [authFeedbackBanner, setAuthFeedbackBanner] = useState(null);

  const [loginData, setLoginData] = useState({
    identifier: '',
    password: '',
  });
  const [loginErrors, setLoginErrors] = useState({});
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFieldErrors((prev) => ({
        ...prev,
        photograph: 'Please select a valid image file (JPG, PNG, WEBP).',
      }));
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setFieldErrors((prev) => ({
        ...prev,
        photograph: 'Image size must be under 8 MB.',
      }));
      return;
    }

    setSelectedFile(file);
    setFieldErrors((prev) => ({ ...prev, photograph: null }));
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setAuthFeedbackBanner(null);

    const parsed = clientAlumniRegistrationSchema.safeParse(formData);
    if (!parsed.success) {
      setFieldErrors(extractZodErrors(parsed.error));
      return;
    }

    setIsSubmitting(true);
    try {
      let photoUrl = '/alumni-bg.webp';
      let photoFileId = null;

      if (selectedFile) {
        setStatusText('Uploading photograph...');
        const uploaded = await uploadAlumniPortrait(selectedFile);
        photoUrl = uploaded.url;
        photoFileId = uploaded.fileId;
      }

      setStatusText('Verifying email & generating SIHM Registration ID...');
      const payload = {
        ...parsed.data,
        photograph: photoUrl,
        photoFileId,
      };

      const result = await submitAlumniRegistration(payload);
      setAuthFeedbackBanner(result.message);
      if (result.alumni) {
        onAuthSuccess?.(result.alumni);
      }
    } catch (err) {
      setFieldErrors({
        general:
          err.message ||
          'Could not complete registration. Please check your inputs and try again.',
      });
    } finally {
      setIsSubmitting(false);
      setStatusText('');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginErrors({});
    setAuthFeedbackBanner(null);

    const parsed = clientAlumniLoginSchema.safeParse(loginData);
    if (!parsed.success) {
      setLoginErrors(extractZodErrors(parsed.error));
      return;
    }

    setIsLoggingIn(true);
    try {
      const result = await loginAlumnusAccount(parsed.data);
      setAuthFeedbackBanner(result.message);
      if (result.alumni) {
        onAuthSuccess?.(result.alumni);
      }
    } catch (err) {
      setLoginErrors({
        general:
          err.message ||
          'Invalid Registration ID / Email or Password. Please try again.',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCopyRegistrationId = (regId) => {
    if (!regId) return;
    navigator.clipboard.writeText(regId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  return (
    <section
      id="alumni-register"
      className="relative w-full py-20 md:py-28 lg:py-36 bg-[#EFECE6] text-[var(--text-main)] border-b border-[var(--text-main)]/10 overflow-hidden"
    >
      <div className="w-full max-w-[1800px] mx-auto px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Context & Benefits */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)] block mb-3">
                08 / Alumni Authentication &amp; Registration Portal
              </span>
              <h2 className="head-txt text-4xl sm:text-5xl md:text-6xl font-light tracking-tight leading-none text-[var(--text-main)]">
                Your Official <br />
                <span className="italic text-[var(--accent)]">SIHM Alumni Account.</span>
              </h2>
              <p className="mt-6 text-sm md:text-base font-light leading-relaxed text-[var(--text-main)]/75">
                Register once to create your lifelong{' '}
                <strong className="text-[var(--text-main)] font-medium">
                  SIHM Alumni Account
                </strong>{' '}
                and receive your unique{' '}
                <strong className="text-[var(--accent)] font-mono">
                  Registration ID
                </strong>{' '}
                by email via Resend. Once signed in, the entire Alumni Portal automatically recognizes you — so you never have to re-enter your details to RSVP for reunions or post reflections.
              </p>
            </div>

            <div className="mt-10 p-6 border border-[#D5CEBF] bg-white space-y-4 shadow-[0_10px_30px_rgba(48,48,48,0.03)]">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
                Email Verification &amp; Administrative Moderation
              </div>
              <p className="text-xs font-light leading-relaxed text-[var(--text-main)]/80">
                All email addresses are verified for domain deliverability (MX records) and receive an instant credential welcome email. Public directory cards and wall posts require administrative approval before public display.
              </p>
              <div className="pt-2 border-t border-[#E6E2D8] font-mono text-[11px] text-[var(--text-main)]/60">
                ID Format: SIHM-[YEAR]-[COURSE]-[INITIALS+HASH]
              </div>
            </div>
          </div>

          {/* Right Column: Authenticated Pass OR Register / Sign In Forms */}
          <div className="lg:col-span-7 bg-white text-[var(--text-main)] p-6 sm:p-8 md:p-12 border border-[#D5CEBF] shadow-[0_15px_40px_rgba(48,48,48,0.05)]">
            {currentUser ? (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E6E2D8] pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-700 block">
                      ✓ Active Alumni Account Session
                    </span>
                    <h3 className="head-txt text-3xl sm:text-4xl font-normal text-[var(--text-main)] mt-1">
                      Welcome Home, {currentUser.fullName}
                    </h3>
                  </div>

                  <span
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border ${
                      currentUser.status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    Directory Status: {currentUser.status || 'Pending Approval'}
                  </span>
                </div>

                {authFeedbackBanner && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                    {authFeedbackBanner}
                  </div>
                )}

                <div className="bg-[#303030] text-[var(--background)] p-6 sm:p-8 border-l-4 border-[var(--accent)] relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.25em] text-[var(--accent)] font-semibold block">
                        SIHM Durgapur • Unique Registration ID
                      </span>
                      <div className="mt-2 font-mono text-2xl sm:text-3xl font-bold tracking-wider text-white select-all">
                        {currentUser.registrationId}
                      </div>
                      <div className="mt-1 font-mono text-xs text-white/70">
                        Registered Email: {currentUser.email}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleCopyRegistrationId(currentUser.registrationId)
                      }
                      className="px-4 py-2 bg-[var(--accent)] text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-[#303030] transition-colors cursor-pointer self-start sm:self-center"
                    >
                      {copiedId ? '✓ Copied ID' : 'Copy Registration ID'}
                    </button>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-white/50 block text-[10px] uppercase">
                        Batch
                      </span>
                      <span className="font-medium">
                        {currentUser.batchLabel ||
                          `${currentUser.yearOfAdmission} - ${currentUser.yearOfPassing}`}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/50 block text-[10px] uppercase">
                        Designation
                      </span>
                      <span className="font-medium">
                        {currentUser.currentDesignation}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/50 block text-[10px] uppercase">
                        Organisation
                      </span>
                      <span className="font-medium">
                        {currentUser.organisation}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => onCrossTabNavigate?.('updates', 'reunion')}
                    className="p-3.5 border border-[#D5CEBF] bg-[var(--background)] hover:border-[var(--accent)] text-left transition-colors cursor-pointer"
                  >
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                      1-Click RSVP
                    </span>
                    <span className="block text-xs font-medium text-[var(--text-main)] mt-0.5">
                      Upcoming Reunions →
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onCrossTabNavigate?.('testimonials', 'share')
                    }
                    className="p-3.5 border border-[#D5CEBF] bg-[var(--background)] hover:border-[var(--accent)] text-left transition-colors cursor-pointer"
                  >
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                      Alumni Wall
                    </span>
                    <span className="block text-xs font-medium text-[var(--text-main)] mt-0.5">
                      Post Reflection →
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={onLogout}
                    className="p-3.5 border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-left transition-colors cursor-pointer"
                  >
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-rose-700">
                      Session Control
                    </span>
                    <span className="block text-xs font-medium text-rose-900 mt-0.5">
                      Sign Out of Account
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex border-b border-[#E6E2D8] mb-6">
                  <button
                    type="button"
                    onClick={() => setAuthTab('register')}
                    className={`flex-1 pb-3.5 text-xs font-bold uppercase tracking-[0.2em] border-b-2 transition-all cursor-pointer ${
                      authTab === 'register'
                        ? 'border-[var(--accent)] text-[var(--accent)]'
                        : 'border-transparent text-[var(--text-main)]/50 hover:text-[var(--text-main)]'
                    }`}
                  >
                    01. Register New Alumnus
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthTab('login')}
                    className={`flex-1 pb-3.5 text-xs font-bold uppercase tracking-[0.2em] border-b-2 transition-all cursor-pointer ${
                      authTab === 'login'
                        ? 'border-[var(--accent)] text-[var(--accent)]'
                        : 'border-transparent text-[var(--text-main)]/50 hover:text-[var(--text-main)]'
                    }`}
                  >
                    02. Sign In (Reg ID / Email)
                  </button>
                </div>

                {authTab === 'login' ? (
                  <form
                    onSubmit={handleLoginSubmit}
                    className="space-y-5 py-2"
                    noValidate
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--accent)]">
                        Existing Alumni Member
                      </span>
                      <h3 className="head-txt text-2xl sm:text-3xl font-normal mt-1">
                        Sign In to Your SIHM Alumni Account
                      </h3>
                      <p className="text-xs text-[var(--text-main)]/65 mt-1">
                        Enter either your unique <strong>SIHM Registration ID</strong> (e.g., <code>SIHM-2021-BSC-...</code>) or your registered <strong>Email Address</strong> along with your password.
                      </p>
                    </div>

                    {loginErrors.general && (
                      <div className="p-3.5 bg-rose-50 border border-rose-200 text-xs text-rose-800">
                        {loginErrors.general}
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-main)]/75 mb-1.5">
                        Registration ID or Email Address *
                      </label>
                      <input
                        type="text"
                        value={loginData.identifier}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            identifier: e.target.value,
                          })
                        }
                        placeholder="SIHM-2021-BSC-... or name@domain.com"
                        className="w-full border border-[#D5CEBF] bg-[var(--background)]/50 px-4 py-3 text-xs sm:text-sm outline-none focus:border-[var(--accent)] focus:bg-white"
                      />
                      {loginErrors.identifier && (
                        <p className="mt-1 text-[11px] text-rose-600">
                          {loginErrors.identifier}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-main)]/75 mb-1.5">
                        Account Password *
                      </label>
                      <input
                        type="password"
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value,
                          })
                        }
                        placeholder="Enter your password"
                        className="w-full border border-[#D5CEBF] bg-[var(--background)]/50 px-4 py-3 text-xs sm:text-sm outline-none focus:border-[var(--accent)] focus:bg-white"
                      />
                      {loginErrors.password && (
                        <p className="mt-1 text-[11px] text-rose-600">
                          {loginErrors.password}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => setAuthTab('register')}
                        className="text-xs text-[var(--text-main)]/70 hover:text-[var(--accent)] cursor-pointer text-left"
                      >
                        Don&apos;t have a Registration ID yet? Register here →
                      </button>

                      <button
                        type="submit"
                        disabled={isLoggingIn}
                        className="px-8 py-4 bg-[#303030] text-[var(--background)] text-xs font-bold uppercase tracking-[0.2em] hover:bg-[var(--accent)] transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isLoggingIn ? 'Signing In...' : 'Sign In to Portal →'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form
                    onSubmit={handleRegisterSubmit}
                    className="space-y-5"
                    noValidate
                  >
                    {fieldErrors.general && (
                      <div className="p-3.5 bg-rose-50 border border-rose-200 text-xs text-rose-800">
                        {fieldErrors.general}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                      <div className="sm:col-span-4 flex items-center gap-4">
                        <div className="w-16 h-20 overflow-hidden border border-[#D5CEBF] bg-[#EFECE6] shrink-0">
                          <img
                            src={previewUrl}
                            alt="Portrait Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 bg-[#303030] text-white text-[10px] font-semibold uppercase tracking-wider hover:bg-[var(--accent)] transition-colors cursor-pointer"
                          >
                            Upload Photo
                          </button>
                          <span className="block text-[10px] text-[var(--text-main)]/55 mt-1">
                            Portrait (Max 8MB)
                          </span>
                          {fieldErrors.photograph && (
                            <span className="block text-[10px] text-rose-600 mt-0.5">
                              {fieldErrors.photograph}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="sm:col-span-8">
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-main)]/75 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) =>
                            handleChange('fullName', e.target.value)
                          }
                          placeholder="e.g. Arindam Mukherjee"
                          className="w-full border border-[#D5CEBF] bg-[var(--background)]/40 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[var(--accent)] focus:bg-white"
                        />
                        {fieldErrors.fullName && (
                          <p className="mt-1 text-[11px] text-rose-600">
                            {fieldErrors.fullName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-main)]/75 mb-1">
                          Verified Email Address *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          placeholder="name@domain.com"
                          className="w-full border border-[#D5CEBF] bg-[var(--background)]/40 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[var(--accent)] focus:bg-white"
                        />
                        {fieldErrors.email && (
                          <p className="mt-1 text-[11px] text-rose-600">
                            {fieldErrors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-main)]/75 mb-1">
                          Create Account Password (Min 8 chars) *
                        </label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) =>
                            handleChange('password', e.target.value)
                          }
                          placeholder="At least 8 characters"
                          className="w-full border border-[#D5CEBF] bg-[var(--background)]/40 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[var(--accent)] focus:bg-white"
                        />
                        {fieldErrors.password && (
                          <p className="mt-1 text-[11px] text-rose-600">
                            {fieldErrors.password}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-main)]/75 mb-1">
                          Year of Admission *
                        </label>
                        <input
                          type="number"
                          min="1995"
                          max="2030"
                          value={formData.yearOfAdmission}
                          onChange={(e) =>
                            handleChange('yearOfAdmission', e.target.value)
                          }
                          className="w-full border border-[#D5CEBF] bg-[var(--background)]/40 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[var(--accent)] focus:bg-white"
                        />
                        {fieldErrors.yearOfAdmission && (
                          <p className="mt-1 text-[11px] text-rose-600">
                            {fieldErrors.yearOfAdmission}
                          </p>
                        )}
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-main)]/75 mb-1">
                          Year of Passing *
                        </label>
                        <input
                          type="number"
                          min="1996"
                          max="2032"
                          value={formData.yearOfPassing}
                          onChange={(e) =>
                            handleChange('yearOfPassing', e.target.value)
                          }
                          className="w-full border border-[#D5CEBF] bg-[var(--background)]/40 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[var(--accent)] focus:bg-white"
                        />
                        {fieldErrors.yearOfPassing && (
                          <p className="mt-1 text-[11px] text-rose-600">
                            {fieldErrors.yearOfPassing}
                          </p>
                        )}
                      </div>

                      <div className="sm:col-span-6">
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-main)]/75 mb-1">
                          Course Completed *
                        </label>
                        <select
                          value={formData.courseCompleted}
                          onChange={(e) =>
                            handleChange('courseCompleted', e.target.value)
                          }
                          className="w-full border border-[#D5CEBF] bg-[var(--background)]/40 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[var(--accent)] focus:bg-white"
                        >
                          {ALUMNI_COURSES.map((course) => (
                            <option key={course} value={course}>
                              {course}
                            </option>
                          ))}
                        </select>
                        {fieldErrors.courseCompleted && (
                          <p className="mt-1 text-[11px] text-rose-600">
                            {fieldErrors.courseCompleted}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-main)]/75 mb-1">
                          Current Designation *
                        </label>
                        <input
                          type="text"
                          value={formData.currentDesignation}
                          onChange={(e) =>
                            handleChange('currentDesignation', e.target.value)
                          }
                          placeholder="e.g. Front Office Manager / Sous Chef"
                          className="w-full border border-[#D5CEBF] bg-[var(--background)]/40 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[var(--accent)] focus:bg-white"
                        />
                        {fieldErrors.currentDesignation && (
                          <p className="mt-1 text-[11px] text-rose-600">
                            {fieldErrors.currentDesignation}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-main)]/75 mb-1">
                          Organisation / Hotel Name *
                        </label>
                        <input
                          type="text"
                          value={formData.organisation}
                          onChange={(e) =>
                            handleChange('organisation', e.target.value)
                          }
                          placeholder="e.g. Taj Bengal Kolkata / Marriott Dubai"
                          className="w-full border border-[#D5CEBF] bg-[var(--background)]/40 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[var(--accent)] focus:bg-white"
                        />
                        {fieldErrors.organisation && (
                          <p className="mt-1 text-[11px] text-rose-600">
                            {fieldErrors.organisation}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-main)]/75 mb-1">
                          Professional Sector *
                        </label>
                        <select
                          value={formData.industrySector}
                          onChange={(e) =>
                            handleChange('industrySector', e.target.value)
                          }
                          className="w-full border border-[#D5CEBF] bg-[var(--background)]/40 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[var(--accent)] focus:bg-white"
                        >
                          {ALUMNI_SECTORS.map((sec) => (
                            <option key={sec} value={sec}>
                              {sec}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-main)]/75 mb-1">
                          Current Location (City, Country) *
                        </label>
                        <input
                          type="text"
                          value={formData.currentLocation}
                          onChange={(e) =>
                            handleChange('currentLocation', e.target.value)
                          }
                          placeholder="e.g. Kolkata, India or Dubai, UAE"
                          className="w-full border border-[#D5CEBF] bg-[var(--background)]/40 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[var(--accent)] focus:bg-white"
                        />
                        {fieldErrors.currentLocation && (
                          <p className="mt-1 text-[11px] text-rose-600">
                            {fieldErrors.currentLocation}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-main)]/75 mb-1">
                          Contact Number *
                        </label>
                        <input
                          type="tel"
                          value={formData.contactNumber}
                          onChange={(e) =>
                            handleChange('contactNumber', e.target.value)
                          }
                          placeholder="+91 98765 43210"
                          className="w-full border border-[#D5CEBF] bg-[var(--background)]/40 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[var(--accent)] focus:bg-white"
                        />
                        {fieldErrors.contactNumber && (
                          <p className="mt-1 text-[11px] text-rose-600">
                            {fieldErrors.contactNumber}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-main)]/75 mb-1">
                          LinkedIn Profile URL
                        </label>
                        <input
                          type="url"
                          value={formData.linkedInProfile}
                          onChange={(e) =>
                            handleChange('linkedInProfile', e.target.value)
                          }
                          placeholder="https://linkedin.com/in/..."
                          className="w-full border border-[#D5CEBF] bg-[var(--background)]/40 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[var(--accent)] focus:bg-white"
                        />
                        {fieldErrors.linkedInProfile && (
                          <p className="mt-1 text-[11px] text-rose-600">
                            {fieldErrors.linkedInProfile}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-main)]/75 mb-1">
                        Achievements / Professional Profile Summary
                      </label>
                      <textarea
                        rows={3}
                        value={formData.achievements}
                        onChange={(e) =>
                          handleChange('achievements', e.target.value)
                        }
                        placeholder="Share career milestones, hospitality awards, international pre-openings, or mentorship interests..."
                        className="w-full border border-[#D5CEBF] bg-[var(--background)]/40 p-3.5 text-xs sm:text-sm outline-none focus:border-[var(--accent)] focus:bg-white"
                      />
                      {fieldErrors.achievements && (
                        <p className="mt-1 text-[11px] text-rose-600">
                          {fieldErrors.achievements}
                        </p>
                      )}
                    </div>

                    <div className="p-4 bg-[var(--background)] border border-[#E6E2D8] space-y-2.5 text-xs">
                      <div className="font-bold uppercase tracking-wider text-[10px] text-[var(--text-main)]">
                        Privacy &amp; Directory Display Consent
                      </div>
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.publicConsent}
                          onChange={(e) =>
                            handleChange('publicConsent', e.target.checked)
                          }
                          className="mt-0.5"
                        />
                        <span className="text-[var(--text-main)]/80">
                          I consent to displaying my professional profile in the SIHM Alumni Directory after administrative approval.
                        </span>
                      </label>

                      <div className="flex flex-wrap gap-6 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.showEmailPublicly}
                            onChange={(e) =>
                              handleChange(
                                'showEmailPublicly',
                                e.target.checked
                              )
                            }
                          />
                          <span className="text-[11px] text-[var(--text-main)]/70">
                            Allow fellow alumni to see my Email publicly
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.showPhonePublicly}
                            onChange={(e) =>
                              handleChange(
                                'showPhonePublicly',
                                e.target.checked
                              )
                            }
                          />
                          <span className="text-[11px] text-[var(--text-main)]/70">
                            Allow fellow alumni to see my Phone publicly
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <span className="text-xs font-mono text-[var(--text-main)]/60">
                        {statusText}
                      </span>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-4 bg-[var(--accent)] text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#303030] transition-colors duration-300 cursor-pointer disabled:opacity-50"
                      >
                        {isSubmitting
                          ? 'Creating Account & Sending Email...'
                          : 'Register as an Alumnus →'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}