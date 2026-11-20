// app/sites/[site]/checkout/page.tsx
import { notFound } from 'next/navigation';
import { getTenantBySite } from '@/lib/tenant';
import { getMedusaStoreClient } from '@/lib/medusa/client';
import { cookies } from 'next/headers';
import { CheckoutClient } from './client';
import Link from 'next/link';

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ site: string }>;
}) {
  const { site } = await params;
  const tenant = await getTenantBySite(site);
  if (!tenant || tenant.siteType !== 'COMMERCE') notFound();

  const cookieStore = await cookies();
  const cartId = cookieStore.get('cart_id')?.value;

  let cart: any = null;
  if (cartId) {
    try {
      const { sdk } = await getMedusaStoreClient(tenant.id);
      const { cart: fetchedCart } = await sdk.store.cart.retrieve(cartId);
      cart = fetchedCart;
    } catch (e) {
      console.error('Failed to fetch cart for checkout', e);
    }
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-semibold mb-4">Your cart is empty</h1>
        <Link href={`/sites/${site}/products`} className="text-blue-600 hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        {/* 👇 This wrapper matches the form layout perfectly */}
        <div className="flex flex-col lg:flex-row w-full mx-auto">
          
          {/* Left Side (Aligns with Form) */}
          <div className="w-full lg:w-[55%] flex justify-end px-4 lg:px-8 py-6">
            <div className="w-full max-w-[560px]">
              <Link href={`/sites/${site}`} className="text-2xl font-bold text-gray-900 tracking-tight">
                {tenant.name}
              </Link>
            </div>
          </div>
          
        </div>
      </header>

      {/* Checkout Form Component */}
      <CheckoutClient site={site} initialCart={cart} />
    </div>
  );
}