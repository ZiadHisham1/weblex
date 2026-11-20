// app/dashboard/t/[tenantId]/settings/settings-form.tsx
'use client';

import { useState } from 'react';
import { updateTenantSettings } from './actions';

const FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 
  'Poppins', 'Playfair Display', 'Merriweather', 'Oswald', 'Raleway'
];

export function SettingsForm({
  tenantId,
  initialName,
  initialPrimary,
  initialAccent,
  initialFont,
  // 👇 Add these props
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
  
  // Welcome Bar State
  const [welcomeBarType, setWelcomeBarType] = useState(initialWelcomeBarType || 'none');
  const [welcomeBarData, setWelcomeBarData] = useState(
    initialWelcomeBarData || { bgColor: '#000000', textColor: '#ffffff', text: 'Welcome to our store!', texts: ['Welcome!', 'Free shipping over $50'] }
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateTenantSettings(tenantId, { 
        name, 
        primaryColor, 
        accentColor, 
        fontFamily,
        welcomeBarType,
        welcomeBarData
      });
      setMessage('Settings saved successfully!');
    } catch (err: any) {
      setMessage(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border shadow-sm max-w-2xl">
      {/* ... Existing Name & Colors fields ... */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {/* 👇 Welcome Bar Settings Section */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-4">Welcome Bar</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={welcomeBarType}
              onChange={(e) => setWelcomeBarType(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
            >
              <option value="none">None</option>
              <option value="bar1">Static Bar</option>
              <option value="bar2">Rotating Texts Bar</option>
            </select>
          </div>

          {welcomeBarType !== 'none' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                  <input
                    type="color"
                    value={welcomeBarData.bgColor}
                    onChange={(e) => setWelcomeBarData({ ...welcomeBarData, bgColor: e.target.value })}
                    className="h-9 w-full p-1 rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                  <input
                    type="color"
                    value={welcomeBarData.textColor}
                    onChange={(e) => setWelcomeBarData({ ...welcomeBarData, textColor: e.target.value })}
                    className="h-9 w-full p-1 rounded border border-gray-300"
                  />
                </div>
              </div>

              {welcomeBarType === 'bar1' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
                  <input
                    type="text"
                    value={welcomeBarData.text}
                    onChange={(e) => setWelcomeBarData({ ...welcomeBarData, text: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              )}

              {welcomeBarType === 'bar2' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rotating Texts (Comma separated)</label>
                  <input
                    type="text"
                    value={welcomeBarData.texts?.join(', ')}
                    onChange={(e) => setWelcomeBarData({ ...welcomeBarData, texts: e.target.value.split(',').map(t => t.trim()) })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {message && (
        <div className={`rounded-md px-3 py-2 text-sm ${message.includes('success') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} border`}>
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="bg-black text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save Settings'}
      </button>
    </form>
  );
}