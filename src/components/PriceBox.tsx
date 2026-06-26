export function PriceBox({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-2xl p-4 border ${
        highlight
          ? 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800'
          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
      }`}
    >
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="font-black text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}
