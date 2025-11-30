import { PracticeRecord } from '../types';

export const exportToCSV = (records: PracticeRecord[]) => {
  if (records.length === 0) return;

  // CSV Header
  const headers = [
    'Date',
    'Total Score',
    'Listening',
    'Reading',
    'Writing',
    'Translation',
    'Duration (min)'
  ];

  // CSV Rows
  const rows = records.map(record => {
    const date = new Date(record.timestamp).toLocaleString();
    return [
      `"${date}"`,
      record.totalScore.toFixed(1),
      record.scoreListening.toFixed(1),
      record.scoreReading.toFixed(1),
      record.scoreWriting.toFixed(1),
      record.scoreTranslation.toFixed(1),
      record.durationMinutes
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  
  // Add BOM for Excel compatibility
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `cet6_practice_history_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};