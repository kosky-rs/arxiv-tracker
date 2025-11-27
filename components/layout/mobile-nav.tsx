'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, TrendingUp, FileText, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'ホーム', href: '/', icon: Sparkles },
  { name: '論文', href: '/papers', icon: BookOpen },
  { name: 'トレンド', href: '/trends', icon: TrendingUp },
  { name: 'ダイジェスト', href: '/digest', icon: FileText },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:bg-neutral-900/95 dark:supports-[backdrop-filter]:bg-neutral-900/80">
      <div className="flex items-center justify-around py-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px]',
                isActive
                  ? 'text-[#0066FF] dark:text-[#3D8BFF]'
                  : 'text-neutral-500 dark:text-neutral-400'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'scale-110')} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
