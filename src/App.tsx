
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Timer from './components/Timer';
import ScoreForm from './components/ScoreForm';
import HistoryList from './components/HistoryList';
import ScoreChart from './components/ScoreChart';
import { PracticeRecord } from './types';
import { getRecords, saveRecords, clearAllRecords } from './services/storageService';
import { exportToCSV } from './services/exportService';

type Tab = 'practice' | 'statistics';

const App: React.FC = () => {
  const [records, setRecords] = useState<PracticeRecord[]>([]);
  // State to hold data coming from Timer to be consumed by Form
  const [timerLog, setTimerLog] = useState<{ sectionId: string; minutes: number } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('practice');

  useEffect(() => {
    setRecords(getRecords());
  }, []);

  const addRecord = (record: PracticeRecord) => {
    const updated = [record, ...records];
    setRecords(updated);
    saveRecords(updated);
    // Reset timer log state
    setTimerLog(null);
    
    // Prompt user to view stats
    if (window.confirm("Record saved successfully! Would you like to view your statistics now?")) {
      setActiveTab('statistics');
    }
  };

  const deleteRecord = (id: string) => {
    if (window.confirm("Are you sure you want to delete this record? This action cannot be undone.")) {
      const updated = records.filter(r => r.id !== id);
      setRecords(updated);
      saveRecords(updated);
    }
  };

  const handleClearAll = () => {
    if (window.confirm("⚠️ WARNING: This will permanently delete ALL your practice history and data.\n\nAre you sure you want to continue?")) {
      clearAllRecords();
      setRecords([]); 
    }
  };

  const handleTimerLog = (sectionId: string, minutes: number) => {
    // We update this state, which flows down to ScoreForm
    setTimerLog({ sectionId, minutes });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-12">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-6 md:gap-8">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
                  CET-6 Recorder
                </span>
              </div>
              <div className="hidden sm:flex space-x-2">
                <button
                  onClick={() => setActiveTab('practice')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'practice'
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Practice Mode
                </button>
                <button
                  onClick={() => setActiveTab('statistics')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'statistics'
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Statistics & History
                </button>
              </div>
            </div>
            
            <div className="flex items-center sm:hidden">
               {/* Mobile placeholder if needed */}
            </div>
          </div>
        </div>
        
        {/* Mobile Tabs */}
        <div className="sm:hidden grid grid-cols-2 border-t border-gray-100 divide-x divide-gray-100">
           <button
              onClick={() => setActiveTab('practice')}
              className={`py-3 text-sm font-medium ${
                activeTab === 'practice' ? 'bg-indigo-50 text-indigo-700' : 'bg-white text-gray-500'
              }`}
            >
              Practice
            </button>
            <button
              onClick={() => setActiveTab('statistics')}
              className={`py-3 text-sm font-medium ${
                activeTab === 'statistics' ? 'bg-indigo-50 text-indigo-700' : 'bg-white text-gray-500'
              }`}
            >
              Statistics
            </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'practice' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in-up">
            {/* Left Column: Timer & Help */}
            <div className="lg:col-span-4 flex flex-col gap-6">
               <Timer onLogTime={handleTimerLog} />
               
               {/* Pro Tip Box */}
               <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl p-6 text-white shadow-lg hidden lg:block">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Pro Tip
                  </h4>
                  <p className="text-indigo-100 text-sm leading-relaxed mb-3">
                    Use the timer to track granular sections. Select "Reading - Careful 1", record your time, and click "Log & Reset".
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

        {activeTab === 'statistics' && (
          <div className="space-y-8 animate-fade-in-up">
             {/* Header with Data Actions */}
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Statistics Dashboard</h2>
                  <p className="text-gray-500 text-sm mt-1">Analyze performance trends and manage history.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => exportToCSV(records)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 text-sm font-medium transition-all"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export CSV
                  </button>
                  <button 
                    onClick={handleClearAll}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 text-sm font-medium transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear Data
                  </button>
                </div>
             </div>

             <Dashboard records={records} />

             <div className="grid grid-cols-1 gap-8">
               <ScoreChart records={records} />
               <HistoryList records={records} onDelete={deleteRecord} />
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
