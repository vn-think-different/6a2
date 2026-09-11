import React from 'react';
import {
  X,
  BookOpen,
  FileText,
  Download,
  Calendar,
  User,
  Heart,
  Pin,
  ExternalLink,
  Edit,
  Trash2,
  Share2,
  CheckCircle,
} from 'lucide-react';
import { StudyDocument, UserAccount } from '../types';
import { SmartImage } from './SmartImage';
import { triggerHeartCelebration } from '../utils/confetti';

interface ViewStudyDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: StudyDocument | null;
  currentUser: UserAccount;
  onLike: (id: string) => void;
  onEdit?: (doc: StudyDocument) => void;
  onDelete?: (id: string) => void;
}

export const ViewStudyDocModal: React.FC<ViewStudyDocModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  currentUser,
  onLike,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !doc) return null;

  const isTeacherOrAdmin =
    currentUser.role === 'admin' ||
    currentUser.role === 'sub_admin' ||
    currentUser.name === doc.author;

  const handleDownload = () => {
    if (doc.attachmentDataUrl) {
      const link = window.document.createElement('a');
      link.href = doc.attachmentDataUrl;
      link.download = doc.attachmentName || `${doc.title}.${doc.type}`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } else if (doc.downloadUrl) {
      window.open(doc.downloadUrl, '_blank');
    } else {
      // Create a friendly text file representation for simulated download
      const textContent = `BÀI HỌC / TÀI LIỆU LỚP 6A2\n\nTiêu đề: ${doc.title}\nMôn học: ${doc.subject}\nNgười đăng: ${doc.author} (${doc.date})\n\nNội dung & Dặn dò:\n${doc.content || doc.description}\n\nChúc các em học tập vui vẻ và đạt kết quả cao!`;
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = `${doc.title.replace(/\s+/g, '_')}.txt`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-6 border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-700 text-white shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="px-2.5 py-1 bg-white/20 backdrop-blur rounded-lg text-xs font-black uppercase tracking-wider text-blue-100 shrink-0">
              {doc.subject}
            </span>
            {doc.pinned && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shrink-0">
                <Pin className="w-3.5 h-3.5" />
                <span>Ghim quan trọng</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isTeacherOrAdmin && onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(doc);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                title="Chỉnh sửa bài học"
              >
                <Edit className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sửa</span>
              </button>
            )}

            {isTeacherOrAdmin && onDelete && (
              <button
                onClick={() => {
                  if (window.confirm(`Bạn có chắc chắn muốn xóa bài học "${doc.title}"?`)) {
                    onDelete(doc.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-rose-500/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                title="Xóa bài học"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Xóa</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-7 space-y-6 overflow-y-auto flex-1">
          {/* Main Title & Meta */}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {doc.title}
            </h1>
            <div className="flex items-center gap-4 mt-2.5 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-semibold text-slate-700">Người đăng:</span> {doc.author}{' '}
                {doc.authorRole ? `(${doc.authorRole})` : ''}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Ngày đăng: {doc.date}</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 font-bold uppercase text-[10px] text-slate-600">
                {doc.type} • {doc.size}
              </span>
            </div>
          </div>

          {/* Short description banner */}
          <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl">
            <p className="text-xs sm:text-sm text-blue-900 font-medium leading-relaxed">
              💡 {doc.description}
            </p>
          </div>

          {/* Detailed Content / Teacher instructions */}
          {doc.content && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Nội dung bài viết & Lời dặn dò của giáo viên:
              </h3>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-normal">
                {doc.content}
              </div>
            </div>
          )}

          {/* Attached Images */}
          {doc.images && doc.images.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Hình ảnh đính kèm / Sơ đồ bài học ({doc.images.length} ảnh):
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {doc.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100"
                  >
                    <SmartImage
                      src={img}
                      alt={`${doc.title} - Ảnh ${idx + 1}`}
                      title={`${doc.title} (Ảnh ${idx + 1})`}
                      subtitle={`Môn: ${doc.subject} • Người gửi: ${doc.author}`}
                      className="w-full h-56 sm:h-64 object-contain hover:scale-105 transition duration-300"
                      containerClassName="w-full h-56 sm:h-64 bg-slate-900/5 flex items-center justify-center"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Downloadable Attachment File */}
          <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">
                  {doc.attachmentName || `${doc.title} (Tệp tài liệu)`}
                </h4>
                <p className="text-xs text-slate-500">
                  Định dạng: {doc.type.toUpperCase()} • Kích thước: {doc.attachmentSize || doc.size}
                </p>
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer w-full sm:w-auto justify-center"
            >
              <Download className="w-4 h-4" />
              <span>Tải Tài Liệu Về Máy</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              onLike(doc.id);
              triggerHeartCelebration();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span>Thích bài học ({doc.likes || 0})</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Đóng lại
          </button>
        </div>
      </div>
    </div>
  );
};
