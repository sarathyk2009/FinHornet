import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { CouponCode, UserDiscount } from '../types';

export const DEFAULT_COUPONS: CouponCode[] = [
  {
    id: 'coupon-save20',
    code: 'SAVE20',
    discountType: 'percentage',
    discountValue: 20,
    expirationDate: '2026-12-31',
    usageLimit: 500,
    usageCount: 42,
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: 'sarathyk2009@gmail.com',
  },
  {
    id: 'coupon-cma100',
    code: 'CMA100',
    discountType: 'flat',
    discountValue: 100,
    expirationDate: '2026-12-31',
    usageLimit: 200,
    usageCount: 18,
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: 'sarathyk2009@gmail.com',
  },
  {
    id: 'coupon-diwali',
    code: 'FESTIVE50',
    discountType: 'percentage',
    discountValue: 50,
    expirationDate: '2026-11-30',
    usageLimit: 100,
    usageCount: 35,
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: 'sarathyk2009@gmail.com',
  },
];

export const DEFAULT_USER_DISCOUNTS: UserDiscount[] = [
  {
    id: 'disc-sarathy',
    email: 'sarathyk2009@gmail.com',
    candidateName: 'Sarathy K',
    discountType: 'percentage',
    discountValue: 65,
    monthlyPrice: 349,
    sixMonthPrice: 999,
    discountPercent: 65,
    note: 'VIP Founding Candidate Direct Waiver',
    assignedByRole: 'admin',
    assignedAt: new Date().toISOString(),
    assignedBy: 'sarathyk2009@gmail.com',
  },
];

/**
 * Fetch all coupons from Firestore with local storage fallback
 */
export async function getCouponsFromFirestore(): Promise<{
  coupons: CouponCode[];
  fromFirestore: boolean;
}> {
  try {
    const colRef = collection(db, 'coupons');
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      const coupons: CouponCode[] = [];
      snapshot.forEach((d) => {
        coupons.push(d.data() as CouponCode);
      });
      localStorage.setItem('finnerd_coupons', JSON.stringify(coupons));
      return { coupons, fromFirestore: true };
    }
  } catch (error) {
    console.warn('Error fetching coupons from Firestore, using cache/defaults:', error);
  }

  // Fallback to local storage or defaults
  const saved = localStorage.getItem('finnerd_coupons');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { coupons: parsed, fromFirestore: false };
      }
    } catch {
      // ignore
    }
  }

  return { coupons: DEFAULT_COUPONS, fromFirestore: false };
}

/**
 * Save a coupon to Firestore and local storage
 */
export async function saveCouponToFirestore(coupon: CouponCode): Promise<void> {
  // Always update local cache first
  const saved = localStorage.getItem('finnerd_coupons');
  let currentList: CouponCode[] = saved ? JSON.parse(saved) : DEFAULT_COUPONS;
  currentList = [coupon, ...currentList.filter((c) => c.id !== coupon.id)];
  localStorage.setItem('finnerd_coupons', JSON.stringify(currentList));

  try {
    const docRef = doc(db, 'coupons', coupon.id);
    await setDoc(docRef, coupon);
  } catch (error) {
    console.warn('Could not write coupon to Firestore (saved locally):', error);
  }
}

/**
 * Delete a coupon from Firestore and local storage
 */
export async function deleteCouponFromFirestore(couponId: string): Promise<void> {
  const saved = localStorage.getItem('finnerd_coupons');
  if (saved) {
    const currentList: CouponCode[] = JSON.parse(saved);
    localStorage.setItem(
      'finnerd_coupons',
      JSON.stringify(currentList.filter((c) => c.id !== couponId))
    );
  }

  try {
    const docRef = doc(db, 'coupons', couponId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Could not delete coupon from Firestore (deleted locally):', error);
  }
}

/**
 * Toggle coupon active status
 */
export async function toggleCouponStatusInFirestore(
  couponId: string,
  isActive: boolean
): Promise<void> {
  const saved = localStorage.getItem('finnerd_coupons');
  if (saved) {
    const currentList: CouponCode[] = JSON.parse(saved);
    const updated = currentList.map((c) => (c.id === couponId ? { ...c, isActive } : c));
    localStorage.setItem('finnerd_coupons', JSON.stringify(updated));
  }

  try {
    const docRef = doc(db, 'coupons', couponId);
    await updateDoc(docRef, { isActive });
  } catch (error) {
    console.warn('Could not toggle coupon status in Firestore:', error);
  }
}

/**
 * Fetch all candidate email discounts from Firestore with local storage fallback
 */
export async function getUserDiscountsFromFirestore(): Promise<{
  discounts: UserDiscount[];
  fromFirestore: boolean;
}> {
  try {
    const colRef = collection(db, 'discounts');
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      const discounts: UserDiscount[] = [];
      snapshot.forEach((d) => {
        discounts.push(d.data() as UserDiscount);
      });
      localStorage.setItem('finnerd_user_discounts', JSON.stringify(discounts));
      return { discounts, fromFirestore: true };
    }
  } catch (error) {
    console.warn('Error fetching email discounts from Firestore, using cache/defaults:', error);
  }

  const saved = localStorage.getItem('finnerd_user_discounts');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { discounts: parsed, fromFirestore: false };
      }
    } catch {
      // ignore
    }
  }

  return { discounts: DEFAULT_USER_DISCOUNTS, fromFirestore: false };
}

/**
 * Save an email-specific candidate discount
 */
export async function saveUserDiscountToFirestore(discount: UserDiscount): Promise<void> {
  const saved = localStorage.getItem('finnerd_user_discounts');
  let currentList: UserDiscount[] = saved ? JSON.parse(saved) : DEFAULT_USER_DISCOUNTS;
  currentList = [
    discount,
    ...currentList.filter((d) => d.email.toLowerCase() !== discount.email.toLowerCase()),
  ];
  localStorage.setItem('finnerd_user_discounts', JSON.stringify(currentList));

  try {
    const docRef = doc(db, 'discounts', discount.id);
    await setDoc(docRef, discount);
  } catch (error) {
    console.warn('Could not write user discount to Firestore (saved locally):', error);
  }
}

/**
 * Delete an email discount
 */
export async function deleteUserDiscountFromFirestore(discountId: string): Promise<void> {
  const saved = localStorage.getItem('finnerd_user_discounts');
  if (saved) {
    const currentList: UserDiscount[] = JSON.parse(saved);
    localStorage.setItem(
      'finnerd_user_discounts',
      JSON.stringify(currentList.filter((d) => d.id !== discountId))
    );
  }

  try {
    const docRef = doc(db, 'discounts', discountId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Could not delete user discount from Firestore:', error);
  }
}
