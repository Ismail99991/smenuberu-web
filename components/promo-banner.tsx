"use client";

import { Trophy, ChevronRight } from "lucide-react";

export default function PromoBanner() {
  return (
    <div className="flex items-center gap-3">
      {/* Иконка — фон фиолетовый */}
      <div className="h-10 w-10 rounded-full bg-[#c29cf2]/20 flex items-center justify-center flex-shrink-0">
        <Trophy className="h-5 w-5 text-[#c29cf2]" />
      </div>
      
      {/* Контент */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-zinc-900">Спецзадание</span>
          <span className="text-xs text-zinc-400 flex items-center gap-1">
            7 дней
            <ChevronRight className="h-3 w-3" />
          </span>
        </div>
        
        <div className="text-base font-bold text-zinc-900 mt-0.5">
          До 10 000 ₽
        </div>
        
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs text-zinc-500">6/10 заданий</span>
          <div className="w-24 h-1 bg-[#c29cf2]/20 rounded-full overflow-hidden">
            <div className="h-full bg-[#c29cf2] rounded-full" style={{ width: "60%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}