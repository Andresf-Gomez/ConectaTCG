export function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="font-black text-slate-900 dark:text-white text-xl">{value}</p>
    </div>
  );
}
