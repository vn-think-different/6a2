import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  query,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Post,
  AISavedExercise,
  StudyDocument,
  UserAccount
} from '../types';

export interface StoredUser extends UserAccount {
  password?: string;
}

/**
 * Utility to recursively clean undefined properties from objects
 * so Firestore setDoc / updateDoc never throws "Unsupported field value: undefined".
 */
export function cleanForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as any;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanForFirestore(item)) as any;
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return obj;
}

// ==========================================
// 1. USERS & AUTHENTICATION CLOUD SYNC
// ==========================================

export function subscribeToUsers(
  callback: (users: StoredUser[]) => void,
  fallbackUsers: StoredUser[]
): () => void {
  try {
    const usersRef = collection(db, 'users');
    const unsubscribe = onSnapshot(
      usersRef,
      async (snapshot) => {
        if (snapshot.empty) {
          // First time database initialization: seed all initial users to cloud
          try {
            const batch = writeBatch(db);
            fallbackUsers.forEach((u) => {
              const uRef = doc(db, 'users', u.id);
              batch.set(uRef, cleanForFirestore(u));
            });
            await batch.commit();
          } catch (seedErr) {
            console.warn('[Firestore] Initial users seed batch error:', seedErr);
          }
          callback(fallbackUsers);
          return;
        }

        const loadedUsers: StoredUser[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as StoredUser;
          loadedUsers.push({ ...data, id: docSnap.id });
        });

        // Sort users: admin first, then sub_admin, then student STT or name
        loadedUsers.sort((a, b) => {
          if (a.role === 'admin') return -1;
          if (b.role === 'admin') return 1;
          if (a.studentId && b.studentId) return a.studentId - b.studentId;
          return a.name.localeCompare(b.name, 'vi');
        });

        callback(loadedUsers);
      },
      (error) => {
        console.warn('[Firestore] Users listener notice, fallback cache used:', error.message);
        callback(fallbackUsers);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('[Firestore] Could not attach listener to users collection:', err);
    callback(fallbackUsers);
    return () => {};
  }
}

export async function saveUserToCloud(user: StoredUser): Promise<void> {
  try {
    const docRef = doc(db, 'users', user.id);
    const cleaned = cleanForFirestore({
      ...user,
      cloudUpdatedAt: new Date().toISOString(),
    });
    await setDoc(docRef, cleaned, { merge: true });
  } catch (err) {
    console.warn('[Firestore] Error saving user to cloud:', err);
  }
}

export async function deleteUserFromCloud(userId: string): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('[Firestore] Error deleting user from cloud:', err);
  }
}

export async function fetchUserFromCloud(userId: string): Promise<StoredUser | null> {
  try {
    const docRef = doc(db, 'users', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...(snap.data() as StoredUser), id: snap.id };
    }
  } catch (err) {
    console.warn('[Firestore] Error fetching user from cloud:', err);
  }
  return null;
}

export async function queryUserByUsernameFromCloud(usernameSlug: string): Promise<StoredUser | null> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', usernameSlug));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      return { ...(docSnap.data() as StoredUser), id: docSnap.id };
    }
  } catch (err) {
    console.warn('[Firestore] Error querying user by username from cloud:', err);
  }
  return null;
}

// ==========================================
// 2. POSTS SERVICE (Sync Class 6A2 Feed)
// ==========================================

export function subscribeToPosts(
  callback: (posts: Post[]) => void,
  fallbackPosts: Post[]
): () => void {
  try {
    const postsRef = collection(db, 'posts');
    const unsubscribe = onSnapshot(
      postsRef,
      async (snapshot) => {
        if (snapshot.empty) {
          // If Firestore is empty initially, seed fallback posts to cloud
          try {
            const batch = writeBatch(db);
            fallbackPosts.forEach((p) => {
              const pRef = doc(db, 'posts', p.id);
              batch.set(pRef, cleanForFirestore(p));
            });
            await batch.commit();
          } catch (seedErr) {
            console.warn('[Firestore] Initial posts seed batch error:', seedErr);
          }
          callback(fallbackPosts);
          return;
        }

        const loadedPosts: Post[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Post;
          loadedPosts.push({ ...data, id: docSnap.id });
        });

        // Sort descending: newest first
        loadedPosts.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return (b.id || '').localeCompare(a.id || '');
        });

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
    const cleaned = cleanForFirestore({
      ...post,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(docRef, cleaned, { merge: true });
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
// 3. SAVED EXERCISES & RAG NOTEBOOK (Học Cùng AI)
// ========================================================

export function subscribeToSavedExercises(
  userId: string,
  callback: (exercises: AISavedExercise[]) => void,
  fallbackExercises: AISavedExercise[]
): () => void {
  try {
    const collRef = collection(db, 'saved_exercises');
    const unsubscribe = onSnapshot(
      collRef,
      (snapshot) => {
        if (snapshot.empty) {
          callback(fallbackExercises);
          return;
        }
        const loaded: AISavedExercise[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as any;
          if (!data.userId || data.userId === userId || userId === 'admin' || userId === 'teacher-nhi') {
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
    const cleaned = cleanForFirestore({
      ...exercise,
      id: docId,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      cloudSavedAt: new Date().toISOString(),
    });
    await setDoc(docRef, cleaned, { merge: true });
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
// 4. STUDENT RAG PROFILE & PERSONALIZED AI MEMORY
// ========================================================

export interface StudentRAGProfile {
  userId: string;
  studentName: string;
  gradeLevel: string;
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
    const cleaned = cleanForFirestore({
      ...profile,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(docRef, cleaned, { merge: true });
  } catch (err) {
    console.warn('[Firestore] Error saving student RAG profile to cloud:', err);
  }
}

// ========================================================
// 5. STUDY DOCUMENTS
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
    const cleaned = cleanForFirestore(docData);
    await setDoc(docRef, cleaned, { merge: true });
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
