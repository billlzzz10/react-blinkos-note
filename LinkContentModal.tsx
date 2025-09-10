
import React, { useState, useEffect, useMemo } from 'react';
import { AppNote, LoreEntry, PlotOutlineNode, AppTheme } from './types';
import { XCircle, Save, Search, StickyNote, BookOpen as LoreIcon } from 'lucide-react';

interface LinkContentModalProps {
  show: boolean;
  onClose: () => void;
  plotNode: PlotOutlineNode;
  allNotes: AppNote[]; // Already filtered for the current project context if activeProjectId is set
  allLoreEntries: LoreEntry[]; // Already filtered for the current project context
  onSaveLinks: (nodeId: string, linkedNoteIds: number[], linkedLoreIds: string[]) => void;
  currentTheme: AppTheme;
}

const LinkContentModal: React.FC<LinkContentModalProps> = ({
  show,
  onClose,
  plotNode,
  allNotes,
  allLoreEntries,
  onSaveLinks,
  currentTheme,
}) => {
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<number>>(new Set());
  const [selectedLoreIds, setSelectedLoreIds] = useState<Set<string>>(new Set());
  const [noteSearchTerm, setNoteSearchTerm] = useState('');
  const [loreSearchTerm, setLoreSearchTerm] = useState('');

  useEffect(() => {
    if (show && plotNode) {
      setSelectedNoteIds(new Set(plotNode.linkedNoteIds || []));
      setSelectedLoreIds(new Set(plotNode.linkedLoreIds || []));
      setNoteSearchTerm('');
      setLoreSearchTerm('');
    }
  }, [show, plotNode]);

  const filteredNotes = useMemo(() => {
    return allNotes.filter(note => 
      note.title.toLowerCase().includes(noteSearchTerm.toLowerCase()) ||
      note.category.toLowerCase().includes(noteSearchTerm.toLowerCase())
    ).sort((a,b) => a.title.localeCompare(b.title, 'th'));
  }, [allNotes, noteSearchTerm]);

  const filteredLore = useMemo(() => {
    return allLoreEntries.filter(lore => 
      lore.title.toLowerCase().includes(loreSearchTerm.toLowerCase()) ||
      lore.type.toLowerCase().includes(loreSearchTerm.toLowerCase())
    ).sort((a,b) => a.title.localeCompare(b.title, 'th'));
  }, [allLoreEntries, loreSearchTerm]);

  const toggleNoteSelection = (noteId: number) => {
    setSelectedNoteIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) newSet.delete(noteId);
      else newSet.add(noteId);
      return newSet;
    });
  };

  const toggleLoreSelection = (loreId: string) => {
    setSelectedLoreIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(loreId)) newSet.delete(loreId);
      else newSet.add(loreId);
      return newSet;
    });
  };

  const handleSave = () => {
    onSaveLinks(plotNode.id, Array.from(selectedNoteIds), Array.from(selectedLoreIds));
    onClose();
  };

  if (!show || !plotNode) return null;

  const inputBaseClass = `w-full px-3 py-1.5 rounded-md ${currentTheme.inputBg} ${currentTheme.inputText} border ${currentTheme.inputBorder} focus:outline-none focus:ring-1 ${currentTheme.focusRing} text-xs`;
  const listItemClass = `p-1.5 rounded-md cursor-pointer flex items-center text-xs hover:bg-opacity-80 transition-colors`;
  const selectedListItemClass = `${currentTheme.accent} bg-opacity-20 ${currentTheme.accentText}`;
  const unselectedListItemClass = `${currentTheme.cardBg} bg-opacity-30 ${currentTheme.inputText}`;


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <div className={`${currentTheme.cardBg} rounded-xl p-5 w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col`}>
        <div className="flex justify-between items-center mb-3">
          <h3 className={`text-md font-semibold ${currentTheme.text} truncate`}>
            เชื่อมโยงเนื้อหากับ: <span className={`${currentTheme.accentText}`}>{plotNode.text}</span>
          </h3>
          <button onClick={onClose} className={`${currentTheme.textSecondary} hover:opacity-70`}>
            <XCircle size={20} />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4 flex-grow overflow-hidden min-h-[300px]">
          {/* Notes Section */}
          <div className="flex flex-col overflow-hidden">
            <label htmlFor="note-search-link-modal" className={`text-sm font-medium ${currentTheme.textSecondary} mb-1 flex items-center`}>
                <StickyNote size={14} className="mr-1.5 opacity-80"/> โน้ต ({filteredNotes.length})
            </label>
            <div className="relative mb-1.5">
                <input 
                    type="text" id="note-search-link-modal" placeholder="ค้นหาโน้ต..." value={noteSearchTerm} 
                    onChange={e => setNoteSearchTerm(e.target.value)} 
                    className={`${inputBaseClass} pl-7`}
                />
                <Search size={12} className={`absolute left-2 top-1/2 -translate-y-1/2 ${currentTheme.textSecondary} opacity-60`}/>
            </div>
            <div className={`border ${currentTheme.inputBorder} rounded-md p-1.5 flex-grow overflow-y-auto space-y-1 custom-scrollbar`}>
              {filteredNotes.map(note => (
                <div 
                  key={note.id} 
                  onClick={() => toggleNoteSelection(note.id)}
                  className={`${listItemClass} ${selectedNoteIds.has(note.id) ? selectedListItemClass : unselectedListItemClass}`}
                >
                  <input type="checkbox" checked={selectedNoteIds.has(note.id)} readOnly className="mr-2 accent-purple-500" />
                  {note.icon && <span className="mr-1 text-sm">{note.icon}</span>}
                  <span className="truncate">{note.title}</span>
                </div>
              ))}
              {filteredNotes.length === 0 && <p className={`text-xs italic ${currentTheme.textSecondary} p-1 text-center`}>ไม่พบโน้ต</p>}
            </div>
          </div>

          {/* Lore Section */}
          <div className="flex flex-col overflow-hidden">
            <label htmlFor="lore-search-link-modal" className={`text-sm font-medium ${currentTheme.textSecondary} mb-1 flex items-center`}>
                <LoreIcon size={14} className="mr-1.5 opacity-80"/> ข้อมูลโลก ({filteredLore.length})
            </label>
             <div className="relative mb-1.5">
                <input 
                    type="text" id="lore-search-link-modal" placeholder="ค้นหาข้อมูลโลก..." value={loreSearchTerm} 
                    onChange={e => setLoreSearchTerm(e.target.value)} 
                    className={`${inputBaseClass} pl-7`}
                />
                <Search size={12} className={`absolute left-2 top-1/2 -translate-y-1/2 ${currentTheme.textSecondary} opacity-60`}/>
            </div>
            <div className={`border ${currentTheme.inputBorder} rounded-md p-1.5 flex-grow overflow-y-auto space-y-1 custom-scrollbar`}>
              {filteredLore.map(lore => (
                <div 
                  key={lore.id} 
                  onClick={() => toggleLoreSelection(lore.id)}
                  className={`${listItemClass} ${selectedLoreIds.has(lore.id) ? selectedListItemClass : unselectedListItemClass}`}
                >
                  <input type="checkbox" checked={selectedLoreIds.has(lore.id)} readOnly className="mr-2 accent-purple-500" />
                  {/* You might want a getLoreIcon similar to getCategoryIcon */}
                  <span className="truncate">{lore.title} ({lore.type})</span>
                </div>
              ))}
              {filteredLore.length === 0 && <p className={`text-xs italic ${currentTheme.textSecondary} p-1 text-center`}>ไม่พบข้อมูลโลก</p>}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4 pt-3 border-t ${currentTheme.divider}">
          <button onClick={onClose} className={`flex-1 py-2 rounded-lg ${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} hover:${currentTheme.buttonSecondaryHoverBg} text-sm`}>
            ยกเลิก
          </button>
          <button onClick={handleSave} className={`flex-1 py-2 rounded-lg ${currentTheme.button} ${currentTheme.buttonText} text-sm`}>
            <Save size={14} className="inline mr-1" /> บันทึกการเชื่อมโยง
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkContentModal;