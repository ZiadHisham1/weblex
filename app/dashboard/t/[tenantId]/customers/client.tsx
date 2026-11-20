// app/dashboard/t/[tenantId]/customers/client.tsx
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, User, ChevronDown, X, Loader2, Upload, Download } from 'lucide-react';
import Link from 'next/link';
import { CustomersIcon } from '@/components/icons/CustomersIcon';

type Customer = {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  addresses?: any[];
  has_account?: boolean;
  created_at: string;
};

export function CustomersClient({
  tenantId,
  initialCustomers,
  error,
  provisioning,
}: {
  tenantId: string;
  initialCustomers: Customer[];
  error: string | null;
  provisioning: boolean;
}) {
  const router = useRouter();
  
  // Search state
  const [search, setSearch] = useState('');

  // Add Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Filter customers based on search term
  const filteredCustomers = initialCustomers.filter((c) => {
    const fullName = `${c.first_name ?? ''} ${c.last_name ?? ''}`.toLowerCase();
    const searchLower = search.toLowerCase();
    return fullName.includes(searchLower) || (c.email ?? '').toLowerCase().includes(searchLower);
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/t/${tenantId}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 👇 Send phone in the payload
        body: JSON.stringify({ email, firstName, lastName, phone }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setFormError(body.error ?? `Failed (${res.status})`);
        return;
      }

      // Reset & close
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setIsModalOpen(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export CSV
  const handleExport = () => {
    if (initialCustomers.length === 0) return;
    
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Location', 'Orders', 'Spent'];
    const rows = initialCustomers.map((c) => {
      const name = `${c.first_name ?? ''},${c.last_name ?? ''}`;
      const addr = c.addresses?.find((a: any) => a.is_default_shipping) || c.addresses?.[0];
      const loc = addr ? `${addr.city ?? ''} ${addr.country_code ?? ''}`.trim() : '';
      return [name, c.email ?? '', c.phone ?? '', loc, 0, 0].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'customers_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import CSV
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim() !== '');
        // Parse: First Name, Last Name, Email, Phone
        const customersToImport = lines.slice(1).map(line => {
          const [firstName, lastName, email, phone] = line.split(',').map(s => s.trim());
          return { firstName, lastName, email, phone};
        }).filter(c => c.email);

        const res = await fetch(`/api/t/${tenantId}/customers/import`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customers: customersToImport }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        alert(`Successfully imported ${data.count} customers.`);
        router.refresh();
      } catch (err: any) {
        alert(`Import failed: ${err.message}`);
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const formatCurrency = (amount: number, currencyCode: string = 'EGP') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode.toUpperCase(),
    }).format(amount);
  };

  return (
    <div className="mx-auto  space-y-4">
      {/* Header & Actions */}
      <header className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CustomersIcon className='w-5 h-5' />
          <h1 className="text-xl font-semibold text-gray-900">Customers</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="px-4 py-1.5 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors bg-white flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="px-4 py-1.5 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors bg-white flex items-center gap-2 disabled:opacity-50"
          >
            {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {isImporting ? 'Importing...' : 'Import'}
          </button>
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />

          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-1.5 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Add customer
          </button>
        </div>
      </header>

      {/* Segment Filter */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm cursor-text group">
        <span className="text-sm text-gray-400 group-hover:text-gray-500 transition-colors">
          Describe your segment
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search customers" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm outline-none placeholder:text-gray-400 bg-transparent"
          />
        </div>
        <button className="p-1.5 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-500">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* States */}
      {provisioning && (
        <div className="rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-sm text-blue-700">
          Your store is being set up. This takes about 10 seconds. Refresh to check.
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      {!provisioning && !error && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-sm">
                {search ? 'No customers match your search.' : 'No customers found.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="text-gray-500 border-b border-gray-200 bg-gray-50/50">
                  <tr>
                    <th className="px-4 py-3 font-normal w-12">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </th>
                    <th className="px-4 py-3 font-normal w-1/5">Customer name</th>
                    {/* 👇 Added Phone Header */}
                    <th className="px-4 py-3 font-normal w-1/5">Phone</th> 
                    <th className="px-4 py-3 font-normal text-center">Email subscription</th>
                    <th className="px-4 py-3 font-normal">Location</th>
                    <th className="px-4 py-3 font-normal text-center">Orders</th>
                    <th className="px-4 py-3 font-normal text-right">Amount spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCustomers.map((customer) => {
                    const fullName = `${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim() || customer.email || 'Unknown Customer';
                    
                    const address = customer.addresses?.find((a: any) => a.is_default_shipping) || customer.addresses?.[0];
                    const location = address 
                      ? `${address.city || ''}, ${address.country_code?.toUpperCase() || ''}`.replace(/^, |, $/g, '')
                      : '';

                    const orderCount = 0; // Mocked
                    const amountSpent = 0; // Mocked

                    return (
                      <tr key={customer.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-4 py-3">
                          <input type="checkbox" className="rounded border-gray-300" />
                        </td>
                        
                        <td className="px-4 py-3">
                          <Link 
                            href={`/dashboard/t/${tenantId}/customers/${customer.id}`}
                            className="font-medium text-gray-900 hover:underline"
                          >
                            {fullName}
                          </Link>
                        </td>

                        {/* 👇 Display Phone */}
                        <td className="px-4 py-3 text-gray-600">
                          {customer.phone || '-'}
                        </td>
                        
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[11px] font-medium border border-gray-200">
                            Not subscribed
                          </span>
                        </td>
                        
                        <td className="px-4 py-3 text-gray-600">
                          {location}
                        </td>
                        
                        <td className="px-4 py-3 text-gray-600 text-center font-medium">
                          {orderCount}
                        </td>
                        
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          {formatCurrency(amountSpent, 'EGP')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-gray-900">Add Customer</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              {formError && (
                <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Saving…' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}