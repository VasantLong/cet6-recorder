
import React, { useState } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PracticeRecord, SECTION_IDS, SCORING_WEIGHTS } from '../types';

interface ScoreChartProps {
  records: PracticeRecord[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg text-xs">
        <p className="font-bold text-gray-800 mb-1">{data.displayDate}</p>
        <div className="space-y-1">
          <p className="text-indigo-600 font-semibold">
            Score: {data.score}
          </p>
          {data.duration !== undefined && data.duration !== null ? (
             <p className="text-gray-500">
               Duration: {data.duration} min
             </p>
          ) : (
            <p className="text-gray-300 italic">No time data</p>
          )}
          <p className="text-gray-400 italic">
            {data.type}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const ScoreChart: React.FC<ScoreChartProps> = ({ records }) => {
  const [metric, setMetric] = useState<string>('total');

  // Process data
  const data = [...records]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 20)
    .reverse()
    .map(r => {
      let score = 0;
      let duration: number | null = 0;

      // Helper to calculate weighted section score
      const calcL = (part: number, weight: number) => part * weight;
      const calcR = (part: number, weight: number) => part * weight;
      
      const inputsL = r.inputs.listening;
      const inputsR = r.inputs.reading;
      const inputsO = r.inputs.others;
      const dur = r.inputs.durations || {};

      switch(metric) {
        case 'total': 
          score = r.totalScore; 
          duration = r.durationMinutes; 
          break;
        case 'listening': 
          score = r.scoreListening; 
          duration = null; // No total listening time tracked specifically in granular mode usually, or sum it? Prompt says no listening timing.
          break;
        case 'l_long':
          score = (inputsL.longConversation1 + inputsL.longConversation2) * SCORING_WEIGHTS.listening.longConversation;
          duration = null;
          break;
        case 'l_pass':
          score = (inputsL.passage1 + inputsL.passage2) * SCORING_WEIGHTS.listening.passage;
          duration = null;
          break;
        case 'l_lect':
          score = (inputsL.lectures1 + inputsL.lectures2 + inputsL.lectures3) * SCORING_WEIGHTS.listening.lectures;
          duration = null;
          break;

        case 'reading': 
          score = r.scoreReading; 
          duration = [SECTION_IDS.R_BC, SECTION_IDS.R_MAT, SECTION_IDS.R_CR1, SECTION_IDS.R_CR2].reduce((sum, id) => sum + (dur[id]||0), 0);
          break;
        case 'r_bc':
          score = inputsR.bankedCloze * SCORING_WEIGHTS.reading.bankedCloze;
          duration = dur[SECTION_IDS.R_BC] || 0;
          break;
        case 'r_mat':
          score = inputsR.matching * SCORING_WEIGHTS.reading.matching;
          duration = dur[SECTION_IDS.R_MAT] || 0;
          break;
        case 'r_cr':
          score = (inputsR.carefulReading1 + inputsR.carefulReading2) * SCORING_WEIGHTS.reading.carefulReading;
          duration = (dur[SECTION_IDS.R_CR1] || 0) + (dur[SECTION_IDS.R_CR2] || 0);
          break;

        case 'writing': 
          score = r.scoreWriting; 
          duration = dur[SECTION_IDS.W_WRIT] || 0;
          break;
        case 'translation': 
          score = r.scoreTranslation; 
          duration = dur[SECTION_IDS.T_TRANS] || 0;
          break;
        default: 
          score = r.totalScore;
      }

      return {
        // Use timestamp as unique key for Recharts XAxis to ensure tooltip finds correct data
        timestamp: r.timestamp, 
        displayDate: new Date(r.timestamp).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
        fullDate: new Date(r.timestamp).toLocaleString(),
        type: r.practiceType,
        score: Number(score.toFixed(1)),
        duration: duration,
        rawRecord: r
      };
    })
    // Filter logic: Show if Total, OR if Score > 0 for that metric
    .filter(item => {
      if (metric === 'total') return true;
      return item.score > 0;
    });

  const getMetricLabel = (m: string) => {
    const map: Record<string, string> = {
      total: 'Total Score',
      listening: 'Listening (All)',
      l_long: 'Listening - Long Conv',
      l_pass: 'Listening - Passages',
      l_lect: 'Listening - Lectures',
      reading: 'Reading (All)',
      r_bc: 'Reading - Banked Cloze',
      r_mat: 'Reading - Matching',
      r_cr: 'Reading - Careful',
      writing: 'Writing',
      translation: 'Translation'
    };
    return map[m] || m;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col h-[400px]">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h3 className="font-semibold text-gray-800">Performance Trend</h3>
        <div className="flex items-center gap-2">
           <label className="text-xs text-gray-500 font-medium">Metric:</label>
           <select 
             value={metric} 
             onChange={(e) => setMetric(e.target.value)}
             className="text-sm border border-gray-200 rounded-md px-2 py-1 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
           >
             <option value="total">Total Score</option>
             <hr />
             <option value="listening">Listening (Agg)</option>
             <option value="l_long">Listening - Long Conv</option>
             <option value="l_pass">Listening - Passages</option>
             <option value="l_lect">Listening - Lectures</option>
             <hr />
             <option value="reading">Reading (Agg)</option>
             <option value="r_bc">Reading - Banked Cloze</option>
             <option value="r_mat">Reading - Matching</option>
             <option value="r_cr">Reading - Careful</option>
             <hr />
             <option value="writing">Writing</option>
             <option value="translation">Translation</option>
           </select>
        </div>
      </div>
      
      {data.length < 2 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center border-t border-gray-50 mt-2">
          <div className="text-gray-200 mb-2 text-4xl">📊</div>
          <div className="text-gray-400 font-medium">Not Enough Data</div>
          <p className="text-xs text-gray-300 mt-1 max-w-xs">
            Record more sessions involving <span className="font-bold text-gray-400">{getMetricLabel(metric)}</span> to see the trend.
          </p>
        </div>
      ) : (
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis 
                dataKey="timestamp" 
                stroke="#9ca3af" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                dy={10} 
                tickFormatter={(val) => {
                  const item = data.find(d => d.timestamp === val);
                  return item ? item.displayDate : '';
                }}
              />
              
              <YAxis yAxisId="left" stroke="#6366f1" fontSize={12} tickLine={false} axisLine={false} label={{ value: 'Score', angle: -90, position: 'insideLeft', fill: '#6366f1' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} label={{ value: 'Time (min)', angle: 90, position: 'insideRight', fill: '#94a3b8' }} />

              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />

              {/* Only show bar if duration is valid (not null/undefined) */}
              <Bar yAxisId="right" dataKey="duration" fill="#e2e8f0" barSize={20} radius={[4, 4, 0, 0]} name="Time (min)" />
              
              <Line yAxisId="left" type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} name={`${getMetricLabel(metric)}`} />
              
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ScoreChart;
