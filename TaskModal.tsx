
import React from 'react';
import { AppTask, AppTheme } from './types'; // Assuming types.ts is in the same root directory, Changed to AppTheme
import EmojiPicker from './EmojiPicker'; // Import the EmojiPicker

interface TaskModalProps {
  showModal: boolean;
  taskData: { title: string; icon?: string; priority: string; dueDate: string; category: string };
  onTaskDataChange: (field: keyof AppTask | 'title' | 'icon' | 'priority' | 'dueDate' | 'category', value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  currentTheme: AppTheme; // Changed to AppTheme
}

const TaskModal: React.FC<TaskModalProps> = ({
  showModal,
  taskData,
  onTaskDataChange,
  onSave,
  onCancel,
  currentTheme,
}) => {
  if (!showModal) return null;

  const isDarkTheme = currentTheme.name.toLowerCase().includes('dark') || currentTheme.name.toLowerCase().includes('deep');
  const selectArrowSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='${isDarkTheme ? '%23CBD5E1' : '%2364748B'}'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E`;
  const optionClasses = `${currentTheme.cardBg} ${currentTheme.inputText}`;
  const inputFieldClasses = `px-4 py-3 rounded-xl ${currentTheme.inputBg} ${currentTheme.inputText} border ${currentTheme.inputBorder} focus:outline-none focus:ring-2 ${currentTheme.focusRing}`;


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-40 p-4">
      <div className={`${currentTheme.cardBg} rounded-2xl p-8 w-full max-w-lg shadow-2xl`}>
        <h3 className={`text-xl font-semibold ${currentTheme.text} mb-6`}>เพิ่มงานใหม่</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <EmojiPicker
              selectedEmoji={taskData.icon}
              onEmojiSelect={(emoji) => onTaskDataChange('icon', emoji)}
              currentTheme={currentTheme}
            />
            <input
                type="text"
                placeholder="ชื่องาน"
                value={taskData.title}
                onChange={(e) => onTaskDataChange('title', e.target.value)}
                className={`flex-grow h-12 ${inputFieldClasses}`}
                aria-label="ชื่องาน"
            />
          </div>
          <select
            value={taskData.priority}
            onChange={(e) => onTaskDataChange('priority', e.target.value)}
            className={`w-full ${inputFieldClasses} appearance-none bg-no-repeat bg-right-3`}
            style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1.25em' }}
            aria-label="ระดับความสำคัญ"
          >
            <option value="low" className={optionClasses}>ความสำคัญต่ำ</option>
            <option value="medium" className={optionClasses}>ความสำคัญปานกลาง</option>
            <option value="high" className={optionClasses}>ความสำคัญสูง</option>
          </select>
          <input
            type="date"
            value={taskData.dueDate}
            onChange={(e) => onTaskDataChange('dueDate', e.target.value)}
            className={`w-full ${inputFieldClasses}`}
            aria-label="วันที่ครบกำหนด"
          />
          <select
            value={taskData.category}
            onChange={(e) => onTaskDataChange('category', e.target.value)}
            className={`w-full ${inputFieldClasses} appearance-none bg-no-repeat bg-right-3`}
            style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1.25em' }}
            aria-label="ประเภทงาน"
          >
            <option value="general" className={optionClasses}>ทั่วไป</option>
            <option value="writing" className={optionClasses}>การเขียน</option>
            <option value="design" className={optionClasses}>การออกแบบ</option>
            <option value="research" className={optionClasses}>การค้นคว้า</option>
            <option value="personal" className={optionClasses}>ส่วนตัว</option>
          </select>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className={`flex-1 py-3 rounded-xl ${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} hover:${currentTheme.buttonSecondaryHoverBg} transition-all duration-300`}
          >
            ยกเลิก
          </button>
          <button
            onClick={onSave}
            className={`flex-1 py-3 rounded-xl ${currentTheme.button} ${currentTheme.buttonText} transition-all duration-300 hover:scale-105`}
          >
            เพิ่ม
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
