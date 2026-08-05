"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

// ============================================================================
// Apple Motion Design System Physics Presets
// ============================================================================

export const appleSpring = {
  type: "spring" as const,
  stiffness: 380,
  damping: 30,
  mass: 0.8,
};

export const appleEaseOut = {
  duration: 0.24,
  ease: [0.16, 1, 0.3, 1] as const, // Apple HIG fluid cubic bezier
};

// Staggered Container
export const MotionStaggerContainer: React.FC<HTMLMotionProps<"div">> = ({
  children,
  className = "",
  ...props
}) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.05,
          delayChildren: 0.02,
        },
      },
    }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

// Staggered Item
export const MotionItem: React.FC<HTMLMotionProps<"div">> = ({
  children,
  className = "",
  ...props
}) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 8 },
      visible: {
        opacity: 1,
        y: 0,
        transition: appleSpring,
      },
    }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

// Micro-Interactive Button / Card Wrapper
export const MotionPress: React.FC<HTMLMotionProps<"div">> = ({
  children,
  className = "",
  ...props
}) => (
  <motion.div
    whileHover={{ y: -1.5, scale: 1.01 }}
    whileTap={{ scale: 0.985 }}
    transition={appleSpring}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);
