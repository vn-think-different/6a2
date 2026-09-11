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
} from 'lucide-react';
import { StudyDocument, ScheduleEvent, StudentProduct, UserAccount } from '../types';
import { triggerHeartCelebration } from '../utils/confetti';
import { SmartImage } from '../components/SmartImage';

interface StudyCornerViewProps {
  documents: StudyDocument[];
  scheduleEvents: ScheduleEvent[];
  products: StudentProduct[];
  currentUser: UserAccount;
}

export const StudyCornerView: React.FC<StudyCornerViewProps> = ({
  documents,
  scheduleEvents,
  products,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'documents' | 'schedule' | 'products'>('documents');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchDocTerm, setSearchDocTerm] = useState('');

  const subjects = [
    'all',
    'Toán học',
    'Ngữ văn',
    'Tiếng Anh',
    'Khoa học tự nhiên',
    'Lịch sử & Địa lý',
    'GDCD & HĐTN',
  ];

  const filteredDocs = documents.filter((doc) => {
    const matchesSubject = selectedSubject === 'all' || doc.subject === selectedSubject;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchDocTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchDocTerm.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const handleSimulateDownload = (doc: StudyDocument) => {
    alert(`Đang mở / tải tài liệu: "${doc.title}". Chúc các em học tập thật tốt!`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="space-y-2">
          <span className="inline-block bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-blue-100">
            Chuyên mục 5 • Tri thức & Sáng tạo
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">
            📚 GÓC HỌC TẬP LỚP 6A2
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl">
            Kho tài liệu số, thời khóa biểu và lịch kiểm tra tuần của lớp 6A2,
            nơi vinh danh các sản phẩm thuyết trình, poster và dự án STEM xuất sắc!
          </p>
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
            <span>Tài liệu các môn</span>
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

      {/* Tab 1: Documents */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Tìm tài liệu, bài giảng..."
                value={searchDocTerm}
                onChange={(e) => setSearchDocTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Subject filter */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none w-full md:w-auto pb-1 md:pb-0">
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedSubject === sub
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {sub === 'all' ? 'Tất cả môn' : sub}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                      {doc.subject}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {doc.type.toUpperCase()} • {doc.size}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                    {doc.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {doc.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">GV: {doc.author} ({doc.date})</span>
                  <button
                    onClick={() => handleSimulateDownload(doc)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải về</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Schedule & Tasks */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Lịch Hoạt Động & Kiểm Tra Tuần Này
              </h3>
              <p className="text-xs text-slate-500">
                Lớp 6A2 – Học kỳ I, Năm học 2026 - 2027
              </p>
            </div>
            <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
              Tháng 9/2026
            </span>
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

                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium shrink-0 self-end sm:self-auto bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{evt.time}</span>
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
    </div>
  );
};
