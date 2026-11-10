import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, auth, isUserAdmin } from './firebase';
import { Question } from '../types';
import { CMA_QUESTIONS } from '../data/cmaQuestions';

export const QUESTIONS_COLLECTION = 'questions';

/**
 * Serializes a Question for Cloud Firestore storage.
 * Cloud Firestore does NOT support nested arrays (e.g. tableData.rows: [ [a, b], [c, d] ]).
 * We convert rows into an array of objects ({ cells: [...] }), which is fully supported by Firestore,
 * and strip undefined values.
 */
export function serializeQuestionForFirestore(q: any): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(q)) {
    if (value === undefined) continue;

    if (key === 'tableData' && value && typeof value === 'object') {
      const td = value as any;
      result.tableData = {
        title: td.title || '',
        headers: Array.isArray(td.headers) ? td.headers : [],
        rows: Array.isArray(td.rows)
          ? td.rows.map((row: any) => ({
              cells: Array.isArray(row) ? row : [row],
            }))
          : [],
      };
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeObjectForFirestore(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

function sanitizeObjectForFirestore(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj;

  const sanitized: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      sanitized[k] =
        typeof v === 'object' && v !== null && !Array.isArray(v)
          ? sanitizeObjectForFirestore(v)
          : v;
    }
  }
  return sanitized;
}

/**
 * Deserializes Firestore document data back into the Question interface,
 * restoring tableData.rows as (string | number)[][].
 */
export function deserializeQuestionFromFirestore(id: string, data: any): Question {
  let tableData: any = undefined;

  if (data.tableData) {
    const rawRows = data.tableData.rows;
    let convertedRows: (string | number)[][] = [];

    if (Array.isArray(rawRows)) {
      convertedRows = rawRows.map((r: any) => {
        if (r && Array.isArray(r.cells)) {
          return r.cells;
        }
        if (Array.isArray(r)) {
          return r;
        }
        return [r];
      });
    }

    tableData = {
      title: data.tableData.title,
      headers: Array.isArray(data.tableData.headers) ? data.tableData.headers : [],
      rows: convertedRows,
    };
  }

  return {
    id,
    part: data.part || 'part1',
    domain: data.domain || 'Financial Planning & Performance',
    subtopic: data.subtopic || 'General',
    scenario: data.scenario || '',
    questionText: data.questionText || '',
    tableData,
    options: Array.isArray(data.options)
      ? data.options
      : [
          { id: 'A', text: data.optionA || 'Option A' },
          { id: 'B', text: data.optionB || 'Option B' },
          { id: 'C', text: data.optionC || 'Option C' },
          { id: 'D', text: data.optionD || 'Option D' },
        ],
    correctOption: (data.correctOption || 'A') as 'A' | 'B' | 'C' | 'D',
    conciseHint: data.conciseHint || '',
    explanation:
      typeof data.explanation === 'object' && data.explanation !== null
        ? data.explanation
        : {
            summary: typeof data.explanation === 'string' ? data.explanation : '',
            steps: [],
            distractorAnalysis: {
              A: 'Analysis for option A',
              B: 'Analysis for option B',
              C: 'Analysis for option C',
              D: 'Analysis for option D',
            },
          },
    difficulty: data.difficulty || 'Exam Standard',
    isFreeTrialSample: Boolean(data.isFreeTrialSample),
  };
}

/**
 * Fetch all exam questions from Firestore.
 * If Firestore is initially empty, seeds default CMA questions so practice tests are immediately available.
 */
export async function getQuestionsFromFirestore(): Promise<{
  questions: Question[];
  fromFirestore: boolean;
  seeded: boolean;
}> {
  try {
    const colRef = collection(db, QUESTIONS_COLLECTION);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      if (auth.currentUser && isUserAdmin(auth.currentUser.email)) {
        console.log('Firestore questions collection is empty. Seeding initial questions as authorized admin...');
        try {
          await seedInitialQuestionsToFirestore();
          return {
            questions: CMA_QUESTIONS,
            fromFirestore: true,
            seeded: true,
          };
        } catch (seedErr) {
          console.warn('Auto-seed error:', seedErr);
        }
      }
      return {
        questions: CMA_QUESTIONS,
        fromFirestore: false,
        seeded: false,
      };
    }

    const fetchedQuestions: Question[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      fetchedQuestions.push(deserializeQuestionFromFirestore(d.id, data));
    });

    return {
      questions: fetchedQuestions,
      fromFirestore: true,
      seeded: false,
    };
  } catch (error: any) {
    console.error('Failed to load questions from Firestore, falling back to local dataset:', error);
    return {
      questions: CMA_QUESTIONS,
      fromFirestore: false,
      seeded: false,
    };
  }
}

/**
 * Seed initial CMA questions to Firestore in batches
 */
export async function seedInitialQuestionsToFirestore(): Promise<number> {
  const batch = writeBatch(db);
  let count = 0;

  for (const q of CMA_QUESTIONS) {
    const qDoc = doc(db, QUESTIONS_COLLECTION, q.id);
    const dataToSave = serializeQuestionForFirestore({
      ...q,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    batch.set(qDoc, dataToSave, { merge: true });
    count++;
  }

  await batch.commit();
  console.log(`Successfully seeded ${count} questions to Firestore.`);
  return count;
}

/**
 * Add a new question to Firestore
 */
export async function addQuestionToFirestore(
  question: Omit<Question, 'id'> & { id?: string }
): Promise<string> {
  const newId =
    question.id && question.id.trim() !== ''
      ? question.id.trim()
      : `cma-${question.part || 'p1'}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

  const docRef = doc(db, QUESTIONS_COLLECTION, newId);
  const dataToSave = serializeQuestionForFirestore({
    ...question,
    id: newId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  await setDoc(docRef, dataToSave);
  return newId;
}

/**
 * Update an existing question in Firestore
 */
export async function updateQuestionInFirestore(
  questionId: string,
  updates: Partial<Question>
): Promise<void> {
  const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
  const dataToSave = serializeQuestionForFirestore({
    ...updates,
    updatedAt: new Date().toISOString(),
  });
  await updateDoc(docRef, dataToSave);
}

/**
 * Delete a question from Firestore
 */
export async function deleteQuestionFromFirestore(questionId: string): Promise<void> {
  const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
  await deleteDoc(docRef);
}

/**
 * Bulk upload an array of questions to Firestore
 */
export async function bulkUploadQuestionsToFirestore(
  questions: Array<Omit<Question, 'id'> & { id?: string }>
): Promise<{ added: number; errors: number }> {
  let added = 0;
  let errors = 0;

  // Process in batches of 250 (Firestore limit is 500)
  const batchSize = 250;
  for (let i = 0; i < questions.length; i += batchSize) {
    const chunk = questions.slice(i, i + batchSize);
    const batch = writeBatch(db);

    for (const q of chunk) {
      try {
        const id =
          q.id && q.id.trim() !== ''
            ? q.id.trim()
            : `cma-${q.part || 'p1'}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

        const docRef = doc(db, QUESTIONS_COLLECTION, id);
        const dataToSave = serializeQuestionForFirestore({
          ...q,
          id,
          uploadedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        batch.set(docRef, dataToSave, { merge: true });
        added++;
      } catch (err) {
        console.error('Error preparing question for batch:', err);
        errors++;
      }
    }

    await batch.commit();
  }

  return { added, errors };
}

/**
 * Parse CSV format into Question objects
 * Expected columns:
 * part,domain,subtopic,scenario,questionText,optionA,optionB,optionC,optionD,correctOption,conciseHint,explanationSummary,difficulty
 */
export function parseCSVQuestions(csvContent: string): Question[] {
  const rows = parseCSVRows(csvContent);
  if (rows.length < 2) {
    throw new Error('CSV must contain a header row and at least one data row.');
  }

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const colIndex = (name: string): number => header.findIndex((h) => h === name.toLowerCase());

  const idxPart = colIndex('part');
  const idxDomain = colIndex('domain');
  const idxSubtopic = colIndex('subtopic');
  const idxScenario = colIndex('scenario');
  const idxQuestionText = colIndex('questiontext') !== -1 ? colIndex('questiontext') : colIndex('question');
  const idxOptA = colIndex('optiona');
  const idxOptB = colIndex('optionb');
  const idxOptC = colIndex('optionc');
  const idxOptD = colIndex('optiond');
  const idxCorrect = colIndex('correctoption') !== -1 ? colIndex('correctoption') : colIndex('correctanswer');
  const idxHint = colIndex('concisehint') !== -1 ? colIndex('concisehint') : colIndex('hint');
  const idxExplanation = colIndex('explanationsummary') !== -1 ? colIndex('explanationsummary') : colIndex('explanation');
  const idxDifficulty = colIndex('difficulty');

  if (idxQuestionText === -1 || idxOptA === -1 || idxCorrect === -1) {
    throw new Error('CSV must contain headers: questionText, optionA, optionB, optionC, optionD, correctOption');
  }

  const result: Question[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.length === 0 || (row.length === 1 && !row[0].trim())) continue;

    const qText = row[idxQuestionText]?.trim() || '';
    if (!qText) continue;

    const optA = row[idxOptA]?.trim() || '';
    const optB = row[idxOptB]?.trim() || '';
    const optC = row[idxOptC]?.trim() || '';
    const optD = row[idxOptD]?.trim() || '';

    const rawCorrect = (row[idxCorrect]?.trim() || 'A').toUpperCase();
    const correctOpt = ['A', 'B', 'C', 'D'].includes(rawCorrect) ? (rawCorrect as 'A' | 'B' | 'C' | 'D') : 'A';

    const partRaw = (row[idxPart]?.trim() || 'part1').toLowerCase();
    const part = partRaw.includes('2') ? 'part2' : 'part1';

    const domain = row[idxDomain]?.trim() || 'Financial Planning & Performance';
    const subtopic = row[idxSubtopic]?.trim() || 'Core Principles';
    const scenario = row[idxScenario]?.trim() || '';
    const conciseHint = row[idxHint]?.trim() || '';
    const explanationText = row[idxExplanation]?.trim() || 'Review official standard principles and formulas.';
    const difficultyRaw = row[idxDifficulty]?.trim() || 'Exam Standard';
    const difficulty = ['Medium', 'Hard', 'Exam Standard'].includes(difficultyRaw)
      ? (difficultyRaw as 'Medium' | 'Hard' | 'Exam Standard')
      : 'Exam Standard';

    const id = `csv-q-${Date.now().toString(36)}-${r}`;

    result.push({
      id,
      part,
      domain,
      subtopic,
      scenario,
      questionText: qText,
      options: [
        { id: 'A', text: optA },
        { id: 'B', text: optB },
        { id: 'C', text: optC },
        { id: 'D', text: optD },
      ],
      correctOption: correctOpt,
      conciseHint,
      explanation: {
        summary: explanationText,
        steps: [
          {
            stepTitle: 'Official Solution & Math',
            detail: explanationText,
          },
        ],
        distractorAnalysis: {
          A: correctOpt === 'A' ? 'Correct answer.' : 'Incorrect option distractor.',
          B: correctOpt === 'B' ? 'Correct answer.' : 'Incorrect option distractor.',
          C: correctOpt === 'C' ? 'Correct answer.' : 'Incorrect option distractor.',
          D: correctOpt === 'D' ? 'Correct answer.' : 'Incorrect option distractor.',
        },
      },
      difficulty,
      isFreeTrialSample: false,
    });
  }

  return result;
}

/**
 * Standard RFC-4180 CSV parser supporting multiline fields and escaped quotes
 */
function parseCSVRows(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (insideQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++; // skip next quote
      } else if (char === '"') {
        insideQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
      } else if (char === '\r') {
        // ignore carriage return
      } else if (char === '\n') {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

/**
 * Parse JSON questions
 */
export function parseJSONQuestions(jsonContent: string): Question[] {
  const parsed = JSON.parse(jsonContent);
  const items = Array.isArray(parsed) ? parsed : parsed.questions || [parsed];

  return items.map((item: any, idx: number) => {
    const qText = item.questionText || item.question || '';
    if (!qText) {
      throw new Error(`Item ${idx + 1} is missing "questionText"`);
    }

    let options = item.options;
    if (!Array.isArray(options)) {
      options = [
        { id: 'A', text: item.optionA || 'Option A' },
        { id: 'B', text: item.optionB || 'Option B' },
        { id: 'C', text: item.optionC || 'Option C' },
        { id: 'D', text: item.optionD || 'Option D' },
      ];
    }

    const rawCorrect = (item.correctOption || item.correctAnswer || 'A').toString().toUpperCase();
    const correctOption = ['A', 'B', 'C', 'D'].includes(rawCorrect) ? (rawCorrect as 'A' | 'B' | 'C' | 'D') : 'A';

    return {
      id: item.id || `json-q-${Date.now().toString(36)}-${idx}`,
      part: item.part === 'part2' ? 'part2' : 'part1',
      domain: item.domain || 'Performance Management',
      subtopic: item.subtopic || 'General',
      scenario: item.scenario || '',
      questionText: qText,
      tableData: item.tableData,
      options,
      correctOption,
      conciseHint: item.conciseHint || '',
      explanation:
        typeof item.explanation === 'object' && item.explanation !== null
          ? item.explanation
          : {
              summary: typeof item.explanation === 'string' ? item.explanation : 'Detailed official explanation.',
              steps: item.steps || [],
              distractorAnalysis: item.distractorAnalysis || {
                A: 'Distractor analysis',
                B: 'Distractor analysis',
                C: 'Distractor analysis',
                D: 'Distractor analysis',
              },
            },
      difficulty: item.difficulty || 'Exam Standard',
      isFreeTrialSample: Boolean(item.isFreeTrialSample),
    };
  });
}
