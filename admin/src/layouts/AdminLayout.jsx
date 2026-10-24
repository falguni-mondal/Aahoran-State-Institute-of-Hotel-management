import React, { useState, Suspense } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import apiClient from '../api/axios.js';
import {
  logOut,
  selectCurrentUser,
  selectCurrentRole,
} from '../store/features/authSlice.js';
import Sidebar from '../components/layout/Sidebar.jsx';
import Topbar from '../components/layout/Topbar.jsx';

// Route header metadata mapping
const ROUTE_HEADER_MAP = {
  '/dashboard': {
    title: 'Institutional Telemetry',
    subtitle: 'PORTAL ROOT / REAL-TIME OBSERVABILITY',
  },
  '/audit-logs': {
    title: 'Security Audit Logs',
    subtitle: 'CRYPTOGRAPHIC SYSTEM AUDIT / ZERO-TRUST LOG',
  },
  '/mentors': {
    title: 'Mentors Directory',
    subtitle: 'ACADEMIC LEADERSHIP / PUBLIC REGISTRY',
  },
  '/campus-facilities': {
    title: 'Campus Facilities',
    subtitle: 'INFRASTRUCTURE GALLERIES / IMAGEKIT CDN',
  },
  '/placements': {
    title: 'Executive Roster',
    subtitle: 'PLACEMENT OUTCOMES / ALUMNI DIRECTORY',
  },
  '/gallery': {
    title: 'Gallery Subnavs CMS',
    subtitle: 'CAMPUS EVENTS & ARCHIVES / IMAGEKIT CDN',
  },
  '/contact-cms': {
    title: 'Contact Page CMS',
    subtitle: 'INSTITUTIONAL HELPLINES, MAP & PROXIMITY',
  },
  '/notices': {
    title: 'Notice Board',
    subtitle: 'OFFICIAL CIRCULARS / PUBLIC DOCUMENT DISPATCH',
  },
  '/results': {
    title: 'Results Archive',
    subtitle: 'EXAMINATION DECLARATIONS / VERIFICATION PORTAL',
  },
  '/study-materials': {
    title: 'Study Materials',
    subtitle: 'ACADEMIC HANDOUTS / COURSE MODULE REPOSITORY',
  },
  '/syllabus': {
    title: 'Syllabus Archive',
    subtitle: 'CURRICULUM SPECIFICATIONS / JNU & IGNOU STREAMS',
  },
  '/admins': {
    title: 'Clearance Staff & RBAC',
    subtitle: 'RESTRICTED PARTITION / SUPERADMIN LEVEL ACCESS ONLY',
  },
};

// Lightweight inline content loader so Sidebar & Topbar stay mounted during tab switches
const ContentAreaLoader = () => (
  <div className="flex min-h-[60vh] w-full items-center justify-center">
    <div className="flex items-center gap-3 rounded-2xl border border-[#E6E2D8] bg-[#FFFFFF] px-5 py-3.5 shadow-xs">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#E6E2D8] border-t-[#E85D04]" />
      <span className="font-sans text-xs font-medium tracking-wider uppercase text-[#707884]">
        Loading Module...
      </span>
    </div>
  </div>
);

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentUser = useSelector(selectCurrentUser);
  const userRole = useSelector(selectCurrentRole) || currentUser?.role || 'Admin';
  const isSuperAdmin = userRole === 'SuperAdmin';

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const headerMeta = ROUTE_HEADER_MAP[location.pathname] || {
    title: 'SIHM Administration',
    subtitle: 'STATE INSTITUTE OF HOTEL MANAGEMENT',
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Clear client state even if transient network fails
    } finally {
      dispatch(logOut());
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[#F7F5F0] font-sans text-[#303030]">
      {/* Background Architectural Watermarks */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(#E6E2D8_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,93,4,0.03),transparent_50%)]" />

      {/* Responsive Sidebar (Off-canvas drawer on <lg, docked on >=lg) */}
      <Sidebar
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        currentUser={currentUser}
        userRole={userRole}
        isSuperAdmin={isSuperAdmin}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      {/* Main Content Partition */}
      <main
        data-lenis-prevent="true"
        className="relative z-10 flex h-full min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden"
      >
        <Topbar
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          title={headerMeta.title}
          subtitle={headerMeta.subtitle}
        />

        <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-8 xl:p-10 2xl:p-14">
          <Suspense fallback={<ContentAreaLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;