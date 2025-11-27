import { Briefcase, TrendingUp, Users } from 'lucide-react';

interface PitchDeckCardProps {
    businessValue: string;
    roiPotential: string;
    targetIndustries: string[];
    hypeScore: number;
}

export function PitchDeckCard({ businessValue, roiPotential, targetIndustries, hypeScore }: PitchDeckCardProps) {
    return (
        <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
            <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Consultant's Pitch Deck</h3>
            </div>

            <div className="space-y-4">
                <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-1">Business Value</h4>
                    <p className="text-slate-200">{businessValue}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> ROI Potential
                        </h4>
                        <p className="text-green-400 font-medium">{roiPotential}</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-1 flex items-center gap-1">
                            <Users className="w-3 h-3" /> Target Industries
                        </h4>
                        <div className="flex flex-wrap gap-1">
                            {targetIndustries.map((ind) => (
                                <span key={ind} className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                                    {ind}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1">
                        <h4 className="text-sm font-medium text-slate-400">Hype vs Reality Score</h4>
                        <span className="text-sm font-bold text-white">{hypeScore}/10</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                            style={{ width: `${hypeScore * 10}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
