import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Link as LinkIcon,
  Sparkles,
  CheckCircle,
  Download,
  RotateCcw,
  Shield,
  Eye,
  ImageIcon,
} from 'lucide-react';
import { ImageModalOptions, PRESET_LIBRARY } from '../context/ImageContext';
import { UserAccount } from '../types';

interface ImageEditorModalInnerProps {
  options: ImageModalOptions;
  onClose: () => void;
  canEdit: boolean;
  currentUser: UserAccount;
  getImage: (src?: string) => string;
  onSaveSuccess: (newSrc: string) => void;
}

export const ImageEditorModalInner: React.FC<ImageEditorModalInnerProps> = ({
  options,
  onClose,
  canEdit,
  currentUser,
  getImage,
  onSaveSuccess,
}) => {
  const rawSrc = options.src || options.currentUrl || '';
  const currentActualSrc = getImage(rawSrc);
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>(canEdit ? 'upload' : 'presets');
  const [newImagePreview, setNewImagePreview] = useState<string>(currentActualSrc);
  const [urlInput, setUrlInput] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasChanged = newImagePreview !== currentActualSrc;

  // File upload reader
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn một tệp hình ảnh hợp lệ (PNG, JPG, JPEG, WEBP, GIF)');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      if (loadEvt.target?.result) {
        setNewImagePreview(loadEvt.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // URL apply
  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setNewImagePreview(urlInput.trim());
    setFileName('Ảnh từ liên kết web');
  };

  // Reset
  const handleReset = () => {
    setNewImagePreview(currentActualSrc);
    setUrlInput('');
    setFileName('');
  };

  // Save
  const handleSave = () => {
    if (!hasChanged) {
      onClose();
      return;
    }
    onSaveSuccess(newImagePreview);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  {options.title || 'Xem & Chỉnh sửa hình ảnh'}
                </h3>
                {canEdit ? (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                    <Shield className="w-3 h-3 text-blue-600" />
                    Quản trị viên
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                    <Eye className="w-3 h-3 text-slate-500" />
                    Chế độ xem
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {options.subtitle || 'Hệ sinh thái lớp 6A2 – Kết nối yêu thương'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition cursor-pointer shrink-0"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Image View (lg: 6 or 7 cols) */}
          <div className={`${canEdit ? 'lg:col-span-6' : 'lg:col-span-12'} flex flex-col items-center justify-center space-y-3`}>
            <div
              onClick={() => setIsZoomed(!isZoomed)}
              className={`relative w-full rounded-2xl bg-slate-900/5 border border-slate-200 overflow-hidden flex items-center justify-center cursor-zoom-in transition-all ${
                isZoomed ? 'max-h-[550px]' : 'max-h-[360px]'
              }`}
            >
              <img
                src={newImagePreview}
                alt={options.title || 'Hình ảnh'}
                className="w-full h-auto max-h-[500px] object-contain transition duration-200"
              />

              {hasChanged && (
                <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Đã chọn ảnh mới</span>
                </div>
              )}
            </div>

            {/* Image actions: Download / Zoom hint */}
            <div className="w-full flex items-center justify-between text-xs text-slate-500 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">Click vào ảnh để phóng to/thu nhỏ</span>
              </div>
              <a
                href={newImagePreview}
                download="6A2_hinh_anh.jpg"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải ảnh gốc</span>
              </a>
            </div>

            {options.description && (
              <div className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
                <span className="font-bold text-slate-900">Mô tả: </span>
                {options.description}
              </div>
            )}

            {!canEdit && (
              <div className="w-full p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <b>Thông báo quyền hạn:</b> Bạn đang xem hình ảnh này ở chất lượng cao. Chỉ{' '}
                  <b>Quản trị viên (Cô giáo Tuyết Nhi & Ban cán sự lớp)</b> mới có quyền thay đổi hình ảnh đại diện và ảnh trên giao diện.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Admin Edit Controls (if canEdit is true) */}
          {canEdit && (
            <div className="lg:col-span-6 bg-slate-50/70 rounded-2xl border border-slate-200/90 p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Thay đổi hình ảnh này</span>
                </h4>
                <span className="text-[11px] text-slate-500 font-medium">
                  {currentUser.roleTitle}
                </span>
              </div>

              {/* Edit Mode Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'upload'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Tải ảnh lên</span>
                </button>

                <button
                  onClick={() => setActiveTab('url')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'url'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Dán link (URL)</span>
                </button>

                <button
                  onClick={() => setActiveTab('presets')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'presets'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Kho ảnh mẫu</span>
                </button>
              </div>

              {/* Tab 1: Upload from computer/phone */}
              {activeTab === 'upload' && (
                <div className="space-y-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer ${
                      isDragging
                        ? 'border-blue-500 bg-blue-50/50 scale-102'
                        : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-xs text-slate-800">
                      Nhấn để tải ảnh từ máy tính / điện thoại
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Hoặc kéo thả file ảnh vào đây (Hỗ trợ JPG, PNG, WEBP, GIF)
                    </p>
                    {fileName && (
                      <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle className="w-3 h-3" />
                        <span>Đã tải: {fileName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: URL */}
              {activeTab === 'url' && (
                <form onSubmit={handleApplyUrl} className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">
                    Nhập đường dẫn trực tiếp của ảnh (URL):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="flex-1 text-xs p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!urlInput.trim()}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                    >
                      Áp dụng
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Mẹo: Có thể sao chép link ảnh từ Google Photos, Facebook hoặc Unsplash.
                  </p>
                </form>
              )}

              {/* Tab 3: Preset Library */}
              {activeTab === 'presets' && (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {PRESET_LIBRARY.map((group, gIdx) => (
                    <div key={gIdx} className="space-y-1.5">
                      <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                        {group.category}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {group.images.map((img, iIdx) => (
                          <button
                            type="button"
                            key={iIdx}
                            onClick={() => {
                              setNewImagePreview(img.url);
                              setFileName(img.label);
                            }}
                            className={`relative rounded-xl overflow-hidden border-2 h-16 text-left transition group cursor-pointer ${
                              newImagePreview === img.url
                                ? 'border-blue-600 ring-2 ring-blue-400'
                                : 'border-slate-200 hover:border-slate-400'
                            }`}
                          >
                            <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                            <span className="absolute inset-0 bg-black/45 flex items-end p-1 text-[9px] text-white font-medium line-clamp-1 leading-tight">
                              {img.label}
                            </span>
                            {newImagePreview === img.url && (
                              <div className="absolute top-1 right-1 bg-blue-600 rounded-full text-white p-0.5">
                                <CheckCircle className="w-3 h-3" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={!hasChanged}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Khôi phục ảnh gốc</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Đóng
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!hasChanged}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-extrabold shadow-sm transition active:scale-98 cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Lưu & Cập nhật ảnh</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
