"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";

export default function PromoBanner() {
  return (
    <div className="bg-white rounded-2xl p-3 flex items-center justify-between">
      {/* Левая часть: иконка + текст */}
      <div className="flex items-center gap-3 flex-1">
        {/* Квадратная иллюстрация */}
        <div className="w-12 h-12 relative flex-shrink-0">
          <Image
            src="https://smenuberu.s3.regru.cloud/illustrations/promoillustration.png"
            alt="Акция"
            width={48}
            height={48}
            className="object-contain"
          />
        </div>
        
        {/* Текст */}
        <div>
          <div className="text-sm font-semibold text-zinc-900">Спецзадание</div>
          <div className="text-base font-bold text-zinc-900">До 10 000 ₽</div>
        </div>
      </div>

      {/* Правая часть: срок + стрелка */}
      <div className="flex items-center gap-1 text-[#c29cf2]">
        <span className="text-xs font-medium">7 дней</span>
        <ChevronRight className="h-4 w-4" />
      </div>
    </div>
  );
}