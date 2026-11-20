'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Activity, 
  Calendar, 
  MoreHorizontal, 
  ChevronDown, 
  DollarSign,
  Loader2
} from 'lucide-react';
import { AnalyticsIcon } from '@/components/icons/Analytics';

export function AnalyticsClient({ 
  tenantId, 
  initialData, 
  currency 
}: { 
  tenantId: string; 
  initialData: any; 
  currency: string;
}) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('Today');
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="mx-auto space-y-4 pb-20">
      {/* Header */}
      <header className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-3">
           <AnalyticsIcon className='w-5 h-5 fill-black' />
          <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
          <span className="text-sm text-gray-500 font-normal border-l border-gray-300 pl-3 flex items-center gap-2">
            Last refreshed: {initialData.lastRefreshed}
            {isRefreshing && <Loader2 className="w-3 h-3 animate-spin text-gray-400" />}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={handleRefresh} className="p-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors bg-white" title="Refresh Data">
            <MoreHorizontal className="w-4 h-4 text-gray-600" />
          </button>
          <button className="px-4 py-1.5 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors bg-white flex items-center gap-2">
            Try targets <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          <button className="px-4 py-1.5 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors">
            New exploration
          </button>
        </div>
      </header>

      {/* Info Banner */}
      <div className="bg-[#E6F4F9] border border-[#CDE8F3] rounded-xl px-4 py-3 flex items-start gap-3">
        <div className="mt-0.5 text-[#007A9E]">
            <AnalyticsIcon className='w-5 h-5' />
        </div>
        <p className="text-sm text-[#004C63]">
          Beginning Sep 21, 2026, sessions and related metrics may shift as Weblex Analytics enables better visibility into real shopper activity. <a href="#" className="underline font-medium hover:text-black">Learn more</a>
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="appearance-none flex items-center gap-2 pl-9 pr-8 py-1.5 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="Today">Today</option>
            <option value="Yesterday">Yesterday</option>
            <option value="Last 7 days">Last 7 days</option>
            <option value="Last 30 days">Last 30 days</option>
          </select>
          <Calendar className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        
        <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 bg-white">
          <Calendar className="w-4 h-4 text-gray-500" /> Nov 13, 2026 <ChevronDown className="w-3.5 h-3.5 text-gray-500 ml-1" />
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 bg-white">
          <DollarSign className="w-4 h-4 text-gray-500" /> {currency} <ChevronDown className="w-3.5 h-3.5 text-gray-500 ml-1" />
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Gross sales', value: formatCurrency(initialData.medusa.grossSales), trend: 'up' },
          { label: 'Returning customer rate', value: '—', trend: 'neutral' },
          { label: 'Orders fulfilled', value: initialData.medusa.fulfilledOrders.toString(), trend: 'up' },
          { label: 'Orders', value: initialData.medusa.totalOrders.toString(), trend: 'up' },
        ].map((metric, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[100px]">
            <p className="text-sm font-medium text-gray-900">{metric.label}</p>
            <div className="flex items-end justify-between mt-2">
              <p className="text-lg font-semibold text-gray-900 leading-none">{metric.value}</p>
              {/* Animated Sparkline representation */}
              <div className="w-24 h-1 bg-blue-400 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left: Total sales over time */}
        <div className="lg:col-span-8 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-medium text-gray-900 mb-1">Total sales over time</h3>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">{formatCurrency(initialData.medusa.grossSales)}</h2>
          
          <div className="relative h-64 w-full">
            {/* Y-axis */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[11px] text-gray-500 pb-6 pr-4 bg-white z-10">
              <span>{formatCurrency(10)}</span>
              <span>{formatCurrency(5)}</span>
              <span>{formatCurrency(0)}</span>
            </div>

            {/* X-axis Grid Lines & Plot Area */}
            <div className="absolute left-16 right-0 top-0 bottom-6 flex flex-col justify-between">
              <div className="w-full h-px bg-gray-200/60"></div>
              <div className="w-full h-px bg-gray-200/60"></div>
              
              {/* 0 Line (Solid + Dashed) */}
              <div className="relative w-full h-px bg-gray-300">
                <div className="absolute left-0 top-0 h-px bg-blue-400 w-1/2"></div>
                <div className="absolute right-0 top-0 h-px border-t-2 border-dashed border-blue-300 w-1/2"></div>
              </div>
            </div>

            {/* X-axis Labels */}
            <div className="absolute left-16 right-0 bottom-0 flex justify-between text-[10px] text-gray-500">
              <span>12 AM</span>
              <span>2 AM</span>
              <span>4 AM</span>
              <span>6 AM</span>
              <span>8 AM</span>
              <span>10 AM</span>
              <span>12 PM</span>
              <span>2 PM</span>
              <span>4 PM</span>
              <span>6 PM</span>
              <span>8 PM</span>
              <span>10 PM</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-8 text-[11px] text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              Today
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-300"></span>
              Yesterday
            </div>
          </div>
        </div>

        {/* Right: Total sales breakdown */}
        <div className="lg:col-span-4 bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Total sales breakdown</h3>
          
          <div className="flex-1 flex flex-col justify-between gap-2">
            {[
              { label: 'Gross sales', isTotal: false, value: initialData.medusa.grossSales },
              { label: 'Discounts', isTotal: false, value: 0 },
              { label: 'Sales reversals', isTotal: false, value: 0 },
              { label: 'Net sales', isTotal: false, value: initialData.medusa.grossSales },
              { label: 'Shipping charges', isTotal: false, value: 0 },
              { label: 'Return fees', isTotal: false, value: 0 },
              { label: 'Taxes', isTotal: false, value: 0 },
              { label: 'Total sales', isTotal: true, value: initialData.medusa.grossSales },
            ].map((item, i) => (
              <div 
                key={i} 
                className={`flex items-center justify-between py-2 px-3 rounded-md ${
                  item.isTotal ? 'bg-gray-100/80 font-semibold' : 'hover:bg-gray-50'
                }`}
              >
                <span className={`text-sm ${item.isTotal ? 'text-gray-900' : 'text-[#2c6ecb]'}`}>
                  {item.label}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(item.value)}</span>
                  <span className="text-gray-400 font-medium w-2 text-center">—</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Total sales by sales channel */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col">
          <h3 className="text-sm font-medium text-gray-900 mb-8">Total sales by sales channel</h3>
          <div className="flex-1 flex items-center justify-center pb-12">
            {initialData.medusa.totalOrders > 0 ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full border-4 border-blue-400 border-r-transparent mx-auto mb-4"></div>
                <p className="text-sm font-medium text-gray-900">Online Store</p>
                <p className="text-xs text-gray-500">{formatCurrency(initialData.medusa.grossSales)}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No data for this date range</p>
            )}
          </div>
        </div>

        {/* Average order value over time */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col">
          <h3 className="text-sm font-medium text-gray-900 mb-1">Average order value over time</h3>
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {initialData.medusa.totalOrders > 0 ? formatCurrency(initialData.medusa.grossSales / initialData.medusa.totalOrders) : '—'}
          </h2>
          
          <div className="relative h-40 w-full flex-1">
             {/* Y-axis */}
             <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-gray-500 pb-6 pr-4 bg-white z-10">
              <span>{formatCurrency(10)}</span>
              <span>{formatCurrency(5)}</span>
              <span>{formatCurrency(0)}</span>
            </div>

            {/* Plot Area */}
            <div className="absolute left-12 right-0 top-0 bottom-6 flex flex-col justify-between">
              <div className="w-full h-px bg-gray-200/60"></div>
              <div className="w-full h-px bg-gray-200/60"></div>
              <div className="relative w-full h-px bg-gray-300">
                <div className="absolute left-0 top-0 h-px bg-blue-400 w-1/2"></div>
                <div className="absolute right-0 top-0 h-px border-t-2 border-dashed border-blue-300 w-1/2"></div>
              </div>
            </div>

            {/* X-axis */}
            <div className="absolute left-12 right-0 bottom-0 flex justify-between text-[10px] text-gray-500">
              <span>12 AM</span>
              <span>4 AM</span>
              <span>8 AM</span>
              <span>12 PM</span>
              <span>4 PM</span>
              <span>8 PM</span>
            </div>
          </div>
        </div>

        {/* Total sales by product */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col">
          <h3 className="text-sm font-medium text-gray-900 mb-8">Total sales by product</h3>
          <div className="flex-1 flex items-center justify-center pb-12">
            {initialData.medusa.totalOrders > 0 ? (
               <p className="text-sm text-gray-500">Product breakdown loading...</p>
            ) : (
              <p className="text-sm text-gray-500">No data for this date range</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}