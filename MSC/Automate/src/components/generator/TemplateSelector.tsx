"use client";

import { Layout, FileCode, Layers } from "lucide-react";

interface TemplateSelectorProps {
  selected: "component" | "page" | "layout";
  onSelect: (type: "component" | "page" | "layout") => void;
}

const options = [
  {
    type: "component" as const,
    label: "Component",
    icon: FileCode,
    description: "Reusable UI component",
  },
  {
    type: "page" as const,
    label: "Page",
    icon: Layout,
    description: "Full page template",
  },
  {
    type: "layout" as const,
    label: "Layout",
    icon: Layers,
    description: "Page layout wrapper",
  },
];

export default function TemplateSelector({
  selected,
  onSelect,
}: TemplateSelectorProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md dark:shadow-slate-900/50 p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
        Template Type
      </h3>
      
      <div className="grid grid-cols-3 gap-3">
        {options.map(({ type, label, icon: Icon, description }) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selected === type
                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30"
                : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            <Icon
              className={`w-6 h-6 mb-2 ${
                selected === type ? "text-primary-600 dark:text-primary-400" : "text-slate-500 dark:text-slate-400"
              }`}
            />
            <div
              className={`font-medium ${
                selected === type ? "text-primary-700 dark:text-primary-400" : "text-slate-700 dark:text-slate-300"
              }`}
            >
              {label}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
