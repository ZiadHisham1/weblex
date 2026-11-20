// app/sites/[site]/layout.tsx
import { prisma } from '@/lib/db';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { resolveTheme, themeToCss } from '@/lib/theme';
import { getTenantBySite } from '@/lib/tenant';
import { CartButton } from '@/components/cart/CartButton';
// Import your Welcome Bar components
import WelcomeBar1 from '@/components/blocks/WelcomeBars/welcomeBar-1';
import WelcomeBar2 from '@/components/blocks/WelcomeBars/welcomeBar-2';
import '@puckeditor/core/puck.css';

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ site: string }>;
}) {
  const { site } = await params;

  const tenant = await getTenantBySite(site);
  if (!tenant) notFound();
  
  const theme = resolveTheme(tenant.themeTokens);
  const fontName = (tenant.fontFamily || 'Inter').replace(/\s+/g, '+');
  const googleFontUrl = `https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;600;700&display=swap`;

  // 👇 Extract the Welcome Bar data
  const welcomeBarType = tenant.welcomeBarType || 'none';
  const welcomeBarData = tenant.welcomeBarData as Record<string, any> || {};

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={googleFontUrl} rel="stylesheet" />
      
      <style dangerouslySetInnerHTML={{ __html: themeToCss(theme) }} />
      
      <div
        style={{
          ['--theme-font-body' as string]: `"${tenant.fontFamily || 'Inter'}", sans-serif`,
          ['--theme-font-heading' as string]: `"${tenant.fontFamily || 'Inter'}", sans-serif`,
          fontFamily: 'var(--theme-font-body)',
          background: 'var(--theme-color-primary)', 
          color: 'var(--theme-color-accent)', 
          minHeight: '100vh',
        }}
      >
        {/* 👇 Render the Welcome Bar at the top */}
        {welcomeBarType === 'bar1' && (
          <WelcomeBar1 
            bgColor={welcomeBarData.bgColor} 
            text_color={welcomeBarData.textColor} 
            welcome_txt={welcomeBarData.text} 
          />
        )}
        
        {welcomeBarType === 'bar2' && (
          <WelcomeBar2 
            bgColor={welcomeBarData.bgColor} 
            text_color={welcomeBarData.textColor} 
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