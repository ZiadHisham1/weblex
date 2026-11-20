"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

type MenuProps = {
  editable: boolean;
  removable: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function HoverMenu({
  editable,
  removable,
  onEdit,
  onDelete,
}: MenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- hover intent ---------------------------------------------------------
  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  };
  const handleEnter = () => {
    cancelClose();
    setOpen(true);
  };

  // --- close on outside click / escape -------------------------------------
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => () => cancelClose(), []);

  return (
    <div
      ref={wrapperRef}
      className="relative inline-block"
      onMouseEnter={handleEnter}
      onMouseLeave={scheduleClose}
    >
      {/* ---------- animated menu ---------- */}
      <div
        role="menu"
        aria-hidden={!open}
        className={[
          // position (unchanged from your version)
          "absolute right-8 top-[-5px] z-50",
          // base look (unchanged)
          "flex gap-1 rounded-full py-2 px-2 border border-gray-200 bg-white shadow-lg",
          // animation: anchored to bottom-left (where the trigger sits)
          "origin-bottom-left transition-all duration-200 ease-out",
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-90 -translate-y-1 pointer-events-none",
        ].join(" ")}
      >
        {editable && (
          <button
            type="button"
            role="menuitem"
            aria-label="Edit"
            onClick={() => {
              onEdit?.();
              setOpen(false);
            }}
            style={{ transitionDelay: open ? "40ms" : "0ms" }}
            className={[
              "px-2 rounded transition-all duration-200",
              "hover:bg-gray-100 active:scale-90",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300",
              // stagger: pop in slightly after the container
              open
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-1",
            ].join(" ")}
          >
            <Pencil className="w-4 h-4 text-gray-600 transition-transform duration-200 group-hover:scale-110" />
          </button>
        )}

        {removable && (
          <button
            type="button"
            role="menuitem"
            aria-label="Delete"
            onClick={() => {
              onDelete?.();
              setOpen(false);
            }}
            style={{ transitionDelay: open ? "100ms" : "0ms" }}
            className={[
              "px-2 rounded transition-all duration-200",
              "hover:bg-red-50 active:scale-90",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200",
              open
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-1",
            ].join(" ")}
          >
            <Trash2 className="w-4 h-4 text-red-500 transition-transform duration-200 hover:scale-110" />
          </button>
        )}
      </div>

      {/* ---------- trigger ---------- */}
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={[
          "text-gray-400 p-1 rounded-md border border-gray-300",
          "transition-all duration-200 ease-out",
          "hover:text-black hover:border-gray-400 hover:shadow-sm",
          "active:scale-95",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300",
          open && "text-black border-gray-400 shadow-sm",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <MoreHorizontal
          className={[
            "w-4 h-4 transition-transform duration-300 ease-out",
            open ? "rotate-90 scale-110" : "rotate-0 scale-100",
          ].join(" ")}
        />
      </button>
    </div>
  );
}