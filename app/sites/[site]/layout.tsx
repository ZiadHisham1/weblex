// app/sites/[site]/layout.tsx
import { prisma } from '@/lib/db';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import { resolveTheme, themeToCss } from '@/lib/theme';
import { getTenantBySite } from '@/lib/tenant';
import { CartButton } from '@/components/cart/CartButton';
import WelcomeBar1 from '@/components/blocks/WelcomeBars/welcomeBar-1';
import WelcomeBar2 from '@/components/blocks/WelcomeBars/welcomeBar-2';
import '@puckeditor/core/puck.css';

// Cache the tenant fetch under a tag so the settings action can invalidate it.
function getTenantCached(site: string) {
  return unstable_cache(
    () => getTenantBySite(site),
    ['tenant-by-site', site],
    { tags: [`tenant:${site}`] }, // simple per-site tag
  )();
}

export default async function TenantLayout({ children, params }: { children: React.ReactNode; params: Promise<{ site: string }> }) {
  const { site } = await params;
  const tenant = await getTenantBySite(site);
  if (!tenant) notFound();
  
  const theme = resolveTheme(tenant.themeTokens);
  
  // 👇 DEBUG: See exactly what colors are being calculated
  console.log("Resolved Theme:", theme);

  const fontName = (tenant.fontFamily || 'Inter').replace(/\s+/g, '+');
  const googleFontUrl = `https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;600;700&display=swap`;

  const welcomeBarType = tenant.welcomeBarType || 'none';
  const welcomeBarData = tenant.welcomeBarData as Record<string, any> || {};

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={googleFontUrl} rel="stylesheet" />
      
      {/* 👇 Inject the CSS variables */}
      <style dangerouslySetInnerHTML={{ __html: themeToCss(theme) }} />
      
      {/* 👇 Use min-h-screen and force the background color here */}
      <div
        className="min-h-screen"
        style={{
          ['--theme-font-body' as string]: `"${tenant.fontFamily || 'Inter'}", sans-serif`,
          ['--theme-font-heading' as string]: `"${tenant.fontFamily || 'Inter'}", sans-serif`,
          fontFamily: 'var(--theme-font-body)',
          
          // Force the background and color using fallbacks just in case
          backgroundColor: theme.primaryColor ? theme.primaryColor : '#ffffff',
          color: theme.accentColor ? theme.accentColor : '#000000', 
        }}
      >
        {/* Welcome Bar */}
        {welcomeBarType === 'bar1' && (
          <WelcomeBar1 
            bgColor={welcomeBarData.bgColor || '#000000'} 
            text_color={welcomeBarData.textColor || '#ffffff'} 
            welcome_txt={welcomeBarData.text || ''} 
          />
        )}
        
        {welcomeBarType === 'bar2' && (
          <WelcomeBar2 
            bgColor={welcomeBarData.bgColor || '#000000'} 
            text_color={welcomeBarData.textColor || '#ffffff'} 
            texts={welcomeBarData.texts || []} 
          />
        )}

        {children}
        
        {tenant?.umamiWebsiteId && (
          <Script
            async
            defer
            data-website-id={tenant.umamiWebsiteId}
            src="http://localhost:3001/script.js"
          />
        )}
        <CartButton />
      </div>
    </>
  );
}