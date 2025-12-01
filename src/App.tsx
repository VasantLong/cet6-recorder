import React, { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import Timer from "./components/Timer";
import ScoreForm from "./components/ScoreForm";
import HistoryList from "./components/HistoryList";
import ScoreChart from "./components/ScoreChart";
import type { PracticeRecord } from "./types";
import {
  getRecords,
  saveRecords,
  clearAllRecords,
} from "./services/storageService";
import { exportToCSV } from "./services/exportService";
import Modal from "./components/Modal";
import SlideOver from "./components/SlideOver";

type Tab = "practice" | "statistics";
type Theme = "light" | "dark";

const App: React.FC = () => {
  const [records, setRecords] = useState<PracticeRecord[]>([]);
  // State to hold data coming from Timer to be consumed by Form
  const [timerLog, setTimerLog] = useState<{
    sectionId: string;
    minutes: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("practice");

  // Theme State
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = window.localStorage.getItem("theme");
      if (stored === "dark" || stored === "light") return stored;
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  });

  // Modal States
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    setRecords(getRecords());
  }, []);

  // Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const addRecord = (record: PracticeRecord) => {
    const updated = [record, ...records];
    setRecords(updated);
    saveRecords(updated);
    // Reset timer log state
    setTimerLog(null);
    setSuccessModalOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      const updated = records.filter((r) => r.id !== deleteId);
      setRecords(updated);
      saveRecords(updated);
      setDeleteId(null);
    }
  };

  const confirmClearAll = () => {
    clearAllRecords();
    setRecords([]);
    setShowClearConfirm(false);
  };

  const handleTimerLog = (sectionId: string, minutes: number) => {
    // We update this state, which flows down to ScoreForm
    setTimerLog({ sectionId, minutes });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans pb-12 transition-colors duration-300">
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-6 md:gap-8">
              <button
                onClick={() => setAboutOpen(true)}
                className="flex-shrink-0 flex items-center group focus:outline-none"
                title="Click for App Info"
              >
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-300 group-hover:opacity-80 transition-opacity">
                  CET-6 Recorder
                </span>
                <span className="ml-2 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 text-[10px] px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 transition-colors">
                  Info
                </span>
              </button>
              <div className="hidden sm:flex space-x-2">
                <button
                  onClick={() => setActiveTab("practice")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === "practice"
                      ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-100 dark:ring-indigo-800"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  Practice Mode
                </button>
                <button
                  onClick={() => setActiveTab("statistics")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === "statistics"
                      ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-100 dark:ring-indigo-800"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  Statistics & History
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {theme === "light" ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-amber-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="sm:hidden grid grid-cols-2 border-t border-gray-100 dark:border-gray-700 divide-x divide-gray-100 dark:divide-gray-700">
          <button
            onClick={() => setActiveTab("practice")}
            className={`py-3 text-sm font-medium ${
              activeTab === "practice"
                ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400"
            }`}
          >
            Practice
          </button>
          <button
            onClick={() => setActiveTab("statistics")}
            className={`py-3 text-sm font-medium ${
              activeTab === "statistics"
                ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400"
            }`}
          >
            Statistics
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
        {activeTab === "practice" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in-up">
            {/* Left Column: Timer & Help */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <Timer onLogTime={handleTimerLog} />

              {/* Pro Tip Box */}
              <div className="bg-gradient-to-br from-indigo-600 to-blue-600 dark:from-indigo-900 dark:to-blue-900 rounded-xl p-6 text-white shadow-lg hidden lg:block border border-indigo-500/20">
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Pro Tip
                </h4>
                <p className="text-indigo-100 text-sm leading-relaxed mb-3">
                  Use the timer to track granular sections. Select "Reading -
                  Careful 1", record your time, and click "Log & Reset".
                </p>
                <p className="text-xs text-indigo-200 opacity-90 border-t border-indigo-500/30 pt-3 mt-1">
                  The time automatically syncs with the Score Form on the right.
                </p>
              </div>
            </div>

            {/* Right Column: Entry Form */}
            <div className="lg:col-span-8">
              <ScoreForm onSave={addRecord} incomingTimeLog={timerLog} />
            </div>
          </div>
        )}

        {activeTab === "statistics" && (
          <div className="space-y-8 animate-fade-in-up">
            {/* Header with Data Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Statistics Dashboard
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Analyze performance trends and manage history.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => exportToCSV(records)}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-sm font-medium transition-all"
                >
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Export CSV
                </button>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-800 text-sm font-medium transition-all"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Clear Data
                </button>
              </div>
            </div>

            <Dashboard records={records} />

            <div className="grid grid-cols-1 gap-8">
              <ScoreChart records={records} />
              <HistoryList records={records} onDelete={setDeleteId} />
            </div>
          </div>
        )}
      </main>

      {/* Global Modals */}

      {/* Success Modal */}
      <Modal
        isOpen={successModalOpen}
        title="Session Recorded!"
        onClose={() => setSuccessModalOpen(false)}
        type="success"
        actions={[
          {
            label: "Keep Practicing",
            onClick: () => setSuccessModalOpen(false),
            variant: "secondary",
          },
          {
            label: "View Statistics",
            onClick: () => {
              setSuccessModalOpen(false);
              setActiveTab("statistics");
            },
            variant: "primary",
          },
        ]}
      >
        Your practice session has been successfully saved to your history.
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteId}
        title="Delete Record"
        onClose={() => setDeleteId(null)}
        type="danger"
        actions={[
          {
            label: "Cancel",
            onClick: () => setDeleteId(null),
            variant: "secondary",
          },
          { label: "Delete", onClick: confirmDelete, variant: "danger" },
        ]}
      >
        Are you sure you want to delete this practice record? This action cannot
        be undone.
      </Modal>

      {/* Clear All Confirmation */}
      <Modal
        isOpen={showClearConfirm}
        title="Clear All Data"
        onClose={() => setShowClearConfirm(false)}
        type="danger"
        actions={[
          {
            label: "Cancel",
            onClick: () => setShowClearConfirm(false),
            variant: "secondary",
          },
          {
            label: "Clear Everything",
            onClick: confirmClearAll,
            variant: "danger",
          },
        ]}
      >
        ⚠️ WARNING: This will permanently delete ALL your practice history and
        data. Are you absolutely sure you want to continue?
      </Modal>

      {/* About SlideOver */}
      <SlideOver
        isOpen={aboutOpen}
        onClose={() => setAboutOpen(false)}
        title="About CET-6 Recorder"
      >
        <div className="space-y-6">
          <section>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              This application is a comprehensive tracking dashboard designed to
              help students prepare for the
              <strong className="text-gray-900 dark:text-white">
                {" "}
                College English Test Band 6 (CET-6)
              </strong>
              . It provides strict scoring algorithms based on official
              standards, granular timing tools, and detailed progress
              visualization.
            </p>
          </section>

          <section>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-3">
              Key Features
            </h3>
            <ul className="space-y-2">
              {[
                "Official scoring weights (7.1/14.2 per question)",
                "Granular timer for specific reading/writing sections",
                "Normalized performance stats for split sections",
                "Historical trend charts and data export (CSV)",
                "Local storage privacy (data stays on your device)",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <svg
                    className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-3">
              Author & Source
            </h3>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-300">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Open Source Project
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Contribute or view code on GitHub
                  </p>
                </div>
              </div>
              <a
                href="https://github.com/VasantLong/cet6-recorder"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-2 px-4 bg-gray-900 dark:bg-black hover:bg-gray-800 dark:hover:bg-gray-900 text-white text-sm font-medium rounded-md transition-colors"
              >
                Visit Author on GitHub
              </a>
            </div>
          </section>
        </div>
      </SlideOver>
    </div>
  );
};

export default App;
