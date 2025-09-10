
import React, { useState, useEffect, useRef } from 'react';
import { AppNote, Project, NoteTemplate, UserNoteTemplate, AppTheme } from './types'; 
import EmojiPicker from './EmojiPicker'; 
import { Send, ImagePlus, Trash2, UploadCloud } from 'lucide-react';

interface NoteModalProps {
  showModal: boolean;
  isEditing: boolean;
  noteData: { title: string; icon?: string; coverImageUrl?: string; content: string; category: string; tags: string[]; projectId?: string | null };
  onNoteDataChange: (field: keyof AppNote | 'tagsString' | 'icon' | 'coverImageUrl' | 'projectId', value: string | string[] | null) => void;
  onSave: () => void;
  onCancel: () => void;
  onSendSelectionToAi: (selectedText: string) => void; 
  currentTheme: AppTheme;
  projects: Project[];
  activeProjectId: string | null;
  systemTemplates: NoteTemplate[];
  userTemplates: UserNoteTemplate[];
}

const NoteModal: React.FC<NoteModalProps> = ({
  showModal,
  isEditing,
  noteData,
  onNoteDataChange,
  onSave,
  onCancel,
  onSendSelectionToAi, 
  currentTheme,
  projects,
  activeProjectId,
  systemTemplates,
  userTemplates,
}) => {
  const [previewContent, setPreviewContent] = useState('');
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const [coverImageUrlInput, setCoverImageUrlInput] = useState(noteData.coverImageUrl || '');

  useEffect(() => {
    if (window.marked) {
      setPreviewContent(window.marked.parse(noteData.content || ''));
    } else {
      setPreviewContent((noteData.content || '').replace(/</g, "&lt;").replace(/>/g, "&gt;"));
    }
  }, [noteData.content, showModal]);

  useEffect(() => {
    setCoverImageUrlInput(noteData.coverImageUrl || '');
  }, [noteData.coverImageUrl]);


  if (!showModal) return null;

  const allTemplates = [
    ...systemTemplates.map(t => ({ ...t, isUserTemplate: false, id: `system-${t.id}`  })),
    ...userTemplates.map(t => ({ ...t, isUserTemplate: true }))
  ].sort((a,b) => a.name.localeCompare(b.name, 'th'));

  const handleTemplateSelect = (templateId: string) => {
    if (!templateId) return; 

    const selectedTemplate = allTemplates.find(t => t.id === templateId);
    if (selectedTemplate) {
      onNoteDataChange('title', selectedTemplate.name.startsWith("โครงร่าง") || selectedTemplate.name.startsWith("สร้างโลก") || selectedTemplate.name.startsWith("แม่แบบ:") ? noteData.title : selectedTemplate.name); 
      onNoteDataChange('content', selectedTemplate.content);
      onNoteDataChange('icon', selectedTemplate.icon || '');
      onNoteDataChange('category', selectedTemplate.category || 'general');
      onNoteDataChange('coverImageUrl', ''); // Reset cover image when applying template
    }
  };

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onNoteDataChange('content', e.target.value);
  };
  
  const handleSendSelectedToAiClick = () => {
    if (editorRef.current) {
        const start = editorRef.current.selectionStart;
        const end = editorRef.current.selectionEnd;
        if (start !== end) { 
            const selectedText = editorRef.current.value.substring(start, end);
            onSendSelectionToAi(selectedText);
        } else {
            alert("กรุณาเลือกข้อความใน Editor ก่อน");
        }
    }
  };

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) { // Limit to 2MB
            alert("ขนาดไฟล์ภาพต้องไม่เกิน 2MB");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            onNoteDataChange('coverImageUrl', reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleCoverImageUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCoverImageUrlInput(e.target.value);
  };
  
  const handleApplyCoverImageUrl = () => {
    onNoteDataChange('coverImageUrl', coverImageUrlInput);
  };


  const handleRemoveCoverImage = () => {
    onNoteDataChange('coverImageUrl', '');
    setCoverImageUrlInput('');
    if (coverImageInputRef.current) {
        coverImageInputRef.current.value = ""; // Reset file input
    }
  };

  const isDarkTheme = currentTheme.name.toLowerCase().includes('dark') || currentTheme.name.toLowerCase().includes('deep');
  const selectArrowSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='${isDarkTheme ? '%23CBD5E1' : '%2364748B'}'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E`;
  const optionClasses = `${currentTheme.cardBg} ${currentTheme.inputText}`;
  const inputClasses = `px-4 py-3 rounded-xl ${currentTheme.inputBg} ${currentTheme.inputText} border ${currentTheme.inputBorder} focus:outline-none focus:ring-2 ${currentTheme.focusRing}`;
  const currentSelectedProjectId = noteData.projectId !== undefined ? noteData.projectId : (isEditing ? null : activeProjectId);


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-40 p-4">
      <div className={`${currentTheme.cardBg} rounded-2xl p-6 sm:p-8 w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]`}>
        <h3 className={`text-xl font-semibold ${currentTheme.text} mb-6`}>
          {isEditing ? 'แก้ไขโน้ต' : 'เพิ่มโน๊ตใหม่'}
        </h3>
        
        {!isEditing && allTemplates.length > 0 && (
          <div className="mb-4">
            <label htmlFor="note-template-selector" className={`block text-sm font-medium ${currentTheme.textSecondary} opacity-90 mb-1`}>ใช้แม่แบบ:</label>
            <select
              id="note-template-selector"
              onChange={(e) => handleTemplateSelect(e.target.value)}
              className={`${inputClasses} w-full appearance-none bg-no-repeat bg-right-3`}
              style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1.25em' }}
              aria-label="เลือกแม่แบบโน้ต"
              defaultValue=""
            >
              <option value="" className={optionClasses}>-- ไม่ใช้แม่แบบ --</option>
              {allTemplates.some(t => !t.isUserTemplate) && (
                <optgroup label="แม่แบบของระบบ" className={optionClasses}>
                  {allTemplates.filter(t => !t.isUserTemplate).map(template => (
                    <option key={template.id} value={template.id} className={optionClasses}>
                      {template.name}
                    </option>
                  ))}
                </optgroup>
              )}
              {allTemplates.some(t => t.isUserTemplate) && (
                <optgroup label="แม่แบบของคุณ" className={optionClasses}>
                    {allTemplates.filter(t => t.isUserTemplate).map(template => (
                    <option key={template.id} value={template.id} className={optionClasses}>
                        {template.name}
                    </option>
                    ))}
                </optgroup>
              )}
            </select>
          </div>
        )}

        <div className="space-y-4 flex-grow flex flex-col min-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex items-center gap-3">
            <EmojiPicker
              selectedEmoji={noteData.icon}
              onEmojiSelect={(emoji) => onNoteDataChange('icon', emoji)}
              currentTheme={currentTheme}
            />
            <input
                type="text"
                placeholder="ชื่อโน้ต"
                value={noteData.title}
                onChange={(e) => onNoteDataChange('title', e.target.value)}
                className={`${inputClasses} flex-grow h-12`}
                aria-label="ชื่อโน้ต"
            />
          </div>

          {noteData.coverImageUrl && (
            <div className="my-3 p-2 rounded-lg relative group bg-black/20">
              <img src={noteData.coverImageUrl} alt="ภาพปกตัวอย่าง" className="max-h-40 w-auto rounded-md object-contain mx-auto" />
              <button 
                onClick={handleRemoveCoverImage} 
                className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                title="ลบภาพปก"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="cover-image-upload" className={`block text-sm font-medium ${currentTheme.textSecondary} opacity-90`}>
              {noteData.coverImageUrl ? 'เปลี่ยนภาพปก:' : 'อัปโหลดภาพปก (ไม่เกิน 2MB):'}
            </label>
            <div className="flex items-center gap-2">
                <input
                    type="file"
                    id="cover-image-upload"
                    accept="image/*"
                    ref={coverImageInputRef}
                    onChange={handleCoverImageUpload}
                    className={`w-full text-sm ${currentTheme.textSecondary} 
                                file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold 
                                file:${currentTheme.buttonSecondaryBg} file:${currentTheme.buttonSecondaryText}
                                hover:file:opacity-80 cursor-pointer`}
                />
            </div>
             <div className="flex items-center gap-2">
                <input
                    type="text"
                    placeholder="หรือวาง URL ของภาพปกที่นี่"
                    value={coverImageUrlInput}
                    onChange={handleCoverImageUrlInputChange}
                    className={`${inputClasses} flex-grow text-xs h-10`}
                />
                <button onClick={handleApplyCoverImageUrl} className={`${currentTheme.button} ${currentTheme.buttonText} text-xs px-3 py-1.5 h-10 rounded-md hover:opacity-90`}>
                    ใช้ URL
                </button>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow min-h-[250px] max-h-[50vh] sm:max-h-[55vh]">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="markdown-editor-area" className={`text-xs ${currentTheme.textSecondary} opacity-70`}>Markdown Editor</label>
                <button 
                    onClick={handleSendSelectedToAiClick} 
                    className={`${currentTheme.button} ${currentTheme.buttonText} text-xs px-2 py-1 rounded-md flex items-center gap-1 hover:scale-105`}
                    title="ส่งข้อความที่เลือกให้ AI วิเคราะห์/ดำเนินการต่อ"
                >
                    <Send size={12}/> ส่งให้ AI
                </button>
              </div>
              <textarea
                id="markdown-editor-area"
                ref={editorRef}
                value={noteData.content} 
                onChange={handleEditorChange} 
                placeholder="เนื้อหา (Markdown)"
                className={`${inputClasses} w-full h-full flex-grow resize-none text-sm leading-relaxed`} 
                aria-label="เนื้อหาโน้ต Markdown"
              />
            </div>
            <div className="flex flex-col h-full">
              <label className={`text-xs ${currentTheme.textSecondary} opacity-70 mb-1`}>Live Preview</label>
              <div
                className={`markdown-preview flex-grow p-3 rounded-lg ${currentTheme.inputBg} bg-opacity-50 overflow-y-auto text-sm prose-sm ${isDarkTheme ? 'prose-dark' : ''} max-w-none h-full custom-scrollbar`}
                style={{fontFamily: 'Sarabun, sans-serif'}}
                dangerouslySetInnerHTML={{ __html: previewContent }}
                aria-live="polite"
              />
            </div>
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select
              value={noteData.category}
              onChange={(e) => onNoteDataChange('category', e.target.value)}
              className={`${inputClasses} w-full appearance-none bg-no-repeat bg-right-3`}
              style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1.25em' }}
              aria-label="ประเภทโน้ต"
            >
              <option value="general" className={optionClasses}>ทั่วไป</option>
              <option value="writing" className={optionClasses}>การเขียน</option>
              <option value="plot" className={optionClasses}>โครงเรื่อง</option>
              <option value="character" className={optionClasses}>ตัวละคร</option>
              <option value="worldbuilding" className={optionClasses}>สร้างโลก</option>
              <option value="research" className={optionClasses}>การค้นคว้า</option>
              <option value="scene" className={optionClasses}>ฉาก (Scene)</option>
              <option value="chapter" className={optionClasses}>บท (Chapter)</option>
              <option value="design" className={optionClasses}>ดีไซน์</option>
              <option value="ideas" className={optionClasses}>ไอเดีย</option>
              <option value="feedback" className={optionClasses}>Feedback</option>
              <option value="ai generated" className={optionClasses}>AI Generated</option>
              <option value="imported" className={optionClasses}>นำเข้า</option>
            </select>
            <select
                value={currentSelectedProjectId === null ? "" : currentSelectedProjectId}
                onChange={(e) => onNoteDataChange('projectId', e.target.value === "" ? null : e.target.value)}
                className={`${inputClasses} w-full appearance-none bg-no-repeat bg-right-3`}
                style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1.25em' }}
                aria-label="เลือกโปรเจกต์"
            >
                <option value="" className={optionClasses}>ไม่ได้กำหนดโปรเจกต์</option>
                {projects.map(project => (
                    <option key={project.id} value={project.id} className={optionClasses}>
                        {project.name}
                    </option>
                ))}
            </select>
          </div>
          <input
            type="text"
            placeholder="แท็ก (คั่นด้วยจุลภาค เช่น fantasy, sci-fi)"
            value={noteData.tags.join(', ')}
            onChange={(e) => onNoteDataChange('tagsString', e.target.value)}
            className={`${inputClasses} w-full`}
            aria-label="แท็ก"
          />
        </div>
        <div className={`flex gap-3 mt-6 pt-4 border-t ${currentTheme.divider}`}>
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
            {isEditing ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่ม'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;
