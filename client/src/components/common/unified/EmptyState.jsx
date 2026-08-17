import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const EmptyState = ({ title, message, actionLabel, onAction }) => (
  <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-slate-950/40 px-6 py-10 text-center">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300">
      <Sparkles className="h-5 w-5" />
    </div>
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    <p className="mt-2 max-w-md text-sm text-slate-400">{message}</p>
    {actionLabel ? <Button onClick={onAction} className="mt-5 rounded-full">{actionLabel}</Button> : null}
  </div>
);

export default EmptyState;
