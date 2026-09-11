import React, { useState, useRef } from 'react';
import {
  X,
  BookOpen,
  FileText,
  Upload,
  Image as ImageIcon,
  Paperclip,
  CheckCircle2,
  Trash2,
  Sparkles,
  Pin,
  HelpCircle,
} from 'lucide-react';
import { StudyDocument, UserAccount } from '../types';

interface CreateStudyDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onSubmit: (doc: StudyDocument) => void;
  initialData?: StudyDocument | null;
}

export const CreateStudyDocModal: React.FC<CreateStudyDocModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSubmit,
  initialData,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [subject, setSubject] = useState(initialData?.subject || 'Toán học');
  const [type, setType] = useState<StudyDocument['type']>(initialData?.type || 'lesson');
  const [description, setDescription] = useState(initialData?.description || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [pinned, setPinned] = useState(initialData?.pinned ?? false);

  // File attachment state
  const [attachmentName, setAttachmentName] = useState(initialData?.attachmentName || '');
  const [attachmentSize, setAttachmentSize] = useState(initialData?.attachmentSize || '');
  const [attachmentDataUrl, setAttachmentDataUrl] = useState(initialData?.attachmentDataUrl || '');

  // Image attachments
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const subjects = [
    'Toán học',
    'Ngữ văn',
    'Tiếng Anh',
    'Khoa học tự nhiên',
    'Lịch sử & Địa lý',
    'Tin học',
    'GDCD & HĐTN',
    'Nghệ thuật & Âm nhạc',
    'Giáo dục thể chất',
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const formattedSize = file.size < 1024 * 1024 
      ? `${(file.size / 1024).toFixed(0)} KB` 
      : `${sizeInMB} MB`;

    setAttachmentName(file.name);
    setAttachmentSize(formattedSize);

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachmentDataUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveAttachment = () => {
    setAttachmentName('');
    setAttachmentSize('');
    setAttachmentDataUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề bài viết hoặc tài liệu!');
      return;
    }

    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(
      today.getMonth() + 1
    ).padStart(2, '0')}/${today.getFullYear()}`;

    const newDoc: StudyDocument = {
      id: initialData?.id || `study-doc-${Date.now()}`,
      subject,
      title: title.trim(),
      type,
      description: description.trim() || title.trim(),
      content: content.trim() || undefined,
      author: currentUser.name,
      authorRole: currentUser.roleTitle || 'Giáo viên',
      date: initialData?.date || formattedDate,
      downloadUrl: attachmentDataUrl || initialData?.downloadUrl,
      attachmentName: attachmentName || undefined,
      attachmentSize: attachmentSize || undefined,
      attachmentDataUrl: attachmentDataUrl || undefined,
      images: images.length > 0 ? images : undefined,
      size: attachmentSize || '1.5 MB',
      pinned,
      likes: initialData?.likes || 0,
    };

    onSubmit(newDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-6 border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-700 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-white">
                {initialData ? 'Chỉnh Sửa Bài Viết / Tài Liệu' : 'Đăng Bài Học & Gửi Tài Liệu Cho Học Sinh'}
              </h2>
              <p className="text-xs text-blue-100">
                Góc học tập lớp 6A2 • Người đăng: <span className="font-bold text-white">{currentUser.name}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tiêu đề bài viết / Tài liệu <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Ôn tập Chương 1 Toán học, Phiếu học tập Ngữ văn số 2..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Subject & Type Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Môn học
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Hình thức / Thể loại
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="lesson">📖 Bài giảng & Lời dặn dò chi tiết</option>
                <option value="pdf">📄 Tệp tài liệu PDF</option>
                <option value="doc">📝 Tài liệu Word (.docx)</option>
                <option value="slide">📊 Bài trình chiếu PowerPoint</option>
                <option value="image">🖼️ Ảnh chụp bài tập & Sơ đồ tư duy</option>
                <option value="quiz">🎯 Đề ôn luyện & Câu hỏi trắc nghiệm</option>
              </select>
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tóm tắt ngắn gọn
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Tổng hợp 30 câu trắc nghiệm tự luyện tại nhà kèm đáp án..."
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Detailed Content / Teacher instructions */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Nội dung bài viết / Lời dặn dò của cô giáo
              </label>
              <span className="text-[11px] text-slate-400">Hỗ trợ xuống dòng, danh sách dặn dò</span>
            </div>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung bài giảng, các bước hướng dẫn các em học sinh làm bài tập, yêu cầu chuẩn bị đồ dùng học tập hoặc lời dặn dò của cô..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed font-normal"
            />
          </div>

          {/* Attachment File Section */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800">
                  Đính kèm tệp tài liệu (PDF, Word, Slide, Excel...)
                </span>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Chọn tệp từ máy</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
                className="hidden"
              />
            </div>

            {attachmentName ? (
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-900 truncate">{attachmentName}</p>
                    <p className="text-[10px] text-slate-500">{attachmentSize}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveAttachment}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  title="Xóa tệp đính kèm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 italic">
                Chưa có tệp đính kèm. Học sinh có thể bấm tải về trực tiếp file này khi xem bài học.
              </p>
            )}
          </div>

          {/* Attached Images Section */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">
                  Hình ảnh bài giảng / Sơ đồ / Bài tập mẫu
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Chọn ảnh từ máy</span>
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  multiple
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            {/* Quick URL input */}
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Hoặc dán đường dẫn (URL) ảnh..."
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Thêm URL
              </button>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 h-24 bg-slate-100"
                  >
                    <img
                      src={img}
                      alt={`Đính kèm ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-black/70 hover:bg-rose-600 text-white p-1 rounded-full opacity-90 transition cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pin to top */}
          <div className="flex items-center justify-between p-3 bg-amber-50/70 border border-amber-200 rounded-2xl">
            <div className="flex items-center gap-2.5">
              <Pin className="w-4 h-4 text-amber-700" />
              <div>
                <p className="text-xs font-bold text-slate-900">Ghim lên đầu trang Góc học tập</p>
                <p className="text-[11px] text-slate-500">Giúp học sinh và phụ huynh dễ dàng chú ý tài liệu quan trọng này</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-md transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{initialData ? 'Lưu Thay Đổi' : 'Đăng Bài Học Ngay'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
