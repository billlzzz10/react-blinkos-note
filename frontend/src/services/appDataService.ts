
import { AppNote, AppTask, LoreEntry, PomodoroConfig, UserPreferences, Project, UserNoteTemplate, PlotOutlineNode, LongformDocument } from '../types'; // Adjusted path

// This service is now intended for localStorage-only operation.

export interface AppDataType {
  dataSchemaVersion: number; // Added to store schema version
  notes: AppNote[];
  tasks: AppTask[];
  loreEntries: LoreEntry[];
  projects: Project[]; 
  userTemplates: UserNoteTemplate[];
  plotOutlines: PlotOutlineNode[]; 
  longformDocuments: LongformDocument[]; 
  activeTheme: string;
  pomodoroConfig: PomodoroConfig;
  userPreferences: UserPreferences;
}

export const fetchAppDataFromServer = async (): Promise<AppDataType | null> => {
  // Intentionally returns null as backend is not used for data persistence in this setup.
  // App relies on localStorage.
  return null; 
};

export const saveAppDataToServer = async (appData: AppDataType): Promise<boolean> => {
  // Intentionally returns true as backend is not used for data persistence.
  // Data is persisted in localStorage by NoteTaskApp.tsx.
  return true;
};