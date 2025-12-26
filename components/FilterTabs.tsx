"use client";

import { cn } from "@/lib/cn";
import { Bus, BadgePercent, Utensils, Star, Building2, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

export type FilterTabKey = "all" | "type" | "bus" | "premium" | "food" | "fav";

type TabIcon = React.ComponentType<{ size?: number; className?: string }>;

export type FilterTab = {
  key: FilterTabKey;
  label: string;
  icon?: TabIcon;
  filterValue?: string; // Для типа объекта
};

interface FilterTabsProps {
  activeTab: FilterTabKey;
  onTabChange: (tab: FilterTabKey, filterValue?: string) => void;
  className?: string;
  availableTypes?: string[]; // Типы объектов с бэка
  selectedType?: string; // Выбранный тип объекта
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
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const handleTabClick = (tab: FilterTabKey) => {
    if (tab === "type") {
      setShowTypeDropdown(!showTypeDropdown);
    } else {
      setShowTypeDropdown(false);
      onTabChange(tab);
    }
  };

  const handleTypeSelect = (type: string) => {
    onTabChange("type", type);
    setShowTypeDropdown(false);
  };

  const clearTypeFilter = () => {
    onTabChange("all");
    setShowTypeDropdown(false);
  };

  // Закрываем dropdown при клике вне его
  useEffect(() => {
    const handleClickOutside = () => {
      setShowTypeDropdown(false);
    };

    if (showTypeDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showTypeDropdown]);

  return (
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTabClick(t.key);
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm tap",
                    "transition-[background-color,color,box-shadow,transform] duration-200 ease-out",
                    active
                      ? "bg-brand text-white shadow-[0_8px_18px_rgba(79,70,229,0.28)]"
                      : "border border-gray-200 bg-white/80 text-gray-700 backdrop-blur",
                    isTypeTab && selectedType && !showTypeDropdown && "bg-blue-50 border-blue-200 text-blue-700"
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
                        showTypeDropdown && "rotate-180"
                      )} 
                    />
                  )}
                </button>

                {/* Выпадающий список для типа объекта */}
                {isTypeTab && showTypeDropdown && availableTypes.length > 0 && (
                  <div 
                    className="absolute top-full left-0 mt-2 z-50 min-w-[200px] max-h-60 overflow-y-auto bg-white rounded-xl border border-gray-200 shadow-lg py-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Выберите тип объекта
                    </div>
                    
                    {availableTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => handleTypeSelect(type)}
                        className={cn(
                          "w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors",
                          selectedType === type && "bg-blue-50 text-blue-700 font-medium"
                        )}
                      >
                        {type}
                      </button>
                    ))}

                    {selectedType && (
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={clearTypeFilter}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Сбросить фильтр
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
