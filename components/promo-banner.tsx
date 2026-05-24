"use client";

import { ChevronRight } from "lucide-react";

export default function PromoBanner() {
  return (
    <div className="bg-white rounded-2xl p-3 flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
        <img
          src="https://s3.regru.cloud/smenuberu/illustrations/promoillustration.png"
          alt="Акция"
          className="w-12 h-12 object-contain rounded-xl"
        />
        
        <div>
          <div className="text-sm font-semibold text-zinc-900">Спецзадание</div>
          <div className="text-base font-bold text-zinc-900">До 10 000 ₽</div>
        </div>
      </div>

      <div className="flex items-center gap-1 text-[#c29cf2]">
        <span className="text-xs font-medium">7 дней</span>
        <ChevronRight className="h-4 w-4" />
      </div>
    </div>
  );
}