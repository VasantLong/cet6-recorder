export interface ListeningInputs {
  longConversation1: number; // Max 4
  longConversation2: number; // Max 4
  passage1: number; // Max 3
  passage2: number; // Max 4
  lectures1: number; // Max 3
  lectures2: number; // Max 3
  lectures3: number; // Max 4
}

export interface ReadingInputs {
  bankedCloze: number; // Max 10
  matching: number; // Max 10
  carefulReading1: number; // Max 5 (Passage 1)
  carefulReading2: number; // Max 5 (Passage 2)
}

export interface WritingTranslationInputs {
  writing: number; // Max 15 (Standard score)
  translation: number; // Max 15 (Standard score)
}

export interface SectionDurations {
  [key: string]: number; // sectionId -> minutes
}

export type PracticeType = string;

export interface PracticeRecord {
  id: string;
  timestamp: number;
  durationMinutes: number; // Total accumulated
  practiceType: PracticeType;

  inputs: {
    listening: ListeningInputs;
    reading: ReadingInputs;
    others: WritingTranslationInputs;
    durations?: SectionDurations; // Optional for backward compatibility
  };

  // Track which sections were explicitly attempted (true) vs skipped (false/undefined)
  // This allows distinguishing between a "Skipped" section (0 score) and a "Failed" section (Attempted but 0 score)
  attempts?: { [key: string]: boolean };

  // Calculated Scores
  scoreListening: number;
  scoreReading: number;
  scoreWriting: number;
  scoreTranslation: number;
  totalScore: number;
}

export const SCORING_WEIGHTS = {
  listening: {
    longConversation: 7.1,
    passage: 7.1,
    lectures: 14.2,
  },
  reading: {
    bankedCloze: 3.55,
    matching: 7.1,
    carefulReading: 14.2,
  },
  others: {
    multiplier: 7.1,
  },
};

export const MAX_COUNTS = {
  listening: {
    longConversation1: 4,
    longConversation2: 4,
    passage1: 3,
    passage2: 4,
    lectures1: 3,
    lectures2: 3,
    lectures3: 4,
  },
  reading: {
    bankedCloze: 10,
    matching: 10,
    carefulReading1: 5,
    carefulReading2: 5,
  },
  others: {
    writing: 15,
    translation: 15,
  },
};

// ID mapping for timer and form sync
export const SECTION_IDS = {
  L_LC1: "l_lc1",
  L_LC2: "l_lc2",
  L_P1: "l_p1",
  L_P2: "l_p2",
  L_LEC1: "l_lec1",
  L_LEC2: "l_lec2",
  L_LEC3: "l_lec3",
  R_BC: "r_bc",
  R_MAT: "r_mat",
  R_CR1: "r_cr1",
  R_CR2: "r_cr2",
  W_WRIT: "w_writ",
  T_TRANS: "t_trans",
};
