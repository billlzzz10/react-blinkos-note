
import React, { useState, useEffect } from 'react';
import { LoreEntry, Project, CharacterRole, CharacterRelationship, RelationshipType, AppTheme } from './types'; 
import { COMMON_RELATIONSHIP_TYPES } from './constants'; 
import { Plus, BookOpen, Edit2, Trash2, Tag, Eye, XCircle, Search, List, LayoutGrid, Package, Users, Zap as ArcanaIcon, Link2, MapPin, Box, Brain, CalendarClock, Settings2, Image as ImageIcon } from 'lucide-react'; // Changed Brainwave to Brain

interface WorldAnvilManagerProps {
  loreEntries: LoreEntry[]; 
  setLoreEntries: React.Dispatch<React.SetStateAction<LoreEntry[]>>; 
  currentTheme: AppTheme;
  getCategoryIcon: (category: string) => JSX.Element; // Keep for consistency if needed elsewhere
  projects: Project[]; 
  activeProjectId: string | null; 
  searchTerm: string; 
  setSearchTerm: (term: string) => void; 
}

const WorldAnvilManager: React.FC<WorldAnvilManagerProps> = ({ 
    loreEntries: globalLoreEntries, 
    setLoreEntries: setGlobalLoreEntries, 
    currentTheme, 
    getCategoryIcon,
    projects, 
    activeProjectId,
    searchTerm,
    setSearchTerm
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LoreEntry | null>(null);
  
  const initialEntryData: Omit<LoreEntry, 'id' | 'createdAt'> = { 
    title: '', 
    type: 'Character', 
    content: '', 
    tags: [], 
    projectId: activeProjectId,
    role: undefined,
    characterArcana: [],
    relationships: [],
    coverImageUrl: undefined,
  };
  const [currentEntryData, setCurrentEntryData] = useState<Omit<LoreEntry, 'id' | 'createdAt'>>(initialEntryData);
  
  const [viewingEntry, setViewingEntry] = useState<LoreEntry | null>(null);
  // Default to card view to match mockup. Table view can be secondary.
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card'); 
  const [activeLoreFilter, setActiveLoreFilter] = useState<'All' | 'Characters' | 'Places' | 'Items' | 'Settings'>('All');


  const loreTypes: LoreEntry['type'][] = ['Character', 'Place', 'Item', 'Concept', 'Event', 'Other', 'ArcanaSystem'];
  const characterRoles: (CharacterRole | string)[] = ["Protagonist", "Antagonist", "Anti-hero", "Supporting", "Mentor", "Ally", "Enemy", "Family", "Love Interest", "Minor", "Other"];

  const filteredLoreEntries = React.useMemo(() => {
    let entries = globalLoreEntries.filter(entry => !activeProjectId || entry.projectId === activeProjectId);
    if (activeLoreFilter !== 'All') {
      const filterLower = activeLoreFilter.toLowerCase();
      entries = entries.filter(entry => {
        if (filterLower === 'characters') return entry.type === 'Character';
        if (filterLower === 'places') return entry.type === 'Place';
        if (filterLower === 'items') return entry.type === 'Item';
        if (filterLower === 'settings') return ['Place', 'Concept', 'ArcanaSystem'].includes(entry.type); // Broad "Settings"
        return true;
      });
    }
    if (searchTerm.trim() !== '') {
        entries = entries.filter(entry => 
            entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }
    return entries.sort((a,b) => a.title.localeCompare(b.title, 'th'));
  }, [globalLoreEntries, activeProjectId, searchTerm, activeLoreFilter]);


  const handleInputChange = (
    field: keyof Omit<LoreEntry, 'id' | 'createdAt' | 'tags' | 'projectId' | 'characterArcana' | 'relationships' | 'coverImageUrl'>, 
    value: string | CharacterRole
  ) => {
    setCurrentEntryData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleCoverImageChange = (value: string) => {
    setCurrentEntryData(prev => ({ ...prev, coverImageUrl: value.trim() === '' ? undefined : value.trim() }));
  };

  const handleProjectChange = (value: string | null) => {
    setCurrentEntryData(prev => ({ ...prev, projectId: value === "" ? null : value }));
  };

  const handleTagsChange = (value: string) => {
    setCurrentEntryData(prev => ({ ...prev, tags: value.split(',').map(tag => tag.trim()).filter(tag => tag) }));
  };
  
  const handleCharacterArcanaChange = (selectedOptions: HTMLSelectElement) => {
    const values = Array.from(selectedOptions.selectedOptions, option => option.value);
    setCurrentEntryData(prev => ({ ...prev, characterArcana: values }));
  };

  const handleAddRelationship = () => {
    setCurrentEntryData(prev => ({
      ...prev,
      relationships: [...(prev.relationships || []), { targetCharacterId: '', relationshipType: COMMON_RELATIONSHIP_TYPES[0], description: '' }]
    }));
  };

  const handleRelationshipChange = (index: number, field: keyof CharacterRelationship | 'customRelationshipType', value: string) => {
    setCurrentEntryData(prev => {
      const newRelationships = [...(prev.relationships || [])];
      let currentRel = { ...newRelationships[index] };

      if (field === 'targetCharacterId') {
        const targetCharacter = projectCharacters.find(c => c.id === value);
        currentRel.targetCharacterId = value;
        currentRel.targetCharacterName = targetCharacter ? targetCharacter.title : undefined;
      } else if (field === 'relationshipType') {
        currentRel.relationshipType = value as RelationshipType;
      } else if (field === 'customRelationshipType' && currentRel.relationshipType === 'Other') {
         currentRel.description = `Custom: ${value}`; 
      } else if (field === 'description') {
        currentRel.description = value;
      }
      
      newRelationships[index] = currentRel;
      return { ...prev, relationships: newRelationships };
    });
  };
  
  const handleRemoveRelationship = (index: number) => {
    setCurrentEntryData(prev => ({
      ...prev,
      relationships: (prev.relationships || []).filter((_, i) => i !== index)
    }));
  };


  const resetForm = () => {
    setCurrentEntryData({ ...initialEntryData, projectId: activeProjectId });
    setEditingEntry(null);
  };

  const handleSaveEntry = () => {
    if (!currentEntryData.title.trim()) {
      alert('กรุณากรอกชื่อของข้อมูลโลก');
      return;
    }
    if (currentEntryData.type === 'Character' && !currentEntryData.content.trim()){
         alert('กรุณากรอกรายละเอียดของตัวละคร');
         return;
    }

    const finalProjectId = currentEntryData.projectId === "" ? null : currentEntryData.projectId;
    const processedRelationships = (currentEntryData.relationships || []).map(rel => ({
        ...rel,
        relationshipType: String(rel.relationshipType) 
    }));

    const dataToSave = {
        ...currentEntryData,
        projectId: finalProjectId,
        relationships: processedRelationships
    };

    setGlobalLoreEntries(prevGlobalLore => {
        const newOrUpdatedEntries = editingEntry
        ? prevGlobalLore.map(entry => entry.id === editingEntry.id ? { ...entry, ...dataToSave } : entry)
        : [...prevGlobalLore, { ...dataToSave, id: Date.now().toString() + Math.random().toString(36).substring(2,7), createdAt: new Date().toISOString() }];
        return newOrUpdatedEntries.sort((a,b) => a.title.localeCompare(b.title, 'th'));
    });
    
    setShowModal(false);
    resetForm();
  };

  const handleEditEntry = (entry: LoreEntry) => {
    setEditingEntry(entry);
    setCurrentEntryData({ 
        title: entry.title, 
        type: entry.type, 
        content: entry.content, 
        tags: entry.tags, 
        projectId: entry.projectId,
        role: entry.role,
        characterArcana: entry.characterArcana || [],
        relationships: entry.relationships?.map(r => ({...r, targetCharacterName: projectCharacters.find(c=>c.id === r.targetCharacterId)?.title })) || [],
        coverImageUrl: entry.coverImageUrl || undefined,
    });
    setShowModal(true);
    setViewingEntry(null);
  };

  const handleDeleteEntry = (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลโลกนี้?')) {
      setGlobalLoreEntries(prevGlobalLore => prevGlobalLore.filter(entry => entry.id !== id));
    }
  };
  
  const handleViewEntry = (entry: LoreEntry) => {
    const entryWithPopulatedRelationships = {
        ...entry,
        relationships: entry.relationships?.map(r => ({
            ...r,
            targetCharacterName: projectCharacters.find(c => c.id === r.targetCharacterId)?.title || r.targetCharacterId
        }))
    };
    setViewingEntry(entryWithPopulatedRelationships);
  };

  const getProjectName = (projectId: string | null | undefined) => {
    if (!projectId) return null;
    return projects.find(p => p.id === projectId)?.name || null;
  };
  
  const getLoreEntryIcon = (type: LoreEntry['type']): JSX.Element => {
    const iconColorClass = currentTheme.accentText || currentTheme.accent.replace('bg-', 'text-');
    switch(type) {
        case 'Character': return <Users size={16} className={`${iconColorClass} opacity-80`} />;
        case 'Place': return <MapPin size={16} className={`${iconColorClass} opacity-80`} />;
        case 'Item': return <Box size={16} className={`${iconColorClass} opacity-80`} />;
        case 'Concept': return <Brain size={16} className={`${iconColorClass} opacity-80`} />; // Changed from Brainwave
        case 'Event': return <CalendarClock size={16} className={`${iconColorClass} opacity-80`} />;
        case 'ArcanaSystem': return <ArcanaIcon size={16} className={`${iconColorClass} opacity-80`} />;
        default: return <Settings2 size={16} className={`${iconColorClass} opacity-80`} />;
    }
  };

  const projectCharacters = globalLoreEntries.filter(l => l.type === 'Character' && (!activeProjectId || l.projectId === activeProjectId));
  const projectArcanaSystems = globalLoreEntries.filter(l => (l.type === 'ArcanaSystem' || l.type === 'Concept') && (!activeProjectId || l.projectId === activeProjectId));


  const isDarkTheme = currentTheme.name.toLowerCase().includes('dark') || currentTheme.name.toLowerCase().includes('deep');
  const selectArrowSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='${isDarkTheme ? '%23CBD5E1' : '%236B7280'}'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E`;
  const optionClasses = `${currentTheme.cardBg} ${currentTheme.inputText}`;
  const inputFieldClasses = `w-full px-4 py-2.5 rounded-lg ${currentTheme.inputBg} ${currentTheme.inputText} border ${currentTheme.inputBorder} focus:outline-none focus:ring-2 ${currentTheme.focusRing}`;


  let titlePlaceholder = "ชื่อข้อมูล (Title)";
  let contentPlaceholder = "รายละเอียด (Details)";

  switch (currentEntryData.type) {
    case 'Character':
      titlePlaceholder = "ชื่อตัวละคร";
      contentPlaceholder = "รายละเอียดตัวละคร (เช่น ลักษณะนิสัย, ประวัติ, ความสามารถ)";
      break;
    // ... (other cases)
  }
  
  const loreFilterTabs: Array<'All' | 'Characters' | 'Places' | 'Items' | 'Settings'> = ['All', 'Characters', 'Places', 'Items', 'Settings'];
  const actionButtonClass = `p-1.5 rounded-full hover:${currentTheme.sidebarHoverBg} transition-colors duration-200`;

  return (
    <div className="py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className={`text-2xl font-semibold ${currentTheme.text} flex items-center`}>
            <BookOpen className={`w-6 h-6 mr-2 ${currentTheme.accentText || currentTheme.accent.replace('bg-', 'text-')}`}/> คลังข้อมูลโลก ({filteredLoreEntries.length})
        </h2>
         <button onClick={() => { resetForm(); setShowModal(true); setViewingEntry(null); }} className={`${currentTheme.button} ${currentTheme.buttonText || 'text-white'} px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 shadow-md flex items-center text-sm`}>
            <Plus className="w-4 h-4 mr-1.5" /> เพิ่มข้อมูลใหม่
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className={`p-4 rounded-lg ${currentTheme.cardBg} border ${currentTheme.cardBorder} ${currentTheme.cardShadow} mb-6`}>
        <div className="relative mb-4">
            <input 
                type="text" 
                placeholder="ค้นหาข้อมูลโลก (ชื่อ, ประเภท, เนื้อหา, แท็ก)..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className={`w-full py-3 pl-10 pr-4 rounded-lg ${currentTheme.inputBg} ${currentTheme.inputText} border ${currentTheme.inputBorder} focus:outline-none focus:ring-2 ${currentTheme.focusRing}`} 
                aria-label="ค้นหาข้อมูลโลก" 
            />
            <Search className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 ${currentTheme.textSecondary} opacity-60`} />
        </div>
        <div className="flex flex-wrap gap-2">
            {loreFilterTabs.map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveLoreFilter(tab)}
                    className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors
                        ${activeLoreFilter === tab 
                            ? `${currentTheme.sidebarActiveBg} ${currentTheme.sidebarActiveText}` 
                            : `${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} hover:${currentTheme.buttonSecondaryHoverBg}`
                        }`
                    }
                >
                    {tab === 'All' ? 'ทั้งหมด' : 
                     tab === 'Characters' ? 'ตัวละคร' :
                     tab === 'Places' ? 'สถานที่' :
                     tab === 'Items' ? 'สิ่งของ' :
                     'การตั้งค่า/แนวคิด'}
                </button>
            ))}
        </div>
      </div>


      {filteredLoreEntries.length === 0 && (
        <p className={`${currentTheme.textSecondary} italic text-center py-8`}>
          {searchTerm ? `ไม่พบข้อมูลโลกที่ตรงกับคำค้นหา "${searchTerm}"` : 
           activeProjectId && !globalLoreEntries.some(l => l.projectId === activeProjectId) ? 'โปรเจกต์นี้ยังไม่มีข้อมูลโลก' : 
           'ยังไม่มีข้อมูลในคลังข้อมูลโลกของคุณ'}
        </p>
      )}


      {/* Card View (default and matches mockup) */}
      {viewMode === 'card' && filteredLoreEntries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredLoreEntries.map(entry => (
            <div key={entry.id} className={`${currentTheme.cardBg} border ${currentTheme.cardBorder} ${currentTheme.cardShadow} rounded-lg flex flex-col justify-between group hover:scale-[1.02] transition-transform duration-200 overflow-hidden`}>
              {entry.coverImageUrl && (
                <div className="aspect-[16/9] w-full overflow-hidden">
                    <img src={entry.coverImageUrl} alt={`ภาพสำหรับ ${entry.title}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" onError={(e) => e.currentTarget.style.display='none'} />
                </div>
              )}
              {!entry.coverImageUrl && (
                 <div className={`aspect-[16/9] w-full flex items-center justify-center ${currentTheme.inputBg} bg-opacity-30 text-4xl`}>
                    {getLoreEntryIcon(entry.type)}
                </div>
              )}
              <div className="p-4 flex flex-col flex-grow">
                <div>
                    <div className="flex justify-between items-start mb-1.5">
                    <h3 className={`font-semibold ${currentTheme.text} text-base truncate flex items-center`} title={entry.title}>
                        <span className="mr-1.5">{getLoreEntryIcon(entry.type)}</span> {entry.title}
                    </h3>
                    <div className="flex gap-1">
                        <button onClick={() => handleViewEntry(entry)} className={`${currentTheme.textSecondary} opacity-60 group-hover:opacity-100 ${actionButtonClass}`} title="ดูรายละเอียด"><Eye className="w-4 h-4"/></button>
                        <button onClick={() => handleEditEntry(entry)} className={`${currentTheme.textSecondary} opacity-60 group-hover:opacity-100 ${actionButtonClass}`} title="แก้ไข"><Edit2 className="w-4 h-4"/></button>
                        <button onClick={() => handleDeleteEntry(entry.id)} className={`text-red-500 opacity-60 group-hover:opacity-100 ${actionButtonClass} hover:bg-red-700/20`} title="ลบ"><Trash2 className="w-4 h-4"/></button>
                    </div>
                    </div>
                    <p className={`text-xs ${currentTheme.textSecondary} opacity-80 mb-1`}>ประเภท: {entry.type}{entry.type === 'Character' && entry.role ? ` (${entry.role})` : ''}</p>
                    {entry.projectId && getProjectName(entry.projectId) && (<p className={`text-xs ${currentTheme.textSecondary} opacity-70 mb-2 flex items-center`}><Package size={12} className="mr-1 opacity-70"/> โปรเจกต์: {getProjectName(entry.projectId)}</p>)}
                    <p className={`${currentTheme.textSecondary} text-sm line-clamp-3 mb-3 flex-grow min-h-[3.5rem]`}>{entry.content || "ไม่มีรายละเอียด"}</p>
                </div>
                <div className="flex gap-1.5 flex-wrap mt-auto pt-2 border-t ${currentTheme.divider} border-opacity-50">
                    {entry.tags.slice(0,3).map(tag => (<span key={tag} className={`${currentTheme.accentText} bg-opacity-10 ${currentTheme.accent.replace('bg-','bg-')} text-xs px-2 py-0.5 rounded-full`}>#{tag}</span>))}
                    {entry.tags.length > 3 && <span className={`text-xs ${currentTheme.textSecondary} opacity-70`}>+{entry.tags.length-3}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Modal for Add/Edit Lore Entry */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="loreModalTitle">
            <div className={`${currentTheme.cardBg} border ${currentTheme.cardBorder} rounded-xl p-6 w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar`}>
            <h3 id="loreModalTitle" className={`text-xl font-semibold ${currentTheme.text} mb-5`}>{editingEntry ? 'แก้ไขข้อมูลโลก' : 'เพิ่มข้อมูลโลกใหม่'}</h3>
            <div className="space-y-4">
                <input type="text" placeholder={titlePlaceholder} value={currentEntryData.title} onChange={(e) => handleInputChange('title', e.target.value)} className={inputFieldClasses} aria-label="ชื่อข้อมูลโลก" />
                
                <input type="text" placeholder="URL ภาพปก (ถ้ามี)" value={currentEntryData.coverImageUrl || ''} onChange={(e) => handleCoverImageChange(e.target.value)} className={inputFieldClasses} aria-label="URL ภาพปกข้อมูลโลก" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select value={currentEntryData.type} onChange={(e) => handleInputChange('type', e.target.value as LoreEntry['type'])} className={`${inputFieldClasses} appearance-none bg-no-repeat bg-right-3`} style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1.25em' }} aria-label="ประเภทข้อมูลโลก">
                    {loreTypes.map(type => <option key={type} value={type} className={optionClasses}>{type}</option>)}
                </select>
                <select value={currentEntryData.projectId || ""} onChange={(e) => handleProjectChange(e.target.value)} className={`${inputFieldClasses} appearance-none bg-no-repeat bg-right-3`} style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1.25em' }} aria-label="เลือกโปรเจกต์สำหรับข้อมูลโลก">
                    <option value="" className={optionClasses}>ไม่ได้กำหนดโปรเจกต์</option>
                    {projects.filter(p => !p.isArchived).map(project => (<option key={project.id} value={project.id} className={optionClasses}>{project.name}</option>))}
                </select>
                </div>

                {/* Character specific fields */}
                {currentEntryData.type === 'Character' && (
                <>
                    <div> {/* Role select and Arcana select ... */} </div>
                </>
                )}

                <textarea placeholder={contentPlaceholder} value={currentEntryData.content} onChange={(e) => handleInputChange('content', e.target.value)} rows={currentEntryData.type === 'Character' ? 5 : 7} className={`${inputFieldClasses} resize-y`} aria-label="รายละเอียดข้อมูลโลก" />
                
                {/* Relationships for Characters ... */}

                <input type="text" placeholder="แท็ก (คั่นด้วยจุลภาค)" value={currentEntryData.tags.join(', ')} onChange={(e) => handleTagsChange(e.target.value)} className={inputFieldClasses} aria-label="แท็กข้อมูลโลก" />
            </div>
            <div className={`flex gap-3 mt-6 pt-4 border-t ${currentTheme.divider}`}>
                <button onClick={() => { setShowModal(false); resetForm(); }} className={`flex-1 py-2.5 rounded-lg ${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} hover:${currentTheme.buttonSecondaryHoverBg} transition-colors`}>ยกเลิก</button>
                <button onClick={handleSaveEntry} className={`flex-1 py-2.5 rounded-lg ${currentTheme.button} ${currentTheme.buttonText} ${currentTheme.buttonHover ? currentTheme.buttonHover.replace('hover:','') : ''} transition-transform`}>{editingEntry ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มข้อมูล'}</button>
            </div>
            </div>
        </div>
        )}
        {/* Viewing Modal: Similar structure to Add/Edit Modal but read-only */}
    </div>
  );
};

export default WorldAnvilManager;
