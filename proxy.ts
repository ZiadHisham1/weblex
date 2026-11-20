import { NextRequest, NextResponse } from 'next/server';

const RAW_ROOT = process.env.ROOT_DOMAIN || 'localhost:3000';
const ROOT_DOMAIN = RAW_ROOT.split(':')[0];

const PASSTHROUGH = [
  '/dashboard', '/api', '/login', '/signup',
  '/_next', '/favicon', '/robots.txt', '/sitemap', '/uploads'
];

const isPassthrough = (p: string) =>
  PASSTHROUGH.some((x) => p === x || p.startsWith(x + '/'));

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  if (isPassthrough(pathname)) return NextResponse.next();

  const host = (req.headers.get('host') ?? '').toLowerCase().split(':')[0];
  
  if (host.match(/^\d+\.\d+\.\d+\.\d+$/) || host === ROOT_DOMAIN || host === `www.${ROOT_DOMAIN}`) {
    return NextResponse.next();
  }

  let tenantKey: string | null = null;

  if (host.endsWith('.nip.io')) {
    tenantKey = host.split('.')[0];
  }
  else if (host.endsWith('.localhost') || host.endsWith('.lvh.me')) {
    tenantKey = host.split('.')[0];
  } 
  else if (host.endsWith('.' + ROOT_DOMAIN)) {
    tenantKey = host.slice(0, -(ROOT_DOMAIN.length + 1));
  } 
  else {
    tenantKey = host;
  }

  if (!tenantKey) return NextResponse.next();

  // 👇 NEW: If the URL explicitly contains /sites/tenantKey, redirect to the clean URL
  if (pathname.startsWith(`/sites/${tenantKey}`)) {
    const cleanPath = pathname.replace(`/sites/${tenantKey}`, '') || '/';
    const url = req.nextUrl.clone();
    url.pathname = cleanPath;
    return NextResponse.redirect(url);
  }

  // Otherwise, rewrite the clean URL to the internal route
  const url = req.nextUrl.clone();
  url.pathname = `/sites/${tenantKey}${pathname === '/' ? '' : pathname}`;
  
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|uploads|favicon.ico).*)'],
};