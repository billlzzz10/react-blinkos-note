
import React, { useState, useEffect } from 'react';
import { UserNoteTemplate, AppTheme } from './types'; 
// import { AppTheme } from './NoteTaskApp'; // Removed old import
import { LayoutList, Plus, Edit2, Trash2, Save, XCircle, Search, FileText, Tag, Palette } from 'lucide-react';
import EmojiPicker from './EmojiPicker';

interface UserTemplateManagerProps {
  userTemplates: UserNoteTemplate[];
  setUserTemplates: React.Dispatch<React.SetStateAction<UserNoteTemplate[]>>;
  currentTheme: AppTheme;
  getCategoryIcon: (category: string) => JSX.Element;
  activeProjectId: string | null; // Not directly used for templates but good for context consistency
}

const UserTemplateManager: React.FC<UserTemplateManagerProps> = ({
  userTemplates,
  setUserTemplates,
  currentTheme,
  getCategoryIcon,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<UserNoteTemplate | null>(null);
  const [currentTemplateData, setCurrentTemplateData] = useState<Omit<UserNoteTemplate, 'id' | 'createdAt'>>({
    name: '',
    content: '',
    icon: '',
    category: 'general',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (field: keyof Omit<UserNoteTemplate, 'id' | 'createdAt' | 'icon' | 'category'>, value: string) => {
    setCurrentTemplateData(prev => ({ ...prev, [field]: value }));
  };

  const handleIconChange = (icon: string) => {
    setCurrentTemplateData(prev => ({ ...prev, icon: icon }));
  };

  const handleCategoryChange = (category: string) => {
    setCurrentTemplateData(prev => ({...prev, category: category}));
  };

  const resetForm = () => {
    setCurrentTemplateData({ name: '', content: '', icon: '', category: 'general' });
    setEditingTemplate(null);
  };

  const handleSaveTemplate = () => {
    if (!currentTemplateData.name.trim()) {
      alert('กรุณากรอกชื่อแม่แบบ');
      return;
    }

    if (editingTemplate) {
      setUserTemplates(prev =>
        prev.map(t => (t.id === editingTemplate.id ? { ...editingTemplate, ...currentTemplateData } : t))
          .sort((a,b) => a.name.localeCompare(b.name, 'th'))
      );
    } else {
      const newTemplate: UserNoteTemplate = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
        ...currentTemplateData,
        createdAt: new Date().toISOString(),
      };
      setUserTemplates(prev => [...prev, newTemplate].sort((a,b) => a.name.localeCompare(b.name, 'th')));
    }
    setShowModal(false);
    resetForm();
  };

  const handleEditTemplate = (template: UserNoteTemplate) => {
    setEditingTemplate(template);
    setCurrentTemplateData({
      name: template.name,
      content: template.content,
      icon: template.icon || '',
      category: template.category || 'general',
    });
    setShowModal(true);
  };

  const handleDeleteTemplate = (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบแม่แบบนี้?')) {
      setUserTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  const filteredTemplates = userTemplates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.category && template.category.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a,b) => a.name.localeCompare(b.name, 'th'));

  const isDarkTheme = currentTheme.name.toLowerCase().includes('dark') || currentTheme.name.toLowerCase().includes('deep');
  const selectArrowSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='${isDarkTheme ? '%23CBD5E1' : '%2364748B'}'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E`;
  const optionBgClass = isDarkTheme ? 'bg-slate-700' : 'bg-gray-200 text-gray-800';
  const inputFieldBaseClasses = `px-4 py-3 rounded-xl ${currentTheme.inputBg} ${currentTheme.inputText} border ${currentTheme.inputBorder} focus:outline-none focus:ring-2 ${currentTheme.focusRing}`;

  return (
    <div className="py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className={`text-2xl font-semibold ${currentTheme.text} flex items-center`}>
          <LayoutList className={`w-6 h-6 mr-2 ${currentTheme.accentText || currentTheme.accent.replace('bg-', 'text-')}`} />
          จัดการแม่แบบโน้ต ({filteredTemplates.length})
        </h2>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className={`${currentTheme.button} ${currentTheme.buttonText || 'text-white'} px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center text-sm`}
        >
          <Plus className="w-4 h-4 mr-1.5" /> สร้างแม่แบบใหม่
        </button>
      </div>

      <div className={`mb-6 p-3 rounded-lg ${currentTheme.cardBg} bg-opacity-70`}>
        <div className="relative">
          <input
            type="text"
            placeholder="ค้นหาแม่แบบ (ชื่อ, เนื้อหา, หมวดหมู่)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full py-2.5 pl-10 pr-4 rounded-lg ${currentTheme.inputBg} ${currentTheme.inputText} border ${currentTheme.inputBorder} focus:outline-none focus:ring-2 ${currentTheme.focusRing}`}
            aria-label="ค้นหาแม่แบบ"
          />
          <Search className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 ${currentTheme.textSecondary} opacity-50`} />
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <p className={`${currentTheme.textSecondary} opacity-70 italic text-center py-8`}>
          {searchTerm ? `ไม่พบแม่แบบที่ตรงกับคำค้นหา "${searchTerm}"` : 'ยังไม่มีแม่แบบที่ผู้ใช้สร้างขึ้น'}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className={`${currentTheme.cardBg} rounded-xl p-5 flex flex-col justify-between group hover:shadow-xl transition-shadow duration-300`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-semibold ${currentTheme.text} text-lg truncate flex items-center`}>
                    {template.icon && <span className="mr-2 text-xl" aria-hidden="true">{template.icon}</span>}
                    {!template.icon && getCategoryIcon(template.category || 'general')}
                    <span className="ml-1">{template.name}</span>
                  </h3>
                  <div className="flex gap-1.5">
                    <button onClick={() => handleEditTemplate(template)} className={`p-1.5 ${currentTheme.textSecondary} opacity-60 hover:opacity-100 transition-opacity`} title="แก้ไขแม่แบบ">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteTemplate(template.id)} className="p-1.5 text-red-400 opacity-60 hover:opacity-100 transition-opacity" title="ลบแม่แบบ">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {template.category && (
                    <p className={`text-xs ${currentTheme.textSecondary} opacity-70 mb-1 flex items-center`}>
                        <Tag size={12} className="mr-1 opacity-70" aria-hidden="true"/> หมวดหมู่: {template.category}
                    </p>
                )}
                <p className={`${currentTheme.textSecondary} opacity-80 text-sm line-clamp-3 mb-3`}>{template.content || "ไม่มีเนื้อหา"}</p>
              </div>
              <div className="mt-auto">
                <span className={`text-xs ${currentTheme.textSecondary} opacity-60`}>
                  สร้างเมื่อ: {new Date(template.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="templateModalTitle">
          <div className={`${currentTheme.cardBg} rounded-2xl p-7 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto`}>
            <h3 id="templateModalTitle" className={`text-xl font-semibold ${currentTheme.text} mb-5`}>
              {editingTemplate ? 'แก้ไขแม่แบบ' : 'สร้างแม่แบบใหม่'}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <EmojiPicker
                    selectedEmoji={currentTemplateData.icon}
                    onEmojiSelect={handleIconChange}
                    currentTheme={currentTheme}
                />
                <input
                    type="text"
                    placeholder="ชื่อแม่แบบ"
                    value={currentTemplateData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`flex-grow h-12 ${inputFieldBaseClasses}`}
                    aria-label="ชื่อแม่แบบ"
                />
              </div>
               <select
                value={currentTemplateData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className={`w-full ${inputFieldBaseClasses} appearance-none bg-no-repeat bg-right-3`}
                style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1.25em' }}
                aria-label="หมวดหมู่เริ่มต้น (ถ้ามี)"
                >
                  <option value="general" className={optionBgClass}>ทั่วไป (General)</option>
                  <option value="writing" className={optionBgClass}>การเขียน (Writing)</option>
                  <option value="plot" className={optionBgClass}>โครงเรื่อง (Plot)</option>
                  <option value="character" className={optionBgClass}>ตัวละคร (Character)</option>
                  <option value="worldbuilding" className={optionBgClass}>สร้างโลก (Worldbuilding)</option>
                  <option value="research" className={optionBgClass}>ค้นคว้า (Research)</option>
                  <option value="scene" className={optionBgClass}>ฉาก (Scene)</option>
                  <option value="dialogue" className={optionBgClass}>บทสนทนา (Dialogue)</option>
                  <option value="log" className={optionBgClass}>บันทึก (Log)</option>
                  <option value="system" className={optionBgClass}>เกี่ยวกับระบบ (System)</option>
                  <option value="other" className={optionBgClass}>อื่นๆ (Other)</option>
              </select>
              <textarea
                placeholder="เนื้อหาแม่แบบ (Markdown)"
                value={currentTemplateData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={8}
                className={`w-full ${inputFieldBaseClasses} resize-y`}
                aria-label="เนื้อหาแม่แบบ"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowModal(false); resetForm(); }} className={`flex-1 py-2.5 rounded-xl ${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} hover:${currentTheme.buttonSecondaryHoverBg} transition-colors`}>ยกเลิก</button>
              <button onClick={handleSaveTemplate} className={`flex-1 py-2.5 rounded-xl ${currentTheme.button} ${currentTheme.buttonText} hover:scale-105 transition-transform`}>{editingTemplate ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างแม่แบบ'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTemplateManager;