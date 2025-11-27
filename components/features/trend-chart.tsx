'use client';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { ComponentStat, WeeklyTrend, RAG_COMPONENTS } from '@/lib/types';

interface TrendRadarProps {
  data: ComponentStat[];
}

export function TrendRadar({ data }: TrendRadarProps) {
  const chartData = data.map((d) => ({
    component: RAG_COMPONENTS.find((c) => c.id === d.component)?.label || d.component,
    論文数: d.count,
    平均スコア: d.avgScore,
  }));

  return (
    <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
      <h3 className="text-lg font-bold text-white mb-4">RAGコンポーネント分布</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis
              dataKey="component"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 'auto']}
              tick={{ fill: '#64748b', fontSize: 10 }}
            />
            <Radar
              name="論文数"
              dataKey="論文数"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
            />
            <Radar
              name="平均スコア"
              dataKey="平均スコア"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.3}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#f1f5f9' }}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface WeeklyTrendChartProps {
  data: WeeklyTrend[];
}

export function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
  const chartData = data.map((d) => ({
    week: `${d.weekStart.slice(5)}`,
    合計: d.total,
    ...Object.fromEntries(
      Object.entries(d.byComponent).map(([key, value]) => [
        RAG_COMPONENTS.find((c) => c.id === key)?.label || key,
        value,
      ])
    ),
  }));

  return (
    <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
      <h3 className="text-lg font-bold text-white mb-4">週次トレンド推移</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis
              dataKey="week"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#f1f5f9' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="合計"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface ComponentBarChartProps {
  data: ComponentStat[];
}

export function ComponentBarChart({ data }: ComponentBarChartProps) {
  const chartData = data
    .map((d) => ({
      name: RAG_COMPONENTS.find((c) => c.id === d.component)?.label || d.component,
      論文数: d.count,
      平均スコア: d.avgScore,
    }))
    .sort((a, b) => b.論文数 - a.論文数);

  return (
    <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
      <h3 className="text-lg font-bold text-white mb-4">コンポーネント別論文数</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <XAxis type="number" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#f1f5f9' }}
            />
            <Bar dataKey="論文数" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
