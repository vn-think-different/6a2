import React, { useState } from 'react';
import {
  HeartHandshake,
  Lightbulb,
  Megaphone,
  Handshake,
  MessageCircle,
  ArrowRight,
  CheckCircle,
  Shield,
  Lock,
  Send,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { ParentActionProof, ParentSuggestion, UserAccount } from '../types';
import { triggerCelebration, triggerHeartCelebration } from '../utils/confetti';

interface ParentCompanionViewProps {
  actionProofs: ParentActionProof[];
  suggestions: ParentSuggestion[];
  currentUser: UserAccount;
  onSubmitSuggestion: (sug: Omit<ParentSuggestion, 'id' | 'timestamp' | 'status'>) => void;
  onReplySuggestion: (id: string, response: string) => void;
}

export const ParentCompanionView: React.FC<ParentCompanionViewProps> = ({
  actionProofs,
  suggestions,
  currentUser,
  onSubmitSuggestion,
  onReplySuggestion,
}) => {
  const [activeActionModal, setActiveActionModal] = useState<
    'gop_y' | 'phan_anh' | 'dong_hanh' | 'dong_vien' | null
  >(null);

  const [parentName, setParentName] = useState(currentUser.name);
  const [studentName, setStudentName] = useState(currentUser.childName || 'Đoàn Thiên Bảo');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [content, setContent] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('Hỗ trợ hoạt động đọc sách');
  const [teacherResponseText, setTeacherResponseText] = useState<{ [id: string]: string }>({});

  const isTeacher = currentUser.role === 'admin';

  const companionOptions = [
    'Hỗ trợ hoạt động đọc sách (15 phút mỗi sáng)',
    'Hỗ trợ hoạt động trải nghiệm thực tế / tham quan',
    'Chia sẻ nghề nghiệp và định hướng tương lai',
    'Hỗ trợ hoạt động thiện nguyện, vì cộng đồng',
    'Hỗ trợ rèn luyện kỹ năng mềm cho học sinh (sơ cứu, tự vệ...)',
    'Khác (tài trợ cơ sở vật chất, góc xanh...)',
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && activeActionModal !== 'dong_hanh') return;

    const typeMapping: Record<string, { type: ParentSuggestion['type']; title: string }> = {
      gop_y: { type: 'gop_y', title: '💡 Góp ý xây dựng lớp' },
      phan_anh: { type: 'phan_anh', title: '📢 Phản ánh cần hỗ trợ' },
      dong_hanh: { type: 'dong_hanh', title: '🤝 Đăng ký đồng hành' },
      dong_vien: { type: 'dong_vien', title: '💬 Gửi lời động viên' },
    };

    const target = typeMapping[activeActionModal || 'gop_y'];

    onSubmitSuggestion({
      parentName: parentName.trim() || currentUser.name,
      studentName: studentName.trim() || 'Học sinh 6A2',
      phoneOrEmail: phoneOrEmail.trim() || undefined,
      type: target.type,
      typeTitle: target.title,
      content:
        activeActionModal === 'dong_hanh'
          ? `[Đăng ký: ${selectedActivity}] ${content.trim()}`
          : content.trim(),
      selectedActivity: activeActionModal === 'dong_hanh' ? selectedActivity : undefined,
    });

    triggerCelebration();
    setContent('');
    setActiveActionModal(null);
    alert('Ý kiến của quý phụ huynh đã được gửi trực tiếp đến Cô giáo chủ nhiệm Nguyễn Thị Tuyết Nhi!');
  };

  const handleSendTeacherResponse = (id: string) => {
    const text = teacherResponseText[id];
    if (!text || !text.trim()) return;
    onReplySuggestion(id, text.trim());
    setTeacherResponseText({ ...teacherResponseText, [id]: '' });
    triggerHeartCelebration();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-blue-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2 text-center md:text-left">
          <span className="inline-block bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-teal-100">
            Chuyên mục 6 • Dân vận số trong trường học
          </span>
          <h2 className="text-2xl sm:text-4xl font-black">
            👨‍👩‍👧 CÙNG ĐỒNG HÀNH VỚI 6A2
          </h2>
          <p className="text-xs sm:text-sm text-teal-100 max-w-2xl leading-relaxed">
            54 gia đình – Một tập thể đồng hành. Cầu nối gắn kết chặt chẽ giữa gia đình và nhà trường
            vì sự tiến bộ, hạnh phúc và an toàn của các con.
          </p>
        </div>
      </div>

      {/* 4 Interactive Parent Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Button 1: GÓP Ý */}
        <button
          onClick={() => setActiveActionModal('gop_y')}
          className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-amber-400 hover:shadow-md transition text-left cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <Lightbulb className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-amber-600 transition">
              💡 GÓP Ý
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Phụ huynh gửi ý kiến, sáng kiến xây dựng hoạt động lớp học ngày càng tốt hơn.
            </p>
          </div>
          <span className="mt-4 text-xs font-bold text-amber-600 flex items-center gap-1">
            Gửi góp ý ngay <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </button>

        {/* Button 2: PHẢN ÁNH */}
        <button
          onClick={() => setActiveActionModal('phan_anh')}
          className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-rose-400 hover:shadow-md transition text-left cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <Megaphone className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-rose-600 transition">
              📢 PHẢN ÁNH
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Gửi vấn đề cấp thiết, băn khoăn về học tập, bán trú hoặc tâm lý cần cô giáo hỗ trợ.
            </p>
          </div>
          <span className="mt-4 text-xs font-bold text-rose-600 flex items-center gap-1">
            Gửi phản ánh ngay <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </button>

        {/* Button 3: ĐĂNG KÝ ĐỒNG HÀNH */}
        <button
          onClick={() => setActiveActionModal('dong_hanh')}
          className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-emerald-400 hover:shadow-md transition text-left cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <Handshake className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-600 transition">
              🤝 ĐĂNG KÝ ĐỒNG HÀNH
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Đăng ký hỗ trợ các con: đọc sách, tham quan trải nghiệm, chia sẻ nghề nghiệp...
            </p>
          </div>
          <span className="mt-4 text-xs font-bold text-emerald-600 flex items-center gap-1">
            Đăng ký tham gia <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </button>

        {/* Button 4: GỬI LỜI ĐỘNG VIÊN */}
        <button
          onClick={() => setActiveActionModal('dong_vien')}
          className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-md transition text-left cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition">
              💬 GỬI LỜI ĐỘNG VIÊN
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Gửi lời nhắn yêu thương, chúc mừng và khích lệ gửi đến tập thể 6A2 hoặc con yêu.
            </p>
          </div>
          <span className="mt-4 text-xs font-bold text-blue-600 flex items-center gap-1">
            Gửi lời nhắn <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </button>
      </div>

      {/* VII. QUY TRÌNH XỬ LÝ Ý KIẾN PHHS (Diagram) */}
      <section className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs">
        <div className="border-b border-slate-100 pb-4 mb-5 text-center sm:text-left">
          <h3 className="font-black text-slate-900 text-base sm:text-lg">
            VII. QUY TRÌNH TIẾP NHẬN & XỬ LÝ Ý KIẾN PHỤ HUYNH
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Minh bạch – Kịp thời – Trách nhiệm – Bảo mật thông tin gia đình
          </p>
        </div>

        {/* Flow Diagram */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 items-center text-center">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-xl">👨‍👩‍👧</span>
            <div className="font-bold text-xs text-slate-800 mt-1">PHHS GỬI Ý KIẾN</div>
            <div className="text-[10px] text-slate-500">Qua cổng số 6A2</div>
          </div>

          <div className="hidden lg:flex justify-center text-slate-400 font-bold">➔</div>

          <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200">
            <span className="text-xl">📥</span>
            <div className="font-bold text-xs text-blue-900 mt-1">GIÁO VIÊN TIẾP NHẬN</div>
            <div className="text-[10px] text-blue-600">Hòm thư kín cô Nhi</div>
          </div>

          <div className="hidden lg:flex justify-center text-slate-400 font-bold">➔</div>

          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200">
            <span className="text-xl">📂</span>
            <div className="font-bold text-xs text-amber-900 mt-1">PHÂN LOẠI</div>
            <div className="text-[10px] text-amber-600">Học tập / Bán trú...</div>
          </div>

          <div className="hidden lg:flex justify-center text-slate-400 font-bold">➔</div>

          <div className="bg-purple-50 p-3 rounded-2xl border border-purple-200">
            <span className="text-xl">🔎</span>
            <div className="font-bold text-xs text-purple-900 mt-1">XEM XÉT / PHỐI HỢP</div>
            <div className="text-[10px] text-purple-600">GVBM & Nhà trường</div>
          </div>

          <div className="hidden lg:flex justify-center text-slate-400 font-bold">➔</div>

          <div className="bg-indigo-50 p-3 rounded-2xl border border-indigo-200">
            <span className="text-xl">✅</span>
            <div className="font-bold text-xs text-indigo-900 mt-1">XỬ LÝ</div>
            <div className="text-[10px] text-indigo-600">Thực hiện giải pháp</div>
          </div>

          <div className="hidden lg:flex justify-center text-slate-400 font-bold">➔</div>

          <div className="bg-teal-50 p-3 rounded-2xl border border-teal-200">
            <span className="text-xl">📢</span>
            <div className="font-bold text-xs text-teal-900 mt-1">PHẢN HỒI PHÙ HỢP</div>
            <div className="text-[10px] text-teal-600">Thông báo đến PH</div>
          </div>

          <div className="hidden lg:flex justify-center text-slate-400 font-bold">➔</div>

          <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
            <span className="text-xl">🤝</span>
            <div className="font-bold text-xs text-emerald-900 mt-1">CÙNG ĐỒNG HÀNH</div>
            <div className="text-[10px] text-emerald-600">Lan tỏa kết quả</div>
          </div>
        </div>

        {/* Highlight Quote */}
        <div className="mt-5 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-200/60 text-center">
          <p className="text-xs sm:text-sm font-bold text-emerald-900 italic">
            🌟 Điểm nhấn cốt lõi: “Công nghệ là công cụ – Đồng thuận và đồng hành mới là mục tiêu.”
          </p>
        </div>
      </section>

      {/* VIII. BẢNG “PHỤ HUYNH NÓI – 6A2 LÀM” */}
      <section className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs">
        <div className="border-b border-slate-100 pb-4 mb-5">
          <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
            <span>BẢNG “PHỤ HUYNH NÓI – 6A2 LÀM”</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Minh chứng dân vận số có kết quả
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Mô hình trực quan: Ý kiến ➔ Hành động ➔ Kết quả thực tế được đo lường rõ ràng.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px]">
              <tr>
                <th className="p-3 rounded-l-xl">PHHS Góp ý / Đề xuất</th>
                <th className="p-3">Lớp 6A2 thực hiện</th>
                <th className="p-3">Kết quả thực tế</th>
                <th className="p-3 text-center rounded-r-xl">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {actionProofs.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-3 font-semibold text-slate-900 max-w-xs leading-normal">
                    {item.suggestion}
                  </td>
                  <td className="p-3 text-slate-700 max-w-xs leading-normal">
                    {item.classAction}
                  </td>
                  <td className="p-3 text-emerald-700 font-medium max-w-xs leading-normal">
                    {item.result}
                  </td>
                  <td className="p-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        item.status === 'Hoàn thành'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <CheckCircle className="w-3 h-3" />
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Private Feedback Box - Dedicated view for Teacher */}
      {isTeacher && (
        <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-extrabold text-base">
                  Hòm Thư Riêng Tư Của Giáo Viên Chủ Nhiệm
                </h3>
                <p className="text-xs text-slate-400">
                  (Chỉ riêng tài khoản Cô Tuyết Nhi xem và phản hồi được nội dung này)
                </p>
              </div>
            </div>
            <span className="text-xs font-bold bg-amber-400 text-slate-950 px-2.5 py-1 rounded-full">
              {suggestions.length} phản hồi từ PHHS
            </span>
          </div>

          <div className="space-y-3">
            {suggestions.map((sug) => (
              <div
                key={sug.id}
                className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 space-y-3"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100">{sug.parentName}</span>
                    <span className="text-xs text-slate-400">
                      (PH em {sug.studentName} {sug.phoneOrEmail ? `• SĐT: ${sug.phoneOrEmail}` : ''})
                    </span>
                  </div>
                  <span className="text-[11px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30">
                    {sug.typeTitle}
                  </span>
                </div>

                <p className="text-xs text-slate-200 bg-slate-900/60 p-3 rounded-xl border border-slate-700/60 leading-relaxed italic">
                  “{sug.content}”
                </p>

                {sug.teacherResponse ? (
                  <div className="bg-emerald-950/60 border border-emerald-500/40 p-3 rounded-xl text-xs text-emerald-200">
                    <span className="font-bold block mb-1">Lời phản hồi của cô Nhi:</span>
                    <p>{sug.teacherResponse}</p>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Phản hồi chân thành đến phụ huynh..."
                      value={teacherResponseText[sug.id] || ''}
                      onChange={(e) =>
                        setTeacherResponseText({
                          ...teacherResponseText,
                          [sug.id]: e.target.value,
                        })
                      }
                      className="flex-1 text-xs px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                    <button
                      onClick={() => handleSendTeacherResponse(sug.id)}
                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs cursor-pointer"
                    >
                      Phản hồi
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Modal: Submit Suggestion / Feedback */}
      {activeActionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-gradient-to-r from-teal-700 to-emerald-700 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base sm:text-lg">
                  {activeActionModal === 'gop_y' && '💡 Góp ý xây dựng lớp 6A2'}
                  {activeActionModal === 'phan_anh' && '📢 Phản ánh ý kiến đến Giáo viên'}
                  {activeActionModal === 'dong_hanh' && '🤝 Đăng ký cùng đồng hành'}
                  {activeActionModal === 'dong_vien' && '💬 Gửi lời động viên đến lớp'}
                </h3>
                <p className="text-xs text-teal-100">Kênh kết nối số chính thức phụ huynh - giáo viên</p>
              </div>
              <button
                onClick={() => setActiveActionModal(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-emerald-50 p-3 border-b border-emerald-100 text-xs text-emerald-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <b>Riêng tư & Bảo mật:</b> Nội dung góp ý chỉ riêng tài khoản Cô giáo chủ nhiệm xem được.
              </span>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên phụ huynh:
                  </label>
                  <input
                    type="text"
                    required
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phụ huynh em:
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Số điện thoại / Zalo kết nối (tùy chọn):
                </label>
                <input
                  type="text"
                  placeholder="09xx.xxx.xxx"
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              {activeActionModal === 'dong_hanh' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lĩnh vực quý phụ huynh mong muốn hỗ trợ:
                  </label>
                  <select
                    value={selectedActivity}
                    onChange={(e) => setSelectedActivity(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {companionOptions.map((opt, i) => (
                      <option key={i} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nội dung chi tiết:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Quý phụ huynh chia sẻ cụ thể mong muốn, ý kiến hoặc lời chúc gửi gắm..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Gửi thông tin đến Cô giáo chủ nhiệm
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
