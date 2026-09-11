import React from 'react';
import { X, ShieldCheck, CheckCircle2, XCircle, Clock, User, AlertTriangle } from 'lucide-react';
import { Post, UserAccount } from '../types';
import { triggerCelebration } from '../utils/confetti';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-amber-600 to-orange-600 text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-white" />
            <div>
              <h3 className="font-bold text-base">Hàng đợi Phê duyệt bài viết 6A2</h3>
              <p className="text-xs text-amber-100">
                Quyền: {currentUser.role === 'admin' ? 'Quản trị viên chính (GVCN)' : 'Quản trị viên phụ (Ban cán sự)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice */}
        <div className="bg-amber-50 p-3 border-b border-amber-200 text-xs text-amber-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <b>Nguyên tắc kiểm duyệt:</b> Mọi bài viết từ học sinh và phụ huynh phải được duyệt trước để đảm bảo
            tính nhân văn, tích cực, không lộ bí mật cá nhân hoặc điểm số nhạy cảm.
          </span>
        </div>

        {/* List of Pending Posts */}
        <div className="overflow-y-auto p-4 flex-1 space-y-4">
          {pendingPosts.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="font-bold text-slate-700">Tất cả bài viết đã được duyệt!</p>
              <p className="text-xs text-slate-400 mt-1">
                Hiện không có bài viết nào đang chờ duyệt trong hệ thống.
              </p>
            </div>
          ) : (
            pendingPosts.map((post) => (
              <div
                key={post.id}
                className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={post.authorAvatar}
                      alt={post.authorName}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-bold text-xs text-slate-900">{post.authorName}</p>
                      <p className="text-[10px] text-slate-500">
                        {post.authorRoleTitle} • {post.timestamp}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                    {post.categoryLabel}
                  </span>
                </div>

                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line bg-white p-3 rounded-lg border border-slate-200">
                  {post.content}
                </p>

                {post.imageUrl && (
                  <div className="max-h-48 overflow-hidden rounded-lg border border-slate-200">
                    <img src={post.imageUrl} alt="Đính kèm" className="w-full object-cover" />
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => onReject(post.id, 'Chưa phù hợp với nội dung hoạt động của lớp')}
                    className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Từ chối đăng</span>
                  </button>

                  <button
                    onClick={() => {
                      triggerCelebration();
                      onApprove(post.id);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Phê duyệt ngay</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
