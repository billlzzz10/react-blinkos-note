
import React from 'react';
import { AppNote, LoreEntry, AppTheme } from './types';
import { GitMerge, Link as LinkIcon } from 'lucide-react'; // Or any relevant icon

interface GraphViewProps {
  notes: AppNote[];
  loreEntries: LoreEntry[];
  activeProjectId: string | null;
  currentTheme: AppTheme;
  onViewNoteById: (noteId: number) => void; // To make notes clickable
  // Add functions to interact with lore if needed
}

const GraphView: React.FC<GraphViewProps> = ({
  notes,
  loreEntries,
  activeProjectId,
  currentTheme,
  onViewNoteById,
}) => {
  const projectNotes = activeProjectId ? notes.filter(n => n.projectId === activeProjectId) : notes;
  // For now, we'll just list notes and their forward links as a very basic representation.
  // A real graph view would require a library like react-flow or vis.js.

  return (
    <div className="py-6">
      <h2 className={`text-2xl sm:text-3xl font-semibold ${currentTheme.text} mb-6 text-center flex items-center justify-center`}>
        <GitMerge className={`w-7 h-7 mr-2 ${currentTheme.accentText || currentTheme.accent.replace('bg-', 'text-')}`} />
        ภาพรวมโครงเรื่อง (Graph View)
      </h2>

      <div className={`${currentTheme.cardBg} p-4 sm:p-6 rounded-xl shadow-lg`}>
        <p className={`${currentTheme.textSecondary || currentTheme.text} opacity-80 mb-4`}>
          คุณสมบัตินี้อยู่ในระหว่างการพัฒนา ในอนาคตคุณจะสามารถเห็นภาพรวมความเชื่อมโยงของโน้ต, ตัวละคร, และเหตุการณ์ต่างๆ ในโครงเรื่องของคุณด้วย AI.
        </p>
        
        <h3 className={`text-lg font-semibold ${currentTheme.text} mb-3`}>รายการโน้ตเบื้องต้นและลิงก์:</h3>
        {projectNotes.length === 0 && (
          <p className={`${currentTheme.textSecondary || currentTheme.text} italic`}>
            {activeProjectId ? 'ยังไม่มีโน้ตในโปรเจกต์นี้' : 'ยังไม่มีโน้ต'}
          </p>
        )}
        <ul className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
          {projectNotes.map(note => (
            <li key={note.id} className={`${currentTheme.inputBg || currentTheme.input} p-3 rounded-md`}>
              <button 
                onClick={() => onViewNoteById(note.id)} 
                className={`font-medium ${currentTheme.accentText || currentTheme.accent.replace('bg-','text-')} hover:underline`}
              >
                {note.icon && <span className="mr-1">{note.icon}</span>}{note.title}
              </button>
              {(note.links && note.links.length > 0) && (
                <ul className="list-disc list-inside pl-4 mt-1 text-xs">
                  {note.links.map(link => (
                    <li key={link.targetTitle} className={`${currentTheme.textSecondary || currentTheme.text} opacity-90`}>
                      <LinkIcon size={10} className="inline mr-1" /> {link.targetTitle}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
        <p className={`${currentTheme.textSecondary || currentTheme.text} opacity-70 mt-6 text-sm text-center`}>
          เร็วๆ นี้: การแสดงผลแบบกราฟ, การวิเคราะห์ความสัมพันธ์ด้วย AI, และอีกมากมาย!
        </p>
      </div>
    </div>
  );
};

export default GraphView;
