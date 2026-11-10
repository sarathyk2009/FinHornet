export interface FormulaSection {
  category: string;
  items: { name: string; formula: string; description?: string }[];
}

export const CMA_FORMULA_SHEET: FormulaSection[] = [
  {
    category: 'Cost Management & Variances (Part 1)',
    items: [
      {
        name: 'Direct Materials Price Variance',
        formula: 'AQ × (SP - AP)',
        description: 'AQ = Actual Quantity purchased or used; SP = Standard Price; AP = Actual Price.',
      },
      {
        name: 'Direct Materials Quantity (Efficiency) Variance',
        formula: 'SP × (SQA - AQ)',
        description: 'SQA = Standard Quantity Allowed for actual production; AQ = Actual Quantity used.',
      },
      {
        name: 'Direct Labor Rate Variance',
        formula: 'AH × (SR - AR)',
        description: 'AH = Actual Hours worked; SR = Standard Rate; AR = Actual Rate.',
      },
      {
        name: 'Direct Labor Efficiency Variance',
        formula: 'SR × (SHA - AH)',
        description: 'SHA = Standard Hours Allowed for actual production; AH = Actual Hours worked.',
      },
      {
        name: 'Fixed Overhead Spending (Budget) Variance',
        formula: 'Actual Fixed Overhead - Budgeted Fixed Overhead',
      },
      {
        name: 'Fixed Overhead Production Volume Variance',
        formula: 'Budgeted Fixed Overhead - Applied Fixed Overhead',
        description: 'Applied = Standard Hours Allowed × Standard Fixed OH Rate.',
      },
    ],
  },
  {
    category: 'CVP & Decision Analysis (Part 2)',
    items: [
      {
        name: 'Breakeven Point (Units)',
        formula: 'Total Fixed Costs / Unit Contribution Margin (UCM)',
      },
      {
        name: 'Target Sales with Taxes (Units)',
        formula: '[Total Fixed Costs + (Target Net Income / (1 - Tax Rate))] / UCM',
      },
      {
        name: 'Contribution Margin Ratio',
        formula: 'Total Contribution Margin / Total Sales = UCM / Unit Selling Price',
      },
      {
        name: 'Margin of Safety',
        formula: '(Actual Sales - Breakeven Sales) / Actual Sales',
      },
      {
        name: 'Operating Leverage (DOL)',
        formula: 'Contribution Margin / Operating Income (EBIT)',
      },
      {
        name: 'Minimum Transfer Price',
        formula: 'Incremental Outlay Cost + Opportunity Cost per Unit',
        description: 'Opportunity Cost is zero if excess idle capacity exists; equals lost CM if at capacity.',
      },
    ],
  },
  {
    category: 'Corporate Finance & Working Capital (Part 2)',
    items: [
      {
        name: 'Weighted Average Cost of Capital (WACC)',
        formula: '(Wd × Kd × (1 - t)) + (Wp × Kp) + (We × Ke)',
      },
      {
        name: 'CAPM Cost of Equity (Ke)',
        formula: 'Rf + Beta × (Rm - Rf)',
        description: 'Rf = Risk-free rate; Rm = Expected market return; (Rm - Rf) = Market risk premium.',
      },
      {
        name: 'Cash Conversion Cycle (CCC)',
        formula: 'DSO + DIO - DPO',
        description: 'Days Sales Outstanding + Days Inventory Outstanding - Days Payable Outstanding.',
      },
      {
        name: 'DuPont ROE (3-Stage)',
        formula: 'Net Profit Margin × Asset Turnover × Financial Leverage',
        description: '(Net Income / Sales) × (Sales / Assets) × (Assets / Equity).',
      },
      {
        name: 'Economic Value Added (EVA)',
        formula: 'NOPAT - (Invested Capital × WACC)',
      },
    ],
  },
];
