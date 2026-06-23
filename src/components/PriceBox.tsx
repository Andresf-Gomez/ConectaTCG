export function PriceBox({ label, value, highlight = false }) {
  return (
    <div
      className={`rounded-2xl p-4 border ${
        highlight
          ? 'bg-yellow-50 border-yellow-200'
          : 'bg-slate-50 border-slate-200'
      }`}
    >
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-black text-slate-900">{value}</p>
    </div>
  );
}
