import React, { useState, useEffect, useRef } from "react";
import { SECTION_IDS } from "../types";

interface TimerProps {
  onLogTime: (sectionId: string, minutes: number) => void;
}

const SECTION_OPTIONS = [
  { label: "Select Target Section...", value: "" },
  // Listening removed as per requirements
  { label: "Reading - Banked Cloze", value: SECTION_IDS.R_BC },
  { label: "Reading - Matching", value: SECTION_IDS.R_MAT },
  { label: "Reading - Careful 1", value: SECTION_IDS.R_CR1 },
  { label: "Reading - Careful 2", value: SECTION_IDS.R_CR2 },
  { label: "Writing", value: SECTION_IDS.W_WRIT },
  { label: "Translation", value: SECTION_IDS.T_TRANS },
];

const Timer: React.FC<TimerProps> = ({ onLogTime }) => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [targetSection, setTargetSection] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (!isActive && intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [isActive]);

  const toggle = () => {
    if (!targetSection && !isActive) {
      setErrorMsg("Please select a target section first!");
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }
    setErrorMsg("");
    setIsActive(!isActive);
  };

  const reset = () => {
    setIsActive(false);
    setSeconds(0);
    setErrorMsg("");
  };

  const logAndReset = () => {
    if (seconds === 0 || !targetSection) return;
    const minutes = Math.ceil(seconds / 60);
    onLogTime(targetSection, minutes);
    setSeconds(0);
    setIsActive(false);
    setErrorMsg("");
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
      {/* Target Selector */}
      <div className="mb-6">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 block">
          Target Section
        </label>
        <select
          value={targetSection}
          onChange={(e) => {
            setTargetSection(e.target.value);
            setErrorMsg("");
          }}
          className={`w-full text-sm border rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
            errorMsg ? "border-red-300 ring-1 ring-red-200" : "border-gray-200"
          }`}
        >
          {SECTION_OPTIONS.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              disabled={opt.value === ""}
            >
              {opt.label}
            </option>
          ))}
        </select>
        {errorMsg && (
          <p className="text-xs text-red-500 mt-1 font-medium animate-pulse">
            {errorMsg}
          </p>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center min-h-[160px]">
        <div className="text-6xl font-mono font-bold text-gray-800 mb-8 tabular-nums relative">
          {formatTime(seconds)}
          {isActive && (
            <span className="absolute -right-6 top-0 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          )}
        </div>

        <div className="flex gap-2 w-full justify-center">
          <button
            onClick={toggle}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
              isActive
                ? "bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200"
                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
            }`}
          >
            {isActive ? "Pause" : "Start"}
          </button>

          <button
            onClick={logAndReset}
            disabled={seconds === 0 || !targetSection}
            className="flex-1 py-3 px-4 rounded-lg font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Log & Reset
          </button>
        </div>

        <button
          onClick={reset}
          className="mt-4 text-xs text-gray-400 hover:text-red-500 underline decoration-dotted"
        >
          Discard Timer
        </button>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400 text-center">
        Select a section above to track time. <br />
        Listening sections do not require timing.
      </div>
    </div>
  );
};

export default Timer;
