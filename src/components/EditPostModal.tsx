import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  Trash2,
  Paperclip,
  Save,
  Edit3,
} from 'lucide-react';
import { UserAccount, Post } from '../types';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
  currentUser: UserAccount;
  onSave: (
    postId: string,
    updated: {
      content: string;
      category?: Post['category'];
      categoryLabel?: string;
      imageUrl?: string;
    }
  ) => void;
}

const PRESET_IMAGES = [
  { label: 'Góc học tập / Phòng học', url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Việc tốt / Nụ cười bạn bè', url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Sản phẩm STEM / Thí nghiệm', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Góc xanh lớp học / Cây cảnh', url: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Đọc sách / Thư viện', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Thể thao / Hoạt động tập thể', url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1000&auto=format&fit=crop&q=80' },
];

export const EditPostModal: React.FC<EditPostModalProps> = ({
  isOpen,
  onClose,
  post,
  currentUser,
  onSave,
}) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Post['category']>('chia_se');
  const [imageUrl, setImageUrl] = useState('');
  const [attachMode, setAttachMode] = useState<'none' | 'file' | 'url' | 'preset'>('none');
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (post) {
      setContent(post.content || '');
      setCategory(post.category || 'chia_se');
      setImageUrl(post.imageUrl || '');
      setAttachMode('none');
      setUrlInput('');
    }
  }, [post]);

  if (!isOpen || !post) return null;

  const canModerate = currentUser.role === 'admin' || currentUser.role === 'sub_admin';
  const isAuthor = currentUser.id === post.authorId;

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

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh (JPG, PNG, WEBP, GIF)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setImageUrl(evt.target.result as string);
        setAttachMode('none');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setImageUrl(urlInput.trim());
    setUrlInput('');
    setAttachMode('none');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('Nội dung bài viết không được để trống.');
      return;
    }

    const selectedCat = categories.find((c) => c.id === category);

    onSave(post.id, {
      content: content.trim(),
      category,
      categoryLabel: selectedCat ? selectedCat.label : 'Chia sẻ',
      imageUrl: imageUrl.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between relative bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Chỉnh sửa bài viết
              </h3>
              <p className="text-[11px] text-slate-500">
                {isAuthor ? 'Tác giả bài viết đang chỉnh sửa' : 'Quản trị viên đang hỗ trợ chỉnh sửa bài viết'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* Author info preview */}
          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
            <img
              src={post.authorAvatar}
              alt={post.authorName}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/30 shrink-0"
            />
            <div className="flex-1 truncate">
              <p className="font-bold text-xs text-slate-900 truncate">{post.authorName}</p>
              <p className="text-[10px] text-blue-600 font-semibold truncate">{post.authorRoleTitle}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                {post.timestamp}
              </span>
            </div>
          </div>

          {/* Category picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Chuyên mục bài viết:
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Post['category'])}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {availableCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Content Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nội dung bài viết:
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="Nhập nội dung bài viết..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
            />
          </div>

          {/* Image Preview & Controls */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Hình ảnh đính kèm:
            </label>
            {imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 max-h-56 flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt="Ảnh bài viết"
                  className="w-full h-auto max-h-56 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 p-1.5 bg-slate-900/70 hover:bg-rose-600 text-white rounded-full transition cursor-pointer"
                  title="Gỡ ảnh này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAttachMode(attachMode === 'file' ? 'none' : 'file')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-bold transition cursor-pointer border border-slate-200"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>Tải ảnh từ máy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttachMode(attachMode === 'url' ? 'none' : 'url')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-bold transition cursor-pointer border border-slate-200"
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Dán liên kết URL</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttachMode(attachMode === 'preset' ? 'none' : 'preset')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-bold transition cursor-pointer border border-slate-200"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                    <span>Chọn ảnh mẫu</span>
                  </button>
                </div>

                {/* File Upload Mode */}
                {attachMode === 'file' && (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) processImageFile(file);
                    }}
                    className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition ${
                      isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) processImageFile(file);
                      }}
                    />
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <p className="text-xs font-bold text-slate-700">Kéo thả ảnh hoặc nhấp để chọn tệp</p>
                    <p className="text-[10px] text-slate-400">JPG, PNG, GIF, WEBP</p>
                  </div>
                )}

                {/* URL input mode */}
                {attachMode === 'url' && (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleApplyUrl}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition"
                    >
                      Dùng ảnh
                    </button>
                  </div>
                )}

                {/* Preset Picker */}
                {attachMode === 'preset' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PRESET_IMAGES.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setImageUrl(p.url);
                          setAttachMode('none');
                        }}
                        className="group relative rounded-xl overflow-hidden border border-slate-200 aspect-video hover:ring-2 hover:ring-blue-500 transition cursor-pointer"
                      >
                        <img src={p.url} alt={p.label} className="w-full h-full object-cover group-hover:scale-105 transition" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-1.5">
                          <span className="text-[10px] text-white font-bold truncate">{p.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Save Button */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu thay đổi bài viết</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
