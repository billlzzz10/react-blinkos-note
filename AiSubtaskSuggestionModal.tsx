
import React, { useState, useEffect } from 'react';
import { ListTree, CheckSquare, Square, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { AppTheme } from './types'; // Added AppTheme

interface AiSubtaskSuggestionModalProps {
  show: boolean;
  taskTitle: string;
  suggestedSubtasks: string[];
  isLoadingSuggestions: boolean;
  errorSubtaskGeneration: string | null;
  currentTheme: AppTheme; // Changed to AppTheme
  onClose: () => void;
  onAddSubtasks: (selectedTitles: string[]) => void;
  // Optional: if we want a "try again" button for errors
  // onRequestNewSuggestions?: () => void; 
}

const AiSubtaskSuggestionModal: React.FC<AiSubtaskSuggestionModalProps> = ({
  show,
  taskTitle,
  suggestedSubtasks,
  isLoadingSuggestions,
  errorSubtaskGeneration,
  currentTheme,
  onClose,
  onAddSubtasks,
  // onRequestNewSuggestions
}) => {
  const [selectedSubtasks, setSelectedSubtasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (show) {
      // Reset selected subtasks when modal becomes visible, especially if new suggestions are loaded
      setSelectedSubtasks(new Set());
    }
  }, [show, suggestedSubtasks, isLoadingSuggestions]); // Reset if suggestions or loading state changes while shown

  const handleToggleSubtask = (subtaskTitle: string) => {
    setSelectedSubtasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subtaskTitle)) {
        newSet.delete(subtaskTitle);
      } else {
        newSet.add(subtaskTitle);
      }
      return newSet;
    });
  };

  const handleAddClick = () => {
    onAddSubtasks(Array.from(selectedSubtasks));
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="aiSubtaskModalTitle">
      <div className={`${currentTheme.cardBg} rounded-2xl p-6 sm:p-8 w-full max-w-lg shadow-2xl flex flex-col`}>
        <div className="flex justify-between items-start mb-4">
          <h3 id="aiSubtaskModalTitle" className={`text-xl font-semibold ${currentTheme.text} flex items-center`}>
            <ListTree className={`w-5 h-5 mr-2 ${currentTheme.accentText || currentTheme.accent.replace('bg-', 'text-')}`} />
            AI แนะนำงานย่อยสำหรับ "{taskTitle}"
          </h3>
          <button
            onClick={onClose}
            className={`${currentTheme.textSecondary} hover:opacity-70 transition-opacity ml-2 flex-shrink-0`}
            aria-label="ปิดหน้าต่างแนะนำงานย่อย"
          >
            <XCircle className="w-7 h-7" />
          </button>
        </div>

        {isLoadingSuggestions && (
          <div className="flex flex-col items-center justify-center min-h-[150px]">
            <Loader2 className={`w-8 h-8 ${currentTheme.text} animate-spin mb-2`} aria-hidden="true" />
            <p className={`${currentTheme.textSecondary} opacity-80`} role="status">AI กำลังคิดงานย่อยให้คุณ...</p>
          </div>
        )}

        {errorSubtaskGeneration && !isLoadingSuggestions && (
           <div className={`${currentTheme.cardBg} border border-red-500/50 text-red-400 px-4 py-3 rounded-lg relative mb-4 flex items-center gap-2 shadow-lg`} role="alert">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" aria-hidden="true"/>
            <div>
                <strong className="font-bold">เกิดข้อผิดพลาด:</strong>
                <span className="block sm:inline ml-1">{errorSubtaskGeneration}</span>
            </div>
            {/* Optional: Add a retry button
             {onRequestNewSuggestions && (
                <button 
                    onClick={onRequestNewSuggestions} 
                    className={`${currentTheme.button} ${currentTheme.buttonText || 'text-white'} text-xs py-1 px-2 rounded-md ml-auto`}
                >
                    ลองอีกครั้ง
                </button>
            )} 
            */}
          </div>
        )}

        {!isLoadingSuggestions && !errorSubtaskGeneration && suggestedSubtasks.length === 0 && (
          <p className={`${currentTheme.textSecondary} opacity-70 text-center py-4`}>
            AI ไม่สามารถสร้างงานย่อยได้ในขณะนี้ หรือไม่มีงานย่อยที่เหมาะสม
          </p>
        )}

        {!isLoadingSuggestions && !errorSubtaskGeneration && suggestedSubtasks.length > 0 && (
          <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 mb-6" role="group" aria-labelledby="selectSubtasksLabel">
            <p id="selectSubtasksLabel" className={`${currentTheme.textSecondary} opacity-90 text-sm mb-2`}>เลือกงานย่อยที่คุณต้องการเพิ่ม:</p>
            {suggestedSubtasks.map((title, index) => (
              <label
                key={index}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedSubtasks.has(title) ? `${currentTheme.accent} bg-opacity-20` : `${currentTheme.inputBg} bg-opacity-30 hover:${currentTheme.inputBg} hover:bg-opacity-50`
                }`}
              >
                {selectedSubtasks.has(title) ? (
                  <CheckSquare className={`w-5 h-5 mr-3 ${currentTheme.accentText || currentTheme.accent.replace('bg-','text-')}`} aria-hidden="true"/>
                ) : (
                  <Square className={`w-5 h-5 mr-3 ${currentTheme.textSecondary} opacity-50`} aria-hidden="true"/>
                )}
                <span className={`${currentTheme.text} text-sm`}>{title}</span>
                <input
                  type="checkbox"
                  checked={selectedSubtasks.has(title)}
                  onChange={() => handleToggleSubtask(title)}
                  className="sr-only"
                  aria-label={title}
                />
              </label>
            ))}
          </div>
        )}
        
        <div className="mt-auto flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className={`flex-1 py-2.5 rounded-xl ${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} hover:${currentTheme.buttonSecondaryHoverBg} transition-all duration-300 text-sm`}
          >
            ยกเลิก
          </button>
          <button
            onClick={handleAddClick}
            disabled={isLoadingSuggestions || selectedSubtasks.size === 0 || !!errorSubtaskGeneration}
            className={`flex-1 py-2.5 rounded-xl ${currentTheme.button} ${currentTheme.buttonText || 'text-white'} transition-all duration-300 hover:scale-105 disabled:opacity-60 text-sm`}
          >
            เพิ่มงานย่อยที่เลือก ({selectedSubtasks.size})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiSubtaskSuggestionModal;