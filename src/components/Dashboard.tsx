
import React, { useMemo } from 'react';
import { PracticeRecord, SCORING_WEIGHTS, SECTION_IDS, MAX_COUNTS } from '../types';

interface DashboardProps {
  records: PracticeRecord[];
}

const StatCard: React.FC<{ title: string; value: string | number; subtext?: string; color?: string }> = ({ title, value, subtext, color = "text-gray-900" }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-start justify-between">
    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</h3>
    <div className={`text-3xl font-bold ${color}`}>{value}</div>
    {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
  </div>
);

const SectionStat: React.FC<{ label: string; value: number; unit?: string }> = ({ label, value, unit = "pts" }) => (
  <div className="flex justify-between items-center text-sm py-2 border-b border-gray-50 last:border-0">
    <span className="text-gray-600">{label}</span>
    <span className="font-semibold text-gray-900">{value > 0 ? value.toFixed(1) : '-'} <span className="text-xs text-gray-400 font-normal">{unit}</span></span>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ records }) => {
  const stats = useMemo(() => {
    if (records.length === 0) {
      return { count: 0, maxScore: 0, lastScore: 0, avgScore: 0, granular: {} as any };
    }
    
    const sorted = [...records].sort((a, b) => b.timestamp - a.timestamp);
    const fullExams = records.filter(r => r.practiceType === 'Full Exam');

    const scoresFull = fullExams.map(r => r.totalScore);
    const maxScore = scoresFull.length > 0 ? Math.max(...scoresFull) : 0;
    const avgScore = scoresFull.length > 0 ? scoresFull.reduce((a, b) => a + b, 0) / scoresFull.length : 0;

    // --- Granular Stats Normalization Logic ---

    // Helper: Determine if a specific section ID was attempted in a record
    const isAttempted = (r: PracticeRecord, id: string, score: number) => {
        if (r.attempts && r.attempts[id] !== undefined) {
            return r.attempts[id];
        }
        // Fallback for legacy data: if score > 0, assume attempted.
        // If score is 0, we assume skipped (safe default for legacy).
        return score > 0;
    };

    // Generic Normalizer for Split Sections
    const getNormalizedAvg = (
        subSections: { id: string; maxCount: number; getValue: (r: PracticeRecord) => number }[],
        weight: number
    ) => {
        const totalMaxItems = subSections.reduce((s, i) => s + i.maxCount, 0);

        // Filter records where AT LEAST ONE subsection was attempted
        const relevantRecords = records.filter(r => 
            subSections.some(s => isAttempted(r, s.id, s.getValue(r)))
        );

        if (relevantRecords.length === 0) return 0;

        const sumNormalizedScores = relevantRecords.reduce((acc, r) => {
            let currentRawScore = 0;
            let currentAttemptedMaxItems = 0;

            subSections.forEach(s => {
                const val = s.getValue(r);
                if (isAttempted(r, s.id, val)) {
                    currentRawScore += val;
                    currentAttemptedMaxItems += s.maxCount;
                }
            });

            if (currentAttemptedMaxItems === 0) return acc;

            // Normalize: (RawScore * (TotalItems / AttemptedItems)) * WeightPerItem
            // Example: Scored 3/3 on Passage 1 (Total 7). Coefficient = 7/3. Normalized = 3 * 2.33 * 7.1
            const coefficient = totalMaxItems / currentAttemptedMaxItems;
            
            // Note: The getValue returns item count (e.g. 3 correct), so we multiply by weight at the end
            const normalizedScore = (currentRawScore * coefficient) * weight;
            
            return acc + normalizedScore;
        }, 0);

        return sumNormalizedScores / relevantRecords.length;
    };

    // --- Listening ---

    const avg_L_Long = getNormalizedAvg([
        { id: SECTION_IDS.L_LC1, maxCount: MAX_COUNTS.listening.longConversation1, getValue: r => r.inputs.listening.longConversation1 },
        { id: SECTION_IDS.L_LC2, maxCount: MAX_COUNTS.listening.longConversation2, getValue: r => r.inputs.listening.longConversation2 }
    ], SCORING_WEIGHTS.listening.longConversation);

    const avg_L_Pass = getNormalizedAvg([
        { id: SECTION_IDS.L_P1, maxCount: MAX_COUNTS.listening.passage1, getValue: r => r.inputs.listening.passage1 },
        { id: SECTION_IDS.L_P2, maxCount: MAX_COUNTS.listening.passage2, getValue: r => r.inputs.listening.passage2 }
    ], SCORING_WEIGHTS.listening.passage);

    const avg_L_Lect = getNormalizedAvg([
        { id: SECTION_IDS.L_LEC1, maxCount: MAX_COUNTS.listening.lectures1, getValue: r => r.inputs.listening.lectures1 },
        { id: SECTION_IDS.L_LEC2, maxCount: MAX_COUNTS.listening.lectures2, getValue: r => r.inputs.listening.lectures2 },
        { id: SECTION_IDS.L_LEC3, maxCount: MAX_COUNTS.listening.lectures3, getValue: r => r.inputs.listening.lectures3 }
    ], SCORING_WEIGHTS.listening.lectures);

    // --- Reading (Careful is split) ---

    const avg_R_Careful = getNormalizedAvg([
        { id: SECTION_IDS.R_CR1, maxCount: MAX_COUNTS.reading.carefulReading1, getValue: r => r.inputs.reading.carefulReading1 },
        { id: SECTION_IDS.R_CR2, maxCount: MAX_COUNTS.reading.carefulReading2, getValue: r => r.inputs.reading.carefulReading2 }
    ], SCORING_WEIGHTS.reading.carefulReading);

    // --- Simple Sections (Not split, standard avg) ---
    // For simple sections, we check if duration > 0 (for new records) or score > 0
    const getSimpleAvg = (id: string, getValue: (r: PracticeRecord) => number, weight: number) => {
        // Use duration check for 'attempted' if available, otherwise score
        const attempts = records.filter(r => {
             // For Reading/Writing, we rely on duration map or score
             if (r.inputs.durations && r.inputs.durations[id] > 0) return true;
             return getValue(r) > 0;
        });
        if (attempts.length === 0) return 0;
        return attempts.reduce((acc, r) => acc + (getValue(r) * weight), 0) / attempts.length;
    };

    const avg_R_Banked = getSimpleAvg(SECTION_IDS.R_BC, r => r.inputs.reading.bankedCloze, SCORING_WEIGHTS.reading.bankedCloze);
    const avg_R_Match = getSimpleAvg(SECTION_IDS.R_MAT, r => r.inputs.reading.matching, SCORING_WEIGHTS.reading.matching);
    
    // Writing/Trans use score directly (weight 7.1 built in but inputs are raw scores 0-15)
    // Actually inputs.others.writing is raw 0-15.
    const avg_Write = getSimpleAvg(SECTION_IDS.W_WRIT, r => r.inputs.others.writing, SCORING_WEIGHTS.others.multiplier);
    const avg_Trans = getSimpleAvg(SECTION_IDS.T_TRANS, r => r.inputs.others.translation, SCORING_WEIGHTS.others.multiplier);
    
    return {
      count: records.length,
      maxScore,
      lastScore: sorted[0].totalScore,
      lastType: sorted[0].practiceType,
      avgScore,
      granular: {
        l_long: avg_L_Long,
        l_pass: avg_L_Pass,
        l_lect: avg_L_Lect,
        r_banked: avg_R_Banked,
        r_match: avg_R_Match,
        r_careful: avg_R_Careful,
        write: avg_Write,
        trans: avg_Trans
      }
    };
  }, [records]);

  return (
    <div className="space-y-6 mb-6">
      {/* Top Level Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          title="Total Sessions" 
          value={stats.count} 
          subtext="All practice types" 
        />
        <StatCard 
          title="Best Full Score" 
          value={stats.maxScore.toFixed(1)} 
          color="text-emerald-600"
          subtext="Full mock exams only" 
        />
        <StatCard 
          title="Latest Activity" 
          value={stats.lastScore.toFixed(1)} 
          color="text-indigo-600"
          subtext={stats.lastType ? (stats.lastType.length > 20 ? stats.lastType.substring(0,18)+'...' : stats.lastType) : '-'}
        />
        <StatCard 
          title="Average Score" 
          value={stats.avgScore > 0 ? stats.avgScore.toFixed(1) : '-'} 
          subtext="Full mock exams only" 
        />
      </div>

      {/* Drill Performance Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4 flex items-center">
          <span className="w-1.5 h-4 bg-amber-500 rounded-full mr-2"></span>
          Drill Performance (Normalized Avg)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-4">
          <div>
            <h5 className="text-xs font-semibold text-blue-600 mb-2">Listening</h5>
            <SectionStat label="Long Conversation" value={stats.granular.l_long} />
            <SectionStat label="Passages" value={stats.granular.l_pass} />
            <SectionStat label="Lectures" value={stats.granular.l_lect} />
          </div>
          <div>
            <h5 className="text-xs font-semibold text-emerald-600 mb-2">Reading</h5>
            <SectionStat label="Banked Cloze" value={stats.granular.r_banked} />
            <SectionStat label="Matching" value={stats.granular.r_match} />
            <SectionStat label="Careful Reading" value={stats.granular.r_careful} />
          </div>
          <div>
            <h5 className="text-xs font-semibold text-amber-600 mb-2">Writing & Trans</h5>
            <SectionStat label="Writing" value={stats.granular.write} />
            <SectionStat label="Translation" value={stats.granular.trans} />
          </div>
          <div className="bg-gray-50 rounded-lg p-3 flex flex-col justify-center text-xs text-gray-500 italic">
            "Averages are normalized. Partial attempts (e.g. 1 passage) are scaled to represent a full section score."
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;