'use client';

import { cn } from '@/lib/utils';
import { RAG_COMPONENTS } from '@/lib/types';

interface ComponentFilterProps {
  selected: string | null;
  onChange: (component: string | null) => void;
}

export function ComponentFilter({ selected, onChange }: ComponentFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={cn(
          'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
          selected === null
            ? 'bg-[#0066FF] dark:bg-[#3D8BFF] text-white shadow-md shadow-blue-500/30'
            : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border hover:text-neutral-900 dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-600'
        )}
      >
        すべて
      </button>
      {RAG_COMPONENTS.map((component) => (
        <button
          key={component.id}
          onClick={() => onChange(component.id)}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            selected === component.id
              ? cn(component.color, 'text-white shadow-md')
              : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border hover:text-neutral-900 dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-600'
          )}
        >
          {component.label}
        </button>
      ))}
    </div>
  );
}
