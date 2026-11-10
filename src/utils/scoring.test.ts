import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCMAExamScore,
  isFreeLimitReached,
  formatTimeRemaining,
  calculateSpeedEfficiency,
  calculateDomainStats,
} from './scoring';
import { Question } from '../types';

const mockQuestions: Question[] = [
  {
    id: 'q1',
    part: 'part1',
    domain: 'Cost Management',
    subtopic: 'Absorption vs Variable Costing',
    scenario: 'Test scenario 1',
    questionText: 'What is operating income?',
    options: [
      { id: 'A', text: 'Option A' },
      { id: 'B', text: 'Option B' },
      { id: 'C', text: 'Option C' },
      { id: 'D', text: 'Option D' },
    ],
    correctOption: 'B',
    conciseHint: 'Think about fixed overhead.',
    explanation: {
      summary: 'Summary 1',
      conciseHint: 'Hint 1',
      steps: [{ stepTitle: 'Step 1', detail: 'Calculation detail' }],
      distractorAnalysis: { A: 'No', B: 'Yes', C: 'No', D: 'No' },
    },
    difficulty: 'Exam Standard',
  },
  {
    id: 'q2',
    part: 'part1',
    domain: 'Cost Management',
    subtopic: 'Variance Analysis',
    scenario: 'Test scenario 2',
    questionText: 'What is the material price variance?',
    options: [
      { id: 'A', text: '$1,000 F' },
      { id: 'B', text: '$1,000 U' },
      { id: 'C', text: '$500 F' },
      { id: 'D', text: '$500 U' },
    ],
    correctOption: 'A',
    conciseHint: 'Standard price vs actual price times actual quantity.',
    explanation: {
      summary: 'Summary 2',
      conciseHint: 'Hint 2',
      steps: [{ stepTitle: 'Step 1', detail: 'Formula detail' }],
      distractorAnalysis: { A: 'Yes', B: 'No', C: 'No', D: 'No' },
    },
    difficulty: 'Medium',
  },
  {
    id: 'q3',
    part: 'part2',
    domain: 'Decision Analysis',
    subtopic: 'CVP / Breakeven',
    scenario: 'Test scenario 3',
    questionText: 'What is breakeven units?',
    options: [
      { id: 'A', text: '10,000' },
      { id: 'B', text: '12,500' },
      { id: 'C', text: '15,000' },
      { id: 'D', text: '20,000' },
    ],
    correctOption: 'C',
    conciseHint: 'Fixed costs divided by contribution margin per unit.',
    explanation: {
      summary: 'Summary 3',
      conciseHint: 'Hint 3',
      steps: [{ stepTitle: 'Step 1', detail: 'CVP steps' }],
      distractorAnalysis: { A: 'No', B: 'No', C: 'Yes', D: 'No' },
    },
    difficulty: 'Hard',
  },
];

test('calculateCMAExamScore calculates perfect score as 500 scaled and passed', () => {
  const result = calculateCMAExamScore(
    { q1: 'B', q2: 'A', q3: 'C' },
    mockQuestions
  );
  assert.equal(result.score, 3);
  assert.equal(result.total, 3);
  assert.equal(result.accuracy, 100);
  assert.equal(result.scaledScore, 500);
  assert.equal(result.passed, true);
});

test('calculateCMAExamScore calculates zero score as 0 scaled and failed', () => {
  const result = calculateCMAExamScore(
    { q1: 'A', q2: 'B', q3: 'A' },
    mockQuestions
  );
  assert.equal(result.score, 0);
  assert.equal(result.accuracy, 0);
  assert.equal(result.scaledScore, 0);
  assert.equal(result.passed, false);
});

test('calculateCMAExamScore marks passing at or above 360 scaled', () => {
  // 2 out of 3 = 67% accuracy -> scaled score around ~342 (< 360)
  const result = calculateCMAExamScore(
    { q1: 'B', q2: 'A', q3: 'D' },
    mockQuestions
  );
  assert.equal(result.score, 2);
  assert.equal(result.passed, false);
});

test('isFreeLimitReached detects free trial boundary accurately', () => {
  assert.equal(isFreeLimitReached(false, 3, 5), false);
  assert.equal(isFreeLimitReached(false, 5, 5), true);
  assert.equal(isFreeLimitReached(false, 6, 5), true);
  // Premium users never hit limit
  assert.equal(isFreeLimitReached(true, 100, 5), false);
});

test('formatTimeRemaining formats seconds into HH:MM:SS or MM:SS', () => {
  assert.equal(formatTimeRemaining(75), '01:15');
  assert.equal(formatTimeRemaining(3665), '01:01:05');
  assert.equal(formatTimeRemaining(0), '00:00');
});

test('calculateSpeedEfficiency evaluates pace correctly', () => {
  // 108 seconds per question is optimal target
  const opt = calculateSpeedEfficiency(540, 5); // 108s each
  assert.equal(opt.avgSecondsPerQuestion, 108);
  assert.equal(opt.paceStatus, 'Optimal');

  // Slow pace (> 115s)
  const slow = calculateSpeedEfficiency(700, 5); // 140s each
  assert.equal(slow.paceStatus, 'Caution - Too Slow');

  // Fast pace (< 50s)
  const fast = calculateSpeedEfficiency(120, 3); // 40s each
  assert.equal(fast.paceStatus, 'Fast');
});

test('calculateDomainStats groups attempts by domain and sets status', () => {
  const attempts = [
    {
      id: 'att1',
      date: '2026-10-20',
      timestamp: Date.now(),
      title: 'Mock 1',
      part: 'part1' as const,
      mode: 'prometric-timed' as const,
      score: 2,
      total: 2,
      accuracy: 100,
      scaledScore: 500,
      passed: true,
      timeSpentSeconds: 200,
      answers: { q1: 'B' as const, q2: 'A' as const },
      questionIds: ['q1', 'q2'],
    },
  ];

  const stats = calculateDomainStats(mockQuestions, attempts);
  const costMgmt = stats.find((s) => s.domain === 'Cost Management');
  assert.ok(costMgmt);
  assert.equal(costMgmt.totalAnswered, 2);
  assert.equal(costMgmt.totalCorrect, 2);
  assert.equal(costMgmt.accuracy, 100);
  assert.equal(costMgmt.status, 'Mastered');
});

test('findUserDiscount matches email case-insensitively', () => {
  const discounts = [
    {
      id: 'd1',
      email: 'sarathyk2009@gmail.com',
      candidateName: 'Sarathy K',
      monthlyPrice: 349,
      discountType: 'percentage' as const,
      discountValue: 65,
      assignedByRole: 'admin' as const,
      assignedAt: '2026-10-24T00:00:00.000Z',
    },
  ];

  const matched = import('./scoring').then(({ findUserDiscount }) => {
    assert.ok(findUserDiscount('SarathyK2009@Gmail.com', discounts));
    assert.equal(findUserDiscount('sarathyk2009@gmail.com', discounts)?.monthlyPrice, 349);
    assert.equal(findUserDiscount('unknown@example.com', discounts), undefined);
  });
});

test('calculateEffectivePricing applies custom discount when present', async () => {
  const { calculateEffectivePricing } = await import('./scoring');
  const baseConfig = {
    monthlyRegularPrice: 999,
    monthlyOfferPrice: 499,
    sixMonthRegularPrice: 2999,
    sixMonthOfferPrice: 1499,
    discountPercent: 50,
    currencySymbol: 'Rs.',
  };

  const customDiscount = {
    id: 'd1',
    email: 'sarathyk2009@gmail.com',
    discountType: 'percentage' as const,
    discountValue: 65,
    monthlyPrice: 349,
    sixMonthPrice: 899,
    discountPercent: 65,
    assignedByRole: 'admin' as const,
    assignedAt: '2026-10-24T00:00:00.000Z',
  };

  const withCustom = calculateEffectivePricing(baseConfig, customDiscount);
  assert.equal(withCustom.monthly, 349);
  assert.equal(withCustom.sixMonth, 899);
  assert.equal(withCustom.percent, 65);
  assert.equal(withCustom.isCustom, true);

  const withoutCustom = calculateEffectivePricing(baseConfig, undefined);
  assert.equal(withoutCustom.monthly, 499);
  assert.equal(withoutCustom.sixMonth, 1499);
  assert.equal(withoutCustom.percent, 50);
  assert.equal(withoutCustom.isCustom, false);
});

test('shouldUnlock50PercentOffer triggers precisely on the 5th completed free question', async () => {
  const { shouldUnlock50PercentOffer } = await import('./scoring');
  assert.equal(shouldUnlock50PercentOffer(1), false);
  assert.equal(shouldUnlock50PercentOffer(4), false);
  assert.equal(shouldUnlock50PercentOffer(5), true);
  assert.equal(shouldUnlock50PercentOffer(6), false);
});

test('serializeQuestionForFirestore converts nested arrays in tableData.rows to objects without nested arrays', async () => {
  const { serializeQuestionForFirestore, deserializeQuestionFromFirestore } = await import('../services/questionService');
  
  const questionWithNestedArrays = {
    id: 'cma-p1-001',
    part: 'part1',
    domain: 'Cost Management',
    questionText: 'Test question stem',
    options: [{ id: 'A', text: 'Option A' }],
    correctOption: 'A',
    tableData: {
      title: 'Cost Table',
      headers: ['Item', 'Amount'],
      rows: [
        ['Direct Materials', '$35.00'],
        ['Direct Labor', '$25.00'],
      ],
    },
  };

  const serialized = serializeQuestionForFirestore(questionWithNestedArrays);
  
  // Verify that rows is NOT an array of arrays
  assert.ok(Array.isArray(serialized.tableData.rows));
  assert.equal(serialized.tableData.rows.length, 2);
  assert.equal(typeof serialized.tableData.rows[0], 'object');
  assert.ok(!Array.isArray(serialized.tableData.rows[0]), 'Firestore document row should not be a raw array');
  assert.deepEqual(serialized.tableData.rows[0], { cells: ['Direct Materials', '$35.00'] });

  // Verify round-trip deserialization restores original (string | number)[][]
  const deserialized = deserializeQuestionFromFirestore('cma-p1-001', serialized);
  assert.ok(deserialized.tableData);
  assert.deepEqual(deserialized.tableData?.rows, [
    ['Direct Materials', '$35.00'],
    ['Direct Labor', '$25.00'],
  ]);
});

