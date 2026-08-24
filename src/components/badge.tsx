import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  inactive: "bg-slate-50 text-slate-700 ring-slate-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  in_progress: "bg-blue-50 text-blue-700 ring-blue-200",
  in_review: "bg-purple-50 text-purple-700 ring-purple-200",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
  overdue: "bg-rose-50 text-rose-700 ring-rose-200",
  upcoming: "bg-sky-50 text-sky-700 ring-sky-200",
  high: "bg-orange-50 text-orange-700 ring-orange-200",
  urgent: "bg-rose-50 text-rose-700 ring-rose-200",
  medium: "bg-slate-50 text-slate-700 ring-slate-200",
  low: "bg-zinc-50 text-zinc-700 ring-zinc-200",
};

export function Badge({ children, value }: { children: React.ReactNode; value?: string | null }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        variants[value ?? ""] ?? "bg-slate-50 text-slate-700 ring-slate-200",
      )}
    >
      {children}
    </span>
  );
}
