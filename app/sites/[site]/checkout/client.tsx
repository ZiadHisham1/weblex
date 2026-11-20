// app/sites/[site]/checkout/checkout-client.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, HelpCircle } from 'lucide-react';

export function CheckoutClient({ site, initialCart }: { site: string; initialCart: any }) {
  const router = useRouter();
  const [cart, setCart] = useState(initialCart);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState(cart.email || '');
  const [firstName, setFirstName] = useState(cart.shipping_address?.first_name || '');
  const [lastName, setLastName] = useState(cart.shipping_address?.last_name || '');
  const [address, setAddress] = useState(cart.shipping_address?.address_1 || '');
  const [apartment, setApartment] = useState(cart.shipping_address?.address_2 || '');
  const [city, setCity] = useState(cart.shipping_address?.city || '');
  const [governorate, setGovernorate] = useState(cart.shipping_address?.province || 'Cairo');
  const [postalCode, setPostalCode] = useState(cart.shipping_address?.postal_code || '');
  
  // Credit Card Mock State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardError, setCardError] = useState(false);

  const formatPrice = (amount: number, currency: string = 'egp') => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const handleContinueToShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Submit Address
      const addressRes = await fetch('/api/medusa/checkout/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          shipping_address: {
            first_name: firstName,
            last_name: lastName,
            address_1: address,
            address_2: apartment,
            city,
            province: governorate,
            postal_code: postalCode,
            country_code: 'eg', // Hardcoded based on your screenshot
          },
        }),
      });

      if (!addressRes.ok) {
        const data = await addressRes.json();
        throw new Error(data.error || 'Failed to save address');
      }

      const { cart: updatedCart } = await addressRes.json();
      setCart(updatedCart);

      // 2. Fetch Shipping Options
      const optionsRes = await fetch('/api/medusa/checkout/options');
      const optionsData = await optionsRes.json();
      
      if (optionsData.options && optionsData.options.length > 0) {
        // Automatically select the first (Standard) shipping option
        const optionId = optionsData.options[0].id;
        const shippingRes = await fetch('/api/medusa/checkout/shipping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ option_id: optionId }),
        });

        if (!shippingRes.ok) throw new Error('Failed to set shipping method');
        
        const { cart: cartWithShipping } = await shippingRes.json();
        setCart(cartWithShipping);
      }
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

     const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!cardName || !cardNumber || !cardExpiry || !cardCvc) {
      setCardError(true);
      return;
    }
    setCardError(false);
    setLoading(true);

    try {
      // 👇 1. FORCE SYNC: Re-save address and email to ensure they exist in the cart
      const addressRes = await fetch('/api/medusa/checkout/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          shipping_address: {
            first_name: firstName,
            last_name: lastName,
            address_1: address,
            address_2: apartment,
            city,
            province: governorate,
            postal_code: postalCode,
            country_code: 'eg',
          },
        }),
      });

      if (!addressRes.ok) {
        const data = await addressRes.json();
        throw new Error(data.error || 'Failed to sync address');
      }

      // 👇 2. Now complete the cart
      const res = await fetch('/api/medusa/checkout/complete', {
        method: 'POST',
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      router.push(`/order/confirmed`);
      router.refresh();
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
   return (
    <div className="bg-white flex flex-col lg:flex-row min-h-screen">
      
      {/* LEFT COLUMN: Forms (White) */}
      {/* 👇 Changed to lg:w-[55%] and centered the content */}
      <div className="w-full lg:w-[55%] flex justify-end py-8 px-4 lg:px-8 border-r border-transparent lg:border-gray-200">
        <div className="w-full max-w-[560px]">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={cart.shipping_methods?.length > 0 ? handlePayNow : handleContinueToShipping}>
            
            {/* Contact Section */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Contact</h2>
                <button type="button" className="text-sm text-blue-600 hover:underline">Sign in</button>
              </div>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email or mobile phone number"
                  required
                  disabled={cart.shipping_methods?.length > 0}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <HelpCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <label className="flex items-center gap-2 mt-3 text-sm text-gray-700">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                Email me with news and offers
              </label>
            </section>

            {/* Delivery Section */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery</h2>
              
              <div className="space-y-3">
                <div className="relative">
                  <select className="w-full px-3 py-3 border border-gray-300 rounded-md appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <option>Egypt</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="First name (optional)" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="text" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} required className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Apartment, suite, etc. (optional)" value={apartment} onChange={(e) => setApartment(e.target.value)} className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

                <div className="grid grid-cols-3 gap-3">
                  <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <div className="relative">
                    <select value={governorate} onChange={(e) => setGovernorate(e.target.value)} className="w-full px-3 py-3 border border-gray-300 rounded-md appearance-none bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Cairo</option>
                      <option>Giza</option>
                      <option>Alexandria</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                  <input type="text" placeholder="Postal code (optional)" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              
              <label className="flex items-center gap-2 mt-4 text-sm text-gray-700">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                Save this information for next time
              </label>
            </section>

            {/* Shipping Method */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping method</h2>
              <div className="border border-blue-500 bg-blue-50 rounded-md p-4 flex items-center justify-between">
                <span className="font-medium text-sm text-gray-900">Standard</span>
                <span className="font-bold text-sm text-gray-900">FREE</span>
              </div>
            </section>

            {/* Payment Section */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-gray-900">Pay with credit card</h2>
                <div className="flex gap-1">
                  <div className="w-8 h-5 border border-gray-300 rounded bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-500">VISA</div>
                  <div className="w-8 h-5 border border-gray-300 rounded bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-500">MC</div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-4">All transactions are secure and encrypted.</p>

              <div className="bg-white border border-gray-200 rounded-md p-4 mb-4 text-sm">
                <p className="font-semibold text-gray-900 mb-2">Testing instruction</p>
                <p className="text-gray-600 mb-2">Use these values to test your checkout:</p>
                <ul className="list-disc pl-5 mb-2 text-gray-600 space-y-1">
                  <li>1 to simulate an approved transaction</li>
                  <li>2 to simulate a declined transaction</li>
                  <li>3 to simulate a gateway failure</li>
                </ul>
                <p className="text-gray-600">Use any future expiration date and any 3-digit security code.</p>
                <a href="#" className="text-blue-600 hover:underline mt-2 inline-block">Get support</a>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <input type="text" placeholder="Card number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Expiration date (MM / YY)" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <div className="relative">
                    <input type="text" placeholder="Security code" value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <HelpCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div>
                  <input 
                    type="text" 
                    placeholder="Name on card" 
                    value={cardName} 
                    onChange={(e) => setCardName(e.target.value)} 
                    className={`w-full px-3 py-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${cardError && !cardName ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`} 
                  />
                  {cardError && !cardName && <p className="text-red-500 text-xs mt-1">Enter your name exactly as it's written on your card</p>}
                </div>
              </div>

              <label className="flex items-center gap-2 mt-4 text-sm text-gray-700">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                Use shipping address as billing address
              </label>
            </section>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#005BFF] text-white font-semibold py-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {cart.shipping_methods?.length > 0 ? 'Pay now' : 'Continue to payment'}
            </button>

            <div className="mt-8 text-sm text-blue-600">
              <a href="#" className="underline">Terms and policies</a>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: Order Summary (Grey) */}
      {/* 👇 Changed to lg:w-[45%] to make it smaller than the white side, and centered the content */}
      <div className="w-full lg:w-[45%] bg-[#F6F6F7] px-4 py-8 lg:px-8 lg:py-12 border-t lg:border-t-0 border-gray-200">
        <div className="w-full max-w-[440px] mx-auto lg:mx-0 sticky top-12">
          
          {/* Cart Items */}
          <div className="space-y-4 mb-6">
            {cart.items.map((item: any) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="relative w-16 h-16 bg-white border border-gray-200 rounded-md shrink-0">
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-800 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-[#F6F6F7]">
                    {item.quantity}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.product_title}</p>
                  {item.variant_title && <p className="text-xs text-gray-500">{item.variant_title}</p>}
                </div>
                <p className="text-sm text-gray-900">{formatPrice(item.unit_price, cart.currency_code)}</p>
              </div>
            ))}
          </div>

          {/* Gift Card Input */}
          <div className="flex gap-2 mb-6">
            <input type="text" placeholder="Gift card" className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="button" className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300">Apply</button>
          </div>

          {/* Totals */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="text-gray-900">{formatPrice(cart.subtotal, cart.currency_code)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="text-gray-900">FREE</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span className="flex items-center gap-1">Estimated taxes <HelpCircle className="w-3 h-3" /></span>
              <span className="text-gray-900">{formatPrice(cart.tax_total, cart.currency_code)}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-4">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <div className="text-right">
                <span className="text-xs text-gray-500 mr-1">EGP</span>
                <span className="text-2xl font-bold text-gray-900">{formatPrice(cart.total, cart.currency_code)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}