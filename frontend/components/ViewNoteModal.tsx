
import React, { useState, useEffect } from 'react';
import { AppNote, NoteVersion, NoteLink, AppTheme } from '../types'; 
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
                