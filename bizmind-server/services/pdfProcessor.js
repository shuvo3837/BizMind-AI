import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export const parsePDFFile = async (filePath) => {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  const text = data.text || '';
  const rows = [];
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) {
    return [];
  }
  const headers = lines[0].split(/\s{2,}|,|\|/).map((h) => h.trim());
  for (let i = 1; i < lines.length; i += 1) {
    const values = lines[i].split(/\s{2,}|,|\|/).map((v) => v.trim());
    if (values.length === 0) continue;
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] ?? '';
    });
    rows.push(record);
  }
  return rows;
};
