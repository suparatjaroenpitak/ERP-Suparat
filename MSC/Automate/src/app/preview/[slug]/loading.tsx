export default function PreviewLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header Skeleton */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-6 bg-slate-200 rounded animate-pulse" />
            <div className="h-6 w-px bg-slate-300" />
            <div className="space-y-2">
              <div className="w-40 h-6 bg-slate-200 rounded animate-pulse" />
              <div className="w-24 h-4 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Preview Panel Skeleton */}
          <div className="xl:col-span-2 space-y-6">
            {/* Live Preview Skeleton */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                <div className="w-32 h-6 bg-slate-200 rounded animate-pulse" />
              </div>
              <div className="p-8 bg-gradient-to-br from-slate-100 to-slate-50 min-h-[400px] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            </div>

            {/* Code Skeleton */}
            <div className="bg-slate-900 rounded-2xl shadow-lg overflow-hidden">
              <div className="px-4 py-3 bg-slate-800 border-b border-slate-700">
                <div className="w-40 h-5 bg-slate-700 rounded animate-pulse" />
              </div>
              <div className="p-4 space-y-2">
                {[...Array(15)].map((_, i) => (
                  <div
                    key={i}
                    className="h-4 bg-slate-800 rounded animate-pulse"
                    style={{ width: `${Math.random() * 40 + 60}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="w-32 h-6 bg-slate-200 rounded animate-pulse mb-4" />
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="w-20 h-4 bg-slate-200 rounded animate-pulse" />
                    <div className="w-full h-5 bg-slate-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
