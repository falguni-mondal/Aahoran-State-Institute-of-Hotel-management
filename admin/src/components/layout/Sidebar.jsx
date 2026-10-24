import React, { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Activity,
  FileText,
  Users,
  GraduationCap,
  Bell,
  Award,
  BookOpen,
  ScrollText,
  LogOut,
  Building2,
  Building,
  Briefcase,
  Images,
  PhoneCall,
  X,
  Loader2,
} from 'lucide-react';
import apiClient from '../../api/axios.js';
import {
  selectCurrentUser,
  selectCurrentRole,
  logOut,
} from '../../store/features/authSlice.js';

export default function Sidebar({
  isOpen = false,
  onClose,
  currentUser: propUser,
  userRole: propRole,
  isSuperAdmin: propIsSuperAdmin,
  onLogout,
  isLoggingOut = false,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const storeUser = useSelector(selectCurrentUser);
  const storeRole = useSelector(selectCurrentRole);

  const currentUser = propUser || storeUser;
  const activeRole = propRole || storeRole || currentUser?.role || 'Admin';
  const isSuperAdmin =
    propIsSuperAdmin !== undefined
      ? propIsSuperAdmin
      : activeRole === 'SuperAdmin';

  const userInitial = currentUser?.email?.charAt(0).toUpperCase() || 'A';

  // Automatically close the mobile drawer on route change
  useEffect(() => {
    if (isOpen && onClose) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const navLinks = [
    {
      label: 'Institutional Overview',
      path: '/dashboard',
      icon: Activity,
    },
    {
      label: 'Security Audit Logs',
      path: '/audit-logs',
      icon: FileText,
    },
    {
      label: 'Mentors Directory',
      path: '/mentors',
      icon: GraduationCap,
    },
    {
      label: 'Campus Facilities',
      path: '/campus-facilities',
      icon: Building,
    },
    {
      label: 'Executive Roster',
      path: '/placements',
      icon: Briefcase,
    },
    {
      label: 'Gallery Subnavs',
      path: '/gallery',
      icon: Images,
    },
    {
      label: 'Contact Page CMS',
      path: '/contact-cms',
      icon: PhoneCall,
    },
    {
      label: 'Notice Board',
      path: '/notices',
      icon: Bell,
    },
    {
      label: 'Results Archive',
      path: '/results',
      icon: Award,
    },
    {
      label: 'Study Materials',
      path: '/study-materials',
      icon: BookOpen,
    },
    {
      label: 'Syllabus Archive',
      path: '/syllabus',
      icon: ScrollText,
    },
    ...(isSuperAdmin
      ? [
          {
            label: 'Manage Admins',
            path: '/admins',
            icon: Users,
          },
        ]
      : []),
  ];

  const handleSignOut = async () => {
    if (onLogout) {
      onLogout();
      return;
    }

    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Continue client-side session eviction regardless of network outcome
    } finally {
      dispatch(logOut());
      navigate('/login', { replace: true });
    }
  };

  return (
    <>
      {/* Mobile & Tablet Backdrop Overlay */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-[#303030]/40 backdrop-blur-xs transition-opacity duration-300 lg:hidden ${
          isOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Responsive Sidebar Container */}
      <aside
        data-lenis-prevent="true"
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 max-w-[85vw] shrink-0 flex-col justify-between border-r border-[#E6E2D8] bg-[#FFFFFF] p-4 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:w-80 sm:p-5 lg:static lg:z-20 lg:w-68 lg:max-w-none lg:translate-x-0 lg:shadow-none xl:w-76 2xl:w-84 2xl:p-6 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Brand Header & Navigation Links */}
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Brand Identity + Mobile Close Button */}
          <div className="flex items-center justify-between gap-3 border-b border-[#E6E2D8] pb-5 2xl:pb-6">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#E6E2D8] bg-[#F7F5F0] text-[#E85D04] shadow-xs sm:h-11 sm:w-11 2xl:h-12 2xl:w-12">
                <Building2 className="h-5 w-5 2xl:h-6 2xl:w-6" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate font-serif text-sm font-medium tracking-tight text-[#303030] sm:text-base 2xl:text-lg">
                  SIHM PORTAL
                </h1>
                <p className="truncate font-serif text-[11px] italic text-[#707884] sm:text-xs 2xl:text-sm">
                  State Institute of Hotel Mgmt
                </p>
              </div>
            </div>

            {/* Close Drawer Button (Visible on Mobile/Tablet only) */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation menu"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/70 text-[#707884] transition-colors hover:bg-[#F7F5F0] hover:text-[#303030] lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable Navigation List */}
          <div className="mt-5 flex-1 overflow-y-auto pr-1 no-scrollbar">
            <span className="block px-3 font-sans text-[10px] font-semibold uppercase tracking-widest text-[#707884] 2xl:text-xs">
              Command Modules
            </span>

            <nav className="mt-2.5 space-y-1 2xl:space-y-1.5">
              {navLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024 && onClose) {
                        onClose();
                      }
                    }}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 font-sans text-xs font-medium transition-all sm:text-xs md:text-sm 2xl:py-3 2xl:text-base ${
                        isActive
                          ? 'border border-[#E6E2D8] bg-[#F7F5F0] text-[#303030] shadow-xs'
                          : 'border border-transparent text-[#707884] hover:border-[#E6E2D8]/60 hover:bg-[#F7F5F0]/60 hover:text-[#303030]'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-colors 2xl:h-5 2xl:w-5 ${
                            isActive
                              ? 'text-[#E85D04]'
                              : 'text-[#707884] group-hover:text-[#303030]'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Session Footer */}
        <div className="mt-4 shrink-0 space-y-3 border-t border-[#E6E2D8] pt-4 2xl:pt-5">
          <div className="flex items-center gap-3 rounded-2xl border border-[#E6E2D8] bg-[#F7F5F0]/70 p-2.5 shadow-xs sm:p-3 2xl:p-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E6E2D8] bg-[#FFFFFF] font-serif text-xs font-semibold text-[#303030] sm:h-10 sm:w-10 sm:text-sm 2xl:h-11 2xl:w-11 2xl:text-base">
              {userInitial}
            </div>

            <div className="min-w-0 flex-1">
              <p
                className="truncate font-sans text-xs font-medium text-[#303030] 2xl:text-sm"
                title={currentUser?.email}
              >
                {currentUser?.email || 'Authenticated Personnel'}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5 font-sans text-[10px] text-[#707884] sm:text-[11px] 2xl:text-xs">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#E85D04]" />
                <span className="truncate">{activeRole} Account</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="group flex w-full items-center justify-center gap-2 rounded-xl border border-[#E6E2D8] bg-[#FFFFFF] py-2.5 font-sans text-xs font-medium text-[#707884] transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50 sm:text-xs md:text-sm 2xl:py-3 2xl:text-base"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-rose-600" />
                <span>Signing Out...</span>
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 2xl:h-5 2xl:w-5" />
                <span>Sign Out</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}