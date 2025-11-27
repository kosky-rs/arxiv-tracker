'use client';

import { Check, Copy, Terminal } from 'lucide-react';
import { useState } from 'react';

interface BlueprintCardProps {
    language: string;
    code: string;
    description: string;
}

export function BlueprintCard({ language, code, description }: BlueprintCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-slate-300">Implementation Blueprint</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="text-slate-400 hover:text-white transition-colors"
                >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
            </div>

            <div className="p-4 bg-slate-950">
                <p className="text-sm text-slate-400 mb-4">{description}</p>
                <div className="relative">
                    <pre className="p-4 rounded-lg bg-slate-900 overflow-x-auto text-sm font-mono text-slate-300">
                        <code>{code}</code>
                    </pre>
                    <div className="absolute top-2 right-2 text-xs text-slate-500 uppercase">{language}</div>
                </div>
            </div>
        </div>
    );
}
