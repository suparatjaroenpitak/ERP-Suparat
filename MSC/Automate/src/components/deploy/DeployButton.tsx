"use client";

import { useState } from "react";
import { Rocket, Loader2, ExternalLink, CheckCircle2, XCircle } from "lucide-react";

interface DeployButtonProps {
  slug: string;
  componentName: string;
  variant?: "full" | "compact";
}

interface DeploymentInfo {
  id: string;
  url: string;
  status: string;
  projectName: string;
  createdAt: string;
}

export function DeployButton({ slug, componentName, variant = "full" }: DeployButtonProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<{
    success: boolean;
    deployment?: DeploymentInfo;
    error?: string;
  } | null>(null);

  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeploymentResult(null);

    try {
      const response = await fetch(`/api/deploy/${slug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setDeploymentResult({
          success: true,
          deployment: data.deployment,
        });
      } else {
        setDeploymentResult({
          success: false,
          error: data.error || "Deployment failed",
        });
      }
    } catch (err) {
      setDeploymentResult({
        success: false,
        error: err instanceof Error ? err.message : "Failed to deploy",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const resetDeployment = () => {
    setDeploymentResult(null);
  };

  // Compact variant (icon button)
  if (variant === "compact") {
    return (
      <div className="relative">
        <button
          onClick={handleDeploy}
          disabled={isDeploying}
          title="Deploy to Vercel"
          className="p-2 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeploying ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Rocket className="w-4 h-4" />
          )}
        </button>
        
        {/* Tooltip for result */}
        {deploymentResult && (
          <div className="absolute right-0 top-full mt-2 z-50">
            <div className={`p-3 rounded-lg shadow-lg text-sm whitespace-nowrap ${
              deploymentResult.success
                ? "bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800"
            }`}>
              {deploymentResult.success && deploymentResult.deployment ? (
                <a
                  href={deploymentResult.deployment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-green-700 dark:text-green-400 hover:underline"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  View Deployment
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <XCircle className="w-4 h-4" />
                  {deploymentResult.error}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full variant (button with text)
  return (
    <div className="space-y-3">
      <button
        onClick={handleDeploy}
        disabled={isDeploying}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDeploying ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Deploying...
          </>
        ) : (
          <>
            <Rocket className="w-4 h-4" />
            Deploy to Vercel
          </>
        )}
      </button>

      {/* Deployment Result */}
      {deploymentResult && (
        <div
          className={`p-4 rounded-xl ${
            deploymentResult.success
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          }`}
        >
          {deploymentResult.success && deploymentResult.deployment ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Deployed Successfully!</span>
              </div>
              <div className="text-sm space-y-1">
                <p className="text-green-600 dark:text-green-500">
                  <span className="font-medium">Project:</span>{" "}
                  {deploymentResult.deployment.projectName}
                </p>
                <p className="text-green-600 dark:text-green-500">
                  <span className="font-medium">Status:</span>{" "}
                  <span className="capitalize">{deploymentResult.deployment.status}</span>
                </p>
              </div>
              <a
                href={deploymentResult.deployment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
              >
                Visit Site
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={resetDeployment}
                className="ml-2 px-3 py-1.5 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg text-sm transition-colors"
              >
                Dismiss
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">Deployment Failed</span>
              </div>
              <p className="text-sm text-red-600 dark:text-red-500">
                {deploymentResult.error}
              </p>
              <button
                onClick={handleDeploy}
                className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={resetDeployment}
                className="ml-2 px-3 py-1.5 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-sm transition-colors"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
