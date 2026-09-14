import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  AlertTriangle,
  Image as ImageIcon,
  Maximize2,
  Filter,
  Search,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  CheckCheck,
} from 'lucide-react';
import { Post, UserAccount } from '../types';
import { triggerCelebration } from '../utils/confetti';
import { useImageModal } from '../context/ImageContext';

interface ApprovalManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingPosts: Post[];
  currentUser: UserAccount;
  onApprove: (postId: string) => void;
  onReject: (postId: string, reason?: string) => void;
}

export const ApprovalManagerModal: React.FC<ApprovalManagerModalProps> = ({
  isOpen,
  onClose,
  pendingPosts,
  currentUser,
  onApprove,
  onReject,
}) => {
  const { openImageModal, showToast } = useImageModal();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectingPostId, setRejectingPostId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Chưa phù hợp với nội dung sinh hoạt lớp');
  const [customReason, setCustomReason] = useState('');
  const [expandedTextIds, setExpandedTextIds] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const toggleExpand = (id: string) => {
    setExpandedTextIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const presetReasons = [
    'Chưa phù hợp với nội dung sinh hoạt lớp',
    'Hình ảnh đính kèm mờ hoặc chưa phù hợp',
    'Cần bổ sung thêm thông tin cụ thể',
    'Nội dung trùng lặp với bài viết trước',
  ];

  // Filter pending posts
  const filteredPosts = pendingPosts.filter((post) => {
    const matchesCategory =
      selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch =
      post.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleApproveAll = () => {
    if (pendingPosts.length === 0) return;
    triggerCelebration();
    pendingPosts.forEach((p) => {
      onApprove(p.id);
    });
    showToast(`Đã phê duyệt thành công toàn bộ ${pendingPosts.length} bài viết!`);
  };

  const handleConfirmReject = (postId: string) => {
    const finalReason = customReason.trim() || rejectReason;
    onReject(postId, finalReason);
    setRejectingPostId(null);
    setCustomReason('');
    showToast('Đã từ chối bài viết');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-amber-500/20 flex items-center justify-between bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                  Hàng Đợi Phê Duyệt Bài Viết Lớp 6A2
                </h3>
                <span className="bg-white/25 text-white font-bold text-xs px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                  {pendingPosts.length} bài chờ duyệt
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-0.5">
                Người duyệt: <span className="font-bold text-white">{currentUser.name}</span> (
                {currentUser.role === 'admin' ? 'Quản trị viên chính / GVCN' : 'Quản trị viên phụ / Ban cán sự'}
                )
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pendingPosts.length > 1 && (
              <button
                onClick={handleApproveAll}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Duyệt tất cả ({pendingPosts.length})</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
              title="Đóng cửa sổ"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notice Bar & Filter Controls */}
        <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="leading-snug">
              <b>Nguyên tắc kiểm duyệt:</b> Mọi bài viết từ học sinh và phụ huynh phải được duyệt trước để đảm bảo
              tính nhân văn, tích cực, không lộ bí mật cá nhân hay điểm số nhạy cảm.
            </span>
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tác giả, nội dung..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-amber-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium"
            />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Chủ đề:
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            Tất cả ({pendingPosts.length})
          </button>
          <button
            onClick={() => setSelectedCategory('chia_se')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'chia_se'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            Chia sẻ cảm xúc
          </button>
          <button
            onClick={() => setSelectedCategory('phong_trao')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'phong_trao'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            Hoạt động phong trào
          </button>
          <button
            onClick={() => setSelectedCategory('viec_tot')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'viec_tot'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            Gương tốt việc tốt
          </button>
        </div>

        {/* Scroll View for Pending Posts */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 space-y-6 bg-slate-100/70">
          {filteredPosts.length === 0 ? (
            <div className="py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-3 opacity-90" />
              <h4 className="font-extrabold text-base text-slate-800">
                {pendingPosts.length === 0
                  ? 'Tuyệt vời! Tất cả bài viết đã được phê duyệt!'
                  : 'Không tìm thấy bài viết phù hợp với bộ lọc.'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                {pendingPosts.length === 0
                  ? 'Hiện không có bài viết nào đang chờ duyệt trong hệ thống lớp 6A2. Các bài đăng của học sinh và phụ huynh sẽ xuất hiện ở đây ngay khi gửi.'
                  : 'Hãy thử chọn chủ đề khác hoặc xóa từ khóa tìm kiếm để xem các bài viết chờ duyệt khác.'}
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const isRejectingThis = rejectingPostId === post.id;
              const isLongText = post.content.length > 280;
              const isExpanded = expandedTextIds[post.id];

              return (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition duration-200 hover:shadow-md"
                >
                  {/* Post Author Card Header */}
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400/40 shadow-2xs"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-slate-900">
                            {post.authorName}
                          </h4>
                          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                            {post.authorRoleTitle}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>Gửi lúc: {post.timestamp}</span>
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
                      {post.categoryLabel}
                    </span>
                  </div>

                  {/* Post Body: Full readable text without line clamping */}
                  <div className="p-4 sm:p-5 space-y-4">
                    <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80">
                      <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-normal">
                        {isLongText && !isExpanded
                          ? post.content.slice(0, 280) + '...'
                          : post.content}
                      </p>
                      {isLongText && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(post.id)}
                          className="mt-2 text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-3.5 h-3.5" /> Thu gọn
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3.5 h-3.5" /> Xem toàn bộ ({post.content.length} ký tự)
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Attached Image with Natural Aspect Ratio & Zoom */}
                    {post.imageUrl && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
                          <span className="flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4 text-amber-600" />
                            <span>Hình ảnh đính kèm bài viết:</span>
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              openImageModal({
                                src: post.imageUrl!,
                                title: `Ảnh đính kèm bài đăng của ${post.authorName}`,
                                subtitle: `${post.categoryLabel} • ${post.timestamp}`,
                              })
                            }
                            className="text-amber-700 hover:text-amber-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Maximize2 className="w-3 h-3" />
                            <span>Xem ảnh kích thước gốc</span>
                          </button>
                        </div>

                        <div
                          onClick={() =>
                            openImageModal({
                              src: post.imageUrl!,
                              title: `Ảnh đính kèm bài đăng của ${post.authorName}`,
                              subtitle: `${post.categoryLabel} • ${post.timestamp}`,
                            })
                          }
                          className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950/5 group cursor-pointer max-h-[420px] flex items-center justify-center"
                        >
                          <img
                            src={post.imageUrl}
                            alt="Ảnh đính kèm bài đăng"
                            className="w-full max-h-[420px] object-contain transition duration-200 group-hover:scale-[1.01]"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <div className="bg-slate-900/80 backdrop-blur-xs px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span>Phóng to xem chi tiết</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reject Reason Form if opened */}
                    {isRejectingThis && (
                      <div className="bg-rose-50 rounded-xl p-4 border border-rose-200 space-y-3 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between text-xs font-bold text-rose-900">
                          <span className="flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                            <span>Chọn lý do từ chối bài viết:</span>
                          </span>
                          <button
                            onClick={() => setRejectingPostId(null)}
                            className="text-rose-500 hover:text-rose-700 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {presetReasons.map((reason, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setRejectReason(reason);
                                setCustomReason('');
                              }}
                              className={`p-2 rounded-lg text-left text-xs font-medium transition cursor-pointer border ${
                                rejectReason === reason && !customReason
                                  ? 'bg-rose-200/80 border-rose-400 text-rose-950 font-bold'
                                  : 'bg-white border-rose-200 text-slate-700 hover:bg-rose-100/50'
                              }`}
                            >
                              {reason}
                            </button>
                          ))}
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-rose-800 block mb-1">
                            Hoặc nhập lý do tùy chỉnh:
                          </label>
                          <input
                            type="text"
                            placeholder="Ghi chú thêm cho học sinh/phụ huynh..."
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-rose-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/40 text-slate-800"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setRejectingPostId(null)}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 bg-white hover:bg-slate-100 text-xs font-bold cursor-pointer"
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            onClick={() => handleConfirmReject(post.id)}
                            className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                          >
                            Xác nhận từ chối
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  {!isRejectingThis && (
                    <div className="p-4 bg-slate-50/90 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-[11px] text-slate-500 italic">
                        Bài viết sẽ hiển thị công khai trên Bảng tin 6A2 ngay sau khi được duyệt.
                      </p>

                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => {
                            setRejectingPostId(post.id);
                            setRejectReason('Chưa phù hợp với nội dung sinh hoạt lớp');
                            setCustomReason('');
                          }}
                          className="px-3.5 py-2 rounded-xl border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>Từ chối đăng</span>
                        </button>

                        <button
                          onClick={() => {
                            triggerCelebration();
                            onApprove(post.id);
                            showToast(`Đã phê duyệt bài viết của ${post.authorName}!`);
                          }}
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 shadow-sm transform active:scale-95"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Phê duyệt ngay</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Tổng cộng: <b>{pendingPosts.length}</b> bài viết chờ duyệt
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
