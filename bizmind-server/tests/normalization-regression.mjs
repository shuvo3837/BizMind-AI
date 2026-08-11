import assert from 'node:assert/strict';
import { normalizeRows } from '../services/dataNormalizer.js';

const rows = [{
  productName: 'Wireless Mouse',
  category: 'Electronics',
  quantity: 15,
  unitPrice: 29.99,
  cost: 12.5,
  stock: 80,
}];

const [normalized] = normalizeRows(rows);
assert.ok(normalized, 'Expected a normalized row');
assert.equal(normalized.revenue, 449.85, 'Expected revenue to be derived from quantity * unitPrice');
assert.equal(normalized.stock, 80, 'Expected stock to be preserved');
console.log('normalization regression passed', normalized);
