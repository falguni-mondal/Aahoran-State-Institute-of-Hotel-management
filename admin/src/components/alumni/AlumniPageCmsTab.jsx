import React, { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';
import apiClient from '../../api/axios.js';

export default function AlumniPageCmsTab({ config, setConfig }) {
  const [formState, setFormState] = useState({
    heroEyebrow: 'Global Hospitality Brotherhood & Sisterhood',
    heroTitleLine1: 'ALUMNI',
    heroTitleLine2: 'NETWORK',
    introHeading: 'Once a Student, Always a Part of SIHM Family',
    introParagraph1: '',
    introParagraph2: '',
    privacyNotice: '',
    stats: [],
    careerSectors: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveBanner, setSaveBanner] = useState(null);

  useEffect(() => {
    if (config) {
      setFormState({
        heroEyebrow: config.heroEyebrow || '',
        heroTitleLine1: config.heroTitleLine1 || 'ALUMNI',
        heroTitleLine2: config.heroTitleLine2 || 'NETWORK',
        introHeading:
          config.introHeading ||
          'Once a Student, Always a Part of SIHM Family',
        introParagraph1: config.introParagraph1 || '',
        introParagraph2: config.introParagraph2 || '',
        privacyNotice: config.privacyNotice || '',
        stats: Array.isArray(config.stats) ? config.stats : [],
        careerSectors: Array.isArray(config.careerSectors)
          ? config.careerSectors
          : [],
      });
    }
  }, [config]);

  const handleStatChange = (index, field, value) => {
    const updated = [...formState.stats];
    updated[index] = { ...updated[index], [field]: value };
    setFormState({ ...formState, stats: updated });
  };

  const handleSectorChange = (index, field, value) => {
    const updated = [...formState.careerSectors];
    updated[index] = { ...updated[index], [field]: value };
    setFormState({ ...formState, careerSectors: updated });
  };

  const handleSaveCms = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveBanner(null);

    try {
      const { data } = await apiClient.put('/alumni/admin/cms', formState);
      if (data?.config) {
        setConfig(data.config);
        setSaveBanner('Alumni Page CMS Configuration saved and published live!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save CMS settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSaveCms}
      className="rounded-2xl border border-[#E6E2D8] bg-[#FFFFFF] p-6 sm:p-8 shadow-[0_10px_30px_rgba(48,48,48,0.03)] space-y-6 text-xs sm:text-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E2D8] pb-4">
        <div>
          <h3 className="font-serif text-xl sm:text-2xl text-[#303030]">
            Alumni Page Introduction &amp; Sector Network CMS
          </h3>
          <p className="text-xs text-[#707884]">
            Customize the welcoming introduction, hero headlines, metrics, privacy policy, and the 11 Career &amp; Industry sectors.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-xl bg-[#303030] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#E85D04]"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{isSaving ? 'Saving CMS...' : 'Save Page CMS'}</span>
        </button>
      </div>

      {saveBanner && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{saveBanner}</span>
        </div>
      )}

      {/* Hero & Introduction Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884] mb-1">
            Hero Eyebrow
          </label>
          <input
            type="text"
            value={formState.heroEyebrow}
            onChange={(e) =>
              setFormState({ ...formState, heroEyebrow: e.target.value })
            }
            className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 outline-none focus:border-[#E85D04]"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884] mb-1">
            Hero Title Line 1
          </label>
          <input
            type="text"
            value={formState.heroTitleLine1}
            onChange={(e) =>
              setFormState({ ...formState, heroTitleLine1: e.target.value })
            }
            className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 outline-none focus:border-[#E85D04]"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884] mb-1">
            Hero Title Line 2
          </label>
          <input
            type="text"
            value={formState.heroTitleLine2}
            onChange={(e) =>
              setFormState({ ...formState, heroTitleLine2: e.target.value })
            }
            className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 outline-none focus:border-[#E85D04]"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884] mb-1">
          Section 1: Welcoming Introduction Heading
        </label>
        <input
          type="text"
          value={formState.introHeading}
          onChange={(e) =>
            setFormState({ ...formState, introHeading: e.target.value })
          }
          className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 outline-none focus:border-[#E85D04]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884] mb-1">
            Introduction Paragraph 1
          </label>
          <textarea
            rows={4}
            value={formState.introParagraph1}
            onChange={(e) =>
              setFormState({ ...formState, introParagraph1: e.target.value })
            }
            className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 p-3.5 outline-none focus:border-[#E85D04]"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884] mb-1">
            Introduction Paragraph 2
          </label>
          <textarea
            rows={4}
            value={formState.introParagraph2}
            onChange={(e) =>
              setFormState({ ...formState, introParagraph2: e.target.value })
            }
            className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 p-3.5 outline-none focus:border-[#E85D04]"
          />
        </div>
      </div>

      {/* Impact Stats Editor */}
      <div className="pt-4 border-t border-[#E6E2D8]">
        <h4 className="font-serif text-lg text-[#303030] mb-3">
          Impact Metrics Strip
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {formState.stats.map((st, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/40 p-3 space-y-2"
            >
              <input
                type="text"
                value={st.label}
                onChange={(e) => handleStatChange(idx, 'label', e.target.value)}
                placeholder="Label"
                className="w-full rounded-lg border border-[#E6E2D8] bg-white px-2.5 py-1.5 text-xs"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={st.value}
                  onChange={(e) =>
                    handleStatChange(idx, 'value', e.target.value)
                  }
                  placeholder="Value"
                  className="w-2/3 rounded-lg border border-[#E6E2D8] bg-white px-2.5 py-1.5 text-xs font-mono"
                />
                <input
                  type="text"
                  value={st.suffix}
                  onChange={(e) =>
                    handleStatChange(idx, 'suffix', e.target.value)
                  }
                  placeholder="+"
                  className="w-1/3 rounded-lg border border-[#E6E2D8] bg-white px-2.5 py-1.5 text-xs font-mono"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 11 Career Sectors Editor */}
      <div className="pt-4 border-t border-[#E6E2D8]">
        <h4 className="font-serif text-lg text-[#303030] mb-3">
          11 Alumni Career &amp; Industry Sectors
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formState.careerSectors.map((sec, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/40 p-4 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={sec.name}
                  onChange={(e) =>
                    handleSectorChange(idx, 'name', e.target.value)
                  }
                  className="flex-1 rounded-lg border border-[#E6E2D8] bg-white px-3 py-1.5 font-semibold text-xs"
                />
                <input
                  type="text"
                  value={sec.alumniCountLabel}
                  onChange={(e) =>
                    handleSectorChange(idx, 'alumniCountLabel', e.target.value)
                  }
                  className="w-28 rounded-lg border border-[#E6E2D8] bg-white px-2.5 py-1.5 text-xs font-mono"
                />
              </div>
              <input
                type="text"
                value={sec.tagline}
                onChange={(e) =>
                  handleSectorChange(idx, 'tagline', e.target.value)
                }
                placeholder="Sector Tagline"
                className="w-full rounded-lg border border-[#E6E2D8] bg-white px-3 py-1.5 text-xs"
              />
              <input
                type="text"
                value={sec.featuredCompanies}
                onChange={(e) =>
                  handleSectorChange(idx, 'featuredCompanies', e.target.value)
                }
                placeholder="Featured Brands / Hotels"
                className="w-full rounded-lg border border-[#E6E2D8] bg-white px-3 py-1.5 text-xs"
              />
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}