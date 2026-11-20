'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDropzone } from 'react-dropzone';
import { 
  Search, LayoutGrid, List, Folder, FileText, 
  UploadCloud, X, Loader2, Edit2, ChevronRight, ChevronDown, MoreHorizontal, Plus, FolderPlus, Trash2, AlertTriangle
} from 'lucide-react';

type Asset = { id: string; name: string; url: string; type: string; size: number; altText: string | null; createdAt: string };
type FolderType = { id: string; name: string };

export function FileManagerClient({ 
  tenantId, 
  initialAssets, 
  folders,
  activeFolderId,
  activeFolderName
}: { 
  tenantId: string; 
  initialAssets: Asset[]; 
  folders: FolderType[];
  activeFolderId: string | null;
  activeFolderName: string | null;
}) {
  const router = useRouter();
  
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Upload State
  const [uploading, setUploading] = useState(false);
  
  // Create Folder State
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Edit Drawer State
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [altText, setAltText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Deletion States
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<FolderType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Clear selections and search when folder changes
  useEffect(() => {
    setSelectedIds([]);
    setSearch('');
  }, [activeFolderId]);

  const filteredAssets = initialAssets.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    (a.altText && a.altText.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    
    try {
      const res = await fetch(`/api/t/${tenantId}/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName.trim() })
      });
      const data = await res.json();
      if (res.ok && data.folder) {
        setNewFolderName('');
        setIsCreatingFolder(false);
        router.push(`?folder=${data.folder.id}`); 
      }
    } catch (e) {
      console.error(e);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      if (activeFolderId) formData.append('folderId', activeFolderId);
      
      await fetch(`/api/t/${tenantId}/assets`, { method: 'POST', body: formData });
    }
    setUploading(false);
    router.refresh();
  }, [tenantId, router, activeFolderId]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ 
    onDrop,
    noClick: true, 
    noKeyboard: true
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAssets.length) setSelectedIds([]);
    else setSelectedIds(filteredAssets.map(a => a.id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // --- DELETION ACTIONS ---
  const executeDeleteAsset = async () => {
    if (!assetToDelete) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/t/${tenantId}/assets?ids=${assetToDelete.id}`, { method: 'DELETE' });
      setAssetToDelete(null);
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  const executeBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.length} files?`)) return;
    await fetch(`/api/t/${tenantId}/assets?ids=${selectedIds.join(',')}`, { method: 'DELETE' });
    setSelectedIds([]);
    router.refresh();
  };

  const executeDeleteFolder = async () => {
    if (!folderToDelete) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/t/${tenantId}/folders/${folderToDelete.id}`, { method: 'DELETE' });
      setFolderToDelete(null);
      // If we were viewing the deleted folder, navigate back to root
      if (activeFolderId === folderToDelete.id) {
        router.push(`?`);
      } else {
        router.refresh();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveAlt = async () => {
    if (!editingAsset) return;
    setIsSaving(true);
    await fetch(`/api/t/${tenantId}/assets`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingAsset.id, altText })
    });
    setIsSaving(false);
    setEditingAsset(null);
    router.refresh();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex w-full h-full text-sm bg-white text-gray-900">
      {/* Sidebar */}
      <div className="w-[240px] bg-[#111111] text-gray-400 flex-shrink-0 flex flex-col hidden md:flex">
        <div className="p-4">
          <Link href={`/dashboard/t/${tenantId}`} className="flex items-center gap-2 text-gray-300 font-medium hover:text-white transition-colors text-sm">
            <ChevronRight className="w-4 h-4 rotate-180" /> Back
          </Link>
        </div>
        <nav className="px-3 space-y-1 flex-1 overflow-auto">
          <Link 
            href={`?`}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${!activeFolderId ? 'text-white' : 'hover:text-white'}`}
          >
            <ChevronDown className="w-4 h-4" /> Files
          </Link>
          
          <div className="ml-4 space-y-1 mt-1">
            {folders.map(f => (
               <div key={f.id} className="group relative flex items-center">
                 <Link 
                   href={`?folder=${f.id}`}
                   className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors truncate text-sm ${activeFolderId === f.id ? 'bg-[#2a2a2a] text-white' : 'hover:bg-[#2a2a2a] text-gray-400 hover:text-white'}`}
                 >
                   <Folder className="w-4 h-4 flex-shrink-0" /> <span className="truncate">{f.name}</span>
                 </Link>
                 {/* Delete Folder Button */}
                 <button 
                   onClick={(e) => { e.preventDefault(); setFolderToDelete(f); }}
                   className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-[#3a3a3a] rounded text-gray-400 hover:text-red-400 transition-all"
                   title="Delete folder"
                 >
                   <Trash2 className="w-3.5 h-3.5" />
                 </button>
               </div>
            ))}
          </div>

          {isCreatingFolder ? (
            <form onSubmit={handleCreateFolder} className="ml-4 px-2 py-1 mt-1">
              <input
                autoFocus
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onBlur={() => !newFolderName && setIsCreatingFolder(false)}
                placeholder="Folder name..."
                className="w-full bg-[#1a1a1a] border border-[#3a3a3a] rounded px-2 py-1 text-sm text-white outline-none focus:border-white"
              />
            </form>
          ) : (
            <button 
              onClick={() => setIsCreatingFolder(true)}
              className="ml-4 w-[calc(100%-16px)] flex items-center gap-2 px-3 py-1.5 hover:bg-[#2a2a2a] rounded-md text-gray-400 hover:text-white transition-colors text-sm mt-1"
            >
              <FolderPlus className="w-4 h-4" /> New folder
            </button>
          )}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8f9fa]">
        
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <Link href={`?`} className="hover:text-black transition-colors">Files</Link>
            {activeFolderName && (
              <>
                <span className="text-gray-300">/</span>
                <span className="text-gray-900">{activeFolderName}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
             <button className="p-1.5 border border-gray-200 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
             <button onClick={() => setIsCreatingFolder(true)} className="px-3 py-1.5 bg-white border border-gray-200 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5 text-sm shadow-sm">
               <FolderPlus className="w-4 h-4" /> New folder
             </button>
             <button 
               onClick={open} 
               className="px-3 py-1.5 bg-black text-white rounded-md font-medium hover:bg-gray-800 flex items-center gap-1.5 transition-colors text-sm shadow-sm"
             >
               {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Files
             </button>
          </div>
        </header>

        {/* Toolbar */}
        <div className="px-6 py-2">
           <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-black focus-within:border-transparent transition-all">
              <div className="flex items-center gap-3 flex-1">
                 <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-black font-medium pr-3 border-r border-gray-200">
                   All <ChevronDown className="w-3.5 h-3.5" />
                 </button>
                 <div className="flex items-center gap-2 flex-1">
                   <Search className="w-4 h-4 text-gray-400" />
                   <input 
                     type="text" 
                     placeholder="Search and filter" 
                     value={search}
                     onChange={e => setSearch(e.target.value)}
                     className="w-full text-sm outline-none bg-transparent"
                   />
                 </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedIds.length > 0 && (
                  <button onClick={executeBulkDelete} className="text-red-600 hover:text-red-700 text-sm font-medium mr-2 flex items-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" /> Delete {selectedIds.length}
                  </button>
                )}
                <button onClick={() => setView(view === 'grid' ? 'list' : 'grid')} className="p-1 border border-gray-200 rounded text-gray-500 hover:bg-gray-50">
                  {view === 'grid' ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
                </button>
              </div>
           </div>
        </div>

        {/* Content Area */}
        <div {...getRootProps({ className: 'flex-1 overflow-auto relative m-4 mt-2 bg-white border border-gray-200 rounded-xl shadow-sm' })}>
          <input {...getInputProps()} />
          
          {isDragActive && (
            <div className="absolute inset-0 z-20 bg-white/90 flex items-center justify-center border-2 border-dashed border-black m-2 rounded-lg backdrop-blur-sm transition-all">
              <div className="text-center">
                <UploadCloud className="w-10 h-10 text-black mx-auto mb-3" />
                <p className="text-lg font-semibold text-black">Drop files to upload</p>
              </div>
            </div>
          )}

          {filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center pb-20">
              <div className="w-24 h-24 mb-4 relative flex items-center justify-center">
                <div className="absolute inset-0 bg-gray-100 rounded-full opacity-50"></div>
                <div className="relative z-10 flex gap-2">
                  <div className="w-10 h-12 bg-white rounded shadow-sm border border-gray-200 flex flex-col items-center justify-center">
                     <div className="w-6 h-4 bg-blue-500 rounded-sm mb-1"></div>
                     <div className="w-6 h-1 bg-gray-200 rounded-sm mt-1"></div>
                     <div className="w-4 h-1 bg-gray-200 rounded-sm mt-1"></div>
                  </div>
                  <div className="w-12 h-10 bg-white rounded shadow-sm border border-gray-200 flex items-center justify-center relative -top-2">
                     <div className="w-8 h-6 bg-teal-600 rounded-sm flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                     </div>
                  </div>
                </div>
              </div>
              <h2 className="text-base font-semibold text-gray-900">This folder is empty</h2>
              <p className="text-sm text-gray-500 mt-1 mb-4">Drag and drop files here, or upload them to get started.</p>
              <button onClick={open} className="px-4 py-1.5 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors">
                Upload files
              </button>
            </div>
          ) : view === 'list' ? (
             <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-white text-gray-500 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 w-12">
                    <input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.length === filteredAssets.length && filteredAssets.length > 0} className="rounded border-gray-300 cursor-pointer" />
                  </th>
                  <th className="px-4 py-3 font-normal text-xs">File name</th>
                  <th className="px-4 py-3 font-normal text-xs w-1/3">Alt text</th>
                  <th className="px-4 py-3 font-normal text-xs">Date added</th>
                  <th className="px-4 py-3 font-normal text-xs text-right">Size</th>
                  <th className="px-4 py-3 font-normal text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAssets.map(asset => (
                  <tr key={asset.id} className={`group hover:bg-gray-50 transition-colors ${selectedIds.includes(asset.id) ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-4 py-2">
                      <input type="checkbox" checked={selectedIds.includes(asset.id)} onChange={() => toggleSelect(asset.id)} className="rounded border-gray-300 cursor-pointer" />
                    </td>
                    <td className="px-4 py-2 flex items-center gap-3">
                      {asset.type.startsWith('image/') ? (
                        <div className="w-10 h-10 border border-gray-200 rounded overflow-hidden flex-shrink-0 bg-white">
                          <img src={asset.url} alt={asset.altText || ''} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 border border-gray-200 rounded flex items-center justify-center flex-shrink-0 bg-gray-50">
                          <FileText className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <span className="font-medium text-gray-900 truncate max-w-[200px] text-sm">{asset.name}</span>
                    </td>
                    <td className="px-4 py-2 text-gray-500 truncate max-w-[250px] text-sm">
                      {asset.altText || <span className="text-gray-300 italic">No alt text</span>}
                    </td>
                    <td className="px-4 py-2 text-gray-500 text-sm">{formatDate(asset.createdAt)}</td>
                    <td className="px-4 py-2 text-gray-500 text-right text-sm">{formatBytes(asset.size)}</td>
                    <td className="px-4 py-2 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                         <button onClick={() => { setEditingAsset(asset); setAltText(asset.altText || ''); }} className="p-1.5 text-gray-400 hover:text-gray-900">
                           <Edit2 className="w-4 h-4" />
                         </button>
                         <button onClick={() => setAssetToDelete(asset)} className="p-1.5 text-gray-400 hover:text-red-600">
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
               {filteredAssets.map(asset => (
                  <div key={asset.id} className={`border rounded-lg overflow-hidden group hover:shadow-md transition-shadow relative ${selectedIds.includes(asset.id) ? 'ring-2 ring-black border-transparent' : 'border-gray-200'}`}>
                    <div className="absolute top-2 left-2 z-10">
                      <input type="checkbox" checked={selectedIds.includes(asset.id)} onChange={() => toggleSelect(asset.id)} className="rounded border-gray-300 bg-white/80 cursor-pointer" />
                    </div>
                    <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-all flex gap-1">
                       <button onClick={() => setAssetToDelete(asset)} className="p-1 bg-white/90 rounded text-gray-600 hover:text-red-600 shadow-sm">
                         <Trash2 className="w-3.5 h-3.5" />
                       </button>
                    </div>
                    <div className="aspect-square bg-gray-50 flex items-center justify-center p-4">
                       {asset.type.startsWith('image/') ? (
                         <img src={asset.url} alt={asset.altText || ''} className="w-full h-full object-contain" />
                       ) : (
                         <FileText className="w-10 h-10 text-gray-300" />
                       )}
                    </div>
                    <div className="p-2 bg-white border-t border-gray-100">
                      <p className="font-medium text-gray-900 truncate text-xs mb-0.5">{asset.name}</p>
                      <p className="text-[10px] text-gray-500">{formatBytes(asset.size)}</p>
                    </div>
                  </div>
               ))}
             </div>
          )}
        </div>
      </div>

      {/* --- DELETE MODALS --- */}

      {/* Delete File Modal */}
      {assetToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete File</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete <span className="font-medium text-gray-900">"{assetToDelete.name}"</span>? This cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setAssetToDelete(null)} disabled={isDeleting} className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 hover:bg-gray-50 flex-1">Cancel</button>
                <button onClick={executeDeleteAsset} disabled={isDeleting} className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 flex items-center justify-center gap-2 flex-1">
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Folder Modal */}
      {folderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Folder</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete <span className="font-medium text-gray-900">"{folderToDelete.name}"</span>? The files inside will not be deleted, but they will be moved to the main Files directory.
              </p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setFolderToDelete(null)} disabled={isDeleting} className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 hover:bg-gray-50 flex-1">Cancel</button>
                <button onClick={executeDeleteFolder} disabled={isDeleting} className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 flex items-center justify-center gap-2 flex-1">
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Drawer (Left as is) */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
             <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-semibold text-gray-900">File details</h2>
                <button onClick={() => setEditingAsset(null)} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-5 h-5" /></button>
             </div>
             <div className="flex-1 overflow-auto p-6 space-y-6">
               <div className="aspect-video bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                 {editingAsset.type.startsWith('image/') ? (
                   <img src={editingAsset.url} alt="" className="w-full h-full object-contain" />
                 ) : (
                   <FileText className="w-12 h-12 text-gray-300" />
                 )}
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">File name</label>
                 <p className="text-sm text-gray-900 break-all bg-gray-50 p-2 rounded border border-gray-200">{editingAsset.name}</p>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Alt text</label>
                 <textarea 
                   value={altText} 
                   onChange={e => setAltText(e.target.value)}
                   placeholder="Describe the file..."
                   className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-black focus:border-black outline-none resize-none h-24"
                 />
               </div>

               <div className="grid grid-cols-2 gap-4 text-sm">
                 <div>
                   <p className="text-gray-500 mb-1">Type</p>
                   <p className="font-medium text-gray-900">{editingAsset.type.split('/')[1]?.toUpperCase() || 'FILE'}</p>
                 </div>
                 <div>
                   <p className="text-gray-500 mb-1">Size</p>
                   <p className="font-medium text-gray-900">{formatBytes(editingAsset.size)}</p>
                 </div>
               </div>
             </div>
             
             <div className="p-4 border-t flex gap-3">
               <button onClick={() => setEditingAsset(null)} className="flex-1 py-2 border border-gray-300 rounded-md font-medium hover:bg-gray-50 transition-colors text-sm">Cancel</button>
               <button onClick={handleSaveAlt} disabled={isSaving} className="flex-1 py-2 bg-black text-white rounded-md font-medium hover:bg-gray-800 flex justify-center items-center gap-2 transition-colors text-sm">
                 {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Save
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}