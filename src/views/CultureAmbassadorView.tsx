import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  Shield,
  MessageSquare,
  Users,
  CheckCircle,
  Camera,
  Send,
  PlusCircle,
  HelpCircle,
  ThumbsUp,
  AlertOctagon,
} from 'lucide-react';
import { Ambassador, GoodDeedWeekly, CultureMailboxItem, UserAccount } from '../types';
import { triggerHeartCelebration, triggerCelebration } from '../utils/confetti';
import { SmartImage } from '../components/SmartImage';
import { useImageModal } from '../context/ImageContext';

interface CultureAmbassadorViewProps {
  ambassadors: Ambassador[];
  goodDeeds: GoodDeedWeekly[];
  cultureMailbox: CultureMailboxItem[];
  currentUser: UserAccount;
  onSubmitGoodDeed: (weekId: string, text: string) => void;
  onSubmitMailbox: (item: Omit<CultureMailboxItem, 'id' | 'timestamp' | 'status'>) => void;
}

export const CultureAmbassadorView: React.FC<CultureAmbassadorViewProps> = ({
  ambassadors,
  goodDeeds,
  cultureMailbox,
  currentUser,
  onSubmitGoodDeed,
  onSubmitMailbox,
}) => {
  const [selectedWeekId, setSelectedWeekId] = useState<string>(goodDeeds[0]?.id || 'week-1');
  const [goodDeedInput, setGoodDeedInput] = useState('');
  const [showMailboxModal, setShowMailboxModal] = useState(false);
  const [mailboxType, setMailboxType] = useState<CultureMailboxItem['type']>('good_action');
  const [mailboxContent, setMailboxContent] = useState('');
  const [senderName, setSenderName] = useState(currentUser.name);
  const { showToast } = useImageModal();

  const currentWeek = goodDeeds.find((w) => w.id === selectedWeekId) || goodDeeds[0];

  const handleSendGoodDeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goodDeedInput.trim()) return;
    onSubmitGoodDeed(selectedWeekId, goodDeedInput.trim());
    triggerHeartCelebration();
    showToast('Cảm ơn em đã gửi việc tốt! Mỗi hành động đẹp làm lớp 6A2 thêm rạng rỡ.');
    setGoodDeedInput('');
  };

  const handleSendMailbox = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mailboxContent.trim()) return;

    const titles: Record<CultureMailboxItem['type'], string> = {
      good_action: 'Một hành động đẹp',
      need_help: 'Một việc cần được hỗ trợ',
      conflict: 'Một xung đột cần giáo viên giúp đỡ',
      safety: 'Một vấn đề liên quan đến an toàn',
    };

    onSubmitMailbox({
      senderName: senderName.trim() || currentUser.name,
      type: mailboxType,
      typeTitle: titles[mailboxType],
      content: mailboxContent.trim(),
    });

    triggerCelebration();
    setMailboxContent('');
    setShowMailboxModal(false);
    showToast('Hộp thư văn hóa 6A2 đã ghi nhận thông tin của em! Giáo viên sẽ xử lý kịp thời và chu đáo.');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-purple-700 via-pink-600 to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Chuyên mục nổi bật • Mô hình 2</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black">
            🌟 ĐẠI SỨ VĂN HÓA HỌC ĐƯỜNG 6A2
          </h2>
          <p className="text-xs sm:text-sm text-pink-100 max-w-2xl leading-relaxed">
            Biến mỗi học sinh từ “người được giáo dục” thành “người lan tỏa văn hóa”.
            Chung tay xây dựng một môi trường lớp học 6A2 thân thiện, văn minh, không bạo lực,
            ngập tràn sự tôn trọng và yêu thương!
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => setShowMailboxModal(true)}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <Send className="w-4 h-4 text-rose-600" />
              <span>📮 EM MUỐN CHIA SẺ (Hộp Thư Văn Hóa)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Core Ambassadors Section */}
      <section className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs">
        <div className="border-b border-slate-100 pb-4 mb-5">
          <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
            <span>6 ĐẠI SỨ NÒNG CỐT 6A2</span>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              Nhiệm kỳ 2026 - 2027
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Các bạn học sinh nòng cốt đại diện cho 6 giá trị văn hóa học đường của lớp.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ambassadors.map((amb) => (
            <div
              key={amb.id}
              className="bg-slate-50 rounded-2xl border border-slate-200 p-4 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl p-2 bg-white rounded-2xl shadow-xs border border-slate-100">
                    {amb.icon}
                  </span>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{amb.title}</h4>
                    <p className="text-xs font-semibold text-purple-600">
                      Học sinh: {amb.studentName} (STT {amb.studentStt})
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                  <span className="font-bold text-slate-800">Nhiệm vụ: </span>
                  {amb.mission}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-medium text-emerald-600">
                  <CheckCircle className="w-3.5 h-3.5" /> Đang phụ trách
                </span>
                <span className="text-slate-400">Lớp 6A2</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mỗi tuần một việc tốt */}
      <section className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs">
        <div className="border-b border-slate-100 pb-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
              <span>❤️ MỖI TUẦN MỘT VIỆC TỐT</span>
              <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                Ghi nhận việc tử tế
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Học sinh đăng ký hoặc báo việc tốt kèm hình ảnh/minh chứng.
            </p>
          </div>

          {/* Week Selector */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none bg-slate-100 p-1 rounded-xl">
            {goodDeeds.map((w) => (
              <button
                key={w.id}
                onClick={() => setSelectedWeekId(w.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedWeekId === w.id
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tuần {w.weekNumber}
              </button>
            ))}
          </div>
        </div>

        {/* Current Week Banner */}
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-4 mb-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black text-sm shrink-0">
              T{currentWeek.weekNumber}
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-rose-950">
                Chủ đề: “{currentWeek.theme}”
              </h4>
              <p className="text-xs text-slate-600 mt-1">{currentWeek.description}</p>
            </div>
          </div>

          {/* Form to submit good deed */}
          <form onSubmit={handleSendGoodDeed} className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder={`Em đã làm việc tốt gì trong tuần này theo chủ đề "${currentWeek.theme}"?`}
              value={goodDeedInput}
              onChange={(e) => setGoodDeedInput(e.target.value)}
              className="flex-1 text-xs px-3 py-2 bg-white border border-rose-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>Gửi việc tốt</span>
            </button>
          </form>
        </div>

        {/* List of submissions */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Các việc tốt đã được ghi nhận ({currentWeek.submissions.length}):
          </h4>

          {currentWeek.submissions.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4 text-center">
              Chưa có bạn nào gửi việc tốt tuần này. Hãy là người đầu tiên gieo mầm tử tế nhé!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentWeek.submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-start gap-3"
                >
                  <SmartImage
                    src={sub.studentAvatar}
                    alt={sub.studentName}
                    title={`Ảnh đại diện: ${sub.studentName}`}
                    subtitle={`Học sinh làm việc tốt • Tuần ${currentWeek.weekNumber}`}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-rose-200 shrink-0 mt-0.5"
                    roundedClass="rounded-full"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{sub.studentName}</span>
                      <span className="text-[10px] text-slate-400">{sub.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed bg-white p-2 rounded-lg border border-slate-200/70">
                      {sub.description}
                    </p>
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-rose-600 font-semibold">
                      <span>❤️ {sub.likes} lượt yêu thương</span>
                      <span className="text-emerald-600">• Đã xác thực</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Góc "ĐẠI SỨ KỂ CHUYỆN" */}
      <section className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs">
        <div className="border-b border-slate-100 pb-4 mb-4">
          <h3 className="font-black text-slate-900 text-base sm:text-lg">
            GÓC “ĐẠI SỨ KỂ CHUYỆN”
          </h3>
          <p className="text-xs text-slate-500">
            Những câu chuyện cảm động, việc tử tế được chính các em học sinh quan sát và kể lại.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-2">
            <span className="text-2xl">🤝</span>
            <h4 className="font-bold text-sm text-blue-900">Bạn A đã giúp bạn B...</h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              “Khi bạn Huy Khánh bị quên tập vở bài tập Ngữ văn, bạn Lan Phương đã vui vẻ chia sẻ cùng
              xem chung sách và giảng lại bài cho bạn trong giờ ra chơi.”
            </p>
            <span className="text-[11px] text-blue-600 font-semibold block pt-1">
              Người kể: Đại sứ Yêu thương Bảo Châu
            </span>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-2">
            <span className="text-2xl">🌱</span>
            <h4 className="font-bold text-sm text-emerald-900">Nhóm 4 cùng làm sạch khu vực</h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              “Sau giờ ăn trưa bán trú, các bạn bàn 4 đã chủ động lau dọn bàn ăn và phân loại hộp cơm,
              giúp các cô bác phục vụ giảm bớt vất vả.”
            </p>
            <span className="text-[11px] text-emerald-600 font-semibold block pt-1">
              Người kể: Đại sứ Môi trường Minh Long
            </span>
          </div>

          <div className="bg-pink-50/70 border border-pink-200 rounded-2xl p-4 space-y-2">
            <span className="text-2xl">💬</span>
            <h4 className="font-bold text-sm text-pink-900">Một lời xin lỗi làm thay đổi tình bạn</h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              “Một va chạm nhỏ khi chơi bóng rổ suýt làm hai bạn to tiếng. Nhưng bạn Vinh đã chủ động
              chìa tay xin lỗi và đỡ bạn đứng dậy. Giờ hai bạn là đôi bạn thân thiết!”
            </p>
            <span className="text-[11px] text-pink-600 font-semibold block pt-1">
              Người kể: Đại sứ Lời nói đẹp Thùy Dương
            </span>
          </div>
        </div>
      </section>

      {/* Modal: Hộp thư văn hóa 6A2 */}
      {showMailboxModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-gradient-to-r from-purple-700 to-indigo-700 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base sm:text-lg">📮 HỘP THƯ VĂN HÓA 6A2</h3>
                <p className="text-xs text-purple-200">Em muốn chia sẻ cùng Giáo viên và Nhà trường</p>
              </div>
              <button
                onClick={() => setShowMailboxModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Crucial protection notice from Section V.3 */}
            <div className="bg-amber-50 p-3 border-b border-amber-200 text-xs text-amber-950 flex items-start gap-2">
              <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <b>Nguyên tắc an toàn học đường:</b> Học sinh không tự xử lý các vụ việc nghiêm trọng.
                Website là kênh tiếp nhận; <b>Giáo viên chủ nhiệm và Nhà trường mới là người trực tiếp phụ trách xử lý</b> bảo vệ học sinh.
              </span>
            </div>

            <form onSubmit={handleSendMailbox} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Người gửi (Học sinh / Phụ huynh):
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Vấn đề em muốn báo:
                </label>
                <select
                  value={mailboxType}
                  onChange={(e) => setMailboxType(e.target.value as any)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="good_action">🌟 Một hành động đẹp đáng khen ngợi</option>
                  <option value="need_help">🤝 Một việc cần được hỗ trợ kịp thời</option>
                  <option value="conflict">⚖️ Một xung đột cần giáo viên giúp đỡ hòa giải</option>
                  <option value="safety">🛡️ Một vấn đề liên quan đến an toàn / bạo lực học đường</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nội dung chi tiết:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Mô tả cụ thể sự việc, thời gian, địa điểm hoặc bạn bè liên quan để cô giáo nắm bắt và hỗ trợ kịp thời..."
                  value={mailboxContent}
                  onChange={(e) => setMailboxContent(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs"
              >
                Gửi đến Giáo viên chủ nhiệm & Nhà trường
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
