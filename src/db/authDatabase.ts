import { UserAccount, Student, UserRole, Post } from '../types';
import { STUDENTS_54, CLASS_INFO, INITIAL_POSTS } from '../data/mockData';
import {
  saveUserToCloud,
  deleteUserFromCloud,
  fetchUserFromCloud,
  queryUserByUsernameFromCloud,
  StoredUser,
} from './firestoreService';

export type { StoredUser };

const STORAGE_USERS_KEY = 'lop6a2_auth_users_db_v1';
const STORAGE_SESSION_KEY = 'lop6a2_current_session_user_v1';
const STORAGE_STUDENTS_KEY = 'lop6a2_students_db_v1';
const STORAGE_POSTS_KEY = 'lop6a2_posts_db_v1';

/**
 * Convert Vietnamese full name to non-accent, lowercase, continuous string.
 * E.g. "Nguyễn Thị Tuyết Nhi" -> "nguyenthituyetnhi"
 * "Đoàn Thiên Bảo" -> "doanthienbao"
 */
export function toSlugUsername(str: string): string {
  if (!str) return '';
  // Remove honorifics if present at beginning like "Cô ", "Thầy ", "Bác ", "Em "
  let cleaned = str
    .replace(/^(Cô|Thầy|Bác|Em|Chị|Anh)\s+/i, '')
    .trim();

  return cleaned
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accent marks
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9]/g, '') // keep only letters and numbers
    .trim();
}

/**
 * Bootstrap default database from 54 students and teacher/parents
 */
export function createInitialUsers(): StoredUser[] {
  const users: StoredUser[] = [];

  // 1. Homeroom Teacher (Main Admin)
  users.push({
    id: 'teacher-nhi',
    username: 'nguyenthituyetnhi',
    password: '123456',
    name: 'Cô Nguyễn Thị Tuyết Nhi',
    role: 'admin',
    roleTitle: 'Giáo viên chủ nhiệm (Quản trị chính)',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    badge: '👑 Admin chính',
    interests: 'Đọc sách giáo dục, Chăm sóc học sinh, Du lịch trải nghiệm',
    personality: 'Tận tâm, bao dung, thấu hiểu, giàu tình cảm',
    motto: 'Mỗi học sinh đều là một đóa hoa với vẻ đẹp riêng cần được nâng niu.',
    dob: '15/09/1988',
    gender: 'Nữ',
    isDefaultPassword: true,
  });

  // 2. Sample Parent Representative
  users.push({
    id: 'parent-bao',
    username: 'doantrongnam',
    password: '123456',
    name: 'Bác Đoàn Trọng Nam (PH em Đoàn Thiên Bảo)',
    role: 'parent',
    roleTitle: 'Phụ huynh học sinh',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    childName: 'Đoàn Thiên Bảo',
    badge: '👨‍👩‍👧 Ban Đại diện PHHS',
    interests: 'Đồng hành cùng con, Nhiếp ảnh gia đình, Thể thao',
    personality: 'Gương mẫu, nhiệt tình, trách nhiệm',
    motto: 'Gia đình và nhà trường cùng chung tay vì tương lai con trẻ.',
    dob: '20/05/1980',
    gender: 'Nam',
    isDefaultPassword: true,
  });

  // 3. All 54 Students
  STUDENTS_54.forEach((st) => {
    const slug = toSlugUsername(st.name);
    let role: UserRole = 'student';
    let roleTitle = 'Học sinh lớp 6A2';
    let badge = `🎒 STT ${st.stt} • 6A2`;

    if (st.stt === 3) {
      // Nguyễn Quỳnh Anh - Lớp trưởng / Admin phụ
      role = 'sub_admin';
      roleTitle = 'Lớp trưởng 6A2 (Quản trị viên phụ)';
      badge = '⭐ Lớp trưởng & Quản trị phụ';
    } else if (st.roleInClass && st.roleInClass.toLowerCase().includes('lớp phó')) {
      role = 'sub_admin';
      roleTitle = `${st.roleInClass} (Ban Cán sự)`;
      badge = '🎖️ Ban Cán sự 6A2';
    } else if (st.ambassadorRole) {
      role = 'ambassador';
      roleTitle = `${st.ambassadorRole}`;
      badge = `🌟 ${st.ambassadorRole}`;
    }

    users.push({
      id: `student-${st.stt}`,
      username: slug,
      password: '123456',
      name: st.name,
      role,
      roleTitle,
      avatar: st.avatar,
      studentId: st.stt,
      badge,
      dob: st.dob,
      gender: st.gender,
      interests: st.interests || 'Đọc sách, Thể thao, Vẽ tranh',
      personality: st.gender === 'Nữ' ? 'Nhẹ nhàng, chăm chỉ, chu đáo' : 'Năng động, nhiệt tình, sáng tạo',
      motto: st.motto || 'Học tập chăm chỉ, đoàn kết cùng bạn bè.',
      isDefaultPassword: true,
    });
  });

  return users;
}

/**
 * Get all users from persistent CSDL
 */
export function getStoredUsers(): StoredUser[] {
  try {
    const data = localStorage.getItem(STORAGE_USERS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading users from localStorage:', e);
  }

  const initial = createInitialUsers();
  saveStoredUsers(initial);
  return initial;
}

/**
 * Save users list into persistent local cache
 */
export function saveStoredUsers(users: StoredUser[]): void {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users to localStorage:', e);
  }
}

/**
 * Get all active students for the class view
 */
export function getStoredStudents(): Student[] {
  try {
    const data = localStorage.getItem(STORAGE_STUDENTS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading students from localStorage:', e);
  }

  // Derive students from initial data
  const initial = [...STUDENTS_54];
  saveStoredStudents(initial);
  return initial;
}

export function saveStoredStudents(students: Student[]): void {
  try {
    localStorage.setItem(STORAGE_STUDENTS_KEY, JSON.stringify(students));
  } catch (e) {
    console.error('Error saving students to localStorage:', e);
  }
}

/**
 * Authenticate by username and password (synchronous from cache).
 */
export function authenticateUser(
  usernameInput: string,
  passwordInput: string
): { success: boolean; user?: StoredUser; message?: string } {
  const users = getStoredUsers();
  const cleanedUsername = toSlugUsername(usernameInput);

  const found = users.find((u) => {
    const userSlug = toSlugUsername(u.username);
    const nameSlug = toSlugUsername(u.name);
    return (
      userSlug === cleanedUsername ||
      nameSlug === cleanedUsername ||
      (cleanedUsername === 'admin' && u.role === 'admin')
    );
  });

  if (!found) {
    return {
      success: false,
      message: 'Tên đăng nhập không tồn tại. Vui lòng nhập họ và tên viết liền không dấu (VD: nguyenthituyetnhi, tranbaonam)',
    };
  }

  if (found.password !== passwordInput.trim()) {
    return {
      success: false,
      message: 'Mật khẩu không chính xác. Mật khẩu mặc định là 123456.',
    };
  }

  return { success: true, user: found };
}

/**
 * Cross-device Cloud-First Authentication:
 * Checks local cache, and if not matched or outdated, queries Cloud Firestore in real-time.
 */
export async function authenticateUserAsync(
  usernameInput: string,
  passwordInput: string
): Promise<{ success: boolean; user?: StoredUser; message?: string }> {
  const cleanedUsername = toSlugUsername(usernameInput);
  const trimmedPassword = passwordInput.trim();

  // 1. Try querying Cloud Firestore first for freshest credentials
  try {
    let cloudUser = await queryUserByUsernameFromCloud(cleanedUsername);
    if (!cloudUser && cleanedUsername === 'admin') {
      cloudUser = await fetchUserFromCloud('teacher-nhi');
    }

    if (cloudUser) {
      // Sync cloud record to local cache
      const users = getStoredUsers();
      const idx = users.findIndex((u) => u.id === cloudUser!.id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...cloudUser };
      } else {
        users.push(cloudUser);
      }
      saveStoredUsers(users);

      if (cloudUser.password === trimmedPassword) {
        return { success: true, user: cloudUser };
      } else {
        return {
          success: false,
          message: 'Mật khẩu không chính xác. Hãy kiểm tra lại mật khẩu bạn đã đổi.',
        };
      }
    }
  } catch (err) {
    console.warn('[Auth] Direct cloud query fallback to local cache:', err);
  }

  // 2. Fallback to local cache verification
  return authenticateUser(usernameInput, passwordInput);
}

/**
 * Save current session user to localStorage
 */
export function saveCurrentSession(user: UserAccount | null): void {
  try {
    if (!user) {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    } else {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
    }
  } catch (e) {
    console.error('Error saving session:', e);
  }
}

/**
 * Get current session user from localStorage
 */
export function getSavedSession(): UserAccount | null {
  try {
    const data = localStorage.getItem(STORAGE_SESSION_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      const users = getStoredUsers();
      const current = users.find((u) => u.id === parsed.id);
      if (current) {
        const { password, ...safeUser } = current;
        return safeUser;
      }
    }
  } catch (e) {
    console.error('Error getting session:', e);
  }
  return null;
}

/**
 * Update personal profile of a user (Avatar, interests, personality, motto, etc.)
 * Saves BOTH locally and to Cloud Firestore.
 */
export function updateUserProfile(
  userId: string,
  updates: Partial<StoredUser>
): StoredUser | null {
  const users = getStoredUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return null;

  const existing = users[index];
  const updated: StoredUser = {
    ...existing,
    ...updates,
    id: existing.id,
  };

  users[index] = updated;
  saveStoredUsers(users);

  // Sync to Cloud Firestore in real-time
  saveUserToCloud(updated);

  // If student, sync into students table
  if (updated.studentId) {
    const students = getStoredStudents();
    const stIndex = students.findIndex((s) => s.stt === updated.studentId);
    if (stIndex !== -1) {
      students[stIndex] = {
        ...students[stIndex],
        name: updated.name || students[stIndex].name,
        avatar: updated.avatar || students[stIndex].avatar,
        interests: updated.interests || students[stIndex].interests,
        motto: updated.motto || students[stIndex].motto,
        gender: updated.gender || students[stIndex].gender,
        dob: updated.dob || students[stIndex].dob,
      };
      saveStoredStudents(students);
    }
  }

  // Update session if it's the current user
  const session = getSavedSession();
  if (session && session.id === userId) {
    const { password, ...safeUser } = updated;
    saveCurrentSession(safeUser);
  }

  return updated;
}

/**
 * Change own password and sync to Cloud Firestore
 */
export function changeUserPassword(
  userId: string,
  currentPass: string,
  newPass: string
): { success: boolean; message: string } {
  const users = getStoredUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) {
    return { success: false, message: 'Không tìm thấy tài khoản người dùng.' };
  }

  if (users[index].password !== currentPass) {
    return { success: false, message: 'Mật khẩu hiện tại không đúng.' };
  }

  if (newPass.length < 4) {
    return { success: false, message: 'Mật khẩu mới phải có ít nhất 4 ký tự.' };
  }

  users[index].password = newPass;
  users[index].isDefaultPassword = false;
  saveStoredUsers(users);

  // Sync to Cloud Firestore in real-time
  saveUserToCloud(users[index]);

  return { success: true, message: 'Đổi mật khẩu thành công! Mật khẩu mới đã được đồng bộ lên Cloud.' };
}

/**
 * Admin or Sub-Admin resets/changes any member's password
 */
export function adminResetUserPassword(
  targetUserId: string,
  newPassword: string = '123456'
): { success: boolean; message: string } {
  const users = getStoredUsers();
  const index = users.findIndex((u) => u.id === targetUserId);
  if (index === -1) {
    return { success: false, message: 'Không tìm thấy tài khoản thành viên.' };
  }

  users[index].password = newPassword;
  users[index].isDefaultPassword = newPassword === '123456';
  saveStoredUsers(users);

  // Sync to Cloud Firestore in real-time
  saveUserToCloud(users[index]);

  return {
    success: true,
    message: `Đã cập nhật mật khẩu cho "${users[index].name}" thành: ${newPassword} (Đã đồng bộ lên Cloud)`,
  };
}

/**
 * Admin adds a new member into class & account DB
 */
export function adminAddNewMember(data: {
  name: string;
  dob: string;
  gender: 'Nam' | 'Nữ';
  role: UserRole;
  roleTitle?: string;
  avatar?: string;
  interests?: string;
  personality?: string;
  motto?: string;
  customPassword?: string;
}): { success: boolean; user?: StoredUser; message: string } {
  const users = getStoredUsers();
  const students = getStoredStudents();

  const slug = toSlugUsername(data.name);
  if (!slug) {
    return { success: false, message: 'Họ tên không hợp lệ để tạo tên đăng nhập.' };
  }

  let finalUsername = slug;
  let counter = 1;
  while (users.some((u) => u.username === finalUsername)) {
    counter++;
    finalUsername = `${slug}${counter}`;
  }

  const newStt = students.length > 0 ? Math.max(...students.map((s) => s.stt)) + 1 : 1;
  const defaultAvatar =
    data.avatar ||
    (data.gender === 'Nữ'
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80');

  const newStudent: Student = {
    stt: newStt,
    name: data.name.trim(),
    dob: data.dob.trim(),
    gender: data.gender,
    ethnicity: 'Kinh',
    bilingual: '',
    roleInClass: data.roleTitle || 'Học sinh 6A2',
    avatar: defaultAvatar,
    interests: data.interests || 'Học tập, Thể thao, Kết nối bạn bè',
    motto: data.motto || 'Đoàn kết, tự tin cùng lớp 6A2 tiến bộ.',
  };

  const newUser: StoredUser = {
    id: `student-${newStt}`,
    username: finalUsername,
    password: data.customPassword?.trim() || '123456',
    name: data.name.trim(),
    role: data.role,
    roleTitle: data.roleTitle || (data.role === 'sub_admin' ? 'Ban Cán sự 6A2' : 'Học sinh lớp 6A2'),
    avatar: defaultAvatar,
    studentId: newStt,
    badge: `🎒 STT ${newStt} • 6A2`,
    dob: data.dob.trim(),
    gender: data.gender,
    interests: data.interests || 'Học tập, Thể thao, Kết nối bạn bè',
    personality: data.personality || (data.gender === 'Nữ' ? 'Nhẹ nhàng, chăm chỉ' : 'Năng động, nhiệt tình'),
    motto: data.motto || 'Đoàn kết, tự tin cùng lớp 6A2 tiến bộ.',
    isDefaultPassword: true,
  };

  students.push(newStudent);
  users.push(newUser);

  saveStoredStudents(students);
  saveStoredUsers(users);

  // Sync new user to Cloud Firestore
  saveUserToCloud(newUser);

  return {
    success: true,
    user: newUser,
    message: `Đã thêm thành công học sinh ${data.name}! Tên đăng nhập: "${finalUsername}", Mật khẩu: "${newUser.password}".`,
  };
}

/**
 * Admin removes a member who left the class
 */
export function adminRemoveMember(
  userId: string
): { success: boolean; message: string } {
  const users = getStoredUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) {
    return { success: false, message: 'Không tìm thấy thành viên để xóa.' };
  }

  const target = users[index];
  if (target.role === 'admin') {
    return { success: false, message: 'Không thể xóa tài khoản Quản trị viên chính.' };
  }

  users.splice(index, 1);
  saveStoredUsers(users);

  if (target.studentId) {
    const students = getStoredStudents();
    const stIndex = students.findIndex((s) => s.stt === target.studentId);
    if (stIndex !== -1) {
      students.splice(stIndex, 1);
      saveStoredStudents(students);
    }
  }

  // Delete from Cloud Firestore
  deleteUserFromCloud(userId);

  return {
    success: true,
    message: `Đã cho thành viên "${target.name}" rời khỏi lớp và hủy tài khoản đăng nhập thành công.`,
  };
}

/**
 * Admin updates / assigns member role & title
 */
export function adminUpdateMemberRole(
  userId: string,
  newRole: UserRole,
  newRoleTitle: string,
  ambassadorRole?: string
): { success: boolean; message: string } {
  const users = getStoredUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) {
    return { success: false, message: 'Không tìm thấy tài khoản thành viên.' };
  }

  const target = users[index];
  target.role = newRole;
  target.roleTitle = newRoleTitle;
  saveStoredUsers(users);

  if (target.studentId) {
    const students = getStoredStudents();
    const stIndex = students.findIndex((s) => s.stt === target.studentId);
    if (stIndex !== -1) {
      students[stIndex].roleInClass = newRoleTitle;
      if (ambassadorRole !== undefined) {
        students[stIndex].ambassadorRole = ambassadorRole;
      }
      saveStoredStudents(students);
    }
  }

  // Sync updated role to Cloud Firestore
  saveUserToCloud(target);

  return {
    success: true,
    message: `Đã cập nhật vai trò của "${target.name}" thành "${newRoleTitle}" thành công!`,
  };
}

/**
 * Get all posts from persistent CSDL
 */
export function getStoredPosts(): Post[] {
  try {
    const data = localStorage.getItem(STORAGE_POSTS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading posts from localStorage:', e);
  }

  const initial = [...INITIAL_POSTS];
  saveStoredPosts(initial);
  return initial;
}

/**
 * Save posts into persistent CSDL
 */
export function saveStoredPosts(posts: Post[]): void {
  try {
    localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(posts));
  } catch (e) {
    console.error('Error saving posts to localStorage:', e);
  }
}
