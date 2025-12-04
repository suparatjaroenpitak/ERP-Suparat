// Hero Template
// A full-width hero section with CTA

import Link from "next/link";

interface HeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  backgroundImage?: string;
  overlay?: boolean;
  centered?: boolean;
  size?: "sm" | "md" | "lg" | "full";
}

export default function Hero({
  title,
  subtitle,
  description,
  primaryCta,
  secondaryCta,
  backgroundImage,
  overlay = true,
  centered = true,
  size = "lg",
}: HeroProps) {
  const sizes = {
    sm: "min-h-[400px]",
    md: "min-h-[500px]",
    lg: "min-h-[600px]",
    full: "min-h-screen",
  };

  return (
    <section
      className={`
        relative flex items-center
        ${sizes[size]}
        ${backgroundImage ? "" : "bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800"}
      `}
      style={
        backgroundImage
          ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      {/* Overlay */}
      {backgroundImage && overlay && (
        <div className="absolute inset-0 bg-black/50" />
      )}

      {/* Content */}
      <div
        className={`
          relative z-10 container mx-auto px-4 py-20
          ${centered ? "text-center" : "text-left"}
        `}
      >
        <div className={centered ? "max-w-4xl mx-auto" : "max-w-2xl"}>
          {/* Subtitle */}
          {subtitle && (
            <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm text-white/90 rounded-full text-sm font-medium mb-6">
              {subtitle}
            </span>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {title}
          </h1>

          {/* Description */}
          {description && (
            <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed">
              {description}
            </p>
          )}

          {/* CTAs */}
          <div
            className={`
              flex flex-col sm:flex-row gap-4
              ${centered ? "justify-center" : "justify-start"}
            `}
          >
            {primaryCta && (
              <Link
                href={primaryCta.href}
                className="px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold text-lg hover:bg-slate-100 transition-colors shadow-lg inline-block"
              >
                {primaryCta.label}
              </Link>
            )}
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors inline-block"
              >
                {secondaryCta.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
