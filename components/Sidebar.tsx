import React, { useRef, useState, useEffect } from 'react';
import { ThemeId } from './Toolbar';
import { XIcon, Database, Download, Upload, Layout, Layers, Trash, Plus, CheckSquare } from './Icons';
import { WorkspaceMetadata } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  preventOverlap: boolean;
  setPreventOverlap: (v: boolean) => void;
  
  // Workspace Props
  workspaces: WorkspaceMetadata[];
  currentWorkspaceId: string;
  onSwitchWorkspace: (id: string) => void;
  onRenameWorkspace: (id: string, newName: string) => void;
  onNewWorkspace: () => void;
  onDeleteWorkspace: (id: string) => void;
}

const THEMES: { id: ThemeId; color: string; bg: string; label: string }[] = [
    { id: 'lumina-dark', color: '#8b5cf6', bg: '#0d1117', label: 'Lumina Dark' },
    { id: 'lumina-light', color: '#8b5cf6', bg: '#f3f4f6', label: 'Lumina Light' },
    { id: 'crimson', color: '#ef4444', bg: '#1a0505', label: 'Crimson' },
    { id: 'slate', color: '#a1a1aa', bg: '#0a0a0a', label: 'Slate' },
    { id: 'contrast', color: '#facc15', bg: '#000000', label: 'High Contrast' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentTheme,
  setTheme,
  onExport,
  onImport,
  onClear,
  preventOverlap,
  setPreventOverlap,
  workspaces,
  currentWorkspaceId,
  onSwitchWorkspace,
  onRenameWorkspace,
  onNewWorkspace,
  onDeleteWorkspace
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const startEditing = (w: WorkspaceMetadata) => {
      setEditingId(w.id);
      setEditName(w.name);
  };

  const saveEditing = (id: string) => {
      if (editName.trim()) {
          onRenameWorkspace(id, editName);
      }
      setEditingId(null);
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 backdrop-blur-sm ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      <div className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-900 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out border-r border-gray-200 dark:border-gray-800 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          
          <div className="p-5 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-varela tracking-tight">nukenote</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500">
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
            
            <section>
                <button 
                    onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 group hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                    <span className="flex items-center gap-2">
                        <Database className="w-3.5 h-3.5" /> History
                    </span>
                    <span className={`transform transition-transform ${isHistoryOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>

                <div className={`space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${isHistoryOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    
                    <button 
                        onClick={() => { onNewWorkspace(); onClose(); }}
                        className="w-full flex items-center gap-3 p-2.5 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary-500/50 hover:bg-primary-50 dark:hover:bg-primary-900/10 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all mb-3 group"
                    >
                        <div className="p-1 bg-gray-100 dark:bg-gray-800 rounded-md group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30">
                            <Plus className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">New Workspace</span>
                    </button>

                    <div className="max-h-[300px] overflow-y-auto pr-1 space-y-1">
                        {workspaces.map(w => (
                            <div 
                                key={w.id}
                                className={`group flex items-center justify-between p-2 rounded-lg text-sm transition-all border ${
                                    w.id === currentWorkspaceId 
                                    ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 text-primary-900 dark:text-primary-100' 
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-transparent text-gray-700 dark:text-gray-300'
                                }`}
                            >
                                {editingId === w.id ? (
                                    <input 
                                        className="bg-white dark:bg-gray-950 border border-primary-500 rounded px-1.5 py-0.5 w-full text-sm outline-none"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onBlur={() => saveEditing(w.id)}
                                        onKeyDown={(e) => e.key === 'Enter' && saveEditing(w.id)}
                                        autoFocus
                                    />
                                ) : (
                                    <button 
                                        className="flex-1 text-left truncate px-1"
                                        onClick={() => { onSwitchWorkspace(w.id); onClose(); }}
                                        onDoubleClick={() => startEditing(w)}
                                    >
                                        {w.name}
                                    </button>
                                )}
                                
                                {editingId !== w.id && (
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => { e.stopPropagation(); onDeleteWorkspace(w.id); }} className="p-1 hover:text-red-500 text-gray-400">
                                            <Trash className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5" /> Workspace Settings
                </h3>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Prevent Overlap</span>
                    <button 
                        onClick={() => setPreventOverlap(!preventOverlap)}
                        className={`w-10 h-6 rounded-full relative transition-colors duration-200 ease-in-out focus:outline-none ${preventOverlap ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${preventOverlap ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                </div>
            </section>

            <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5" /> Local Storage
                </h3>
                
                <div className="space-y-2">
                    <button 
                        onClick={onExport}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors border border-gray-200 dark:border-gray-700 group"
                    >
                        <span className="flex items-center gap-3">
                            <Download className="w-4 h-4 text-gray-400 group-hover:text-primary-500" />
                            <span className="text-sm">Export JSON</span>
                        </span>
                    </button>

                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={onImport} 
                        className="hidden" 
                        accept=".json"
                    />
                    <button 
                        onClick={handleFileClick}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors border border-gray-200 dark:border-gray-700 group"
                    >
                        <span className="flex items-center gap-3">
                            <Upload className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                            <span className="text-sm">Import File</span>
                        </span>
                    </button>

                    <button 
                        onClick={() => { if(confirm('Clear current canvas?')) onClear(); }}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 dark:text-red-400 transition-colors border border-gray-200 dark:border-gray-700 group mt-4"
                    >
                        <span className="flex items-center gap-3">
                            <Trash className="w-4 h-4" />
                            <span className="text-sm">Clear Canvas</span>
                        </span>
                    </button>
                </div>
            </section>

            <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Layout className="w-3.5 h-3.5" /> Appearance
                </h3>
                <div className="grid gap-2">
                    {THEMES.map(theme => (
                        <button
                            key={theme.id}
                            onClick={() => setTheme(theme.id)}
                            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all border ${
                                currentTheme === theme.id 
                                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-700 dark:text-primary-300' 
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-transparent text-gray-700 dark:text-gray-300'
                            }`}
                        >
                            <div 
                                className="w-6 h-6 rounded-full border shadow-sm flex items-center justify-center shrink-0" 
                                style={{ backgroundColor: theme.bg, borderColor: theme.color }}
                            >
                                {currentTheme === theme.id && <div className="w-2 h-2 rounded-full bg-white shadow-sm" />}
                            </div>
                            <span className="text-sm">{theme.label}</span>
                        </button>
                    ))}
                </div>
            </section>

          </div>

          <div className="p-5 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex flex-col gap-1">
                 <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 font-varela tracking-wider">NUKENOTE</h2>
            </div>
            <div className="mt-1 text-[10px] text-gray-400">
                v1.4.0 • Offline Local
            </div>
          </div>
        </div>
      </div>
    </>
  );
};