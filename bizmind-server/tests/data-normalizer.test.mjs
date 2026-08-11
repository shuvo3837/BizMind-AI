import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRows } from '../services/dataNormalizer.js';

test('normalizes business aliases into canonical fields', () => {
  const rows = normalizeRows([
    {
      'Sales Amount': 1500,
      'Product Name': 'Widget',
      'Category': 'Hardware',
      'Units Sold': 3,
      'Total Cost': 900,
      'Customer': 'Acme',
      'Region': 'Dhaka',
      'Order ID': 'ORD-001',
    },
  ]);

  assert.equal(rows.length, 1);
  assert.equal(rows[0].revenue, 1500);
  assert.equal(rows[0].productName, 'Widget');
  assert.equal(rows[0].quantity, 3);
  assert.equal(rows[0].cost, 900);
  assert.equal(rows[0].customer, 'Acme');
  assert.equal(rows[0].region, 'Dhaka');
  assert.equal(rows[0].orderId, 'ORD-001');
});
