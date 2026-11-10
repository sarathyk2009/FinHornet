import React, { useState, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  ShieldAlert,
  Database,
  Check,
  Search,
  BookOpen,
  Sparkles,
  HelpCircle,
  Users,
  Settings,
  Layers,
  Save,
  RotateCcw,
  Tag,
  Mail,
  Percent,
  Info,
  Upload,
  FileText,
  FileCode,
  Download,
  AlertCircle,
  CheckCircle2,
  LogIn,
  RefreshCw,
  X,
  ExternalLink,
} from 'lucide-react';
import { Question, UserAccount, UserRole, PricingConfig, UserDiscount, CouponCode, CMAPart } from '../types';
import {
  parseCSVQuestions,
  parseJSONQuestions,
  seedInitialQuestionsToFirestore,
} from '../services/questionService';
import { ADMIN_EMAIL, signInWithGoogle } from '../services/firebase';
import { BlogPost } from '../services/blogService';
import { CallbackLead } from '../services/leadService';
import { AdminBlogManager } from './AdminBlogManager';
import { AdminLeadsManager } from './AdminLeadsManager';

interface Props {
  role: UserRole;
  questions: Question[];
  onAddQuestion: (q: Question) => Promise<void> | void;
  onUpdateQuestion: (q: Question) => Promise<void> | void;
  onDeleteQuestion: (qId: string) => Promise<void> | void;
  onBulkUploadQuestions?: (qs: Question[]) => Promise<void> | void;
  onRefreshFirestore?: () => Promise<void> | void;
  pricingConfig: PricingConfig;
  onUpdatePricing: (pricing: PricingConfig) => void;
  user: UserAccount;
  coupons?: CouponCode[];
  onAddCoupon?: (coupon: CouponCode) => Promise<void> | void;
  onToggleCoupon?: (id: string, active: boolean) => Promise<void> | void;
  onDeleteCoupon?: (id: string) => Promise<void> | void;
  userDiscounts: UserDiscount[];
  onAddUserDiscount: (discount: UserDiscount) => void;
  onDeleteUserDiscount: (id: string) => void;
  onResetTrial?: () => void;
  onToggleUserPremium?: () => void;
  onGoogleSignInSuccess?: (email: string, name: string) => void;
  onExitToDashboard?: () => void;
  isDark?: boolean;
  activeTab?: 'questions' | 'bulkupload' | 'discounts' | 'seeding' | 'blogs' | 'leads';
  onSelectTab?: (tab: 'questions' | 'bulkupload' | 'discounts' | 'seeding' | 'blogs' | 'leads') => void;
  blogs?: BlogPost[];
  onRefreshBlogs?: () => Promise<void> | void;
  leads?: CallbackLead[];
  onRefreshLeads?: () => Promise<void> | void;
}

export const AdminPortal: React.FC<Props> = ({
  role,
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onBulkUploadQuestions,
  onRefreshFirestore,
  pricingConfig,
  onUpdatePricing,
  user,
  coupons = [],
  onAddCoupon,
  onToggleCoupon,
  onDeleteCoupon,
  userDiscounts,
  onAddUserDiscount,
  onDeleteUserDiscount,
  onResetTrial,
  onToggleUserPremium,
  onGoogleSignInSuccess,
  onExitToDashboard,
  isDark = false,
  activeTab: controlledTab,
  onSelectTab,
  blogs = [],
  onRefreshBlogs = async () => {},
  leads = [],
  onRefreshLeads = async () => {},
}) => {
  // Enforce admin email authorization
  const isAdminAuthorized =
    Boolean(user.email) && user.email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const [internalTab, setInternalTab] = useState<'questions' | 'bulkupload' | 'discounts' | 'seeding' | 'blogs' | 'leads'>('questions');
  const activeTab = controlledTab || internalTab;
  const setActiveTab = (tab: 'questions' | 'bulkupload' | 'discounts' | 'seeding' | 'blogs' | 'leads') => {
    setInternalTab(tab);
    onSelectTab?.(tab);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  // Bulk Upload State
  const [bulkMode, setBulkMode] = useState<'csv' | 'json'>('csv');
  const [bulkRawText, setBulkRawText] = useState('');
  const [parsedPreviewQuestions, setParsedPreviewQuestions] = useState<Question[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Coupon Code Form State
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'flat'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState<number>(20);
  const [newCouponExpiry, setNewCouponExpiry] = useState('2026-12-31');
  const [newCouponLimit, setNewCouponLimit] = useState<string>('100');
  const [newCouponActive, setNewCouponActive] = useState(true);

  // User Discount form state
  const [discountEmail, setDiscountEmail] = useState('');
  const [discountCandidateName, setDiscountCandidateName] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(40);
  const [discountNote, setDiscountNote] = useState('');
  const [discountSearch, setDiscountSearch] = useState('');

  // Form state for creating / editing single question
  const [formPart, setFormPart] = useState<CMAPart>('part1');
  const [formDomain, setFormDomain] = useState('Cost Management');
  const [formSubtopic, setFormSubtopic] = useState('');
  const [formScenario, setFormScenario] = useState('');
  const [formQuestionText, setFormQuestionText] = useState('');
  const [formOptionA, setFormOptionA] = useState('');
  const [formOptionB, setFormOptionB] = useState('');
  const [formOptionC, setFormOptionC] = useState('');
  const [formOptionD, setFormOptionD] = useState('');
  const [formCorrectOption, setFormCorrectOption] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [formWhyAWrong, setFormWhyAWrong] = useState('');
  const [formWhyBWrong, setFormWhyBWrong] = useState('');
  const [formWhyCWrong, setFormWhyCWrong] = useState('');
  const [formWhyDWrong, setFormWhyDWrong] = useState('');
  const [formConciseHint, setFormConciseHint] = useState('');
  const [formStep1, setFormStep1] = useState('');
  const [formStep2, setFormStep2] = useState('');
  const [formFormula, setFormFormula] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formDifficulty, setFormDifficulty] = useState<'Medium' | 'Hard' | 'Exam Standard'>('Exam Standard');

  // Pricing edit state
  const [editablePricing, setEditablePricing] = useState<PricingConfig>(pricingConfig);

  const domainsList = [
    'External Financial Reporting Decisions',
    'Planning, Budgeting & Forecasting',
    'Performance Management',
    'Cost Management',
    'Internal Controls',
    'Technology & Analytics',
  ];

  const filteredQuestions = questions.filter((q) => {
    const matchesDomain = selectedDomain === 'all' || q.domain === selectedDomain;
    const matchesSearch =
      q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.scenario.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subtopic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleAdminGoogleSignIn = async () => {
    setIsBusy(true);
    try {
      const googleUser = await signInWithGoogle();
      if (googleUser && googleUser.email) {
        onGoogleSignInSuccess?.(googleUser.email, googleUser.displayName || 'Sarathy K');
        if (googleUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          showNotification(`Authenticated as Admin (${ADMIN_EMAIL}) successfully!`);
        } else {
          showNotification(
            `Signed in as ${googleUser.email}. Note: Only ${ADMIN_EMAIL} is granted administrator rights.`,
            'error'
          );
        }
      }
    } catch (err: any) {
      console.error('Admin Sign-In failed:', err);
      showNotification(err?.message || 'Google Sign-In failed', 'error');
    } finally {
      setIsBusy(false);
    }
  };

  // Open Create Question Modal
  const handleOpenCreate = () => {
    setEditingQuestion(null);
    setFormPart('part1');
    setFormDomain('Cost Management');
    setFormSubtopic('Variance Analysis & Standard Costing');
    setFormScenario('Acme Corp is evaluating direct materials standard variance for Year 2.');
    setFormQuestionText('What is Acme Corp’s direct materials price variance?');
    setFormOptionA('$12,000 Favorable');
    setFormOptionB('$12,000 Unfavorable');
    setFormOptionC('$8,500 Favorable');
    setFormOptionD('$6,000 Unfavorable');
    setFormCorrectOption('A');
    setFormWhyAWrong('Correct option. Actual price was $0.30 below standard price across 40,000 lbs.');
    setFormWhyBWrong('Incorrect. Reverses favorable and unfavorable variance designation.');
    setFormWhyCWrong('Incorrect. Erroneously used materials used rather than materials purchased.');
    setFormWhyDWrong('Incorrect. Omitted direct materials quantity multipliers.');
    setFormConciseHint('Direct materials price variance is calculated at the point of purchase: AQ × (SP - AP).');
    setFormStep1('Step 1: Identify Actual Quantity purchased and Standard Price.');
    setFormStep2('Step 2: Multiply AQ by difference between SP and AP.');
    setFormFormula('AQ × (SP - AP) = 40,000 × ($5.00 - $4.70) = $12,000 F');
    setFormSummary('Standard costing isolates price variances at purchase when invoices are recorded.');
    setFormDifficulty('Exam Standard');
    setIsCreatingNew(true);
  };

  // Open Edit Question Modal
  const handleOpenEdit = (q: Question) => {
    setEditingQuestion(q);
    setFormPart(q.part || 'part1');
    setFormDomain(q.domain);
    setFormSubtopic(q.subtopic);
    setFormScenario(q.scenario);
    setFormQuestionText(q.questionText);
    setFormOptionA(q.options.find((o) => o.id === 'A')?.text || '');
    setFormOptionB(q.options.find((o) => o.id === 'B')?.text || '');
    setFormOptionC(q.options.find((o) => o.id === 'C')?.text || '');
    setFormOptionD(q.options.find((o) => o.id === 'D')?.text || '');
    setFormCorrectOption(q.correctOption);
    setFormWhyAWrong(q.explanation?.distractorAnalysis?.A || '');
    setFormWhyBWrong(q.explanation?.distractorAnalysis?.B || '');
    setFormWhyCWrong(q.explanation?.distractorAnalysis?.C || '');
    setFormWhyDWrong(q.explanation?.distractorAnalysis?.D || '');
    setFormConciseHint(q.conciseHint || '');
    setFormStep1(q.explanation?.steps?.[0]?.detail || '');
    setFormStep2(q.explanation?.steps?.[1]?.detail || '');
    setFormFormula(q.explanation?.steps?.[0]?.mathFormula || '');
    setFormSummary(q.explanation?.summary || '');
    setFormDifficulty(q.difficulty);
    setIsCreatingNew(true);
  };

  // Save Single Question (Create or Edit)
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestionText.trim() || !formOptionA.trim() || !formOptionB.trim()) {
      showNotification('Question stem and at least options A and B are required.', 'error');
      return;
    }

    setIsBusy(true);
    const newQ: Question = {
      id: editingQuestion ? editingQuestion.id : `cma-${formPart}-${Date.now().toString(36)}`,
      part: formPart,
      domain: formDomain,
      subtopic: formSubtopic,
      scenario: formScenario,
      questionText: formQuestionText,
      options: [
        { id: 'A', text: formOptionA },
        { id: 'B', text: formOptionB },
        { id: 'C', text: formOptionC },
        { id: 'D', text: formOptionD },
      ],
      correctOption: formCorrectOption,
      conciseHint: formConciseHint,
      explanation: {
        summary: formSummary || 'Official standard solution.',
        conciseHint: formConciseHint,
        steps: [
          {
            stepTitle: 'Step 1: Variables & Accounting Principle',
            detail: formStep1 || 'Review standard formula.',
            mathFormula: formFormula,
          },
          ...(formStep2 ? [{ stepTitle: 'Step 2: Arithmetic Calculation', detail: formStep2 }] : []),
        ],
        distractorAnalysis: {
          A: formWhyAWrong || (formCorrectOption === 'A' ? 'Correct option.' : 'Incorrect distractor choice.'),
          B: formWhyBWrong || (formCorrectOption === 'B' ? 'Correct option.' : 'Incorrect distractor choice.'),
          C: formWhyCWrong || (formCorrectOption === 'C' ? 'Correct option.' : 'Incorrect distractor choice.'),
          D: formWhyDWrong || (formCorrectOption === 'D' ? 'Correct option.' : 'Incorrect distractor choice.'),
        },
      },
      difficulty: formDifficulty,
    };

    try {
      if (editingQuestion) {
        await onUpdateQuestion(newQ);
        showNotification(`Question "${newQ.id}" updated in Firestore!`);
      } else {
        await onAddQuestion(newQ);
        showNotification(`New question added to Firestore!`);
      }
      setIsCreatingNew(false);
      setEditingQuestion(null);
    } catch (err: any) {
      console.error('Error saving question:', err);
      showNotification(err?.message || 'Failed to save question to Firestore', 'error');
    } finally {
      setIsBusy(false);
    }
  };

  // Delete Question
  const handleDeleteConfirm = async (qId: string) => {
    setIsBusy(true);
    try {
      await onDeleteQuestion(qId);
      showNotification(`Question "${qId}" removed from Firestore.`);
      setIsDeletingId(null);
    } catch (err: any) {
      console.error('Error deleting question:', err);
      showNotification(err?.message || 'Failed to delete question from Firestore', 'error');
    } finally {
      setIsBusy(false);
    }
  };

  // Handle File Input for CSV / JSON Bulk Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setBulkRawText(text);
      processRawBulkText(text, file.name.endsWith('.json') ? 'json' : 'csv');
    };
    reader.readAsText(file);
  };

  // Process raw CSV or JSON text and preview questions
  const processRawBulkText = (text: string, mode: 'csv' | 'json' = bulkMode) => {
    setParseError(null);
    if (!text.trim()) {
      setParsedPreviewQuestions([]);
      return;
    }

    try {
      let parsed: Question[] = [];
      if (mode === 'csv') {
        parsed = parseCSVQuestions(text);
      } else {
        parsed = parseJSONQuestions(text);
      }

      if (parsed.length === 0) {
        setParseError('No valid questions found in data.');
      } else {
        setParsedPreviewQuestions(parsed);
      }
    } catch (err: any) {
      console.error('Parse error:', err);
      setParseError(err?.message || 'Failed to parse questions format.');
      setParsedPreviewQuestions([]);
    }
  };

  // Commit Parsed Questions to Firestore
  const handleCommitBulkUpload = async () => {
    if (parsedPreviewQuestions.length === 0) return;

    setIsBusy(true);
    try {
      if (onBulkUploadQuestions) {
        await onBulkUploadQuestions(parsedPreviewQuestions);
      } else {
        for (const q of parsedPreviewQuestions) {
          await onAddQuestion(q);
        }
      }
      showNotification(
        `Successfully uploaded ${parsedPreviewQuestions.length} questions to Cloud Firestore!`
      );
      setParsedPreviewQuestions([]);
      setBulkRawText('');
      setActiveTab('questions');
    } catch (err: any) {
      console.error('Bulk commit error:', err);
      showNotification(err?.message || 'Failed to bulk-upload questions to Firestore', 'error');
    } finally {
      setIsBusy(false);
    }
  };

  // Download Sample CSV
  const handleDownloadSampleCSV = () => {
    const sampleCSV =
      `part,domain,subtopic,scenario,questionText,optionA,optionB,optionC,optionD,correctOption,conciseHint,explanationSummary,difficulty\n` +
      `part1,Performance Management,Standard Costing,"Apex Corp produced 9,500 units and used 20,000 lbs purchased at $3.80/lb. Standard is 2 lbs at $4.00/lb.","What is Apex's Direct Material Quantity Variance?","$4,000 Favorable","$4,000 Unfavorable","$2,000 Unfavorable","$2,000 Favorable",B,"SQ must be based on actual output units produced.","SQ = 9,500 * 2 = 19,000 lbs. DMQV = (20,000 - 19,000) * $4.00 = $4,000 Unfavorable.",Exam Standard\n` +
      `part1,Cost Management,Absorption vs Variable,"Beta Company produces industrial pumps with Fixed MOH of $120,000. In Year 1, units produced exceeded units sold by 4,000 units.","How does Absorption Operating Income compare to Variable Operating Income?","Absorption is $48,000 higher","Variable is $48,000 higher","Both incomes are identical","Absorption is $12,000 lower",A,"When production exceeds sales, fixed overhead is deferred in inventory under absorption costing.","Absorption Income - Variable Income = Change in Inventory * FOH Rate.",Exam Standard`;

    const blob = new Blob([sampleCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'cma_questions_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Sample JSON
  const handleDownloadSampleJSON = () => {
    const sampleJSON = [
      {
        part: 'part1',
        domain: 'Performance Management',
        subtopic: 'Standard Costing',
        scenario: 'Apex Corp produced 9,500 units and used 20,000 lbs purchased at $3.80/lb.',
        questionText: "What is Apex's Direct Material Quantity Variance?",
        options: [
          { id: 'A', text: '$4,000 Favorable' },
          { id: 'B', text: '$4,000 Unfavorable' },
          { id: 'C', text: '$2,000 Unfavorable' },
          { id: 'D', text: '$2,000 Favorable' },
        ],
        correctOption: 'B',
        conciseHint: 'SQ must be based on actual output units produced.',
        explanation: {
          summary:
            'Standard Quantity Allowed SQ = 9,500 * 2 = 19,000 lbs. DMQV = (20,000 - 19,000) * $4 = $4,000 Unfavorable.',
          steps: [
            {
              stepTitle: 'Step 1: Calculate Standard Quantity Allowed',
              detail: 'SQ = 9,500 units * 2 lbs = 19,000 lbs',
              mathFormula: '9,500 * 2 = 19,000 lbs',
            },
            {
              stepTitle: 'Step 2: Calculate Quantity Variance',
              detail: 'DMQV = (AQ - SQ) * SP = (20,000 - 19,000) * $4.00 = $4,000 U',
              mathFormula: '(20,000 - 19,000) * $4.00 = $4,000 U',
            },
          ],
          distractorAnalysis: {
            A: 'Reverses favorable/unfavorable notation.',
            B: 'Correct calculation.',
            C: 'Multiplies by price variance difference.',
            D: 'Incorrect standard allowed substitution.',
          },
        },
        difficulty: 'Exam Standard',
      },
    ];

    const blob = new Blob([JSON.stringify(sampleJSON, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'cma_questions_sample.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Seed Initial Curated Question Bank
  const handleSeedDatabase = async () => {
    if (
      !window.confirm(
        'Seed the curated CMA Part 1 question bank to Firestore? This will sync all standard exam questions to the "questions" collection.'
      )
    ) {
      return;
    }
    setIsBusy(true);
    try {
      const count = await seedInitialQuestionsToFirestore();
      if (onRefreshFirestore) await onRefreshFirestore();
      showNotification(`Successfully seeded ${count} questions directly into Cloud Firestore!`);
    } catch (err: any) {
      console.error('Seeding error:', err);
      showNotification(err?.message || 'Failed to seed database', 'error');
    } finally {
      setIsBusy(false);
    }
  };

  // Coupon Code Creator Handler
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = newCouponCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (!cleanCode) {
      showNotification('Please enter a valid coupon code name (e.g. SAVE20).', 'error');
      return;
    }
    if (newCouponValue <= 0) {
      showNotification('Discount value must be greater than 0.', 'error');
      return;
    }

    const coupon: CouponCode = {
      id: `coupon-${cleanCode.toLowerCase()}-${Date.now().toString(36)}`,
      code: cleanCode,
      discountType: newCouponType,
      discountValue: Number(newCouponValue),
      expirationDate: newCouponExpiry || '2026-12-31',
      usageLimit: newCouponLimit ? Number(newCouponLimit) : undefined,
      usageCount: 0,
      isActive: newCouponActive,
      createdAt: new Date().toISOString(),
      createdBy: user.email,
    };

    try {
      if (onAddCoupon) {
        await onAddCoupon(coupon);
      }
      showNotification(`Coupon code "${cleanCode}" created & saved to Firestore!`);
      setNewCouponCode('');
      setNewCouponValue(20);
    } catch (err: any) {
      showNotification(err?.message || 'Failed to save coupon code', 'error');
    }
  };

  // User Email Discount Handler
  const handleCreateUserDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountEmail || !discountEmail.includes('@')) {
      showNotification('Please enter a valid candidate email address.', 'error');
      return;
    }
    if (discountValue <= 0) {
      showNotification('Discount value must be greater than 0.', 'error');
      return;
    }

    const cleanEmail = discountEmail.trim().toLowerCase();

    // Calculate approximate monthly & six month prices if percentage
    let calculatedMonthly = pricingConfig.monthlyOfferPrice;
    let calculatedSixMonth = pricingConfig.sixMonthOfferPrice;
    if (discountType === 'percentage') {
      calculatedMonthly = Math.round(pricingConfig.monthlyRegularPrice * (1 - discountValue / 100));
      calculatedSixMonth = Math.round(pricingConfig.sixMonthRegularPrice * (1 - discountValue / 100));
    } else {
      calculatedMonthly = Math.max(1, pricingConfig.monthlyOfferPrice - discountValue);
      calculatedSixMonth = Math.max(1, pricingConfig.sixMonthOfferPrice - discountValue);
    }

    const newDiscount: UserDiscount = {
      id: `disc-${cleanEmail.replace(/[^a-z0-9]/g, '')}-${Date.now().toString(36)}`,
      email: cleanEmail,
      candidateName: discountCandidateName.trim() || undefined,
      discountType: discountType,
      discountValue: Number(discountValue),
      monthlyPrice: calculatedMonthly,
      sixMonthPrice: calculatedSixMonth,
      discountPercent: discountType === 'percentage' ? Number(discountValue) : undefined,
      note: discountNote.trim() || undefined,
      assignedByRole: 'admin',
      assignedAt: new Date().toISOString(),
      assignedBy: user.email,
    };

    try {
      await onAddUserDiscount(newDiscount);
      showNotification(
        `Assigned ${discountType === 'percentage' ? `${discountValue}% OFF` : `Rs. ${discountValue} OFF`} to ${cleanEmail}!`
      );
      setDiscountEmail('');
      setDiscountCandidateName('');
      setDiscountNote('');
    } catch (err: any) {
      showNotification(err?.message || 'Failed to assign email discount', 'error');
    }
  };

  // Save Pricing Configuration
  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePricing(editablePricing);
    showNotification('Pricing configuration saved successfully!');
  };

  // =========================================================================
  // PROTECTED ROUTE GATE: IF NOT ADMIN EMAIL, SHOW AUTHENTICATION CARD
  // =========================================================================
  if (!isAdminAuthorized) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 sm:px-6">
        <div
          className="p-8 rounded-3xl border shadow-xl text-center space-y-6 relative overflow-hidden"
          style={{
            backgroundColor: isDark ? '#0b1120' : '#ffffff',
            borderColor: isDark ? '#1e293b' : '#e2e8f0',
          }}
        >
          {/* Top Lock Badge */}
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto ring-1 ring-amber-500/30">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300/40">
              Protected Admin Route (/admin)
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Administrator Access Required
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
              Managing exam questions, adding/editing items, deleting, and bulk-uploading via CSV/JSON is strictly
              restricted to the authorized administrator address:
            </p>
            <div className="inline-block p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300/60 dark:border-amber-700/60 font-mono text-xs font-bold text-amber-900 dark:text-amber-200">
              {ADMIN_EMAIL}
            </div>
          </div>

          {/* Current State Info */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            Current session:{' '}
            <strong className="text-slate-900 dark:text-slate-100">
              {user.email ? user.email : 'Guest (Not Signed In)'}
            </strong>
          </div>

          {/* Sign In Button with Google */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleAdminGoogleSignIn}
              disabled={isBusy}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-md flex items-center justify-center gap-2.5 transition-all duration-150 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <LogIn className="w-4 h-4 text-slate-950" />
              <span>{isBusy ? 'Signing in...' : `Sign In with Google as ${ADMIN_EMAIL}`}</span>
            </button>

            {onExitToDashboard && (
              <button
                onClick={onExitToDashboard}
                className="w-full py-2.5 px-4 rounded-xl font-medium text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Return to Candidate Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // AUTHORIZED ADMIN VIEW: FULL DASHBOARD FOR sarathyk2009@gmail.com
  // =========================================================================
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-4 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
              : 'bg-rose-50 dark:bg-rose-950/90 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-700'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Top Header Banner */}
      <div
        className="p-5 sm:p-7 rounded-3xl border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full max-w-full box-border"
        style={{
          backgroundColor: isDark ? '#0b1120' : '#ffffff',
          borderColor: isDark ? '#1e293b' : '#e2e8f0',
        }}
      >
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>FinHornet Admin</span>
            </span>
            <span className="text-xs text-slate-500 font-mono flex items-center gap-1 break-all">
              Verified Administrator: <strong className="text-amber-600 dark:text-amber-400">{user.email}</strong>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight break-words">
            Question Bank & System Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed break-words">
            Live integration with Cloud Firestore (`questions` collection). Add, edit, delete individual items, or
            bulk-upload exam questions via CSV / JSON with instant schema validation.
          </p>
        </div>

        {/* Firestore Live Status Badge */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-mono font-bold flex items-center gap-2 shadow-2xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Firestore: Connected ({questions.length} Items)</span>
          </div>

          {onRefreshFirestore && (
            <button
              onClick={() => onRefreshFirestore()}
              disabled={isBusy}
              title="Refresh Question Bank from Firestore"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isBusy ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>


      {/* =========================================================================
          TAB 1: QUESTIONS MANAGEMENT (VIEW, ADD, EDIT, DELETE)
         ========================================================================= */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          {/* Controls Bar: Search, Domain Filter, Add Button */}
          <div
            className="p-4 sm:p-5 rounded-2xl border shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
            style={{
              backgroundColor: isDark ? '#0b1120' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
          >
            <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2 min-w-0">
              <div className="relative flex-1 min-w-0 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search questions by formula, stem, or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full sm:w-auto min-w-0 max-w-full sm:max-w-[240px] md:max-w-[280px] truncate px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-400 cursor-pointer shrink-0"
              >
                <option value="all">All Domains ({questions.length})</option>
                {domainsList.map((d) => (
                  <option key={d} value={d}>
                    {d} ({questions.filter((q) => q.domain === d).length})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('bulkupload')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Bulk Upload</span>
              </button>

              <button
                onClick={handleOpenCreate}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Single Question</span>
              </button>
            </div>
          </div>

          {/* Questions Grid List */}
          <div className="grid grid-cols-1 gap-3.5">
            {filteredQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="p-5 rounded-2xl border shadow-xs hover:border-amber-400/50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                style={{
                  backgroundColor: isDark ? '#0b1120' : '#ffffff',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                }}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      #{idx + 1} • {q.id}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                      {q.domain}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      Answer: Option {q.correctOption}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-snug">
                    {q.questionText}
                  </h3>

                  {q.scenario && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {q.scenario}
                    </p>
                  )}

                  {/* Options Pill Preview */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                    {q.options.map((opt) => (
                      <div
                        key={opt.id}
                        className={`px-2.5 py-1 rounded-lg border truncate ${
                          opt.id === q.correctOption
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-bold'
                            : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <strong>{opt.id})</strong> {opt.text}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Question Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleOpenEdit(q)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors text-xs flex items-center gap-1 font-bold"
                    title="Edit question in Firestore"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setIsDeletingId(q.id)}
                    className="p-2 rounded-xl border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors text-xs flex items-center gap-1 font-bold"
                    title="Delete question from Firestore"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}

            {filteredQuestions.length === 0 && (
              <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-500">
                <Database className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="font-bold text-sm">No questions matched your search query.</p>
                <p className="text-xs mt-1">Try another keyword or click "Add Single Question" above.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: BULK UPLOAD QUESTIONS (CSV / JSON)
         ========================================================================= */}
      {activeTab === 'bulkupload' && (
        <div className="space-y-6">
          <div
            className="p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6"
            style={{
              backgroundColor: isDark ? '#0b1120' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
                  Bulk Upload Questions to Cloud Firestore
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Import multiple questions at once from a CSV spreadsheet or JSON file.
                </p>
              </div>

              {/* Sample Download Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadSampleCSV}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample CSV</span>
                </button>

                <button
                  onClick={handleDownloadSampleJSON}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample JSON</span>
                </button>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setBulkMode('csv');
                  processRawBulkText(bulkRawText, 'csv');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                  bulkMode === 'csv'
                    ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>CSV Spreadsheet Format</span>
              </button>

              <button
                onClick={() => {
                  setBulkMode('json');
                  processRawBulkText(bulkRawText, 'json');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                  bulkMode === 'json'
                    ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>JSON Array Format</span>
              </button>
            </div>

            {/* File Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 border-2 border-dashed border-amber-400/50 hover:border-amber-400 rounded-3xl bg-amber-50/20 dark:bg-amber-950/10 cursor-pointer text-center space-y-2 transition-colors"
            >
              <Upload className="w-8 h-8 text-amber-500 mx-auto" />
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                Click to browse or drop your {bulkMode.toUpperCase()} file here
              </div>
              <p className="text-[11px] text-slate-500">
                Supports .csv or .json files with section, stem, options, correct answer, and explanations.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept={bulkMode === 'csv' ? '.csv,text/csv' : '.json,application/json'}
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Paste Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Or Paste {bulkMode.toUpperCase()} Text Directly:
              </label>
              <textarea
                rows={6}
                value={bulkRawText}
                onChange={(e) => {
                  setBulkRawText(e.target.value);
                  processRawBulkText(e.target.value, bulkMode);
                }}
                placeholder={
                  bulkMode === 'csv'
                    ? 'part,domain,subtopic,scenario,questionText,optionA,optionB,optionC,optionD,correctOption,conciseHint,explanationSummary\npart1,Cost Management,Variances,Acme Corp...,What is DMPV?,$4000 F,$4000 U,$2000 U,$2000 F,B,Formula hint,Step explanation'
                    : '[\n  {\n    "questionText": "What is DMPV?",\n    "options": [{"id":"A","text":"$4000 F"},{"id":"B","text":"$4000 U"}],\n    "correctOption": "B",\n    "explanation": "Official explanation"\n  }\n]'
                }
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {/* Parse Error Display */}
            {parseError && (
              <div className="p-4 rounded-xl border bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Format Parsing Issue:</div>
                  <div className="font-mono mt-0.5">{parseError}</div>
                </div>
              </div>
            )}

            {/* Parsed Preview Table */}
            {parsedPreviewQuestions.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      Successfully Parsed: {parsedPreviewQuestions.length} Questions
                    </span>
                  </div>

                  <button
                    onClick={handleCommitBulkUpload}
                    disabled={isBusy}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-2 transition-all hover:scale-102"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Commit {parsedPreviewQuestions.length} Questions to Firestore</span>
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
                  <table className="w-full text-left divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300">
                      <tr>
                        <th className="p-2.5 font-bold">#</th>
                        <th className="p-2.5 font-bold">Domain</th>
                        <th className="p-2.5 font-bold">Question Stem</th>
                        <th className="p-2.5 font-bold">Options</th>
                        <th className="p-2.5 font-bold">Correct</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {parsedPreviewQuestions.slice(0, 10).map((pq, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                          <td className="p-2.5 font-mono text-[10px]">{idx + 1}</td>
                          <td className="p-2.5 font-medium">{pq.domain}</td>
                          <td className="p-2.5 max-w-xs truncate">{pq.questionText}</td>
                          <td className="p-2.5 text-[10px] font-mono">{pq.options.length} options</td>
                          <td className="p-2.5 font-bold text-emerald-600">{pq.correctOption}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedPreviewQuestions.length > 10 && (
                    <div className="p-2 text-center text-slate-400 text-[11px] bg-slate-50 dark:bg-slate-900/50">
                      Showing first 10 of {parsedPreviewQuestions.length} questions...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: SYNC & SEED DATABASE
         ========================================================================= */}
      {activeTab === 'seeding' && (
        <div
          className="p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6"
          style={{
            backgroundColor: isDark ? '#0b1120' : '#ffffff',
            borderColor: isDark ? '#1e293b' : '#e2e8f0',
          }}
        >
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
              Cloud Firestore Seeding & Synchronization
            </h2>
            <p className="text-xs text-slate-500">
              Ensure candidate mock exams and case questions are fully populated in Firestore.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-amber-300/40 bg-amber-50/30 dark:bg-amber-950/20 space-y-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Seed Curated CMA Part 1 Question Bank
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Sync all standard CMA questions (Cost Management, Variance Analysis, Leases ASC 842, Revenue ASC 606,
                and Flexible Budgets) directly to your active Firestore database.
              </p>
              <button
                onClick={handleSeedDatabase}
                disabled={isBusy}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-2 shadow-xs transition-colors"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isBusy ? 'animate-spin' : ''}`} />
                <span>Sync / Seed All Questions to Firestore</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 space-y-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Live Client Refresh
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Force a fresh fetch from Firestore so all candidate mock test sessions and practice drills reflect
                the latest edits immediately.
              </p>
              <button
                onClick={async () => {
                  if (onRefreshFirestore) await onRefreshFirestore();
                  showNotification('Refreshed questions from Firestore!');
                }}
                disabled={isBusy}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-2 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isBusy ? 'animate-spin' : ''}`} />
                <span>Fetch Latest Questions from Firestore</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: DISCOUNTS & COUPON CODE MANAGER
         ========================================================================= */}
      {activeTab === 'discounts' && (
        <div className="space-y-8">
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-6 rounded-3xl border shadow-sm bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border-amber-300/30">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider mb-1 shadow-2xs">
                <Tag className="w-3 h-3 text-slate-950" />
                <span>Admin Revenue & Concessions</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
                Discounts & Coupon Code Manager
              </h2>
              <p className="text-xs text-slate-500 max-w-xl">
                Create promotional promo codes (e.g. SAVE20) with usage limits & expiration dates, or assign direct
                rate cuts to specific student email addresses that auto-apply on checkout.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs">
                <span className="text-slate-400 block text-[10px] uppercase">Active Coupons</span>
                <span className="font-black text-amber-600 dark:text-amber-400 text-sm">
                  {coupons.filter((c) => c.isActive).length} / {coupons.length}
                </span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs">
                <span className="text-slate-400 block text-[10px] uppercase">Candidate Waivers</span>
                <span className="font-black text-blue-600 dark:text-blue-400 text-sm">{userDiscounts.length} Assigned</span>
              </div>
            </div>
          </div>

          {/* Section 1: Promo / Coupon Codes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  Promo & Coupon Codes
                </h3>
                <p className="text-xs text-slate-500">
                  Students can enter these at checkout to redeem percentage or flat discounts.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Create Promo Code Form */}
              <div
                className="p-6 rounded-3xl border shadow-sm space-y-4"
                style={{
                  backgroundColor: isDark ? '#0b1120' : '#ffffff',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                }}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Create New Promo Code
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase">
                    Firestore Sync
                  </span>
                </div>

                <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-500 mb-1">Coupon Code Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SAVE20, CMA50"
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono font-black text-sm tracking-wider uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-500 mb-1">Discount Type</label>
                      <select
                        value={newCouponType}
                        onChange={(e) => setNewCouponType(e.target.value as 'percentage' | 'flat')}
                        className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="flat">Flat Amount (Rs.)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 mb-1">
                        Value ({newCouponType === 'percentage' ? '%' : 'Rs.'}) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={newCouponType === 'percentage' ? 100 : 5000}
                        required
                        value={newCouponValue}
                        onChange={(e) => setNewCouponValue(Number(e.target.value))}
                        className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-500 mb-1">Expiration Date</label>
                      <input
                        type="date"
                        required
                        value={newCouponExpiry}
                        onChange={(e) => setNewCouponExpiry(e.target.value)}
                        className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 mb-1">Usage Limit</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 100 (Blank = unlimited)"
                        value={newCouponLimit}
                        onChange={(e) => setNewCouponLimit(e.target.value)}
                        className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="couponActiveCheckbox"
                      checked={newCouponActive}
                      onChange={(e) => setNewCouponActive(e.target.checked)}
                      className="rounded border-slate-300 text-amber-500 focus:ring-amber-400 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="couponActiveCheckbox" className="text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                      Activate immediately upon creation
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs flex items-center justify-center gap-2 transition-all mt-3"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create & Save Coupon</span>
                  </button>
                </form>
              </div>

              {/* Coupon Codes Table / List */}
              <div
                className="lg:col-span-2 p-6 rounded-3xl border shadow-sm space-y-4"
                style={{
                  backgroundColor: isDark ? '#0b1120' : '#ffffff',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                }}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Existing Coupon Codes ({coupons.length})
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Updated live in Firestore
                  </span>
                </div>

                {coupons.length === 0 ? (
                  <div className="p-8 text-center border border-dashed rounded-2xl border-slate-300 dark:border-slate-800 text-slate-400 text-xs">
                    No promo codes created yet. Use the form on the left to add one!
                  </div>
                ) : (
                  <div className="space-y-2.5 overflow-x-auto">
                    {coupons.map((c) => (
                      <div
                        key={c.id}
                        className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                          c.isActive
                            ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
                            : 'bg-slate-100/60 dark:bg-slate-900/20 border-slate-200/60 dark:border-slate-800/60 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="px-2.5 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700/80 font-mono font-black text-xs text-amber-900 dark:text-amber-200 tracking-wider">
                            {c.code}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                                {c.discountType === 'percentage'
                                  ? `${c.discountValue}% OFF`
                                  : `Rs. ${c.discountValue} OFF`}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  c.isActive
                                    ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {c.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                              Expires: {c.expirationDate} • Used: {c.usageCount}
                              {c.usageLimit ? ` / ${c.usageLimit} max` : ' (Unlimited)'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {onToggleCoupon && (
                            <button
                              type="button"
                              onClick={() => onToggleCoupon(c.id, !c.isActive)}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                                c.isActive
                                  ? 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                                  : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                              }`}
                              title={c.isActive ? 'Deactivate promo code' : 'Activate promo code'}
                            >
                              {c.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          )}

                          {onDeleteCoupon && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete coupon code ${c.code}?`)) {
                                  onDeleteCoupon(c.id);
                                }
                              }}
                              className="p-1.5 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                              title="Delete coupon"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Email-Specific Candidate Discounts */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  Email-Specific Candidate Discounts
                </h3>
                <p className="text-xs text-slate-500">
                  When a candidate with this exact email signs in or checks out, their discount automatically applies.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Assign Email Discount Form */}
              <div
                className="p-6 rounded-3xl border shadow-sm space-y-4"
                style={{
                  backgroundColor: isDark ? '#0b1120' : '#ffffff',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                }}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Assign Direct Email Discount
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">
                    Auto-Applied
                  </span>
                </div>

                <form onSubmit={handleCreateUserDiscount} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-500 mb-1">Candidate Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="student@example.com"
                      value={discountEmail}
                      onChange={(e) => setDiscountEmail(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">Candidate Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={discountCandidateName}
                      onChange={(e) => setDiscountCandidateName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-500 mb-1">Discount Type</label>
                      <select
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'flat')}
                        className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="flat">Flat Amount (Rs.)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 mb-1">
                        Amount ({discountType === 'percentage' ? '%' : 'Rs.'}) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={discountType === 'percentage' ? 100 : 5000}
                        required
                        value={discountValue}
                        onChange={(e) => setDiscountValue(Number(e.target.value))}
                        className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">Internal Note / Reason</label>
                    <input
                      type="text"
                      placeholder="e.g. Merit scholar, College partnership, Early VIP"
                      value={discountNote}
                      onChange={(e) => setDiscountNote(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs flex items-center justify-center gap-2 transition-all mt-3"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Assign Email Discount</span>
                  </button>
                </form>
              </div>

              {/* Email Discounts Table / List */}
              <div
                className="lg:col-span-2 p-6 rounded-3xl border shadow-sm space-y-4"
                style={{
                  backgroundColor: isDark ? '#0b1120' : '#ffffff',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                }}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Active Email Waivers ({userDiscounts.length})
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Auto-applied at checkout
                  </span>
                </div>

                {userDiscounts.length === 0 ? (
                  <div className="p-8 text-center border border-dashed rounded-2xl border-slate-300 dark:border-slate-800 text-slate-400 text-xs">
                    No direct email discounts assigned yet.
                  </div>
                ) : (
                  <div className="space-y-2.5 overflow-x-auto">
                    {userDiscounts.map((d) => (
                      <div
                        key={d.id}
                        className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                              {d.email}
                            </span>
                            {d.candidateName && (
                              <span className="text-[11px] text-slate-500">
                                ({d.candidateName})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {d.discountType === 'percentage' || d.discountPercent
                                ? `${d.discountValue || d.discountPercent}% OFF`
                                : `Rs. ${d.discountValue} OFF`}
                            </span>
                            {d.note && (
                              <span className="text-slate-500 italic">
                                • "{d.note}"
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Remove discount for ${d.email}?`)) {
                              onDeleteUserDiscount(d.id);
                            }
                          }}
                          className="p-1.5 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          title="Delete waiver"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: MANAGE BLOGS & STUDY GUIDES
         ========================================================================= */}
      {activeTab === 'blogs' && (
        <AdminBlogManager
          blogs={blogs}
          onRefreshBlogs={onRefreshBlogs}
          isDark={isDark}
        />
      )}

      {/* =========================================================================
          TAB 6: CALLBACK REQUEST LEADS
         ========================================================================= */}
      {activeTab === 'leads' && (
        <AdminLeadsManager
          leads={leads}
          onRefreshLeads={onRefreshLeads}
          isDark={isDark}
        />
      )}


      {/* =========================================================================
          MODAL: ADD / EDIT QUESTION (SINGLE ITEM)
         ========================================================================= */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden my-8"
            style={{
              backgroundColor: isDark ? '#0b1120' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
          >
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-500" />
                <span>{editingQuestion ? 'Edit Exam Question' : 'Add New Exam Question'}</span>
              </h3>
              <button
                onClick={() => setIsCreatingNew(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">CMA Exam Part *</label>
                  <select
                    value={formPart}
                    onChange={(e) => setFormPart(e.target.value as CMAPart)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  >
                    <option value="part1">US CMA Part 1 (Financial Planning & Performance)</option>
                    <option value="part2">US CMA Part 2 (Strategic Financial Management)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Domain / Section *</label>
                  <select
                    value={formDomain}
                    onChange={(e) => setFormDomain(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  >
                    {domainsList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Subtopic / Keyword</label>
                <input
                  type="text"
                  placeholder="e.g. Standard Costing - DMPV"
                  value={formSubtopic}
                  onChange={(e) => setFormSubtopic(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Scenario Background (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Company financial context, budget data, or narrative..."
                  value={formScenario}
                  onChange={(e) => setFormScenario(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Question Stem (The Question Text) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. What is the company's direct material quantity variance?"
                  value={formQuestionText}
                  onChange={(e) => setFormQuestionText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              {/* Four Options */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">Option A *</label>
                  <input
                    type="text"
                    required
                    value={formOptionA}
                    onChange={(e) => setFormOptionA(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Option B *</label>
                  <input
                    type="text"
                    required
                    value={formOptionB}
                    onChange={(e) => setFormOptionB(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Option C *</label>
                  <input
                    type="text"
                    required
                    value={formOptionC}
                    onChange={(e) => setFormOptionC(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Option D *</label>
                  <input
                    type="text"
                    required
                    value={formOptionD}
                    onChange={(e) => setFormOptionD(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Correct Option Selector */}
              <div>
                <label className="block text-slate-500 mb-1">Correct Answer *</label>
                <div className="flex items-center gap-3">
                  {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                    <label
                      key={opt}
                      className={`flex-1 p-2 rounded-xl border text-center font-bold cursor-pointer transition-colors ${
                        formCorrectOption === opt
                          ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-2xs'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="correctOpt"
                        checked={formCorrectOption === opt}
                        onChange={() => setFormCorrectOption(opt)}
                        className="hidden"
                      />
                      Option {opt}
                    </label>
                  ))}
                </div>
              </div>

              {/* Step by step and summary */}
              <div>
                <label className="block text-slate-500 mb-1">Step-by-Step Explanation & Math Solution</label>
                <textarea
                  rows={3}
                  placeholder="Show standard formula substitution and intermediate steps..."
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Concise Key Rule / Hint</label>
                <input
                  type="text"
                  placeholder="e.g. Standard quantity must be based on actual units produced."
                  value={formConciseHint}
                  onChange={(e) => setFormConciseHint(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBusy}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs"
                >
                  {isBusy ? 'Saving...' : editingQuestion ? 'Update in Firestore' : 'Save to Firestore'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: DELETE CONFIRMATION
         ========================================================================= */}
      {isDeletingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="w-full max-w-sm rounded-3xl border shadow-2xl p-6 text-center space-y-4"
            style={{
              backgroundColor: isDark ? '#0b1120' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
          >
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Delete Question?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete question{' '}
                <strong className="font-mono text-slate-700 dark:text-slate-300">{isDeletingId}</strong> from
                Firestore?
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsDeletingId(null)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirm(isDeletingId)}
                disabled={isBusy}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isBusy ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
