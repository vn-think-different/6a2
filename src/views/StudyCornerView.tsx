import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  Award,
  Download,
  FileText,
  Clock,
  CheckCircle,
  ExternalLink,
  Heart,
  Search,
  Sparkles,
  PlusCircle,
  Pin,
  Eye,
  Edit,
  Trash2,
  Paperclip,
  Image as ImageIcon,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { StudyDocument, ScheduleEvent, StudentProduct, UserAccount } from '../types';
import { triggerHeartCelebration } from '../utils/confetti';
import { SmartImage } from '../components/SmartImage';
import { CreateStudyDocModal } from '../components/CreateStudyDocModal';
import { ViewStudyDocModal } from '../components/ViewStudyDocModal';
import { CreateScheduleEventModal } from '../components/CreateScheduleEventModal';

interface StudyCornerViewProps {
  documents: StudyDocument[];
  scheduleEvents: ScheduleEvent[];
  products: StudentProduct[];
  currentUser: UserAccount;
  onAddDocument?: (doc: StudyDocument) => void;
  onUpdateDocument?: (doc: StudyDocument) => void;
  onDeleteDocument?: (id: string) => void;
  onToggleLikeDocument?: (id: string) => void;
  onAddScheduleEvent?: (event: ScheduleEvent) => void;
  onDeleteScheduleEvent?: (id: string) => void;
}

export const StudyCornerView: React.FC<StudyCornerViewProps> = ({
  documents,
  scheduleEvents,
  products,
  currentUser,
  onAddDocument,
  onUpdateDocument,
  onDeleteDocument,
  onToggleLikeDocument,
  onAddScheduleEvent,
  onDeleteScheduleEvent,
}) => {
  const [activeTab, setActiveTab] = useState<'documents' | 'schedule' | 'products'>('documents');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchDocTerm, setSearchDocTerm] = useState('');

  // Modals
  const [isCreateDocOpen, setIsCreateDocOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<StudyDocument | null>(null);
  const [viewingDoc, setViewingDoc] = useState<StudyDocument | null>(null);
  const [isCreateScheduleOpen, setIsCreateScheduleOpen] = useState(false);

  const isTeacherOrAdmin =
    currentUser.role === 'admin' ||
    currentUser.role === 'sub_admin';

  const subjects = [
    'all',
    'Toán học',
    'Ngữ văn',
    'Tiếng Anh',
    'Khoa học tự nhiên',
    'Lịch sử & Địa lý',
    'GDCD & HĐTN',
    'Tin học',
  ];

  const filteredDocs = documents
    .filter((doc) => {
      const matchesSubject = selectedSubject === 'all' || doc.subject === selectedSubject;
      const matchesType =
        selectedType === 'all' ||
        (selectedType === 'lesson' && doc.type === 'lesson') ||
        (selectedType === 'file' && (doc.type === 'pdf' || doc.type === 'doc' || doc.type === 'slide')) ||
        (selectedType === 'image' && (doc.type === 'image' || (doc.images && doc.images.length > 0)));
      const matchesSearch =
        doc.title.toLowerCase().includes(searchDocTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchDocTerm.toLowerCase()) ||
        (doc.content && doc.content.toLowerCase().includes(searchDocTerm.toLowerCase()));
      return matchesSubject && matchesType && matchesSearch;
    })
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const handleDownloadDirect = (doc: StudyDocument, e: React.MouseEvent) => {
    e.stopPropagation();
    if (doc.attachmentDataUrl) {
      const link = document.createElement('a');
      link.href = doc.attachmentDataUrl;
      link.download = doc.attachmentName || `${doc.title}.${doc.type}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (doc.downloadUrl) {
      window.open(doc.downloadUrl, '_blank');
    } else {
      const textContent = `BÀI HỌC / TÀI LIỆU LỚP 6A2\n\nTiêu đề: ${doc.title}\nMôn học: ${doc.subject}\nNgười đăng: ${doc.author} (${doc.date})\n\nNội dung & Lời dặn:\n${doc.content || doc.description}\n\nChúc các em học tập vui vẻ!`;
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${doc.title.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-block bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-blue-100">
              Chuyên mục 5 • Tri thức & Sáng tạo
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">
              📚 GÓC HỌC TẬP LỚP 6A2
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              Kho tài liệu số, bài giảng và lời dặn dò của cô giáo, thời khóa biểu và lịch kiểm tra tuần của lớp 6A2,
              nơi vinh danh các sản phẩm thuyết trình, poster và dự án STEM xuất sắc!
            </p>
          </div>

          {/* Teacher / Admin Action Button */}
          {isTeacherOrAdmin && (
            <div className="shrink-0 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  setEditingDoc(null);
                  setIsCreateDocOpen(true);
                }}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black rounded-2xl shadow-md transition cursor-pointer text-xs sm:text-sm"
              >
                <PlusCircle className="w-4 h-4 text-slate-950" />
                <span>Đăng Bài Học & Gửi Tài Liệu</span>
              </button>
            </div>
          )}
        </div>

        {/* 3 Internal Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 bg-black/20 p-1.5 rounded-2xl max-w-md">
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'documents'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Tài liệu & Bài giảng</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'schedule'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Lịch tuần & Nhiệm vụ</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'products'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Sản phẩm học tập</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Documents & Lessons */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          {/* Controls Bar: Search & Filters */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài giảng, tài liệu, lời dặn của cô..."
                  value={searchDocTerm}
                  onChange={(e) => setSearchDocTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Type filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full md:w-auto">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    selectedType === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Tất cả thể loại
                </button>
                <button
                  onClick={() => setSelectedType('lesson')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    selectedType === 'lesson'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  📖 Bài giảng & Dặn dò
                </button>
                <button
                  onClick={() => setSelectedType('file')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    selectedType === 'file'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  📄 Tệp PDF / Word
                </button>
                <button
                  onClick={() => setSelectedType('image')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    selectedType === 'image'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  🖼️ Ảnh bài tập & Sơ đồ
                </button>
              </div>
            </div>

            {/* Subject filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                Môn:
              </span>
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedSubject === sub
                      ? 'bg-indigo-50 text-indigo-700 font-extrabold border border-indigo-200'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  {sub === 'all' ? 'Tất cả môn học' : sub}
                </button>
              ))}
            </div>
          </div>

          {/* Document list */}
          {filteredDocs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
              <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="font-bold text-slate-700">Chưa có bài giảng hoặc tài liệu phù hợp</p>
              <p className="text-xs text-slate-400 mt-1">Thử thay đổi từ khóa hoặc bộ lọc môn học</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setViewingDoc(doc)}
                  className={`bg-white rounded-2xl border p-5 hover:shadow-md transition flex flex-col justify-between cursor-pointer relative group ${
                    doc.pinned ? 'border-amber-300 bg-amber-50/20 shadow-xs' : 'border-slate-200'
                  }`}
                >
                  <div>
                    {/* Top badging */}
                    <div className="flex items-center justify-between mb-2.5 flex-wrap gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                          {doc.subject}
                        </span>
                        {doc.pinned && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                            <Pin className="w-3 h-3" />
                            <span>Ghim</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 uppercase font-medium">
                        {doc.type === 'lesson' ? 'Bài giảng' : doc.type} • {doc.attachmentSize || doc.size}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug group-hover:text-blue-700 transition">
                      {doc.title}
                    </h4>

                    <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">
                      {doc.description}
                    </p>

                    {/* Attached Indicators */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {(doc.attachmentName || doc.attachmentDataUrl || doc.downloadUrl) && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold">
                          <Paperclip className="w-3 h-3" />
                          <span>Có tệp đính kèm</span>
                        </span>
                      )}
                      {doc.images && doc.images.length > 0 && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-bold">
                          <ImageIcon className="w-3 h-3" />
                          <span>{doc.images.length} ảnh bài tập</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">
                      {doc.author} ({doc.date})
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isTeacherOrAdmin && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingDoc(doc);
                              setIsCreateDocOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Chỉnh sửa bài học"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {onDeleteDocument && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Xóa bài học "${doc.title}"?`)) {
                                  onDeleteDocument(doc.id);
                                }
                              }}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Xóa bài học"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}

                      <button
                        onClick={(e) => handleDownloadDirect(doc, e)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold transition cursor-pointer"
                        title="Tải tài liệu đính kèm về máy"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Tải về</span>
                      </button>

                      <button
                        onClick={() => setViewingDoc(doc)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem chi tiết</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Schedule & Tasks */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Lịch Hoạt Động & Kiểm Tra Tuần Này
              </h3>
              <p className="text-xs text-slate-500">
                Lớp 6A2 – Học kỳ I, Năm học 2026 - 2027
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                Tháng 9/2026
              </span>
              {isTeacherOrAdmin && (
                <button
                  onClick={() => setIsCreateScheduleOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Thêm Lịch Tuần</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {scheduleEvents.map((evt) => (
              <div
                key={evt.id}
                className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  evt.important
                    ? 'bg-amber-50/70 border-amber-300'
                    : 'bg-slate-50/70 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black text-xs shrink-0 ${
                      evt.important
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold">{evt.dayOfWeek}</span>
                    <span className="text-sm leading-none">{evt.date.split('/')[0]}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-sm text-slate-900">
                        {evt.subjectOrEvent}
                      </h4>
                      {evt.important && (
                        <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
                          Lưu ý quan trọng
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{evt.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{evt.time}</span>
                  </div>
                  {isTeacherOrAdmin && onDeleteScheduleEvent && (
                    <button
                      onClick={() => onDeleteScheduleEvent(evt.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Xóa lịch"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Products */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base">
              Khu Trưng Bày Sản Phẩm Học Tập & Sáng Tạo
            </h3>
            <p className="text-xs text-slate-500">
              Nơi chia sẻ bài thuyết trình Canva/PowerPoint, poster, video clip và mô hình STEM của các nhóm học sinh 6A2.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 overflow-hidden relative">
                    <SmartImage
                      src={prod.thumbnailUrl}
                      alt={prod.title}
                      title={prod.title}
                      subtitle={`Môn: ${prod.subject} • Tác giả: ${prod.authors}`}
                      className="w-full h-full object-cover hover:scale-105 transition duration-300"
                      containerClassName="w-full h-full"
                    />
                    <span className="absolute top-2 right-2 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded pointer-events-none z-10">
                      {prod.type}
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                      {prod.subject}
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                      {prod.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {prod.description}
                    </p>
                    <p className="text-[11px] text-slate-500 font-semibold pt-1">
                      Tác giả: {prod.authors}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">{prod.date}</span>
                  <button
                    onClick={() => triggerHeartCelebration()}
                    className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    <span>{prod.likes} yêu thích</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateStudyDocModal
        isOpen={isCreateDocOpen}
        onClose={() => {
          setIsCreateDocOpen(false);
          setEditingDoc(null);
        }}
        currentUser={currentUser}
        initialData={editingDoc}
        onSubmit={(doc) => {
          if (editingDoc && onUpdateDocument) {
            onUpdateDocument(doc);
          } else if (onAddDocument) {
            onAddDocument(doc);
          }
        }}
      />

      <ViewStudyDocModal
        isOpen={!!viewingDoc}
        onClose={() => setViewingDoc(null)}
        document={viewingDoc}
        currentUser={currentUser}
        onLike={(id) => onToggleLikeDocument && onToggleLikeDocument(id)}
        onEdit={(doc) => {
          setViewingDoc(null);
          setEditingDoc(doc);
          setIsCreateDocOpen(true);
        }}
        onDelete={(id) => onDeleteDocument && onDeleteDocument(id)}
      />

      <CreateScheduleEventModal
        isOpen={isCreateScheduleOpen}
        onClose={() => setIsCreateScheduleOpen(false)}
        onSubmit={(evt) => onAddScheduleEvent && onAddScheduleEvent(evt)}
      />
    </div>
  );
};
