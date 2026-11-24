import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCartAdd } from './cart-conflict.ts';

const baseItemA = {
  id: 'prod-1',
  name: 'Injera Shiro',
  priceMinor: 8500,
  businessId: 'biz-a',
  businessName: 'Haramaya Cafe',
  campusId: 'campus-1',
};

const baseItemA2 = {
  id: 'prod-2',
  name: 'Special Ful',
  priceMinor: 6500,
  businessId: 'biz-a',
  businessName: 'Haramaya Cafe',
  campusId: 'campus-1',
};

const baseItemB = {
  id: 'prod-3',
  name: 'Thesis Binding',
  priceMinor: 12000,
  businessId: 'biz-b',
  businessName: 'Bate Print Center',
  campusId: 'campus-1',
};

test('resolveCartAdd adds first item into empty cart without conflict', () => {
  const result = resolveCartAdd([], baseItemA, 2);
  assert.equal(result.conflict, false);
  assert.equal(result.nextItems.length, 1);
  assert.equal(result.nextItems[0].quantity, 2);
});

test('resolveCartAdd merges quantity for matching product from same business', () => {
  const result = resolveCartAdd([{ ...baseItemA, quantity: 1 }], baseItemA, 2);
  assert.equal(result.conflict, false);
  assert.equal(result.nextItems.length, 1);
  assert.equal(result.nextItems[0].quantity, 3);
});

test('resolveCartAdd appends distinct product from same business', () => {
  const result = resolveCartAdd([{ ...baseItemA, quantity: 1 }], baseItemA2, 1);
  assert.equal(result.conflict, false);
  assert.equal(result.nextItems.length, 2);
});

test('resolveCartAdd signals conflict when adding from a different business without mutating cart', () => {
  const current = [{ ...baseItemA, quantity: 2 }];
  const result = resolveCartAdd(current, baseItemB, 1);
  assert.equal(result.conflict, true);
  assert.deepEqual(result.nextItems, current);
});
