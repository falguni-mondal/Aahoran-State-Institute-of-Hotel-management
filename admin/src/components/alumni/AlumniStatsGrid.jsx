import React, { forwardRef } from 'react';
import {
  Users,
  Clock,
  Award,
  Calendar,
  Activity,
} from 'lucide-react';

const AlumniStatsGrid = forwardRef(
  (
    {
      alumni = [],
      updates = [],
      activities = [],
      isLoading = false,
    },
    ref
  ) => {
    const totalAlumni = alumni.length;
    const approvedCount = alumni.filter((a) => a.status === 'Approved').length;
    const pendingCount = alumni.filter((a) => a.status === 'Pending').length;
    const distinguishedCount = alumni.filter(
      (a) => a.isDistinguished || a.isSuccessStory
    ).length;

    const reunionCount = updates.filter((u) => u.category === 'reunion').length;
    const totalRsvps = updates
      .filter((u) => u.category === 'reunion')
      .reduce(
        (sum, u) => sum + (Array.isArray(u.attendees) ? u.attendees.length : 0),
        0
      );

    return (
      <div
        ref={ref}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:gap-6"
      >
        {/* 1. Total Registered Alumni */}
        <div className="rounded-2xl border border-[#E6E2D8] bg-[#FFFFFF] p-6 shadow-[0_10px_30px_rgba(48,48,48,0.03)]">
          <div className="flex items-center justify-between text-[#707884]">
            <span className="font-sans text-[11px] font-semibold uppercase tracking-wider">
              Alumni Registry
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E6E2D8] bg-[#F7F5F0] text-[#E85D04]">
              <Users className="h-4 w-4" />
            </div>
          </div>
          {isLoading ? (
            <div className="mt-4 h-9 w-20 animate-pulse rounded-md bg-[#E6E2D8]/70" />
          ) : (
            <div className="mt-4 font-serif text-3xl font-normal tracking-tight text-[#303030] md:text-4xl">
              {totalAlumni}
            </div>
          )}
          <div className="mt-3 flex items-center justify-between border-t border-[#E6E2D8] pt-3 font-sans text-[11px] text-[#707884]">
            <span>Approved in Directory</span>
            <span className="font-semibold text-emerald-700">
              {approvedCount} Live
            </span>
          </div>
        </div>

        {/* 2. Pending Verification Queue */}
        <div className="rounded-2xl border border-[#E6E2D8] bg-[#FFFFFF] p-6 shadow-[0_10px_30px_rgba(48,48,48,0.03)]">
          <div className="flex items-center justify-between text-[#707884]">
            <span className="font-sans text-[11px] font-semibold uppercase tracking-wider">
              Pending Approval
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E6E2D8] bg-[#F7F5F0] text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          {isLoading ? (
            <div className="mt-4 h-9 w-20 animate-pulse rounded-md bg-[#E6E2D8]/70" />
          ) : (
            <div className="mt-4 font-serif text-3xl font-normal tracking-tight text-amber-700 md:text-4xl">
              {pendingCount}
            </div>
          )}
          <div className="mt-3 flex items-center justify-between border-t border-[#E6E2D8] pt-3 font-sans text-[11px] text-[#707884]">
            <span>Distinguished / Stories</span>
            <span className="inline-flex items-center gap-1 font-medium text-[#E85D04]">
              <Award className="h-3 w-3" /> {distinguishedCount} Featured
            </span>
          </div>
        </div>

        {/* 3. Reunions & Updates */}
        <div className="rounded-2xl border border-[#E6E2D8] bg-[#FFFFFF] p-6 shadow-[0_10px_30px_rgba(48,48,48,0.03)]">
          <div className="flex items-center justify-between text-[#707884]">
            <span className="font-sans text-[11px] font-semibold uppercase tracking-wider">
              Reunions &amp; Dispatches
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E6E2D8] bg-[#F7F5F0] text-emerald-600">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          {isLoading ? (
            <div className="mt-4 h-9 w-20 animate-pulse rounded-md bg-[#E6E2D8]/70" />
          ) : (
            <div className="mt-4 font-serif text-3xl font-normal tracking-tight text-[#303030] md:text-4xl">
              {updates.length}
            </div>
          )}
          <div className="mt-3 flex items-center justify-between border-t border-[#E6E2D8] pt-3 font-sans text-[11px] text-[#707884]">
            <span>{reunionCount} Reunions Launched</span>
            <span className="font-semibold text-emerald-700">
              {totalRsvps} &ldquo;Coming&rdquo; RSVPs
            </span>
          </div>
        </div>

        {/* 4. Tracked Alumni Activities */}
        <div className="rounded-2xl border border-[#E6E2D8] bg-[#FFFFFF] p-6 shadow-[0_10px_30px_rgba(48,48,48,0.03)]">
          <div className="flex items-center justify-between text-[#707884]">
            <span className="font-sans text-[11px] font-semibold uppercase tracking-wider">
              Activity Telemetry
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E6E2D8] bg-[#F7F5F0] text-[#303030]">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          {isLoading ? (
            <div className="mt-4 h-9 w-20 animate-pulse rounded-md bg-[#E6E2D8]/70" />
          ) : (
            <div className="mt-4 font-serif text-3xl font-normal tracking-tight text-[#303030] md:text-4xl">
              {activities.length}
            </div>
          )}
          <div className="mt-3 flex items-center justify-between border-t border-[#E6E2D8] pt-3 font-sans text-[11px] text-[#707884]">
            <span>Registrations, RSVPs &amp; Replies</span>
            <span className="font-medium text-[#303030]">Live Stream</span>
          </div>
        </div>
      </div>
    );
  }
);

AlumniStatsGrid.displayName = 'AlumniStatsGrid';

export default AlumniStatsGrid;