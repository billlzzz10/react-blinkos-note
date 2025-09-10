
import React from 'react';
import { AppNote, AppTheme, Project } from './types'; // Adjusted path
import NoteItem from './NoteItem'; // Adjusted path
import CategoryFilterControl from './CategoryFilterControl'; // Adjusted path
import { Plus, UploadCloud, Search, AlertTriangle, Loader2, FileText as FileTextIconLucide } from 'lucide-react'; // Renamed FileText to avoid conflict

interface NotesPageProps {
  notes: AppNote[]; // This will be filteredNotes
  currentTheme: AppTheme;
  onViewNote: (note: AppNote) => void;
  onDeleteNote: (id: number) => void;
  getCategoryIcon: (category: string) => JSX.Element;
  projects: Project[];
  activeProjectId: string | null;
  noteSearchTerm: string;
  setNoteSearchTerm: (term: string) => void;
  activeNoteCategoryFilter: string;
  setActiveNoteCategoryFilter: (category: string) => void;
  noteCategoriesForFilter: string[];
  onOpenAddNoteModal: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>; // Pass ref if needed, or just the trigger function
  triggerFileInput: () => void;
  isImportingFile: boolean;
  importError: string | null;
}

const NotesPage: React.FC<NotesPageProps> = ({
  notes,
  currentTheme,
  onViewNote,
  onDeleteNote,
  getCategoryIcon,
  projects,
  activeProjectId,
  noteSearchTerm,
  setNoteSearchTerm,
  activeNoteCategoryFilter,
  setActiveNoteCategoryFilter,
  noteCategoriesForFilter,
  onOpenAddNoteModal,
  triggerFileInput, // Use the trigger function directly
  isImportingFile,
  importError,
}) => {
  const getProjectName = (projectId?: string | null) => {
    if (!projectId) return undefined;
    return projects.find(p => p.id === projectId)?.name;
  };

  return (
    <section id="notes-section" aria-labelledby="notes-heading">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 id="notes-heading" className={`text-2xl sm:text-3xl font-semibold ${currentTheme.text} flex items-center`}>
          <FileTextIconLucide className={`w-7 h-7 mr-2 ${currentTheme.accentText || currentTheme.accent.replace('bg-','text-')}`} />
          โน้ตทั้งหมด ({notes.length})
        </h2>
        <div className="flex gap-3">
          <button
            onClick={triggerFileInput} // Use the passed trigger function
            disabled={isImportingFile}
            className={`${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} px-3 py-2 rounded-lg flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity`}
            title="นำเข้าไฟล์เป็นโน้ต (รองรับ .txt, .md, .pdf, .docx)"
          >
            {isImportingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud size={16} />}
            นำเข้าไฟล์
          </button>
          <button
            onClick={onOpenAddNoteModal}
            className={`${currentTheme.button} ${currentTheme.buttonText || 'text-white'} px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center text-sm`}
          >
            <Plus className="w-4 h-4 mr-1.5" /> เพิ่มโน้ตใหม่
          </button>
        </div>
      </div>

      {importError && (
        <div className={`${currentTheme.cardBg} border border-red-500/50 text-red-400 px-4 py-3 rounded-lg relative mb-4 flex items-center gap-2 shadow-md`} role="alert">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <strong className="font-bold">เกิดข้อผิดพลาดในการนำเข้า:</strong>
            <span className="block sm:inline ml-1">{importError}</span>
          </div>
        </div>
      )}

      <div className={`mb-6 p-3 rounded-lg ${currentTheme.cardBg} bg-opacity-70`}>
        <div className="relative">
          <input
            type="text"
            placeholder="ค้นหาโน้ต (ชื่อ, เนื้อหา, แท็ก)..."
            value={noteSearchTerm}
            onChange={(e) => setNoteSearchTerm(e.target.value)}
            className={`w-full py-2.5 pl-10 pr-4 rounded-lg ${currentTheme.inputBg || currentTheme.input} ${currentTheme.inputText || currentTheme.text} border ${currentTheme.inputBorder || 'border-transparent'} focus:outline-none focus:ring-2 ${currentTheme.focusRing || currentTheme.accent.replace('bg-', 'focus:ring-')}`}
            aria-label="ค้นหาโน้ต"
          />
          <Search className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 ${currentTheme.textSecondary || currentTheme.text} opacity-50`} />
        </div>
      </div>

      <CategoryFilterControl
        categories={noteCategoriesForFilter}
        activeFilter={activeNoteCategoryFilter}
        onFilterChange={setActiveNoteCategoryFilter}
        getCategoryIcon={getCategoryIcon}
        currentTheme={currentTheme}
        label="กรองตามประเภทโน้ต"
      />

      {notes.length === 0 ? (
        <p className={`${currentTheme.textSecondary || currentTheme.text} opacity-70 italic text-center py-8`}>
          {noteSearchTerm ? `ไม่พบโน้ตที่ตรงกับคำค้นหา "${noteSearchTerm}"` : 'ยังไม่มีโน้ต เริ่มสร้างโน้ตใหม่ได้เลย!'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {notes.map(note => (
            <NoteItem
              key={note.id}
              note={note}
              currentTheme={currentTheme}
              onViewNote={onViewNote}
              onDeleteNote={onDeleteNote}
              getCategoryIcon={getCategoryIcon}
              projectName={getProjectName(note.projectId)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default NotesPage;
