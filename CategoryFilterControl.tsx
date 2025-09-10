
import React from 'react';
import { ListFilter } from 'lucide-react';

interface CategoryFilterControlProps {
  categories: string[];
  activeFilter: string;
  onFilterChange: (category: string) => void;
  getCategoryIcon: (category: string) => JSX.Element;
  currentTheme: {
    text: string;
    button: string;
    cardBg: string;
  };
  label: string;
}

const CategoryFilterControl: React.FC<CategoryFilterControlProps> = ({
  categories,
  activeFilter,
  onFilterChange,
  getCategoryIcon,
  currentTheme,
  label,
}) => {
  return (
    <div className={`mb-6 p-3 rounded-lg ${currentTheme.cardBg} bg-opacity-70 flex items-center gap-2 flex-wrap`}>
      <span className={`text-sm font-medium mr-2 ${currentTheme.text} opacity-90 flex items-center`}>
        <ListFilter className="w-4 h-4 mr-1.5"/>{label}:
      </span>
      {categories.map(category => (
        <button
          key={category}
          onClick={() => onFilterChange(category)}
          className={`px-3 py-1.5 text-xs rounded-md transition-all duration-200 flex items-center gap-1.5
            ${activeFilter === category 
              ? `${currentTheme.button} text-white shadow-md` 
              : `${currentTheme.text} bg-white/5 hover:bg-white/10`}
          `}
          aria-pressed={activeFilter === category}
        >
          {category !== 'all' && getCategoryIcon(category)}
          {category === 'all' ? 'ทั้งหมด' : category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilterControl;
