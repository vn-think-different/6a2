import React from 'react';
import { Megaphone, Heart, Lightbulb, Handshake, Sparkles, MessageCircleHeart } from 'lucide-react';
import { CLASS_INFO } from '../data/mockData';

interface HomeBannerProps {
  onSelectAction: (action: 'thong_bao' | 'chia_se' | 'gop_y' | 'dong_hanh') => void;
  openListeningModal: () => void;
}

export const HomeBanner: React.FC<HomeBannerProps> = ({
  onSelectAction,
  openListeningModal,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 text-white shadow-lg mb-6 border border-white/10">
      {/* Decorative background glow circles */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />

      <div className="relative p-6 sm:p-8 text-center max-w-4xl mx-auto">
        {/* School Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-blue-100 text-xs sm:text-sm font-bold tracking-wider uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{CLASS_INFO.school}</span>
          <span className="opacity-60">•</span>
          <span>NĂM HỌC {CLASS_INFO.schoolYear}</span>
        </div>

        {/* Big Rainbow Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-2 drop-shadow-sm">
          🌈 CHÀO MỪNG ĐẾN VỚI LỚP 6A2
        </h1>

        {/* Subtitle & Teacher */}
        <div className="text-sm sm:text-lg font-bold text-amber-300 tracking-wide mb-1 uppercase">
          54 HỌC SINH – 54 GIA ĐÌNH – MỘT TẬP THỂ ĐỒNG HÀNH
        </div>

        <div className="inline-block bg-white/20 backdrop-blur px-4 py-1 rounded-full text-xs sm:text-sm font-semibold text-white mb-4">
          Giáo viên chủ nhiệm: <span className="font-extrabold text-amber-200 uppercase">NGUYỄN THỊ TUYẾT NHI</span>
        </div>

        {/* Warm Inspirational Quote */}
        <p className="text-sm sm:text-base italic text-blue-100 max-w-2xl mx-auto mb-6 leading-relaxed font-normal">
          “{CLASS_INFO.bannerQuote}”
        </p>

        {/* 4 Big Action Buttons (as requested in Section III) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 max-w-3xl mx-auto pt-2">
          {/* Button 1: THÔNG BÁO */}
          <button
            onClick={() => onSelectAction('thong_bao')}
            className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 backdrop-blur border border-white/20 transition cursor-pointer shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-110 transition">
              <Megaphone className="w-5 h-5 text-amber-950" />
            </div>
            <span className="font-bold text-xs sm:text-sm text-white tracking-wide">
              📢 THÔNG BÁO
            </span>
            <span className="text-[10px] text-blue-200 mt-0.5">Lịch học & dặn dò</span>
          </button>

          {/* Button 2: CHIA SẺ */}
          <button
            onClick={() => onSelectAction('chia_se')}
            className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 backdrop-blur border border-white/20 transition cursor-pointer shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-110 transition">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xs sm:text-sm text-white tracking-wide">
              ❤️ CHIA SẺ
            </span>
            <span className="text-[10px] text-rose-200 mt-0.5">Việc tốt & cảm xúc</span>
          </button>

          {/* Button 3: GÓP Ý */}
          <button
            onClick={() => onSelectAction('gop_y')}
            className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 backdrop-blur border border-white/20 transition cursor-pointer shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-400 text-slate-950 flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-110 transition">
              <Lightbulb className="w-5 h-5 text-cyan-950" />
            </div>
            <span className="font-bold text-xs sm:text-sm text-white tracking-wide">
              💡 GÓP Ý
            </span>
            <span className="text-[10px] text-cyan-200 mt-0.5">Dân vận & xây dựng</span>
          </button>

          {/* Button 4: ĐỒNG HÀNH */}
          <button
            onClick={() => onSelectAction('dong_hanh')}
            className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 backdrop-blur border border-white/20 transition cursor-pointer shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-400 text-slate-950 flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-110 transition">
              <Handshake className="w-5 h-5 text-emerald-950" />
            </div>
            <span className="font-bold text-xs sm:text-sm text-white tracking-wide">
              🤝 ĐỒNG HÀNH
            </span>
            <span className="text-[10px] text-emerald-200 mt-0.5">Cùng con tiến bộ</span>
          </button>
        </div>

        {/* Quick Listening Floating Bar */}
        <div className="mt-5 inline-flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-blue-100">Hòm thư kín kết nối trực tiếp với cô:</span>
          <button
            onClick={openListeningModal}
            className="font-bold text-amber-300 hover:text-amber-200 underline cursor-pointer ml-1"
          >
            💬 Nhấn vào đây để chia sẻ cùng Cô Nhi
          </button>
        </div>
      </div>
    </div>
  );
};
