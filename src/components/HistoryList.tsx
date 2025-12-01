import React from "react";
import type { PracticeRecord, PracticeType } from "../types";

interface HistoryListProps {
  records: PracticeRecord[];
  onDelete: (id: string) => void;
}

const TypeBadge: React.FC<{ type: PracticeType }> = ({ type }) => {
  // Simple heuristic for badge color based on keywords
  let colorClass =
    "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"; // default
  const t = type.toLowerCase();

  if (t === "full exam")
    colorClass = "bg-indigo-600 text-white shadow-sm dark:bg-indigo-500";
  else if (t.includes("reading"))
    colorClass =
      "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
  else if (t.includes("listening"))
    colorClass =
      "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
  else if (t.includes("writing") || t.includes("trans"))
    colorClass =
      "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";

  return (
    <span
      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${colorClass}`}
    >
      {type}
    </span>
  );
};

const HistoryList: React.FC<HistoryListProps> = ({ records, onDelete }) => {
  if (records.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors">
        No history available. Start your first practice!
      </div>
    );
  }

  // Sort by date desc
  const sortedRecords = [...records].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">
          History
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
          {records.length} Records
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3">Date / Type</th>
              <th className="px-6 py-3 text-indigo-700 dark:text-indigo-400 font-bold">
                Total
              </th>
              <th className="px-6 py-3 hidden md:table-cell">Listening</th>
              <th className="px-6 py-3 hidden md:table-cell">Reading</th>
              <th className="px-6 py-3 hidden md:table-cell">Writ/Trans</th>
              <th className="px-6 py-3 hidden sm:table-cell">Duration</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {sortedRecords.map((record) => (
              <tr
                key={record.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-6 py-3 text-gray-600 dark:text-gray-300">
                  <div className="flex flex-col items-start gap-1">
                    <span>
                      {new Date(record.timestamp).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2 items-center flex-wrap">
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(record.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <TypeBadge type={record.practiceType || "Mixed"} />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3 font-bold text-gray-900 dark:text-white">
                  {record.totalScore.toFixed(1)}
                </td>
                <td className="px-6 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell">
                  {record.scoreListening > 0
                    ? record.scoreListening.toFixed(1)
                    : "-"}
                </td>
                <td className="px-6 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell">
                  {record.scoreReading > 0
                    ? record.scoreReading.toFixed(1)
                    : "-"}
                </td>
                <td className="px-6 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell">
                  {record.scoreWriting + record.scoreTranslation > 0
                    ? (record.scoreWriting + record.scoreTranslation).toFixed(1)
                    : "-"}
                </td>
                <td className="px-6 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                  {record.durationMinutes} min
                </td>
                <td className="px-6 py-3 text-right">
                  <button
                    onClick={() => onDelete(record.id)}
                    className="text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium text-xs transition-colors px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryList;
