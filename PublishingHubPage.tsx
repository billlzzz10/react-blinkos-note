
import React, { useState, useMemo, useEffect } from 'react';
import { AppNote, UserNoteTemplate, LongformDocument, AppTheme, ExportTemplate, Project } from './types';
import { BookUp, LayoutList, FileText as FileTextIcon, Download, Plus, Edit2, Trash2, Save, XCircle, Search, Tag, Palette, Eye, Loader2, AlertTriangle, ChevronDown, ChevronUp, List } from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import LongformDocumentModal from './LongformDocumentModal'; // New modal

interface PublishingHubPageProps {
  userTemplates: UserNoteTemplate[];
  setUserTemplates: React.Dispatch<React.SetStateAction<UserNoteTemplate[]>>;
  notes: AppNote[];
  longformDocuments: LongformDocument[];
  setLongformDocuments: React.Dispatch<React.SetStateAction<LongformDocument[]>>;
  currentTheme: AppTheme;
  getCategoryIcon: (category: string) => JSX.Element;
  exportTemplates: ExportTemplate[];
  activeProjectId: string | null;
  projects: Project[];
}

type ActivePublishingTab = 'templates' | 'longform' | 'export';

const PublishingHubPage: React.FC<PublishingHubPageProps> = ({
  userTemplates,
  setUserTemplates,
  notes,
  longformDocuments,
  setLongformDocuments,
  currentTheme,
  getCategoryIcon,
  exportTemplates,
  activeProjectId,
  projects
}) => {
  const [activeTab, setActiveTab] = useState<ActivePublishingTab>('longform');

  // === Template Management State & Logic (from UserTemplateManager) ===
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<UserNoteTemplate | null>(null);
  const [currentTemplateData, setCurrentTemplateData] = useState<Omit<UserNoteTemplate, 'id' | 'createdAt'>>({
    name: '', content: '', icon: '', category: 'general',
  });
  const [templateSearchTerm, setTemplateSearchTerm] = useState('');

  const handleTemplateInputChange = (field: keyof Omit<UserNoteTemplate, 'id' | 'createdAt' | 'icon' | 'category'>, value: string) => {
    setCurrentTemplateData(prev => ({ ...prev, [field]: value }));
  };
  const handleTemplateIconChange = (icon: string) => setCurrentTemplateData(prev => ({ ...prev, icon }));
  const handleTemplateCategoryChange = (category: string) => setCurrentTemplateData(prev => ({ ...prev, category }));
  const resetTemplateForm = () => {
    setCurrentTemplateData({ name: '', content: '', icon: '', category: 'general' });
    setEditingTemplate(null);
  };
  const handleSaveTemplate = () => {
    if (!currentTemplateData.name.trim()) { alert('กรุณากรอกชื่อแม่แบบ'); return; }
    if (editingTemplate) {
      setUserTemplates(prev => prev.map(t => (t.id === editingTemplate.id ? { ...editingTemplate, ...currentTemplateData } : t)).sort((a,b) => a.name.localeCompare(b.name, 'th')));
    } else {
      const newTemplate: UserNoteTemplate = { id: Date.now().toString(), ...currentTemplateData, createdAt: new Date().toISOString() };
      setUserTemplates(prev => [...prev, newTemplate].sort((a,b) => a.name.localeCompare(b.name, 'th')));
    }
    setShowTemplateModal(false); resetTemplateForm();
  };
  const handleEditTemplate = (template: UserNoteTemplate) => {
    setEditingTemplate(template);
    setCurrentTemplateData({ name: template.name, content: template.content, icon: template.icon || '', category: template.category || 'general' });
    setShowTemplateModal(true);
  };
  const handleDeleteTemplate = (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบแม่แบบนี้?')) setUserTemplates(prev => prev.filter(t => t.id !== id));
  };
  const filteredUserTemplates = userTemplates.filter(template =>
    template.name.toLowerCase().includes(templateSearchTerm.toLowerCase()) ||
    template.content.toLowerCase().includes(templateSearchTerm.toLowerCase()) ||
    (template.category && template.category.toLowerCase().includes(templateSearchTerm.toLowerCase()))
  ).sort((a,b) => a.name.localeCompare(b.name, 'th'));

  // === Longform Document State & Logic ===
  const [showLongformModal, setShowLongformModal] = useState(false);
  const [editingLongformDoc, setEditingLongformDoc] = useState<LongformDocument | null>(null);
  
  const projectLongformDocuments = useMemo(() => {
    return longformDocuments.filter(doc => !activeProjectId || doc.projectId === activeProjectId)
      .sort((a,b) => a.title.localeCompare(b.title, 'th'));
  }, [longformDocuments, activeProjectId]);

  const handleOpenNewLongformModal = () => {
    setEditingLongformDoc(null);
    setShowLongformModal(true);
  };
  const handleOpenEditLongformModal = (doc: LongformDocument) => {
    setEditingLongformDoc(doc);
    setShowLongformModal(true);
  };
  const handleSaveLongformDocument = (doc: LongformDocument) => {
    setLongformDocuments(prev => {
      const existing = prev.find(d => d.id === doc.id);
      if (existing) {
        return prev.map(d => d.id === doc.id ? { ...doc, projectId: activeProjectId, updatedAt: new Date().toISOString() } : d);
      }
      return [...prev, { ...doc, projectId: activeProjectId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
    });
  };
  const handleDeleteLongformDocument = (docId: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบเอกสาร Longform นี้? เนื้อหาของโน้ตจะไม่ถูกลบ')) {
      setLongformDocuments(prev => prev.filter(d => d.id !== docId));
    }
  };


  // === Export State & Logic (from ExportPage) ===
  const [selectedExportItemId, setSelectedExportItemId] = useState<string | number | null>(null); // Can be note ID (number) or Longform ID (string)
  const [exportItemType, setExportItemType] = useState<'note' | 'longform'>('note');
  const [selectedExportTemplateId, setSelectedExportTemplateId] = useState<string>(exportTemplates[0]?.id || '');
  const [selectedExportFormat, setSelectedExportFormat] = useState<'html' | 'pdf'>('html');
  const [isExportLoading, setIsExportLoading] = useState(false);
  const [exportSearchTerm, setExportSearchTerm] = useState('');
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportPreviewHtml, setExportPreviewHtml] = useState<string | null>(null);

  const availableNotesForExport = useMemo(() => {
    return notes
      .filter(note => !activeProjectId || note.projectId === activeProjectId)
      .filter(note => note.title.toLowerCase().includes(exportSearchTerm.toLowerCase()))
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
  }, [notes, activeProjectId, exportSearchTerm]);

  const availableLongformDocsForExport = useMemo(() => {
    return projectLongformDocuments.filter(doc => doc.title.toLowerCase().includes(exportSearchTerm.toLowerCase()));
  }, [projectLongformDocuments, exportSearchTerm]);

  const selectedExportItemName = useMemo(() => {
    if (!selectedExportItemId) return 'N/A';
    if (exportItemType === 'note') {
      return notes.find(n => n.id === selectedExportItemId)?.title;
    }
    return longformDocuments.find(d => d.id === selectedExportItemId)?.title;
  }, [selectedExportItemId, exportItemType, notes, longformDocuments]);

  const selectedExportTemplate = useMemo(() => {
    return exportTemplates.find(template => template.id === selectedExportTemplateId);
  }, [exportTemplates, selectedExportTemplateId]);

  const generateExportPreview = async () => {
    if (!selectedExportItemId || !selectedExportTemplate) { setExportPreviewHtml(null); return; }
    setIsExportLoading(true); setExportError(null);
    try {
      let contentToExport = '';
      let titleToExport = 'Exported Document';

      if (exportItemType === 'note') {
        const note = notes.find(n => n.id === selectedExportItemId);
        if (note) {
          contentToExport = note.content;
          titleToExport = note.title;
        }
      } else if (exportItemType === 'longform') {
        const doc = longformDocuments.find(d => d.id === selectedExportItemId);
        if (doc) {
          titleToExport = doc.title;
          const itemContents: string[] = [];
          doc.items.forEach(item => {
            const note = notes.find(n => n.id === item.id);
            if (note) itemContents.push(`# ${note.title}\n${note.content}`); // Add title as H1
          });
          contentToExport = itemContents.join('\n\n---\n\n'); // Separate notes with HR
        }
      }
      
      const noteContentHtml = window.marked?.parse(contentToExport || '') || `<p>${contentToExport.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`;
      const templateCss = selectedExportTemplate.getCss(currentTheme);
      const fullHtml = selectedExportTemplate.getHtmlWrapper(noteContentHtml, titleToExport, templateCss, currentTheme);
      setExportPreviewHtml(fullHtml);
    } catch (e: any) {
      setExportError(`เกิดข้อผิดพลาดในการสร้างตัวอย่าง: ${e.message}`); setExportPreviewHtml(null);
    } finally {
      setIsExportLoading(false);
    }
  };
  
  const handleExport = async () => {
    if (!selectedExportItemId || !selectedExportTemplate) { alert('กรุณาเลือกรายการและเทมเพลตสำหรับส่งออก'); return; }
    setIsExportLoading(true); setExportError(null); setExportPreviewHtml(null);
    try {
      let contentToExport = '';
      let titleToExport = 'Exported Document';
      let baseFileName = 'exported_document';

      if (exportItemType === 'note') {
        const note = notes.find(n => n.id === selectedExportItemId);
        if (note) { contentToExport = note.content; titleToExport = note.title; baseFileName = note.title; }
      } else if (exportItemType === 'longform') {
        const doc = longformDocuments.find(d => d.id === selectedExportItemId);
        if (doc) {
          titleToExport = doc.title; baseFileName = doc.title;
          const itemContents: string[] = [];
          doc.items.forEach(item => {
            const note = notes.find(n => n.id === item.id);
            if (note) itemContents.push(`# ${note.title}\n${note.content}`);
          });
          contentToExport = itemContents.join('\n\n---\n\n');
        }
      }
      
      const noteContentHtml = window.marked?.parse(contentToExport || '') || `<p>${contentToExport.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`;
      const templateCss = selectedExportTemplate.getCss(currentTheme);
      const fullHtml = selectedExportTemplate.getHtmlWrapper(noteContentHtml, titleToExport, templateCss, currentTheme);
      const safeTitle = baseFileName.replace(/[^a-z0-9ก-๙เ-ไฯ-ูเ-์]+/gi, '_').toLowerCase() || 'exported_item';

      if (selectedExportFormat === 'html') {
        const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `${safeTitle}_${selectedExportTemplate.id}.html`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        alert('ส่งออกเป็น HTML สำเร็จ!');
      } else if (selectedExportFormat === 'pdf') {
        if (window.html2pdf) {
          const element = document.createElement('div'); element.innerHTML = fullHtml;
          document.body.appendChild(element);
          await window.html2pdf().from(element).set({ margin: [10,10,10,10], filename: `${safeTitle}_${selectedExportTemplate.id}.pdf`, html2canvas: { scale: 2, useCORS: true, logging: false }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }).save();
          document.body.removeChild(element);
          alert('ส่งออกเป็น PDF สำเร็จ!');
        } else { throw new Error('ไลบรารี html2pdf ไม่พร้อมใช้งาน'); }
      }
    } catch (e: any) {
      setExportError(`การส่งออกล้มเหลว: ${e.message}`); alert(`การส่งออกล้มเหลว: ${e.message}`);
    } finally {
      setIsExportLoading(false);
    }
  };

  // Common UI elements
  const isDarkTheme = currentTheme.name.toLowerCase().includes('dark') || currentTheme.name.toLowerCase().includes('deep');
  const selectArrowSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='${isDarkTheme ? '%23CBD5E1' : '%2364748B'}'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E`;
  const optionClasses = `${currentTheme.cardBg} ${currentTheme.inputText}`;
  const inputFieldBaseClasses = `px-4 py-3 rounded-xl ${currentTheme.inputBg} ${currentTheme.inputText} border ${currentTheme.inputBorder} focus:outline-none focus:ring-2 ${currentTheme.focusRing}`;
  const tabButtonClass = (tabName: ActivePublishingTab) =>
    `flex-1 py-2.5 px-4 rounded-t-lg text-sm font-medium transition-colors focus:outline-none border-b-2
     ${activeTab === tabName 
       ? `${currentTheme.accent.replace('bg-', 'border-')} ${currentTheme.accentText || currentTheme.accent.replace('bg-', 'text-')}` 
       : `${currentTheme.inputBorder} ${currentTheme.textSecondary} hover:${currentTheme.text}`}`;

  return (
    <div className="py-6">
      <h2 className={`text-2xl sm:text-3xl font-semibold ${currentTheme.text} mb-6 text-center flex items-center justify-center`}>
        <BookUp className={`w-7 h-7 mr-2 ${currentTheme.accentText || currentTheme.accent.replace('bg-', 'text-')}`} />
        สตูดิโอเผยแพร่
      </h2>

      <div className={`flex border-b ${currentTheme.divider} mb-6`}>
        <button onClick={() => setActiveTab('longform')} className={tabButtonClass('longform')}>เอกสาร Longform</button>
        <button onClick={() => setActiveTab('templates')} className={tabButtonClass('templates')}>แม่แบบของฉัน</button>
        <button onClick={() => setActiveTab('export')} className={tabButtonClass('export')}>ส่งออกผลงาน</button>
      </div>

      {/* Templates Section */}
      {activeTab === 'templates' && (
        <div className="animate-fadeIn">
           <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
            <div className={`relative flex-grow sm:max-w-xs w-full`}>
              <input type="text" placeholder="ค้นหาแม่แบบ..." value={templateSearchTerm} onChange={(e) => setTemplateSearchTerm(e.target.value)} className={`w-full py-2 pl-10 pr-3 rounded-lg ${inputFieldBaseClasses.replace('px-4 py-3', 'px-3 py-2')}`} />
              <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${currentTheme.textSecondary} opacity-60`} />
            </div>
            <button onClick={() => { resetTemplateForm(); setShowTemplateModal(true); }} className={`${currentTheme.button} ${currentTheme.buttonText} px-4 py-2 rounded-lg transition-colors hover:opacity-90 text-sm flex items-center gap-1.5`}>
              <Plus size={16} /> สร้างแม่แบบ
            </button>
          </div>
          {filteredUserTemplates.length === 0 ? (
            <p className={`${currentTheme.textSecondary} italic text-center py-6`}>{templateSearchTerm ? 'ไม่พบแม่แบบ' : 'ยังไม่มีแม่แบบที่สร้างเอง'}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUserTemplates.map(template => (
                <div key={template.id} className={`${currentTheme.cardBg} rounded-lg p-4 flex flex-col justify-between group`}>
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-semibold ${currentTheme.text} text-md truncate flex items-center`}>
                        {template.icon && <span className="mr-2 text-lg" aria-hidden="true">{template.icon}</span>}
                        {!template.icon && getCategoryIcon(template.category || 'general')}
                        <span className="ml-1">{template.name}</span>
                      </h4>
                      <div className="flex gap-1">
                        <button onClick={() => handleEditTemplate(template)} className={`p-1 ${currentTheme.textSecondary} opacity-50 hover:opacity-100`} title="แก้ไข"><Edit2 size={14}/></button>
                        <button onClick={() => handleDeleteTemplate(template.id)} className={`p-1 text-red-400 opacity-50 hover:opacity-100`} title="ลบ"><Trash2 size={14}/></button>
                      </div>
                    </div>
                    {template.category && <p className={`text-xs ${currentTheme.textSecondary} opacity-70 mb-0.5 flex items-center`}><Tag size={12} className="mr-1 opacity-70"/> {template.category}</p>}
                    <p className={`${currentTheme.textSecondary} opacity-80 text-xs line-clamp-2`}>{template.content || "ไม่มีเนื้อหา"}</p>
                  </div>
                  <span className={`text-xs ${currentTheme.textSecondary} opacity-60 mt-2`}>สร้าง: {new Date(template.createdAt).toLocaleDateString('th-TH', { day:'2-digit', month:'short' })}</span>
                </div>
              ))}
            </div>
          )}
          {showTemplateModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
              <div className={`${currentTheme.cardBg} rounded-xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto`}>
                <h3 className={`text-lg font-semibold ${currentTheme.text} mb-4`}>{editingTemplate ? 'แก้ไขแม่แบบ' : 'สร้างแม่แบบใหม่'}</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <EmojiPicker selectedEmoji={currentTemplateData.icon} onEmojiSelect={handleTemplateIconChange} currentTheme={currentTheme} />
                    <input type="text" placeholder="ชื่อแม่แบบ" value={currentTemplateData.name} onChange={(e) => handleTemplateInputChange('name', e.target.value)} className={`flex-grow h-11 ${inputFieldBaseClasses.replace('px-4 py-3', 'px-3 py-2')}`} />
                  </div>
                  <select value={currentTemplateData.category} onChange={(e) => handleTemplateCategoryChange(e.target.value)} className={`w-full ${inputFieldBaseClasses.replace('px-4 py-3', 'px-3 py-2')} appearance-none bg-no-repeat bg-right-3`} style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1.25em' }}>
                    <option value="general" className={optionClasses}>ทั่วไป</option><option value="writing" className={optionClasses}>การเขียน</option><option value="plot" className={optionClasses}>โครงเรื่อง</option><option value="character" className={optionClasses}>ตัวละคร</option> {/* Add more as needed */}
                  </select>
                  <textarea placeholder="เนื้อหาแม่แบบ (Markdown)" value={currentTemplateData.content} onChange={(e) => handleTemplateInputChange('content', e.target.value)} rows={6} className={`w-full ${inputFieldBaseClasses.replace('px-4 py-3', 'px-3 py-2')} resize-y`} />
                </div>
                <div className="flex gap-2 mt-5">
                  <button onClick={() => { setShowTemplateModal(false); resetTemplateForm(); }} className={`flex-1 py-2 rounded-lg ${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} hover:${currentTheme.buttonSecondaryHoverBg}`}>ยกเลิก</button>
                  <button onClick={handleSaveTemplate} className={`flex-1 py-2 rounded-lg ${currentTheme.button} ${currentTheme.buttonText}`}>{editingTemplate ? 'บันทึก' : 'สร้าง'}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Longform Section */}
      {activeTab === 'longform' && (
         <div className="animate-fadeIn">
          <div className="flex justify-end mb-4">
            <button onClick={handleOpenNewLongformModal} className={`${currentTheme.button} ${currentTheme.buttonText} px-4 py-2 rounded-lg transition-colors hover:opacity-90 text-sm flex items-center gap-1.5`}>
              <Plus size={16} /> สร้างเอกสาร Longform
            </button>
          </div>
          {projectLongformDocuments.length === 0 ? (
            <p className={`${currentTheme.textSecondary} italic text-center py-6`}>ยังไม่มีเอกสาร Longform</p>
          ) : (
            <div className="space-y-3">
              {projectLongformDocuments.map(doc => (
                <div key={doc.id} className={`${currentTheme.cardBg} p-4 rounded-lg shadow-sm group`}>
                  <div className="flex justify-between items-center">
                    <h4 className={`${currentTheme.text} font-semibold`}>{doc.title}</h4>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenEditLongformModal(doc)} className={`p-1 ${currentTheme.textSecondary} hover:opacity-100`} title="แก้ไข"><Edit2 size={16}/></button>
                      <button onClick={() => handleDeleteLongformDocument(doc.id)} className={`p-1 text-red-400 hover:opacity-100`} title="ลบ"><Trash2 size={16}/></button>
                    </div>
                  </div>
                  <p className={`text-xs ${currentTheme.textSecondary}`}>จำนวนรายการ: {doc.items.length}</p>
                  <p className={`text-xs ${currentTheme.textSecondary}`}>แก้ไขล่าสุด: {new Date(doc.updatedAt).toLocaleDateString('th-TH')}</p>
                </div>
              ))}
            </div>
          )}
          {showLongformModal && (
            <LongformDocumentModal
              show={showLongformModal}
              onClose={() => { setShowLongformModal(false); setEditingLongformDoc(null);}}
              onSave={handleSaveLongformDocument}
              existingDoc={editingLongformDoc}
              notes={notes.filter(n => !activeProjectId || n.projectId === activeProjectId)} // Pass project-specific notes
              currentTheme={currentTheme}
            />
          )}
        </div>
      )}

      {/* Export Section */}
      {activeTab === 'export' && (
         <div className="animate-fadeIn grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className={`${currentTheme.cardBg} p-5 rounded-xl shadow-sm space-y-5`}>
            <div>
              <label className={`block text-sm font-medium ${currentTheme.textSecondary} mb-1`}>1. เลือกสิ่งที่จะส่งออก:</label>
              <div className="flex gap-2 mb-2">
                {(['note', 'longform'] as const).map(type => (
                  <button key={type} onClick={() => {setExportItemType(type); setSelectedExportItemId(null); setExportPreviewHtml(null);}}
                    className={`flex-1 py-2 px-3 rounded-md text-sm ${exportItemType === type ? `${currentTheme.button} ${currentTheme.buttonText}` : `${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText}`}`}>
                    {type === 'note' ? 'โน้ตเดี่ยว' : 'เอกสาร Longform'}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input type="text" placeholder={`ค้นหา ${exportItemType === 'note' ? 'โน้ต' : 'เอกสาร Longform'}...`} value={exportSearchTerm} onChange={(e) => setExportSearchTerm(e.target.value)} className={`${inputFieldBaseClasses.replace('px-4 py-3', 'px-3 py-2')} pl-9 w-full`}/>
                <Search className={`w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 ${currentTheme.textSecondary} opacity-60`} />
              </div>
              <div className="mt-1.5 max-h-48 overflow-y-auto border rounded-md p-1">
                {(exportItemType === 'note' ? availableNotesForExport : availableLongformDocsForExport).map(item => (
                  <button key={item.id} onClick={() => {setSelectedExportItemId(item.id); setExportPreviewHtml(null);}}
                    className={`w-full text-left p-1.5 text-xs rounded truncate ${selectedExportItemId === item.id ? `${currentTheme.accent} ${currentTheme.buttonText}` : `${currentTheme.textSecondary} hover:${currentTheme.inputBg}`}`}>
                    {(item as AppNote).icon && <span className="mr-1">{(item as AppNote).icon}</span>}{item.title}
                  </button>
                ))}
              </div>
            </div>

            {selectedExportItemId && (<>
              <div>
                <label htmlFor="export-template-hub" className={`block text-sm font-medium ${currentTheme.textSecondary} mb-1`}>2. เลือกเทมเพลต:</label>
                <select id="export-template-hub" value={selectedExportTemplateId} onChange={(e) => {setSelectedExportTemplateId(e.target.value); setExportPreviewHtml(null);}} className={`${inputFieldBaseClasses.replace('px-4 py-3', 'px-3 py-2')} w-full appearance-none bg-no-repeat bg-right-3`} style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1.25em' }}>
                  {exportTemplates.map(template => (<option key={template.id} value={template.id} className={optionClasses}>{template.name}</option>))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${currentTheme.textSecondary} mb-1`}>3. เลือกรูปแบบไฟล์:</label>
                <div className="flex gap-2">
                  {(['html', 'pdf'] as const).map(format => (
                    <button key={format} onClick={() => setSelectedExportFormat(format)} className={`flex-1 py-1.5 px-2 rounded-md text-xs ${selectedExportFormat === format ? `${currentTheme.button} ${currentTheme.buttonText}` : `${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText}`}`}>
                      {format.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={generateExportPreview} disabled={isExportLoading} className={`${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 text-xs w-full hover:opacity-90 disabled:opacity-50`}>
                  {isExportLoading && exportPreviewHtml === null ? <Loader2 className="w-3 h-3 animate-spin"/> : <Eye className="w-3 h-3"/>} ตัวอย่าง
                </button>
                <button onClick={handleExport} disabled={isExportLoading} className={`${currentTheme.button} ${currentTheme.buttonText} px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 text-xs w-full hover:scale-105 disabled:opacity-50`}>
                  {isExportLoading && exportPreviewHtml !== null ? <Loader2 className="w-3 h-3 animate-spin"/> : <Download className="w-3 h-3"/>} ส่งออก
                </button>
              </div>
              {exportError && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertTriangle size={14} className="mr-1"/> {exportError}</p>}
            </>)}
           {!selectedExportItemId && <p className={`${currentTheme.textSecondary} text-center italic text-xs py-3`}>เลือกรายการเพื่อส่งออก</p>}
           </div>
           <div className={`${currentTheme.cardBg} p-1 rounded-xl shadow-sm min-h-[300px]`}>
             <div className={`w-full h-full rounded-lg border ${currentTheme.inputBorder} overflow-hidden`}>
                {isExportLoading && exportPreviewHtml === null && <div className="flex flex-col items-center justify-center h-full"><Loader2 className={`w-8 h-8 ${currentTheme.accentText} animate-spin`}/><p className={`${currentTheme.textSecondary} text-xs mt-2`}>กำลังสร้างตัวอย่าง...</p></div>}
                {!isExportLoading && exportPreviewHtml && <iframe srcDoc={exportPreviewHtml} title="ตัวอย่างส่งออก" className="w-full h-full border-0"/>}
                {!isExportLoading && !exportPreviewHtml && !exportError && <div className="flex flex-col items-center justify-center h-full text-center"><FileTextIcon size={36} className={`${currentTheme.textSecondary} opacity-40`}/><p className={`${currentTheme.textSecondary} opacity-60 text-xs mt-2`}>{selectedExportItemId ? 'คลิก "ดูตัวอย่าง"' : 'เลือกรายการและเทมเพลต'}</p></div>}
                {!isExportLoading && !exportPreviewHtml && exportError && <div className="flex flex-col items-center justify-center h-full text-center"><AlertTriangle size={36} className="text-red-400"/><p className="text-red-400 text-xs mt-2">{exportError}</p></div>}
             </div>
           </div>
         </div>
      )}
    </div>
  );
};

export default PublishingHubPage;
