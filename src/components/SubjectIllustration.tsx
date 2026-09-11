import React from 'react';
import {
  Compass,
  MapPin,
  Layers,
  Sparkles,
  BookOpen,
  Volume2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowUpRight,
  Maximize2
} from 'lucide-react';
import { AISolutionDiagram } from '../types';
import { MathView } from './MathView';

interface SubjectIllustrationProps {
  subject: string;
  topic?: string;
  problemText: string;
  diagram?: AISolutionDiagram;
  onSpeakEnglish?: (text: string) => void;
}

export const SubjectIllustration: React.FC<SubjectIllustrationProps> = ({
  subject,
  topic = '',
  problemText,
  diagram,
  onSpeakEnglish
}) => {
  const lowerPrompt = (problemText + ' ' + topic + ' ' + (diagram?.title || '')).toLowerCase();

  // Determine illustration archetype
  const isHoangSaOrMap =
    diagram?.type === 'map' ||
    subject === 'Lịch sử & Địa lý' ||
    lowerPrompt.includes('hoàng sa') ||
    lowerPrompt.includes('đà nẵng') ||
    lowerPrompt.includes('biển đông') ||
    lowerPrompt.includes('bản đồ') ||
    lowerPrompt.includes('địa lý') ||
    lowerPrompt.includes('phương hướng');

  const isVennSet =
    diagram?.type === 'venn' ||
    (subject === 'Toán học' && (lowerPrompt.includes('tập hợp') || lowerPrompt.includes('phần tử') || lowerPrompt.includes('\\notin') || lowerPrompt.includes('∉') || lowerPrompt.includes('∈')));

  const isGeometry =
    diagram?.type === 'geometry' ||
    (subject === 'Toán học' && (lowerPrompt.includes('diện tích') || lowerPrompt.includes('chu vi') || lowerPrompt.includes('hình chữ nhật') || lowerPrompt.includes('hình vuông') || lowerPrompt.includes('tam giác')));

  const isEnglishScene =
    diagram?.type === 'english_flashcard' ||
    subject === 'Tiếng Anh' ||
    lowerPrompt.includes('present continuous') ||
    lowerPrompt.includes('grammar') ||
    lowerPrompt.includes('look! the teacher') ||
    lowerPrompt.includes('complete the');

  const isScienceLab =
    diagram?.type === 'science' ||
    subject === 'Khoa học tự nhiên' ||
    lowerPrompt.includes('khối lượng riêng') ||
    lowerPrompt.includes('thể tích') ||
    lowerPrompt.includes('kg/m') ||
    lowerPrompt.includes('vật lý') ||
    lowerPrompt.includes('hóa học');

  const isLiteratureMindmap =
    diagram?.type === 'mindmap' ||
    subject === 'Ngữ văn' ||
    lowerPrompt.includes('từ ghép') ||
    lowerPrompt.includes('từ láy') ||
    lowerPrompt.includes('cấu tạo từ') ||
    lowerPrompt.includes('tiếng việt');

  const isFlowchart =
    diagram?.type === 'flowchart' ||
    subject === 'Tin học' ||
    subject === 'Công nghệ' ||
    lowerPrompt.includes('thuật toán') ||
    lowerPrompt.includes('sơ đồ khối') ||
    lowerPrompt.includes('lưu đồ') ||
    lowerPrompt.includes('máy tính');

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
      {/* Header of the Illustration Card */}
      <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
            🎨
          </span>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
              {diagram?.title ||
                (isHoangSaOrMap
                  ? 'Bản đồ địa lý: Vị trí Hoàng Sa so với Đà Nẵng'
                  : isVennSet
                  ? 'Biểu đồ Ven trực quan: Tập hợp & Phần tử'
                  : isEnglishScene
                  ? 'Hình ảnh minh họa & Flashcard tình huống'
                  : isScienceLab
                  ? 'Mô phỏng thí nghiệm & Thể tích khối chất'
                  : isLiteratureMindmap
                  ? 'Sơ đồ tư duy: Phân loại từ ghép & từ láy'
                  : isFlowchart
                  ? 'Sơ đồ khối thuật toán tin học'
                  : 'Sơ đồ kiến thức trực quan')}
            </h4>
            <p className="text-[11px] text-slate-500">
              Minh họa sinh động giúp học sinh dễ quan sát và ghi nhớ sâu
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
          {subject}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        {/* =========================================================
            1. LỊCH SỬ & ĐỊA LÝ: BẢN ĐỒ BIỂN ĐÔNG - ĐÀ NẴNG - HOÀNG SA
            ========================================================= */}
        {isHoangSaOrMap && (
          <div className="space-y-3">
            <div className="relative w-full h-[280px] sm:h-[320px] bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 rounded-xl border border-blue-200 overflow-hidden select-none">
              {/* Ocean Texture Grid lines */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(#0284c7 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />

              {/* Vietnam Coastline SVG Path (Stylized Central Coast & Da Nang) */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 300" preserveAspectRatio="xMidYMid meet">
                <defs>
                  {/* Glowing Arrow Gradient */}
                  <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                  {/* Sea Gradient */}
                  <linearGradient id="seaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e0f2fe" />
                    <stop offset="100%" stopColor="#bae6fd" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="glow" />
                    <feComposite in="SourceGraphic" in2="glow" operator="over" />
                  </filter>
                </defs>

                {/* Landmass: Vietnam S-curve coast */}
                <path
                  d="M 0 0 L 140 0 C 130 50, 110 90, 130 130 C 145 160, 120 200, 110 240 C 100 270, 70 300, 0 300 Z"
                  fill="#dcfce7"
                  stroke="#86efac"
                  strokeWidth="3"
                />

                {/* Text: Đất liền Việt Nam */}
                <text x="35" y="80" fill="#166534" fontSize="13" fontWeight="bold">
                  ĐẤT LIỀN
                </text>
                <text x="30" y="100" fill="#15803d" fontSize="11" fontWeight="600">
                  VIỆT NAM
                </text>

                {/* City: Da Nang Node */}
                <circle cx="138" cy="145" r="8" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
                <circle cx="138" cy="145" r="14" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3,3">
                  <animate attributeName="r" values="8;18;8" dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0;1" dur="2.5s" repeatCount="indefinite" />
                </circle>

                <text x="145" y="135" fill="#1e3a8a" fontSize="12" fontWeight="800">
                  TP. ĐÀ NẴNG
                </text>
                <text x="145" y="150" fill="#3b82f6" fontSize="9.5" fontWeight="600">
                  (Điểm mốc đất liền ven biển)
                </text>

                {/* Vast Sea Title */}
                <text x="260" y="55" fill="#0369a1" fontSize="16" fontWeight="900" letterSpacing="2">
                  BIỂN ĐÔNG VIỆT NAM
                </text>
                <text x="270" y="75" fill="#0284c7" fontSize="11" fontWeight="600">
                  (Vùng biển chủ quyền thiêng liêng)
                </text>

                {/* Dynamic East Navigation Arrow (Da Nang -> Hoang Sa) */}
                <line
                  x1="148"
                  y1="145"
                  x2="350"
                  y2="145"
                  stroke="url(#arrowGrad)"
                  strokeWidth="4"
                  strokeDasharray="6,4"
                />
                {/* Arrowhead pointing East */}
                <polygon points="350,138 368,145 350,152" fill="#ef4444" filter="url(#glow)" />

                {/* Arrow Text: HƯỚNG ĐÔNG */}
                <rect x="200" y="118" width="140" height="22" rx="6" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
                <text x="210" y="133" fill="#b45309" fontSize="10.5" fontWeight="800">
                  ➔ HƯỚNG ĐÔNG (EAST)
                </text>

                {/* Paracel Islands (Hoàng Sa Archipelago) */}
                <g transform="translate(370, 120)">
                  {/* Island dots cluster */}
                  <ellipse cx="25" cy="25" rx="42" ry="32" fill="#fef08a" opacity="0.4" stroke="#eab308" strokeWidth="1.5" strokeDasharray="3,3" />
                  <circle cx="10" cy="15" r="5" fill="#ca8a04" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx="28" cy="20" r="6" fill="#ca8a04" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx="20" cy="35" r="4.5" fill="#ca8a04" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx="42" cy="28" r="5" fill="#ca8a04" stroke="#ffffff" strokeWidth="1.5" />

                  {/* Island Flag / Badge */}
                  <rect x="-10" y="48" width="125" height="34" rx="6" fill="#ffffff" stroke="#eab308" strokeWidth="1.5" />
                  <text x="-4" y="62" fill="#854d0e" fontSize="10.5" fontWeight="900">
                    QUẦN ĐẢO HOÀNG SA
                  </text>
                  <text x="-4" y="75" fill="#a16207" fontSize="9" fontWeight="700">
                    (Huyện đảo thuộc TP. Đà Nẵng)
                  </text>
                </g>

                {/* Compass Rose (La bàn định hướng góc phải trên) */}
                <g transform="translate(435, 45)">
                  <circle cx="0" cy="0" r="28" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                  {/* North pointer */}
                  <polygon points="0,-22 4,0 -4,0" fill="#ef4444" />
                  <text x="-4" y="-24" fill="#ef4444" fontSize="9.5" fontWeight="900">
                    B
                  </text>
                  {/* South pointer */}
                  <polygon points="0,22 4,0 -4,0" fill="#64748b" />
                  <text x="-4" y="32" fill="#64748b" fontSize="9.5" fontWeight="900">
                    N
                  </text>
                  {/* West pointer */}
                  <polygon points="-22,0 0,4 0,-4" fill="#64748b" />
                  <text x="-31" y="3" fill="#64748b" fontSize="9.5" fontWeight="900">
                    T
                  </text>
                  {/* East pointer (HIGHLIGHTED) */}
                  <polygon points="22,0 0,4 0,-4" fill="#f59e0b" />
                  <circle cx="22" cy="0" r="3" fill="#ef4444" />
                  <text x="25" y="3" fill="#b45309" fontSize="10.5" fontWeight="900">
                    Đ★
                  </text>
                </g>
              </svg>
            </div>

            {/* Geographical Explanation Note */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
              <Compass className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <p className="font-bold text-amber-950 mb-0.5">
                  Quy tắc đọc hướng bản đồ Địa lý 6:
                </p>
                <p>
                  • Nhìn thẳng vào bản đồ: Phía trên là <strong>Bắc</strong>, phía dưới là <strong>Nam</strong>, bên trái là <strong>Tây</strong>, bên phải luôn là <strong>Đông</strong>.
                </p>
                <p>
                  • Từ dải bờ biển thành phố Đà Nẵng, nhìn thẳng ra vùng biển xa bên phải bản đồ chính là <strong>Hướng Đông (Đáp án D)</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            2. TOÁN HỌC: BIỂU ĐỒ VEN (VENN DIAGRAM) CHO TẬP HỢP
            ========================================================= */}
        {isVennSet && (
          <div className="space-y-3">
            <div className="relative w-full h-[260px] sm:h-[300px] bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-50 rounded-xl border border-indigo-200 overflow-hidden flex items-center justify-center p-3">
              <svg className="w-full h-full max-w-lg" viewBox="0 0 500 280">
                <defs>
                  <linearGradient id="vennCircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e0e7ff" />
                    <stop offset="100%" stopColor="#c7d2fe" />
                  </linearGradient>
                </defs>

                {/* Outer Universe Box */}
                <rect x="20" y="20" width="460" height="240" rx="16" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="35" y="45" fill="#64748b" fontSize="12" fontWeight="bold">
                  Không gian các số tự nhiên N
                </text>

                {/* Venn Circle representing Set B */}
                <ellipse
                  cx="230"
                  cy="145"
                  rx="135"
                  ry="95"
                  fill="url(#vennCircleGrad)"
                  stroke="#4f46e5"
                  strokeWidth="3"
                />

                {/* Label Set B */}
                <rect x="145" y="65" width="170" height="28" rx="8" fill="#4f46e5" />
                <text x="160" y="84" fill="#ffffff" fontSize="13" fontWeight="bold">
                  Tập hợp B = {'{2; 3; 4; 5}'}
                </text>

                {/* Elements INSIDE set B (Green / Blue dots) */}
                {/* Number 2 */}
                <circle cx="160" cy="130" r="14" fill="#10b981" />
                <text x="156" y="135" fill="#ffffff" fontSize="14" fontWeight="bold">2</text>
                <text x="145" y="155" fill="#047857" fontSize="10" fontWeight="bold">2 ∈ B (Đúng)</text>

                {/* Number 3 */}
                <circle cx="225" cy="120" r="14" fill="#10b981" />
                <text x="221" y="125" fill="#ffffff" fontSize="14" fontWeight="bold">3</text>
                <text x="210" y="145" fill="#047857" fontSize="10" fontWeight="bold">3 ∈ B</text>

                {/* Number 4 */}
                <circle cx="285" cy="135" r="14" fill="#10b981" />
                <text x="281" y="140" fill="#ffffff" fontSize="14" fontWeight="bold">4</text>
                <text x="270" y="158" fill="#047857" fontSize="10" fontWeight="bold">4 ∈ B</text>

                {/* Number 5 */}
                <circle cx="215" cy="180" r="14" fill="#10b981" />
                <text x="211" y="185" fill="#ffffff" fontSize="14" fontWeight="bold">5</text>
                <text x="200" y="205" fill="#047857" fontSize="10" fontWeight="bold">5 ∈ B (Đúng)</text>

                {/* Elements OUTSIDE set B (Red / Rose warnings) */}
                {/* Number 1 */}
                <g transform="translate(60, 110)">
                  <circle cx="15" cy="15" r="14" fill="#ef4444" />
                  <text x="11" y="20" fill="#ffffff" fontSize="14" fontWeight="bold">1</text>
                  <rect x="-10" y="35" width="80" height="22" rx="4" fill="#fee2e2" stroke="#f87171" strokeWidth="1" />
                  <text x="-4" y="49" fill="#991b1b" fontSize="10" fontWeight="bold">1 ∉ B (Đúng)</text>
                </g>

                {/* Number 6 */}
                <g transform="translate(390, 110)">
                  <circle cx="15" cy="15" r="14" fill="#ef4444" />
                  <text x="11" y="20" fill="#ffffff" fontSize="14" fontWeight="bold">6</text>
                  <rect x="-20" y="35" width="95" height="22" rx="4" fill="#fee2e2" stroke="#f87171" strokeWidth="1" />
                  <text x="-15" y="49" fill="#991b1b" fontSize="10" fontWeight="bold">6 ∉ B (6 ∈ B là SAI)</text>
                </g>
              </svg>
            </div>

            {/* Quick Math Legend */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="font-bold text-emerald-800 block mb-0.5">✔ Ký hiệu thuộc (∈):</span>
                <span className="text-emerald-700">Phần tử nằm TRONG vòng tròn tập hợp (ví dụ: 2 ∈ B, 5 ∈ B).</span>
              </div>
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl">
                <span className="font-bold text-rose-800 block mb-0.5">✘ Ký hiệu không thuộc (∉):</span>
                <span className="text-rose-700">Phần tử nằm NGOÀI vòng tròn tập hợp (ví dụ: 1 ∉ B, 6 ∉ B).</span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            3. TIẾNG ANH: VISUAL SITUATION FLASHCARD & AUDIO
            ========================================================= */}
        {isEnglishScene && (
          <div className="space-y-3">
            <div className="relative w-full bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/60 rounded-xl border border-amber-200 p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Visual Scene Illustration */}
                <div className="w-full sm:w-1/2 space-y-2">
                  <div className="bg-white/90 p-3.5 rounded-xl border border-amber-200 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      Ngữ cảnh lớp học tiếng Anh (Context)
                    </span>
                    <div className="mt-2 space-y-1.5 text-xs text-slate-800">
                      <div className="p-2 bg-orange-50/70 rounded-lg border border-orange-100 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900">1. Look! The teacher is coming.</p>
                          <p className="text-slate-500 text-[11px]">Nhìn kìa! Cô giáo đang bước vào lớp.</p>
                        </div>
                        {onSpeakEnglish && (
                          <button
                            type="button"
                            onClick={() => onSpeakEnglish('Look! The teacher is coming.')}
                            className="p-1.5 text-amber-700 hover:bg-white rounded-lg transition cursor-pointer"
                            title="Nghe phát âm chuẩn US"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="p-2 bg-orange-50/70 rounded-lg border border-orange-100 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900">2. We are studying English with AI.</p>
                          <p className="text-slate-500 text-[11px]">Chúng mình đang học tiếng Anh cùng AI ngay lúc này.</p>
                        </div>
                        {onSpeakEnglish && (
                          <button
                            type="button"
                            onClick={() => onSpeakEnglish('We are studying English with AI right now.')}
                            className="p-1.5 text-amber-700 hover:bg-white rounded-lg transition cursor-pointer"
                            title="Nghe phát âm chuẩn US"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grammar Pattern Box */}
                <div className="w-full sm:w-1/2 bg-white rounded-xl border border-amber-200 p-3.5 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-sm">
                    <span>⚡ Cấu trúc thì Hiện tại tiếp diễn:</span>
                  </div>
                  <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg text-center font-mono font-bold text-indigo-900">
                    S + am / is / are + V-ing
                  </div>
                  <ul className="space-y-1 text-slate-700 text-[11px]">
                    <li>• <strong>He / She / It / The teacher</strong> ➔ dùng <strong>is + V-ing</strong> (is coming).</li>
                    <li>• <strong>We / You / They</strong> ➔ dùng <strong>are + V-ing</strong> (are studying).</li>
                    <li>• Dấu hiệu nhận biết: <em>Look!, Listen!, Now, Right now, At present</em>.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            4. KHOA HỌC TỰ NHIÊN: THÍ NGHIỆM ĐO THỂ TÍCH & KHỐI LƯỢNG RIÊNG
            ========================================================= */}
        {isScienceLab && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl flex items-center gap-3">
                <div className="w-14 h-14 bg-teal-600 text-white rounded-xl flex flex-col items-center justify-center font-bold shrink-0">
                  <span className="text-xs">Fe</span>
                  <span className="text-[10px]">Sắt</span>
                </div>
                <div className="text-xs space-y-0.5">
                  <p className="font-bold text-teal-950">Khối sắt mẫu đề bài:</p>
                  <p className="text-teal-800">• Thể tích V: <strong>50 cm³ = 0,00005 m³</strong></p>
                  <p className="text-teal-800">• Khối lượng m: <strong>390 g = 0,39 kg</strong></p>
                </div>
              </div>

              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-1.5">
                <p className="font-bold text-blue-950">Công thức tính Khối lượng riêng D:</p>
                <div className="p-2 bg-white rounded-lg border border-blue-200 font-mono text-center font-bold text-blue-900">
                  D = m / V = 0,39 / 0,00005 = 7800 kg/m³
                </div>
                <p className="text-blue-700 text-[11px] text-center">
                  (Khối lượng riêng chuẩn của kim loại Sắt trong SGK KHTN 6)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            5. NGỮ VĂN: SƠ ĐỒ CẤU TẠO TỪ TIẾNG VIỆT (TỪ GHÉP & TỪ LÁY)
            ========================================================= */}
        {isLiteratureMindmap && (
          <div className="space-y-3">
            <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl space-y-3">
              <h5 className="font-bold text-rose-950 text-xs">
                Sơ đồ phân loại Cấu tạo từ Tiếng Việt (Ngữ văn 6):
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white border border-rose-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-rose-900">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>TỪ GHÉP (Quan hệ về nghĩa)</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Các tiếng độc lập ghép lại có quan hệ ý nghĩa với nhau.
                  </p>
                  <div className="mt-1.5 p-2 bg-rose-50/70 rounded-lg text-rose-950 font-medium">
                    Ví dụ: <strong>bàn ghế, phẳng lặng, cây cối</strong>.
                  </div>
                </div>

                <div className="p-3 bg-white border border-amber-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>TỪ LÁY (Quan hệ về âm vần)</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Có sự điệp âm đầu hoặc điệp vần tạo nhịp điệu gợi cảm.
                  </p>
                  <div className="mt-1.5 p-2 bg-amber-50/70 rounded-lg text-amber-950 font-medium">
                    Ví dụ: <strong>lung linh (láy âm l), xinh xắn (láy âm x)</strong>.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            6. TIN HỌC / CÔNG NGHỆ: LƯU ĐỒ THUẬT TOÁN (FLOWCHART)
            ========================================================= */}
        {isFlowchart && (
          <div className="space-y-3">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs">Cấu trúc Sơ đồ khối Thuật toán:</span>
                <span className="text-[11px] text-slate-500">Tin học THCS</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs py-2">
                <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                  [Bắt đầu]
                </span>
                <span className="text-slate-400 font-bold">➔</span>
                <span className="px-3 py-1.5 rounded-lg bg-sky-100 text-sky-800 font-bold border border-sky-300">
                  / Nhập dữ liệu /
                </span>
                <span className="text-slate-400 font-bold">➔</span>
                <span className="px-3 py-1.5 rounded-md bg-amber-100 text-amber-800 font-bold border border-amber-300">
                  ◇ Điều kiện kiểm tra ◇
                </span>
                <span className="text-slate-400 font-bold">➔</span>
                <span className="px-3 py-1.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-300">
                  [Kết thúc]
                </span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            7. GENERAL INFORMATIVE SUMMARY / CHART
            ========================================================= */}
        {!isHoangSaOrMap && !isVennSet && !isEnglishScene && !isScienceLab && !isLiteratureMindmap && !isFlowchart && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <h5 className="font-bold text-slate-800 text-xs">
                {diagram?.title || 'Sơ đồ tóm tắt trọng tâm bài học'}
              </h5>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {diagram?.description || 'Nắm vững định nghĩa, quy tắc và áp dụng từng bước theo hướng dẫn sư phạm trên.'}
            </p>
            {diagram?.chartData && diagram.chartData.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                {diagram.chartData.map((item, i) => (
                  <div key={i} className="p-2 bg-white rounded-lg border border-slate-200 text-center">
                    <p className="text-[11px] text-slate-500 font-medium">{item.label}</p>
                    <p className="text-sm font-black text-blue-600">{item.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
