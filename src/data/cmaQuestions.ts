import { Question } from '../types';

export const CMA_QUESTIONS: Question[] = [
  // --- FREE TRIAL QUESTIONS (1 to 5) ---
  {
    id: 'cma-p1-001',
    part: 'part1',
    domain: 'Cost Management',
    subtopic: 'Absorption vs. Variable Costing',
    scenario:
      'Apex Manufacturing produces specialized titanium valves. During its first year of operations, Apex produced 50,000 valves and sold 40,000 valves at a selling price of $120 each. There was no beginning inventory. Cost data for the year were as follows:',
    questionText:
      'Under US GAAP (Absorption Costing), what is Apex Manufacturing’s operating income for the year, and by what amount does it exceed or fall below operating income under Variable Costing?',
    tableData: {
      title: 'Apex Manufacturing - Annual Operating Costs',
      headers: ['Cost Category', 'Variable Cost per Unit', 'Total Fixed Cost'],
      rows: [
        ['Direct Materials', '$35.00', '—'],
        ['Direct Labor', '$25.00', '—'],
        ['Manufacturing Overhead', '$10.00', '$1,000,000'],
        ['Selling & Administrative', '$5.00', '$600,000'],
      ],
    },
    options: [
      {
        id: 'A',
        text: 'Operating income is $800,000; it is $200,000 higher than variable costing operating income.',
      },
      {
        id: 'B',
        text: 'Operating income is $600,000; it is equal to variable costing operating income.',
      },
      {
        id: 'C',
        text: 'Operating income is $1,000,000; it is $200,000 lower than variable costing operating income.',
      },
      {
        id: 'D',
        text: 'Operating income is $800,000; it is $200,000 lower than variable costing operating income.',
      },
    ],
    correctOption: 'A',
    conciseHint:
      'Fixed manufacturing overhead is capitalized in inventory under absorption costing ($1,000,000 / 50,000 = $20/unit). When production exceeds sales, ending inventory defers fixed overhead into the future, making absorption income higher by (Ending Inventory Units × Fixed Overhead per Unit).',
    explanation: {
      summary:
        'Absorption costing treats fixed manufacturing overhead as a product cost. Because 10,000 units remain in ending inventory, $200,000 of fixed manufacturing overhead is deferred on the balance sheet rather than expensed in Year 1.',
      steps: [
        {
          stepTitle: 'Step 1: Calculate Fixed Manufacturing Overhead per unit produced',
          detail:
            'Fixed MOH per unit = Total Fixed MOH / Total Units Produced = $1,000,000 / 50,000 units = $20.00 per unit.',
          mathFormula: '$1,000,000 / 50,000 = $20/unit',
        },
        {
          stepTitle: 'Step 2: Calculate Absorption Unit Product Cost and COGS',
          detail:
            'Absorption unit cost = Direct Materials ($35) + Direct Labor ($25) + Variable MOH ($10) + Fixed MOH ($20) = $90.00 per unit.\nCost of Goods Sold = 40,000 units sold × $90.00 = $3,600,000.\nGross Margin = Revenues ($120 × 40,000 = $4,800,000) - COGS ($3,600,000) = $1,200,000.\nSelling & Administrative Expense = Variable ($5 × 40,000 = $200,000) + Fixed ($600,000) = $800,000.\nOperating Income = $1,200,000 - $800,000 = $800,000.',
          mathFormula: 'Operating Income = $4,800,000 - $3,600,000 - $800,000 = $800,000',
        },
        {
          stepTitle: 'Step 3: Reconcile with Variable Costing',
          detail:
            'Under variable costing, all $1,000,000 of fixed MOH is expensed immediately. \nDifference in Operating Income = (Units Produced - Units Sold) × Fixed MOH per unit = (50,000 - 40,000) × $20 = 10,000 × $20 = $200,000.\nTherefore, Absorption income ($800,000) is $200,000 higher than Variable costing income ($600,000).',
          mathFormula: 'Difference = 10,000 units × $20/unit = $200,000',
        },
      ],
      distractorAnalysis: {
        A: 'Correct. Absorption operating income is $800,000 and defers $200,000 of fixed MOH in ending inventory, making it $200,000 higher than variable costing.',
        B: 'Incorrect. This represents variable costing operating income ($600,000) and incorrectly assumes no timing difference.',
        C: 'Incorrect. Miscalculates the deferral and inverts the relationship; when production exceeds sales, absorption income is always higher, not lower.',
        D: 'Incorrect. Correctly calculated operating income of $800,000, but inverted the direction of the difference between absorption and variable costing.',
      },
    },
    difficulty: 'Exam Standard',
    isFreeTrialSample: true,
  },
  {
    id: 'cma-p1-002',
    part: 'part1',
    domain: 'Performance Management',
    subtopic: 'Standard Costing & Variance Analysis',
    scenario:
      'Vanguard Electronics established the following standard for direct materials to produce one unit of Model-X circuit board:\n• Standard Quantity: 4.0 pounds of copper alloy\n• Standard Price: $8.50 per pound\nDuring September, Vanguard produced 12,000 Model-X boards, purchased 52,000 pounds of copper alloy at $8.20 per pound, and used 49,200 pounds in actual production.',
    questionText:
      'What are Vanguard’s Direct Materials Price Variance (isolated at time of purchase) and Direct Materials Quantity (Efficiency) Variance for September?',
    options: [
      {
        id: 'A',
        text: 'Price Variance: $15,600 Favorable; Quantity Variance: $10,200 Unfavorable',
      },
      {
        id: 'B',
        text: 'Price Variance: $15,600 Unfavorable; Quantity Variance: $10,200 Favorable',
      },
      {
        id: 'C',
        text: 'Price Variance: $14,760 Favorable; Quantity Variance: $9,840 Unfavorable',
      },
      {
        id: 'D',
        text: 'Price Variance: $15,600 Favorable; Quantity Variance: $34,000 Unfavorable',
      },
    ],
    correctOption: 'A',
    conciseHint:
      'Direct Materials Price Variance = Actual Quantity Purchased × (Standard Price - Actual Price). Direct Materials Quantity Variance = Standard Price × (Standard Quantity Allowed - Actual Quantity Used).',
    explanation: {
      summary:
        'Standard costing isolates price variances at purchase: 52,000 lbs × ($8.50 - $8.20) = $15,600 F. Quantity variance evaluates actual usage against standard allowed for actual output: $8.50 × (48,000 lbs standard - 49,200 lbs used) = $10,200 U.',
      steps: [
        {
          stepTitle: 'Step 1: Calculate Standard Quantity Allowed (SQA)',
          detail:
            'SQA = Actual units produced × Standard quantity per unit = 12,000 units × 4.0 lbs = 48,000 pounds.',
          mathFormula: '12,000 × 4.0 = 48,000 lbs',
        },
        {
          stepTitle: 'Step 2: Direct Materials Price Variance',
          detail:
            'Price Variance = AQ Purchased × (SP - AP) = 52,000 lbs × ($8.50 - $8.20) = 52,000 × (+$0.30) = $15,600 Favorable (since actual price paid is lower than standard).',
          mathFormula: '52,000 × ($8.50 - $8.20) = $15,600 F',
        },
        {
          stepTitle: 'Step 3: Direct Materials Quantity (Efficiency) Variance',
          detail:
            'Quantity Variance = SP × (SQA - AQ Used) = $8.50 × (48,000 lbs - 49,200 lbs) = $8.50 × (-1,200 lbs) = -$10,200 (Unfavorable, since more pounds were used than standard allowed).',
          mathFormula: '$8.50 × (48,000 - 49,200) = $10,200 U',
        },
      ],
      distractorAnalysis: {
        A: 'Correct. Direct Materials Price Variance is $15,600 F and Quantity Variance is $10,200 U.',
        B: 'Incorrect. Inverts the favorable/unfavorable designations.',
        C: 'Incorrect. Computed price variance using materials used (49,200 lbs) rather than materials purchased (52,000 lbs). The question specified isolating variance at purchase.',
        D: 'Incorrect. Compares materials used to materials purchased rather than to standard quantity allowed for actual production.',
      },
    },
    difficulty: 'Exam Standard',
    isFreeTrialSample: true,
  },
  {
    id: 'cma-p2-001',
    part: 'part2',
    domain: 'Decision Analysis',
    subtopic: 'Cost-Volume-Profit (CVP) & Breakeven Analysis',
    scenario:
      'Solaria Corp sells high-efficiency solar battery packs for $1,500 each. The variable cost per battery is $900. Solaria’s fixed operating costs are $3,600,000 per year. Solaria is subject to a 25% corporate income tax rate and has set a target annual after-tax net income of $900,000.',
    questionText:
      'How many solar battery units must Solaria sell in a year to achieve its target after-tax net income of $900,000?',
    options: [
      { id: 'A', text: '8,000 units' },
      { id: 'B', text: '7,500 units' },
      { id: 'C', text: '6,000 units' },
      { id: 'D', text: '9,200 units' },
    ],
    correctOption: 'A',
    conciseHint:
      'Convert target after-tax net income to required before-tax operating income: Before-Tax Operating Income = After-Tax Net Income / (1 - Tax Rate). Then apply: Target Units = (Fixed Costs + Before-Tax Target) / Unit Contribution Margin.',
    explanation: {
      summary:
        'To cover both fixed costs and the target after-tax profit, the target profit must first be grossed up for income taxes ($900,000 / (1 - 0.25) = $1,200,000). Total required contribution margin is $3,600,000 + $1,200,000 = $4,800,000. Dividing by unit contribution margin of $600 yields 8,000 units.',
      steps: [
        {
          stepTitle: 'Step 1: Calculate Unit Contribution Margin (UCM)',
          detail:
            'Unit Contribution Margin = Selling Price - Variable Cost per unit = $1,500 - $900 = $600 per unit.',
          mathFormula: '$1,500 - $900 = $600',
        },
        {
          stepTitle: 'Step 2: Gross up Target After-Tax Net Income to Pre-Tax Target',
          detail:
            'Pre-Tax Operating Income = Target Net Income / (1 - t) = $900,000 / (1 - 0.25) = $900,000 / 0.75 = $1,200,000.',
          mathFormula: '$900,000 / 0.75 = $1,200,000',
        },
        {
          stepTitle: 'Step 3: Calculate Required Sales Units',
          detail:
            'Required Units = (Fixed Costs + Pre-Tax Target Income) / UCM = ($3,600,000 + $1,200,000) / $600 = $4,800,000 / $600 = 8,000 units.',
          mathFormula: '$4,800,000 / $600 = 8,000 units',
        },
      ],
      distractorAnalysis: {
        A: 'Correct. Required sales are 8,000 units.',
        B: 'Incorrect. Failed to adjust after-tax profit for the 25% tax rate: ($3,600,000 + $900,000) / $600 = 7,500 units.',
        C: 'Incorrect. Calculated only breakeven volume without the profit target: $3,600,000 / $600 = 6,000 units.',
        D: 'Incorrect. Added taxes instead of dividing by (1 - t): ($3,600,000 + $1,125,000) / $600 ≈ 7,875 rounded up erroneously.',
      },
    },
    difficulty: 'Medium',
    isFreeTrialSample: true,
  },
  {
    id: 'cma-p2-002',
    part: 'part2',
    domain: 'Financial Statement Analysis',
    subtopic: 'Working Capital & Cash Conversion Cycle',
    scenario:
      'Meridian Retail Group reported the following balance sheet and income statement items for the fiscal year ended December 31 (assume a 365-day year):\n• Annual Net Sales (all on credit): $14,600,000\n• Cost of Goods Sold: $8,760,000\n• Average Accounts Receivable: $1,200,000\n• Average Merchandise Inventory: $1,440,000\n• Average Accounts Payable: $720,000',
    questionText:
      'What is Meridian Retail Group’s Cash Conversion Cycle (CCC) rounded to the nearest tenth of a day?',
    options: [
      { id: 'A', text: '60.0 days' },
      { id: 'B', text: '90.0 days' },
      { id: 'C', text: '42.5 days' },
      { id: 'D', text: '120.0 days' },
    ],
    correctOption: 'A',
    conciseHint:
      'Cash Conversion Cycle = Days Sales Outstanding (DSO) + Days Inventory Outstanding (DIO) - Days Payable Outstanding (DPO). Ensure DSO uses Net Sales while DIO and DPO use Cost of Goods Sold.',
    explanation: {
      summary:
        'The Cash Conversion Cycle measures the time in days required to convert raw cash invested in operations back into cash inflow from customer collections. DSO = 30.0 days, DIO = 60.0 days, DPO = 30.0 days; CCC = 30 + 60 - 30 = 60.0 days.',
      steps: [
        {
          stepTitle: 'Step 1: Compute Days Sales Outstanding (DSO)',
          detail:
            'DSO = (Average Accounts Receivable / Annual Net Credit Sales) × 365 = ($1,200,000 / $14,600,000) × 365 = 0.08219 × 365 = 30.0 days.',
          mathFormula: '($1,200,000 / $14,600,000) × 365 = 30.0 days',
        },
        {
          stepTitle: 'Step 2: Compute Days Inventory Outstanding (DIO)',
          detail:
            'DIO = (Average Inventory / Cost of Goods Sold) × 365 = ($1,440,000 / $8,760,000) × 365 = 0.16438 × 365 = 60.0 days.',
          mathFormula: '($1,440,000 / $8,760,000) × 365 = 60.0 days',
        },
        {
          stepTitle: 'Step 3: Compute Days Payable Outstanding (DPO)',
          detail:
            'DPO = (Average Accounts Payable / Cost of Goods Sold) × 365 = ($720,000 / $8,760,000) × 365 = 0.08219 × 365 = 30.0 days.',
          mathFormula: '($720,000 / $8,760,000) × 365 = 30.0 days',
        },
        {
          stepTitle: 'Step 4: Compute Cash Conversion Cycle (CCC)',
          detail:
            'CCC = DSO + DIO - DPO = 30.0 + 60.0 - 30.0 = 60.0 days.',
          mathFormula: 'CCC = 30.0 + 60.0 - 30.0 = 60.0 days',
        },
      ],
      distractorAnalysis: {
        A: 'Correct. Cash Conversion Cycle is exactly 60.0 days.',
        B: 'Incorrect. Computed the Operating Cycle (DSO + DIO = 90.0 days) without deducting DPO.',
        C: 'Incorrect. Incorrectly used Net Sales as the denominator for DIO and DPO instead of Cost of Goods Sold.',
        D: 'Incorrect. Added all three metrics (30 + 60 + 30 = 120 days) instead of subtracting Days Payable Outstanding.',
      },
    },
    difficulty: 'Exam Standard',
    isFreeTrialSample: true,
  },
  {
    id: 'cma-p2-003',
    part: 'part2',
    domain: 'Professional Ethics',
    subtopic: 'IMA Statement of Ethical Professional Practice',
    scenario:
      'Elena Vance, CMA, is the Senior Financial Analyst for a publicly traded aerospace contractor. While finalizing the Q3 financial statements, her direct supervisor, the Corporate Controller, instructs Elena to defer $4,200,000 of warranty liabilities into the subsequent fiscal year to satisfy earnings per share expectations promised to Wall Street analysts. Elena knows this violates US GAAP.',
    questionText:
      'According to the IMA Statement of Ethical Professional Practice, which of the following is the most appropriate first course of action Elena should undertake to resolve this ethical conflict?',
    options: [
      {
        id: 'A',
        text: 'Discuss the issue with her immediate supervisor, unless it appears the supervisor is involved, in which case present the issue to the next higher management level.',
      },
      {
        id: 'B',
        text: 'Immediately notify the Securities and Exchange Commission (SEC) and file a formal whistleblower complaint.',
      },
      {
        id: 'C',
        text: 'Inform external media outlets and post on an anonymous professional forum to protect shareholder interests.',
      },
      {
        id: 'D',
        text: 'Immediately resign from the organization and contact external audit partners.',
      },
    ],
    correctOption: 'A',
    conciseHint:
      'The IMA standard protocol for resolving ethical conflicts dictates following established organizational policies first. When discussing with superiors, start with the immediate supervisor unless they are involved—in which case elevate to the next higher level of management (e.g., CFO, Audit Committee). Whistleblowing outside the organization is only permitted when legally mandated.',
    explanation: {
      summary:
        'Under the IMA Statement of Ethical Professional Practice (Resolving Ethical Conflicts), members must follow organizational grievance policies. If none exist or they are insufficient, discuss with the next higher management level when the supervisor is implicated.',
      steps: [
        {
          stepTitle: 'Step 1: Identify the Ethical Dilemma and Relevant Principles',
          detail:
            'The controller is asking Elena to distort financial reporting (violating Integrity and Credibility standards).',
        },
        {
          stepTitle: 'Step 2: Apply the IMA Resolution Procedure',
          detail:
            '1. Follow the established organizational policies regarding dispute resolution.\n2. Discuss the issue with the immediate supervisor. If the supervisor is involved (as here), advance to the next level of management (e.g., VP of Finance, CFO, or the Audit Committee/Board of Directors).\n3. Clarify relevant ethical issues by initiating a confidential discussion with an IMA Ethics Counselor or other impartial advisor.\n4. Consult your own attorney as to legal obligations and rights.',
        },
        {
          stepTitle: 'Step 3: Evaluate Prohibited External Disclosures',
          detail:
            'Contacting external regulators or media without first exhausting internal channels violates the Confidentiality standard unless there is a clear statutory violation with mandatory external reporting requirements.',
        },
      ],
      distractorAnalysis: {
        A: 'Correct. Standard IMA protocol requires escalating through internal chain of command, bypassing an implicated supervisor to the next senior level.',
        B: 'Incorrect. Bypasses internal channels prematurely. Communication with external authorities should occur only if internal avenues fail and there is a legal violation.',
        C: 'Incorrect. Blatantly breaches the IMA Confidentiality standard and provides no formal legal protection.',
        D: 'Incorrect. Resignation is the final measure after all internal levels of review fail to remedy the unethical behavior, not the initial step.',
      },
    },
    difficulty: 'Medium',
    isFreeTrialSample: true,
  },

  // --- PREMIUM BANK QUESTIONS (6 to 25+) ---
  {
    id: 'cma-p1-003',
    part: 'part1',
    domain: 'External Financial Reporting Decisions',
    subtopic: 'Revenue Recognition (ASC 606)',
    scenario:
      'NovaTech Systems entered into a contract with a client on January 1 to deliver enterprise software licenses and provide 2 years of technical support. The total contract transaction price is $240,000. \n• Standalone selling price of software license: $180,000 (delivered on Jan 1)\n• Standalone selling price of 2-year technical support: $60,000\nTotal standalone selling prices equal $240,000. On January 1, the software was successfully installed.',
    questionText:
      'Under ASC 606 (Five-Step Revenue Model), how much revenue should NovaTech recognize for the year ended December 31?',
    options: [
      { id: 'A', text: '$210,000' },
      { id: 'B', text: '$180,000' },
      { id: 'C', text: '$240,000' },
      { id: 'D', text: '$120,000' },
    ],
    correctOption: 'A',
    conciseHint:
      'Allocate transaction price based on relative standalone selling prices. The software license is recognized point-in-time ($180,000), while the 2-year technical support is recognized over-time ($30,000 recognized per year).',
    explanation: {
      summary:
        'Software license is a separate performance obligation satisfied point-in-time on Jan 1 ($180,000). The 2-year support service is satisfied over time ($60,000 / 2 years = $30,000 in Year 1). Total recognized revenue for Year 1 is $180,000 + $30,000 = $210,000.',
      steps: [
        {
          stepTitle: 'Step 1: Identify Performance Obligations',
          detail: '1. Software license (point-in-time); 2. Technical support (over-time across 24 months).',
        },
        {
          stepTitle: 'Step 2: Allocate Transaction Price',
          detail: 'Software: $180,000 (75%); Support: $60,000 (25%).',
        },
        {
          stepTitle: 'Step 3: Calculate Revenue for Year 1',
          detail: 'Software license: $180,000 (100% delivered). Technical support: $60,000 × (12/24 months) = $30,000. Total = $210,000.',
          mathFormula: '$180,000 + $30,000 = $210,000',
        },
      ],
      distractorAnalysis: {
        A: 'Correct. $180,000 on delivery + $30,000 for Year 1 of service = $210,000.',
        B: 'Incorrect. Omitted the first year of support service revenue.',
        C: 'Incorrect. Recognized the entire 2-year support contract in the first year before services were rendered.',
        D: 'Incorrect. Erroneously straight-lined the total contract value across 2 years ($240,000 / 2).',
      },
    },
    difficulty: 'Hard',
  },
  {
    id: 'cma-p1-004',
    part: 'part1',
    domain: 'Planning, Budgeting & Forecasting',
    subtopic: 'Cash Collections Budget',
    scenario:
      'Helios Corp forecasts gross credit sales as follows:\n• March: $300,000\n• April: $400,000\n• May: $500,000\nHelios collects receivables as follows: 60% in month of sale, 30% in month following sale, 8% in second month following sale, and 2% uncollectible.',
    questionText:
      'What are the total budgeted cash collections from credit sales for the month of May?',
    options: [
      { id: 'A', text: '$444,000' },
      { id: 'B', text: '$420,000' },
      { id: 'C', text: '$460,000' },
      { id: 'D', text: '$480,000' },
    ],
    correctOption: 'A',
    conciseHint:
      'May cash collections = (May sales × 60%) + (April sales × 30%) + (March sales × 8%). Do not collect uncollectible debt.',
    explanation: {
      summary:
        'Cash receipts in May arise from May credit sales (60%), April credit sales (30%), and March credit sales (8%). $300,000 + $120,000 + $24,000 = $444,000.',
      steps: [
        {
          stepTitle: 'Step 1: May sales collected in May',
          detail: '$500,000 × 60% = $300,000.',
          mathFormula: '$500,000 × 0.60 = $300,000',
        },
        {
          stepTitle: 'Step 2: April sales collected in May',
          detail: '$400,000 × 30% = $120,000.',
          mathFormula: '$400,000 × 0.30 = $120,000',
        },
        {
          stepTitle: 'Step 3: March sales collected in May',
          detail: '$300,000 × 8% = $24,000.',
          mathFormula: '$300,000 × 0.08 = $24,000',
        },
        {
          stepTitle: 'Step 4: Sum all collections',
          detail: '$300,000 + $120,000 + $24,000 = $444,000.',
          mathFormula: 'Total Collections = $444,000',
        },
      ],
      distractorAnalysis: {
        A: 'Correct. Sum of collections from May ($300k), April ($120k), and March ($24k).',
        B: 'Incorrect. Omitted the collections from March sales ($24,000).',
        C: 'Incorrect. Included the 2% bad debt allowance in collections.',
        D: 'Incorrect. Assumed 90% collection of current month sales.',
      },
    },
    difficulty: 'Medium',
  },
  {
    id: 'cma-p1-005',
    part: 'part1',
    domain: 'Internal Controls',
    subtopic: 'COSO Internal Control - Integrated Framework',
    scenario:
      'The Board of Directors of an automotive parts supplier discovers that plant managers routinely altered production logs to inflate quarterly safety bonus metrics. The internal audit committee found that plant managers faced no independent verification and the code of conduct had not been communicated in over four years.',
    questionText:
      'According to the COSO Internal Control—Integrated Framework, which component of internal control is fundamentally deficient in this organization?',
    options: [
      { id: 'A', text: 'Control Environment' },
      { id: 'B', text: 'Risk Assessment' },
      { id: 'C', text: 'Control Activities' },
      { id: 'D', text: 'Monitoring Activities' },
    ],
    correctOption: 'A',
    conciseHint:
      'The Control Environment sets the tone at the top, emphasizing integrity, ethical values, organizational structure, and management philosophy. Failure to communicate the code of conduct and incentive structures that motivate fraud directly weaken the control environment.',
    explanation: {
      summary:
        'The Control Environment serves as the foundation for all other internal control components. Tone at the top, ethical behavior, and enforcement of ethical standards belong to the Control Environment.',
      steps: [
        {
          stepTitle: 'Step 1: Examine COSO 5 Components',
          detail: '1. Control Environment, 2. Risk Assessment, 3. Control Activities, 4. Information & Communication, 5. Monitoring Activities.',
        },
        {
          stepTitle: 'Step 2: Relate Case Facts to Principles',
          detail: 'Principle 1 of COSO states the organization demonstrates a commitment to integrity and ethical values. The lapse in ethical communication and misaligned compensation culture demonstrates a failure in the Control Environment.',
        },
      ],
      distractorAnalysis: {
        A: 'Correct. Control Environment reflects tone at the top, ethical standards, and accountability.',
        B: 'Incorrect. Risk Assessment identifies and analyzes operational risks to objectives.',
        C: 'Incorrect. Control Activities are policies/procedures like segregation of duties and physical security.',
        D: 'Incorrect. Monitoring activities are ongoing evaluations of internal control operations over time.',
      },
    },
    difficulty: 'Medium',
  },
  {
    id: 'cma-p1-006',
    part: 'part1',
    domain: 'Technology & Analytics',
    subtopic: 'Regression Analysis in Cost Estimation',
    scenario:
      'A cost accountant ran a simple linear regression using 36 months of data to estimate shipping costs (Y) based on units shipped (X):\n• Y = $45,000 + $14.50(X)\n• Coefficient of determination (R²) = 0.81\n• Standard error of the estimate (Se) = $3,200',
    questionText:
      'How should management interpret the coefficient of determination (R² = 0.81) in this model?',
    options: [
      {
        id: 'A',
        text: '81% of the variation in monthly shipping costs is explained by changes in the number of units shipped.',
      },
      {
        id: 'B',
        text: 'For every additional unit shipped, shipping costs increase by 81%.',
      },
      {
        id: 'C',
        text: 'There is an 81% probability that actual shipping costs will fall within one standard error of the estimate.',
      },
      {
        id: 'D',
        text: 'The correlation coefficient between units shipped and shipping costs is 0.81.',
      },
    ],
    correctOption: 'A',
    conciseHint:
      'R² (coefficient of determination) represents the percentage of total variability in the dependent variable (Y) that is explained by the independent variable (X).',
    explanation: {
      summary:
        'R² measures the goodness of fit of the regression line. R² = 0.81 indicates that 81% of total variance in the dependent variable (shipping cost) is accounted for by variation in the driver (units shipped).',
      steps: [
        {
          stepTitle: 'Step 1: Understand R²',
          detail: 'R² is calculated as Explained Variation / Total Variation. Here R² = 0.81, so 81% of cost variability is explained by units shipped.',
        },
        {
          stepTitle: 'Step 2: Contrast with correlation coefficient (r)',
          detail: 'r = sqrt(0.81) = 0.90, indicating a strong positive linear correlation.',
        },
      ],
      distractorAnalysis: {
        A: 'Correct. Standard statistical definition of R² in management accounting.',
        B: 'Incorrect. Confuses R² with variable cost slope coefficient ($14.50/unit).',
        C: 'Incorrect. Confuses R² with confidence intervals derived from normal distribution and standard error.',
        D: 'Incorrect. 0.81 is R², whereas the correlation coefficient (r) is the square root of 0.81 = 0.90.',
      },
    },
    difficulty: 'Medium',
  },
  {
    id: 'cma-p2-004',
    part: 'part2',
    domain: 'Investment Decisions',
    subtopic: 'Capital Budgeting - Net Present Value (NPV)',
    scenario:
      'AeroDynamics Corp is considering buying a computerized machining center for $500,000. \n• Project life: 4 years\n• Salvage value at Year 4: $0\n• MACRS depreciation: 3-year class (Year 1: 33%, Year 2: 45%, Year 3: 15%, Year 4: 7%)\n• Annual pre-tax cash operating savings: $200,000 per year\n• Corporate tax rate: 30%\n• Cost of capital (discount rate): 10%\nPresent value factors at 10%:\nYear 1: 0.909, Year 2: 0.826, Year 3: 0.751, Year 4: 0.683',
    questionText:
      'What is the total depreciation tax shield generated in Year 2 of the project, and what is its present value at 10%?',
    options: [
      { id: 'A', text: 'Tax shield: $67,500; Present Value: $55,755' },
      { id: 'B', text: 'Tax shield: $225,000; Present Value: $185,850' },
      { id: 'C', text: 'Tax shield: $60,000; Present Value: $49,560' },
      { id: 'D', text: 'Tax shield: $135,000; Present Value: $111,510' },
    ],
    correctOption: 'A',
    conciseHint:
      'Depreciation Tax Shield = Depreciation Expense × Tax Rate. In Year 2, MACRS rate is 45%: $500,000 × 0.45 = $225,000. Tax shield = $225,000 × 30% = $67,500. Then discount at Year 2 factor (0.826).',
    explanation: {
      summary:
        'Depreciation is a non-cash expense that shelters operating income from taxation. Depreciation Tax Shield = Tax Rate × Depreciation. For Year 2: $67,500 tax reduction, which has a PV of $55,755 at 10%.',
      steps: [
        {
          stepTitle: 'Step 1: Calculate Year 2 Depreciation',
          detail: 'Year 2 MACRS deduction = $500,000 base × 45% = $225,000.',
          mathFormula: '$500,000 × 0.45 = $225,000',
        },
        {
          stepTitle: 'Step 2: Calculate Depreciation Tax Shield',
          detail: 'Cash tax savings = Depreciation × Tax Rate = $225,000 × 30% = $67,500.',
          mathFormula: '$225,000 × 0.30 = $67,500',
        },
        {
          stepTitle: 'Step 3: Discount to Present Value',
          detail: 'PV = $67,500 × 0.826 (Year 2 PV factor) = $55,755.',
          mathFormula: '$67,500 × 0.826 = $55,755',
        },
      ],
      distractorAnalysis: {
        A: 'Correct. Tax shield is $67,500 with a PV of $55,755.',
        B: 'Incorrect. Used the full depreciation deduction ($225,000) rather than multiplying by the 30% tax shield rate.',
        C: 'Incorrect. Assumed straight-line depreciation ($125,000/yr × 30% = $37,500) or miscalculated tax rates.',
        D: 'Incorrect. Applied the after-tax multiplier (1 - 0.30 = 70%) to depreciation instead of the tax rate (30%).',
      },
    },
    difficulty: 'Hard',
  },
  {
    id: 'cma-p2-005',
    part: 'part2',
    domain: 'Corporate Finance',
    subtopic: 'Weighted Average Cost of Capital (WACC)',
    scenario:
      'OmniCorp has a target capital structure consisting of 40% debt and 60% common equity. OmniCorp has no preferred stock.\n• Before-tax cost of debt: 8.0%\n• Risk-free rate (Rf): 4.0%\n• Expected market return (Rm): 11.0%\n• OmniCorp equity beta: 1.20\n• Corporate tax rate: 25%',
    questionText:
      'Using the Capital Asset Pricing Model (CAPM) to compute the cost of equity, what is OmniCorp’s Weighted Average Cost of Capital (WACC)?',
    options: [
      { id: 'A', text: '9.84%' },
      { id: 'B', text: '10.64%' },
      { id: 'C', text: '8.40%' },
      { id: 'D', text: '11.20%' },
    ],
    correctOption: 'A',
    conciseHint:
      'First calculate Cost of Equity: Ke = Rf + Beta × (Rm - Rf). Second calculate After-tax Cost of Debt: Kd = Pre-tax rate × (1 - Tax Rate). Third calculate WACC = (Wd × Kd) + (We × Ke).',
    explanation: {
      summary:
        'Cost of equity by CAPM is 12.4%. After-tax debt cost is 6.0%. WACC = (0.40 × 6.0%) + (0.60 × 12.4%) = 2.40% + 7.44% = 9.84%.',
      steps: [
        {
          stepTitle: 'Step 1: Cost of Common Equity via CAPM',
          detail: 'Ke = Rf + Beta × (Rm - Rf) = 4.0% + 1.20 × (11.0% - 4.0%) = 4.0% + (1.20 × 7.0%) = 4.0% + 8.4% = 12.40%.',
          mathFormula: 'Ke = 4.0% + 1.20 × (11.0% - 4.0%) = 12.40%',
        },
        {
          stepTitle: 'Step 2: After-Tax Cost of Debt',
          detail: 'Kd(after-tax) = Before-tax Kd × (1 - Tax Rate) = 8.0% × (1 - 0.25) = 6.00%.',
          mathFormula: 'Kd = 8.0% × 0.75 = 6.00%',
        },
        {
          stepTitle: 'Step 3: Compute WACC',
          detail: 'WACC = (Weight Debt × Kd) + (Weight Equity × Ke) = (0.40 × 6.0%) + (0.60 × 12.4%) = 2.40% + 7.44% = 9.84%.',
          mathFormula: 'WACC = 0.40(6.0%) + 0.60(12.4%) = 9.84%',
        },
      ],
      distractorAnalysis: {
        A: 'Correct. WACC is 9.84%.',
        B: 'Incorrect. Failed to adjust cost of debt for taxes: (0.40 × 8.0%) + (0.60 × 12.4%) = 10.64%.',
        C: 'Incorrect. Inverted weights: 60% debt and 40% equity.',
        D: 'Incorrect. Assumed equity cost equals expected market return directly.',
      },
    },
    difficulty: 'Exam Standard',
  },
  {
    id: 'cma-p2-006',
    part: 'part2',
    domain: 'Decision Analysis',
    subtopic: 'Transfer Pricing in Decentralized Organizations',
    scenario:
      'Division A produces an optical sensor that Division B can use in its laser equipment. Division A incurs variable manufacturing costs of $18 per sensor and full absorption cost of $28. Division A currently operates at 100% capacity and can sell all sensors to external buyers for $35 each.\nDivision B currently purchases similar sensors from an outside supplier for $34 each.',
    questionText:
      'From the perspective of the overall corporation, what is the minimum transfer price Division A would accept, and should the internal transfer take place?',
    options: [
      {
        id: 'A',
        text: 'Minimum transfer price is $35; the transfer should not take place because the company loses $1 per unit if Division B buys internally.',
      },
      {
        id: 'B',
        text: 'Minimum transfer price is $18; the transfer should take place to save variable production costs.',
      },
      {
        id: 'C',
        text: 'Minimum transfer price is $28; the transfer should take place at full absorption cost.',
      },
      {
        id: 'D',
        text: 'Minimum transfer price is $34; Division B is indifferent.',
      },
    ],
    correctOption: 'A',
    conciseHint:
      'Minimum Transfer Price = Incremental Cost + Opportunity Cost. When the selling division is at full capacity, opportunity cost is the contribution margin forgone ($35 - $18 = $17). Thus minimum transfer price = $18 + $17 = $35. If Division B can buy externally for $34, transferring internally costs the company $1 per unit more.',
    explanation: {
      summary:
        'General transfer pricing rule: Minimum Transfer Price = Outlay Cost + Lost Contribution Margin. Because Division A is at full capacity, it must surrender a $35 market sale. Selling internally below $35 sacrifices Division A profit. Because Division B can procure outside for $34, forcing an internal transfer destroys $1/unit of corporate value.',
      steps: [
        {
          stepTitle: 'Step 1: Determine Opportunity Cost of Selling Division',
          detail: 'Division A has no idle capacity. Opportunity cost per unit = Market Price - Variable Cost = $35 - $18 = $17.',
        },
        {
          stepTitle: 'Step 2: Compute Minimum Transfer Price for Division A',
          detail: 'Minimum Transfer Price = Incremental Cost ($18) + Opportunity Cost ($17) = $35.',
          mathFormula: '$18 + $17 = $35',
        },
        {
          stepTitle: 'Step 3: Analyze Corporate Economic Impact',
          detail: 'Corporate cost if internal transfer occurs: $35 forgone external revenue. Corporate cost if outside purchase: $34 cash outflow. Corporate profit is higher by $1 per unit if Division B purchases outside ($35 - $34 = $1 advantage to buy outside).',
        },
      ],
      distractorAnalysis: {
        A: 'Correct. Minimum transfer price is $35; the internal transfer is suboptimal for the firm by $1/unit.',
        B: 'Incorrect. Ignores capacity constraint and the $17 lost contribution margin.',
        C: 'Incorrect. Full absorption cost is economically arbitrary and ignores lost revenue.',
        D: 'Incorrect. $34 is the maximum price Division B would pay, not Division A’s minimum.',
      },
    },
    difficulty: 'Hard',
  },
  {
    id: 'cma-p2-007',
    part: 'part2',
    domain: 'Risk Management',
    subtopic: 'Enterprise Risk Management (COSO ERM)',
    scenario:
      'A global consumer goods conglomerate is evaluating supply chain vulnerabilities. Management determines that political instability in a critical raw material supplying nation poses a high-severity disruption risk. The executive committee decides to enter into forward contracts with two alternate suppliers located in stable domestic regions and hedge foreign currency exposure.',
    questionText:
      'Under the COSO Enterprise Risk Management (ERM) framework, which risk response strategy has management implemented?',
    options: [
      { id: 'A', text: 'Risk Reduction (Mitigation) & Risk Sharing' },
      { id: 'B', text: 'Risk Avoidance' },
      { id: 'C', text: 'Risk Acceptance' },
      { id: 'D', text: 'Risk Exploitation' },
    ],
    correctOption: 'A',
    conciseHint:
      'Risk reduction involves actions to reduce risk severity or likelihood (e.g., dual-sourcing). Risk sharing transfers or shares portions of the risk with third parties (e.g., hedging instruments or insurance). Risk avoidance means exiting the activity entirely.',
    explanation: {
      summary:
        'Dual-sourcing reduces the operational impact of supplier disruption (Reduction). Hedging currency risk via contracts transfers part of financial risk to market counterparties (Sharing).',
      steps: [
        {
          stepTitle: 'Step 1: Review COSO ERM Risk Responses',
          detail: 'Avoidance (exit), Reduction (mitigate likelihood/impact), Sharing (insurance/hedging), Acceptance (take no action), Pursuit (accept greater risk for return).',
        },
        {
          stepTitle: 'Step 2: Map actions to categories',
          detail: 'Setting up domestic backup suppliers = Risk Reduction. Currency forward contracts = Risk Sharing.',
        },
      ],
      distractorAnalysis: {
        A: 'Correct. Dual-sourcing reduces impact and financial hedging shares risk.',
        B: 'Incorrect. Risk avoidance requires terminating the product line or exiting the market.',
        C: 'Incorrect. Acceptance means taking no action and absorbing losses.',
        D: 'Incorrect. Risk exploitation means taking on more exposure to seize an aggressive competitive advantage.',
      },
    },
    difficulty: 'Medium',
  },
  {
    id: 'cma-p1-007',
    part: 'part1',
    domain: 'Planning, Budgeting & Forecasting',
    subtopic: 'Flexible Budgeting & Overhead Variances',
    scenario:
      'Sterling Plastics uses a standard costing system. Fixed manufacturing overhead is applied at a predetermined rate of $6.00 per machine hour based on normal annual capacity of 100,000 machine hours. During October, the company budgeted 8,000 machine hours but actually operated 8,500 machine hours and incurred $52,000 of fixed manufacturing overhead.',
    questionText:
      'What is Sterling’s Fixed Overhead Spending (Budget) Variance and Volume Variance for October (assuming normal capacity is spread evenly across 12 months)?',
    options: [
      {
        id: 'A',
        text: 'Spending Variance: $2,000 Unfavorable; Volume Variance: $1,000 Favorable',
      },
      {
        id: 'B',
        text: 'Spending Variance: $2,000 Favorable; Volume Variance: $3,000 Unfavorable',
      },
      {
        id: 'C',
        text: 'Spending Variance: $4,000 Unfavorable; Volume Variance: $1,000 Favorable',
      },
      {
        id: 'D',
        text: 'Spending Variance: $2,000 Unfavorable; Volume Variance: $2,000 Unfavorable',
      },
    ],
    correctOption: 'A',
    conciseHint:
      'Monthly Budgeted Fixed Overhead = (100,000 normal hours × $6.00) / 12 = $50,000 (or 8,333.33 hrs) OR based on monthly denominator. Spending Variance = Actual Fixed OH - Budgeted Fixed OH. Fixed OH Volume Variance = Budgeted Fixed OH - Applied Fixed OH.',
    explanation: {
      summary:
        'Fixed Overhead Spending Variance = Actual Fixed Overhead ($52,000) - Budgeted Fixed Overhead ($50,000) = $2,000 Unfavorable. Applied Fixed OH = 8,500 standard hours × $6.00 = $51,000. Volume Variance = Budgeted ($50,000) - Applied ($51,000) = $1,000 Favorable.',
      steps: [
        {
          stepTitle: 'Step 1: Calculate Budgeted Monthly Fixed Overhead',
          detail: 'Annual Fixed Overhead Budget = 100,000 hrs × $6.00 = $600,000. Monthly Budgeted Fixed OH = $600,000 / 12 = $50,000.',
          mathFormula: '$600,000 / 12 = $50,000',
        },
        {
          stepTitle: 'Step 2: Calculate Fixed Overhead Spending Variance',
          detail: 'Actual Fixed OH ($52,000) - Budgeted Fixed OH ($50,000) = $2,000 Unfavorable (since more was spent than budgeted).',
          mathFormula: '$52,000 - $50,000 = $2,000 U',
        },
        {
          stepTitle: 'Step 3: Calculate Fixed Overhead Volume Variance',
          detail: 'Volume Variance = Budgeted Fixed OH ($50,000) - Applied Fixed OH (8,500 hrs × $6.00 = $51,000) = -$1,000, which is $1,000 Favorable because denominator volume was exceeded.',
          mathFormula: '$50,000 - $51,000 = $1,000 F',
        },
      ],
      distractorAnalysis: {
        A: 'Correct. Spending variance is $2,000 U and Volume variance is $1,000 F.',
        B: 'Incorrect. Reverses variance favorability designations.',
        C: 'Incorrect. Incorrectly calculated monthly budget using the 8,000 flexible hours.',
        D: 'Incorrect. Erroneously assumed Volume variance equals Spending variance.',
      },
    },
    difficulty: 'Hard',
  },
];
