import React, { useState, useRef, useEffect } from 'react';
import { Project, AppTheme } from './types'; 
// import { AppTheme } from './NoteTaskApp'; // Removed old import
import { BookOpen, ChevronDown, Plus, Edit3, Trash2, CheckCircle } from 'lucide-react'; // Changed Package to BookOpen

interface ProjectSelectorProps {
  projects: Project[]; // Should be pre-filtered to non-archived
  activeProjectId: string | null;
  currentTheme: AppTheme;
  onSelectProject: (projectId: string | null) => void;
  onCreateProject: (projectName: string) => void;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects, // Expects non-archived projects
  activeProjectId,
  currentTheme,
  onSelectProject,
  onCreateProject,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const selectorRef = useRef<HTMLDivElement>(null);

  const activeProject = projects.find(p => p.id === activeProjectId);
  const displayLabel = activeProject ? activeProject.name : "โปรเจกต์ทั้งหมด";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCreateInput(false);
        setNewProjectName('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreate = () => {
    if (newProjectName.trim()) {
      onCreateProject(newProjectName.trim());
      setNewProjectName('');
      setShowCreateInput(false);
    } else {
      alert("กรุณาใส่ชื่อโปรเจกต์");
    }
  };

  const handleSelect = (id: string | null) => {
    onSelectProject(id);
    setIsOpen(false);
  }

  return (
    <div className="relative" ref={selectorRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg ${currentTheme.cardBg} hover:opacity-90 transition-opacity text-sm shadow`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Current project: ${displayLabel}. Click to change project.`}
      >
        <BookOpen className={`w-4 h-4 ${currentTheme.accent.replace('bg-', 'text-')}`} /> {/* Changed icon here */}
        <span className={`${currentTheme.text} max-w-[120px] sm:max-w-[200px] truncate`}>{displayLabel}</span>
        <ChevronDown className={`w-4 h-4 ${currentTheme.text} transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute top-full right-0 mt-2 w-64 ${currentTheme.cardBg} border ${currentTheme.text === 'text-white' || currentTheme.text === 'text-slate-300' ? 'border-slate-600' : 'border-gray-300'} rounded-xl shadow-xl z-20 py-2`}>
          {showCreateInput ? (
            <div className="p-2 space-y-2">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="ชื่อโปรเจกต์ใหม่..."
                className={`w-full px-3 py-2 text-sm rounded-md ${currentTheme.input} focus:outline-none focus:ring-2 ${currentTheme.accent.replace('bg-','focus:ring-')}`}
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
              />
              <div className="flex gap-2">
                <button
                    onClick={() => { setShowCreateInput(false); setNewProjectName('');}}
                    className={`flex-1 text-xs py-1.5 px-2 rounded-md ${currentTheme.text} bg-white/10 hover:bg-white/20`}
                >
                    ยกเลิก
                </button>
                <button
                    onClick={handleCreate}
                    className={`flex-1 text-xs py-1.5 px-2 rounded-md ${currentTheme.button} text-white`}
                >
                    สร้าง
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCreateInput(true)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${currentTheme.text} hover:bg-white/10 transition-colors`}
            >
              <Plus className="w-4 h-4" /> สร้างโปรเจกต์ใหม่
            </button>
          )}
          
          <div className="my-1 border-t border-white/10"></div>

          <button
            onClick={() => handleSelect(null)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${currentTheme.text} hover:bg-white/10 transition-colors ${!activeProjectId ? `${currentTheme.accent} bg-opacity-20 font-semibold` : ''}`}
          >
            โปรเจกต์ทั้งหมด / ไม่ได้กำหนด
            {!activeProjectId && <CheckCircle size={14} className={`${currentTheme.accent.replace('bg-', 'text-')}`} />}
          </button>

          {projects.length > 0 && <div className="my-1 border-t border-white/10"></div>}
          
          <div className="max-h-48 overflow-y-auto">
            {projects.map(project => ( // projects here are already filtered non-archived
              <button
                key={project.id}
                onClick={() => handleSelect(project.id)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm ${currentTheme.text} hover:bg-white/10 transition-colors ${activeProjectId === project.id ? `${currentTheme.accent} bg-opacity-20 font-semibold` : ''}`}
              >
                <span className="truncate">{project.name}</span>
                {activeProjectId === project.id && <CheckCircle size={14} className={`${currentTheme.accent.replace('bg-', 'text-')}`} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSelector;