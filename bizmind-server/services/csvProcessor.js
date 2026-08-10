import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { normalizeRows } from './dataNormalizer.js';

export const parseCSVFile = async (filePath) => {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
    bom: true
  });
  return normalizeRows(records);
};
