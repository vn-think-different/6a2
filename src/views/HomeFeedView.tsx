import React, { useState } from 'react';
import {
  Megaphone,
  Heart,
  BookOpen,
  Camera,
  Lightbulb,
  Award,
  Sparkles,
  Lock,
  Calendar,
  Users,
  ShieldCheck,
  MessageCircleHeart,
  Star,
  Layers,
} from 'lucide-react';
import { HomeBanner } from '../components/HomeBanner';
import { CreatePostBox } from '../components/CreatePostBox';
import { PostCard } from '../components/PostCard';
import { SmartImage } from '../components/SmartImage';
import {
  Post,
  UserAccount,
  TeacherPraise,
  Ambassador,
  ScheduleEvent,
  Reaction,
} from '../types';
import { CLASS_INFO } from '../data/mockData';

interface HomeFeedViewProps {
  currentUser: UserAccount;
  posts: Post[];
  praises: TeacherPraise[];
  ambassadors: Ambassador[];
  scheduleEvents: ScheduleEvent[];
  pendingCount: number;
  openCreatePostModal: () => void;
  openListeningModal: () => void;
  openApprovalModal: () => void;
  onNavigateTab: (tabId: string) => void;
  onLikePost: (postId: string, reactionType: Reaction['type']) => void;
  onCommentPost: (postId: string, content: string) => void;
  onApprovePost: (postId: string) => void;
  onRejectPost: (postId: string, reason?: string) => void;
  onTogglePin: (postId: string) => void;
  onEditPost?: (post: Post) => void;
  onDeletePost?: (postId: string) => void;
  onUpdatePostImage?: (postId: string, newUrl: string) => void;
}

export const HomeFeedView: React.FC<HomeFeedViewProps> = ({
  currentUser,
  posts,
  praises,
  ambassadors,
  scheduleEvents,
  pendingCount,
  openCreatePostModal,
  openListeningModal,
  openApprovalModal,
  onNavigateTab,
  onLikePost,
  onCommentPost,
  onApprovePost,
  onRejectPost,
  onTogglePin,
  onEditPost,
  onDeletePost,
  onUpdatePostImage,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Tất cả bài viết' },
    { id: 'my_posts', label: '👤 Bài của tôi' },
    { id: 'thong_bao', label: '📢 Thông báo' },
    { id: 'goc_co_giao', label: '👩‍🏫 Góc cô giáo' },
    { id: 'van_hoa', label: '❤️ Việc tốt / Văn hóa' },
    { id: 'hoc_tap', label: '📚 Học tập' },
    { id: 'nhat_ky', label: '📸 Nhật ký 6A2' },
    { id: 'phu_huynh', label: '👨‍👩‍👧 Phụ huynh' },
  ];

  // Filter posts based on approval status:
  // - Approved posts are visible to all
  // - Pending posts are only visible to Admins/Sub-admins OR to the author who submitted it!
  const visiblePosts = posts.filter((p) => {
    const isApproved = p.status === 'approved';
    const isAuthor = p.authorId === currentUser.id;
    const canModerate = currentUser.role === 'admin' || currentUser.role === 'sub_admin';

    const canSeeStatus = isApproved || isAuthor || canModerate;
    const matchesCategory =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'my_posts'
        ? p.authorId === currentUser.id
        : p.category === selectedCategory;

    return canSeeStatus && matchesCategory;
  });

  // Sort pinned posts first, then pending, then chronologically
  const sortedPosts = [...visiblePosts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return 0;
  });

  const handleBannerAction = (action: 'thong_bao' | 'chia_se' | 'gop_y' | 'dong_hanh') => {
    if (action === 'thong_bao') {
      setSelectedCategory('thong_bao');
    } else if (action === 'chia_se') {
      openCreatePostModal();
    } else if (action === 'gop_y' || action === 'dong_hanh') {
      onNavigateTab('dong_hanh_phu_huynh');
    }
  };

  return (
    <div className="pb-12">
      {/* Top Banner with 4 Actions & Quote */}
      <HomeBanner
        onSelectAction={handleBannerAction}
        openListeningModal={openListeningModal}
      />

      {/* 3-Column Layout (Facebook style): Left Sidebar + Main Feed + Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar (lg: 3 cols) */}
        <div className="hidden lg:block lg:col-span-3 space-y-5 sticky top-20">
          {/* Teacher Intro Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
            <div className="flex items-center gap-3 mb-3">
              <SmartImage
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                alt="Cô Nguyễn Thị Tuyết Nhi"
                title="Giáo viên chủ nhiệm: Nguyễn Thị Tuyết Nhi"
                subtitle="Quản trị viên chính • Lớp 6A2"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-pink-500/30"
                roundedClass="rounded-full"
              />
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
                  Giáo viên chủ nhiệm
                </span>
                <h3 className="font-extrabold text-sm text-slate-900 mt-1">
                  Nguyễn Thị Tuyết Nhi
                </h3>
              </div>
            </div>
            <p className="text-xs text-slate-600 italic leading-relaxed border-t border-slate-100 pt-2.5">
              “Lắng nghe để thấu hiểu – Đồng hành để trưởng thành – Kết nối để cùng tiến bộ.”
            </p>

            <div className="mt-3 pt-2 flex flex-col gap-2">
              <button
                onClick={openListeningModal}
                className="w-full py-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageCircleHeart className="w-3.5 h-3.5" />
                <span>5 Phút Lắng Nghe</span>
              </button>

              <button
                onClick={() => onNavigateTab('goc_co_giao')}
                className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition text-center cursor-pointer"
              >
                Xem Góc Cô Giáo
              </button>
            </div>
          </div>

          {/* Quick Access Menu */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-1 text-xs font-semibold text-slate-700">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
              Khám phá 6A2
            </h4>

            <button
              onClick={() => onNavigateTab('thanh_vien')}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer text-left"
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                54 Thành viên lớp 6A2
              </span>
              <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-500">
                54
              </span>
            </button>

            <button
              onClick={() => onNavigateTab('van_hoa_hoc_duong')}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-purple-50 hover:text-purple-700 transition cursor-pointer text-left"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Đại sứ Văn hóa & Việc tốt
              </span>
              <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">
                Mới
              </span>
            </button>

            <button
              onClick={() => onNavigateTab('dong_hanh_phu_huynh')}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition cursor-pointer text-left"
            >
              <span className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-emerald-500" />
                Đồng hành cùng Phụ huynh
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                Dân vận
              </span>
            </button>

            <button
              onClick={() => onNavigateTab('goc_hoc_tap')}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-cyan-50 hover:text-cyan-700 transition cursor-pointer text-left"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-500" />
                Tài liệu & Lịch tuần
              </span>
            </button>

            <button
              onClick={() => onNavigateTab('cung_tien_bo')}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-amber-50 hover:text-amber-700 transition cursor-pointer text-left"
            >
              <span className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                6A2 Cùng Tiến Bộ (Khảo sát)
              </span>
            </button>
          </div>
        </div>

        {/* Center Main Feed (lg: 6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Create Post Box */}
          <CreatePostBox currentUser={currentUser} onClick={openCreatePostModal} />

          {/* Pending Approval Notice (If user is Admin or Sub-admin and there are pending posts) */}
          {(currentUser.role === 'admin' || currentUser.role === 'sub_admin') &&
            pendingCount > 0 && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-xs text-amber-950">
                      Có {pendingCount} bài viết đang chờ phê duyệt
                    </h4>
                    <p className="text-[11px] text-amber-700">
                      Từ học sinh và phụ huynh gửi lên bảng tin.
                    </p>
                  </div>
                </div>
                <button
                  onClick={openApprovalModal}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer shrink-0"
                >
                  Kiểm duyệt ngay
                </button>
              </div>
            )}

          {/* Category Tabs Filter */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-2 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {sortedPosts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
                <p className="font-bold text-slate-700">Chưa có bài viết nào trong danh mục này</p>
                <p className="text-xs text-slate-400 mt-1">
                  Hãy là người đầu tiên đăng bài chia sẻ nhé!
                </p>
              </div>
            ) : (
              sortedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  onLike={onLikePost}
                  onComment={onCommentPost}
                  onApprove={onApprovePost}
                  onReject={onRejectPost}
                  onTogglePin={onTogglePin}
                  onEdit={onEditPost}
                  onDelete={onDeletePost}
                  onUpdatePostImage={onUpdatePostImage}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar (lg: 3 cols) */}
        <div className="hidden lg:block lg:col-span-3 space-y-5 sticky top-20">
          {/* Today's Praise Widget */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                <span className="text-amber-500">🌟</span>
                <span>Hôm nay cô muốn khen...</span>
              </h4>
              <button
                onClick={() => onNavigateTab('goc_co_giao')}
                className="text-[11px] text-blue-600 font-bold hover:underline"
              >
                Xem tất cả
              </button>
            </div>

            {praises.slice(0, 2).map((p) => (
              <div
                key={p.id}
                className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-2.5 mb-2.5 last:mb-0 space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-900">{p.recipient}</span>
                  <span className="text-[10px] text-amber-700">{p.date}</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-snug">{p.reason}</p>
              </div>
            ))}
          </div>

          {/* Upcoming Schedule */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Lịch tuần này</span>
              </h4>
              <button
                onClick={() => onNavigateTab('goc_hoc_tap')}
                className="text-[11px] text-blue-600 font-bold hover:underline"
              >
                Chi tiết
              </button>
            </div>

            <div className="space-y-2">
              {scheduleEvents.slice(0, 3).map((evt) => (
                <div
                  key={evt.id}
                  className="p-2 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2.5"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-[10px] flex flex-col items-center justify-center shrink-0">
                    <span>{evt.dayOfWeek}</span>
                  </div>
                  <div className="overflow-hidden">
                    <h5 className="font-bold text-xs text-slate-900 line-clamp-1">
                      {evt.subjectOrEvent}
                    </h5>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{evt.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6 Ambassadors Widget */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2.5 border-b border-slate-100 pb-2">
              <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Đại sứ văn hóa 6A2</span>
              </h4>
              <button
                onClick={() => onNavigateTab('van_hoa_hoc_duong')}
                className="text-[11px] text-purple-600 font-bold hover:underline"
              >
                Xem hết
              </button>
            </div>

            <div className="space-y-1.5">
              {ambassadors.slice(0, 4).map((amb) => (
                <div
                  key={amb.id}
                  className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg text-xs"
                >
                  <span className="flex items-center gap-1.5 font-medium text-slate-800">
                    <span>{amb.icon}</span>
                    <span className="truncate max-w-[130px]">{amb.title}</span>
                  </span>
                  <span className="text-[10px] text-purple-700 font-semibold truncate">
                    {amb.studentName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
