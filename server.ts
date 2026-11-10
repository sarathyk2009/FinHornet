import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

import crypto from 'crypto';
import fs from 'fs';
import Razorpay from 'razorpay';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Razorpay SDK using environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder',
});

// Initialize server-side Firestore instance
let firestoreDb: any = null;
try {
  const firebaseConfigPath = path.resolve(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(firebaseConfigPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
    const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    firestoreDb = getFirestore(
      firebaseApp,
      firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== ''
        ? firebaseConfig.firestoreDatabaseId
        : '(default)'
    );
  }
} catch (e) {
  console.warn('Server Firebase Firestore initialization warning:', e);
}

// In-memory mapping of orderId to userId for resilient Firestore updates
const orderUserMap = new Map<string, string>();

const PLAN_PRICES_INR: Record<string, number> = {
  monthly: 350,
  monthly_sprint: 350,
  'monthly-sprint': 350,
  'monthly-pass': 350,
  'monthly_pass': 350,
  six_month: 1499,
  'six-month': 1499,
  'six_months': 1499,
  annual: 2499,
  default: 350,
};

function calculatePlanPriceRupees(planId?: string): number {
  if (!planId) return 350;
  const key = planId.toLowerCase().trim();
  if (PLAN_PRICES_INR[key]) {
    return PLAN_PRICES_INR[key];
  }
  if (key.includes('six') || key.includes('6')) {
    return 1499;
  }
  if (key.includes('annual') || key.includes('year')) {
    return 2499;
  }
  return 350;
}

// Initialize Gemini SDK with User-Agent header as required by guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface ChatMessage {
  role: 'user' | 'model' | 'assistant';
  content: string;
}

// Multi-turn Gemini Chat endpoint for FinHornet AI
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { messages, context, questionContext, model: requestedModel } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Valid messages array is required' });
    }

    // Default to gemini-3.8-flash, or use user requested model
    const allowedModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-4-argon'];
    const modelToUse = allowedModels.includes(requestedModel) ? requestedModel : 'gemini-3.8-flash';

    // Format hidden context for active question if available
    const activeQ =
      questionContext ||
      (context && (context.activeQuestion || context.question)) ||
      (context && context.questionText ? context : null);

    let hiddenQuestionContext = '';
    if (activeQ) {
      const parts: string[] = [];
      parts.push('=== ACTIVE EXAM QUESTION (HIDDEN CONTEXT & GROUND TRUTH) ===');

      if (activeQ.domain || activeQ.subtopic) {
        parts.push(`Domain / Topic: ${[activeQ.domain, activeQ.subtopic].filter(Boolean).join(' > ')}`);
      }

      // Full question text (including scenario and question stem)
      const fullText =
        activeQ.fullText ||
        [activeQ.scenario, activeQ.questionText].filter(Boolean).join('\n\n') ||
        activeQ.questionText ||
        '';
      if (fullText) {
        parts.push(`Full Question Text:\n${fullText}`);
      }

      // Data table if present
      if (activeQ.tableData && activeQ.tableData.headers) {
        parts.push('Data Table / Exhibits:');
        if (activeQ.tableData.title) parts.push(`Title: ${activeQ.tableData.title}`);
        parts.push(`Headers: ${activeQ.tableData.headers.join(' | ')}`);
        if (Array.isArray(activeQ.tableData.rows)) {
          activeQ.tableData.rows.forEach((r: any[]) => {
            parts.push(`Row: ${Array.isArray(r) ? r.join(' | ') : JSON.stringify(r)}`);
          });
        }
      }

      // Options
      if (Array.isArray(activeQ.options) && activeQ.options.length > 0) {
        parts.push('Options:');
        activeQ.options.forEach((opt: any) => {
          const optLabel = opt.id || opt.label || '';
          const optText = opt.text || opt.description || opt;
          parts.push(`- Option ${optLabel}: ${optText}`);
        });
      }

      // Correct Answer
      const correctOpt = activeQ.correctOption || activeQ.correctAnswer || '';
      const correctText =
        activeQ.correctAnswerText ||
        (Array.isArray(activeQ.options)
          ? activeQ.options.find((o: any) => o.id === correctOpt)?.text
          : '');
      parts.push(`Correct Answer: Option ${correctOpt}${correctText ? ` (${correctText})` : ''}`);

      // Step-by-Step Explanation & Math
      parts.push('Official Step-by-Step Explanation & Mathematical Solution:');
      if (typeof activeQ.explanation === 'string') {
        parts.push(activeQ.explanation);
      } else if (activeQ.explanationText) {
        parts.push(activeQ.explanationText);
      }

      if (activeQ.explanation && typeof activeQ.explanation === 'object') {
        if (activeQ.explanation.summary) {
          parts.push(`Summary: ${activeQ.explanation.summary}`);
        }
        if (activeQ.conciseHint || activeQ.explanation.conciseHint) {
          parts.push(`Key Formula / Concept: ${activeQ.conciseHint || activeQ.explanation.conciseHint}`);
        }
        if (Array.isArray(activeQ.explanation.steps)) {
          activeQ.explanation.steps.forEach((st: any, idx: number) => {
            parts.push(`Step ${idx + 1} [${st.stepTitle || 'Math'}]: ${st.detail}`);
            if (st.mathFormula) {
              parts.push(`Formula / Calculation: ${st.mathFormula}`);
            }
          });
        }
        if (activeQ.explanation.distractorAnalysis) {
          parts.push('Distractor Analysis (Why false options fail):');
          Object.entries(activeQ.explanation.distractorAnalysis).forEach(([k, v]) => {
            parts.push(`- Option ${k}: ${v}`);
          });
        }
      } else if (Array.isArray(activeQ.stepByStepExplanation)) {
        activeQ.stepByStepExplanation.forEach((st: any, idx: number) => {
          parts.push(`Step ${idx + 1} [${st.stepTitle || 'Math'}]: ${st.detail}`);
          if (st.mathFormula) {
            parts.push(`Formula / Calculation: ${st.mathFormula}`);
          }
        });
        if (activeQ.distractorAnalysis) {
          parts.push('Distractor Analysis:');
          Object.entries(activeQ.distractorAnalysis).forEach(([k, v]) => {
            parts.push(`- Option ${k}: ${v}`);
          });
        }
      }

      if (activeQ.userAnswer) {
        parts.push(`Student's Current Selected Answer: Option ${activeQ.userAnswer}`);
      }

      parts.push('=== END OF ACTIVE EXAM QUESTION CONTEXT ===');
      hiddenQuestionContext = parts.join('\n');
    }

    // Ensure contents starts with 'user' turn and alternates roles properly
    let userFound = false;
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    for (const m of messages) {
      const role: 'user' | 'model' = m.role === 'model' || m.role === 'assistant' ? 'model' : 'user';
      if (!userFound && role === 'model') {
        continue; // Skip leading greeting message
      }
      userFound = true;
      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        contents[contents.length - 1].parts[0].text += '\n\n' + m.content;
      } else {
        contents.push({
          role,
          parts: [{ text: m.content }],
        });
      }
    }

    if (contents.length === 0) {
      return res.status(400).json({ error: 'No user messages provided' });
    }

    // Pass the active question's full text, options, correct answer, and step-by-step explanation as hidden context into the Gemini API request
    if (hiddenQuestionContext) {
      for (let i = contents.length - 1; i >= 0; i--) {
        if (contents[i].role === 'user') {
          contents[i].parts[0].text = `${hiddenQuestionContext}\n\nCandidate Question / Query:\n${contents[i].parts[0].text}`;
          break;
        }
      }
    }

    const systemInstruction =
      'You are an expert financial and accounting exam tutor. Always base your calculations and explanations strictly on the provided question data and official solution. Show step-by-step math clearly and never guess.';

    const geminiPromise = ai.models.generateContent({
      model: modelToUse,
      contents,
      config: {
        systemInstruction,
        temperature: 0.1,
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API call timed out')), 25000)
    );

    const response = await Promise.race([geminiPromise, timeoutPromise]);
    const replyText =
      response.text ||
      "I am ready to review your question data. Please let me know what calculation or concept you'd like to break down.";

    return res.json({
      reply: replyText,
      model: modelToUse,
    });
  } catch (error: any) {
    console.error('Gemini chat handled with fallback:', error?.message || error);

    const activeQ =
      req.body?.questionContext ||
      (req.body?.context && (req.body.context.activeQuestion || req.body.context.question)) ||
      (req.body?.context?.questionText ? req.body.context : null);

    let fallbackAnswer = '';

    if (activeQ) {
      const correctOpt = activeQ.correctOption || activeQ.correctAnswer || '';
      const correctText =
        activeQ.correctAnswerText ||
        (Array.isArray(activeQ.options)
          ? activeQ.options.find((o: any) => o.id === correctOpt)?.text
          : '');

      let expDetail = '';
      if (typeof activeQ.explanation === 'string') {
        expDetail = activeQ.explanation;
      } else if (activeQ.explanationText) {
        expDetail = activeQ.explanationText;
      } else if (activeQ.explanation?.summary) {
        expDetail = activeQ.explanation.summary;
        if (Array.isArray(activeQ.explanation.steps)) {
          expDetail +=
            '\n\n' +
            activeQ.explanation.steps
              .map(
                (s: any, idx: number) =>
                  `Step ${idx + 1} (${s.stepTitle}): ${s.detail} ${s.mathFormula ? `[${s.mathFormula}]` : ''}`
              )
              .join('\n');
        }
      } else if (Array.isArray(activeQ.stepByStepExplanation)) {
        expDetail = activeQ.stepByStepExplanation
          .map(
            (s: any, idx: number) =>
              `Step ${idx + 1} (${s.stepTitle}): ${s.detail} ${s.mathFormula ? `[${s.mathFormula}]` : ''}`
          )
          .join('\n');
      }

      fallbackAnswer =
        `### FinHornet AI • Active Question Solution 🐝\n\n` +
        `**Official Correct Answer**: **Option ${correctOpt}${correctText ? ` - ${correctText}` : ''}**\n\n` +
        `**Step-by-Step Calculation & Explanation**:\n${expDetail || 'Refer to the official solution steps provided.'}\n\n` +
        (activeQ.conciseHint ? `💡 **Key Principle**: ${activeQ.conciseHint}` : '');
    } else {
      // Build context-aware fallback response tailored to user's question
      const lastUserMsg = (req.body?.messages || [])
        .filter((m: any) => m.role === 'user')
        .pop()?.content?.toLowerCase() || '';

      if (lastUserMsg.includes('variance')) {
        fallbackAnswer =
          "### FinHornet AI • Standard Costing Variances Guide 🐝\n\n" +
          "Here is the foolproof **3-Prong Variance Framework** tested on US CMA Part 1:\n\n" +
          "1. **Direct Material Price Variance (DMPV)**:\n" +
          "   $$(Actual Price - Standard Price) \\times Actual Quantity Purchased$$\n" +
          "   *Responsible: Purchasing Manager*\n\n" +
          "2. **Direct Material Quantity / Usage Variance (DMQV)**:\n" +
          "   $$(Actual Quantity Used - Standard Quantity Allowed) \\times Standard Price$$\n" +
          "   *Responsible: Production Supervisor*\n\n" +
          "3. **Direct Labor Rate Variance (DLRV)**:\n" +
          "   $$(Actual Rate - Standard Rate) \\times Actual Hours Worked$$\n\n" +
          "4. **Direct Labor Efficiency Variance (DLEV)**:\n" +
          "   $$(Actual Hours - Standard Hours Allowed) \\times Standard Rate$$\n\n" +
          "💡 **Exam Tip**: When Actual Cost > Standard Cost, variance is **Unfavorable (U)**. Standard Hours Allowed $(SQ)$ must always be based on **actual output units produced**, not budgeted units!";
      } else if (lastUserMsg.includes('absorption') || lastUserMsg.includes('variable')) {
        fallbackAnswer =
          "### FinHornet AI • Absorption vs. Variable Costing 🐝\n\n" +
          "The critical difference is how **Fixed Manufacturing Overhead (FOH)** is treated:\n\n" +
          "- **Absorption Costing (GAAP/IFRS)**: Fixed MOH is treated as a **product cost** and inventoried until units are sold.\n" +
          "- **Variable Costing (Internal Decision Making)**: Fixed MOH is treated entirely as a **period cost** and expensed immediately in full.\n\n" +
          "📊 **Operating Income Reconciliation Rule**:\n" +
          "$$\\text{Absorption Income} - \\text{Variable Income} = \\text{Change in Inventory Units} \\times \\text{FOH Rate per Unit}$$\n\n" +
          "- When **Production > Sales**: Inventory increases $\\rightarrow$ Fixed MOH is deferred $\\rightarrow$ **Absorption Income > Variable Income**.\n" +
          "- When **Production < Sales**: Inventory decreases $\\rightarrow$ Fixed MOH is released $\\rightarrow$ **Absorption Income < Variable Income**.";
      } else if (lastUserMsg.includes('nerve') || lastUserMsg.includes('pacing') || lastUserMsg.includes('time')) {
        fallbackAnswer =
          "### FinHornet AI • Where Numbers Meet Nerve 🐝\n\n" +
          "Conquering the 4-Hour Prometric CBT Exam:\n\n" +
          "1. **Pacing Target**: 100 MCQs in 3 hours = **1 minute 48 seconds per question**.\n" +
          "2. **The 3-Pass Method**:\n" +
          "   - **Pass 1 (0 to 60 mins)**: Answer pure definitions and short calculation questions immediately. Flag heavy multi-step computations.\n" +
          "   - **Pass 2 (60 to 140 mins)**: Solve flagged variance, capital budgeting, and cash flow questions with your on-screen calculator.\n" +
          "   - **Pass 3 (140 to 170 mins)**: Review flagged items. **Never leave any question blank** — eliminate distractors and guess if necessary.\n" +
          "3. **Exhibits Strategy**: Read the question stem *first*, then scan the specific exhibit column (Cost Card or General Ledger) to avoid data overload!";
      } else {
        fallbackAnswer =
          "### FinHornet AI Mentor 🐝\n\n" +
          "Welcome to FinHornet — *Where Numbers Meet Nerve*!\n\n" +
          "I am your expert US CMA exam mentor. Whenever you view any question on the platform, I automatically synchronize with its scenario, data exhibits, answer choices, and step-by-step mathematical solutions.\n\n" +
          "Ask me to break down any step, explain the math, or clarify why a distractor is incorrect!";
      }
    }

    return res.status(200).json({
      reply: fallbackAnswer,
      isFallback: true,
      error: error?.message || 'Gemini service fallback',
    });
  }
});

// ==========================================
// Razorpay Payment Integration Endpoints
// ==========================================

// GET /api/payment/config: Safely returns the Razorpay Key ID
app.get('/api/payment/config', (_req: Request, res: Response) => {
  const keyId =
    process.env.RAZORPAY_KEY_ID ||
    process.env.VITE_RAZORPAY_KEY_ID ||
    '';
  return res.status(200).json({ keyId });
});

// POST /api/payment/create-order: Creates a Razorpay order with dynamic price calculation
app.post('/api/payment/create-order', async (req: Request, res: Response) => {
  try {
    const { planId, userId, amount } = req.body;

    // Receive the selected plan and effective discounted price (e.g., amount = 350) from the client
    // Ensure the server creates the Razorpay order using this exact discounted price:
    // const finalAmount = Math.round(Number(req.body.amount || 350) * 100); // 35000 paise = Rs. 350
    const resolvedPrice = Number(amount || (planId ? calculatePlanPriceRupees(planId) : 350) || 350);
    const finalAmount = Math.round(Number(req.body.amount || resolvedPrice || 350) * 100);
    const receipt = `rec_${Date.now()}`;

    try {
      const order = await razorpay.orders.create({
        amount: finalAmount,
        currency: 'INR',
        receipt,
      });

      if (userId && order && order.id) {
        orderUserMap.set(order.id, userId);
      }

      return res.status(200).json({
        orderId: order.id,
        amount: order.amount,
        currency: 'INR',
      });
    } catch (orderError: any) {
      console.warn('Razorpay live order creation error:', orderError?.message || orderError);

      // In development or when using test placeholder credentials, gracefully provide simulated order
      const isPlaceholder =
        !process.env.RAZORPAY_KEY_ID ||
        process.env.RAZORPAY_KEY_ID === 'rzp_test_placeholder' ||
        !process.env.RAZORPAY_KEY_SECRET ||
        process.env.RAZORPAY_KEY_SECRET === 'rzp_secret_placeholder';

      if (isPlaceholder) {
        const mockOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        if (userId) {
          orderUserMap.set(mockOrderId, userId);
        }
        return res.status(200).json({
          orderId: mockOrderId,
          amount: finalAmount,
          currency: 'INR',
        });
      }

      return res.status(500).json({
        error: orderError?.message || 'Failed to create Razorpay order',
      });
    }
  } catch (error: any) {
    console.error('Error in /api/payment/create-order:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/payment/test-signature: Generates HMAC signature for test environments
app.post('/api/payment/test-signature', (req: Request, res: Response) => {
  const { orderId, paymentId } = req.body;
  if (!orderId || !paymentId) {
    return res.status(400).json({ error: 'orderId and paymentId are required' });
  }
  const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder';
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return res.json({ signature });
});

// POST /api/payment/verify: Verifies HMAC-SHA256 signature and updates Firestore user record
app.post('/api/payment/verify', async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required payment verification parameters: razorpay_order_id, razorpay_payment_id, razorpay_signature',
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder';
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature',
      });
    }

    // Determine target user to update in Firestore
    const targetUserId = userId || orderUserMap.get(razorpay_order_id);

    if (targetUserId && firestoreDb) {
      try {
        const userRef = doc(firestoreDb, 'users', targetUserId);
        await setDoc(
          userRef,
          {
            hasActivePass: true,
            isPremium: true,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        console.log(`Firestore user record for ${targetUserId} updated: hasActivePass: true`);
      } catch (dbError) {
        console.error('Failed to update user record in Firestore:', dbError);
      }
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error in /api/payment/verify:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🐝 FinHornet server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
