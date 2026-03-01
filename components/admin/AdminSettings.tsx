import React, { useState } from 'react';
import { Bell, Save, CheckCircle2 } from 'lucide-react';
import { DEFAULT_ADMIN_SETTINGS, AdminSettings as AdminSettingsType } from '../../lib/adminData';
import { T, Button, SectionHeading } from '../UIElements';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<AdminSettingsType>(DEFAULT_ADMIN_SETTINGS);
  const [saved, setSaved] = useState(false);

  const update = (key: keyof AdminSettingsType, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value, updated_at: new Date().toISOString() }));
    setSaved(false);
  };

  const handleSave = () => {
    // In production: upsert to Supabase `admin_settings` table where id = 1
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <SectionHeading title="Settings" subtitle="Platform-wide configuration" />

      {/* Urgent Banner */}
      <div
        className="rounded-sm overflow-hidden"
        style={{ background: T.surface, border: `1px solid ${T.border}` }}
      >
        <div
          className="px-7 py-5 flex items-center gap-3"
          style={{ borderBottom: `1px solid ${T.border}` }}
        >
          <div
            className="w-8 h-8 rounded-sm flex items-center justify-center"
            style={{ background: T.goldFaint, border: `1px solid ${T.gold}30` }}
          >
            <Bell size={14} style={{ color: T.gold }} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: T.text }}>
              Urgent Banner
            </p>
            <p className="text-[9px]" style={{ color: T.textDim }}>
              Displays a highlighted message at the top of the investor portal
            </p>
          </div>
        </div>

        <div className="px-7 py-6 space-y-6">
          {/* Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: T.textSub }}>
                Enable Banner
              </p>
              <p className="text-[9px] mt-0.5" style={{ color: T.textDim }}>
                When enabled, the banner message is shown to all logged-in investors
              </p>
            </div>
            <button
              onClick={() => update('urgent_banner_enabled', !settings.urgent_banner_enabled)}
              className="relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
              style={{
                background: settings.urgent_banner_enabled ? T.gold : T.border,
              }}
            >
              <span
                className="absolute top-1 w-4 h-4 rounded-full transition-all duration-200"
                style={{
                  background: settings.urgent_banner_enabled ? '#000' : T.textDim,
                  left: settings.urgent_banner_enabled ? '28px' : '4px',
                }}
              />
            </button>
          </div>

          {/* Banner text */}
          <div className="space-y-2">
            <label
              className="block text-[10px] font-bold uppercase tracking-widest"
              style={{ color: T.textSub }}
            >
              Banner Message
            </label>
            <textarea
              value={settings.urgent_banner_text}
              onChange={(e) => update('urgent_banner_text', e.target.value)}
              rows={3}
              placeholder="e.g. Your 2023 Form 1099 is now available in the Documents section."
              style={{
                background: T.raised,
                border: `1px solid ${T.border}`,
                color: T.text,
                opacity: settings.urgent_banner_enabled ? 1 : 0.5,
              }}
              className="w-full rounded-sm px-4 py-3 text-sm outline-none resize-none transition-all focus:border-amber-500/60 placeholder:text-slate-700"
              disabled={!settings.urgent_banner_enabled}
            />
            <p className="text-[9px]" style={{ color: T.textDim }}>
              Suggested: "Your 2023 Form 1099 is now available." · "New deals are live on the platform." · "Q3 distributions have been processed."
            </p>
          </div>

          {/* Live preview */}
          {settings.urgent_banner_enabled && settings.urgent_banner_text && (
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: T.textDim }}>
                Preview
              </p>
              <div
                className="px-5 py-3 rounded-sm flex items-start gap-3"
                style={{ background: T.goldFaint, border: `1px solid ${T.gold}40` }}
              >
                <Bell size={14} style={{ color: T.gold, marginTop: 1, flexShrink: 0 }} />
                <p className="text-xs font-medium leading-relaxed" style={{ color: T.text }}>
                  {settings.urgent_banner_text}
                </p>
              </div>
            </div>
          )}
        </div>

        <div
          className="px-7 py-4 flex items-center justify-between"
          style={{ borderTop: `1px solid ${T.border}`, background: T.raised }}
        >
          <p className="text-[9px]" style={{ color: T.textDim }}>
            Last updated: {new Date(settings.updated_at).toLocaleString()}
          </p>
          <Button size="sm" onClick={handleSave}>
            {saved ? (
              <>
                <CheckCircle2 size={12} style={{ color: T.jade }} />
                Saved!
              </>
            ) : (
              <>
                <Save size={12} />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Placeholder for future settings */}
      <div
        className="p-7 rounded-sm"
        style={{ background: T.surface, border: `1px solid ${T.border}` }}
      >
        <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: T.textDim }}>
          More Settings
        </p>
        <div className="space-y-3">
          {[
            'Email notification preferences',
            'Platform maintenance mode',
            'New deal visibility controls',
            'Accreditation expiry reminders',
          ].map((label) => (
            <div
              key={label}
              className="flex items-center justify-between py-3 border-b last:border-b-0"
              style={{ borderColor: T.border }}
            >
              <p className="text-xs" style={{ color: T.textSub }}>{label}</p>
              <span
                className="px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest"
                style={{ background: T.raised, color: T.textDim }}
              >
                Coming Soon
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
