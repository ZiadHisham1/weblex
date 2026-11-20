// app/dashboard/t/[tenantId]/growth/client.tsx
'use client';

import { useEffect, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { 
  Calendar, ChevronDown, ExternalLink, Users, Eye, Clock, 
  Globe, Monitor, Smartphone, DollarSign 
} from 'lucide-react';

export function GrowthClient({ tenantId }: { tenantId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/t/${tenantId}/growth`)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [tenantId]);

  if (loading) return <div className="p-8 text-sm text-gray-500">Loading analytics...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!data) return null;

  // 1. Generate continuous 30-day timeline
  const generateChartData = () => {
    const result = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const umamiData = data.timeseries?.find((t: any) => t.date.startsWith(dateStr));

      result.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        pageviews: umamiData?.pageviews || 0,
        sessions: umamiData?.sessions || 0,
      });
    }
    return result;
  };

  const chartData = generateChartData();

  // 👇 2. Calculate the KPI totals directly from the chart data
  // This guarantees the cards match the chart 100%
  const totalPageviews = chartData.reduce((sum, d) => sum + d.pageviews, 0);
  const totalSessions = chartData.reduce((sum, d) => sum + d.sessions, 0);

  // Safe arrays
  const pages = data.pages || [];
  const referrers = data.referrers || [];
  const countries = data.countries || [];
  const browsers = data.browsers || [];
  const devices = data.devices || [];
  const osData = data.os || [];

  return (
    <div className="mx-auto no-scrollbar py-10 space-y-6">
      
      {/* 1. Top Banner */}
      <div className="relative bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex justify-between items-start overflow-hidden">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Run your marketing on autopilot</h2>
          <p className="text-sm text-gray-500 mb-4 max-w-lg">
            Campaign Autopilot promotes your products across top channels, and keeps refining the strategy while you stay in control.
          </p>
          <div className="flex gap-2">
            <button className="bg-black text-white text-sm font-medium px-4 py-1.5 rounded-full">Get started</button>
            <button className="bg-gray-100 text-gray-700 text-sm font-medium px-4 py-1.5 rounded-full">Learn more</button>
          </div>
        </div>
      </div>

      {/* 2. KPI Cards (Now powered by calculated chart totals) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          label="Visitors" 
          value={totalSessions} // 👈 Using calculated sessions
          icon={<Users className="w-4 h-4" />} 
          color="text-blue-600" 
        />
        <KpiCard 
          label="Pageviews" 
          value={totalPageviews} // 👈 Using calculated pageviews
          icon={<Eye className="w-4 h-4" />} 
          color="text-green-600" 
        />
        <KpiCard 
          label="Active Right Now" 
          value={data.summary.activeVisitors} 
          icon={<Clock className="w-4 h-4" />} 
          color="text-orange-600" 
          subtitle="Live"
        />
        <KpiCard 
          label="Revenue" 
          value={`EGP ${data.revenue.total.toFixed(2)}`} 
          icon={<DollarSign className="w-4 h-4" />} 
          color="text-purple-600" 
          subtitle={`${data.revenue.orders} orders`}
        />
      </div>

      {/* 3. Main Chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-gray-900">Traffic over time</h3>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-full text-sm font-medium bg-white">
              <Calendar className="w-4 h-4 text-gray-500" /> Last 30 days <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <a href="http://localhost:3001" target="_blank" rel="noreferrer" className="text-sm text-gray-500 underline decoration-1 underline-offset-4 hover:text-black flex items-center gap-1">
              Umami <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#6b7280' }} 
                dy={10} 
                minTickGap={30}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#6b7280' }} 
                dx={-10} 
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="sessions" 
                stroke="#0ea5e9" 
                strokeWidth={2} 
                dot={false} 
                activeDot={{ r: 4 }}
                name="Sessions" 
              />
              <Line 
                type="monotone" 
                dataKey="pageviews" 
                stroke="#a855f7" 
                strokeWidth={2} 
                dot={false} 
                activeDot={{ r: 4 }}
                name="Pageviews" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Traffic Breakdown Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BreakdownCard 
          title="Top Pages" 
          icon={<Eye className="w-4 h-4" />} 
          items={pages.map((p: any) => ({ label: p.url, value: p.visits }))} 
        />
        
        <BreakdownCard 
          title="Traffic Sources" 
          icon={<Globe className="w-4 h-4" />} 
          items={referrers.map((r: any) => ({ label: r.source, value: r.visits }))} 
        />

        <BreakdownCard 
          title="Top Countries" 
          icon={<Globe className="w-4 h-4" />} 
          items={countries.map((c: any) => ({ label: (c.name || 'Unknown').toUpperCase(), value: c.visits }))} 
        />

        <BreakdownCard 
          title="Browsers" 
          icon={<Monitor className="w-4 h-4" />} 
          items={browsers.map((b: any) => ({ label: b.name, value: b.visits }))} 
        />

        <BreakdownCard 
          title="Devices" 
          icon={<Smartphone className="w-4 h-4" />} 
          items={devices.map((d: any) => ({ label: d.name, value: d.visits }))} 
        />

        <BreakdownCard 
          title="Operating Systems" 
          icon={<Monitor className="w-4 h-4" />} 
          items={osData.map((o: any) => ({ label: o.name, value: o.visits }))} 
        />
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon, color, subtitle }: { label: string, value: string | number, icon: React.ReactNode, color: string, subtitle?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div className={`${color} bg-gray-50 p-1.5 rounded-md`}>{icon}</div>
      </div>
      <div>
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

function BreakdownCard({ title, icon, items }: { title: string, icon: React.ReactNode, items: { label: string, value: number }[] }) {
  const maxValue = items.length > 0 ? Math.max(...items.map(i => i.value)) : 1;
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
        {icon} {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">No data yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-800 truncate max-w-[70%]" title={item.label}>
                  {item.label || '(not set)'}
                </span>
                <span className="text-sm font-medium text-gray-500">{item.value}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}