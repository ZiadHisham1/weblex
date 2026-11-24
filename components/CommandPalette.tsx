'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { Search, X } from 'lucide-react';

// 👇 IMPORT YOUR CUSTOM SVG COMPONENTS HERE
import { HomeIcon } from './icons/HomeIcon';
import { ProductsIcon } from './icons/ProductIcon';
import { OrdersIcon } from '@/components/icons/OrdersIcon';
import { CustomersIcon } from '@/components/icons/CustomersIcon';
import { ContentIcon } from '@/components/icons/ContentIcon';

export function CommandPalette({ tenantId }: { tenantId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const base = `/dashboard/t/${tenantId}`;

  useKeyboardShortcut(['k'], () => {
    setIsOpen((prev) => !prev);
  }, { metaKey: true });

  useKeyboardShortcut(['Escape'], () => {
    setIsOpen(false);
  }, { preventDefault: false });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // 👇 Use your custom components in the array
  const commands = [
    { id: 'home', label: 'Go to Home', icon: HomeIcon, href: base },
    { id: 'orders', label: 'Go to Orders', icon: OrdersIcon, href: `${base}/orders` },
    { id: 'products', label: 'Go to Products', icon: ProductsIcon, href: `${base}/products` },
    { id: 'customers', label: 'Go to Customers', icon: CustomersIcon, href: `${base}/customers` },
    { id: 'content', label: 'Go to Content', icon: ContentIcon, href: `${base}/content` },
  ];

  const filteredCommands = commands.filter(c => c.label.toLowerCase().includes(search.toLowerCase()));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredCommands[selectedIndex];
      if (selected) {
        router.push(selected.href);
        setIsOpen(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50 p-4 animate-in fade-in duration-150">
    <div className='border-2 border-gray-300  max-w-xl w-full rounded-3xl flex justify-center'>
    <div 
      className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
      onClick={(e) => e.stopPropagation()}
    >
        <div className="flex items-center px-4 py-3 border-b border-gray-200 gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search commands or pages..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            className="flex-1 text-base outline-none placeholder:text-gray-400 text-gray-900 bg-transparent"
          />
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
            <span className="text-xs border border-gray-200 rounded px-1.5 py-0.5">ESC</span>
          </button>
        </div>

        <div className="max-h-[300px] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-6">No results found.</p>
          ) : (
            filteredCommands.map((cmd, idx) => {
              // 👇 Extract the component so we can render it properly with props
              const IconComponent = cmd.icon;

              return (
                <button
                  key={cmd.id}
                  onClick={() => { router.push(cmd.href); setIsOpen(false); }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    selectedIndex === idx ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600'
                  }`}
                >
                  {/* 👇 Render the component with the specific classNames */}
                  <IconComponent 
                    className={`w-4 h-4 ${selectedIndex === idx ? 'text-gray-900' : 'text-gray-400'}`} 
                  />
                  {cmd.label}
                </button>
              );
            })
          )}
        </div>

        <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
          <span>Navigate with <kbd className="bg-white border border-gray-300 rounded px-1">↑</kbd> <kbd className="bg-white border border-gray-300 rounded px-1">↓</kbd></span>
          <span>Select with <kbd className="bg-white border border-gray-300 rounded px-1">Enter</kbd></span>
        </div>
      </div>
     </div>
    </div>
  );
}