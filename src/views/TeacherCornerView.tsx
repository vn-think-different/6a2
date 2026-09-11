import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  MessageCircleHeart,
  Award,
  BookHeart,
  Send,
  Lock,
  PlusCircle,
  ThumbsUp,
  UserCheck,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { UserAccount, TeacherPraise, ChangeStory, ListeningMessage } from '../types';
import { triggerCelebration, triggerHeartCelebration } from '../utils/confetti';
import { SmartImage } from '../components/SmartImage';

interface TeacherCornerViewProps {
  currentUser: UserAccount;
  praises: TeacherPraise[];
  changeStories: ChangeStory[];
  listeningMessages: ListeningMessage[];
  openListeningModal: () => void;
  onAddPraise: (praise: Omit<TeacherPraise, 'id'>) => void;
  onReplyListening: (id: string, reply: string) => void;
}

export const TeacherCornerView: React.FC<TeacherCornerViewProps> = ({
  currentUser,
  praises,
  changeStories,
  listeningMessages,
  openListeningModal,
  onAddPraise,
  onReplyListening,
}) => {
  const [showAddPraiseForm, setShowAddPraiseForm] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [reason, setReason] = useState('');
  const [icon, setIcon] = useState('🌟');
  const [replyInput, setReplyInput] = useState<{ [id: string]: string }>({});

  const isTeacher = currentUser.role === 'admin';

  const handleCreatePraise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !reason.trim()) return;

    onAddPraise({
      date: 'Hôm nay',
      recipient: recipient.trim(),
      reason: reason.trim(),
      icon,
      teacherName: 'Cô Tuyết Nhi',
    });

    triggerCelebration();
    setRecipient('');
    setReason('');
    setShowAddPraiseForm(false);
  };

  const handleSendReply = (id: string) => {
    const text = replyInput[id];
    if (!text || !text.trim()) return;
    onReplyListening(id, text.trim());
    setReplyInput({ ...replyInput, [id]: '' });
    triggerHeartCelebration();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Warm Teacher Welcome Header */}
      <div className="bg-gradient-to-br from-rose-500 via-pink-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <SmartImage
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80"
            alt="Cô Nguyễn Thị Tuyết Nhi"
            title="Chân dung Giáo viên chủ nhiệm"
            subtitle="Cô Nguyễn Thị Tuyết Nhi • Lớp 6A2"
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-white/30 shadow-md shrink-0"
            roundedClass="rounded-2xl"
          />
          <div className="text-center md:text-left space-y-2">
            <span className="inline-block bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase text-pink-100">
              👩‍🏫 Giáo viên thân thiện – Học sinh tích cực
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">
              Góc Tâm Tình Của Cô Tuyết Nhi
            </h2>
            <p className="text-xs sm:text-sm text-pink-100 leading-relaxed max-w-2xl">
              “Chào mừng các em và quý cha mẹ đến với góc nhỏ của cô! Mỗi bạn nhỏ bước vào 6A2 đều mang
              một màu sắc riêng biệt. Cô luôn ở đây để lắng nghe, ghi nhận từng nỗ lực nhỏ nhất và đồng
              hành cùng các em khôn lớn mỗi ngày.”
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                onClick={openListeningModal}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center gap-2 group"
              >
                <MessageCircleHeart className="w-4 h-4 text-rose-600 group-hover:scale-120 transition" />
                <span>💬 CÔ MUỐN LẮNG NGHE EM (Nhấn gửi riêng)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Minute Listening Mailbox (Special Private Panel) */}
      <section className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base sm:text-lg">
                Hộp Thư “5 Phút Lắng Nghe”
              </h3>
              <p className="text-xs text-slate-500">
                {isTeacher
                  ? 'Kênh bảo mật riêng tư: Chỉ tài khoản Giáo viên chủ nhiệm mới xem được nội dung này.'
                  : 'Nơi em chia sẻ niềm vui, nỗi lo hoặc đề xuất riêng tư với cô Nhi.'}
              </p>
            </div>
          </div>

          <button
            onClick={openListeningModal}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <MessageCircleHeart className="w-4 h-4" />
            <span>Gửi tâm sự mới</span>
          </button>
        </div>

        {/* If user is Teacher, show inbox */}
        {isTeacher ? (
          <div className="space-y-3">
            <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Cô Tuyết Nhi đang xem danh sách các lời nhắn bí mật từ học sinh ({listeningMessages.length} tin).
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {listeningMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        {msg.studentName}
                      </span>
                      <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
                        {msg.categoryTitle}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed italic">
                      “{msg.content}”
                    </p>
                    <span className="text-[10px] text-slate-400 block">{msg.timestamp}</span>
                  </div>

                  {/* Reply Section */}
                  <div className="pt-2 border-t border-slate-200">
                    {msg.teacherReply ? (
                      <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-xl text-xs text-blue-900 space-y-1">
                        <p className="font-bold text-[11px] text-blue-700">Lời hồi đáp của cô Nhi:</p>
                        <p className="text-slate-700">{msg.teacherReply}</p>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Nhập lời động viên/phản hồi gửi riêng em..."
                          value={replyInput[msg.id] || ''}
                          onChange={(e) =>
                            setReplyInput({ ...replyInput, [msg.id]: e.target.value })
                          }
                          className="flex-1 text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleSendReply(msg.id)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Gửi
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl p-6 text-center space-y-3">
            <BookHeart className="w-12 h-12 text-rose-400 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">Em đang ấp ủ điều gì chưa nói cùng ai?</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Đừng ngần ngại! Dù là niềm vui nho nhỏ, nỗi sợ môn học hay một điều khiến em buồn lòng ở lớp,
              cô Nhi luôn lắng nghe em mà không phán xét.
            </p>
            <button
              onClick={openListeningModal}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              💬 Viết thư tâm sự gửi Cô Tuyết Nhi
            </button>
          </div>
        )}
      </section>

      {/* Mỗi ngày một lời ghi nhận: Bảng điện tử "HÔM NAY CÔ MUỐN KHEN..." */}
      <section className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xl">
              🌟
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
                <span>HÔM NAY CÔ MUỐN KHEN...</span>
                <span className="text-xs font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Mỗi ngày một lời ghi nhận
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Ghi nhận từng bước tiến bộ nhỏ, tinh thần tương trợ và nỗ lực của các bạn và nhóm bạn 6A2.
              </p>
            </div>
          </div>

          {isTeacher && (
            <button
              onClick={() => setShowAddPraiseForm(!showAddPraiseForm)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{showAddPraiseForm ? 'Đóng biểu mẫu' : 'Khen thưởng mới'}</span>
            </button>
          )}
        </div>

        {/* Teacher Add Praise Form */}
        {showAddPraiseForm && (
          <form onSubmit={handleCreatePraise} className="mb-6 p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3 animate-in fade-in duration-150">
            <h4 className="font-bold text-xs text-amber-900 uppercase">Tạo lời tuyên dương mới của cô:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Tên học sinh hoặc nhóm (vd: Em Minh Đức, Tổ 2)..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="text-xs p-2 bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
              <input
                type="text"
                placeholder="Lý do cô muốn khen (hành động đẹp, sự tiến bộ)..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="sm:col-span-2 text-xs p-2 bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-600 font-medium">Huy hiệu:</span>
                {['🌟', '🏆', '💡', '🌱', '❤️', '👏'].map((ic) => (
                  <button
                    type="button"
                    key={ic}
                    onClick={() => setIcon(ic)}
                    className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center cursor-pointer transition ${
                      icon === ic ? 'bg-amber-400 scale-110 shadow-xs' : 'bg-white hover:bg-amber-100'
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg cursor-pointer"
              >
                Đăng lời khen
              </button>
            </div>
          </form>
        )}

        {/* Praise cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {praises.map((p) => (
            <div
              key={p.id}
              className="bg-gradient-to-b from-amber-50/50 to-orange-50/40 rounded-2xl border border-amber-200/80 p-4 flex flex-col justify-between hover:shadow-md transition group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl group-hover:scale-125 transition-transform duration-200">
                    {p.icon}
                  </span>
                  <span className="text-[10px] font-bold bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-full">
                    {p.date}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-amber-700 transition">
                  {p.recipient}
                </h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {p.reason}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between text-[11px] text-amber-800 font-medium">
                <span>GVCN: {p.teacherName}</span>
                <span className="text-amber-500">❤️ Ghi nhận</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Câu chuyện thay đổi: 🌱 TỪ “EM KHÔNG DÁM” ĐẾN “EM LÀM ĐƯỢC” */}
      <section className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs">
        <div className="border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              🌱
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base sm:text-lg">
                CÂU CHUYỆN THAY ĐỔI: “TỪ EM KHÔNG DÁM ĐẾN EM LÀM ĐƯỢC”
              </h3>
              <p className="text-xs text-slate-500">
                Mỗi tháng một câu chuyện truyền cảm hứng từ chính các thành viên 6A2 về sự bứt phá và trưởng thành.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {changeStories.map((story) => (
            <div
              key={story.id}
              className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition"
            >
              {story.imageUrl && (
                <div className="h-44 overflow-hidden relative">
                  <SmartImage
                    src={story.imageUrl}
                    alt={story.title}
                    title={story.title}
                    subtitle={`Câu chuyện chuyển hóa • ${story.studentName} (${story.month})`}
                    className="w-full h-full object-cover"
                    containerClassName="w-full h-full"
                  />
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-md pointer-events-none z-10">
                    {story.month} • {story.studentName}
                  </div>
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                    {story.title}
                  </h4>

                  <div className="mt-3 space-y-2 text-xs">
                    <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-xl">
                      <span className="font-bold text-rose-700 block mb-0.5">Ngày đầu (Em không dám):</span>
                      <p className="text-slate-600 italic leading-relaxed">{story.before}</p>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl">
                      <span className="font-bold text-emerald-700 block mb-0.5">Hôm nay (Em làm được):</span>
                      <p className="text-slate-700 leading-relaxed font-medium">{story.after}</p>
                    </div>

                    <div className="pt-1 text-slate-600 italic">
                      <span className="font-bold text-indigo-600 not-italic">Bài học rút ra: </span>
                      {story.reflection}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Tác giả: {story.studentName}</span>
                  <button
                    onClick={() => triggerHeartCelebration()}
                    className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    <span>{story.likes} lượt truyền cảm hứng</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
