"use client";

import { useState } from "react";
import { Copy, Check, Download, FileCode } from "lucide-react";

interface CodePreviewProps {
  code: string | null;
  metadata?: {
    templateType: string;
    generatedAt: string;
    promptUsed: string;
  };
  isLoading: boolean;
}

export default function CodePreview({ code, metadata, isLoading }: CodePreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!code) return;
    
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!code) return;

    const blob = new Blob([code], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `component-${Date.now()}.tsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900 rounded-xl shadow-md p-6 min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-400">Generating template...</p>
        </div>
      </div>
    );
  }

  if (!code) {
    return (
      <div className="bg-slate-900 rounded-xl shadow-md p-6 min-h-[500px] flex items-center justify-center">
        <div className="text-center text-slate-500">
          <FileCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Your generated code will appear here</p>
          <p className="text-sm mt-2">Enter a prompt and click Generate</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-slate-400 text-sm ml-2">component.tsx</span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors text-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
          
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Code */}
      <div className="p-4 overflow-auto max-h-[600px]">
        <pre className="text-sm text-slate-300 code-preview">
          <code>{code}</code>
        </pre>
      </div>

      {/* Metadata */}
      {metadata && (
        <div className="px-4 py-3 bg-slate-800 border-t border-slate-700 text-xs text-slate-500">
          <span>Type: {metadata.templateType}</span>
          <span className="mx-2">•</span>
          <span>Generated: {new Date(metadata.generatedAt).toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
