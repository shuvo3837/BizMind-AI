import xlsx from 'xlsx';
import { normalizeRows } from './dataNormalizer.js';

export const parseExcelFile = async (filePath) => {
  const workbook = xlsx.readFile(filePath, { cellDates: true, cellNF: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return [];
  }

  const worksheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(worksheet, {
    defval: '',
    raw: false,
    dateNF: 'yyyy-mm-dd'
  });
  return normalizeRows(rows);
};
