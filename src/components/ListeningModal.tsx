import React, { useState } from 'react';
import { X, MessageCircleHeart, Lock, Send, Sparkles, CheckCircle2, Shield } from 'lucide-react';
import { UserAccount, ListeningMessage } from '../types';
import { triggerHeartCelebration } from '../utils/confetti';

interface ListeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onSubmitListening: (entry: Omit<ListeningMessage, 'id' | 'timestamp' | 'status'>) => void;
}

export const ListeningModal: React.FC<ListeningModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSubmitListening,
}) => {
  const [category, setCategory] = useState<ListeningMessage['category']>('listen');
  const [content, setContent] = useState('');
  const [studentNameInput, setStudentNameInput] = useState(currentUser.name);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const categories: { id: ListeningMessage['category']; title: string; desc: string }[] = [
    { id: 'listen', title: 'Em muốn được cô lắng nghe', desc: 'Tâm sự điều em đang lo lắng, băn khoăn hoặc muốn thay đổi' },
    { id: 'study', title: 'Em cần hỗ trợ học tập', desc: 'Môn học em thấy khó, bài tập chưa hiểu cần cô hướng dẫn' },
    { id: 'friend', title: 'Em cần hỗ trợ về bạn bè', desc: 'Hiểu lầm với bạn, xích mích hoặc mong muốn hòa giải' },
    { id: 'happy', title: 'Em muốn chia sẻ một điều vui', desc: 'Thành tích mới, niềm vui ở nhà hay câu chuyện đẹp hôm nay' },
    { id: 'other', title: 'Điều em muốn nói với cô (Khác)', desc: 'Bất kỳ lời nhắn gửi tâm huyết nào em muốn gửi riêng cô' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const chosenCat = categories.find((c) => c.id === category);

    onSubmitListening({
      studentName: studentNameInput.trim() || currentUser.name,
      studentId: currentUser.studentId ? currentUser.studentId.toString() : 'guest',
      category,
      categoryTitle: chosenCat ? chosenCat.title : 'Tâm sự với cô',
      content: content.trim(),
    });

    triggerHeartCelebration();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setContent('');
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-rose-500 via-pink-600 to-indigo-600 text-white flex items-center justify-between relative">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <MessageCircleHeart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">💬 CÔ MUỐN LẮNG NGHE EM</h3>
              <p className="text-xs text-rose-100">Chuyên mục “5 Phút Lắng Nghe” – Lớp 6A2</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Confidentiality Guarantee */}
        <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2.5 flex items-center gap-2 text-xs text-emerald-900 font-medium">
          <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <b>Bảo mật 100%:</b> Nội dung gửi về hòm thư riêng của Cô giáo chủ nhiệm Nguyễn Thị Tuyết Nhi, hoàn toàn <b>không hiển thị công khai</b>.
          </span>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-slate-900">Cô đã nhận được tâm sự của em!</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Cảm ơn em đã tin tưởng và mở lòng. Cô Tuyết Nhi sẽ đọc kỹ và phản hồi sớm nhất để đồng hành cùng em nhé! ❤️
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
            {/* Student Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Họ và tên của em:
              </label>
              <input
                type="text"
                value={studentNameInput}
                onChange={(e) => setStudentNameInput(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                placeholder="Nhập họ và tên học sinh..."
              />
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Em muốn chia sẻ về vấn đề gì?
              </label>
              <div className="space-y-1.5">
                {categories.map((cat) => (
                  <label
                    key={cat.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                      category === cat.id
                        ? 'border-rose-500 bg-rose-50/60 font-semibold text-rose-900 shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="listeningCategory"
                      checked={category === cat.id}
                      onChange={() => setCategory(cat.id)}
                      className="mt-0.5 text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <div className="font-bold text-slate-800">{cat.title}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{cat.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Content text */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nội dung em muốn nói với cô:
              </label>
              <textarea
                rows={4}
                required
                placeholder="Hãy viết thật tự nhiên điều em đang nghĩ... Cô luôn ở đây để lắng nghe và thấu hiểu em!"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full text-xs text-slate-800 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!content.trim()}
              className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Gửi riêng cho Cô giáo chủ nhiệm</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
