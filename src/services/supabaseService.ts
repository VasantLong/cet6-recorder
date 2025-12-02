import { supabase } from "./supabaseClient";
import type { PracticeRecord } from "../types";

export const fetchSupabaseRecords = async (): Promise<PracticeRecord[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("practice_records")
    .select("*")
    .order("timestamp", { ascending: false });

  if (error) {
    console.error("Error fetching records:", error);
    throw error;
  }

  // Map SQL columns back to nested JSON structure
  return data.map((row: any) => ({
    id: row.id,
    timestamp: parseInt(row.timestamp),
    durationMinutes: row.duration_minutes,
    practiceType: row.practice_type,
    totalScore: row.total_score,
    scoreListening: row.score_listening,
    scoreReading: row.score_reading,
    scoreWriting: row.score_writing,
    scoreTranslation: row.score_translation,
    inputs: row.inputs,
    attempts: row.attempts,
  }));
};

export const addSupabaseRecord = async (
  record: PracticeRecord
): Promise<PracticeRecord | null> => {
  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be logged in to save records"); // Exclude local ID, let DB generate UUID if needed, or we can use it.
  }
  // Flatten structure for SQL
  const row = {
    user_id: user.id,
    timestamp: record.timestamp,
    duration_minutes: record.durationMinutes,
    practice_type: record.practiceType,
    total_score: record.totalScore,
    score_listening: record.scoreListening,
    score_reading: record.scoreReading,
    score_writing: record.scoreWriting,
    score_translation: record.scoreTranslation,
    inputs: record.inputs,
    attempts: record.attempts,
  };

  const { data, error } = await supabase
    .from("practice_records")
    .insert([row])
    .select()
    .single();

  if (error) {
    console.error("Error adding record:", error);
    throw error;
  }

  // Return formatted record with the new real UUID from database
  return {
    ...record,
    id: data.id,
  };
};

export const deleteSupabaseRecord = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("practice_records")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting record:", error);
    throw error;
  }
};

export const clearSupabaseRecords = async (): Promise<void> => {
  // RLS policies ensure users only delete their own data
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("practice_records")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    console.error("Error clearing records:", error);
    throw error;
  }
};
