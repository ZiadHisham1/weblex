'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, ArrowUpDown, Menu as MenuIcon, Plus, 
  X, Loader2, GripVertical, Trash2, ArrowUp, ArrowDown 
} from 'lucide-react';
import { ContentIcon } from '@/components/icons/ContentIcon';

type MenuItem = { title: string; url: string };
type MenuType = { id: string; name: string; handle: string; items: MenuItem[] };

export function MenusClient({ tenantId, initialMenus }: { tenantId: string; initialMenus: MenuType[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  
  // Drawer State
  const [editingMenu, setEditingMenu] = useState<MenuType | null>(null);
  const [draftItems, setDraftItems] = useState<MenuItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Create Menu State
  const [isCreating, setIsCreating] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');
  const [isCreatingLoading, setIsCreatingLoading] = useState(false);

  const filteredMenus = initialMenus.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.items.some(i => i.title.toLowerCase().includes(search.toLowerCase()))
  );

  const openDrawer = (menu: MenuType) => {
    setEditingMenu(menu);
    setDraftItems(menu.items);
  };

  const handleSave = async () => {
    if (!editingMenu) return;
    setIsSaving(true);

    try {
      const res = await fetch(`/api/t/${tenantId}/menus/${editingMenu.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: draftItems }),
      });

      if (res.ok) {
        setEditingMenu(null);
        router.refresh();
      } else {
        alert('Failed to save menu');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuName.trim()) return;
    setIsCreatingLoading(true);

    try {
      const handle = newMenuName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const res = await fetch(`/api/t/${tenantId}/menus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newMenuName.trim(), handle }),
      });

      if (res.ok) {
        setIsCreating(false);
        setNewMenuName('');
        router.refresh();
      } else {
        alert('Failed to create menu (handle might already exist)');
      }
    } finally {
      setIsCreatingLoading(false);
    }
  };

  // Draft Item Management
  const addItem = () => {
    setDraftItems([...draftItems, { title: '', url: '' }]);
  };

  const updateItem = (index: number, field: 'title' | 'url', value: string) => {
    const newItems = [...draftItems];
    newItems[index][field] = value;
    setDraftItems(newItems);
  };

  const removeItem = (index: number) => {
    setDraftItems(draftItems.filter((_, i) => i !== index));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === draftItems.length - 1) return;

    const newItems = [...draftItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setDraftItems(newItems);
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between pb-4 bg-white">
        <div className="flex items-center gap-2 text-gray-900">
          <ContentIcon className='w-5 h-5' />
          <h1 className="text-lg font-semibold">Menus</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsCreating(true)}
            className="px-4 py-1.5 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Create menu
          </button>
        </div>
      </header>

      {/* Search Bar */}
      <div className="py-6 pb-2">
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-black focus-within:border-transparent transition-all">
          <div className="flex items-center gap-3 flex-1">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search menus" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full text-sm outline-none bg-transparent"
            />
          </div>
          <button className="p-1 text-gray-500 hover:text-black transition-colors">
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="py-6 pb-6 overflow-auto flex-1">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium w-1/3">Menu</th>
                <th className="px-4 py-3 font-medium">Menu items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMenus.map(menu => (
                <tr 
                  key={menu.id} 
                  onClick={() => openDrawer(menu)}
                  className="hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {menu.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {menu.items && menu.items.length > 0 
                      ? menu.items.map((i: MenuItem) => i.title).join(', ') 
                      : <span className="text-gray-400 italic">No items</span>}
                  </td>
                </tr>
              ))}
              {filteredMenus.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                    No menus found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Menu Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Create Menu</h2>
              <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateMenu} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Menu Title</label>
                <input
                  autoFocus
                  type="text"
                  value={newMenuName}
                  onChange={(e) => setNewMenuName(e.target.value)}
                  placeholder="e.g. Sidebar navigation"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={isCreatingLoading || !newMenuName.trim()} className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
                  {isCreatingLoading && <Loader2 className="w-4 h-4 animate-spin" />} Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Menu Drawer */}
      {editingMenu && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
          <div className="w-full my-2 mr-2 max-w-lg bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border border-gray-200 rounded-2xl overflow-hidden">
             <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div>
                  <h2 className="font-semibold text-gray-900">{editingMenu.name}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Manage links for this menu</p>
                </div>
                <button onClick={() => setEditingMenu(null)} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-5 h-5" /></button>
             </div>
             
             <div className="flex-1 overflow-auto p-6 bg-gray-50">
               <div className="space-y-3">
                 {draftItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-2 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex flex-col gap-1 mt-1">
                        <button onClick={() => moveItem(index, 'up')} disabled={index === 0} className="text-gray-400 hover:text-black disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                        <button onClick={() => moveItem(index, 'down')} disabled={index === draftItems.length - 1} className="text-gray-400 hover:text-black disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                      </div>
                      <div className="flex-1 space-y-2">
                        <input 
                          type="text" 
                          placeholder="Link label (e.g. Home)"
                          value={item.title}
                          onChange={e => updateItem(index, 'title', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-black focus:border-black outline-none"
                        />
                        <input 
                          type="text" 
                          placeholder="URL (e.g. /collections/all)"
                          value={item.url}
                          onChange={e => updateItem(index, 'url', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-black focus:border-black outline-none text-gray-600"
                        />
                      </div>
                      <button onClick={() => removeItem(index)} className="p-1.5 text-gray-400 hover:text-red-600 mt-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                 ))}
               </div>

               <button 
                 onClick={addItem}
                 className="mt-4 flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 border-dashed rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 w-full justify-center"
               >
                 <Plus className="w-4 h-4" /> Add menu item
               </button>
             </div>
             
             <div className="p-4 border-t border-gray-200 flex gap-3 bg-white">
               <button onClick={() => setEditingMenu(null)} className="flex-1 py-2 border border-gray-300 rounded-md font-medium hover:bg-gray-50 transition-colors text-sm">Cancel</button>
               <button onClick={handleSave} disabled={isSaving} className="flex-1 py-2 bg-black text-white rounded-md font-medium hover:bg-gray-800 flex justify-center items-center gap-2 transition-colors text-sm">
                 {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Save Menu
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}