import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Upload, Folder, Image as ImageIcon, Search, Trash2, Link as LinkIcon, RefreshCw, AlertCircle } from 'lucide-react';

interface MediaFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    size: number;
    mimetype: string;
  };
}

export function AdminMediaLibrary() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<string>('products');
  const [error, setError] = useState<string | null>(null);

  const folders = [
    'products',
    'categories',
    'collections',
    'homepage',
    'banners',
    'logos',
    'users',
    'testimonials',
    'icons'
  ];

  useEffect(() => {
    fetchFiles();
  }, [currentFolder]);

  const fetchFiles = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured. Media Library requires Supabase Storage.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.storage
        .from('media')
        .list(currentFolder, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) {
        if (error.message.includes('Bucket not found')) {
           setError('Storage bucket "media" not found. Please create it in your Supabase dashboard and make it public.');
        } else {
           throw error;
        }
      } else {
        // Filter out empty folder placeholders
        setFiles(data?.filter(f => f.name !== '.emptyFolderPlaceholder') || []);
      }
    } catch (err: any) {
      console.error('Error fetching files:', err);
      setError(err.message || 'Failed to load media files.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !supabase) return;
    
    setUploading(true);
    setError(null);
    
    const fileList = Array.from(e.target.files) as File[];
    
    try {
      for (const file of fileList) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${currentFolder}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;
      }
      
      await fetchFiles();
    } catch (err: any) {
      console.error('Upload error:', err);
      setError('Failed to upload one or more files: ' + err.message);
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDelete = async (fileName: string) => {
    if (!supabase) return;
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    
    try {
      const { error } = await supabase.storage
        .from('media')
        .remove([`${currentFolder}/${fileName}`]);
        
      if (error) throw error;
      
      setFiles(files.filter(f => f.name !== fileName));
    } catch (err: any) {
      console.error('Delete error:', err);
      setError('Failed to delete file.');
    }
  };

  const getPublicUrl = (fileName: string) => {
    if (!supabase) return '';
    const { data } = supabase.storage.from('media').getPublicUrl(`${currentFolder}/${fileName}`);
    return data.publicUrl;
  };

  const copyToClipboard = (fileName: string) => {
    const url = getPublicUrl(fileName);
    navigator.clipboard.writeText(url);
    alert('URL copied to clipboard!');
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ImageIcon className="w-6 h-6" />
          Media Library
        </h1>
        <div className="flex gap-3">
          <button 
            onClick={fetchFiles}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <label className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors cursor-pointer flex items-center gap-2">
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload Images'}
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className="hidden" 
              onChange={handleUpload}
              disabled={uploading || !isSupabaseConfigured}
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Folders Sidebar */}
        <div className="w-64 shrink-0 flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Folders</h3>
          </div>
          <div className="p-2 overflow-y-auto flex-1">
            {folders.map(folder => (
              <button
                key={folder}
                onClick={() => setCurrentFolder(folder)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  currentFolder === folder 
                    ? 'bg-[var(--color-brand-cream)] text-[var(--color-brand-dark)]' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Folder className={`w-4 h-4 ${currentFolder === folder ? 'text-gray-900' : 'text-gray-400'}`} />
                {folder.charAt(0).toUpperCase() + folder.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content area */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
             <div className="font-medium text-gray-700">
               {currentFolder.charAt(0).toUpperCase() + currentFolder.slice(1)} <span className="text-gray-400 font-normal ml-2">({files.length} items)</span>
             </div>
             <div className="relative">
               <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
               <input 
                 type="text" 
                 placeholder="Search files..." 
                 className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 w-64"
               />
             </div>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
              </div>
            ) : files.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ImageIcon className="w-16 h-16 mb-4 text-gray-200" />
                <p className="text-lg font-medium text-gray-600">Folder is empty</p>
                <p className="text-sm">Upload images to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {files.map(file => (
                  <div key={file.id} className="group relative bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:border-gray-300 transition-all">
                    <div className="aspect-square bg-gray-100 relative">
                      <img 
                        src={getPublicUrl(file.name)} 
                        alt={file.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button 
                          onClick={() => copyToClipboard(file.name)}
                          className="p-2 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                          title="Copy URL"
                        >
                          <LinkIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(file.name)}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-medium text-gray-700 truncate" title={file.name}>{file.name}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{file.metadata ? formatBytes(file.metadata.size) : 'Unknown size'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
