import React, { useState, useEffect } from "react";
import { ImageOff, User } from "lucide-react";

export type ImageVariant =
  | "profile"
  | "thumbnail"
  | "banner"
  | "gallery"
  | "logo"
  | "event"
  | "blog";

export interface OptimizedImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
  alt?: string;
  variant?: ImageVariant;
  fallbackText?: string;
  fallbackIcon?: React.ReactNode;
  containerClassName?: string;
  className?: string;
  priority?: boolean;
  objectPosition?: string;
  transformWidth?: number;
  fullResolution?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt = "Image",
  variant = "thumbnail",
  fallbackText,
  fallbackIcon,
  containerClassName = "",
  className = "",
  priority = false,
  objectPosition = "center",
  transformWidth,
  fullResolution = false,
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const imageSrc = src || "";

  // Reset states when src changes
  useEffect(() => {
    setLoaded(false);
    setError(!src);
  }, [src]);

  const initials = fallbackText
    ? fallbackText
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : null;

  // Base styling per variant
  let defaultContainerStyle = "relative overflow-hidden bg-slate-100";
  let defaultImgStyle = "w-full h-full block transition-all duration-300";

  switch (variant) {
    case "profile":
      defaultContainerStyle =
        "w-24 h-24 aspect-square rounded-full overflow-hidden shrink-0 relative bg-gradient-to-br from-primary/10 to-teal-500/10 flex items-center justify-center border-2 border-slate-100 shadow-sm";
      defaultImgStyle = `w-full h-full object-cover block object-top`;
      break;
    case "logo":
      defaultContainerStyle =
        "relative flex items-center justify-center bg-transparent shrink-0 overflow-hidden";
      defaultImgStyle = "w-full h-full object-contain block";
      break;
    case "banner":
      defaultContainerStyle =
        "relative overflow-hidden bg-slate-900/10 w-full";
      defaultImgStyle = `w-full h-full object-cover block object-${objectPosition}`;
      break;
    case "gallery":
      defaultContainerStyle =
        "relative overflow-hidden bg-slate-100 w-full h-full";
      defaultImgStyle = `w-full h-full object-cover block object-${objectPosition}`;
      break;
    case "event":
    case "blog":
    case "thumbnail":
    default:
      defaultContainerStyle =
        "relative overflow-hidden bg-slate-100";
      defaultImgStyle = `w-full h-full object-cover block object-${objectPosition}`;
      break;
  }

  // If there's an error or no src
  if (error || !imageSrc) {
    if (variant === "profile") {
      return (
        <div
          className={`${defaultContainerStyle} ${containerClassName}`}
          title={alt}
        >
          {initials ? (
            <span className="font-bold text-primary text-base select-none">
              {initials}
            </span>
          ) : fallbackIcon ? (
            fallbackIcon
          ) : (
            <User className="w-1/2 h-1/2 text-primary/60" />
          )}
        </div>
      );
    }

    if (variant === "logo") {
      return (
        <div className={`${defaultContainerStyle} ${containerClassName}`}>
          <span className="text-xs font-bold text-slate-700">{alt}</span>
        </div>
      );
    }

    return (
      <div
        className={`${defaultContainerStyle} flex flex-col items-center justify-center text-slate-400 p-4 ${containerClassName}`}
      >
        {fallbackIcon || <ImageOff className="w-8 h-8 stroke-1 mb-1" />}
        <span className="text-[11px] text-slate-400 text-center line-clamp-1">
          {alt || "No image"}
        </span>
      </div>
    );
  }

  return (
    <div className={`${defaultContainerStyle} ${containerClassName}`}>
      {/* Loading Skeleton */}
      {!loaded && (
        <div className="absolute inset-0 bg-slate-200/70 animate-pulse z-0" />
      )}

      <img
        src={imageSrc}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`${defaultImgStyle} ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-98"} ${className}`}
        style={{
          imageRendering: "auto",
        }}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;
