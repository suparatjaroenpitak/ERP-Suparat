"use client";

import { useState } from "react";
import PromptInput from "./PromptInput";
import CodePreview from "./CodePreview";
import TemplateSelector from "./TemplateSelector";

export interface GeneratedResult {
  code: string;
  metadata?: {
    templateType: string;
    generatedAt: string;
    promptUsed: string;
  };
}

export default function TemplateGenerator() {
  const [prompt, setPrompt] = useState("");
  const [templateType, setTemplateType] = useState<"component" | "page" | "layout">("component");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, templateType }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to generate template");
      }

      setResult({
        code: data.code,
        metadata: data.metadata,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setPrompt("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Panel - Input */}
      <div className="space-y-6">
        <TemplateSelector 
          selected={templateType} 
          onSelect={setTemplateType} 
        />
        
        <PromptInput
          value={prompt}
          onChange={setPrompt}
          onGenerate={handleGenerate}
          onClear={handleClear}
          isGenerating={isGenerating}
          error={error}
        />

        {/* Quick Examples */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md dark:shadow-slate-900/50 p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
            Quick Examples
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              "Create a button component",
              "Build a card with image",
              "Design a navbar with mobile menu",
              "Create a contact form",
              "Build a hero section",
            ].map((example) => (
              <button
                key={example}
                onClick={() => setPrompt(example)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div>
        <CodePreview 
          code={result?.code || null}
          metadata={result?.metadata}
          isLoading={isGenerating}
        />
      </div>
    </div>
  );
}
