import { Question, ActiveQuestionContext } from '../types';

/**
 * Builds a structured, complete active question context object
 * containing the full text, options, correct answer, and step-by-step explanation
 * to pass as hidden context to the Gemini API tutor.
 */
export function buildQuestionContext(
  q: Question | null | undefined,
  userAnswer?: string
): ActiveQuestionContext | null {
  if (!q) return null;

  const fullText = [q.scenario, q.questionText].filter(Boolean).join('\n\n') || q.questionText;

  const correctOptionObj = q.options?.find((opt) => opt.id === q.correctOption);
  const correctAnswerText = correctOptionObj
    ? `Option ${correctOptionObj.id} - ${correctOptionObj.text}`
    : `Option ${q.correctOption}`;

  const steps = q.explanation?.steps || [];
  const explanationSummary = q.explanation?.summary || '';
  const explanationTextParts: string[] = [];

  if (explanationSummary) {
    explanationTextParts.push(`Summary: ${explanationSummary}`);
  }

  if (steps.length > 0) {
    explanationTextParts.push('Step-by-step math and reasoning:');
    steps.forEach((step, idx) => {
      explanationTextParts.push(
        `Step ${idx + 1} [${step.stepTitle}]: ${step.detail}${
          step.mathFormula ? ` (Formula / Math: ${step.mathFormula})` : ''
        }`
      );
    });
  }

  if (q.conciseHint) {
    explanationTextParts.push(`Key Concept Hint: ${q.conciseHint}`);
  }

  const explanationText = explanationTextParts.join('\n');

  return {
    id: q.id,
    domain: q.domain,
    subtopic: q.subtopic,
    scenario: q.scenario,
    questionText: q.questionText,
    fullText,
    tableData: q.tableData,
    options: (q.options || []).map((o) => ({ id: o.id, text: o.text })),
    correctOption: q.correctOption,
    correctAnswerText,
    stepByStepExplanation: steps,
    explanationText,
    distractorAnalysis: q.explanation?.distractorAnalysis,
    conciseHint: q.conciseHint,
    userAnswer,
  };
}
