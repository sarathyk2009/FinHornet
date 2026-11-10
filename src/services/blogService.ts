import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: 'Cost Management' | 'Exam Strategy' | 'Financial Reporting' | 'Internal Controls' | 'Planning & Budgeting';
  author: string;
  publishedAt: string;
  readTime: string;
  tags: string[];
  isPublished: boolean;
}

export const INITIAL_BLOGS: BlogPost[] = [
  {
    id: 'blog-cma-001',
    title: 'Mastering Absorption vs. Variable Costing: The Ultimate CMA Part 1 Guide',
    slug: 'mastering-absorption-vs-variable-costing',
    excerpt: 'Understand fixed manufacturing overhead deferral, inventory changes, and the exact operating income reconciliation formula tested on the ICMA exam.',
    category: 'Cost Management',
    author: 'FinHornet CMA Academic Team',
    publishedAt: 'Oct 24, 2026',
    readTime: '6 min read',
    tags: ['Absorption Costing', 'Variable Costing', 'Domain C', 'Inventory Reconciliation'],
    isPublished: true,
    content: `
### Why Absorption vs. Variable Costing is the #1 Trap on US CMA Part 1

On the US CMA Part 1 exam (Domain C: Cost Management), examiners frequently test whether operating income will be higher under absorption costing or variable costing when production exceeds or falls below sales.

#### 1. The Core Distinction
* **Variable Costing (Direct Costing)**: Treats Fixed Manufacturing Overhead (FOH) as a **period cost**, expensed in its entirety in the period incurred.
* **Absorption Costing (Full Costing / GAAP / IFRS)**: Treats Fixed Manufacturing Overhead as a **product cost**, attaching FOH to each unit produced. FOH only enters Cost of Goods Sold when the inventory is actually sold.

#### 2. The Golden Rule of Inventory Movement
* **Production > Sales**: Ending inventory increases. Fixed overhead is deferred in ending inventory. **Absorption Income > Variable Income**.
* **Production < Sales**: Ending inventory decreases. Previously deferred fixed overhead is released to COGS. **Variable Income > Absorption Income**.
* **Production = Sales**: Ending inventory remains unchanged. **Absorption Income = Variable Income**.

#### 3. The Official Reconciliation Formula
$$\\text{Absorption Operating Income} - \\text{Variable Operating Income} = (\\text{Units Produced} - \\text{Units Sold}) \\times \\text{Fixed Overhead Rate per Unit}$$

$$\\Delta \\text{Operating Income} = \\Delta \\text{Inventory Units} \\times \\text{Predetermined FOH Rate}$$

#### 4. Exam Strategy Tip
When calculating unit product cost under variable costing, **never include fixed factory overhead or selling/administrative costs**. Only include:
1. Direct Materials (DM)
2. Direct Labor (DL)
3. Variable Manufacturing Overhead (VMOH)
    `.trim(),
  },
  {
    id: 'blog-cma-002',
    title: 'CMA Part 1 Time Management: How to Master the 108-Second Rule',
    slug: 'cma-part-1-time-management-108-second-rule',
    excerpt: 'With 100 MCQs in 180 minutes, you have exactly 108 seconds per question. Learn the 3-pass triage method used by candidates who score 400+.',
    category: 'Exam Strategy',
    author: 'Sarathy K, CMA Lead',
    publishedAt: 'Oct 20, 2026',
    readTime: '5 min read',
    tags: ['Prometric Strategy', 'Pacing', 'Time Management', '108-Second Rule'],
    isPublished: true,
    content: `
### The Mathematics of Prometric Exam Pacing

The US CMA Part 1 Exam consists of two distinct segments:
1. **Multiple-Choice Questions (MCQs)**: 100 questions in 3 hours (180 minutes).
2. **Essay Scenarios**: 2 multi-part scenario problems in 1 hour (60 minutes).

To qualify for the essay section, candidates must score at least **50% raw score on the MCQs**. But to secure a scaled passing score of 360/500, a consistent raw accuracy of 72–75%+ is required.

#### The 108-Second Benchmark
$$180 \\text{ minutes} \\times 60 \\text{ seconds} = 10,800 \\text{ seconds}$$
$$10,800 \\div 100 \\text{ questions} = 108 \\text{ seconds per question (1 min 48 sec)}$$

#### The 3-Pass Prometric Strategy
* **Pass 1: Definitional & Direct Concept Questions (40–60 seconds)**:
  Answer straightforward conceptual questions in internal controls (Domain E), technology (Domain F), and regulatory reporting (Domain A) immediately.
* **Pass 2: Standard Two-Step Calculations (90–120 seconds)**:
  Solve cost allocations, breakeven points, and single-variance questions.
* **Pass 3: Complex Multi-Step Scenarios & Flagged Items (120–180 seconds)**:
  Use remaining banked time for long variance tree decompositions or multi-year capital budgeting depreciation schedules.

#### Common Pitfall to Avoid
Never spend more than 3 minutes on any single question. If a problem feels like a calculation maze, flag it, pick your best educated guess, and move forward!
    `.trim(),
  },
  {
    id: 'blog-cma-003',
    title: 'Standard Costing Variance Analysis: The 4-Variance Overhead Matrix',
    slug: 'standard-costing-variance-analysis-overhead-matrix',
    excerpt: 'Deconstruct Fixed and Variable Overhead into Spending, Efficiency, and Volume Variances without confusing formulas.',
    category: 'Cost Management',
    author: 'FinHornet CMA Academic Team',
    publishedAt: 'Oct 16, 2026',
    readTime: '7 min read',
    tags: ['Standard Costing', 'Variance Analysis', 'Fixed Overhead', 'Volume Variance'],
    isPublished: true,
    content: `
### Deconstructing the 4-Variance Overhead Framework

Manufacturing overhead variances are often considered the most algebraically challenging topic in CMA Part 1. Here is how to master the 4-variance system cleanly:

#### 1. Variable Overhead Variances
* **VOH Spending (Rate) Variance**:
  $$\\text{Actual Hours (AH)} \\times (\\text{Actual Rate (AR)} - \\text{Standard Rate (SR)})$$
  Measures whether we paid more or less per machine/labor hour than budgeted.
* **VOH Efficiency Variance**:
  $$(\\text{Actual Hours (AH)} - \\text{Standard Hours Allowed (SHA)}) \\times \\text{Standard Rate (SR)}$$
  Measures whether we consumed more activity base hours than standard allowed for actual output.

#### 2. Fixed Overhead Variances
* **FOH Spending (Budget) Variance**:
  $$\\text{Actual Fixed Overhead} - \\text{Budgeted Lump-Sum Fixed Overhead}$$
  Measures differences in contractual lease costs, factory salaries, or property taxes.
* **FOH Volume (Denominator) Variance**:
  $$\\text{Budgeted Fixed Overhead} - \\text{Applied Fixed Overhead}$$
  $$\\text{Budgeted FOH} - (\\text{Standard Hours Allowed} \\times \\text{FOH Predetermined Rate})$$
  Measures capacity utilization. If actual production volume was lower than normal planned capacity, the volume variance is **Unfavorable** (under-applied fixed overhead).

#### Summary Checklist
Remember: The Fixed Overhead Volume Variance is **solely driven by production volume**, completely unaffected by actual spending!
    `.trim(),
  },
  {
    id: 'blog-cma-004',
    title: 'Top 5 Internal Control Weaknesses Tested in CMA Part 1 Domain E',
    slug: 'top-5-internal-control-weaknesses-cma-part-1',
    excerpt: 'Master COSO 2013 Internal Control - Integrated Framework components, principles, and classic segregation of duties exam questions.',
    category: 'Internal Controls',
    author: 'Sarathy K, CMA Lead',
    publishedAt: 'Oct 11, 2026',
    readTime: '5 min read',
    tags: ['COSO Framework', 'Internal Controls', 'Domain E', 'Segregation of Duties'],
    isPublished: true,
    content: `
### The 5 COSO Framework Components (CRIME)

Domain E tests how management assesses enterprise risk and designs robust internal controls.

#### The CRIME Mnemonic
1. **Control Environment**: Tone at the top, ethical values, board independence.
2. **Risk Assessment**: Identifying risks to financial reporting, fraud risks.
3. **Control Activities**: Policies, authorisations, physical security, IT safeguards.
4. **Information & Communication**: Reliable accounting information flow.
5. **Monitoring Activities**: Ongoing evaluations, internal audit function.

#### Segregation of Incompatible Functions (CAR)
No single employee should control more than one of the following:
* **C**ustody of assets (handling cash, checks, inventory warehouse).
* **A**uthorization of transactions (approving invoices, signing purchase orders).
* **R**econciliation / Record-keeping (posting to general ledger, preparing bank reconciliations).

If an accounts payable clerk has authorization to approve invoices and access to blank checks, an acute internal control deficiency exists.
    `.trim(),
  },
];

const LOCAL_STORAGE_KEY = 'finhornet_blogs';

export async function getBlogsFromFirestore(): Promise<BlogPost[]> {
  try {
    const colRef = collection(db, 'blogs');
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      const items: BlogPost[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as BlogPost;
        items.push({ ...data, id: docSnap.id });
      });
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
      return items;
    }
  } catch (error) {
    console.warn('Could not fetch blogs from Firestore, falling back to local seed:', error);
  }

  // Fallback to local storage or initial blogs
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {
      // ignore
    }
  }

  return INITIAL_BLOGS;
}

export async function saveBlogToFirestore(blog: BlogPost): Promise<void> {
  try {
    const cleanId = blog.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const docRef = doc(db, 'blogs', cleanId);
    await setDoc(docRef, { ...blog, id: cleanId }, { merge: true });

    // Update local cache
    const current = await getBlogsFromFirestore();
    const idx = current.findIndex((b) => b.id === cleanId);
    const updated = idx >= 0 ? current.map((b) => (b.id === cleanId ? blog : b)) : [blog, ...current];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving blog to Firestore:', error);
    throw error;
  }
}

export async function deleteBlogFromFirestore(blogId: string): Promise<void> {
  try {
    const docRef = doc(db, 'blogs', blogId);
    await deleteDoc(docRef);

    // Update local cache
    const current = await getBlogsFromFirestore();
    const filtered = current.filter((b) => b.id !== blogId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting blog from Firestore:', error);
    throw error;
  }
}
