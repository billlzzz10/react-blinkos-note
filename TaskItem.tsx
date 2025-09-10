
import React from 'react';
import { AppTask, AppSubtask } from './types';
import { Check, Star, Calendar, Trash2, GitFork, Package, FileText as FileTextIcon, ChevronDown, ChevronUp } from 'lucide-react'; // Added ChevronDown, ChevronUp
import { AppTheme } from './types'; // Corrected import path

interface TaskItemProps {
    task: AppTask;
    currentTheme: AppTheme;
    onToggleTask: (id: number) => void;
    onDeleteTask: (id: number) => void;
    onToggleSubtask: (taskId: number, subtaskId: string) => void;
    onAiDecomposeTaskRequest: (task: AppTask) => void;
    getPriorityColor: (priority: string) => string;
    getCategoryIcon: (category: string) => JSX.Element;
    projectName?: string;
}

const TaskItem: React.FC<TaskItemProps> = ({
    task,
    currentTheme,
    onToggleTask,
    onDeleteTask,
    onToggleSubtask,
    onAiDecomposeTaskRequest,
    getPriorityColor,
    getCategoryIcon,
    projectName
}) => {

    const stopPropagation = (e: React.MouseEvent<HTMLElement>) => e.stopPropagation();
    const isDarkTheme = currentTheme.name.toLowerCase().includes('dark') || currentTheme.name.toLowerCase().includes('deep');

    return (
        <div key={task.id} className={`${currentTheme.cardBg} rounded-xl p-4 sm:p-5 hover:shadow-xl transition-all duration-200 group relative`}>
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-grow min-w-0">
                    <button
                        onClick={() => onToggleTask(task.id)}
                        className={`mt-0.5 w-6 h-6 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 focus:outline-none ${currentTheme.focusRing || 'focus:ring-2 focus:ring-offset-1'}
                        ${task.completed
                            ? `${currentTheme.accent} border-transparent shadow-sm`
                            : `${currentTheme.inputBorder || 'border-gray-400'} hover:${currentTheme.accent ? currentTheme.accent.replace('bg-', 'border-') : 'border-indigo-500'}`
                        }`}
                        aria-label={task.completed ? `Mark "${task.title}" as incomplete` : `Mark "${task.title}" as complete`}
                        aria-pressed={task.completed}
                    >
                        {task.completed && <Check className={`w-4 h-4 ${currentTheme.accentText || 'text-white'}`} aria-hidden="true" />}
                    </button>
                    <div className="flex-grow min-w-0">
                        <h3 className={`font-semibold ${currentTheme.text} ${task.completed ? 'line-through opacity-60' : ''} break-words text-md flex items-center`}>
                            {task.icon && <span className="mr-1.5 text-lg flex-shrink-0" role="img" aria-hidden="true">{task.icon}</span>}
                            {task.title}
                        </h3>
                        <div className="flex items-center gap-x-3 gap-y-1 mt-1.5 flex-wrap">
                            <span className={`text-xs font-medium ${getPriorityColor(task.priority)} flex items-center`}>
                                <Star className="w-3 h-3 inline-block mr-1" aria-hidden="true" />
                                {task.priority === 'low' ? 'ต่ำ' : task.priority === 'medium' ? 'กลาง' : task.priority === 'high' ? 'สูง' : task.priority}
                            </span>
                            {task.dueDate && (
                                <span className={`text-xs ${currentTheme.textSecondary || 'text-gray-500'} flex items-center`}>
                                    <Calendar className="w-3 h-3 inline-block mr-1" aria-hidden="true" />
                                    {new Date(task.dueDate + 'T00:00:00').toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${currentTheme.accent} bg-opacity-10 ${currentTheme.accentText || currentTheme.accent.replace('bg-', 'text-')} font-medium flex items-center gap-1`}>
                                {getCategoryIcon(task.category)} <span className="ml-0.5">{task.category}</span>
                            </span>
                            {projectName && (
                                <span className={`text-xs ${currentTheme.textSecondary || 'text-gray-500'} opacity-80 flex items-center`}>
                                    <Package size={12} className="inline-block mr-1 opacity-70" /> {projectName}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        onClick={(e) => { stopPropagation(e); onAiDecomposeTaskRequest(task); }}
                        className={`${currentTheme.buttonSecondaryBg || 'bg-slate-200'} ${currentTheme.buttonSecondaryText || 'text-slate-700'} p-1.5 rounded-md hover:bg-opacity-80 transition-colors`}
                        title="AI ช่วยแตกงานย่อย"
                        aria-label={`AI ช่วยแตกงานย่อยสำหรับงาน "${task.title}"`}
                    >
                        <GitFork className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => { stopPropagation(e); onDeleteTask(task.id); }}
                        className="text-red-500 hover:text-red-400 p-1.5 rounded-md hover:bg-red-500/10 transition-colors"
                        aria-label={`ลบงาน "${task.title}"`}
                        title="ลบงาน"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {task.subtasks && task.subtasks.length > 0 && (
                <div className="mt-3 pl-9 space-y-2" role="list" aria-label={`งานย่อยของ ${task.title}`}>
                    {task.subtasks.map(subtask => (
                        <div key={subtask.id} className="flex items-center group/subtask">
                            <button
                                onClick={() => onToggleSubtask(task.id, subtask.id)}
                                className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center mr-2.5 transition-all duration-200 focus:outline-none ${currentTheme.focusRing || 'focus:ring-1'} ${
                                subtask.completed
                                    ? `${currentTheme.accent} border-transparent shadow-sm`
                                    : `${currentTheme.inputBorder || 'border-gray-400'} hover:${currentTheme.accent ? currentTheme.accent.replace('bg-', 'border-') : 'border-indigo-500'}`
                                }`}
                                aria-label={subtask.completed ? `เปลี่ยนสถานะงานย่อย "${subtask.title}" เป็นยังไม่เสร็จ` : `เปลี่ยนสถานะงานย่อย "${subtask.title}" เป็นเสร็จสิ้น`}
                                aria-pressed={subtask.completed}
                            >
                                {subtask.completed && <Check className={`w-3.5 h-3.5 ${currentTheme.accentText || 'text-white'}`} aria-hidden="true" />}
                            </button>
                            <span className={`text-sm ${currentTheme.textSecondary || 'text-gray-600'} ${subtask.completed ? 'line-through opacity-60' : 'opacity-90'} break-words`}>
                                {subtask.title}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {task.htmlDescription && (
                <details className="mt-3 pl-9 group/details">
                    <summary className={`text-xs ${currentTheme.textSecondary} opacity-80 cursor-pointer hover:opacity-100 list-none flex items-center`}>
                        <FileTextIcon size={12} className="mr-1 flex-shrink-0" /> 
                        ดูรายละเอียด (Markdown)
                        <ChevronDown className="w-3 h-3 ml-1 group-open/details:hidden" />
                        <ChevronUp className="w-3 h-3 ml-1 hidden group-open/details:block" />
                    </summary>
                    <div 
                        className={`mt-2 p-2 rounded-md border ${currentTheme.inputBorder || 'border-gray-300'} ${currentTheme.inputBg || 'bg-gray-100'} bg-opacity-50 prose-sm max-w-none ${isDarkTheme ? 'prose-dark' : ''} max-h-40 overflow-y-auto custom-scrollbar`}
                        style={{fontFamily: 'Sarabun, sans-serif'}}
                        dangerouslySetInnerHTML={{ __html: task.htmlDescription }}
                    />
                </details>
            )}
        </div>
    );
};

export default TaskItem;