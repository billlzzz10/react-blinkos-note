
import React from 'react';
import { Palette } from 'lucide-react';
import { AppTheme } from './types';

interface ThemeSelectorProps {
  themes: Record<string, AppTheme>;
  activeTheme: string;
  currentThemeStyles: AppTheme;
  setActiveTheme: (themeKey: string) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ themes, activeTheme, currentThemeStyles, setActiveTheme }) => {
  const [showSelector, setShowSelector] = React.useState(false);
  const selectorRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setShowSelector(false);
      }
    };
    if (showSelector) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSelector]);


  return (
    <div className="relative" ref={selectorRef}>
      <button
        onClick={() => setShowSelector(!showSelector)}
        className={`p-2 rounded-full transition-colors duration-200 hover:bg-opacity-80 
                   ${showSelector ? currentThemeStyles.sidebarHoverBg : 'bg-transparent'} 
                   ${currentThemeStyles.headerText}`}
        title="เลือกธีม"
        aria-label="เลือกธีม"
        aria-expanded={showSelector}
      >
        <Palette className={`w-5 h-5`} />
      </button>
      {showSelector && (
        <div className={`absolute top-full right-0 mt-2 ${currentThemeStyles.cardBg} border ${currentThemeStyles.cardBorder} rounded-xl p-3 shadow-xl z-50`}>
          <p className={`text-xs ${currentThemeStyles.textSecondary} mb-2 px-1`}>เลือกธีม:</p>
          <div className="flex gap-2">
            {Object.entries(themes).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => { setActiveTheme(key); setShowSelector(false);}}
                className={`w-8 h-8 rounded-full transition-all duration-200 border-2 ${activeTheme === key ? currentThemeStyles.focusRing?.replace('focus:ring-','ring-') : 'border-transparent'} hover:scale-105 ${theme.bg_preview || theme.bg}`}
                title={theme.name}
                aria-label={`Set theme to ${theme.name}`}
                style={{ backgroundColor: theme.bg_preview_color || undefined }} // For gradient themes, bg_preview_color can be a solid representation
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper to add bg_preview and bg_preview_color to themes in NoteTaskApp if they don't exist
export const processThemesForSelector = (themes: Record<string, AppTheme>): Record<string, AppTheme> => {
    const processed: Record<string, AppTheme> = {};
    for (const key in themes) {
        const theme = themes[key];
        processed[key] = {
            ...theme,
            bg_preview: theme.bg.split(' ').find(cls => cls.startsWith('from-') || cls.startsWith('bg-') && !cls.includes('gradient')) || theme.bg,
            bg_preview_color: theme.sidebarActiveBg.startsWith('bg-') ? undefined : theme.sidebarActiveBg // If it's a class, Tailwind handles it. If it's a hex, use it.
        };
         // If bg is a gradient, try to pick a representative color for the preview button
        if (theme.bg.includes('gradient')) {
            const fromColorClass = theme.bg.split(' ').find(cls => cls.startsWith('from-'));
            if (fromColorClass) {
                 processed[key].bg_preview = fromColorClass; // Use the 'from-' color of the gradient
            } else {
                 processed[key].bg_preview = theme.sidebarBg; // Fallback to sidebar or accent
            }
        } else {
             processed[key].bg_preview = theme.bg;
        }
    }
    return processed;
};


export default ThemeSelector;
