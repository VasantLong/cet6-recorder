
import { PracticeRecord } from '../types';

const STORAGE_KEY = 'cet6_practice_records';

export const STORAGE_EVENT = 'cet6_storage_update';

export const getRecords = (): PracticeRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load records", error);
    // Return empty array if corrupt to allow app to function
    return [];
  }
};

export const saveRecords = (records: PracticeRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error("Failed to save records", error);
  }
};

export const clearAllRecords = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(STORAGE_EVENT));
  } catch (e) {
    console.error("Failed to clear records", e);
  }
};
