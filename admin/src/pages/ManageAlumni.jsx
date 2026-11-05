import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  Users,
  Calendar,
  MessageSquare,
  Activity,
  Settings,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import apiClient from '../api/axios.js';

import AlumniStatsGrid from '../components/alumni/AlumniStatsGrid.jsx';
import AlumniDirectoryTab from '../components/alumni/AlumniDirectoryTab.jsx';
import AlumniUpdatesTab from '../components/alumni/AlumniUpdatesTab.jsx';
import AlumniTestimonialsTab from '../components/alumni/AlumniTestimonialsTab.jsx';
import AlumniActivityTab from '../components/alumni/AlumniActivityTab.jsx';
import AlumniPageCmsTab from '../components/alumni/AlumniPageCmsTab.jsx';

const TABS = [
  {
    id: 'directory',
    label: 'Alumni Directory & Approvals',
    icon: Users,
  },
  {
    id: 'updates',
    label: 'Reunions, News & Careers CMS',
    icon: Calendar,
  },
  {
    id: 'testimonials',
    label: 'Testimonials & Replies Wall',
    icon: MessageSquare,
  },
  {
    id: 'activity',
    label: 'Alumni Activity Telemetry',
    icon: Activity,
  },
  {
    id: 'cms',
    label: 'Page Intro & Sectors CMS',
    icon: Settings,
  },
];

export default function ManageAlumni() {
  const [activeTab, setActiveTab] = useState('directory');
  const [config, setConfig] = useState(null);
  const [alumni, setAlumni] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [activities, setActivities] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const statsGridRef = useRef(null);

  const fetchOverview = useCallback(async (manualSync = false) => {
    if (manualSync) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const { data } = await apiClient.get('/alumni/admin/overview');
      if (data?.status === 'success') {
        setConfig(data.config || null);
        setAlumni(Array.isArray(data.alumni) ? data.alumni : []);
        setUpdates(Array.isArray(data.updates) ? data.updates : []);
        setTestimonials(
          Array.isArray(data.testimonials) ? data.testimonials : []
        );
        setActivities(Array.isArray(data.activities) ? data.activities : []);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
          'Failed to synchronize Alumni Network & CMS data from server.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview(false);
  }, [fetchOverview]);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.35 }
      ).fromTo(
        statsGridRef.current?.children || [],
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.04 },
        '-=0.2'
      );
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="space-y-6 2xl:space-y-8">
      {/* Header Strip */}
      <div
        ref={headerRef}
        className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
      >
        <div>
          <h2 className="font-serif text-2xl font-normal tracking-tight text-[#303030] sm:text-2xl md:text-3xl 2xl:text-4xl">
            Alumni Network <span className="italic text-[#E85D04]">&amp; CMS</span>
          </h2>
          <p className="mt-1 font-sans text-xs text-[#707884] sm:text-xs md:text-sm 2xl:text-base">
            Approve alumni registrations, search/filter/sort by any detail, launch reunions, post career opportunities &amp; news, moderate nested replies, and inspect alumni activity logs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchOverview(true)}
          disabled={isRefreshing || isLoading}
          className="flex items-center gap-1.5 rounded-xl border border-[#E6E2D8] bg-[#FFFFFF] px-4 py-2 font-sans text-xs text-[#707884] transition-all hover:border-[#D5CEBF] hover:bg-[#F7F5F0] hover:text-[#303030] disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${
              isRefreshing ? 'animate-spin text-[#E85D04]' : ''
            }`}
          />
          <span>{isRefreshing ? 'Syncing...' : 'Sync Alumni CMS'}</span>
        </button>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800 sm:text-sm">
          <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Telemetry Stats Grid */}
      <AlumniStatsGrid
        ref={statsGridRef}
        alumni={alumni}
        updates={updates}
        activities={activities}
        isLoading={isLoading}
      />

      {/* Module Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-[#E6E2D8] bg-[#FFFFFF] p-2 shadow-xs">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-sans text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#303030] text-[#F7F5F0] shadow-xs'
                  : 'text-[#707884] hover:bg-[#F7F5F0] hover:text-[#303030]'
              }`}
            >
              <Icon
                className={`h-4 w-4 ${
                  isActive ? 'text-[#E85D04]' : 'text-[#707884]'
                }`}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      {activeTab === 'directory' && (
        <AlumniDirectoryTab
          alumni={alumni}
          setAlumni={setAlumni}
          onRefresh={() => fetchOverview(true)}
        />
      )}

      {activeTab === 'updates' && (
        <AlumniUpdatesTab
          updates={updates}
          setUpdates={setUpdates}
          onRefresh={() => fetchOverview(true)}
        />
      )}

      {activeTab === 'testimonials' && (
        <AlumniTestimonialsTab
          testimonials={testimonials}
          setTestimonials={setTestimonials}
          onRefresh={() => fetchOverview(true)}
        />
      )}

      {activeTab === 'activity' && (
        <AlumniActivityTab
          activities={activities}
          setActivities={setActivities}
        />
      )}

      {activeTab === 'cms' && (
        <AlumniPageCmsTab config={config} setConfig={setConfig} />
      )}
    </div>
  );
}