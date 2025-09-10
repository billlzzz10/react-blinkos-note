
import React, { useState, useEffect } from 'react';
import { AppNote, NoteVersion, NoteLink, AppTheme } from './types'; // Added NoteLink and AppTheme
import { Eye, XCircle, Edit3, Share2, GitFork, RotateCcw, Thermometer, BookCheck, FileCode, Package, Link, Link2, Image as ImageIcon } from 'lucide-react'; 

interface ViewNoteModalProps {
  showModal: boolean;
  noteToView: AppNote | null;
  allNotes: AppNote[]; 
  onClose: () => void;
  onEdit: (note: AppNote) => void;
  onExportMd: (note: AppNote) => void;
  onRevertVersion: (noteId: number, versionTimestamp: string) => void; 
  getCategoryIcon: (category: string) => JSX.Element;
  currentTheme: AppTheme;
  projectName?: string; 
  onTriggerAiAnalysis: (noteContent: string, mode: 'tone-sentiment-analysis' | 'lore-consistency-check') => void;
  onViewNoteById: (noteId: number) => void; 
}

const ViewNoteModal: React.FC<ViewNoteModalProps> = ({
  showModal,
  noteToView,
  allNotes,
  onClose,
  onEdit,
  onExportMd,
  onRevertVersion,
  getCategoryIcon,
  currentTheme,
  projectName,
  onTriggerAiAnalysis,
  onViewNoteById,
}) => {
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [backlinks, setBacklinks] = useState<AppNote[]>([]);
  const [forwardLinks, setForwardLinks] = useState<NoteLink[]>([]);
  const [renderedContent, setRenderedContent] = useState<string>('');

  useEffect(() => {
    if (noteToView && noteToView.content) {
      try {
        if (window.marked) {
          let contentWithClickableLinks = noteToView.content;
          contentWithClickableLinks = contentWithClickableLinks.replace(
            /\[\[(.*?)\]\]/g,
            (match, fullLinkContent) => {
              const pipeIndex = fullLinkContent.indexOf('|');
              const targetTitle = (pipeIndex !== -1 ? fullLinkContent.substring(0, pipeIndex) : fullLinkContent).trim();
              const displayTitle = (pipeIndex !== -1 ? fullLinkContent.substring(pipeIndex + 1) : fullLinkContent).trim();
              
              const targetNote = allNotes.find(n => n.title.toLowerCase() === targetTitle.toLowerCase());
              if (targetNote) {
                const accentColorClass = currentTheme.accentText || currentTheme.accent.replace('bg-', 'text-');
                return `<button data-note-id="${targetNote.id}" class="${accentColorClass} hover:underline cursor-pointer">[${displayTitle}]</button>`;
              }
              return `<span class="text-gray-400 dark:text-gray-500 italic">[${displayTitle} - ไม่พบโน้ต]</span>`; 
            }
          );
          setRenderedContent(window.marked.parse(contentWithClickableLinks));
        } else {
          setRenderedContent(`<pre>${noteToView.content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`);
        }
      } catch (e) {
        console.error("Error parsing markdown:", e);
        setRenderedContent(`<pre>${noteToView.content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`);
      }
    } else {
      setRenderedContent('');
    }
  }, [noteToView, allNotes, currentTheme.accent, currentTheme.accentText]); 
  
  useEffect(() => {
    if (!showModal || !noteToView) return;

    const contentArea = document.querySelector('.note-content-view-area'); 
    if (!contentArea) return;

    const handleClick = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'BUTTON' && target.dataset.noteId) {
        const noteIdToOpen = parseInt(target.dataset.noteId, 10);
        if (!isNaN(noteIdToOpen)) {
          onClose(); 
          setTimeout(() => onViewNoteById(noteIdToOpen), 0); // Use timeout to ensure modal is closed
        }
      }
    };

    contentArea.addEventListener('click', handleClick);
    return () => {
      contentArea.removeEventListener('click', handleClick);
    };
  }, [renderedContent, showModal, noteToView, onViewNoteById, onClose]);


  useEffect(() => {
    if (noteToView && allNotes) {
      const foundBacklinks = allNotes.filter(otherNote => {
        if (otherNote.id === noteToView.id) return false;
        return (otherNote.links || []).some(link => link.targetTitle.toLowerCase() === noteToView.title.toLowerCase());
      });
      setBacklinks(foundBacklinks);
      setForwardLinks(noteToView.links || []);
    } else {
      setBacklinks([]);
      setForwardLinks([]);
    }
  }, [noteToView, allNotes]);

  const checkHasYamlFrontmatter = (contentStr: string | undefined | null): boolean => {
    if (!contentStr) return false;
    const lines = contentStr.split('\n');
    if (lines.length < 2) return false; 
    if (lines[0].trim() !== '---') return false;

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        return true; 
      }
    }
    return false; 
  };

  const hasYaml = noteToView ? checkHasYamlFrontmatter(noteToView.content) : false;
  
  if (!showModal || !noteToView) return null;

  const sortedVersions = noteToView.versions?.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) || [];

  const getTitleFromYaml = (yamlString: string): string | null => {
    const match = yamlString.match(/^title:\s*(.*)$/m);
    return match && match[1] ? match[1].trim() : null;
  };

  const handleExportFormattedMarkdown = () => {
    if (!noteToView || !hasYaml) {
      alert("ไม่พบ YAML frontmatter หรือรูปแบบไม่ถูกต้อง");
      return;
    }

    const lines = noteToView.content.split('\n');
    let yamlLines: string[] = [];
    let contentLines: string[] = [];
    let inYamlBlock = false;
    let pastYamlBlock = false;

    if (lines[0].trim() === '---') {
      inYamlBlock = true;
    } else {
      alert("รูปแบบ Frontmatter ไม่ถูกต้อง (ไม่เริ่มต้นด้วย ---)");
      return;
    }

    for (let i = 1; i < lines.length; i++) {
      if (inYamlBlock && lines[i].trim() === '---') {
        inYamlBlock = false;
        pastYamlBlock = true;
        continue; 
      }
      if (inYamlBlock) {
        yamlLines.push(lines[i]);
      }
      if (pastYamlBlock) {
        contentLines.push(lines[i]);
      }
    }
    
    const yamlBlockString = yamlLines.join('\n');
    const mainContentString = contentLines.join('\n').trimStart();

    let rawFileName = getTitleFromYaml(yamlBlockString) || noteToView.title || 'formatted_note';
    let fileName = rawFileName
      .replace(/[\s\/\\?%*:|"<>]/g, '_') 
      .replace(/_{2,}/g, '_'); 
    fileName = `${fileName || 'formatted_note'}.md`;

    const fullMdContent = `---
${yamlBlockString}
---

${mainContentString}`;

    const blob = new Blob([fullMdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isDarkTheme = currentTheme.text === 'text-white' || currentTheme.text === 'text-slate-100' || currentTheme.text === 'text-slate-200';
  const secondaryButtonClass = `${currentTheme.buttonSecondaryBg || (isDarkTheme ? 'bg-slate-700' : 'bg-gray-200')} ${currentTheme.buttonSecondaryText || (isDarkTheme ? 'text-slate-200' : 'text-gray-700')} hover:opacity-80`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-40 p-4">
      <div className={`${currentTheme.cardBg} rounded-2xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]`}>
        <div className="flex justify-between items-start mb-4">
          <h3 className={`text-2xl font-semibold ${currentTheme.text} flex items-center break-all`}>
            {noteToView.icon && <span className="mr-2 text-2xl flex-shrink-0" role="img" aria-hidden="true">{noteToView.icon}</span>}
            {!noteToView.icon && (!noteToView.coverImageUrl && <Eye className={`w-6 h-6 mr-2 ${currentTheme.accentText || currentTheme.accent.replace('bg-', 'text-')} flex-shrink-0`} />)}
            {!noteToView.icon && (noteToView.coverImageUrl && <ImageIcon className={`w-6 h-6 mr-2 ${currentTheme.accentText || currentTheme.accent.replace('bg-', 'text-')} flex-shrink-0`} />)}
            {noteToView.title}
          </h3>
          <button
            onClick={() => { onClose(); setShowVersionHistory(false); }}
            className={`${currentTheme.textSecondary || currentTheme.text} hover:opacity-70 transition-opacity ml-2 flex-shrink-0`}
            aria-label="ปิดหน้าต่างดูโน้ต"
          >
            <XCircle className="w-7 h-7" />
          </button>
        </div>
        
        {noteToView.coverImageUrl && (
          <div className="mb-4 -mx-6 sm:-mx-8 -mt-4 rounded-t-2xl overflow-hidden shadow-inner">
            <img 
                src={noteToView.coverImageUrl} 
                alt={`ภาพปกสำหรับ ${noteToView.title}`} 
                className="w-full h-48 object-cover" 
                onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>
        )}

        <div className="flex items-center gap-x-4 gap-y-1 mb-1 text-xs sm:text-sm ${currentTheme.textSecondary || currentTheme.text} opacity-80 flex-wrap">
          <span className="flex items-center gap-1.5">
            {getCategoryIcon(noteToView.category)} {noteToView.category}
          </span>
          <span className="hidden sm:inline">|</span>
          <span className="whitespace-nowrap">
            สร้าง: {new Date(noteToView.createdAt).toLocaleString('th-TH', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
          {noteToView.updatedAt && (
            <>
              <span className="hidden sm:inline">|</span>
              <span className="whitespace-nowrap">
                  แก้ไข: {new Date(noteToView.updatedAt).toLocaleString('th-TH', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </>
          )}
        </div>
         {projectName && (
            <div className={`text-xs sm:text-sm ${currentTheme.textSecondary || currentTheme.text} opacity-70 mb-3 flex items-center`}>
                <Package size={14} className="mr-1.5 opacity-80"/> โปรเจกต์: {projectName}
            </div>
        )}

        {noteToView.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-4">
            {noteToView.tags.map(tag => (
              <span key={tag} className={`${currentTheme.accent} bg-opacity-20 text-xs px-2.5 py-1 rounded-full ${currentTheme.accentText || currentTheme.text} opacity-90`}>
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        <div
          className={`note-content-view-area flex-grow min-h-[200px] max-h-[35vh] sm:max-h-[40vh] overflow-y-auto p-3 rounded-lg ${currentTheme.inputBg || currentTheme.input} bg-opacity-50 text-sm mb-4 prose-sm ${isDarkTheme ? 'prose-dark' : ''} max-w-none custom-scrollbar`}
          style={{fontFamily: 'Sarabun, sans-serif'}}
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />

        {(forwardLinks.length > 0 || backlinks.length > 0) && (
            <div className={`grid ${forwardLinks.length > 0 && backlinks.length > 0 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-4 mb-4`}>
                {forwardLinks.length > 0 && (
                <div>
                    <h4 className={`text-sm font-semibold ${currentTheme.textSecondary || currentTheme.text} opacity-90 mb-1.5 flex items-center`}>
                    <Link2 size={14} className="mr-1.5 opacity-80"/> ลิงก์ไปยัง: ({forwardLinks.length})
                    </h4>
                    <div className={`max-h-[100px] overflow-y-auto p-2 rounded-md ${currentTheme.inputBg || currentTheme.input} bg-opacity-40 space-y-1.5 custom-scrollbar`}>
                    {forwardLinks.map((link, index) => {
                        const targetNote = allNotes.find(n => n.title.toLowerCase() === link.targetTitle.toLowerCase());
                        return (
                        <button
                            key={`${link.targetTitle}-${index}`}
                            onClick={() => {
                            if (targetNote) {
                                onClose(); 
                                setTimeout(() => onViewNoteById(targetNote.id),0);
                            }
                            }}
                            disabled={!targetNote}
                            className={`${targetNote ? `${currentTheme.cardBg} bg-opacity-60 hover:bg-opacity-80 ${currentTheme.text}` : `${currentTheme.cardBg} bg-opacity-40 text-gray-500 italic cursor-not-allowed`} p-2 rounded text-xs w-full text-left flex items-center gap-1.5 transition-colors`}
                            title={targetNote ? `เปิดโน้ต: ${link.targetTitle}` : `ไม่พบโน้ต: ${link.targetTitle}`}
                        >
                            {targetNote?.icon && <span className="text-sm flex-shrink-0" role="img" aria-hidden="true">{targetNote.icon}</span>}
                            {!targetNote?.icon && targetNote && getCategoryIcon(targetNote.category)}
                            <span className="truncate">{link.targetTitle}</span>
                            {!targetNote && <span className="text-xs opacity-60 ml-auto">(ไม่พบ)</span>}
                        </button>
                        );
                    })}
                    </div>
                </div>
                )}

                {backlinks.length > 0 && (
                <div>
                    <h4 className={`text-sm font-semibold ${currentTheme.textSecondary || currentTheme.text} opacity-90 mb-1.5 flex items-center`}><Link size={14} className="mr-1.5 opacity-80"/> ลิงก์มายังโน้ตนี้ ({backlinks.length}):</h4>
                    <div className={`max-h-[100px] overflow-y-auto p-2 rounded-md ${currentTheme.inputBg || currentTheme.input} bg-opacity-40 space-y-1.5 custom-scrollbar`}>
                    {backlinks.map(backlink => (
                        <button
                        key={backlink.id}
                        onClick={() => {
                            onClose(); 
                            setTimeout(() => onViewNoteById(backlink.id),0); 
                        }}
                        className={`${currentTheme.cardBg} bg-opacity-60 hover:bg-opacity-80 p-2 rounded text-xs w-full text-left flex items-center gap-1.5 ${currentTheme.text} transition-colors`}
                        title={`เปิดโน้ต: ${backlink.title}`}
                        >
                        {backlink.icon && <span className="text-sm flex-shrink-0" role="img" aria-hidden="true">{backlink.icon}</span>}
                        {!backlink.icon && getCategoryIcon(backlink.category)}
                        <span className="truncate">{backlink.title}</span>
                        <span className="text-xs opacity-60 ml-auto">({backlink.category})</span>
                        </button>
                    ))}
                    </div>
                </div>
                )}
            </div>
        )}

        {showVersionHistory && (
          <div className="mb-4">
            <h4 className={`text-md font-semibold ${currentTheme.text} mb-2`}>ประวัติการแก้ไข ({sortedVersions.length} เวอร์ชัน):</h4>
            {sortedVersions.length > 0 ? (
              <div className={`max-h-[150px] overflow-y-auto p-2 rounded-md ${currentTheme.inputBg || currentTheme.input} bg-opacity-40 space-y-2 custom-scrollbar`}>
                {sortedVersions.map((version) => (
                  <div key={version.timestamp} className={`${currentTheme.cardBg} bg-opacity-50 p-2 rounded flex justify-between items-center text-xs`}>
                    <span>
                      บันทึกเมื่อ: {new Date(version.timestamp).toLocaleString('th-TH', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                    </span>
                    <button
                      onClick={() => {
                        if(confirm('คุณต้องการย้อนกลับไปใช้เวอร์ชันนี้หรือไม่? การเปลี่ยนแปลงปัจจุบัน (ที่ยังไม่บันทึกเป็นเวอร์ชันใหม่) จะถูกเพิ่มเข้าประวัติก่อนย้อนกลับ')) {
                            onRevertVersion(noteToView.id, version.timestamp);
                        }
                      }}
                      className={`${currentTheme.button} ${currentTheme.buttonText || 'text-white'} px-2 py-1 rounded text-xs hover:scale-105 flex items-center gap-1`}
                    >
                      <RotateCcw className="w-3 h-3"/> ย้อนกลับเป็นเวอร์ชันนี้
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`${currentTheme.textSecondary || currentTheme.text} opacity-70 text-xs italic`}>ไม่มีประวัติการแก้ไขสำหรับโน้ตนี้</p>
            )}
          </div>
        )}
        
        <div className={`mt-auto flex flex-col sm:flex-row justify-between gap-2 pt-4 border-t ${currentTheme.divider || 'border-white/10'}`}>
            <div className="flex flex-wrap gap-2">
                 <button
                    onClick={() => setShowVersionHistory(!showVersionHistory)}
                    className={`${secondaryButtonClass} px-3 py-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 text-xs sm:text-sm`}
                    title="ดูประวัติการแก้ไข"
                >
                    <GitFork className="w-3.5 h-3.5 sm:w-4 sm:h-4"/> ประวัติ ({sortedVersions.length})
                </button>
                <button
                    onClick={() => onTriggerAiAnalysis(noteToView.content, 'tone-sentiment-analysis')}
                    className={`${secondaryButtonClass} px-3 py-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 text-xs sm:text-sm`}
                    title="AI วิเคราะห์โทนและอารมณ์"
                >
                    <Thermometer className="w-3.5 h-3.5 sm:w-4 sm:h-4"/> AI วิเคราะห์โทน
                </button>
                 <button
                    onClick={() => onTriggerAiAnalysis(noteToView.content, 'lore-consistency-check')}
                    className={`${secondaryButtonClass} px-3 py-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 text-xs sm:text-sm`}
                    title="AI ตรวจสอบความต่อเนื่องกับข้อมูลโลก"
                >
                    <BookCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4"/> AI ตรวจสอบข้อมูลโลก
                </button>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
                <button
                    onClick={handleExportFormattedMarkdown}
                    className={`${secondaryButtonClass} px-3 py-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 text-xs sm:text-sm ${!hasYaml ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!hasYaml}
                    title={hasYaml ? "Export เป็น Markdown (คง Frontmatter)" : "ไม่พบ Frontmatter สำหรับการ Export แบบพิเศษ"}
                >
                    <FileCode className="w-3.5 h-3.5 sm:w-4 sm:h-4"/> Export (YAML)
                </button>
                <button
                    onClick={() => onExportMd(noteToView)}
                    className={`${secondaryButtonClass} px-3 py-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 text-xs sm:text-sm`}
                >
                    Export (.md)
                </button>
                <button
                    onClick={() => { onEdit(noteToView); setShowVersionHistory(false); }}
                    className={`${secondaryButtonClass} px-3 py-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 text-xs sm:text-sm`}
                >
                    <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4"/> แก้ไข
                </button>
                <button
                    onClick={() => { onClose(); setShowVersionHistory(false);}}
                    className={`${currentTheme.button} ${currentTheme.buttonText || 'text-white'} px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-1.5 text-xs sm:text-sm`}
                >
                    ปิด
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ViewNoteModal;
