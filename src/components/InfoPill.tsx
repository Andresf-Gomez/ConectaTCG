import type { LucideIcon } from 'lucide-react';

export function InfoPill({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
      <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center mb-3">
        <Icon className="text-white" size={18} />
      </div>
      <p className="font-bold text-slate-900 dark:text-white">{title}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{text}</p>
    </div>
  );
}
