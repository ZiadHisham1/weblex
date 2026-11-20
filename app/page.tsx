import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Home from './home-client';

export default async function RootPage() {
  const headersList = await headers();
  const host = (headersList.get('host') || '').toLowerCase();
  const hostname = host.split(':')[0];

  if (hostname.endsWith('.localhost') || hostname.endsWith('.lvh.me')) {
    const subdomain = hostname.replace('.localhost', '');
    // Redirect to the catch-all with a trailing slash
    redirect(`/_sites/${subdomain}/`);
  }

  return <Home />;
}