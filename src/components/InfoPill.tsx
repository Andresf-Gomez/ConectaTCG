import type { LucideIcon } from 'lucide-react';

export function InfoPill({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center mb-3">
        <Icon className="text-white" size={18} />
      </div>
      <p className="font-bold text-slate-900">{title}</p>
      <p className="text-sm text-slate-500">{text}</p>
    </div>
  );
}
