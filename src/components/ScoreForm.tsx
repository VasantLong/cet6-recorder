
import React, { useState, useEffect } from 'react';
import { MAX_COUNTS, PracticeRecord, SCORING_WEIGHTS, PracticeType, SECTION_IDS, SectionDurations } from '../types';

interface ScoreFormProps {
  onSave: (record: PracticeRecord) => void;
  incomingTimeLog: { sectionId: string; minutes: number } | null;
}

const LISTENING_IDS = [SECTION_IDS.L_LC1, SECTION_IDS.L_LC2, SECTION_IDS.L_P1, SECTION_IDS.L_P2, SECTION_IDS.L_LEC1, SECTION_IDS.L_LEC2, SECTION_IDS.L_LEC3];
const READING_IDS = [SECTION_IDS.R_BC, SECTION_IDS.R_MAT, SECTION_IDS.R_CR1, SECTION_IDS.R_CR2];
const OTHER_IDS = [SECTION_IDS.W_WRIT, SECTION_IDS.T_TRANS];

const RowInput: React.FC<{ 
  label: string; 
  value: number; 
  max: number; 
  onChange: (val: number) => void;
  timeValue?: number;
  onTimeChange?: (val: number) => void;
  hideTime?: boolean;
  hasError?: boolean;
  isToggleable?: boolean;
  isActive?: boolean;
  onToggle?: () => void;
}> = ({ label, value, max, onChange, timeValue, onTimeChange, hideTime, hasError, isToggleable, isActive, onToggle }) => (
  <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
    <div className="w-32 flex-shrink-0 flex items-center gap-2">
      {isToggleable && (
        <button
          type="button"
          onClick={onToggle}
          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all flex-shrink-0 ${
            isActive 
              ? 'bg-green-500 border-green-600 shadow-sm' 
              : 'bg-white border-gray-300 hover:border-gray-400'
          }`}
          title={isActive ? "Included in score" : "Skipped / Not attempted"}
        >
          {isActive && <div className="w-2 h-2 bg-white rounded-full" />}
        </button>
      )}
      <div className={!isToggleable || isActive ? 'opacity-100' : 'opacity-50'}>
        <label className={`text-xs font-medium ${!isToggleable || isActive ? 'text-gray-700' : 'text-gray-400'}`}>{label}</label>
        <div className="text-[10px] text-gray-400">Max: {max}</div>
      </div>
    </div>
    
    <div className="flex-1 flex items-center gap-2">
      <div className="flex flex-col relative w-full">
         <span className={`absolute right-2 top-1.5 text-[10px] pointer-events-none ${!isToggleable || isActive ? 'text-gray-400' : 'text-gray-200'}`}>Score</span>
         <input
          type="number"
          min="0"
          max={max}
          value={value === 0 ? '' : value}
          placeholder="0"
          disabled={isToggleable && !isActive}
          onChange={(e) => {
            let val = parseFloat(e.target.value) || 0;
            if (val < 0) val = 0;
            if (val > max) val = max;
            onChange(val);
          }}
          className={`w-full pl-3 pr-9 py-1.5 border rounded text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
            !isToggleable || isActive 
              ? 'bg-white border-gray-200 text-gray-900' 
              : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed placeholder-gray-200'
          }`}
        />
      </div>
      
      {!hideTime && (
        <div className="flex flex-col relative w-full">
          <span className={`absolute right-2 top-1.5 text-[10px] pointer-events-none ${!isToggleable || isActive ? 'text-gray-400' : 'text-gray-200'}`}>Min</span>
          <input
            type="number"
            min="0"
            value={timeValue === 0 ? '' : timeValue}
            placeholder="0"
            disabled={isToggleable && !isActive}
            onChange={(e) => {
              if (onTimeChange) {
                let val = parseInt(e.target.value) || 0;
                if (val < 0) val = 0;
                onTimeChange(val);
              }
            }}
            className={`w-full pl-3 pr-8 py-1.5 border rounded text-sm text-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
              !isToggleable || isActive
                ? (hasError 
                    ? 'border-red-500 ring-1 ring-red-200 bg-red-50 text-red-700' 
                    : 'bg-gray-50 border-gray-200 hover:bg-white')
                : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed placeholder-gray-200'
            }`}
          />
        </div>
      )}
    </div>
  </div>
);

const AccordionSection: React.FC<{
  title: string;
  color: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  score: number;
  duration: number;
  activeCount: number;
  totalCount: number;
}> = ({ title, color, isOpen, onToggle, children, score, duration, activeCount, totalCount }) => (
  <div className={`border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 ${isOpen ? 'ring-1 ring-offset-1 ' + color.replace('text-', 'ring-') : 'hover:border-gray-300'}`}>
    <button 
      type="button"
      onClick={onToggle}
      className="w-full px-4 py-3 bg-white flex justify-between items-center focus:outline-none group"
    >
      <div className="flex items-center gap-3">
        <span className={`text-sm font-bold uppercase tracking-wider ${color}`}>{title}</span>
        <div className="flex gap-1.5">
            {duration > 0 && !isOpen && (
                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full font-mono">{duration}m</span>
            )}
            {activeCount > 0 && !isOpen && (
                 <span className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-600 rounded-full font-mono border border-green-100">{activeCount}/{totalCount} Active</span>
            )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {!isOpen && score > 0 && (
          <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded">Current: {score.toFixed(1)}</span>
        )}
        <span className="text-gray-400 text-xs group-hover:text-gray-600 transition-colors">{isOpen ? '▼' : '▶'}</span>
      </div>
    </button>
    {isOpen && (
      <div className="p-4 bg-white border-t border-gray-100 animate-fadeIn">
        {children}
      </div>
    )}
  </div>
);

const ScoreForm: React.FC<ScoreFormProps> = ({ onSave, incomingTimeLog }) => {
  // --- Listening Scores ---
  const [l_lc1, setL_Lc1] = useState(0);
  const [l_lc2, setL_Lc2] = useState(0);
  const [l_p1, setL_P1] = useState(0);
  const [l_p2, setL_P2] = useState(0);
  const [l_lec1, setL_Lec1] = useState(0);
  const [l_lec2, setL_Lec2] = useState(0);
  const [l_lec3, setL_Lec3] = useState(0);

  // --- Reading Scores ---
  const [r_bc, setR_Bc] = useState(0);
  const [r_mat, setR_Mat] = useState(0);
  const [r_cr1, setR_Cr1] = useState(0);
  const [r_cr2, setR_Cr2] = useState(0);

  // --- Writing/Trans Scores ---
  const [w_writ, setW_Writ] = useState(0);
  const [t_trans, setT_Trans] = useState(0);

  // --- Durations State (Map) ---
  const [durations, setDurations] = useState<SectionDurations>({});
  
  // --- Active Toggles ---
  const [activeSections, setActiveSections] = useState<Record<string, boolean>>({});

  // --- Error State ---
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  const [openSection, setOpenSection] = useState<'listening' | 'reading' | 'others' | 'all'>('all');

  // Handle incoming timer log
  useEffect(() => {
    if (incomingTimeLog) {
      const { sectionId, minutes } = incomingTimeLog;
      setDurations(prev => ({
        ...prev,
        [sectionId]: (prev[sectionId] || 0) + minutes
      }));
      // Auto-activate the section if data comes in
      setActiveSections(prev => ({ ...prev, [sectionId]: true }));
      
      if (minutes > 0) {
        setFieldErrors(prev => {
          const next = { ...prev };
          delete next[sectionId];
          return next;
        });
      }
    }
  }, [incomingTimeLog]);

  const updateDuration = (id: string, mins: number) => {
    setDurations(prev => ({ ...prev, [id]: mins }));
    if (mins > 0) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const resetScore = (id: string) => {
    switch(id) {
        case SECTION_IDS.L_LC1: setL_Lc1(0); break;
        case SECTION_IDS.L_LC2: setL_Lc2(0); break;
        case SECTION_IDS.L_P1: setL_P1(0); break;
        case SECTION_IDS.L_P2: setL_P2(0); break;
        case SECTION_IDS.L_LEC1: setL_Lec1(0); break;
        case SECTION_IDS.L_LEC2: setL_Lec2(0); break;
        case SECTION_IDS.L_LEC3: setL_Lec3(0); break;
        case SECTION_IDS.R_BC: setR_Bc(0); break;
        case SECTION_IDS.R_MAT: setR_Mat(0); break;
        case SECTION_IDS.R_CR1: setR_Cr1(0); break;
        case SECTION_IDS.R_CR2: setR_Cr2(0); break;
        case SECTION_IDS.W_WRIT: setW_Writ(0); break;
        case SECTION_IDS.T_TRANS: setT_Trans(0); break;
    }
  };

  const getScore = (id: string) => {
    switch(id) {
        case SECTION_IDS.L_LC1: return l_lc1;
        case SECTION_IDS.L_LC2: return l_lc2;
        case SECTION_IDS.L_P1: return l_p1;
        case SECTION_IDS.L_P2: return l_p2;
        case SECTION_IDS.L_LEC1: return l_lec1;
        case SECTION_IDS.L_LEC2: return l_lec2;
        case SECTION_IDS.L_LEC3: return l_lec3;
        case SECTION_IDS.R_BC: return r_bc;
        case SECTION_IDS.R_MAT: return r_mat;
        case SECTION_IDS.R_CR1: return r_cr1;
        case SECTION_IDS.R_CR2: return r_cr2;
        case SECTION_IDS.W_WRIT: return w_writ;
        case SECTION_IDS.T_TRANS: return t_trans;
        default: return 0;
    }
  };

  const getLabel = (id: string) => {
      const map: Record<string, string> = {
          [SECTION_IDS.L_LC1]: 'Long Conv 1',
          [SECTION_IDS.L_LC2]: 'Long Conv 2',
          [SECTION_IDS.L_P1]: 'Passage 1',
          [SECTION_IDS.L_P2]: 'Passage 2',
          [SECTION_IDS.L_LEC1]: 'Lecture 1',
          [SECTION_IDS.L_LEC2]: 'Lecture 2',
          [SECTION_IDS.L_LEC3]: 'Lecture 3',
          [SECTION_IDS.R_BC]: 'Banked Cloze',
          [SECTION_IDS.R_MAT]: 'Matching',
          [SECTION_IDS.R_CR1]: 'Careful Reading 1',
          [SECTION_IDS.R_CR2]: 'Careful Reading 2',
          [SECTION_IDS.W_WRIT]: 'Writing',
          [SECTION_IDS.T_TRANS]: 'Translation'
      };
      return map[id] || id;
  }

  const toggleActive = (id: string) => {
    setActiveSections(prev => {
        const next = { ...prev, [id]: !prev[id] };
        if (!next[id]) {
            resetScore(id);
            updateDuration(id, 0);
        }
        return next;
    });
  };

  const toggleGroup = (ids: string[]) => {
      const allActive = ids.every(id => activeSections[id]);
      const newState = { ...activeSections };
      ids.forEach(id => {
          newState[id] = !allActive;
          if (allActive) { // Turning off
              resetScore(id);
              updateDuration(id, 0);
          }
      });
      setActiveSections(newState);
  };

  const getDuration = (id: string) => durations[id] || 0;

  const getTotalDuration = () => {
    return Object.values(durations).reduce((sum, val) => sum + val, 0);
  };

  const toggleSection = (section: 'listening' | 'reading' | 'others') => {
    if (openSection === 'all') setOpenSection(section);
    else if (openSection === section) setOpenSection('all');
    else setOpenSection(section);
  };

  const calculateScores = () => {
    const s_l = 
      ((l_lc1 + l_lc2) * SCORING_WEIGHTS.listening.longConversation) +
      ((l_p1 + l_p2) * SCORING_WEIGHTS.listening.passage) +
      ((l_lec1 + l_lec2 + l_lec3) * SCORING_WEIGHTS.listening.lectures);

    const s_r = 
      (r_bc * SCORING_WEIGHTS.reading.bankedCloze) +
      (r_mat * SCORING_WEIGHTS.reading.matching) +
      ((r_cr1 + r_cr2) * SCORING_WEIGHTS.reading.carefulReading);
    
    const s_w = w_writ * SCORING_WEIGHTS.others.multiplier;
    const s_t = t_trans * SCORING_WEIGHTS.others.multiplier;
    
    return { s_l, s_r, s_w, s_t };
  };

  const currentScores = calculateScores();

  const determinePracticeType = (s_l: number, s_r: number, s_w: number, s_t: number): PracticeType => {
    const hasL = LISTENING_IDS.some(id => activeSections[id]);
    const hasR = READING_IDS.some(id => activeSections[id]);
    const hasW = activeSections[SECTION_IDS.W_WRIT];
    const hasT = activeSections[SECTION_IDS.T_TRANS];

    if (hasL && hasR && hasW && hasT) return 'Full Exam';

    const parts: string[] = [];
    if (hasL) parts.push('Listening');
    if (hasR) parts.push('Reading');
    if (hasW) parts.push('Writing');
    if (hasT) parts.push('Trans');

    if (parts.length === 0) return 'Mixed';
    if (parts.length > 2) return 'Mixed Drill';
    return parts.join(' & ');
  };

  const validate = (): boolean => {
    const newErrors: Record<string, boolean> = {};
    const zeroScoreChecks: string[] = [];

    // 1. Strict Time Validation for Timed Sections
    // If Active, Duration MUST be > 0.
    const timedIds = [...READING_IDS, ...OTHER_IDS];
    timedIds.forEach(id => {
        if (activeSections[id]) {
            if (getDuration(id) <= 0) {
                newErrors[id] = true;
            }
        }
    });

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      alert("Active sections must have a duration greater than 0 minutes. Please check the highlighted fields.");
      return false;
    }

    // 2. Zero Score Confirmation for ALL Active Sections
    const allIds = [...LISTENING_IDS, ...READING_IDS, ...OTHER_IDS];
    allIds.forEach(id => {
        if (activeSections[id]) {
            const score = getScore(id);
            if (score === 0) {
                zeroScoreChecks.push(getLabel(id));
            }
        }
    });

    for (const label of zeroScoreChecks) {
      const confirmed = window.confirm(`You marked "${label}" as active/attempted but recorded a score of 0. Is this a real score (failed attempt)?`);
      if (!confirmed) return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    // If nothing active, warn
    if (Object.keys(activeSections).filter(k => activeSections[k]).length === 0) {
        alert("Please select at least one section to record.");
        return;
    }

    if (!validate()) return;

    const { s_l, s_r, s_w, s_t } = currentScores;
    const total = s_l + s_r + s_w + s_t;
    const type = determinePracticeType(s_l, s_r, s_w, s_t);
    const totalDuration = getTotalDuration();

    // Construct attempts map
    const attempts: Record<string, boolean> = {};
    Object.keys(activeSections).forEach(k => {
        if (activeSections[k]) attempts[k] = true;
    });

    const record: PracticeRecord = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      durationMinutes: totalDuration,
      practiceType: type,
      attempts: attempts,
      inputs: {
        listening: { 
            longConversation1: l_lc1, longConversation2: l_lc2,
            passage1: l_p1, passage2: l_p2,
            lectures1: l_lec1, lectures2: l_lec2, lectures3: l_lec3
        },
        reading: { 
          bankedCloze: r_bc, 
          matching: r_mat, 
          carefulReading1: r_cr1, 
          carefulReading2: r_cr2 
        },
        others: { writing: w_writ, translation: t_trans },
        durations: durations
      },
      scoreListening: s_l,
      scoreReading: s_r,
      scoreWriting: s_w,
      scoreTranslation: s_t,
      totalScore: total
    };

    onSave(record);
    
    // Reset
    setL_Lc1(0); setL_Lc2(0); setL_P1(0); setL_P2(0); setL_Lec1(0); setL_Lec2(0); setL_Lec3(0);
    setR_Bc(0); setR_Mat(0); setR_Cr1(0); setR_Cr2(0);
    setW_Writ(0); setT_Trans(0);
    setDurations({});
    setFieldErrors({});
    setActiveSections({});
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') e.preventDefault();
  };

  const SelectAllBtn: React.FC<{ ids: string[] }> = ({ ids }) => {
      const allActive = ids.every(id => activeSections[id]);
      return (
        <button 
          type="button" 
          onClick={(e) => { e.stopPropagation(); toggleGroup(ids); }}
          className="text-[10px] font-semibold uppercase tracking-wider bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition-colors"
        >
            {allActive ? 'Deselect All' : 'Select All'}
        </button>
      );
  };

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
         <h2 className="text-lg font-bold text-gray-900 flex items-center">
          <span className="w-2 h-6 bg-indigo-500 rounded-full mr-3"></span>
          Score Entry
        </h2>
        <div className="text-xs text-gray-500 font-mono">
           Total Time: {getTotalDuration()}m
        </div>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        
        {/* LISTENING */}
        <AccordionSection 
          title="Listening" 
          color="text-blue-600" 
          isOpen={openSection === 'all' || openSection === 'listening'}
          onToggle={() => toggleSection('listening')}
          score={currentScores.s_l}
          duration={0}
          activeCount={LISTENING_IDS.filter(id => activeSections[id]).length}
          totalCount={LISTENING_IDS.length}
        >
          <div className="space-y-1">
             <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-[10px] text-gray-400 italic">Toggle circle to activate section</span>
                <SelectAllBtn ids={LISTENING_IDS} />
             </div>
             <RowInput 
                label="Long Conv 1" max={MAX_COUNTS.listening.longConversation1} value={l_lc1} onChange={setL_Lc1} hideTime 
                isToggleable isActive={!!activeSections[SECTION_IDS.L_LC1]} onToggle={() => toggleActive(SECTION_IDS.L_LC1)}
             />
             <RowInput 
                label="Long Conv 2" max={MAX_COUNTS.listening.longConversation2} value={l_lc2} onChange={setL_Lc2} hideTime 
                isToggleable isActive={!!activeSections[SECTION_IDS.L_LC2]} onToggle={() => toggleActive(SECTION_IDS.L_LC2)}
             />
             <div className="border-t border-gray-50 my-1"></div>
             <RowInput 
                label="Passage 1" max={MAX_COUNTS.listening.passage1} value={l_p1} onChange={setL_P1} hideTime 
                isToggleable isActive={!!activeSections[SECTION_IDS.L_P1]} onToggle={() => toggleActive(SECTION_IDS.L_P1)}
             />
             <RowInput 
                label="Passage 2" max={MAX_COUNTS.listening.passage2} value={l_p2} onChange={setL_P2} hideTime 
                isToggleable isActive={!!activeSections[SECTION_IDS.L_P2]} onToggle={() => toggleActive(SECTION_IDS.L_P2)}
             />
             <div className="border-t border-gray-50 my-1"></div>
             <RowInput 
                label="Lecture 1" max={MAX_COUNTS.listening.lectures1} value={l_lec1} onChange={setL_Lec1} hideTime 
                isToggleable isActive={!!activeSections[SECTION_IDS.L_LEC1]} onToggle={() => toggleActive(SECTION_IDS.L_LEC1)}
             />
             <RowInput 
                label="Lecture 2" max={MAX_COUNTS.listening.lectures2} value={l_lec2} onChange={setL_Lec2} hideTime 
                isToggleable isActive={!!activeSections[SECTION_IDS.L_LEC2]} onToggle={() => toggleActive(SECTION_IDS.L_LEC2)}
             />
             <RowInput 
                label="Lecture 3" max={MAX_COUNTS.listening.lectures3} value={l_lec3} onChange={setL_Lec3} hideTime 
                isToggleable isActive={!!activeSections[SECTION_IDS.L_LEC3]} onToggle={() => toggleActive(SECTION_IDS.L_LEC3)}
             />
          </div>
        </AccordionSection>

        {/* READING */}
        <AccordionSection 
          title="Reading" 
          color="text-emerald-600" 
          isOpen={openSection === 'all' || openSection === 'reading'}
          onToggle={() => toggleSection('reading')}
          score={currentScores.s_r}
          duration={[SECTION_IDS.R_BC, SECTION_IDS.R_MAT, SECTION_IDS.R_CR1, SECTION_IDS.R_CR2].reduce((a,b) => a+getDuration(b), 0)}
          activeCount={READING_IDS.filter(id => activeSections[id]).length}
          totalCount={READING_IDS.length}
        >
          <div className="space-y-1">
            <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-[10px] text-gray-400 italic">Toggle circle to activate section</span>
                <SelectAllBtn ids={READING_IDS} />
             </div>
            <RowInput 
                label="Banked Cloze" max={MAX_COUNTS.reading.bankedCloze} value={r_bc} onChange={setR_Bc} 
                timeValue={getDuration(SECTION_IDS.R_BC)} onTimeChange={v => updateDuration(SECTION_IDS.R_BC, v)} hasError={fieldErrors[SECTION_IDS.R_BC]} 
                isToggleable isActive={!!activeSections[SECTION_IDS.R_BC]} onToggle={() => toggleActive(SECTION_IDS.R_BC)}
            />
            <RowInput 
                label="Matching" max={MAX_COUNTS.reading.matching} value={r_mat} onChange={setR_Mat} 
                timeValue={getDuration(SECTION_IDS.R_MAT)} onTimeChange={v => updateDuration(SECTION_IDS.R_MAT, v)} hasError={fieldErrors[SECTION_IDS.R_MAT]} 
                isToggleable isActive={!!activeSections[SECTION_IDS.R_MAT]} onToggle={() => toggleActive(SECTION_IDS.R_MAT)}
            />
            <div className="border-t border-gray-50 my-1"></div>
            <RowInput 
                label="Careful (Ps 1)" max={MAX_COUNTS.reading.carefulReading1} value={r_cr1} onChange={setR_Cr1} 
                timeValue={getDuration(SECTION_IDS.R_CR1)} onTimeChange={v => updateDuration(SECTION_IDS.R_CR1, v)} hasError={fieldErrors[SECTION_IDS.R_CR1]} 
                isToggleable isActive={!!activeSections[SECTION_IDS.R_CR1]} onToggle={() => toggleActive(SECTION_IDS.R_CR1)}
            />
            <RowInput 
                label="Careful (Ps 2)" max={MAX_COUNTS.reading.carefulReading2} value={r_cr2} onChange={setR_Cr2} 
                timeValue={getDuration(SECTION_IDS.R_CR2)} onTimeChange={v => updateDuration(SECTION_IDS.R_CR2, v)} hasError={fieldErrors[SECTION_IDS.R_CR2]} 
                isToggleable isActive={!!activeSections[SECTION_IDS.R_CR2]} onToggle={() => toggleActive(SECTION_IDS.R_CR2)}
            />
          </div>
        </AccordionSection>

        {/* OTHERS */}
        <AccordionSection 
          title="Writing & Trans" 
          color="text-amber-600" 
          isOpen={openSection === 'all' || openSection === 'others'}
          onToggle={() => toggleSection('others')}
          score={currentScores.s_w + currentScores.s_t}
          duration={getDuration(SECTION_IDS.W_WRIT) + getDuration(SECTION_IDS.T_TRANS)}
          activeCount={OTHER_IDS.filter(id => activeSections[id]).length}
          totalCount={OTHER_IDS.length}
        >
          <div className="space-y-1">
             <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-[10px] text-gray-400 italic">Toggle circle to activate section</span>
                <SelectAllBtn ids={OTHER_IDS} />
             </div>
             <RowInput 
                label="Writing" max={MAX_COUNTS.others.writing} value={w_writ} onChange={setW_Writ} 
                timeValue={getDuration(SECTION_IDS.W_WRIT)} onTimeChange={v => updateDuration(SECTION_IDS.W_WRIT, v)} hasError={fieldErrors[SECTION_IDS.W_WRIT]} 
                isToggleable isActive={!!activeSections[SECTION_IDS.W_WRIT]} onToggle={() => toggleActive(SECTION_IDS.W_WRIT)}
             />
             <RowInput 
                label="Translation" max={MAX_COUNTS.others.translation} value={t_trans} onChange={setT_Trans} 
                timeValue={getDuration(SECTION_IDS.T_TRANS)} onTimeChange={v => updateDuration(SECTION_IDS.T_TRANS, v)} hasError={fieldErrors[SECTION_IDS.T_TRANS]} 
                isToggleable isActive={!!activeSections[SECTION_IDS.T_TRANS]} onToggle={() => toggleActive(SECTION_IDS.T_TRANS)}
             />
          </div>
        </AccordionSection>
      </div>

      <div className="pt-6 mt-4 border-t border-gray-100">
        <button 
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
        >
          <span>Save Record</span>
          <span className="text-indigo-200 text-sm font-normal">({getTotalDuration()} mins)</span>
        </button>
      </div>
    </form>
  );
};

export default ScoreForm;
