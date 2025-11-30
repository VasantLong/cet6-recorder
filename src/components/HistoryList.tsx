
import React from 'react';
import { PracticeRecord, PracticeType } from '../types';

interface HistoryListProps {
  records: PracticeRecord[];
  onDelete: (id: string) => void;
}

const TypeBadge: React.FC<{ type: PracticeType }> = ({ type }) => {
  // Simple heuristic for badge color based on keywords
  let colorClass = "bg-gray-100 text-gray-700"; // default
  const t = type.toLowerCase();

  if (t === 'full exam') colorClass = "bg-indigo-600 text-white shadow-sm";
  else if (t.includes('reading')) colorClass = "bg-emerald-100 text-emerald-700 border border-emerald-200";
  else if (t.includes('listening')) colorClass = "bg-blue-100 text-blue-700 border border-blue-200";
  else if (t.includes('writing') || t.includes('trans')) colorClass = "bg-amber-100 text-amber-700 border border-amber-200";

  return (
    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${colorClass}`}>
      {type}
    </span>
  );
};

const HistoryList: React.FC<HistoryListProps> = ({ records, onDelete }) => {
  if (records.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-gray-200">
        No history available. Start your first practice!
      </div>
    );
  }

  // Sort by date desc
  const sortedRecords = [...records].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 className="font-semibold text-gray-800">History</h3>
        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{records.length} Records</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-3">Date / Type</th>
              <th className="px-6 py-3 text-indigo-700 font-bold">Total</th>
              <th className="px-6 py-3 hidden md:table-cell">Listening</th>
              <th className="px-6 py-3 hidden md:table-cell">Reading</th>
              <th className="px-6 py-3 hidden md:table-cell">Writ/Trans</th>
              <th className="px-6 py-3 hidden sm:table-cell">Duration</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedRecords.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3 text-gray-600">
                  <div className="flex flex-col items-start gap-1">
                    <span>{new Date(record.timestamp).toLocaleDateString()}</span>
                    <div className="flex gap-2 items-center flex-wrap">
                      <span className="text-xs text-gray-400">
                        {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <TypeBadge type={record.practiceType || 'Mixed'} />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3 font-bold text-gray-900">{record.totalScore.toFixed(1)}</td>
                <td className="px-6 py-3 text-gray-600 hidden md:table-cell">{record.scoreListening > 0 ? record.scoreListening.toFixed(1) : '-'}</td>
                <td className="px-6 py-3 text-gray-600 hidden md:table-cell">{record.scoreReading > 0 ? record.scoreReading.toFixed(1) : '-'}</td>
                <td className="px-6 py-3 text-gray-600 hidden md:table-cell">
                  {(record.scoreWriting + record.scoreTranslation) > 0 
                    ? (record.scoreWriting + record.scoreTranslation).toFixed(1) 
                    : '-'}
                </td>
                <td className="px-6 py-3 text-gray-500 hidden sm:table-cell">{record.durationMinutes} min</td>
                <td className="px-6 py-3 text-right">
                  <button
                    onClick={() => onDelete(record.id)}
                    className="text-red-400 hover:text-red-600 font-medium text-xs transition-colors px-2 py-1 rounded hover:bg-red-50"
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
