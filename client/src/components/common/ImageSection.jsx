/* eslint-disable react/prop-types */
import { motion } from "framer-motion";

/**
 * Reusable Image Section Component
 *
 * Features:
 * - Responsive image sizing
 * - Optional title and description
 * - Gradient overlay
 * - Hover zoom effect
 * - Optional badges
 * - Optional click handler
 */
const ImageSection = ({
  image,
  title,
  description,
  overlay = 0.4,
  className = "",
  onClick,
  badges = [],
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.25 }}
      className={`
        group
        relative
        w-full
        min-h-[220px]
        overflow-hidden
        rounded-2xl
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Image */}
      <img
        src={image}
        alt={title || "Section image"}
        loading="lazy"
        decoding="async"
        className="
          absolute
          top-0
          right-0
          bottom-0
          left-0
          h-full
          w-full
          object-cover
          transition-transform
          duration-500
          group-hover:scale-110
        "
      />

      {/* Overlay */}
      <div
        className="
          absolute
          top-0
          right-0
          bottom-0
          left-0
          transition-opacity
          duration-300
          group-hover:opacity-75
        "
        aria-hidden="true"
        style={{
          background: `linear-gradient(
            180deg,
            rgba(0, 0, 0, ${overlay}) 0%,
            rgba(0, 0, 0, ${Math.min(overlay * 1.5, 1)}) 100%
          )`,
        }}
      />

      {/* Content */}
      <div
        className="
          absolute
          top-0
          right-0
          bottom-0
          left-0
          flex
          flex-col
          justify-end
          p-4
          text-white
          sm:p-5
          md:p-6
        "
      >
        <div className="space-y-2">
          {/* Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {badges.map((badge, index) => (
                <span
                  key={`${badge}-${index}`}
                  className="
                    inline-flex
                    items-center
                    rounded-full
                    border
                    border-emerald-500/30
                    bg-emerald-500/20
                    px-2.5
                    py-1
                    text-[10px]
                    font-semibold
                    text-emerald-300
                    sm:text-xs
                  "
                >
                  {badge}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          {title && (
            <h3 className="text-lg font-bold leading-tight sm:text-xl md:text-2xl">
              {title}
            </h3>
          )}

          {/* Description */}
          {description && (
            <p className="line-clamp-2 text-xs leading-relaxed text-slate-200 sm:text-sm">
              {description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ImageSection;
