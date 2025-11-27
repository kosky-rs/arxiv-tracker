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
  blue: 'from-blue-500 to-cyan-500',
  green: 'from-green-500 to-emerald-500',
  purple: 'from-purple-500 to-pink-500',
  orange: 'from-orange-500 to-yellow-500',
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
      className="bg-slate-900/50 rounded-2xl border border-slate-800 p-5 hover:border-slate-700 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center',
            colorMap[color]
          )}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium px-2 py-1 rounded-full',
              trend.isUp
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            )}
          >
            {trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div>
        <span className="text-2xl font-bold text-white">{value}</span>
        <p className="text-sm text-slate-500 mt-1">{title}</p>
        {subtitle && <p className="text-xs text-slate-600 mt-0.5">{subtitle}</p>}
      </div>
    </motion.div>
  );
}
