
import React from 'react';
import { AppNote, AppTheme } from './types';
import { Trash2, Package, FileText } from 'lucide-react'; 

interface NoteItemProps {
  note: AppNote;
  currentTheme: AppTheme;
  onViewNote: (note: AppNote) => void;
  onDeleteNote: (id: number) => void;
  getCategoryIcon: (category: string) => JSX.Element;
  projectName?: string; 
}

const NoteItem: React.FC<NoteItemProps> = ({ note, currentTheme, onViewNote, onDeleteNote, getCategoryIcon, projectName }) => {
  const plainTextContent = React.useMemo(() => {
    if (!note.content) return "ไม่มีเนื้อหา";
    const tempDiv = document.createElement('div');
    try {
        if (window.marked) {
            tempDiv.innerHTML = window.marked.parse(note.content);
        } else {
            tempDiv.innerHTML = note.content; 
        }
    } catch (e) {
        tempDiv.innerHTML = note.content; 
    }
    return tempDiv.textContent || tempDiv.innerText || "ไม่มีเนื้อหา";
  }, [note.content]);

  return (
    <div 
      key={note.id} 
      className={`${currentTheme.cardBg} border ${currentTheme.cardBorder} ${currentTheme.cardShadow} 
                 rounded-lg hover:scale-[1.02] transition-all duration-200 group 
                 flex flex-col cursor-pointer overflow-hidden h-full`} // Ensure full height for flex
      onClick={() => onViewNote(note)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onViewNote(note); }}
      aria-label={`ดูโน้ต ${note.title}`}
    >
      {note.coverImageUrl ? (
        <div className="aspect-[16/9] w-full overflow-hidden">
            <img 
                src={note.coverImageUrl} 
                alt={`ภาพปกสำหรับ ${note.title}`} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                onError={(e) => (e.currentTarget.style.display = 'none')}
            />
        </div>
      ) : (
        <div className={`aspect-[16/9] w-full flex items-center justify-center ${currentTheme.inputBg} bg-opacity-50`}>
            <FileText size={40} className={`${currentTheme.textSecondary} opacity-30`} />
        </div>
      )}
      <div className="p-4 flex flex-col flex-grow"> {/* Changed padding */}
        <div className="flex justify-between items-start mb-1.5">
            <div className="flex items-center gap-1.5 overflow-hidden mr-2">
                {note.icon && <span className="text-lg flex-shrink-0" role="img" aria-hidden="true">{note.icon}</span>}
                {!note.icon && <span className="flex-shrink-0 text-sm">{getCategoryIcon(note.category)}</span>}
                <h3 className={`font-semibold ${currentTheme.text} text-base truncate`} title={note.title}>{note.title}</h3>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }}
                className={`opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-all duration-200 
                           p-1.5 -m-1.5 flex-shrink-0 rounded-full hover:${currentTheme.sidebarHoverBg}`}
                aria-label={`Delete note ${note.title}`}
                title="ลบโน้ต"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
        <p className={`${currentTheme.textSecondary} text-xs mb-2.5 line-clamp-2 flex-grow min-h-[2.5rem]`}>
            {plainTextContent}
        </p>
        
        <div className="mt-auto pt-2 border-t ${currentTheme.divider} border-opacity-50">
            {projectName && (
                <div className={`text-xs ${currentTheme.textSecondary} opacity-80 mb-1.5 flex items-center`}>
                    <Package size={12} className="mr-1 opacity-70"/> {projectName}
                </div>
            )}
            {note.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap mb-1.5">
                    {note.tags.slice(0, 3).map(tag => ( // Show max 3 tags
                    <span key={tag} className={`${currentTheme.accentText} bg-opacity-10 ${currentTheme.accent.replace('bg-','bg-')} text-xs px-2 py-0.5 rounded-full`}>
                        #{tag}
                    </span>
                    ))}
                    {note.tags.length > 3 && <span className={`text-xs ${currentTheme.textSecondary} opacity-70`}>+{note.tags.length - 3}</span>}
                </div>
            )}
            <span className={`text-xs ${currentTheme.textSecondary} opacity-70`}>
                อัปเดต: {new Date(note.updatedAt || note.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
        </div>
      </div>
    </div>
  );
};

export default NoteItem;
