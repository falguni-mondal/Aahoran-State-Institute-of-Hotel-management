import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  PhoneCall,
  RefreshCw,
  Save,
  Plus,
  Trash2,
  Loader2,
  ShieldAlert,
  CheckCircle2,
  MapPin,
  Mail,
  Compass,
} from 'lucide-react';
import apiClient from '../api/axios.js';

const ICON_TYPES = [
  { value: 'flight', label: 'Airport / Flight Path' },
  { value: 'rail', label: 'Railway / Track' },
  { value: 'node', label: 'City Hub / Node' },
  { value: 'urban', label: 'Bus Stand / Urban Route' },
  { value: 'curve', label: 'Transit / Curve Path' },
];

export default function ManageContact() {
  const [formData, setFormData] = useState({
    generalEmail: 'sihmdurgapur@gmail.com',
    primaryPhone: '+91 892 759 6669',
    whatsappNumber: '918927596669',
    officeHours: '(Mon - Fri: 9AM - 5PM) except Public Holidays',
    secondaryPhone: '0343-2500775',
    additionalPhonesText: '',
    placementEmail: 'tpocell.sihmdgp@gmail.com',
    placementLabel: 'Placement',
    address:
      'State Institute of Hotel Management,\nFuljhore, Durgapur - 713206\nWest Bengal, India.',
    mapDirectionsUrl:
      'https://www.google.com/maps?q=23.54757943246294,87.33992374149645',
    mapEmbedUrl:
      'https://maps.google.com/maps?q=23.54757943246294,87.33992374149645&z=16&output=embed',
    distances: [
      { title: 'Kazi Nazrul Islam Airport', distance: '24.6 km', type: 'flight' },
      { title: 'Durgapur Railway Station', distance: '11.7 km', type: 'rail' },
      { title: 'Benachity Prantika', distance: '8.6 km', type: 'node' },
      { title: 'Durgapur City Center Bus Stand', distance: '7.8 km', type: 'urban' },
      { title: 'Muchipara Bus Stand', distance: '6.9 km', type: 'curve' },
    ],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const contentRef = useRef(null);

  const fetchContactConfig = useCallback(async (manualSync = false) => {
    if (manualSync) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await apiClient.get('/contact/admin');
      if (response.data?.status === 'success' && response.data.contact) {
        const c = response.data.contact;
        setFormData({
          generalEmail: c.generalEmail || '',
          primaryPhone: c.primaryPhone || '',
          whatsappNumber: c.whatsappNumber || '',
          officeHours: c.officeHours || '',
          secondaryPhone: c.secondaryPhone || '',
          additionalPhonesText: Array.isArray(c.additionalPhones)
            ? c.additionalPhones.join('\n')
            : '',
          placementEmail: c.placementEmail || '',
          placementLabel: c.placementLabel || 'Placement',
          address: c.address || '',
          mapDirectionsUrl: c.mapDirectionsUrl || '',
          mapEmbedUrl: c.mapEmbedUrl || '',
          distances:
            Array.isArray(c.distances) && c.distances.length > 0
              ? c.distances.map((d) => ({
                  title: d.title || '',
                  distance: d.distance || '',
                  type: d.type || 'node',
                }))
              : [],
        });
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
          'Failed to load Contact Page configuration.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchContactConfig(false);
  }, [fetchContactConfig]);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.38 }
      ).fromTo(
        contentRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.38 },
        '-=0.15'
      );
    },
    { scope: containerRef }
  );

  const handleAddDistance = () => {
    setFormData((prev) => ({
      ...prev,
      distances: [
        ...prev.distances,
        { title: '', distance: '', type: 'node' },
      ],
    }));
  };

  const handleRemoveDistance = (idx) => {
    setFormData((prev) => ({
      ...prev,
      distances: prev.distances.filter((_, i) => i !== idx),
    }));
  };

  const handleDistanceChange = (idx, field, value) => {
    setFormData((prev) => ({
      ...prev,
      distances: prev.distances.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      const payload = {
        generalEmail: formData.generalEmail.trim(),
        primaryPhone: formData.primaryPhone.trim(),
        whatsappNumber:
          formData.whatsappNumber.replace(/[^0-9]/g, '') ||
          formData.primaryPhone.replace(/[^0-9]/g, ''),
        officeHours: formData.officeHours.trim(),
        secondaryPhone: formData.secondaryPhone.trim(),
        additionalPhones: formData.additionalPhonesText
          .split('\n')
          .map((p) => p.trim())
          .filter(Boolean),
        placementEmail: formData.placementEmail.trim(),
        placementLabel: formData.placementLabel.trim() || 'Placement',
        address: formData.address.trim(),
        mapDirectionsUrl: formData.mapDirectionsUrl.trim(),
        mapEmbedUrl: formData.mapEmbedUrl.trim(),
        distances: formData.distances.filter(
          (d) => d.title.trim() && d.distance.trim()
        ),
      };

      const response = await apiClient.put('/contact', payload);
      if (response.data?.status === 'success') {
        setSuccessMessage(
          'Contact page details updated and published live to the client website.'
        );
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
          'Failed to update contact details. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div ref={containerRef} className="space-y-6 2xl:space-y-8">
      {/* Top Header Strip */}
      <div
        ref={headerRef}
        className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
      >
        <div>
          <h2 className="font-serif text-2xl font-normal tracking-tight text-[#303030] sm:text-2xl md:text-3xl 2xl:text-4xl">
            Contact <span className="italic text-[#E85D04]">Page CMS</span>
          </h2>
          <p className="mt-1 font-sans text-xs text-[#707884] sm:text-xs md:text-sm 2xl:text-base">
            Update emails, phone numbers, WhatsApp links, campus address, Google Maps embed, and proximity landmarks.
          </p>
        </div>

        <div className="flex w-full items-center justify-end gap-2.5 sm:w-auto sm:gap-3">
          <button
            type="button"
            onClick={() => fetchContactConfig(true)}
            disabled={isRefreshing || isLoading || isSaving}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#E6E2D8] bg-[#FFFFFF] px-3.5 py-2 font-sans text-xs text-[#707884] transition-all hover:border-[#D5CEBF] hover:bg-[#F7F5F0] hover:text-[#303030] disabled:opacity-50 sm:flex-initial sm:text-xs md:text-sm 2xl:px-4 2xl:py-2.5 2xl:text-base"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                isRefreshing ? 'animate-spin text-[#E85D04]' : ''
              }`}
            />
            <span>{isRefreshing ? 'Syncing...' : 'Reset / Sync'}</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving || isLoading}
            className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#303030] px-4 py-2 font-sans text-xs font-medium uppercase tracking-wider text-[#F7F5F0] transition-all hover:bg-[#E85D04] disabled:opacity-50 sm:flex-initial sm:text-xs md:text-sm 2xl:px-5 2xl:py-2.5 2xl:text-base"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800 sm:text-sm">
          <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-800 sm:text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      <form
        ref={contentRef}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* 1. Direct Lines & General Inquiry + Placement Desk */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#E6E2D8] bg-[#FFFFFF] p-5 shadow-[0_10px_30px_rgba(48,48,48,0.03)] sm:p-6">
            <div className="mb-4 flex items-center gap-2.5 border-b border-[#E6E2D8] pb-3">
              <PhoneCall className="h-4 w-4 text-[#E85D04]" />
              <h3 className="font-serif text-lg text-[#303030]">
                Direct Lines &amp; General Inquiry
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                  General Inquiry Email
                </label>
                <input
                  type="email"
                  value={formData.generalEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, generalEmail: e.target.value })
                  }
                  placeholder="sihmdurgapur@gmail.com"
                  className="mt-1.5 w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 text-xs text-[#303030] outline-none focus:border-[#E85D04] focus:bg-[#FFFFFF] sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                    Primary Phone (Display)
                  </label>
                  <input
                    type="text"
                    value={formData.primaryPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, primaryPhone: e.target.value })
                    }
                    placeholder="+91 892 759 6669"
                    className="mt-1.5 w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 text-xs text-[#303030] outline-none focus:border-[#E85D04] focus:bg-[#FFFFFF] sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                    WhatsApp Number (Digits Only)
                  </label>
                  <input
                    type="text"
                    value={formData.whatsappNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        whatsappNumber: e.target.value,
                      })
                    }
                    placeholder="918927596669"
                    className="mt-1.5 w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 font-mono text-xs text-[#303030] outline-none focus:border-[#E85D04] focus:bg-[#FFFFFF] sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                    Secondary / Landline Phone
                  </label>
                  <input
                    type="text"
                    value={formData.secondaryPhone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        secondaryPhone: e.target.value,
                      })
                    }
                    placeholder="0343-2500775"
                    className="mt-1.5 w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 text-xs text-[#303030] outline-none focus:border-[#E85D04] focus:bg-[#FFFFFF] sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                    Office Hours Note
                  </label>
                  <input
                    type="text"
                    value={formData.officeHours}
                    onChange={(e) =>
                      setFormData({ ...formData, officeHours: e.target.value })
                    }
                    placeholder="(Mon - Fri: 9AM - 5PM) except Public Holidays"
                    className="mt-1.5 w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 text-xs text-[#303030] outline-none focus:border-[#E85D04] focus:bg-[#FFFFFF] sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                  Additional Phone Numbers (Optional, one per line)
                </label>
                <textarea
                  rows={2}
                  value={formData.additionalPhonesText}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      additionalPhonesText: e.target.value,
                    })
                  }
                  placeholder="Optional extra helpline numbers"
                  className="mt-1.5 w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 p-3 text-xs text-[#303030] outline-none focus:border-[#E85D04] focus:bg-[#FFFFFF] sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Placement Desk & Campus Location */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#E6E2D8] bg-[#FFFFFF] p-5 shadow-[0_10px_30px_rgba(48,48,48,0.03)] sm:p-6">
              <div className="mb-4 flex items-center gap-2.5 border-b border-[#E6E2D8] pb-3">
                <Mail className="h-4 w-4 text-[#E85D04]" />
                <h3 className="font-serif text-lg text-[#303030]">
                  Placement Desk
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                    Desk Label
                  </label>
                  <input
                    type="text"
                    value={formData.placementLabel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        placementLabel: e.target.value,
                      })
                    }
                    placeholder="Placement"
                    className="mt-1.5 w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 text-xs text-[#303030] outline-none focus:border-[#E85D04] focus:bg-[#FFFFFF] sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                    Placement Desk Email
                  </label>
                  <input
                    type="email"
                    value={formData.placementEmail}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        placementEmail: e.target.value,
                      })
                    }
                    placeholder="tpocell.sihmdgp@gmail.com"
                    className="mt-1.5 w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 text-xs text-[#303030] outline-none focus:border-[#E85D04] focus:bg-[#FFFFFF] sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E6E2D8] bg-[#FFFFFF] p-5 shadow-[0_10px_30px_rgba(48,48,48,0.03)] sm:p-6">
              <div className="mb-4 flex items-center gap-2.5 border-b border-[#E6E2D8] pb-3">
                <MapPin className="h-4 w-4 text-[#E85D04]" />
                <h3 className="font-serif text-lg text-[#303030]">
                  Campus Location &amp; Google Maps
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                    Full Campus Address
                  </label>
                  <textarea
                    rows={3}
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="mt-1.5 w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 p-3 text-xs text-[#303030] outline-none focus:border-[#E85D04] focus:bg-[#FFFFFF] sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                    Google Maps &ldquo;Get Directions&rdquo; Link
                  </label>
                  <input
                    type="url"
                    value={formData.mapDirectionsUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mapDirectionsUrl: e.target.value,
                      })
                    }
                    className="mt-1.5 w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2 text-xs text-[#303030] outline-none focus:border-[#E85D04] focus:bg-[#FFFFFF]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                    Google Maps Embed Iframe URL
                  </label>
                  <input
                    type="url"
                    value={formData.mapEmbedUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, mapEmbedUrl: e.target.value })
                    }
                    className="mt-1.5 w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2 text-xs text-[#303030] outline-none focus:border-[#E85D04] focus:bg-[#FFFFFF]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Proximity & Connectivity Landmarks */}
        <div className="rounded-2xl border border-[#E6E2D8] bg-[#FFFFFF] p-5 shadow-[0_10px_30px_rgba(48,48,48,0.03)] sm:p-6">
          <div className="mb-4 flex flex-col justify-between gap-3 border-b border-[#E6E2D8] pb-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5">
              <Compass className="h-4 w-4 text-[#E85D04]" />
              <div>
                <h3 className="font-serif text-lg text-[#303030]">
                  Proximity &amp; Connectivity Landmarks
                </h3>
                <p className="text-[11px] text-[#707884]">
                  Manage distance cards displayed in the Proximity section of the Contact page.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddDistance}
              className="inline-flex items-center gap-1.5 self-start rounded-xl border border-[#E6E2D8] bg-[#F7F5F0] px-3 py-1.5 text-xs font-medium text-[#303030] hover:border-[#E85D04] hover:text-[#E85D04] sm:self-auto"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Landmark</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {formData.distances.map((item, idx) => (
              <div
                key={`dist-${idx}`}
                className="flex flex-col gap-3 rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/40 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold uppercase text-[#707884]">
                    Landmark #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDistance(idx)}
                    className="rounded-lg p-1 text-[#707884] hover:bg-rose-50 hover:text-rose-600"
                    title="Remove landmark"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#707884]">
                    Landmark Name
                  </label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) =>
                      handleDistanceChange(idx, 'title', e.target.value)
                    }
                    placeholder="e.g. Durgapur Railway Station"
                    className="mt-1 w-full rounded-lg border border-[#E6E2D8] bg-[#FFFFFF] px-3 py-2 text-xs text-[#303030] outline-none focus:border-[#E85D04]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#707884]">
                      Distance
                    </label>
                    <input
                      type="text"
                      value={item.distance}
                      onChange={(e) =>
                        handleDistanceChange(idx, 'distance', e.target.value)
                      }
                      placeholder="e.g. 11.7 km"
                      className="mt-1 w-full rounded-lg border border-[#E6E2D8] bg-[#FFFFFF] px-3 py-2 text-xs text-[#303030] outline-none focus:border-[#E85D04]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#707884]">
                      SVG Icon Style
                    </label>
                    <select
                      value={item.type || 'node'}
                      onChange={(e) =>
                        handleDistanceChange(idx, 'type', e.target.value)
                      }
                      className="mt-1 w-full rounded-lg border border-[#E6E2D8] bg-[#FFFFFF] px-2.5 py-2 text-xs text-[#303030] outline-none focus:border-[#E85D04]"
                    >
                      {ICON_TYPES.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}