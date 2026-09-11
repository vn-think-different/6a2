import React, { useState } from 'react';
import {
  TrendingUp,
  Star,
  CheckCircle2,
  Vote,
  BarChart3,
  Award,
  Sparkles,
  Smile,
  ShieldCheck,
} from 'lucide-react';
import { ProgressRating, ClassPoll, UserAccount } from '../types';
import { triggerCelebration } from '../utils/confetti';

interface ClassProgressViewProps {
  initialRatings: ProgressRating[];
  initialPolls: ClassPoll[];
  currentUser: UserAccount;
}

export const ClassProgressView: React.FC<ClassProgressViewProps> = ({
  initialRatings,
  initialPolls,
  currentUser,
}) => {
  const [ratings, setRatings] = useState<ProgressRating[]>(initialRatings);
  const [userRatings, setUserRatings] = useState<{ [category: string]: number }>({});
  const [polls, setPolls] = useState<ClassPoll[]>(initialPolls);
  const [userVotedPolls, setUserVotedPolls] = useState<{ [pollId: string]: string }>({});

  const handleRate = (category: string, starRating: number) => {
    setUserRatings({ ...userRatings, [category]: starRating });
    setRatings((prev) =>
      prev.map((r) => {
        if (r.category === category) {
          const newTotal = r.totalRatings + 1;
          const newStars = Number(
            ((r.stars * r.totalRatings + starRating) / newTotal).toFixed(1)
          );
          return {
            ...r,
            stars: newStars,
            totalRatings: newTotal,
            distribution: {
              ...r.distribution,
              [starRating]: (r.distribution[starRating] || 0) + 1,
            },
          };
        }
        return r;
      })
    );
    triggerCelebration();
  };

  const handleVote = (pollId: string, optionId: string) => {
    if (userVotedPolls[pollId]) return;

    setUserVotedPolls({ ...userVotedPolls, [pollId]: optionId });
    setPolls((prev) =>
      prev.map((p) => {
        if (p.id === pollId) {
          return {
            ...p,
            totalVotes: p.totalVotes + 1,
            options: p.options.map((opt) =>
              opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
            ),
          };
        }
        return p;
      })
    );
    triggerCelebration();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <span className="inline-block bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-100">
            Chuyên mục 8 & XII • Cải tiến & Dân chủ học đường
          </span>
          <h2 className="text-2xl sm:text-4xl font-black">
            📈 6A2 CÙNG TIẾN BỘ
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
            Hệ thống lắng nghe đa chiều thông qua đánh giá định kỳ và bình chọn nhanh.
            Ý kiến của học sinh và phụ huynh là động lực để lớp 6A2 hoàn thiện và phát triển mỗi ngày.
          </p>
        </div>
      </div>

      {/* 1. KHẢO SÁT ĐỊNH KỲ (1 - 5 Sao) */}
      <section className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs">
        <div className="border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base sm:text-lg">
                Khảo Sát Đánh Giá Chất Lượng 6A2 (Thang điểm 1 - 5 Sao)
              </h3>
              <p className="text-xs text-slate-500">
                Hãy cho điểm công tâm để giúp thầy cô và ban cán sự lớp nâng cao chất lượng hoạt động!
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {ratings.map((item) => {
            const userCurrentRating = userRatings[item.category] || 0;

            return (
              <div
                key={item.category}
                className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-2 pt-1 text-xs text-slate-500 font-medium">
                    <span className="font-black text-amber-600 text-sm">
                      ★ {item.stars} / 5.0
                    </span>
                    <span>• {item.totalRatings} lượt đánh giá từ PH & HS</span>
                  </div>
                </div>

                {/* Star Interactive Rating Buttons */}
                <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
                  <span className="text-[11px] font-bold text-slate-500">
                    {userCurrentRating > 0
                      ? `Bạn đã chấm: ${userCurrentRating} sao`
                      : 'Nhấn để chấm sao:'}
                  </span>
                  <div className="flex items-center gap-1 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRate(item.category, star)}
                        className="p-1 hover:scale-125 transition cursor-pointer"
                        title={`${star} sao`}
                      >
                        <Star
                          className={`w-6 h-6 transition ${
                            star <= (userCurrentRating || Math.round(item.stars))
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. BÌNH CHỌN NHANH (POLLS) */}
      <section className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base sm:text-lg">
                Bình Chọn & Lấy Ý Kiến Trực Tuyến 6A2
              </h3>
              <p className="text-xs text-slate-500">
                Thăm dò ý kiến dân chủ, công khai và minh bạch
              </p>
            </div>
          </div>
        </div>

        {polls.map((poll) => {
          const userVotedOpt = userVotedPolls[poll.id];

          return (
            <div
              key={poll.id}
              className="bg-slate-50/70 rounded-2xl border border-slate-200 p-5 space-y-3"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                  {poll.question}
                </h4>
                <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200">
                  Tổng: {poll.totalVotes} phiếu
                </span>
              </div>

              <div className="space-y-2.5 pt-1">
                {poll.options.map((opt) => {
                  const percentage =
                    poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                  const isSelected = userVotedOpt === opt.id;

                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleVote(poll.id, opt.id)}
                      className={`relative overflow-hidden p-3.5 rounded-xl border transition cursor-pointer group ${
                        isSelected
                          ? 'border-indigo-500 ring-2 ring-indigo-400/40 bg-indigo-50/50'
                          : 'border-slate-200 hover:border-indigo-300 bg-white'
                      }`}
                    >
                      {/* Percentage fill */}
                      <div
                        className="absolute inset-y-0 left-0 bg-indigo-100/50 -z-0 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />

                      <div className="relative z-10 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition shrink-0 text-xs ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                : 'border-slate-300 bg-white group-hover:border-indigo-400'
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <span className="font-bold text-xs sm:text-sm text-slate-800">
                            {opt.text}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-slate-500">{opt.votes} phiếu</span>
                          <span className="font-black text-xs text-indigo-700 w-9 text-right">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {userVotedOpt && (
                <div className="pt-2 text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{currentUser.name} đã bình chọn cho chủ đề này!</span>
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
};
