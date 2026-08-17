/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
import { Play } from "lucide-react";

/**
 * Responsive Image Gallery
 *
 * Features:
 * - Responsive grid
 * - Lazy-loaded images
 * - Hover zoom
 * - Hover overlay
 * - Optional image titles
 * - Optional click handler
 * - No inset-* Tailwind utilities
 */
const ImageGallery = ({
  images = [],
  onImageClick = () => {},
}) => {
  if (!images || images.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-white/10 bg-slate-900/60 p-6">
        <p className="text-sm text-slate-400">
          No images available.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {images.map((image, index) => (
        <motion.div
          key={image.id || `${image.src}-${index}`}
          initial={{
            opacity: 0,
            scale: 0.96,
          }}
          whileInView={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            delay: Math.min(index * 0.08, 0.4),
            duration: 0.4,
          }}
          viewport={{
            once: true,
            amount: 0.15,
          }}
          className="
            group
            relative
            h-52
            w-full
            cursor-pointer
            overflow-hidden
            rounded-2xl
            bg-slate-900
            sm:h-56
            lg:h-60
            xl:h-64
          "
          onClick={() => onImageClick(image)}
        >
          {/* Image */}
          <img
            src={image.src}
            alt={
              image.alt ||
              image.title ||
              `Gallery image ${index + 1}`
            }
            loading={index < 4 ? "eager" : "lazy"}
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
              ease-out
              group-hover:scale-110
            "
          />

          {/* Dark gradient overlay */}
          <div
            className="
              pointer-events-none
              absolute
              top-0
              right-0
              bottom-0
              left-0
              bg-gradient-to-t
              from-slate-950
              via-slate-950/20
              to-transparent
              opacity-0
              transition-opacity
              duration-300
              group-hover:opacity-100
            "
          />

          {/* Hover content */}
          {image.title && (
            <div
              className="
                pointer-events-none
                absolute
                top-0
                right-0
                bottom-0
                left-0
                flex
                flex-col
                items-center
                justify-center
                px-4
                text-center
                opacity-0
                transition-opacity
                duration-300
                group-hover:opacity-100
              "
            >
              <div
                className="
                  mb-3
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/20
                  bg-emerald-500/80
                  shadow-lg
                  backdrop-blur-sm
                "
              >
                <Play
                  className="ml-0.5 h-5 w-5 fill-white text-white"
                />
              </div>

              <h3 className="text-sm font-bold leading-tight text-white sm:text-base">
                {image.title}
              </h3>

              {image.description && (
                <p className="mt-1 line-clamp-2 text-xs text-slate-200">
                  {image.description}
                </p>
              )}
            </div>
          )}

          {/* Image number */}
          {image.badge && (
            <div
              className="
                absolute
                top-3
                left-3
                rounded-full
                border
                border-white/10
                bg-slate-950/60
                px-2.5
                py-1
                text-[10px]
                font-semibold
                text-white
                backdrop-blur-md
              "
            >
              {image.badge}
            </div>
          )}

          {/* Border */}
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
              transition-colors
              duration-300
              group-hover:border-emerald-500/40
            "
          />
        </motion.div>
      ))}
    </div>
  );
};

export default ImageGallery;
