import assert from 'node:assert/strict';
import { getSubscriptionPlanById, getSubscriptionPlanByAmount, getSubscriptionPlanByRef, resolveSubscriptionPlan } from '../utils/subscriptionPlans.js';

const cases = [
  { label: 'silver', planId: 'silver', expected: { amount: 20, durationDays: 30, userType: 'premium' } },
  { label: 'bronze', planId: 'bronze', expected: { amount: 30, durationDays: 30, userType: 'premium' } },
  { label: 'gold', planId: 'gold', expected: { amount: 40, durationDays: 30, userType: 'premium' } },
];

for (const testCase of cases) {
  const plan = getSubscriptionPlanById(testCase.planId);
  assert.equal(plan.amount, testCase.expected.amount, `${testCase.label} amount`);
  assert.equal(plan.durationDays, testCase.expected.durationDays, `${testCase.label} durationDays`);
  assert.equal(plan.userType, testCase.expected.userType, `${testCase.label} userType`);
}

assert.equal(getSubscriptionPlanByAmount(20)?.id, 'silver');
assert.equal(getSubscriptionPlanByAmount(30)?.id, 'bronze');
assert.equal(getSubscriptionPlanByAmount(40)?.id, 'gold');
assert.equal(getSubscriptionPlanByAmount(20)?.durationDays, 30);
assert.equal(getSubscriptionPlanByRef('silver')?.id, 'silver');
assert.equal(getSubscriptionPlanByRef('GOLD')?.id, 'gold');
assert.equal(resolveSubscriptionPlan({ planRef: 'silver', amount: 20 })?.id, 'silver');
assert.equal(resolveSubscriptionPlan({ planRef: 'silver', amount: 20 })?.durationDays, 30);
console.log('subscription plan tests passed');
