import test from 'node:test';
import assert from 'node:assert/strict';
import { extractPayHeroPayload, isSuccessfulPayHeroPayload, buildPaymentLookupCandidates } from '../utils/payheroFlow.js';

test('extractPayHeroPayload prefers response over root payload', () => {
  const payload = extractPayHeroPayload({
    response: {
      Amount: 3,
      Status: 'Success',
      CheckoutRequestID: 'abc123',
      ExternalReference: 'INV-42-elite',
    },
  });

  assert.equal(payload.Status, 'Success');
  assert.equal(payload.CheckoutRequestID, 'abc123');
});

test('extractPayHeroPayload falls back to data when response is missing', () => {
  const payload = extractPayHeroPayload({
    data: {
      Amount: 2,
      ResultCode: '0',
      CheckoutRequestID: 'xyz789',
      ExternalReference: 'INV-7-pro',
    },
  });

  assert.equal(payload.Amount, 2);
  assert.equal(payload.ResultCode, '0');
});

test('isSuccessfulPayHeroPayload accepts success-by-code or success-by-status', () => {
  assert.equal(isSuccessfulPayHeroPayload({ ResultCode: '0' }), true);
  assert.equal(isSuccessfulPayHeroPayload({ Status: 'Success' }), true);
  assert.equal(isSuccessfulPayHeroPayload({ Status: 'QUEUED' }), false);
});

test('buildPaymentLookupCandidates prioritises checkout request id and reference values', () => {
  const candidates = buildPaymentLookupCandidates({
    checkoutRequestId: 'checkout-1',
    reference: 'INV-3-starter',
    externalReference: 'INV-3-starter',
    merchantReference: 'merchant-1',
  });

  assert.deepEqual(candidates, [
    { checkoutRequestId: 'checkout-1' },
    { reference: 'INV-3-starter' },
    { externalReference: 'INV-3-starter' },
    { merchantReference: 'merchant-1' },
  ]);
});
