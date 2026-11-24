'use client';

import { useState } from 'react';
import { updateTenantSettings } from './actions';
import {
  Store,
  Palette,
  Layout,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

const FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
  'Poppins', 'Playfair Display', 'Merriweather', 'Oswald', 'Raleway',
];

export function SettingsForm({
  tenantId,
  initialName,
  initialPrimary,
  initialAccent,
  initialFont,
  initialWelcomeBarType,
  initialWelcomeBarData,
}: {
  tenantId: string;
  initialName: string;
  initialPrimary: string;
  initialAccent: string;
  initialFont: string;
  initialWelcomeBarType: string;
  initialWelcomeBarData: any;
}) {
  const [name, setName] = useState(initialName);
  const [primaryColor, setPrimaryColor] = useState(initialPrimary);
  const [accentColor, setAccentColor] = useState(initialAccent);
  const [fontFamily, setFontFamily] = useState(initialFont || 'Inter');

  const [welcomeBarType, setWelcomeBarType] = useState(initialWelcomeBarType || 'none');
  const [welcomeBarData, setWelcomeBarData] = useState(
    initialWelcomeBarData || {
      bgColor: '#000000',
      textColor: '#ffffff',
      text: 'Welcome to our store!',
      texts: ['Welcome!', 'Free shipping over $50'],
    },
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateTenantSettings(tenantId, {
        name,
        themeTokens: { primaryColor, accentColor }, // 👈 matches resolveTheme input
        fontFamily,                                // 👈 goes to tenant.fontFamily
        welcomeBarType,
        welcomeBarData,
      });
      setMessage({ type: 'success', text: 'Settings saved successfully.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='flex justify-center'>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-[850px] w-full px-4 mt-10 pb-24 rounded-2xl overflow-hidden">
        {/* Store Details Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-gray-500" /> Store details
            </h2>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Store name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-shadow"
              />
              <p className="text-xs text-gray-500 mt-1.5">The name of your store as it appears on the dashboard and storefront.</p>
            </div>
          </div>
        </div>

        {/* Theme & Branding Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Palette className="w-4 h-4 text-gray-500" /> Theme & Branding
            </h2>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Typography</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-black outline-none"
              >
                {FONTS.map((font) => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Primary color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-10 p-1 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-mono uppercase"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Accent color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-10 w-10 p-1 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-mono uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Bar Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Layout className="w-4 h-4 text-gray-500" /> Welcome Bar
            </h2>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Display type</label>
              <select
                value={welcomeBarType}
                onChange={(e) => setWelcomeBarType(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-black outline-none"
              >
                <option value="none">Hidden</option>
                <option value="bar1">Static Announcement Bar</option>
                <option value="bar2">Rotating Texts Bar</option>
              </select>
            </div>

            {welcomeBarType !== 'none' && (
              <div className="space-y-5 pt-2 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Background Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={welcomeBarData.bgColor}
                        onChange={(e) => setWelcomeBarData({ ...welcomeBarData, bgColor: e.target.value })}
                        className="h-10 w-10 p-1 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={welcomeBarData.bgColor}
                        onChange={(e) => setWelcomeBarData({ ...welcomeBarData, bgColor: e.target.value })}
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-mono uppercase"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Text Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={welcomeBarData.textColor}
                        onChange={(e) => setWelcomeBarData({ ...welcomeBarData, textColor: e.target.value })}
                        className="h-10 w-10 p-1 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={welcomeBarData.textColor}
                        onChange={(e) => setWelcomeBarData({ ...welcomeBarData, textColor: e.target.value })}
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>

                {welcomeBarType === 'bar1' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Announcement Text</label>
                    <input
                      type="text"
                      value={welcomeBarData.text}
                      onChange={(e) => setWelcomeBarData({ ...welcomeBarData, text: e.target.value })}
                      placeholder="e.g. Free shipping on all orders over $50"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
                    />
                  </div>
                )}

                {welcomeBarType === 'bar2' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Rotating Texts</label>
                    <input
                      type="text"
                      value={welcomeBarData.texts?.join(', ')}
                      onChange={(e) =>
                        setWelcomeBarData({
                          ...welcomeBarData,
                          texts: e.target.value.split(',').map((t: string) => t.trim()),
                        })
                      }
                      placeholder="e.g. Free Shipping, New Arrivals, Sale 20% Off"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">Separate multiple messages with commas.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Save Bar */}
        <div className="fixed top-0 right-0 bg-transparent p-4 px-8 flex items-center justify-between z-30">
          <div>
            {message && (
              <div className={`flex items-center gap-2 text-sm font-medium ${message.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                {message.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                {message.text}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      </form>
    </div>
  );
}