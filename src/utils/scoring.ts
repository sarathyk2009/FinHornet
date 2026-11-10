import { Question, DomainStats, ExamAttemptSummary } from '../types';

/**
 * Calculates CMA raw and scaled score (official CMA scaling: 0 - 500, passing score = 360).
 * Scaled score formula maps 0-100% to 0-500 with a slight psychometric curve aligned with IMA standards
 * (typically ~72% raw score corresponds to 360 passing scaled score).
 */
export function calculateCMAExamScore(
  userAnswers: Record<string, string>,
  questions: Question[]
): {
  score: number;
  total: number;
  accuracy: number;
  scaledScore: number;
  passed: boolean;
} {
  const total = questions.length;
  if (total === 0) {
    return { score: 0, total: 0, accuracy: 0, scaledScore: 0, passed: false };
  }

  let correctCount = 0;
  for (const q of questions) {
    if (userAnswers[q.id] === q.correctOption) {
      correctCount++;
    }
  }

  const accuracy = Math.round((correctCount / total) * 100);

  // Scaled score calculation:
  // Base raw accuracy %
  // 72% raw accuracy ~ 360 scaled score
  // Below 72%: 0% -> 100, 72% -> 360 (slope = (360 - 100)/72 = 3.61)
  // Above 72%: 72% -> 360, 100% -> 500 (slope = (500 - 360)/28 = 5.0)
  let scaledScore = 0;
  if (accuracy <= 0) {
    scaledScore = 0;
  } else if (accuracy <= 72) {
    scaledScore = Math.round(100 + (accuracy / 72) * 260);
  } else {
    scaledScore = Math.round(360 + ((accuracy - 72) / 28) * 140);
  }
  scaledScore = Math.min(500, Math.max(0, scaledScore));

  const passed = scaledScore >= 360;

  return {
    score: correctCount,
    total,
    accuracy,
    scaledScore,
    passed,
  };
}

/**
 * Calculates mastery per CMA Content Specification domain based on past attempts and questions
 */
export function calculateDomainStats(
  questions: Question[],
  attempts: ExamAttemptSummary[]
): DomainStats[] {
  const domainMap: Record<
    string,
    { part: Question['part']; totalAnswered: number; totalCorrect: number }
  > = {};

  // Initialize with all unique domains in questions
  for (const q of questions) {
    if (!domainMap[q.domain]) {
      domainMap[q.domain] = {
        part: q.part,
        totalAnswered: 0,
        totalCorrect: 0,
      };
    }
  }

  const questionById = new Map<string, Question>(questions.map((q) => [q.id, q]));

  for (const attempt of attempts) {
    for (const [qId, userAns] of Object.entries(attempt.answers)) {
      const q = questionById.get(qId);
      if (q) {
        if (!domainMap[q.domain]) {
          domainMap[q.domain] = {
            part: q.part,
            totalAnswered: 0,
            totalCorrect: 0,
          };
        }
        domainMap[q.domain].totalAnswered += 1;
        if (userAns === q.correctOption) {
          domainMap[q.domain].totalCorrect += 1;
        }
      }
    }
  }

  return Object.entries(domainMap).map(([domain, data]) => {
    const accuracy =
      data.totalAnswered > 0
        ? Math.round((data.totalCorrect / data.totalAnswered) * 100)
        : 0;

    let status: DomainStats['status'] = 'Needs Review';
    if (accuracy >= 80) status = 'Mastered';
    else if (accuracy >= 65) status = 'Proficient';

    return {
      domain,
      part: data.part,
      totalAnswered: data.totalAnswered,
      totalCorrect: data.totalCorrect,
      accuracy,
      status,
    };
  });
}

/**
 * Check if the user has reached the free trial limit
 */
export function isFreeLimitReached(
  isPremium: boolean,
  freeQuestionsUsed: number,
  limit: number = 5
): boolean {
  if (isPremium) return false;
  return freeQuestionsUsed >= limit;
}

/**
 * Format time in seconds to HH:MM:SS format
 */
export function formatTimeRemaining(seconds: number): string {
  const clamped = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(clamped / 3600);
  const mins = Math.floor((clamped % 3600) / 60);
  const secs = clamped % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

/**
 * Format average time per question and compute speed evaluation against Prometric target (1.8 min / 108 sec)
 */
export function calculateSpeedEfficiency(
  totalSeconds: number,
  questionCount: number
): {
  avgSecondsPerQuestion: number;
  formattedAvg: string;
  paceStatus: 'Optimal' | 'Caution - Too Slow' | 'Fast';
} {
  if (questionCount <= 0) {
    return {
      avgSecondsPerQuestion: 0,
      formattedAvg: '0s',
      paceStatus: 'Optimal',
    };
  }

  const avg = Math.round(totalSeconds / questionCount);
  const mins = Math.floor(avg / 60);
  const secs = avg % 60;
  const formattedAvg = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  // Real CMA exam allows 180 minutes for 100 MCQs = 1.8 mins = 108 seconds per question
  let paceStatus: 'Optimal' | 'Caution - Too Slow' | 'Fast' = 'Optimal';
  if (avg > 115) {
    paceStatus = 'Caution - Too Slow';
  } else if (avg < 50) {
    paceStatus = 'Fast';
  }

  return {
    avgSecondsPerQuestion: avg,
    formattedAvg,
    paceStatus,
  };
}

/**
 * Finds user-specific customized discount by matching email case-insensitively
 */
export function findUserDiscount(
  email: string,
  discounts: import('../types').UserDiscount[]
): import('../types').UserDiscount | undefined {
  if (!email || !discounts) return undefined;
  const cleanEmail = email.trim().toLowerCase();
  return discounts.find((d) => d.email.trim().toLowerCase() === cleanEmail);
}

/**
 * Computes effective prices applying custom discount if available
 */
export function calculateEffectivePricing(
  config: import('../types').PricingConfig,
  discount?: import('../types').UserDiscount
): { monthly: number; sixMonth: number; percent: number; isCustom: boolean } {
  if (discount) {
    let monthly = discount.monthlyPrice ?? config.monthlyOfferPrice;
    let sixMonth = discount.sixMonthPrice ?? config.sixMonthOfferPrice;
    let percent = discount.discountPercent ?? config.discountPercent;

    if (discount.monthlyPrice !== undefined && discount.sixMonthPrice !== undefined) {
      monthly = discount.monthlyPrice;
      sixMonth = discount.sixMonthPrice;
      percent = discount.discountPercent ?? discount.discountValue ?? percent;
    } else if (discount.discountType === 'flat') {
      monthly = Math.max(1, config.monthlyOfferPrice - discount.discountValue);
      sixMonth = Math.max(1, config.sixMonthOfferPrice - discount.discountValue);
      percent = Math.round(((config.monthlyRegularPrice - monthly) / config.monthlyRegularPrice) * 100);
    } else if (discount.discountType === 'percentage') {
      percent = discount.discountValue;
      monthly = Math.round(config.monthlyRegularPrice * (1 - percent / 100));
      sixMonth = Math.round(config.sixMonthRegularPrice * (1 - percent / 100));
    }

    return {
      monthly,
      sixMonth,
      percent,
      isCustom: true,
    };
  }
  return {
    monthly: config.monthlyOfferPrice,
    sixMonth: config.sixMonthOfferPrice,
    percent: config.discountPercent,
    isCustom: false,
  };
}

/**
 * Checks if completing a question crosses the 5 free questions milestone
 */
export function shouldUnlock50PercentOffer(currentCompleted: number): boolean {
  return currentCompleted === 5;
}
