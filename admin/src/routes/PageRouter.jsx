import React from 'react';
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  Link,
} from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  selectIsAuthenticated,
  selectIsInitializing,
  selectCurrentRole,
  selectCurrentUser,
} from '../store/features/authSlice.js';
import AdminLayout from '../layouts/AdminLayout.jsx';

// Eagerly imported views eliminate the second Suspense loading screen waterfall
import Login from '../pages/Login.jsx';
import Setup2FA from '../pages/Setup2FA.jsx';
import Verify2FA from '../pages/Verify2FA.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import AuditLogs from '../pages/AuditLogs.jsx';
import ManageAdmins from '../pages/ManageAdmins.jsx';
import ManageMentors from '../pages/ManageMentors.jsx';
import ManageCampusFacilities from '../pages/ManageCampusFacilities.jsx';
import ManagePlacements from '../pages/ManagePlacements.jsx';
import ManageGallery from '../pages/ManageGallery.jsx';
import ManageContact from '../pages/ManageContact.jsx';
import ManageNotices from '../pages/ManageNotices.jsx';
import ManageResults from '../pages/ManageResults.jsx';
import ManageStudyMaterials from '../pages/ManageStudyMaterials.jsx';
import ManageSyllabus from '../pages/ManageSyllabus.jsx';

// Single Unified Institutional Preloader
const PageLoader = () => (
  <div className="flex min-h-screen w-full items-center justify-center bg-[#F7F5F0] px-4 py-8 text-[#303030]">
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="relative flex h-14 w-14 items-center justify-center sm:h-16 sm:w-16 2xl:h-20 2xl:h-20">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-[#E6E2D8] border-t-[#E85D04]" />
        <span className="font-serif text-sm font-semibold tracking-wider text-[#303030] 2xl:text-base">
          SIHM
        </span>
      </div>
      <div className="space-y-1">
        <h2 className="font-serif text-lg font-medium tracking-tight text-[#303030] sm:text-xl 2xl:text-2xl">
          State Institute of Hotel Management
        </h2>
        <p className="font-sans text-xs tracking-wider uppercase text-[#707884] 2xl:text-sm">
          Verifying Security Clearance...
        </p>
      </div>
    </div>
  </div>
);

// 403 Clearance Denied Screen
const UnauthorizedPage = () => (
  <div className="flex min-h-screen w-full items-center justify-center bg-[#F7F5F0] px-4 py-12 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
    <div className="w-full max-w-md rounded-2xl border border-[#E6E2D8] bg-[#FFFFFF] p-8 text-center shadow-[0_10px_30px_rgba(48,48,48,0.04)] sm:p-10 md:max-w-lg lg:max-w-xl 2xl:max-w-2xl 2xl:p-14">
      <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#E6E2D8] bg-[#F7F5F0] text-[#E85D04] 2xl:h-16 2xl:w-16">
        <svg
          className="h-7 w-7 2xl:h-8 2xl:w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <span className="block font-sans text-[11px] font-semibold uppercase tracking-widest text-[#E85D04] 2xl:text-xs">
        Clearance Notice
      </span>

      <h1 className="mt-2 font-serif text-2xl font-normal tracking-tight text-[#303030] sm:text-3xl 2xl:text-4xl">
        Access <span className="italic">Restricted</span>
      </h1>

      <p className="mt-3 font-sans text-xs leading-relaxed text-[#707884] sm:text-sm 2xl:text-base">
        Your current administrative credentials lack the clearance level required to inspect or mutate records within this institutional partition.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          to="/dashboard"
          className="inline-flex w-full items-center justify-center rounded-xl bg-[#303030] px-6 py-3 font-sans text-xs font-medium uppercase tracking-wider text-[#F7F5F0] transition-colors hover:bg-[#E85D04] sm:w-auto 2xl:py-3.5 2xl:text-sm"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  </div>
);

// 404 Route Not Located Screen
const NotFoundPage = () => (
  <div className="flex min-h-screen w-full items-center justify-center bg-[#F7F5F0] px-4 py-12 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
    <div className="w-full max-w-md rounded-2xl border border-[#E6E2D8] bg-[#FFFFFF] p-8 text-center shadow-[0_10px_30px_rgba(48,48,48,0.04)] sm:p-10 md:max-w-lg lg:max-w-xl 2xl:max-w-2xl 2xl:p-14">
      <span className="block font-serif text-5xl font-light text-[#E85D04] sm:text-6xl 2xl:text-7xl">
        404
      </span>

      <h2 className="mt-2 font-serif text-2xl font-normal tracking-tight text-[#303030] sm:text-3xl 2xl:text-4xl">
        Partition <span className="italic">Unreachable</span>
      </h2>

      <p className="mt-3 font-sans text-xs leading-relaxed text-[#707884] sm:text-sm 2xl:text-base">
        The requested administrative route does not exist or has been relocated within the institutional portal hierarchy.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          to="/dashboard"
          className="inline-flex w-full items-center justify-center rounded-xl bg-[#303030] px-6 py-3 font-sans text-xs font-medium uppercase tracking-wider text-[#F7F5F0] transition-colors hover:bg-[#E85D04] sm:w-auto 2xl:py-3.5 2xl:text-sm"
        >
          Back to Portal Overview
        </Link>
      </div>
    </div>
  </div>
);

// =========================================
// ROUTE GUARDS (LOOP-SAFE & REHYDRATION-AWARE)
// =========================================

export const PublicRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInitializing = useSelector(selectIsInitializing);
  const location = useLocation();

  if (isInitializing) {
    return <PageLoader />;
  }

  const rawFrom = location.state?.from?.pathname;
  const isAuthRoute =
    !rawFrom ||
    rawFrom === '/login' ||
    rawFrom === '/verify-2fa' ||
    rawFrom === '/setup-2fa' ||
    rawFrom === '/unauthorized';

  const safeDestination = isAuthRoute ? '/dashboard' : rawFrom;

  if (isAuthenticated) {
    return <Navigate to={safeDestination} replace />;
  }

  return <Outlet />;
};

export const ProtectedRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInitializing = useSelector(selectIsInitializing);
  const location = useLocation();

  if (isInitializing) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export const RoleGuard = ({ allowedRoles = [] }) => {
  const isInitializing = useSelector(selectIsInitializing);
  const roleFromSelector = useSelector(selectCurrentRole);
  const currentUser = useSelector(selectCurrentUser);
  const location = useLocation();

  if (isInitializing) {
    return <PageLoader />;
  }

  const activeRole = roleFromSelector || currentUser?.role || 'Admin';

  if (!allowedRoles.includes(activeRole)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

// =========================================
// CENTRAL ROUTER DEFINITION
// =========================================
const PageRouter = () => {
  return (
    <Routes>
      {/* Public Authentication Stages */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/setup-2fa" element={<Setup2FA />} />
        <Route path="/verify-2fa" element={<Verify2FA />} />
      </Route>

      {/* Protected Administrative Application Routes Mounted Inside AdminLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/mentors" element={<ManageMentors />} />
          <Route path="/campus-facilities" element={<ManageCampusFacilities />} />
          <Route path="/placements" element={<ManagePlacements />} />
          <Route path="/gallery" element={<ManageGallery />} />
          <Route path="/contact-cms" element={<ManageContact />} />
          <Route path="/notices" element={<ManageNotices />} />
          <Route path="/results" element={<ManageResults />} />
          <Route path="/study-materials" element={<ManageStudyMaterials />} />
          <Route path="/syllabus" element={<ManageSyllabus />} />

          {/* SuperAdmin Level Restricted Routes */}
          <Route element={<RoleGuard allowedRoles={['SuperAdmin']} />}>
            <Route path="/admins" element={<ManageAdmins />} />
          </Route>
        </Route>
      </Route>

      {/* Informational and Fallback Routes */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default PageRouter;