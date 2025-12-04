"use client";

import { Sparkles, Trash2 } from "lucide-react";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  onClear: () => void;
  isGenerating: boolean;
  error: string | null;
}

export default function PromptInput({
  value,
  onChange,
  onGenerate,
  onClear,
  isGenerating,
  error,
}: PromptInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      onGenerate();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md dark:shadow-slate-900/50 p-6 border border-slate-200 dark:border-slate-700">
      <label className="block text-lg font-semibold text-slate-800 dark:text-white mb-4">
        Describe your template
      </label>
      
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="e.g., Create a responsive card component with an image, title, description, and action button..."
        rows={6}
        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500"
      />
      
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {value.length}/2000 characters • Ctrl+Enter to generate
        </span>
        
        <div className="flex gap-3">
          <button
            onClick={onClear}
            disabled={isGenerating || !value}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
          
          <button
            onClick={onGenerate}
            disabled={isGenerating || !value.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
            {isGenerating ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
