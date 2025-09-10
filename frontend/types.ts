
export interface OperationMode {
  value: string;
  label: string;
  systemInstruction: string;
  userPromptFormatter: (input: string, contextData?: any) => string; // Updated to accept generic contextData
}

export interface Session {
  timestamp: string;
  mode: string;
  input: string;
  output: string;
}

export type NotePriority = 'none' | 'low' | 'medium' | 'high';

export interface NoteVersion {
  timestamp: string;
  content: string;
}

export interface Project {
  id: string;
  name: string;
  genre?: string; 
  description?: string; 
  createdAt: string;
  isArchived?: boolean; // Added for project archiving
  lastModified?: string; // For "My Projects" table
  summary?: string; // For "My Projects" table
}

export interface NoteLink { // For bi-directional linking
  targetTitle: string;
  // Future: targetId?: number; (if notes have stable IDs that can be resolved)
}

// Note and Task types specific to the NoteTaskApp component
export interface AppNote {
  id: number;
  title:string;
  icon?: string;
  coverImageUrl?: string; // Added for cover image
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  versions?: NoteVersion[];
  links?: NoteLink[]; // For storing parsed forward links
  projectId?: string | null; 
}

export interface AppSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface AppTask {
  id: number;
  title: string;
  icon?: string;
  completed: boolean;
  priority: string; 
  dueDate: string;
  category: string;
  subtasks: AppSubtask[]; 
  createdAt: string;
  projectId?: string | null; 
  description?: string; // For imported Markdown content
  htmlDescription?: string; // For parsed HTML of the description
}

export interface NoteTemplate { // System Note Template
  id: string;
  name: string;
  content: string;
  icon?: string; // Optional icon for system templates
  category?: string; // Optional default category for system templates
}

export interface UserNoteTemplate { // User-defined Note Template
  id: string;
  name: string;
  content: string;
  icon?: string;
  category?: string;
  createdAt: string;
}


export interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

export interface PomodoroConfig {
  work: number; // minutes
  shortBreak: number; // minutes
  longBreak: number; // minutes
  rounds: number;
}

export type CharacterRole = "Protagonist" | "Antagonist" | "Anti-hero" | "Supporting" | "Mentor" | "Ally" | "Enemy" | "Family" | "Love Interest" | "Minor" | "Other";

export type RelationshipType = 
  | "Ally" 
  | "Enemy" 
  | "Friend"
  | "Rival" 
  | "Family (Sibling)" 
  | "Family (Parent)" 
  | "Family (Child)"
  | "Family (Spouse)"
  | "Family (Other)"
  | "Mentor" 
  | "Mentee" 
  | "Romantic Interest" 
  | "Complicated"
  | "Neutral"
  | "Servant"
  | "Master"
  | "Acquaintance"
  | "Other";


export interface CharacterRelationship {
  targetCharacterId: string; 
  targetCharacterName?: string; 
  relationshipType: RelationshipType | string; // Allow string for custom if 'Other' is chosen
  description?: string; 
}


// For World Anvil / Lore Management
export interface LoreEntry {
  id: string;
  title: string;
  type: 'Character' | 'Place' | 'Item' | 'Concept' | 'Event' | 'Other' | 'ArcanaSystem'; 
  content: string; 
  tags: string[];
  createdAt: string;
  projectId?: string | null; 
  coverImageUrl?: string; // For lore entry cards

  // Character-specific fields
  role?: CharacterRole | string; 
  characterArcana?: string[]; 
  relationships?: CharacterRelationship[];

  // ArcanaSystem-specific fields (optional, can be in content or structured later)
  rules?: string;
  limitations?: string;
  manifestations?: string;
}

// For Project Management (Future Enhancement Foundation)
export interface WritingGoal {
  id: string;
  description: string; 
  target: number; 
  current: number;
  unit: 'words' | 'scenes' | 'tasks';
  deadline?: string;
  completed: boolean;
}

export interface PlotOutlineNode {
  id: string;
  text: string;
  parentId: string | null;
  order: number; // For manual sorting within siblings
  projectId: string | null;
  createdAt: string;
  linkedNoteIds: number[]; // NEW: IDs of AppNote linked to this plot point
  linkedLoreIds: string[]; // NEW: IDs of LoreEntry linked to this plot point
  // children will be determined dynamically for rendering
}

export type PlotOutline = PlotOutlineNode[];

// For Longform Document Assembly
export interface LongformDocumentItem {
    id: number; // Corresponds to AppNote.id
    order: number;
    // Potentially 'type' if tasks or other elements can be included later
    // type: 'note' | 'task' | 'scene'; 
}

export interface LongformDocument {
    id: string;
    title: string;
    projectId: string | null;
    items: LongformDocumentItem[];
    createdAt: string;
    updatedAt: string;
    description?: string;
}


// User Preferences
export interface NotificationPreferences {
  taskReminders: boolean; 
  projectUpdates: boolean; 
}

export type ApiKeyMode = 'server-default' | 'stored' | 'prompt';

export interface AiWriterPreferences {
  repetitionThreshold: number;
  autoAddLoreFromAi?: boolean;
  autoAnalyzeScenes?: boolean;
  contextualAiMenuStyle?: 'simple' | 'full';
  apiKeyMode?: ApiKeyMode; // Moved from UserPreferences for direct association with AI Writer
  customGeminiApiKey?: string; // Moved from UserPreferences
  selectedAiModel?: string;   // Moved from UserPreferences
}

export interface UserPreferences {
  notificationPreferences: NotificationPreferences;
  aiWriterPreferences: AiWriterPreferences;
  selectedFontFamily?: string; 
  // apiKeyMode, customGeminiApiKey, selectedAiModel are now part of AiWriterPreferences
}

// AppTheme interface
export interface AppTheme { 
  name: string;
  bg: string; // Main background for the entire app
  text: string; // Primary text color
  textSecondary: string; // Secondary, less prominent text
  accent: string; // Accent color (usually a background for buttons, highlights)
  accentText: string; // Text color for elements with accent background
  
  headerBg: string; // Background for the top header
  headerText: string; // Text color for the header
  
  sidebarBg: string; // Background for the main sidebar
  sidebarText: string; // Default text color for sidebar items
  sidebarHoverBg: string; // Background for sidebar items on hover
  sidebarHoverText: string; // Text color for sidebar items on hover
  sidebarActiveBg: string; // Background for the active sidebar item
  sidebarActiveText: string; // Text color for the active sidebar item
  sidebarBorder: string; // Border color for the sidebar (if any)

  cardBg: string; // Background for cards, modals, main content panels
  cardBorder: string; // Border for cards
  cardShadow: string; // Box shadow for cards
  
  button: string; // Primary button background
  buttonText: string; // Primary button text
  buttonHover: string; // Primary button background on hover
  
  buttonSecondaryBg: string; // Secondary button background
  buttonSecondaryText: string; // Secondary button text
  buttonSecondaryHoverBg: string; // Secondary button background on hover

  inputBg: string; 
  inputText: string; 
  inputBorder: string; 
  inputPlaceholder: string;
  focusRing: string; // e.g., 'focus:ring-blue-500'
  
  aiResponseBg: string; // Background for AI response display area
  divider: string; // Color for dividers/borders between sections

  // For ThemeSelector preview
  bg_preview?: string;
  bg_preview_color?: string;
  
  // Old properties (can be mapped or deprecated if new ones cover them)
  input?: string; // Original input styling (can be a composite class string) - AVOID USING, PREFER SPECIFIC ONES
  scrollbarThumb?: string;
  scrollbarTrack?: string;
}

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  getCss: (appTheme: AppTheme) => string;
  getHtmlWrapper: (noteContentHtml: string, noteTitle: string, templateCss: string, appTheme: AppTheme) => string;
}

// This ensures `window.marked` and other global libraries are recognized by TypeScript
declare global {
  interface Window {
    marked: {
      parse: (markdownString: string, options?: object) => string;
    };
    pdfjsLib: {
      GlobalWorkerOptions: {
        workerSrc: string;
      };
      getDocument: (src: string | URL | Uint8Array | { data: Uint8Array, [key: string]: any }) => {
        promise: Promise<{
          numPages: number;
          getPage: (pageNumber: number) => Promise<{
            getTextContent: () => Promise<{
              items: Array<{ str: string; dir: string; width: number; height: number; transform: number[]; fontName: string; hasEOL: boolean; [key: string]: any; }>;
              styles: { [key: string]: any; };
            }>;
            getViewport: (options: { scale: number; }) => { width: number; height: number; };
            render: (params: any) => { promise: Promise<void> };
            [key: string]: any;
          }>;
          [key: string]: any;
        }>;
      };
      version?: string;
      [key: string]: any;
    };
    mammoth: {
      extractRawText: (options: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string; messages: any[] }>;
      convertToHtml: (options: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string; messages: any[] }>;
      [key: string]: any;
    };
    YAML: { 
        parse: (str: string, options?: any) => any;
        stringify: (value: any, options?: any) => string;
    };
    Fuse: any; // For Fuse.js
    html2pdf: any; // For html2pdf.js
  }
}