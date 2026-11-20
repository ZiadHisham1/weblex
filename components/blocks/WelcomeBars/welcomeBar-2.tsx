"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function WelcomeBar2({
  bgColor,
  text_color,
  texts,
}: {
  bgColor?: string;
  text_color?: string;
  texts: string[];
}) {
  const [index, setIndex] = useState(0);

  // Filter out any undefined, null, or empty values to prevent crashes
  const validTexts = texts.filter((t) => typeof t === "string" && t.trim() !== "");

  useEffect(() => {
    if (validTexts.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % validTexts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [validTexts.length]);

  if (validTexts.length === 0) return null;

  // Ensure the index doesn't go out of bounds if texts are removed
  const safeIndex = index >= validTexts.length ? 0 : index;

  return (
    <div
      style={{ backgroundColor: bgColor || "#f3f4f6", color: text_color || "#000000" }}
      className="flex items-center justify-center px-4 py-2 h-12 overflow-hidden relative"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={safeIndex}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute w-full text-center"
        >
          {validTexts[safeIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}