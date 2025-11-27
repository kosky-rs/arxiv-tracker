'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, TrendingUp, FileText, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'ダッシュボード', href: '/', icon: Sparkles },
  { name: '論文ライブラリ', href: '/papers', icon: BookOpen },
  { name: 'トレンド分析', href: '/trends', icon: TrendingUp },
  { name: '週次ダイジェスト', href: '/digest', icon: FileText },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:bg-neutral-900/95 dark:supports-[backdrop-filter]:bg-neutral-900/80">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#0066FF] transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-blue-500/50">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">RAG Knowledge Hub</h1>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 -mt-0.5">最先端RAG研究ナレッジベース</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-[#0066FF] text-white shadow-md shadow-blue-500/30'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-medium text-green-700 dark:text-green-300">毎日自動更新</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
