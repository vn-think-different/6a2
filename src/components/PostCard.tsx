import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Pin,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  Trash2,
  Smile,
  Send,
  ShieldCheck,
  Edit3,
} from 'lucide-react';
import { Post, UserAccount, Reaction } from '../types';
import { triggerHeartCelebration } from '../utils/confetti';
import { SmartImage } from './SmartImage';
import { useImageModal } from '../context/ImageContext';

interface PostCardProps {
  post: Post;
  currentUser: UserAccount;
  onLike: (postId: string, reactionType: Reaction['type']) => void;
  onComment: (postId: string, content: string) => void;
  onApprove?: (postId: string) => void;
  onReject?: (postId: string, reason?: string) => void;
  onTogglePin?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onEdit?: (post: Post) => void;
  onUpdatePostImage?: (postId: string, newUrl: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  onLike,
  onComment,
  onApprove,
  onReject,
  onTogglePin,
  onDelete,
  onEdit,
  onUpdatePostImage,
}) => {
  const [commentInput, setCommentInput] = useState('');
  const [showComments, setShowComments] = useState(true);
  const [showReactionsPopover, setShowReactionsPopover] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { showToast } = useImageModal();

  const canModerate = currentUser.role === 'admin' || currentUser.role === 'sub_admin';
  const isAuthor = currentUser.id === post.authorId;

  // Check user reaction
  const userReaction = post.likes.find((r) => r.userId === currentUser.id);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    onComment(post.id, commentInput.trim());
    setCommentInput('');
  };

  const reactionEmojis: Record<Reaction['type'], { label: string; icon: string; color: string }> = {
    like: { label: 'Thích', icon: '👍', color: 'text-blue-600 font-bold' },
    love: { label: 'Yêu thích', icon: '❤️', color: 'text-rose-600 font-bold' },
    care: { label: 'Thương thương', icon: '🥰', color: 'text-amber-500 font-bold' },
    haha: { label: 'Haha', icon: '😆', color: 'text-amber-500 font-bold' },
    wow: { label: 'Wow', icon: '😮', color: 'text-amber-500 font-bold' },
  };

  const handleQuickLike = () => {
    if (userReaction) {
      // Toggle off or switch
      onLike(post.id, 'like');
    } else {
      triggerHeartCelebration();
      onLike(post.id, 'love');
    }
  };

  const handleSelectReaction = (type: Reaction['type']) => {
    triggerHeartCelebration();
    onLike(post.id, type);
    setShowReactionsPopover(false);
  };

  return (
    <article className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition duration-200 overflow-hidden mb-4">
      {/* Moderation notice if pending */}
      {post.status === 'pending' && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-900">
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="w-4 h-4 text-amber-600 animate-spin" />
            <span>Bài viết đang ở chế độ <b>Chờ duyệt</b> trước khi hiển thị công khai.</span>
          </div>
          {canModerate && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onApprove && onApprove(post.id)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded-md text-xs transition cursor-pointer flex items-center gap-1"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Duyệt bài
              </button>
              <button
                onClick={() => onReject && onReject(post.id)}
                className="bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold px-3 py-1 rounded-md text-xs transition cursor-pointer flex items-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5" /> Từ chối
              </button>
            </div>
          )}
        </div>
      )}

      {/* Pinned banner if pinned */}
      {post.isPinned && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-1.5 flex items-center gap-1.5 text-xs text-blue-800 font-bold">
          <Pin className="w-3.5 h-3.5 text-blue-600 fill-blue-600 rotate-45" />
          <span>Bài viết được Giáo viên chủ nhiệm Ghim lên đầu bảng tin</span>
        </div>
      )}

      {/* Post Header */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <SmartImage
            src={post.authorAvatar}
            alt={post.authorName}
            title={`Ảnh đại diện: ${post.authorName}`}
            subtitle={`${post.authorRoleTitle} • Lớp 6A2`}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
            roundedClass="rounded-full"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-slate-900 text-sm hover:underline cursor-pointer">
                {post.authorName}
              </h4>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                post.authorRole === 'admin'
                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                  : post.authorRole === 'sub_admin'
                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                  : post.authorRole === 'ambassador'
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : post.authorRole === 'parent'
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-blue-100 text-blue-700 border border-blue-200'
              }`}>
                {post.authorRoleTitle}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
              <span>{post.timestamp}</span>
              {post.isEdited && (
                <span className="text-[10px] text-blue-500 font-medium italic">
                  (Đã chỉnh sửa)
                </span>
              )}
              <span>•</span>
              <span className="text-blue-600 font-medium bg-blue-50 px-1.5 py-0.2 rounded text-[11px]">
                {post.categoryLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Options Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100">
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => {
                    onTogglePin && onTogglePin(post.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Pin className="w-3.5 h-3.5" />
                  <span>{post.isPinned ? 'Bỏ ghim bài viết' : 'Ghim lên đầu'}</span>
                </button>
              )}
              {(canModerate || isAuthor) && onEdit && (
                <button
                  onClick={() => {
                    onEdit(post);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 text-blue-700 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sửa bài viết</span>
                </button>
              )}
              {(canModerate || isAuthor) && (
                <button
                  onClick={() => {
                    onDelete && onDelete(post.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa bài viết</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-slate-800 text-sm whitespace-pre-line leading-relaxed font-normal">
          {post.content}
        </p>
      </div>

      {/* Post Image */}
      {post.imageUrl && (
        <div className="w-full bg-slate-900/5 max-h-[440px] overflow-hidden flex items-center justify-center">
          <SmartImage
            src={post.imageUrl}
            alt="Hình ảnh bài đăng"
            title={`Hình ảnh bài viết của ${post.authorName}`}
            subtitle={`Danh mục: ${post.categoryLabel} • Lớp 6A2`}
            onImageChange={(newUrl) => onUpdatePostImage && onUpdatePostImage(post.id, newUrl)}
            className="w-full object-cover max-h-[440px] hover:scale-101 transition duration-300"
            containerClassName="w-full"
          />
        </div>
      )}

      {/* Reactions Summary & Comments Count */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-500 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          {post.likes.length > 0 && (
            <div className="flex items-center -space-x-1">
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] shadow-xs">
                ❤️
              </span>
              <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] shadow-xs">
                👍
              </span>
            </div>
          )}
          <span className="font-semibold text-slate-600">
            {post.likes.length > 0 ? `${post.likes.length} lượt yêu thích` : 'Hãy là người đầu tiên bày tỏ cảm xúc'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowComments(!showComments)}
            className="hover:underline cursor-pointer"
          >
            {post.comments.length} bình luận
          </button>
          <span>•</span>
          <span>{post.sharesCount || 0} chia sẻ</span>
        </div>
      </div>

      {/* Facebook-style Action Bar */}
      <div className="px-2 py-1 flex items-center justify-around border-b border-slate-100 relative">
        {/* Like Button with Reactions Popover */}
        <div
          className="relative flex-1"
          onMouseEnter={() => setShowReactionsPopover(true)}
          onMouseLeave={() => setShowReactionsPopover(false)}
        >
          {showReactionsPopover && (
            <div className="absolute bottom-full left-2 mb-1 bg-white rounded-full shadow-xl border border-slate-200 px-2 py-1.5 flex items-center gap-2 z-30 animate-in fade-in zoom-in-90 duration-150">
              {(['like', 'love', 'care', 'haha', 'wow'] as Reaction['type'][]).map((type) => (
                <button
                  key={type}
                  onClick={() => handleSelectReaction(type)}
                  className="text-2xl hover:scale-135 transition-transform duration-150 p-1 cursor-pointer"
                  title={reactionEmojis[type].label}
                >
                  {reactionEmojis[type].icon}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleQuickLike}
            className={`w-full py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition cursor-pointer hover:bg-slate-100 ${
              userReaction ? reactionEmojis[userReaction.type].color : 'text-slate-600'
            }`}
          >
            {userReaction ? (
              <>
                <span className="text-base">{reactionEmojis[userReaction.type].icon}</span>
                <span>{reactionEmojis[userReaction.type].label}</span>
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 text-slate-500" />
                <span>Yêu thích</span>
              </>
            )}
          </button>
        </div>

        {/* Comment Button */}
        <button
          onClick={() => setShowComments(true)}
          className="flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 text-slate-500" />
          <span>Bình luận</span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
            showToast('Đã sao chép liên kết bài viết vào bộ nhớ tạm!');
          }}
          className="flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
        >
          <Share2 className="w-4 h-4 text-slate-500" />
          <span>Chia sẻ</span>
        </button>
      </div>

      {/* Comments Area */}
      {showComments && (
        <div className="p-4 bg-slate-50/70 space-y-3">
          {/* Add Comment Input */}
          <form onSubmit={handleCommentSubmit} className="flex items-start gap-2">
            <SmartImage
              src={currentUser.avatar}
              alt={currentUser.name}
              title={`Ảnh đại diện: ${currentUser.name}`}
              className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 ring-1 ring-slate-300"
              roundedClass="rounded-full"
            />
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={`Viết bình luận văn minh với tư cách ${currentUser.name}...`}
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl px-3 py-2 pr-10 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 disabled:text-slate-300 cursor-pointer disabled:cursor-not-allowed p-1"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* List of comments */}
          {post.comments.length > 0 && (
            <div className="space-y-2 pt-1">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2.5">
                  <SmartImage
                    src={comment.authorAvatar}
                    alt={comment.authorName}
                    title={`Ảnh đại diện: ${comment.authorName}`}
                    subtitle={comment.authorRole}
                    className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-200 mt-1"
                    roundedClass="rounded-full"
                  />
                  <div className="bg-white border border-slate-200/80 rounded-2xl px-3 py-2 max-w-[88%] text-xs shadow-2xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900">{comment.authorName}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                        {comment.authorRole}
                      </span>
                    </div>
                    <p className="text-slate-700 mt-1 leading-normal">{comment.content}</p>
                    <span className="text-[10px] text-slate-400 block mt-1">{comment.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
};
