"use client";
import { useState } from "react";

export default function ToggleButton() {
  const [isToggled, setIsToggled] = useState(false);
  const handleToggle = () => {
    setIsToggled((prev) => {
      const next = !prev;
      return next;
    });
  };

  return (
    <div>
      {/* Custom Toggle Switch */}
      <button
        onClick={handleToggle}
        className={`w-9 h-5 rounded-full relative flex items-center px-0.5 cursor-pointer mt-0.5 ${isToggled ? "bg-black" : "bg-gray-200"}`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ease-in-out duration-100 ${isToggled ? "translate-x-4" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}
