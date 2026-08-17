/* eslint-disable react/prop-types */
import { motion } from "framer-motion";

/**
 * Reusable Hero Component with Background Image
 *
 * Supports:
 * - Vite imported image assets
 * - Responsive heights
 * - Background positioning
 * - Configurable overlay
 * - Responsive content positioning
 * - Optional children
 */
const ImageHero = ({
  backgroundImage,
  title,
  subtitle,
  children,
  overlay = 0.5,
  className = "",
  contentPosition = "center",
  imagePosition = "center",
  height = "h-80",
}) => {
  const positionMap = {
    center: "items-center justify-center",
    left: "items-center justify-start",
    right: "items-center justify-end",
    "top-center": "items-start justify-center",
    "bottom-center": "items-end justify-center",
  };

  const imagePositionMap = {
    center: "center",
    top: "top",
    bottom: "bottom",
    left: "left",
    right: "right",
  };

  const resolvedContentPosition =
    positionMap[contentPosition] || positionMap.center;

  const resolvedImagePosition =
    imagePositionMap[imagePosition] || imagePositionMap.center;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`
        relative
        w-full
        overflow-hidden
        rounded-2xl
        ${height}
        ${className}
      `}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: resolvedImagePosition,
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay */}
      <div
        className="absolute top-0 right-0 bottom-0 left-0"
        aria-hidden="true"
        style={{
          background: `linear-gradient(
            135deg,
            rgba(15, 23, 42, ${overlay}) 0%,
            rgba(6, 12, 20, ${overlay}) 100%
          )`,
        }}
      />

      {/* Content */}
      <div
        className={`
          relative
          z-10
          flex
          h-full
          w-full
          ${resolvedContentPosition}
          px-4
          py-6
          text-center
          sm:px-8
          sm:py-10
        `}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.2,
            duration: 0.5,
          }}
          className="w-full max-w-2xl"
        >
          {title && (
            <h2 className="mb-3 text-2xl font-black leading-tight text-white sm:text-3xl md:text-4xl">
              {title}
            </h2>
          )}

          {subtitle && (
            <p className="mb-4 text-sm leading-relaxed text-slate-200 sm:text-base">
              {subtitle}
            </p>
          )}

          {children}
        </motion.div>
      </div>

      {/* Decorative Border */}
      <div
        className="
          pointer-events-none
          absolute
          top-0
          right-0
          bottom-0
          left-0
          rounded-2xl
          border
          border-white/10
        "
        aria-hidden="true"
      />
    </motion.div>
  );
};

export default ImageHero;
