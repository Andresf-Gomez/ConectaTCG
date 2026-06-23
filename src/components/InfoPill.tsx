export function InfoPill({ icon: Icon, title, text }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <Icon className="text-blue-600 mb-2" size={22} />
      <p className="font-bold text-slate-900">{title}</p>
      <p className="text-sm text-slate-500">{text}</p>
    </div>
  );
}
