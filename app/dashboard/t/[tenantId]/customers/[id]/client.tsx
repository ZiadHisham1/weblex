// app/dashboard/t/[tenantId]/customers/[id]/client.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save, Loader2, User, Mail, Phone } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';

export function CustomerDetailClient({
  tenantId,
  customer,
  customerIcon,
}: {
  tenantId: string;
  customer: any;
  customerIcon: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState(customer.first_name || '');
  const [lastName, setLastName] = useState(customer.last_name || '');
  const [email, setEmail] = useState(customer.email || '');
  const [phone, setPhone] = useState(customer.phone || '');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/t/${tenantId}/customers/${customer.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update customer');

      // 👇 Force absolute redirect back to list
      window.location.href = `/dashboard/t/${tenantId}/customers`;
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto pb-20">
      {/* Header */}
      <header className="flex items-center justify-between mb-6 pb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href={`/dashboard/t/${tenantId}/customers`} className="hover:text-black shadow-md px-2 border border-gray-200 rounded-full flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> 
            <Icon svg={customerIcon} 
                strokeWidth={1.5}
                className={[
                    'shrink-0 self-start w-4 h-4 mt-2 mb-2 me-2 md:mt-1 md:mb-1',
                    '[&_svg]:w-full [&_svg]:h-full [&_svg]:block',
                    'transition-opacity duration-150',
                    'text-black opacity-100',
                ].join(' ')}
            />
          </Link>
          <span className="text-gray-300"> <span className='px-2 text-black font-semibold'>Customer</span> /</span>
          <span className="text-gray-900 font-medium">
            #{customer.id.slice(-10)}
          </span>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white text-sm font-medium px-4 py-1.5 rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
          {error}
        </div>
      )}

      <div className='flex justify-center'>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden w-[100%]">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Edit Customer</h1>
          
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Identity Section */}
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" /> Identity
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">First name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Last name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Contact Section */}
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" /> Contact
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Email address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Phone number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
}