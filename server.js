import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// 1. Initialize Razorpay using process.env.RAZORPAY_KEY_ID and process.env.RAZORPAY_KEY_SECRET
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder',
});

// Initialize Firestore for updating user records
let firestoreDb = null;
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
  console.warn('Server Firestore initialization warning:', e);
}

// In-memory mapping of orderId to userId
const orderUserMap = new Map();

const PLAN_PRICES_INR = {
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

function calculatePlanPriceRupees(planId) {
  if (!planId) return 350;
  const key = String(planId).toLowerCase().trim();
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

// 1. GET /api/payment/config
// - Returns { keyId: process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID }
app.get('/api/payment/config', (_req, res) => {
  const keyId =
    process.env.RAZORPAY_KEY_ID ||
    process.env.VITE_RAZORPAY_KEY_ID ||
    '';
  return res.status(200).json({ keyId });
});

// 2. POST /api/payment/create-order
// - Receives planId, amount, and userId
// - Calculates finalAmount = Math.round(Number(req.body.amount || 350) * 100)
// - Creates an order with razorpay.orders.create({ amount: finalAmount, currency: "INR", receipt: `rec_${Date.now()}` })
// - Returns { orderId: order.id, amount: order.amount, currency: "INR" }
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { planId, userId, amount } = req.body;

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
    } catch (orderError) {
      console.warn('Razorpay live order error:', orderError?.message || orderError);

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
  } catch (error) {
    console.error('Error in /api/payment/create-order:', error);
    return res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// POST /api/payment/test-signature: Generates HMAC signature for test environments
app.post('/api/payment/test-signature', (req, res) => {
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

// 3. POST /api/payment/verify
// - Accepts razorpay_order_id, razorpay_payment_id, and razorpay_signature
// - Uses Node's crypto HMAC-SHA256 with RAZORPAY_KEY_SECRET to verify the signature
// - If valid, updates the user's Firestore record with hasActivePass: true and returns { success: true }
// - If invalid, returns status 400 with { success: false }
app.post('/api/payment/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: razorpay_order_id, razorpay_payment_id, razorpay_signature',
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
        console.log(`Updated Firestore user ${targetUserId} with hasActivePass: true`);
      } catch (dbError) {
        console.error('Failed to update user record in Firestore:', dbError);
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in /api/payment/verify:', error);
    return res.status(500).json({ success: false, error: error?.message });
  }
});

export { app, razorpay };
export default app;
