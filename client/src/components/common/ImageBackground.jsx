/* eslint-disable react/prop-types */
import { motion } from "framer-motion";

/**
 * Image Background Wrapper
 *
 * Features:
 * - Responsive background image
 * - Gradient overlay
 * - Optional blur
 * - Optional brightness
 * - Optional parallax-style background
 * - Optional entrance animation
 * - No inset-* Tailwind utilities
 */
const ImageBackground = ({
  children,
  backgroundImage,
  overlay = 0.5,
  className = "",
  parallax = false,
  blur = false,
  brightness = 1,
  animation = true,
}) => {
  const containerClasses = `
    relative
    overflow-hidden
    ${className}
  `;

  const imageClasses = `
    absolute
    top-0
    right-0
    bottom-0
    left-0
    h-full
    w-full
    object-cover
    ${blur ? "blur-sm scale-105" : ""}
    ${parallax ? "scale-110" : ""}
  `;

  const MotionDiv = animation ? motion.div : "div";

  const animationProps = animation
    ? {
        initial: {
          opacity: 0,
        },
        whileInView: {
          opacity: 1,
        },
        transition: {
          duration: 0.6,
        },
        viewport: {
          once: true,
        },
      }
    : {};

  return (
    <MotionDiv
      className={containerClasses}
      {...animationProps}
    >
      {/* ================================================
          BACKGROUND IMAGE
      ================================================= */}

      <div
        className={imageClasses}
        aria-hidden="true"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: `brightness(${brightness})`,
          ...(parallax
            ? {
                backgroundAttachment: "fixed",
              }
            : {}),
        }}
      />

      {/* ================================================
          DARK GRADIENT OVERLAY
      ================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          top-0
          right-0
          bottom-0
          left-0
          z-10
        "
        aria-hidden="true"
        style={{
          background: `linear-gradient(
            135deg,
            rgba(15, 23, 42, ${overlay}) 0%,
            rgba(6, 12, 20, ${overlay}) 100%
          )`,
        }}
      />

      {/* ================================================
          CONTENT
      ================================================= */}

      <div className="relative z-20">
        {children}
      </div>

      {/* ================================================
          DECORATIVE BORDER
      ================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          top-0
          right-0
          bottom-0
          left-0
          z-30
          rounded-xl
          border
          border-white/10
        "
        aria-hidden="true"
      />
    </MotionDiv>
  );
};

export default ImageBackground;
