'use client';

import { motion } from 'framer-motion';
import {
  BookOpen,
  TrendingUp,
  Sparkles,
  Calendar,
  Award,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap = {
  BookOpen,
  TrendingUp,
  Sparkles,
  Calendar,
  Award,
  Target,
};

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  iconName: keyof typeof iconMap;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

const colorMap = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
};

export function StatsCard({
  title,
  value,
  subtitle,
  iconName,
  trend,
  color = 'blue',
}: StatsCardProps) {
  const Icon = iconMap[iconName];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-800 rounded-lg border hover-lift p-5 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            colorMap[color],
            'bg-opacity-10 dark:bg-opacity-20'
          )}
        >
          <Icon className={cn('h-5 w-5', colorMap[color].replace('bg-', 'text-'))} />
        </div>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium px-2 py-1 rounded-full',
              trend.isUp
                ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                : 'bg-red-500/20 text-red-600 dark:text-red-400'
            )}
          >
            {trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div>
        <span className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</span>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{title}</p>
        {subtitle && <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-0.5">{subtitle}</p>}
      </div>
    </motion.div>
  );
}
