import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Post,
  AISavedExercise,
  StudyDocument,
  ScheduleEvent,
  TeacherPraise,
  ListeningMessage,
  CultureMailboxItem,
  ParentSuggestion,
  ClassPoll,
  UserAccount
} from '../types';

// ==========================================
// 1. POSTS SERVICE (Sync Class 6A2 Feed)
// ==========================================
export function subscribeToPosts(
  callback: (posts: Post[]) => void,
  fallbackPosts: Post[]
): () => void {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          // If Firestore is empty initially, seed or return fallback
          callback(fallbackPosts);
          return;
        }
        const loadedPosts: Post[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Post;
          loadedPosts.push({ ...data, id: docSnap.id });
        });
        // Sort descending by id or timestamp
        loadedPosts.sort((a, b) => (b.id > a.id ? 1 : -1));
        callback(loadedPosts);
      },
      (error) => {
        console.warn('[Firestore] Notice listening to posts, using local cache:', error.message);
        callback(fallbackPosts);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('[Firestore] Could not attach listener to posts:', err);
    callback(fallbackPosts);
    return () => {};
  }
}

export async function savePostToCloud(post: Post): Promise<void> {
  try {
    const docRef = doc(db, 'posts', post.id);
    await setDoc(docRef, {
      ...post,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[Firestore] Error saving post to cloud:', err);
  }
}

export async function deletePostFromCloud(postId: string): Promise<void> {
  try {
    const docRef = doc(db, 'posts', postId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('[Firestore] Error deleting post from cloud:', err);
  }
}

// ========================================================
// 2. SAVED EXERCISES & RAG NOTEBOOK (Học Cùng AI)
// ========================================================
export function subscribeToSavedExercises(
  userId: string,
  callback: (exercises: AISavedExercise[]) => void,
  fallbackExercises: AISavedExercise[]
): () => void {
  try {
    const collRef = collection(db, 'saved_exercises');
    // Listen for exercises matching this user or global exercises
    const q = query(collRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          callback(fallbackExercises);
          return;
        }
        const loaded: AISavedExercise[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as any;
          if (!data.userId || data.userId === userId || userId === 'admin' || userId === 'tuyetnhi') {
            loaded.push({ ...data, id: docSnap.id });
          }
        });
        loaded.sort((a, b) => (b.savedAt || '').localeCompare(a.savedAt || ''));
        callback(loaded.length > 0 ? loaded : fallbackExercises);
      },
      (error) => {
        console.warn('[Firestore] Saved exercises listener error, using local fallback:', error.message);
        callback(fallbackExercises);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('[Firestore] Could not subscribe to saved exercises:', err);
    callback(fallbackExercises);
    return () => {};
  }
}

export async function saveExerciseToCloud(
  exercise: AISavedExercise,
  user: UserAccount
): Promise<void> {
  try {
    const docId = exercise.id || 'sol_' + Date.now();
    const docRef = doc(db, 'saved_exercises', docId);
    await setDoc(docRef, {
      ...exercise,
      id: docId,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      cloudSavedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[Firestore] Error saving exercise to cloud:', err);
  }
}

export async function deleteExerciseFromCloud(exerciseId: string): Promise<void> {
  try {
    const docRef = doc(db, 'saved_exercises', exerciseId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('[Firestore] Error deleting exercise from cloud:', err);
  }
}

// ========================================================
// 3. STUDENT RAG PROFILE & PERSONALIZED AI MEMORY
// ========================================================
export interface StudentRAGProfile {
  userId: string;
  studentName: string;
  gradeLevel: string; // "Lớp 6"
  preferredLearningStyle: 'Trực quan & Hình ảnh' | 'Từng bước sư phạm' | 'Âm thanh & Đọc to' | 'Ví dụ thực tế';
  targetSubjects: string[];
  weakAreas: string[];
  recentTopics: string[];
  customAiInstructions?: string;
  memoryPoints: string[];
}

export const DEFAULT_RAG_PROFILE: StudentRAGProfile = {
  userId: 'default',
  studentName: 'Học sinh 6A2',
  gradeLevel: 'Lớp 6 (THCS)',
  preferredLearningStyle: 'Trực quan & Hình ảnh',
  targetSubjects: ['Toán học', 'Mỹ thuật', 'Lịch sử & Địa lý', 'Khoa học tự nhiên'],
  weakAreas: ['Bố cục tranh sông núi', 'Quy tắc tập hợp', 'Xác định phương hướng bản đồ'],
  recentTopics: ['Vẽ tranh phong cảnh thiên nhiên', 'Vị trí biển đảo Hoàng Sa', 'Tập hợp B'],
  customAiInstructions: 'Thầy/Cô hãy dùng ngôn từ trong sáng, khích lệ, hướng dẫn từng bước và cung cấp nhiều hình vẽ/sơ đồ minh họa trực quan.',
  memoryPoints: [
    'Học sinh thích vẽ tranh phong cảnh và các bài tập có sơ đồ trực quan.',
    'Cần giải thích kỹ các bước toán học và quy tắc xa gần trong mỹ thuật.'
  ]
};

export function subscribeToStudentRAGProfile(
  userId: string,
  userName: string,
  callback: (profile: StudentRAGProfile) => void
): () => void {
  try {
    const docRef = doc(db, 'student_rag_profiles', userId);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          callback(docSnap.data() as StudentRAGProfile);
        } else {
          const newProfile: StudentRAGProfile = {
            ...DEFAULT_RAG_PROFILE,
            userId,
            studentName: userName || 'Học sinh 6A2',
          };
          callback(newProfile);
        }
      },
      (error) => {
        console.warn('[Firestore] RAG profile subscription error:', error.message);
        callback({ ...DEFAULT_RAG_PROFILE, userId, studentName: userName });
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('[Firestore] Could not subscribe to RAG profile:', err);
    callback({ ...DEFAULT_RAG_PROFILE, userId, studentName: userName });
    return () => {};
  }
}

export async function saveStudentRAGProfile(profile: StudentRAGProfile): Promise<void> {
  try {
    const docRef = doc(db, 'student_rag_profiles', profile.userId);
    await setDoc(
      docRef,
      {
        ...profile,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('[Firestore] Error saving student RAG profile to cloud:', err);
  }
}

// ========================================================
// 4. STUDY DOCUMENTS & SCHEDULE EVENTS
// ========================================================
export function subscribeToStudyDocs(
  callback: (docs: StudyDocument[]) => void,
  fallbackDocs: StudyDocument[]
): () => void {
  try {
    const collRef = collection(db, 'study_documents');
    const unsubscribe = onSnapshot(
      collRef,
      (snapshot) => {
        if (snapshot.empty) {
          callback(fallbackDocs);
          return;
        }
        const loaded: StudyDocument[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push({ ...(docSnap.data() as StudyDocument), id: docSnap.id });
        });
        callback(loaded);
      },
      (err) => {
        console.warn('[Firestore] Study docs error:', err);
        callback(fallbackDocs);
      }
    );
    return unsubscribe;
  } catch {
    callback(fallbackDocs);
    return () => {};
  }
}

export async function saveStudyDocToCloud(docData: StudyDocument): Promise<void> {
  try {
    const docRef = doc(db, 'study_documents', docData.id);
    await setDoc(docRef, docData, { merge: true });
  } catch (err) {
    console.warn('[Firestore] Error saving study doc:', err);
  }
}

export async function deleteStudyDocFromCloud(docId: string): Promise<void> {
  try {
    const docRef = doc(db, 'study_documents', docId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('[Firestore] Error deleting study doc:', err);
  }
}
