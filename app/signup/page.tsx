'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { signupAction } from './actions';

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await signupAction(formData);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold">Weblex</Link>
          <h1 className="mt-4 text-xl font-semibold">Create your site</h1>
          <p className="mt-1 text-sm text-gray-600">Takes 30 seconds.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
            <input name="name" required maxLength={80} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="email" type="email" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input name="password" type="password" required minLength={8} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            <p className="mt-1 text-xs text-gray-500">Minimum 8 characters.</p>
          </div>

          <hr className="my-2 border-gray-200" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site name</label>
            <input name="siteName" required maxLength={80} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subdomain</label>
            <input name="subdomain" required pattern="[a-z0-9-]+" minLength={3} maxLength={40} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            <p className="mt-1 text-xs text-gray-500">Only lowercase letters, numbers, and hyphens.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site type</label>
            <select name="siteType" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="COMMERCE">Online store (products, orders)</option>
              <option value="SERVICE">Service business (bookings)</option>
              <option value="PORTFOLIO">Portfolio (projects, contact)</option>
            </select>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button type="submit" disabled={pending} className="w-full bg-black text-white py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
            {pending ? 'Creating your site…' : 'Create site'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account? <Link href="/login" className="underline">Sign in</Link>
          </p>
        </form>
      </div>
    </main>
  );
}