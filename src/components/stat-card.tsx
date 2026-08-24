export function StatCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: number | string;
  hint: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <div className="mt-3 text-3xl font-black tracking-tight text-slate-950">{value}</div>
      <p className="mt-2 text-xs text-slate-400">{hint}</p>
    </div>
  );
}
