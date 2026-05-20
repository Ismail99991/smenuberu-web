// components/FilterTabs.tsx
"use client";

import { cn } from "@/lib/cn";
import { Bus, BadgePercent, Utensils, Star, Building2, ChevronDown, X } from "lucide-react";
import { useState, useEffect } from "react";

export type FilterTabKey = "all" | "type" | "bus" | "premium" | "food" | "fav";

type TabIcon = React.ComponentType<{ size?: number; className?: string }>;

export type FilterTab = {
  key: FilterTabKey;
  label: string;
  icon?: TabIcon;
  filterValue?: string;
};

interface FilterTabsProps {
  activeTab: FilterTabKey;
  onTabChange: (tab: FilterTabKey, filterValue?: string) => void;
  className?: string;
  availableTypes?: string[];
  selectedType?: string;
}

const FILTER_TABS: readonly FilterTab[] = [
  { key: "all", label: "Все" },
  { key: "type", label: "Тип объекта", icon: Building2 },
  { key: "bus", label: "Есть автобусы", icon: Bus },
  { key: "premium", label: "Высокий тариф", icon: BadgePercent },
  { key: "food", label: "Есть обеды", icon: Utensils },
  { key: "fav", label: "Избранные", icon: Star },
] as const;

export default function FilterTabs({ 
  activeTab, 
  onTabChange, 
  className,
  availableTypes = [],
  selectedType
}: FilterTabsProps) {
  const [showTypeModal, setShowTypeModal] = useState(false);

  const handleTabClick = (tab: FilterTabKey) => {
    if (tab === "type") {
      setShowTypeModal(true);
    } else {
      onTabChange(tab);
    }
  };

  const handleTypeSelect = (type: string) => {
    onTabChange("type", type);
    setShowTypeModal(false);
  };

  const clearTypeFilter = () => {
    onTabChange("all");
    setShowTypeModal(false);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowTypeModal(false);
    };

    if (showTypeModal) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [showTypeModal]);

  return (
    <>
      <div className={cn("relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen", className)}>
        <div className="px-4">
          <div className="flex gap-2 overflow-x-auto snap-x py-1">
            {FILTER_TABS.map((t) => {
              const active = activeTab === t.key;
              const Icon = t.icon;
              const isTypeTab = t.key === "type";

              return (
                <div key={t.key} className="relative snap-start shrink-0">
                  <button
                    onClick={() => handleTabClick(t.key)}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-4 py-2 text-sm tap",
                      "transition-all duration-200 ease-out active:scale-[0.96]",
                      active
                        ? "bg-[#c29cf2] text-white shadow-[0_8px_18px_rgba(194,156,242,0.28)]"  // ← фиолетовый для активного
                        : "border border-zinc-200 bg-white/80 text-zinc-700 backdrop-blur hover:bg-zinc-50",
                      isTypeTab && selectedType && !showTypeModal && "bg-[#c29cf2]/10 border-[#c29cf2]/30 text-[#c29cf2]"  // ← фиолетовый для выбранного типа
                    )}
                  >
                    {Icon ? <Icon size={16} /> : null}
                    <span className="whitespace-nowrap">
                      {isTypeTab && selectedType ? selectedType : t.label}
                    </span>
                    {isTypeTab && (
                      <ChevronDown 
                        size={14} 
                        className={cn(
                          "transition-transform duration-200",
                          showTypeModal && "rotate-180"
                        )} 
                      />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Модалка выбора типа */}
      {showTypeModal && availableTypes.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div 
            className="bg-white rounded-2xl w-full max-w-sm max-h-[80vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Шапка модалки */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-200">
              <div>
                <h3 className="font-semibold text-zinc-900">Тип объекта</h3>
                <p className="text-sm text-zinc-500">Выберите тип</p>
              </div>
              <button
                onClick={() => setShowTypeModal(false)}
                className="p-1 rounded-full hover:bg-zinc-100 tap transition-colors active:scale-[0.95]"
                aria-label="Закрыть"
              >
                <X size={20} className="text-zinc-500" />
              </button>
            </div>

            {/* Список типов */}
            <div className="p-2 overflow-y-auto max-h-[60vh]">
              {availableTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeSelect(type)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg mb-1 tap transition-all duration-150",
                    "hover:bg-zinc-50 active:scale-[0.98]",
                    selectedType === type && "bg-[#c29cf2]/10 text-[#c29cf2] font-medium"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Футер модалки */}
            {selectedType && (
              <div className="border-t border-zinc-200 p-4">
                <button
                  onClick={clearTypeFilter}
                  className="w-full py-3 text-center text-rose-600 font-medium hover:bg-rose-50 rounded-lg tap transition-colors active:scale-[0.98]"
                >
                  Сбросить фильтр
                </button>
              </div>
            )}

            <div className="p-4 border-t border-zinc-200">
              <button
                onClick={() => setShowTypeModal(false)}
                className="w-full py-3 text-center text-zinc-600 font-medium hover:bg-zinc-50 rounded-lg tap transition-colors active:scale-[0.98]"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}