
import React, { useState, useCallback, useMemo } from 'react';
import { PlotOutlineNode, AppTheme, AppNote, LoreEntry } from './types';
import PlotOutlineNodeItem from './PlotOutlineNodeItem';
import PlotOutlineModal from './PlotOutlineModal';
import LinkContentModal from './LinkContentModal'; // Import the new modal
import { Plus, GitBranch, Link as LinkIcon } from 'lucide-react';

interface PlotOutlineManagerProps {
  plotOutlines: PlotOutlineNode[];
  setPlotOutlines: React.Dispatch<React.SetStateAction<PlotOutlineNode[]>>;
  activeProjectId: string | null;
  currentTheme: AppTheme;
  allNotes: AppNote[]; // All notes for linking
  allLoreEntries: LoreEntry[]; // All lore entries for linking
  onUpdatePlotNodeLinks: (nodeId: string, linkedNoteIds: number[], linkedLoreIds: string[]) => void;
  onViewNote: (note: AppNote) => void; // To view linked notes
  // onViewLore: (lore: LoreEntry) => void; // To view linked lore (optional)
}

const PlotOutlineManager: React.FC<PlotOutlineManagerProps> = ({
  plotOutlines,
  setPlotOutlines,
  activeProjectId,
  currentTheme,
  allNotes,
  allLoreEntries,
  onUpdatePlotNodeLinks,
  onViewNote,
  // onViewLore,
}) => {
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [editingNode, setEditingNode] = useState<PlotOutlineNode | null>(null);
  const [parentNodeIdForNew, setParentNodeIdForNew] = useState<string | null>(null);

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkingNode, setLinkingNode] = useState<PlotOutlineNode | null>(null);

  const projectPlotOutlines = useMemo(() => {
    return plotOutlines.filter(node => node.projectId === activeProjectId);
  }, [plotOutlines, activeProjectId]);

  const getChildren = useCallback((parentId: string | null): PlotOutlineNode[] => {
    return projectPlotOutlines
      .filter(node => node.parentId === parentId)
      .sort((a, b) => a.order - b.order);
  }, [projectPlotOutlines]);

  const handleOpenModalForNew = (parentId: string | null = null) => {
    setEditingNode(null);
    setParentNodeIdForNew(parentId);
    setShowNodeModal(true);
  };

  const handleOpenModalForEdit = (node: PlotOutlineNode) => {
    setEditingNode(node);
    setParentNodeIdForNew(null);
    setShowNodeModal(true);
  };

  const handleOpenLinkModal = (node: PlotOutlineNode) => {
    setLinkingNode(node);
    setShowLinkModal(true);
  };

  const handleSaveNode = (text: string) => {
    if (editingNode) {
      setPlotOutlines(prev =>
        prev.map(node =>
          node.id === editingNode.id ? { ...node, text } : node
        )
      );
    } else {
      const siblings = getChildren(parentNodeIdForNew);
      const newOrder = siblings.length;
      const newNode: PlotOutlineNode = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        text,
        parentId: parentNodeIdForNew,
        order: newOrder,
        projectId: activeProjectId,
        createdAt: new Date().toISOString(),
        linkedNoteIds: [], // Initialize new fields
        linkedLoreIds: [], // Initialize new fields
      };
      setPlotOutlines(prev => [...prev, newNode]);
    }
    setShowNodeModal(false);
    setEditingNode(null);
    setParentNodeIdForNew(null);
  };

  const handleDeleteNodeRecursive = (nodeId: string) => {
    let idsToDelete = new Set<string>([nodeId]);
    let queue = [nodeId];
    while (queue.length > 0) {
      const currentParentId = queue.shift();
      const children = plotOutlines.filter(node => node.parentId === currentParentId);
      children.forEach(child => { idsToDelete.add(child.id); queue.push(child.id); });
    }
    const nodeToDelete = plotOutlines.find(n => n.id === nodeId);
    const parentIdOfDeleted = nodeToDelete?.parentId;
    setPlotOutlines(prev => {
        const remainingNodes = prev.filter(node => !idsToDelete.has(node.id));
        if (parentIdOfDeleted !== undefined) {
            const siblings = remainingNodes.filter(n => n.parentId === parentIdOfDeleted && n.projectId === activeProjectId).sort((a, b) => a.order - b.order);
            return remainingNodes.map(n => {
                if (n.parentId === parentIdOfDeleted && n.projectId === activeProjectId) {
                    const newOrder = siblings.findIndex(s => s.id === n.id);
                    return { ...n, order: newOrder };
                }
                return n;
            });
        }
        return remainingNodes;
    });
  };
  
  const handleMoveNode = (nodeId: string, direction: 'up' | 'down') => {
    setPlotOutlines(prev => {
      const allNodes = [...prev];
      const nodeToMove = allNodes.find(n => n.id === nodeId);
      if (!nodeToMove) return prev;
      const siblings = allNodes.filter(n => n.parentId === nodeToMove.parentId && n.projectId === activeProjectId).sort((a, b) => a.order - b.order);
      const currentIndex = siblings.findIndex(n => n.id === nodeId);
      if (direction === 'up' && currentIndex > 0) {
        const prevSibling = siblings[currentIndex - 1];
        const nodeToMoveInAll = allNodes.find(n => n.id === nodeToMove.id)!;
        const prevSiblingInAll = allNodes.find(n => n.id === prevSibling.id)!;
        const originalNodeToMoveOrder = nodeToMoveInAll.order;
        nodeToMoveInAll.order = prevSiblingInAll.order;
        prevSiblingInAll.order = originalNodeToMoveOrder;
      } else if (direction === 'down' && currentIndex < siblings.length - 1) {
        const nextSibling = siblings[currentIndex + 1];
        const nodeToMoveInAll = allNodes.find(n => n.id === nodeToMove.id)!;
        const nextSiblingInAll = allNodes.find(n => n.id === nextSibling.id)!;
        const originalNodeToMoveOrder = nodeToMoveInAll.order;
        nodeToMoveInAll.order = nextSiblingInAll.order;
        nextSiblingInAll.order = originalNodeToMoveOrder;
      }
      return [...allNodes]; 
    });
  };

  const rootNodes = getChildren(null);

  return (
    <div className="py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className={`text-2xl font-semibold ${currentTheme.text} flex items-center`}>
          <GitBranch className={`w-6 h-6 mr-2 ${currentTheme.accent.replace('bg-', 'text-')}`} />
          โครงเรื่อง ({projectPlotOutlines.length} จุด)
        </h2>
        <button
          onClick={() => handleOpenModalForNew(null)}
          className={`${currentTheme.button} ${currentTheme.buttonText || 'text-white'} px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center text-sm`}
        >
          <Plus className="w-4 h-4 mr-1.5" /> เพิ่มจุดโครงเรื่องหลัก
        </button>
      </div>

      {projectPlotOutlines.length === 0 ? (
        <p className={`${currentTheme.text} opacity-70 italic text-center py-8`}>
          {activeProjectId ? 'โปรเจกต์นี้ยังไม่มีโครงเรื่อง เริ่มสร้างจุดโครงเรื่องหลักได้เลย!' : 'กรุณาเลือกโปรเจกต์เพื่อจัดการโครงเรื่อง หรือสร้างโปรเจกต์ใหม่'}
        </p>
      ) : (
        <div>
          {rootNodes.map((node, index, arr) => (
            <PlotOutlineNodeItem
              key={node.id}
              node={node}
              level={0}
              currentTheme={currentTheme}
              onEdit={handleOpenModalForEdit}
              onDelete={handleDeleteNodeRecursive}
              onAddChild={() => handleOpenModalForNew(node.id)}
              onMove={handleMoveNode}
              getChildren={getChildren}
              canMoveUp={node.order > 0}
              canMoveDown={node.order < arr.length - 1}
              onOpenLinkModal={handleOpenLinkModal}
              allNotes={allNotes}
              allLoreEntries={allLoreEntries}
              onViewNote={onViewNote}
              // onViewLore={onViewLore}
            />
          ))}
        </div>
      )}

      <PlotOutlineModal
        show={showNodeModal}
        onClose={() => { setShowNodeModal(false); setEditingNode(null); setParentNodeIdForNew(null);}}
        onSave={handleSaveNode}
        initialText={editingNode ? editingNode.text : ''}
        currentTheme={currentTheme}
        editingNodeId={editingNode?.id}
      />
      {linkingNode && showLinkModal && (
        <LinkContentModal
          show={showLinkModal}
          onClose={() => { setShowLinkModal(false); setLinkingNode(null); }}
          plotNode={linkingNode}
          allNotes={allNotes.filter(n => !activeProjectId || n.projectId === activeProjectId)}
          allLoreEntries={allLoreEntries.filter(l => !activeProjectId || l.projectId === activeProjectId)}
          onSaveLinks={(nodeId, noteIds, loreIds) => {
            onUpdatePlotNodeLinks(nodeId, noteIds, loreIds);
            setShowLinkModal(false);
            setLinkingNode(null);
          }}
          currentTheme={currentTheme}
        />
      )}
    </div>
  );
};

export default PlotOutlineManager;