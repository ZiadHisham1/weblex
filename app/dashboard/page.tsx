import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { connection } from 'next/server';

export default async function DashboardHome() {
  await connection();

  const session = await getSession();
  if (!session) redirect('/login?next=/dashboard');

  const tenants = await prisma.tenant.findMany({
    where: {
      deletedAt: null,
      members: { some: { userId: session.user.id } },
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, subdomain: true, siteType: true },
  });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Your sites</h1>
          <p className="mt-2 text-gray-600">Signed in as {session.user.email}</p>
        </div>
        <Link
          href="/signup"
          className="py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm"
        >
          Create new
        </Link>
      </header>

      {tenants.length === 0 && (
        <p className="text-gray-500">No sites yet. Create one to get started.</p>
      )}

      <div className="flex flex-col gap-3">
        {tenants.map((t) => (
          <Link
            key={t.id}
            href={`/dashboard/t/${t.id}`}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div>
              <h3 className="font-semibold text-gray-900">{t.name}</h3>
              <p className="text-sm text-gray-500">{t.subdomain}</p>
            </div>
            <span className="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-gray-700">
              {t.siteType.toLowerCase()}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}