import React, { useState } from 'react';
import {
  BookMarked,
  Film,
  Play,
  Heart,
  Calendar,
  Clock,
  Sparkles,
  Eye,
  Camera,
  Share2,
} from 'lucide-react';
import { DiaryTimelineItem, ClassVlog } from '../types';
import { triggerHeartCelebration } from '../utils/confetti';
import { SmartImage } from '../components/SmartImage';

interface DiaryAndVlogViewProps {
  diaryEntries: DiaryTimelineItem[];
  vlogs: ClassVlog[];
}

export const DiaryAndVlogView: React.FC<DiaryAndVlogViewProps> = ({
  diaryEntries,
  vlogs,
}) => {
  const [activeTab, setActiveTab] = useState<'diary' | 'vlog'>('diary');
  const [activeVlogModal, setActiveVlogModal] = useState<ClassVlog | null>(null);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <span className="inline-block bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-amber-100">
            Chuyên mục 7 & XI • Kỷ niệm & Truyền thông
          </span>
          <h2 className="text-2xl sm:text-4xl font-black">
            📸 NHẬT KÝ & VLOG 6A2
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 max-w-2xl leading-relaxed">
            Lưu giữ từng khoảnh khắc thanh xuân rực rỡ dưới mái trường THCS Bình An.
            Mỗi bức ảnh, mỗi thước phim là một câu chuyện đẹp về tình thầy trò và tình bạn bè thiêng liêng.
          </p>

          {/* Tab Switcher */}
          <div className="mt-5 flex gap-2 bg-black/20 p-1.5 rounded-2xl max-w-xs">
            <button
              onClick={() => setActiveTab('diary')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'diary'
                  ? 'bg-white text-orange-950 shadow-xs'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>Nhật ký thời gian</span>
            </button>

            <button
              onClick={() => setActiveTab('vlog')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'vlog'
                  ? 'bg-white text-orange-950 shadow-xs'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Vlog 6A2 (Video)</span>
            </button>
          </div>
        </div>
      </div>

      {/* View 1: Timeline Diary */}
      {activeTab === 'diary' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <h3 className="font-extrabold text-base text-slate-900">
              Dòng Thời Gian Kỷ Niệm Lớp 6A2
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Những dấu mốc khó quên trên hành trình trưởng thành của 54 thành viên.
            </p>
          </div>

          <div className="relative border-l-2 border-amber-300 ml-4 sm:ml-8 pl-6 space-y-8">
            {diaryEntries.map((entry) => (
              <div key={entry.id} className="relative group">
                {/* Timeline dot */}
                <div className="absolute -left-[31px] top-1.5 w-5 h-5 rounded-full bg-amber-500 ring-4 ring-white shadow-xs flex items-center justify-center text-[10px] text-white">
                  ✓
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="h-56 sm:h-auto overflow-hidden relative">
                      <SmartImage
                        src={entry.mediaUrl}
                        alt={entry.title}
                        title={entry.title}
                        subtitle={`Dòng thời gian kỷ niệm • Ngày ${entry.date}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        containerClassName="w-full h-full"
                      />
                      <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-lg pointer-events-none z-10">
                        {entry.date}
                      </span>
                    </div>

                    <div className="p-5 sm:p-6 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                            {entry.period}
                          </span>
                        </div>
                        <h4 className="font-black text-base sm:text-lg text-slate-900 leading-snug">
                          {entry.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                          {entry.caption}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 text-[11px] font-medium">
                          Ghi chép: {entry.author}
                        </span>
                        <button
                          onClick={() => triggerHeartCelebration()}
                          className="flex items-center gap-1.5 text-rose-600 font-bold hover:scale-105 transition cursor-pointer"
                        >
                          <Heart className="w-4 h-4 fill-rose-500" />
                          <span>Yêu thích</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View 2: Vlog 6A2 (Section XI in Plan) */}
      {activeTab === 'vlog' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <span>KHU VỰC “VLOG 6A2”</span>
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                Mỗi tuần / tháng một câu chuyện
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chuỗi video phóng sự và phỏng vấn chân thực do Ban truyền thông 6A2 và cô giáo thực hiện.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {vlogs.map((vlog) => (
              <div
                key={vlog.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail with Play Button */}
                  <div
                    onClick={() => setActiveVlogModal(vlog)}
                    className="relative h-48 overflow-hidden cursor-pointer bg-slate-950"
                  >
                    <SmartImage
                      src={vlog.thumbnail}
                      alt={vlog.title}
                      title={vlog.title}
                      subtitle={`Vlog 6A2 • ${vlog.episode} • Thời lượng: ${vlog.duration}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90"
                      containerClassName="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none z-10">
                      <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg group-hover:scale-115 transition">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>

                    <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                      {vlog.episode}
                    </span>

                    <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur text-white text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {vlog.duration}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <h4
                      onClick={() => setActiveVlogModal(vlog)}
                      className="font-black text-sm text-slate-900 group-hover:text-rose-600 transition cursor-pointer line-clamp-2"
                    >
                      {vlog.title}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {vlog.description}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium pt-1">
                      Ngày phát: {vlog.date}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Eye className="w-3.5 h-3.5" />
                    {vlog.views} lượt xem
                  </span>
                  <button
                    onClick={() => triggerHeartCelebration()}
                    className="flex items-center gap-1 text-rose-600 font-bold hover:scale-105 transition cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    <span>Thả tim</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Video Player Modal */}
      {activeVlogModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-2xl w-full text-white overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rose-400 uppercase">
                  {activeVlogModal.episode}
                </span>
                <h3 className="font-bold text-sm sm:text-base text-white">
                  {activeVlogModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVlogModal(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Simulated Video Player Screen */}
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              <img
                src={activeVlogModal.thumbnail}
                alt={activeVlogModal.title}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
                <div className="w-16 h-16 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white flex items-center justify-center cursor-pointer shadow-xl animate-pulse">
                  <Play className="w-7 h-7 fill-white ml-1" />
                </div>
                <div className="bg-black/70 backdrop-blur px-4 py-2 rounded-xl text-xs max-w-md">
                  <p className="font-bold text-amber-300">Đang phát Vlog 6A2 ({activeVlogModal.duration})</p>
                  <p className="text-slate-300 text-[11px] mt-0.5">{activeVlogModal.description}</p>
                </div>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between text-xs text-slate-400">
              <span>Được biên tập bởi Ban truyền thông 6A2</span>
              <button
                onClick={() => {
                  triggerHeartCelebration();
                  alert('Cảm ơn bạn đã thả tim cho Ban truyền thông 6A2! ❤️');
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 fill-white" />
                <span>Thả tim video</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
