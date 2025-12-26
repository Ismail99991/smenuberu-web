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

  // Закрываем модалку при клике вне ее
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
                      "transition-[background-color,color,box-shadow,transform] duration-200 ease-out",
                      active
                        ? "bg-brand text-white shadow-[0_8px_18px_rgba(79,70,229,0.28)]"
                        : "border border-gray-200 bg-white/80 text-gray-700 backdrop-blur",
                      isTypeTab && selectedType && !showTypeModal && "bg-blue-50 border-blue-200 text-blue-700"
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
                          "transition-transform",
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
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="font-semibold text-gray-900">Тип объекта</h3>
                <p className="text-sm text-gray-500">Выберите тип</p>
              </div>
              <button
                onClick={() => setShowTypeModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 tap"
                aria-label="Закрыть"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Список типов */}
            <div className="p-2 overflow-y-auto max-h-[60vh]">
              {availableTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeSelect(type)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg mb-1 tap transition-colors",
                    "hover:bg-gray-50 active:bg-gray-100",
                    selectedType === type && "bg-blue-50 text-blue-700 font-medium"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Футер модалки */}
            {selectedType && (
              <div className="border-t p-4">
                <button
                  onClick={clearTypeFilter}
                  className="w-full py-3 text-center text-red-600 font-medium hover:bg-red-50 rounded-lg tap transition-colors"
                >
                  Сбросить фильтр
                </button>
              </div>
            )}

            <div className="p-4 border-t">
              <button
                onClick={() => setShowTypeModal(false)}
                className="w-full py-3 text-center text-gray-600 font-medium hover:bg-gray-50 rounded-lg tap transition-colors"
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