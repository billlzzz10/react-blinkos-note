
import React, { useState, useMemo } from 'react';
import { AppNote, AppTheme, ExportTemplate } from './types';
import { Download, FileText, Search, Loader2, AlertTriangle, Eye } from 'lucide-react';

interface ExportPageProps {
  notes: AppNote[];
  currentTheme: AppTheme;
  exportTemplates: ExportTemplate[];
  activeProjectId: string | null;
}

const ExportPage: React.FC<ExportPageProps> = ({
  notes,
  currentTheme,
  exportTemplates,
  activeProjectId,
}) => {
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(exportTemplates[0]?.id || '');
  const [selectedFormat, setSelectedFormat] = useState<'html' | 'pdf'>('html');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const projectNotes = useMemo(() => {
    return notes
      .filter(note => !activeProjectId || note.projectId === activeProjectId)
      .filter(note => note.title.toLowerCase().includes(searchTerm.toLowerCase()) || note.content.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
  }, [notes, activeProjectId, searchTerm]);

  const selectedNote = useMemo(() => {
    return notes.find(note => note.id === selectedNoteId);
  }, [notes, selectedNoteId]);

  const selectedTemplate = useMemo(() => {
    return exportTemplates.find(template => template.id === selectedTemplateId);
  }, [exportTemplates, selectedTemplateId]);

  const generatePreview = async () => {
    if (!selectedNote || !selectedTemplate) {
      setPreviewHtml(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const noteContentHtml = window.marked?.parse(selectedNote.content || '') || `<p>${selectedNote.content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`;
      const templateCss = selectedTemplate.getCss(currentTheme);
      const fullHtml = selectedTemplate.getHtmlWrapper(noteContentHtml, selectedNote.title, templateCss, currentTheme);
      setPreviewHtml(fullHtml);
    } catch (e: any) {
      console.error("Error generating preview:", e);
      setError(`เกิดข้อผิดพลาดในการสร้างตัวอย่าง: ${e.message}`);
      setPreviewHtml(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExport = async () => {
    if (!selectedNote || !selectedTemplate) {
      alert('กรุณาเลือกโน้ตและเทมเพลตสำหรับส่งออก');
      return;
    }
    setIsLoading(true);
    setError(null);
    setPreviewHtml(null); // Clear previous preview

    try {
      const noteContentHtml = window.marked?.parse(selectedNote.content || '') || `<p>${selectedNote.content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`;
      const templateCss = selectedTemplate.getCss(currentTheme);
      const fullHtml = selectedTemplate.getHtmlWrapper(noteContentHtml, selectedNote.title, templateCss, currentTheme);
      
      const safeTitle = selectedNote.title.replace(/[^a-z0-9ก-๙เ-ไฯ-ูเ-์]+/gi, '_').toLowerCase() || 'exported_note';

      if (selectedFormat === 'html') {
        const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${safeTitle}_${selectedTemplate.id}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('ส่งออกเป็น HTML สำเร็จ!');
      } else if (selectedFormat === 'pdf') {
        if (window.html2pdf) {
          const element = document.createElement('div');
          element.innerHTML = fullHtml;
          // Temporarily append to body for html2pdf to measure, then remove
          // This is a workaround if html2pdf has issues with detached elements.
          // Ideally, it should work with the HTML string directly, but this is more robust.
          document.body.appendChild(element);
          
          await window.html2pdf().from(element).set({
            margin: [10, 10, 10, 10], // Margins: top, left, bottom, right in mm
            filename: `${safeTitle}_${selectedTemplate.id}.pdf`,
            html2canvas: { scale: 2, useCORS: true, logging: false }, // Higher scale for better quality
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
          }).save();
          
          document.body.removeChild(element); // Clean up
          alert('ส่งออกเป็น PDF สำเร็จ!');
        } else {
          throw new Error('ไลบรารี html2pdf ไม่พร้อมใช้งาน');
        }
      }
    } catch (e: any) {
      console.error("Export failed:", e);
      setError(`การส่งออกล้มเหลว: ${e.message}`);
      alert(`การส่งออกล้มเหลว: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const inputBaseClass = `w-full p-2.5 rounded-lg ${currentTheme.inputBg || currentTheme.input} ${currentTheme.inputText || currentTheme.text} border ${currentTheme.inputBorder || 'border-gray-300 dark:border-slate-600'} focus:outline-none focus:ring-2 ${currentTheme.focusRing || 'focus:ring-indigo-500'} text-sm`;
  const selectBaseClass = `${inputBaseClass} appearance-none bg-no-repeat bg-right-2.5`;
  const isDarkTheme = currentTheme.name === 'Deep Space' || currentTheme.name === 'Midnight Navy';
  const selectArrowSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='${isDarkTheme ? '%23CBD5E1' : '%236B7280'}'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E`;
  const optionClasses = `${isDarkTheme ? 'bg-slate-700 text-slate-200' : 'bg-white text-gray-800'}`;

  return (
    <div className="py-6">
      <h2 className={`text-2xl sm:text-3xl font-semibold ${currentTheme.text} mb-8 text-center flex items-center justify-center`}>
        <Download className={`w-7 h-7 mr-3 ${currentTheme.accentText || currentTheme.accent.replace('bg-', 'text-')}`} />
        ส่งออกโน้ต
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column 1: Note Selection and Options */}
        <div className={`${currentTheme.cardBg} p-5 sm:p-6 rounded-xl shadow-lg space-y-6`}>
          <div>
            <label htmlFor="note-search" className={`block text-sm font-medium ${currentTheme.textSecondary} mb-1.5`}>ค้นหาและเลือกโน้ต:</label>
            <div className="relative">
              <input
                type="text"
                id="note-search"
                placeholder="พิมพ์เพื่อค้นหาโน้ต..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${inputBaseClass} pl-10`}
              />
              <Search className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 ${currentTheme.textSecondary} opacity-60`} />
            </div>
            <div className="mt-2 max-h-60 overflow-y-auto border rounded-md custom-scrollbar p-1">
              {projectNotes.length === 0 && <p className={`${currentTheme.textSecondary} text-xs italic p-2`}>ไม่พบโน้ตที่ตรงกัน</p>}
              {projectNotes.map(note => (
                <button
                  key={note.id}
                  onClick={() => { setSelectedNoteId(note.id); setPreviewHtml(null);}}
                  className={`w-full text-left p-2 text-sm rounded-md truncate ${
                    selectedNoteId === note.id 
                      ? `${currentTheme.accent} ${currentTheme.buttonText || 'text-white'}` 
                      : `${currentTheme.textSecondary} hover:${currentTheme.inputBg}`
                  }`}
                >
                  {note.icon && <span className="mr-1.5">{note.icon}</span>}
                  {note.title}
                </button>
              ))}
            </div>
          </div>

          {selectedNote && (
            <>
              <div>
                <label htmlFor="export-template" className={`block text-sm font-medium ${currentTheme.textSecondary} mb-1.5`}>เลือกเทมเพลตส่งออก:</label>
                <select
                  id="export-template"
                  value={selectedTemplateId}
                  onChange={(e) => {setSelectedTemplateId(e.target.value); setPreviewHtml(null);}}
                  className={selectBaseClass}
                  style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1.25em' }}
                >
                  {exportTemplates.map(template => (
                    <option key={template.id} value={template.id} className={optionClasses}>
                      {template.name}
                    </option>
                  ))}
                </select>
                {selectedTemplate && <p className={`text-xs ${currentTheme.textSecondary} opacity-80 mt-1`}>{selectedTemplate.description}</p>}
              </div>

              <div>
                <label className={`block text-sm font-medium ${currentTheme.textSecondary} mb-1.5`}>เลือกรูปแบบไฟล์:</label>
                <div className="flex gap-3">
                  {(['html', 'pdf'] as const).map(format => (
                    <button
                      key={format}
                      onClick={() => setSelectedFormat(format)}
                      className={`flex-1 py-2 px-3 rounded-md text-sm transition-colors ${
                        selectedFormat === format 
                          ? `${currentTheme.button} ${currentTheme.buttonText || 'text-white'}` 
                          : `${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText}`
                      }`}
                    >
                      {format.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={generatePreview}
                  disabled={isLoading || !selectedNote || !selectedTemplate}
                  className={`${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm w-full hover:opacity-90 disabled:opacity-50`}
                >
                  {isLoading && previewHtml === null ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                  {isLoading && previewHtml === null ? 'กำลังสร้าง...' : 'ดูตัวอย่าง'}
                </button>
                <button
                  onClick={handleExport}
                  disabled={isLoading || !selectedNote || !selectedTemplate}
                  className={`${currentTheme.button} ${currentTheme.buttonText || 'text-white'} px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm w-full hover:scale-105 disabled:opacity-50`}
                >
                  {isLoading && previewHtml !== null ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {isLoading && previewHtml !== null ? 'กำลังส่งออก...' : `ส่งออกเป็น ${selectedFormat.toUpperCase()}`}
                </button>
              </div>
               {error && <p className="text-red-500 text-sm mt-2 flex items-center"><AlertTriangle size={16} className="mr-1.5"/> {error}</p>}
            </>
          )}
           {!selectedNote && <p className={`${currentTheme.textSecondary} text-center italic py-4`}>กรุณาเลือกโน้ตเพื่อดูตัวเลือกการส่งออก</p>}
        </div>

        {/* Column 2: Preview Area */}
        <div className={`${currentTheme.cardBg} p-1 sm:p-2 rounded-xl shadow-lg min-h-[400px]`}>
          <div className={`w-full h-full rounded-lg border ${currentTheme.inputBorder} overflow-hidden`}>
            {isLoading && previewHtml === null && (
              <div className="flex flex-col items-center justify-center h-full p-4">
                <Loader2 className={`w-10 h-10 ${currentTheme.accentText || currentTheme.accent.replace('bg-','text-')} animate-spin mb-3`} />
                <p className={`${currentTheme.textSecondary}`}>กำลังสร้างตัวอย่าง...</p>
              </div>
            )}
            {!isLoading && previewHtml && (
              <iframe
                srcDoc={previewHtml}
                title="ตัวอย่างการส่งออก"
                className="w-full h-full border-0"
                sandbox="allow-scripts" // Be cautious with scripts if content can be user-generated with script tags
              />
            )}
            {!isLoading && !previewHtml && !error && (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <FileText size={48} className={`${currentTheme.textSecondary} opacity-50 mb-3`} />
                <p className={`${currentTheme.textSecondary} opacity-70`}>
                  {selectedNote ? 'คลิก "ดูตัวอย่าง" เพื่อแสดงผลลัพธ์ที่นี่' : 'เลือกโน้ตเพื่อเริ่มการส่งออก'}
                </p>
              </div>
            )}
             {!isLoading && !previewHtml && error && (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                    <AlertTriangle size={48} className="text-red-500 mb-3" />
                    <p className={`${currentTheme.textSecondary} opacity-70`}>ไม่สามารถแสดงตัวอย่างได้</p>
                    <p className="text-red-500 text-xs mt-1">{error}</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPage;
