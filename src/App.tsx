import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CreatePostModal } from './components/CreatePostModal';
import { ListeningModal } from './components/ListeningModal';
import { ApprovalManagerModal } from './components/ApprovalManagerModal';
import { ProfileEditModal } from './components/ProfileEditModal';
import { AdminAccountManagerModal } from './components/AdminAccountManagerModal';
import { EditPostModal } from './components/EditPostModal';
import { ImageProvider } from './context/ImageContext';

// Views
import { WelcomeLoginView } from './views/WelcomeLoginView';
import { HomeFeedView } from './views/HomeFeedView';
import { TeacherCornerView } from './views/TeacherCornerView';
import { Students54View } from './views/Students54View';
import { CultureAmbassadorView } from './views/CultureAmbassadorView';
import { StudyCornerView } from './views/StudyCornerView';
import { StudyWithAIView } from './views/StudyWithAIView';
import { ParentCompanionView } from './views/ParentCompanionView';
import { DiaryAndVlogView } from './views/DiaryAndVlogView';
import { ClassProgressView } from './views/ClassProgressView';
import { AdminManagementView } from './views/AdminManagementView';

// Types & Mock Data & DB
import {
  UserAccount,
  Post,
  TeacherPraise,
  ListeningMessage,
  ParentSuggestion,
  CultureMailboxItem,
  Student,
  Reaction,
  Comment,
  StudyDocument,
  ScheduleEvent,
} from './types';
import {
  INITIAL_USERS,
  STUDENTS_54,
  INITIAL_POSTS,
  TEACHER_PRAISES,
  CHANGE_STORIES,
  AMBASSADORS,
  GOOD_DEEDS_WEEKLY,
  CULTURE_MAILBOX_ITEMS,
  STUDY_DOCUMENTS,
  SCHEDULE_EVENTS,
  STUDENT_PRODUCTS,
  PARENT_ACTION_PROOFS,
  INITIAL_PARENT_SUGGESTIONS,
  DIARY_TIMELINE,
  CLASS_VLOGS,
  INITIAL_RATINGS,
  INITIAL_POLLS,
  INITIAL_LISTENING_MESSAGES,
  CLASS_INFO,
} from './data/mockData';
import {
  getSavedSession,
  saveCurrentSession,
  getStoredStudents,
  getStoredUsers,
  getStoredPosts,
  saveStoredPosts,
} from './db/authDatabase';
import {
  getStoredStudyDocuments,
  addStudyDocument,
  updateStudyDocument,
  deleteStudyDocument,
  toggleStudyDocumentLike,
  getStoredScheduleEvents,
  addScheduleEvent,
  deleteScheduleEvent,
} from './db/studyCornerDatabase';
import {
  subscribeToPosts,
  savePostToCloud,
  deletePostFromCloud,
  subscribeToStudyDocs,
  saveStudyDocToCloud,
  deleteStudyDocFromCloud,
} from './db/firestoreService';

export default function App() {
  // Check if session exists in DB, otherwise null -> show WelcomeLoginView
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => getSavedSession());
  const [activeTab, setActiveTab] = useState<string>('trang_chu');

  // Modals state
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isListeningModalOpen, setIsListeningModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAdminAccountsModalOpen, setIsAdminAccountsModalOpen] = useState(false);

  // Dynamic state stores
  const [posts, setPosts] = useState<Post[]>(() => getStoredPosts());
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [students, setStudents] = useState<Student[]>(() => getStoredStudents());
  const [praises, setPraises] = useState<TeacherPraise[]>(TEACHER_PRAISES);
  const [listeningMessages, setListeningMessages] = useState<ListeningMessage[]>(INITIAL_LISTENING_MESSAGES);
  const [goodDeeds, setGoodDeeds] = useState(GOOD_DEEDS_WEEKLY);
  const [cultureMailbox, setCultureMailbox] = useState<CultureMailboxItem[]>(CULTURE_MAILBOX_ITEMS);
  const [parentSuggestions, setParentSuggestions] = useState<ParentSuggestion[]>(INITIAL_PARENT_SUGGESTIONS);
  const [actionProofs, setActionProofs] = useState(PARENT_ACTION_PROOFS);
  const [studyDocuments, setStudyDocuments] = useState<StudyDocument[]>(() => getStoredStudyDocuments());
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>(() => getStoredScheduleEvents());

  // Cloud Firestore Real-time Synchronization
  useEffect(() => {
    const unsubPosts = subscribeToPosts((cloudPosts) => {
      setPosts(cloudPosts);
      saveStoredPosts(cloudPosts);
    }, posts);

    const unsubDocs = subscribeToStudyDocs((cloudDocs) => {
      setStudyDocuments(cloudDocs);
    }, studyDocuments);

    return () => {
      unsubPosts();
      unsubDocs();
    };
  }, []);

  // Count pending posts for moderation badge
  const pendingPosts = posts.filter((p) => p.status === 'pending');
  const pendingCount = pendingPosts.length;

  const handleAddStudyDocument = (doc: StudyDocument) => {
    const updated = addStudyDocument(doc);
    setStudyDocuments(updated);
    saveStudyDocToCloud(doc);
  };

  const handleUpdateStudyDocument = (doc: StudyDocument) => {
    const updated = updateStudyDocument(doc);
    setStudyDocuments(updated);
    saveStudyDocToCloud(doc);
  };

  const handleDeleteStudyDocument = (id: string) => {
    const updated = deleteStudyDocument(id);
    setStudyDocuments(updated);
    deleteStudyDocFromCloud(id);
  };

  const handleToggleLikeStudyDocument = (id: string) => {
    const updated = toggleStudyDocumentLike(id);
    setStudyDocuments(updated);
    const target = updated.find((d) => d.id === id);
    if (target) saveStudyDocToCloud(target);
  };

  const handleAddScheduleEvent = (evt: ScheduleEvent) => {
    const updated = addScheduleEvent(evt);
    setScheduleEvents(updated);
  };

  const handleDeleteScheduleEvent = (id: string) => {
    const updated = deleteScheduleEvent(id);
    setScheduleEvents(updated);
  };

  const handleUpdateStudentAvatar = (stt: number, newAvatar: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.stt === stt ? { ...s, avatar: newAvatar } : s))
    );
    if (currentUser?.studentId === stt) {
      setCurrentUser((prev) => prev ? { ...prev, avatar: newAvatar } : null);
    }
  };

  const handleUpdatePostImage = (postId: string, newUrl: string) => {
    const updated = posts.map((p) => (p.id === postId ? { ...p, imageUrl: newUrl } : p));
    setPosts(updated);
    saveStoredPosts(updated);
    const target = updated.find((p) => p.id === postId);
    if (target) savePostToCloud(target);
  };

  // Post Interactions (Facebook reaction style)
  const handleLikePost = (postId: string, reactionType: Reaction['type']) => {
    if (!currentUser) return;
    let targetPost: Post | undefined;
    const updated = posts.map((post) => {
      if (post.id === postId) {
        const existingReactionIndex = post.likes.findIndex((r) => r.userId === currentUser.id);
        const newLikes = [...post.likes];
        if (existingReactionIndex > -1) {
          if (newLikes[existingReactionIndex].type === reactionType) {
            newLikes.splice(existingReactionIndex, 1);
          } else {
            newLikes[existingReactionIndex] = {
              userId: currentUser.id,
              userName: currentUser.name,
              type: reactionType,
            };
          }
        } else {
          newLikes.push({
            userId: currentUser.id,
            userName: currentUser.name,
            type: reactionType,
          });
        }
        const modified = {
          ...post,
          likes: newLikes,
        };
        targetPost = modified;
        return modified;
      }
      return post;
    });
    setPosts(updated);
    saveStoredPosts(updated);
    if (targetPost) savePostToCloud(targetPost);
  };

  const handleCommentPost = (postId: string, content: string) => {
    if (!currentUser) return;
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorRole: currentUser.roleTitle,
      content,
      timestamp: 'Vừa xong',
    };
    let targetPost: Post | undefined;
    const updated = posts.map((post) => {
      if (post.id === postId) {
        const modified = {
          ...post,
          comments: [...post.comments, newComment],
        };
        targetPost = modified;
        return modified;
      }
      return post;
    });
    setPosts(updated);
    saveStoredPosts(updated);
    if (targetPost) savePostToCloud(targetPost);
  };

  // Create post: connected to currentUser permissions
  const handleSubmitPost = (postData: Omit<Post, 'id' | 'likes' | 'comments' | 'sharesCount'>) => {
    if (!currentUser) return;
    // Admins and Sub-admins (Teacher and Class Leaders) are auto-approved
    const isAutoApproved = currentUser.role === 'admin' || currentUser.role === 'sub_admin';

    const newPost: Post = {
      ...postData,
      id: `post-${Date.now()}`,
      likes: [],
      comments: [],
      sharesCount: 0,
      status: isAutoApproved ? 'approved' : 'pending',
    };
    const updated = [newPost, ...posts];
    setPosts(updated);
    saveStoredPosts(updated);
    savePostToCloud(newPost);
  };

  // Edit post handler: authors can edit their own posts; admins/sub-admins can edit any post
  const handleEditPost = (post: Post) => {
    if (!currentUser) return;
    const canModerate = currentUser.role === 'admin' || currentUser.role === 'sub_admin';
    const isAuthor = currentUser.id === post.authorId;
    if (!canModerate && !isAuthor) {
      alert('Bạn không có quyền sửa bài viết này.');
      return;
    }
    setEditingPost(post);
  };

  const handleSaveEditedPost = (
    postId: string,
    updatedData: {
      content: string;
      category?: Post['category'];
      categoryLabel?: string;
      imageUrl?: string;
    }
  ) => {
    let targetPost: Post | undefined;
    const updated = posts.map((p) => {
      if (p.id === postId) {
        const modified = {
          ...p,
          content: updatedData.content,
          ...(updatedData.category ? { category: updatedData.category } : {}),
          ...(updatedData.categoryLabel ? { categoryLabel: updatedData.categoryLabel } : {}),
          imageUrl: updatedData.imageUrl,
          isEdited: true,
          editedAt: 'Vừa xong',
        };
        targetPost = modified;
        return modified;
      }
      return p;
    });
    setPosts(updated);
    saveStoredPosts(updated);
    if (targetPost) savePostToCloud(targetPost);
  };

  // Delete post handler: authors or admins can delete
  const handleDeletePost = (postId: string) => {
    if (!currentUser) return;
    const target = posts.find((p) => p.id === postId);
    if (!target) return;
    const canModerate = currentUser.role === 'admin' || currentUser.role === 'sub_admin';
    const isAuthor = currentUser.id === target.authorId;
    if (!canModerate && !isAuthor) {
      alert('Bạn không có quyền xóa bài viết này.');
      return;
    }
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này khỏi bảng tin lớp 6A2?')) {
      const updated = posts.filter((p) => p.id !== postId);
      setPosts(updated);
      saveStoredPosts(updated);
      deletePostFromCloud(postId);
    }
  };

  const handleApprovePost = (postId: string) => {
    let targetPost: Post | undefined;
    const updated = posts.map((p) => {
      if (p.id === postId) {
        const modified = { ...p, status: 'approved' as const };
        targetPost = modified;
        return modified;
      }
      return p;
    });
    setPosts(updated);
    saveStoredPosts(updated);
    if (targetPost) savePostToCloud(targetPost);
  };

  const handleRejectPost = (postId: string, reason?: string) => {
    let targetPost: Post | undefined;
    const updated = posts.map((p) => {
      if (p.id === postId) {
        const modified = {
          ...p,
          status: 'rejected' as const,
          rejectionReason: reason || 'Nội dung chưa phù hợp',
        };
        targetPost = modified;
        return modified;
      }
      return p;
    });
    setPosts(updated);
    saveStoredPosts(updated);
    if (targetPost) savePostToCloud(targetPost);
  };

  const handleTogglePin = (postId: string) => {
    let targetPost: Post | undefined;
    const updated = posts.map((p) => {
      if (p.id === postId) {
        const modified = { ...p, isPinned: !p.isPinned };
        targetPost = modified;
        return modified;
      }
      return p;
    });
    setPosts(updated);
    saveStoredPosts(updated);
    if (targetPost) savePostToCloud(targetPost);
  };

  // 5 Minutes Listening submissions
  const handleSubmitListening = (
    entryData: Omit<ListeningMessage, 'id' | 'timestamp' | 'status'>
  ) => {
    const newEntry: ListeningMessage = {
      ...entryData,
      id: `listen-${Date.now()}`,
      timestamp: 'Vừa xong',
      status: 'received',
    };
    setListeningMessages([newEntry, ...listeningMessages]);
  };

  const handleReplyListening = (id: string, reply: string) => {
    setListeningMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, teacherReply: reply, status: 'replied' } : m))
    );
  };

  // Praise
  const handleAddPraise = (praiseData: Omit<TeacherPraise, 'id'>) => {
    const newPraise: TeacherPraise = {
      ...praiseData,
      id: `praise-${Date.now()}`,
    };
    setPraises([newPraise, ...praises]);
  };

  // Good deed submissions
  const handleSubmitGoodDeed = (weekId: string, description: string) => {
    setGoodDeeds((prev) =>
      prev.map((w) => {
        if (w.id === weekId) {
          const newSubmission = {
            id: `sub-${Date.now()}`,
            studentName: currentUser.name,
            studentAvatar: currentUser.avatar,
            description,
            timestamp: 'Vừa xong',
            likes: 1,
            verified: true,
          };
          return {
            ...w,
            submissions: [newSubmission, ...w.submissions],
          };
        }
        return w;
      })
    );
  };

  // Culture Mailbox
  const handleSubmitMailbox = (
    itemData: Omit<CultureMailboxItem, 'id' | 'timestamp' | 'status'>
  ) => {
    const newItem: CultureMailboxItem = {
      ...itemData,
      id: `mail-${Date.now()}`,
      timestamp: 'Vừa xong',
      status: 'pending',
    };
    setCultureMailbox([newItem, ...cultureMailbox]);
  };

  // Parent Suggestions
  const handleSubmitParentSuggestion = (
    sugData: Omit<ParentSuggestion, 'id' | 'timestamp' | 'status'>
  ) => {
    const newSug: ParentSuggestion = {
      ...sugData,
      id: `sug-${Date.now()}`,
      timestamp: 'Vừa xong',
      status: 'new',
    };
    setParentSuggestions([newSug, ...parentSuggestions]);
  };

  const handleReplyParentSuggestion = (id: string, response: string) => {
    setParentSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, teacherResponse: response, status: 'resolved' } : s))
    );
  };

  // Auth and Profile Handlers
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    saveCurrentSession(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveCurrentSession(null);
  };

  const handleProfileUpdated = (updatedUser: UserAccount) => {
    setCurrentUser(updatedUser);
    saveCurrentSession(updatedUser);
    setStudents(getStoredStudents());
  };

  const handleClassUpdated = () => {
    setStudents(getStoredStudents());
  };

  if (!currentUser) {
    return <WelcomeLoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <ImageProvider currentUser={currentUser}>
      <div className="min-h-screen bg-[#F0F2F5] text-slate-900 font-sans flex flex-col">
        {/* Facebook-style Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        pendingCount={pendingCount}
        pendingPostsCount={pendingCount}
        onSelectRole={(u) => {
          setCurrentUser(u);
          saveCurrentSession(u);
        }}
        setCurrentUser={(u) => {
          setCurrentUser(u);
          saveCurrentSession(u);
        }}
        onSelectTab={setActiveTab}
        setActiveTab={setActiveTab}
        allPresetUsers={INITIAL_USERS}
        students={students}
        openCreatePostModal={() => setIsCreatePostOpen(true)}
        openListeningModal={() => setIsListeningModalOpen(true)}
        openApprovalModal={() => setIsApprovalModalOpen(true)}
        openProfileModal={() => setIsProfileModalOpen(true)}
        openAdminAccountsModal={() => setIsAdminAccountsModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Notice banner if user is still using default password */}
      {currentUser.isDefaultPassword && (
        <div className="bg-amber-500 text-white px-4 py-2 text-xs sm:text-sm font-medium shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold">⚠️ Lưu ý bảo mật:</span>
              <span>Bạn đang sử dụng mật khẩu mặc định (123456). Hãy đổi mật khẩu để bảo vệ tài khoản của bạn!</span>
            </div>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="px-3 py-1 bg-white text-amber-900 rounded-lg font-bold text-xs hover:bg-amber-50 transition shrink-0 cursor-pointer shadow-xs"
            >
              Đổi mật khẩu ngay
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-6 pt-4">
        {activeTab === 'trang_chu' && (
          <HomeFeedView
            currentUser={currentUser}
            posts={posts}
            praises={praises}
            ambassadors={AMBASSADORS}
            scheduleEvents={SCHEDULE_EVENTS}
            pendingCount={pendingCount}
            openCreatePostModal={() => setIsCreatePostOpen(true)}
            openListeningModal={() => setIsListeningModalOpen(true)}
            openApprovalModal={() => setIsApprovalModalOpen(true)}
            onNavigateTab={setActiveTab}
            onLikePost={handleLikePost}
            onCommentPost={handleCommentPost}
            onApprovePost={handleApprovePost}
            onRejectPost={handleRejectPost}
            onTogglePin={handleTogglePin}
            onUpdatePostImage={handleUpdatePostImage}
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
          />
        )}

        {activeTab === 'goc_co_giao' && (
          <TeacherCornerView
            currentUser={currentUser}
            praises={praises}
            changeStories={CHANGE_STORIES}
            listeningMessages={listeningMessages}
            openListeningModal={() => setIsListeningModalOpen(true)}
            onAddPraise={handleAddPraise}
            onReplyListening={handleReplyListening}
          />
        )}

        {activeTab === 'thanh_vien' && (
          <Students54View
            students={students}
            currentUser={currentUser}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onAdminManage={() => setActiveTab('quan_tri')}
            onUpdateStudentAvatar={handleUpdateStudentAvatar}
          />
        )}

        {activeTab === 'van_hoa_hoc_duong' && (
          <CultureAmbassadorView
            ambassadors={AMBASSADORS}
            goodDeeds={goodDeeds}
            cultureMailbox={cultureMailbox}
            currentUser={currentUser}
            onSubmitGoodDeed={handleSubmitGoodDeed}
            onSubmitMailbox={handleSubmitMailbox}
          />
        )}

        {activeTab === 'goc_hoc_tap' && (
          <StudyCornerView
            documents={studyDocuments}
            scheduleEvents={scheduleEvents}
            products={STUDENT_PRODUCTS}
            currentUser={currentUser}
            onAddDocument={handleAddStudyDocument}
            onUpdateDocument={handleUpdateStudyDocument}
            onDeleteDocument={handleDeleteStudyDocument}
            onToggleLikeDocument={handleToggleLikeStudyDocument}
            onAddScheduleEvent={handleAddScheduleEvent}
            onDeleteScheduleEvent={handleDeleteScheduleEvent}
          />
        )}

        {activeTab === 'hoc_cung_ai' && (
          <StudyWithAIView currentUser={currentUser} />
        )}

        {activeTab === 'quan_tri' && (
          <AdminManagementView
            currentUser={currentUser}
            posts={posts}
            onApprovePost={handleApprovePost}
            onRejectPost={handleRejectPost}
            onDeletePost={handleDeletePost}
            onClassUpdated={() => {
              setStudents(getStoredStudents());
              const updatedUsers = getStoredUsers();
              const currentId = currentUser.id;
              const refreshedSelf = updatedUsers.find((u) => u.id === currentId);
              if (refreshedSelf) {
                setCurrentUser(refreshedSelf);
                saveCurrentSession(refreshedSelf);
              }
            }}
          />
        )}

        {activeTab === 'dong_hanh_phu_huynh' && (
          <ParentCompanionView
            actionProofs={actionProofs}
            suggestions={parentSuggestions}
            currentUser={currentUser}
            onSubmitSuggestion={handleSubmitParentSuggestion}
            onReplySuggestion={handleReplyParentSuggestion}
          />
        )}

        {activeTab === 'nhat_ky_vlog' && (
          <DiaryAndVlogView
            diaryEntries={DIARY_TIMELINE}
            vlogs={CLASS_VLOGS}
          />
        )}

        {activeTab === 'cung_tien_bo' && (
          <ClassProgressView
            initialRatings={INITIAL_RATINGS}
            initialPolls={INITIAL_POLLS}
            currentUser={currentUser}
          />
        )}
      </main>

      {/* Modals */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        currentUser={currentUser}
        onSubmitPost={handleSubmitPost}
      />

      <EditPostModal
        isOpen={Boolean(editingPost)}
        onClose={() => setEditingPost(null)}
        post={editingPost}
        currentUser={currentUser}
        onSave={handleSaveEditedPost}
      />

      <ListeningModal
        isOpen={isListeningModalOpen}
        onClose={() => setIsListeningModalOpen(false)}
        currentUser={currentUser}
        onSubmitListening={handleSubmitListening}
      />

      <ApprovalManagerModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        pendingPosts={pendingPosts}
        currentUser={currentUser}
        onApprove={handleApprovePost}
        onReject={handleRejectPost}
      />

      <ProfileEditModal
        currentUser={currentUser}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onProfileUpdated={handleProfileUpdated}
      />

      <AdminAccountManagerModal
        currentUser={currentUser}
        isOpen={isAdminAccountsModalOpen}
        onClose={() => setIsAdminAccountsModalOpen(false)}
        onClassUpdated={handleClassUpdated}
      />

      {/* Official Class Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <p className="font-extrabold text-slate-800 text-sm">
            {CLASS_INFO.name} – {CLASS_INFO.bannerQuote}
          </p>
          <p className="text-slate-600">
            {CLASS_INFO.school} ({CLASS_INFO.ward}) • Giáo viên chủ nhiệm: <span className="font-bold text-slate-900">{CLASS_INFO.homeroomTeacher}</span>
          </p>
          <p className="italic text-slate-400 text-[11px] max-w-xl mx-auto">
            “{CLASS_INFO.motto}”
          </p>
          <div className="pt-2 text-[11px] text-slate-400">
            © {CLASS_INFO.schoolYear} Lớp 6A2. Kênh thông tin & tương tác văn minh giữa Nhà trường, Giáo viên, Học sinh và Gia đình.
          </div>
        </div>
      </footer>
    </div>
    </ImageProvider>
  );
}
