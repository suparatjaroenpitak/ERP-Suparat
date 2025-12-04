// Card Template
// A flexible card component for displaying content

import Image from "next/image";

interface CardProps {
  title: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  badge?: string;
  badgeColor?: "primary" | "success" | "warning" | "danger";
  footer?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
  bordered?: boolean;
}

export default function Card({
  title,
  description,
  image,
  imageAlt = "Card image",
  badge,
  badgeColor = "primary",
  footer,
  children,
  onClick,
  hoverable = true,
  bordered = false,
}: CardProps) {
  const badgeColors = {
    primary: "bg-primary-100 text-primary-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700",
  };

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl overflow-hidden
        ${bordered ? "border border-slate-200" : "shadow-md"}
        ${hoverable ? "hover:shadow-lg transition-shadow duration-300" : ""}
        ${onClick ? "cursor-pointer" : ""}
      `}
    >
      {/* Image */}
      {image && (
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={image}
            alt={imageAlt}
            fill
            className="object-cover"
          />
          {badge && (
            <span
              className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium ${badgeColors[badgeColor]}`}
            >
              {badge}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {!image && badge && (
          <span
            className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium mb-3 ${badgeColors[badgeColor]}`}
          >
            {badge}
          </span>
        )}

        <h3 className="text-xl font-semibold text-slate-800 mb-2">{title}</h3>

        {description && (
          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            {description}
          </p>
        )}

        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
          {footer}
        </div>
      )}
    </div>
  );
}
