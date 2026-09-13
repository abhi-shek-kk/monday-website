import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 p-8 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#1C1917] text-[#FDB27C] flex items-center justify-center shadow-md animate-bounce">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
      <div className="space-y-1">
        <h2 className="text-sm font-bold font-heading text-[#1C1917] uppercase tracking-wider">
          St. Berchmans College
        </h2>
        <p className="text-xs text-[#756860]">Loading department content...</p>
      </div>
    </div>
  );
}
