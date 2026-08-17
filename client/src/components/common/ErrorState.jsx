import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

const ErrorState = ({ title = "Something went wrong", message, onRetry }) => (
  <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[24px] border border-red-500/20 bg-red-500/5 px-6 py-10 text-center">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-300">
      <ShieldAlert className="h-5 w-5" />
    </div>
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    <p className="mt-2 max-w-md text-sm text-red-200">{message || "We couldn’t load this data right now. Please try again shortly."}</p>
    {onRetry && (
      <Button onClick={onRetry} className="mt-5 rounded-full">
        Retry
      </Button>
    )}
  </div>
);

export default ErrorState;
