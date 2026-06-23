export function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-slate-50 rounded-2xl p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-black text-slate-900 text-xl">{value}</p>
    </div>
  );
}
