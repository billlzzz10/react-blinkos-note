import React, { useState, useEffect } from 'react';
import { AppTheme } from './types';
import { PlotOutlineNode } from './types';

interface PlotOutlineModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
  initialText?: string;
  currentTheme: AppTheme;
  editingNodeId?: string | null;
}

const PlotOutlineModal: React.FC<PlotOutlineModalProps> = ({
  show,
  onClose,
  onSave,
  initialText = '',
  currentTheme,
  editingNodeId,
}) => {
  const [text, setText] = useState(initialText);

  useEffect(() => {
    if (show) {
      setText(initialText);
    }
  }, [show, initialText]);

  const handleSave = () => {
    if (text.trim()) {
      onSave(text.trim());
      onClose();
    } else {
      alert('กรุณาป้อนเนื้อหาสำหรับจุดโครงเรื่อง');
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="plotOutlineModalTitle">
      <div className={`${currentTheme.cardBg} rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl`}>
        <h3 id="plotOutlineModalTitle" className={`text-xl font-semibold ${currentTheme.text} mb-5`}>
          {editingNodeId ? 'แก้ไขจุดโครงเรื่อง' : 'เพิ่มจุดโครงเรื่องใหม่'}
        </h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 rounded-lg ${currentTheme.input} focus:outline-none focus:ring-2 ${currentTheme.accent.replace('bg-', 'focus:ring-')} text-sm resize-y`}
          placeholder="ป้อนเนื้อหาของจุดโครงเรื่องที่นี่..."
          autoFocus
        />
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className={`flex-1 py-2.5 rounded-xl ${currentTheme.text} bg-white/10 hover:bg-white/20 transition-colors`}
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className={`flex-1 py-2.5 rounded-xl ${currentTheme.button} text-white hover:scale-105 transition-transform`}
          >
            {editingNodeId ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มจุดโครงเรื่อง'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlotOutlineModal;