export type CMAPart = 'part1' | 'part2';

export type ExamMode = 'prometric-timed' | 'practice-immediate' | 'quick-drill';

export interface QuestionOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface StepExplanation {
  stepTitle: string;
  detail: string;
  mathFormula?: string;
}

export interface QuestionExplanation {
  summary: string;
  conciseHint?: string;
  steps: StepExplanation[];
  distractorAnalysis: Record<'A' | 'B' | 'C' | 'D', string>;
}

export interface TableData {
  title?: string;
  headers: string[];
  rows: (string | number)[][];
}

export interface Question {
  id: string;
  part: CMAPart;
  domain: string;
  subtopic: string;
  scenario: string;
  questionText: string;
  tableData?: TableData;
  options: QuestionOption[];
  correctOption: 'A' | 'B' | 'C' | 'D';
  conciseHint: string;
  explanation: QuestionExplanation;
  difficulty: 'Medium' | 'Hard' | 'Exam Standard';
  isFreeTrialSample?: boolean;
}

export interface ExamSession {
  id: string;
  mode: ExamMode;
  part: CMAPart | 'both';
  title: string;
  timeAllowedSeconds: number;
  timeRemainingSeconds: number;
  questionIds: string[];
  userAnswers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  flaggedQuestionIds: string[];
  strikethroughs: Record<string, string[]>; // questionId -> array of option IDs e.g. ['B']
  notes: Record<string, string>;
  submitted: boolean;
  startedAt: number;
  completedAt?: number;
  score?: number; // correct count
  totalQuestions?: number;
  scaledScore?: number; // 0-500 CMA scaled score
  passed?: boolean; // scaledScore >= 360
}

export interface ExamAttemptSummary {
  id: string;
  date: string;
  timestamp: number;
  title: string;
  part: CMAPart | 'both';
  mode: ExamMode;
  score: number;
  total: number;
  accuracy: number;
  scaledScore: number;
  passed: boolean;
  timeSpentSeconds: number;
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  questionIds: string[];
}

export interface DomainStats {
  domain: string;
  part: CMAPart;
  totalAnswered: number;
  totalCorrect: number;
  accuracy: number;
  status: 'Mastered' | 'Proficient' | 'Needs Review';
}

export type UserRole = 'admin' | 'user';

export interface PricingConfig {
  monthlyRegularPrice: number;
  monthlyOfferPrice: number;
  sixMonthRegularPrice: number;
  sixMonthOfferPrice: number;
  discountPercent: number;
  currencySymbol: string;
}

export interface CouponCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  expirationDate: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  createdBy?: string;
}

export interface UserDiscount {
  id: string;
  email: string;
  candidateName?: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  monthlyPrice?: number;
  sixMonthPrice?: number;
  discountPercent?: number;
  note?: string;
  assignedByRole?: UserRole;
  assignedAt: string;
  assignedBy?: string;
}

export interface CaseExhibit {
  id: string;
  title: string;
  type: 'narrative' | 'financial_statement' | 'cost_sheet' | 'variance_table' | 'notes';
  content: string;
  tableData?: TableData;
}

export interface CaseStudyScenario {
  id: string;
  part: CMAPart;
  domain: string;
  subtopic: string;
  title: string;
  companyName: string;
  industry: string;
  scenarioBackground: string;
  exhibits: CaseExhibit[];
  questionIds: string[];
  difficulty: 'Medium' | 'Hard' | 'Exam Standard';
}

export type ThemePreference = 'system' | 'light' | 'dark';

export interface UserAccount {
  role: UserRole;
  name: string;
  candidateId: string;
  email: string;
  phone?: string;
  location: string;
  isPremium: boolean;
  hasActivePass?: boolean;
  freeQuestionsUsed: number;
  maxFreeQuestions: number;
  targetExamDate: string;
  targetExamWindow: string;
  selectedPart: CMAPart;
  dailyGoalQuestions: number;
  preparationTrack: string;
  streakDays: number;
  totalXp: number;
  isAuthenticated: boolean;
  isGuest: boolean;
  claimedOffer?: boolean;
  avatarInitials?: string;
  themePreference?: ThemePreference;
}

export interface ActiveQuestionContext {
  id: string;
  domain: string;
  subtopic?: string;
  scenario?: string;
  questionText: string;
  fullText: string;
  tableData?: TableData;
  options: Array<{ id: string; text: string }>;
  correctOption: 'A' | 'B' | 'C' | 'D' | string;
  correctAnswerText?: string;
  stepByStepExplanation: Array<{ stepTitle: string; detail: string; mathFormula?: string }>;
  explanationText: string;
  distractorAnalysis?: Record<string, string>;
  conciseHint?: string;
  userAnswer?: string;
}

