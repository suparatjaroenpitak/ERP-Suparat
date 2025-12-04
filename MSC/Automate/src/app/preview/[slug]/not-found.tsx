import Link from "next/link";
import { FileQuestion, Home, RefreshCw } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileQuestion className="w-10 h-10 text-red-500" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Template Not Found
          </h1>

          {/* Description */}
          <p className="text-slate-600 mb-8">
            The template you&apos;re looking for doesn&apos;t exist or may have been removed.
            Try generating a new template or check the slug.
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/generate"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Generate New Template
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Templates are stored in <code className="bg-slate-200 px-1.5 py-0.5 rounded">/templates/[slug]/</code>
        </p>
      </div>
    </div>
  );
}
