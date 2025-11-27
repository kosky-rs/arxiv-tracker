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
          'px-4 py-2 rounded-xl text-sm font-medium transition-all',
          selected === null
            ? 'bg-white text-slate-900'
            : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
        )}
      >
        すべて
      </button>
      {RAG_COMPONENTS.map((component) => (
        <button
          key={component.id}
          onClick={() => onChange(component.id)}
          className={cn(
            'px-4 py-2 rounded-xl text-sm font-medium transition-all',
            selected === component.id
              ? cn(component.color, 'text-white')
              : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
          )}
        >
          {component.label}
        </button>
      ))}
    </div>
  );
}
