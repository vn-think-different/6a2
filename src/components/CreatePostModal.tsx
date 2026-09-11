import React, { useState, useRef } from 'react';
import {
  X,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Trash2,
  Paperclip,
} from 'lucide-react';
import { UserAccount, Post } from '../types';
import { triggerCelebration } from '../utils/confetti';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onSubmitPost: (post: Omit<Post, 'id' | 'likes' | 'comments' | 'sharesCount'>) => void;
}

const PRESET_IMAGES = [
  { label: 'Góc học tập / Phòng học', url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Việc tốt / Nụ cười bạn bè', url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Sản phẩm STEM / Thí nghiệm', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Góc xanh lớp học / Cây cảnh', url: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Đọc sách / Thư viện', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Thể thao / Hoạt động tập thể', url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1000&auto=format&fit=crop&q=80' },
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSubmitPost,
}) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Post['category']>('chia_se');
  const [imageUrl, setImageUrl] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [attachMode, setAttachMode] = useState<'none' | 'file' | 'url' | 'preset'>('none');
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const categories: { id: Post['category']; label: string; adminOnly?: boolean }[] = [
    { id: 'thong_bao', label: '📢 Thông báo chính thức', adminOnly: true },
    { id: 'goc_co_giao', label: '👩‍🏫 Góc cô giáo', adminOnly: true },
    { id: 'van_hoa', label: '❤️ Việc tốt / Văn hóa học đường' },
    { id: 'hoc_tap', label: '📚 Sản phẩm học tập' },
    { id: 'nhat_ky', label: '📸 Nhật ký 6A2' },
    { id: 'phu_huynh', label: '👨‍👩‍👧 Phụ huynh đồng hành' },
    { id: 'chia_se', label: '💡 Chia sẻ / Cảm nghĩ' },
  ];

  const availableCategories = categories.filter(
    (c) => !c.adminOnly || currentUser.role === 'admin'
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh (JPG, PNG, WEBP, GIF)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setImageUrl(evt.target.result as string);
        setSelectedPreset(null);
        setAttachMode('none');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setImageUrl(urlInput.trim());
    setSelectedPreset(null);
    setUrlInput('');
    setAttachMode('none');
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setSelectedPreset(null);
    setAttachMode('none');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const selectedCat = categories.find((c) => c.id === category);

    // Auto-approve if posted by teacher/admin or sub_admin, otherwise pending for students/parents
    const initialStatus: Post['status'] =
      currentUser.role === 'admin' || currentUser.role === 'sub_admin' ? 'approved' : 'pending';

    onSubmitPost({
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorRoleTitle: currentUser.roleTitle,
      authorAvatar: currentUser.avatar,
      content: content.trim(),
      imageUrl: imageUrl.trim() || undefined,
      category,
      categoryLabel: selectedCat ? selectedCat.label : 'Chia sẻ',
      timestamp: 'Vừa xong',
      status: initialStatus,
      isPinned: currentUser.role === 'admin' && isPinned,
    });

    if (initialStatus === 'approved') {
      triggerCelebration();
    }

    setContent('');
    setImageUrl('');
    setIsPinned(false);
    setSelectedPreset(null);
    setAttachMode('none');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between relative bg-slate-50">
          <h3 className="font-extrabold text-slate-900 text-base text-center w-full">
            Tạo bài viết mới
          </h3>
          <button
            onClick={onClose}
            className="absolute right-4 w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User preview & category selector */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3.5">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-500/20"
            />
            <div>
              <p className="font-bold text-sm text-slate-900">{currentUser.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Post['category'])}
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  {availableCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>

                {currentUser.role === 'admin' && (
                  <label className="flex items-center gap-1 text-xs text-blue-700 font-medium cursor-pointer ml-1">
                    <input
                      type="checkbox"
                      checked={isPinned}
                      onChange={(e) => setIsPinned(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Ghim đầu</span>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            rows={4}
            placeholder={
              currentUser.role === 'admin'
                ? 'Nhập nội dung thông báo hoặc lời dặn dò đến các em học sinh và phụ huynh...'
                : `${currentUser.name} ơi, chia sẻ những khoảnh khắc đẹp, việc tốt hoặc câu hỏi của bạn tại đây...`
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full text-slate-800 text-sm placeholder-slate-400 p-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />

          {/* Image Attachment Preview Card (if image is selected) */}
          {imageUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900/5 shadow-xs">
              <div className="max-h-56 overflow-hidden flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt="Ảnh đính kèm bài viết"
                  className="w-full object-cover max-h-56"
                />
              </div>
              <div className="p-2.5 bg-slate-900/80 backdrop-blur-xs text-white flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-emerald-300">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Đã đính kèm ảnh vào bài viết
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white font-semibold transition cursor-pointer text-[11px]"
                  >
                    Đổi ảnh
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-1 bg-rose-600/80 hover:bg-rose-600 rounded-lg text-white transition cursor-pointer"
                    title="Xóa ảnh đính kèm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Choose attachment method */
            <div className="space-y-2 border border-slate-200 rounded-2xl p-3 bg-slate-50/70">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  Đính kèm hình ảnh (Học sinh & Quản trị viên)
                </span>
                <span className="text-[11px] text-slate-400">Tùy chọn</span>
              </div>

              {/* Action Buttons: Upload / URL / Presets */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-700 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span className="text-[11px]">Tải từ máy</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAttachMode(attachMode === 'url' ? 'none' : 'url')}
                  className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                    attachMode === 'url'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-700'
                  }`}
                >
                  <LinkIcon className="w-4 h-4 text-emerald-600" />
                  <span className="text-[11px]">Dán link ảnh</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAttachMode(attachMode === 'preset' ? 'none' : 'preset')}
                  className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                    attachMode === 'preset'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-700'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-[11px]">Ảnh mẫu 6A2</span>
                </button>
              </div>

              {/* Drag & Drop Area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-3 border-2 border-dashed rounded-xl text-center text-xs transition cursor-pointer ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-300 hover:border-blue-400 bg-white'
                }`}
              >
                <p className="text-[11px] text-slate-500 font-medium">
                  Kéo thả file ảnh vào đây hoặc bấm để chọn ảnh từ điện thoại/máy tính
                </p>
              </div>

              {/* Sub-Panel: URL Input */}
              {attachMode === 'url' && (
                <form onSubmit={handleApplyUrl} className="pt-2 flex gap-2">
                  <input
                    type="url"
                    placeholder="Dán đường link ảnh (URL) tại đây..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1 text-xs p-2 bg-white border border-slate-300 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!urlInput.trim()}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Dán
                  </button>
                </form>
              )}

              {/* Sub-Panel: Preset Images */}
              {attachMode === 'preset' && (
                <div className="pt-2 grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                  {PRESET_IMAGES.map((img, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => {
                        setSelectedPreset(idx);
                        setImageUrl(img.url);
                        setAttachMode('none');
                      }}
                      className={`relative rounded-xl overflow-hidden border-2 h-16 text-left transition group cursor-pointer ${
                        selectedPreset === idx
                          ? 'border-blue-600 ring-2 ring-blue-400'
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                      <span className="absolute inset-0 bg-black/45 flex items-end p-1 text-[9px] text-white font-medium line-clamp-1 leading-tight">
                        {img.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Moderation Policy Notice */}
          <div
            className={`p-3 rounded-2xl text-xs flex items-start gap-2.5 ${
              currentUser.role === 'admin' || currentUser.role === 'sub_admin'
                ? 'bg-blue-50 text-blue-900 border border-blue-200'
                : 'bg-amber-50 text-amber-900 border border-amber-200'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <div className="leading-snug">
              {currentUser.role === 'admin' || currentUser.role === 'sub_admin' ? (
                <span>
                  Bạn là <b>Quản trị viên</b>: Bài viết và hình ảnh đính kèm sẽ được xuất bản công khai ngay lập tức lên bảng tin 6A2.
                </span>
              ) : (
                <span>
                  <b>Lưu ý duyệt bài:</b> Bài viết kèm hình ảnh của bạn sẽ được{' '}
                  <b>Quản trị viên (Cô giáo & Ban cán sự) duyệt trước</b> để đảm bảo an toàn và tính giáo dục!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Button */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-2xl shadow-sm transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {currentUser.role === 'admin' || currentUser.role === 'sub_admin'
                ? 'Đăng bài ngay lên bảng tin'
                : 'Gửi bài viết kèm ảnh để Quản trị viên duyệt'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
