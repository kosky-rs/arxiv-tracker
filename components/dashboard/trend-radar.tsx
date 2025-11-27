'use client';

import {
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';

const data = [
    { subject: 'Retrieval', A: 120, fullMark: 150 },
    { subject: 'Generation', A: 98, fullMark: 150 },
    { subject: 'Reranking', A: 86, fullMark: 150 },
    { subject: 'Embedding', A: 99, fullMark: 150 },
    { subject: 'Orchestration', A: 85, fullMark: 150 },
    { subject: 'Evaluation', A: 65, fullMark: 150 },
];

export function TrendRadar() {
    return (
        <div className="w-full h-[300px] bg-slate-900/50 rounded-xl border border-slate-800 p-4 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">RAG Trend Radar (This Week)</h3>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                    <Radar
                        name="Paper Count"
                        dataKey="A"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="#3b82f6"
                        fillOpacity={0.3}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                        itemStyle={{ color: '#60a5fa' }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
