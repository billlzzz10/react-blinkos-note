
import React, { useState, useEffect } from 'react';
import { AppNote, LongformDocument, LongformDocumentItem, AppTheme } from './types';
import { XCircle, Save, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';

interface LongformDocumentModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (doc: LongformDocument) => void;
  existingDoc: LongformDocument | null;
  notes: AppNote[]; // All available notes for the current project context
  currentTheme: AppTheme;
}

const LongformDocumentModal: React.FC<LongformDocumentModalProps> = ({
  show,
  onClose,
  onSave,
  existingDoc,
  notes,
  currentTheme,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedItems, setSelectedItems] = useState<LongformDocumentItem[]>([]);
  const [availableNotes, setAvailableNotes] = useState<AppNote[]>([]);

  useEffect(() => {
    if (show) { // Ensure state resets or loads only when modal becomes visible
        if (existingDoc) {
            setTitle(existingDoc.title);
            setDescription(existingDoc.description || '');
            const itemsWithOrder = existingDoc.items
                .map((item, index) => ({
                    id: item.id, 
                    order: item.order !== undefined ? item.order : index, 
                }))
                .sort((a,b) => a.order - b.order);
            setSelectedItems(itemsWithOrder);
            setAvailableNotes(
                notes.filter(note => !itemsWithOrder.find(si => si.id === note.id))
                     .sort((a,b) => a.title.localeCompare(b.title, 'th'))
            );
        } else {
            setTitle('');
            setDescription('');
            setSelectedItems([]);
            setAvailableNotes([...notes].sort((a,b) => a.title.localeCompare(b.title, 'th')));
        }
    }
  }, [existingDoc, notes, show]);

  if (!show) return null;

  const handleAddItem = (noteId: number) => {
    const noteToAdd = notes.find(n => n.id === noteId);
    if (noteToAdd && !selectedItems.find(item => item.id === noteId)) {
      const newItem: LongformDocumentItem = { id: noteId, order: selectedItems.length };
      setSelectedItems(prevItems => [...prevItems, newItem].sort((a,b) => a.order - b.order));
      setAvailableNotes(prevAvail => prevAvail.filter(n => n.id !== noteId));
    }
  };

  const handleRemoveItem = (noteId: number) => {
    setSelectedItems(prevItems => 
        prevItems.filter(item => item.id !== noteId)
                 .map((item, index) => ({ ...item, order: index })) // Re-order
    );
    const noteToAddBack = notes.find(n => n.id === noteId);
    if (noteToAddBack) {
      setAvailableNotes(prevAvail => [...prevAvail, noteToAddBack].sort((a,b) => a.title.localeCompare(b.title, 'th')));
    }
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...selectedItems];
    const itemToMove = newItems[index];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;

    if (swapIndex >= 0 && swapIndex < newItems.length) {
      [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];
      setSelectedItems(newItems.map((item, idx) => ({ ...item, order: idx })));
    }
  };

  const handleSaveClick = () => {
    if (!title.trim()) {
      alert('กรุณาใส่ชื่อเอกสาร Longform');
      return;
    }
    const docToSave: LongformDocument = {
      id: existingDoc ? existingDoc.id : Date.now().toString() + Math.random().toString(36).substring(2,7),
      title: title.trim(),
      description: description.trim(),
      projectId: existingDoc?.projectId || null,
      items: selectedItems.map((item, index) => ({ ...item, order: index })),
      createdAt: existingDoc ? existingDoc.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(docToSave);
    onClose();
  };
  
  const inputFieldClasses = `w-full px-3 py-2 rounded-lg ${currentTheme.inputBg} ${currentTheme.inputText} border ${currentTheme.inputBorder} focus:outline-none focus:ring-2 ${currentTheme.focusRing}`;
  const buttonBaseClass = `p-1.5 rounded-full hover:bg-opacity-70 transition-colors`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[70] p-4">
      <div className={`${currentTheme.cardBg} rounded-xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-semibold ${currentTheme.text}`}>
            {existingDoc ? 'แก้ไขเอกสาร Longform' : 'สร้างเอกสาร Longform ใหม่'}
          </h3>
          <button onClick={onClose} className={`${currentTheme.textSecondary} hover:opacity-70`}>
            <XCircle size={24} />
          </button>
        </div>

        <div className="space-y-4 flex-grow overflow-y-auto pr-2 custom-scrollbar">
          <input
            type="text"
            placeholder="ชื่อเอกสาร Longform"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputFieldClasses}
            aria-label="ชื่อเอกสาร Longform"
          />
          <textarea
            placeholder="คำอธิบายสั้นๆ (ถ้ามี)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={`${inputFieldClasses} resize-y`}
            aria-label="คำอธิบายเอกสาร Longform"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className={`text-sm font-medium ${currentTheme.textSecondary} mb-1`}>โน้ตที่สามารถเลือกได้ ({availableNotes.length}):</h4>
              <div className={`border ${currentTheme.inputBorder} rounded-md p-2 h-60 md:h-72 overflow-y-auto space-y-1 custom-scrollbar`}>
                {availableNotes.map(note => (
                  <button
                    key={note.id}
                    onClick={() => handleAddItem(note.id)}
                    className={`w-full text-left text-xs p-1.5 rounded ${currentTheme.inputBg} bg-opacity-30 hover:bg-opacity-50 ${currentTheme.inputText} truncate`}
                    title={`เพิ่ม: ${note.title}`}
                  >
                    {note.icon && <span className="mr-1">{note.icon}</span>}{note.title}
                  </button>
                ))}
                {availableNotes.length === 0 && <p className={`text-xs italic ${currentTheme.textSecondary} p-1`}>ไม่มีโน้ตเหลือให้เลือก</p>}
              </div>
            </div>

            <div>
              <h4 className={`text-sm font-medium ${currentTheme.textSecondary} mb-1`}>โน้ตในเอกสารนี้ ({selectedItems.length}):</h4>
              <div className={`border ${currentTheme.inputBorder} rounded-md p-2 h-60 md:h-72 overflow-y-auto space-y-1 custom-scrollbar`}>
                {selectedItems.map((item, index) => {
                  const noteDetails = notes.find(n => n.id === item.id);
                  return (
                    <div key={item.id} className={`flex items-center justify-between p-1.5 rounded ${currentTheme.cardBg} bg-opacity-20 hover:bg-opacity-30`}>
                      <span className={`text-xs ${currentTheme.inputText} truncate flex-grow mr-1`}>
                        <span className={`${currentTheme.textSecondary} mr-1`}>{index + 1}.</span>
                        {noteDetails?.icon && <span className="mr-1">{noteDetails.icon}</span>}
                        {noteDetails?.title || 'Unknown Note'}
                      </span>
                      <div className="flex gap-0.5 flex-shrink-0">
                        <button onClick={() => handleMoveItem(index, 'up')} disabled={index === 0} className={`${buttonBaseClass} ${currentTheme.textSecondary} disabled:opacity-30 disabled:cursor-not-allowed`} title="Move Up"><ArrowUp size={14}/></button>
                        <button onClick={() => handleMoveItem(index, 'down')} disabled={index === selectedItems.length - 1} className={`${buttonBaseClass} ${currentTheme.textSecondary} disabled:opacity-30 disabled:cursor-not-allowed`} title="Move Down"><ArrowDown size={14}/></button>
                        <button onClick={() => handleRemoveItem(item.id)} className={`${buttonBaseClass} text-red-500 hover:text-red-400`} title="Remove"><Trash2 size={14}/></button>
                      </div>
                    </div>
                  );
                })}
                {selectedItems.length === 0 && <p className={`text-xs italic ${currentTheme.textSecondary} p-1`}>ยังไม่ได้เลือกโน้ต</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-5 pt-4 border-t ${currentTheme.divider}">
          <button onClick={onClose} className={`flex-1 py-2 rounded-lg ${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} hover:${currentTheme.buttonSecondaryHoverBg}`}>
            ยกเลิก
          </button>
          <button onClick={handleSaveClick} className={`flex-1 py-2 rounded-lg ${currentTheme.button} ${currentTheme.buttonText}`}>
            <Save size={16} className="inline mr-1.5" /> {existingDoc ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างเอกสาร'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LongformDocumentModal;
