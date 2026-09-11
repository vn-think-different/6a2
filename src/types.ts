export type UserRole = 'admin' | 'sub_admin' | 'student' | 'parent' | 'ambassador';

export interface UserAccount {
  id: string;
  username?: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  avatar: string;
  studentId?: number;
  childName?: string; // For parents
  badge?: string;
  interests?: string; // Sở thích
  personality?: string; // Tính cách
  motto?: string; // Châm ngôn sống / Lời hứa
  dob?: string;
  gender?: 'Nam' | 'Nữ';
  isDefaultPassword?: boolean;
}

export interface Student {
  stt: number;
  name: string;
  dob: string;
  gender: 'Nam' | 'Nữ';
  ethnicity: string;
  bilingual: string;
  roleInClass?: string;
  ambassadorRole?: string;
  avatar: string;
  interests?: string;
  motto?: string;
}

export interface Reaction {
  userId: string;
  userName: string;
  type: 'like' | 'love' | 'care' | 'haha' | 'wow';
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  content: string;
  timestamp: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorRoleTitle: string;
  authorAvatar: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  category: 'thong_bao' | 'goc_co_giao' | 'van_hoa' | 'hoc_tap' | 'nhat_ky' | 'phu_huynh' | 'chia_se';
  categoryLabel: string;
  timestamp: string;
  likes: Reaction[];
  comments: Comment[];
  sharesCount: number;
  status: 'approved' | 'pending' | 'rejected';
  isPinned?: boolean;
  reviewedBy?: string;
  rejectionReason?: string;
  isEdited?: boolean;
  editedAt?: string;
}

export interface ListeningMessage {
  id: string;
  studentName: string;
  studentId: string;
  category: 'listen' | 'study' | 'friend' | 'happy' | 'other';
  categoryTitle: string;
  content: string;
  timestamp: string;
  status: 'received' | 'replied';
  teacherReply?: string;
  repliedAt?: string;
}

export interface TeacherPraise {
  id: string;
  date: string;
  recipient: string;
  reason: string;
  icon: string;
  teacherName: string;
}

export interface ChangeStory {
  id: string;
  studentName: string;
  month: string;
  title: string;
  before: string;
  after: string;
  reflection: string;
  imageUrl?: string;
  likes: number;
}

export interface Ambassador {
  id: string;
  title: string;
  icon: string;
  color: string;
  studentName: string;
  studentStt: number;
  mission: string;
  avatar: string;
}

export interface GoodDeedWeekly {
  id: string;
  weekNumber: number;
  theme: string;
  description: string;
  submissions: {
    id: string;
    studentName: string;
    studentAvatar: string;
    description: string;
    evidenceUrl?: string;
    timestamp: string;
    likes: number;
    verified: boolean;
  }[];
}

export interface CultureMailboxItem {
  id: string;
  senderName: string;
  type: 'good_action' | 'need_help' | 'conflict' | 'safety';
  typeTitle: string;
  content: string;
  timestamp: string;
  status: 'pending' | 'processing' | 'resolved';
  teacherNote?: string;
}

export interface ParentSuggestion {
  id: string;
  parentName: string;
  studentName: string;
  phoneOrEmail?: string;
  type: 'gop_y' | 'phan_anh' | 'dong_hanh' | 'dong_vien';
  typeTitle: string;
  content: string;
  timestamp: string;
  status: 'new' | 'reviewed' | 'resolved';
  teacherResponse?: string;
  selectedActivity?: string; // For companion registration
}

export interface ParentActionProof {
  id: string;
  suggestion: string;
  classAction: string;
  result: string;
  status: 'Hoàn thành' | 'Đang triển khai';
  date: string;
}

export interface StudyDocument {
  id: string;
  subject: string;
  title: string;
  type: 'pdf' | 'doc' | 'slide' | 'quiz' | 'image' | 'lesson';
  description: string;
  content?: string;
  author: string;
  authorRole?: string;
  date: string;
  downloadUrl?: string;
  attachmentName?: string;
  attachmentDataUrl?: string;
  attachmentSize?: string;
  images?: string[];
  size: string;
  pinned?: boolean;
  likes?: number;
}

export interface ScheduleEvent {
  id: string;
  dayOfWeek: string;
  date: string;
  subjectOrEvent: string;
  type: 'class' | 'test' | 'task' | 'activity';
  time: string;
  description: string;
  important?: boolean;
}

export interface StudentProduct {
  id: string;
  title: string;
  subject: string;
  authors: string;
  type: 'Slide PowerPoint' | 'Poster' | 'Video clip' | 'Mô hình STEM' | 'Dự án';
  thumbnailUrl: string;
  date: string;
  description: string;
  likes: number;
}

export interface DiaryTimelineItem {
  id: string;
  period: string; // e.g. "Tháng 9/2026 - Tuần 1"
  title: string;
  mediaType: 'image' | 'video' | 'story';
  mediaUrl: string;
  caption: string;
  date: string;
  author: string;
}

export interface ClassVlog {
  id: string;
  episode: string;
  title: string;
  duration: string;
  thumbnail: string;
  videoEmbedUrl?: string;
  description: string;
  views: number;
  date: string;
}

export interface ProgressRating {
  category: string;
  name: string;
  stars: number;
  totalRatings: number;
  distribution: { [star: number]: number };
}

export interface ClassPoll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  totalVotes: number;
  userVotedOptionId?: string;
  author: string;
  status: 'open' | 'closed';
}

export interface AISolutionStep {
  stepNumber: number;
  title: string;
  explanation: string;
  mathExpression?: string;
  tip?: string;
}

export interface AISolutionDiagram {
  type: 'none' | 'map' | 'venn' | 'geometry' | 'number_line' | 'bar_chart' | 'flowchart' | 'science' | 'english_flashcard' | 'mindmap';
  title: string;
  description: string;
  chartData?: { label: string; value: number; color?: string; note?: string }[];
  visualPoints?: string[];
  imageUrl?: string;
  badge?: string;
}

export interface AIFinalAnswer {
  result: string;
  conclusion: string;
  verification?: string;
  similarExercise?: string;
}

export interface AIExerciseSolution {
  id?: string;
  timestamp?: string;
  problemSummary: string;
  subject: string;
  topic: string;
  givenData: string[];
  toFind: string;
  keyConcepts: string[];
  steps: AISolutionStep[];
  visualDiagram?: AISolutionDiagram;
  finalAnswer: AIFinalAnswer;
  teacherEncouragement?: string;
  userPrompt?: string;
  userImage?: string;
}

export interface AISavedExercise extends AIExerciseSolution {
  savedAt: string;
}
