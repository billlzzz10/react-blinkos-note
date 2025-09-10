
import React from 'react';
import { PlotOutlineNode, AppTheme, AppNote, LoreEntry } from './types';
import { Edit3, Trash2, PlusCircle, ArrowUpCircle, ArrowDownCircle, ChevronRight, CornerDownRight, Link as LinkIcon, StickyNote, BookOpen as LoreIcon } from 'lucide-react';

interface PlotOutlineNodeItemProps {
  node: PlotOutlineNode;
  level: number;
  currentTheme: AppTheme;
  onEdit: (node: PlotOutlineNode) => void;
  onDelete: (nodeId: string) => void;
  onAddChild: (parentId: string) => void;
  onMove: (nodeId: string, direction: 'up' | 'down') => void;
  getChildren: (parentId: string | null) => PlotOutlineNode[];
  canMoveUp: boolean;
  canMoveDown: boolean;
  onOpenLinkModal: (node: PlotOutlineNode) => void; // Callback to open link modal
  allNotes: AppNote[]; // All notes to find details for linked items
  allLoreEntries: LoreEntry[]; // All lore to find details for linked items
  onViewNote: (note: AppNote) => void;
  // onViewLore: (lore: LoreEntry) => void; // If lore items have a dedicated view
}

const PlotOutlineNodeItem: React.FC<PlotOutlineNodeItemProps> = ({
  node,
  level,
  currentTheme,
  onEdit,
  onDelete,
  onAddChild,
  onMove,
  getChildren, 
  canMoveUp,
  canMoveDown,
  onOpenLinkModal,
  allNotes,
  allLoreEntries,
  onViewNote,
  // onViewLore
}) => {
  const IndentIcon = level > 0 ? CornerDownRight : ChevronRight;
  const directChildrenData = getChildren(node.id);
  const actionButtonClass = `p-1.5 rounded-full hover:${currentTheme.sidebarHoverBg || 'bg-white/10'} transition-colors duration-200`;

  const linkedNotes = node.linkedNoteIds
    .map(id => allNotes.find(n => n.id === id))
    .filter((n): n is AppNote => Boolean(n));
  
  const linkedLore = node.linkedLoreIds
    .map(id => allLoreEntries.find(l => l.id === id))
    .filter((l): l is LoreEntry => Boolean(l));

  const handleViewLore = (lore: LoreEntry) => {
    // Placeholder: If lore entries can be viewed like notes or have their own modal.
    // For now, this could log or be a no-op if no specific lore view exists.
    // If lore is just text, it could potentially use onViewNote if converted to an AppNote-like structure.
    console.log("Viewing lore (placeholder):", lore.title);
    // Example: If you want to use ViewNoteModal for Lore:
    // const loreAsNote: AppNote = { id: Date.now(), title: lore.title, content: lore.content, category: lore.type, tags: lore.tags, createdAt: lore.createdAt, projectId: lore.projectId, links:[], versions:[]};
    // onViewNote(loreAsNote);
    alert(`รายละเอียดข้อมูลโลก: ${lore.title}\n(ฟังก์ชันดูรายละเอียดข้อมูลโลกเต็มรูปแบบจะมาในภายหลัง)`);
  };


  return (
    <div className={`${currentTheme.cardBg} bg-opacity-50 p-3 rounded-lg mb-2 shadow-sm group`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start flex-grow min-w-0">
          <span style={{ paddingLeft: `${level * 20}px` }} className="flex items-center pt-0.5">
            <IndentIcon size={16} className={`${currentTheme.text} opacity-60 mr-2 flex-shrink-0`} />
          </span>
          <p className={`${currentTheme.text} text-sm break-words flex-grow`}>{node.text}</p>
        </div>
        <div className="flex items-center gap-1 ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button onClick={() => onOpenLinkModal(node)} title="เชื่อมโยงเนื้อหา" className={`${currentTheme.text} ${actionButtonClass}`}>
            <LinkIcon size={16} />
          </button>
          <button onClick={() => onAddChild(node.id)} title="เพิ่มจุดย่อย" className={`${currentTheme.text} ${actionButtonClass}`}>
            <PlusCircle size={16} />
          </button>
          <button onClick={() => onEdit(node)} title="แก้ไข" className={`${currentTheme.text} ${actionButtonClass}`}>
            <Edit3 size={16} />
          </button>
          <button onClick={() => onMove(node.id, 'up')} disabled={!canMoveUp} title="เลื่อนขึ้น" className={`${currentTheme.text} ${actionButtonClass} disabled:opacity-30 disabled:cursor-not-allowed`}>
            <ArrowUpCircle size={16} />
          </button>
          <button onClick={() => onMove(node.id, 'down')} disabled={!canMoveDown} title="เลื่อนลง" className={`${currentTheme.text} ${actionButtonClass} disabled:opacity-30 disabled:cursor-not-allowed`}>
            <ArrowDownCircle size={16} />
          </button>
          <button onClick={() => onDelete(node.id)} title="ลบ" className={`text-red-400 hover:text-red-300 ${actionButtonClass} hover:bg-red-500/20`}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {(linkedNotes.length > 0 || linkedLore.length > 0) && (
        <div style={{ paddingLeft: `${level * 20 + 24}px` }} className="mt-1.5 space-y-0.5">
          {linkedNotes.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <StickyNote size={12} className={`${currentTheme.textSecondary} opacity-70`} />
              <span className={`${currentTheme.textSecondary} opacity-70 mr-1`}>โน้ต:</span>
              {linkedNotes.map(note => (
                <button 
                  key={note.id} 
                  onClick={() => onViewNote(note)}
                  className={`${currentTheme.accent.replace('bg-','text-')} hover:underline opacity-90`}
                  title={`ดูโน้ต: ${note.title}`}
                >
                  {note.title}
                </button>
              ))}
            </div>
          )}
          {linkedLore.length > 0 && (
             <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <LoreIcon size={12} className={`${currentTheme.textSecondary} opacity-70`} />
              <span className={`${currentTheme.textSecondary} opacity-70 mr-1`}>ข้อมูลโลก:</span>
              {linkedLore.map(lore => (
                <button 
                  key={lore.id} 
                  onClick={() => handleViewLore(lore)}
                  className={`${currentTheme.accent.replace('bg-','text-')} hover:underline opacity-90`}
                  title={`ดูข้อมูลโลก: ${lore.title}`}
                >
                  {lore.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {directChildrenData.length > 0 && (
        <div className="mt-2">
          {directChildrenData.map((childNode, index, arr) => {
            return (
              <PlotOutlineNodeItem
                key={childNode.id}
                node={childNode}
                level={level + 1}
                currentTheme={currentTheme}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddChild={onAddChild}
                onMove={onMove}
                getChildren={getChildren}
                canMoveUp={childNode.order > 0}
                canMoveDown={childNode.order < arr.length - 1}
                onOpenLinkModal={onOpenLinkModal}
                allNotes={allNotes}
                allLoreEntries={allLoreEntries}
                onViewNote={onViewNote}
                // onViewLore={onViewLore}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlotOutlineNodeItem;