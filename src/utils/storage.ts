import {
  collection, doc, onSnapshot, setDoc, deleteDoc,
  query, orderBy,
} from 'firebase/firestore';
import type { QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../firebase';
import type { Goal } from '../types';

function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}

// ── Goals ────────────────────────────────────────────────────────
export function subscribeGoals(onData: (items: Goal[]) => void, onError?: () => void) {
  const q = query(collection(db, 'goals'), orderBy('createdAt', 'desc'));
  return onSnapshot(q,
    (snap: QuerySnapshot<DocumentData>) => {
      onData(snap.docs.map(d => {
        const data = d.data();
        const goal: Goal = {
          milestones: [],
          ...(data as Partial<Goal>),
          id: d.id,
        } as Goal;
        return goal;
      }));
    },
    () => onError?.(),
  );
}

export async function saveGoal(goal: Goal) {
  await setDoc(doc(db, 'goals', goal.id), stripUndefined(goal));
}

export async function deleteGoal(id: string) {
  await deleteDoc(doc(db, 'goals', id));
}

// ── CASHFLOW savings balance (read-only) ─────────────────────────
export function subscribeSavingsBalance(onData: (amount: number) => void) {
  return onSnapshot(doc(db, 'cashflow_settings', 'savings'), snap => {
    onData(snap.exists() ? ((snap.data().amount as number) ?? 0) : 0);
  }, () => onData(0));
}

// ── RINGI applications (for investment link) ─────────────────────
export interface RingiApplication {
  id: string;
  status: string;
  amount: number;
  item: string;
  applicant?: string;
}

export function subscribeRingiApplications(onData: (apps: RingiApplication[]) => void) {
  return onSnapshot(collection(db, 'applications'), snap => {
    onData(snap.docs.map(d => ({ id: d.id, ...d.data() } as RingiApplication)));
  }, () => onData([]));
}
