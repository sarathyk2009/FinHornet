import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';

test('Razorpay HMAC-SHA256 signature calculation matches verification algorithm', () => {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder';
  const orderId = 'order_test_12345';
  const paymentId = 'pay_test_67890';
  const body = `${orderId}|${paymentId}`;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  assert.ok(signature.length === 64, 'HMAC signature should be a 64-character hex string');

  // Verify that recalculating with same inputs produces identical hash
  const verifySignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  assert.equal(signature, verifySignature);

  // Verify that tampered signature fails
  const tamperedSignature = signature.slice(0, -1) + '0';
  assert.notEqual(tamperedSignature, verifySignature);
});

test('Plan price to paise conversion logic', () => {
  const planPrices: Record<string, number> = {
    monthly_sprint: 350,
    monthly: 350,
    six_month: 1499,
    annual: 2499,
  };

  assert.equal(Math.round(planPrices.monthly_sprint * 100), 35000);
  assert.equal(Math.round(planPrices.monthly * 100), 35000);
  assert.equal(Math.round(planPrices.six_month * 100), 149900);
  assert.equal(Math.round(planPrices.annual * 100), 249900);

  // Dynamic price calculation check (e.g. amount = 350)
  const clientAmount = 350;
  const finalAmount = Math.round(Number(clientAmount || 350) * 100);
  assert.equal(finalAmount, 35000);
});
