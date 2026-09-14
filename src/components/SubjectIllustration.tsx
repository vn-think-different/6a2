import React, { useState } from 'react';
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
  Palette,
  Eye,
  Brush,
  Sun,
  Copy,
  Check,
  Image as ImageIcon
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

  // State for Art Studio
  const [activeArtTab, setActiveArtTab] = useState<number>(0);
  const [showCompositionLabels, setShowCompositionLabels] = useState<boolean>(true);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // Determine illustration archetype
  const isArtDrawing =
    diagram?.type === 'art_sketch' ||
    diagram?.type === 'image_gallery' ||
    subject === 'Mỹ thuật' ||
    lowerPrompt.includes('sông núi') ||
    lowerPrompt.includes('mỹ thuật') ||
    lowerPrompt.includes('vẽ tranh') ||
    lowerPrompt.includes('phong cảnh') ||
    lowerPrompt.includes('thiên nhiên') ||
    lowerPrompt.includes('bố cục') ||
    lowerPrompt.includes('phối màu') ||
    lowerPrompt.includes('vẽ mẫu') ||
    lowerPrompt.includes('ý tưởng để làm mẫu') ||
    lowerPrompt.includes('hình ảnh để làm ví dụ');

  const isHoangSaOrMap =
    !isArtDrawing &&
    (diagram?.type === 'map' ||
      subject === 'Lịch sử & Địa lý' ||
      lowerPrompt.includes('hoàng sa') ||
      lowerPrompt.includes('đà nẵng') ||
      lowerPrompt.includes('biển đông') ||
      lowerPrompt.includes('bản đồ') ||
      lowerPrompt.includes('địa lý') ||
      lowerPrompt.includes('phương hướng'));

  const isVennSet =
    !isArtDrawing &&
    (diagram?.type === 'venn' ||
      (subject === 'Toán học' &&
        (lowerPrompt.includes('tập hợp') ||
          lowerPrompt.includes('phần tử') ||
          lowerPrompt.includes('\\notin') ||
          lowerPrompt.includes('∉') ||
          lowerPrompt.includes('∈'))));

  const isGeometry =
    !isArtDrawing &&
    (diagram?.type === 'geometry' ||
      (subject === 'Toán học' &&
        (lowerPrompt.includes('diện tích') ||
          lowerPrompt.includes('chu vi') ||
          lowerPrompt.includes('hình chữ nhật') ||
          lowerPrompt.includes('hình vuông') ||
          lowerPrompt.includes('tam giác'))));

  const isEnglishScene =
    !isArtDrawing &&
    (diagram?.type === 'english_flashcard' ||
      subject === 'Tiếng Anh' ||
      lowerPrompt.includes('present continuous') ||
      lowerPrompt.includes('grammar') ||
      lowerPrompt.includes('look! the teacher') ||
      lowerPrompt.includes('complete the'));

  const isScienceLab =
    !isArtDrawing &&
    (diagram?.type === 'science' ||
      subject === 'Khoa học tự nhiên' ||
      lowerPrompt.includes('khối lượng riêng') ||
      lowerPrompt.includes('thể tích') ||
      lowerPrompt.includes('kg/m') ||
      lowerPrompt.includes('vật lý') ||
      lowerPrompt.includes('hóa học'));

  const isLiteratureMindmap =
    !isArtDrawing &&
    (diagram?.type === 'mindmap' ||
      subject === 'Ngữ văn' ||
      lowerPrompt.includes('từ ghép') ||
      lowerPrompt.includes('từ láy') ||
      lowerPrompt.includes('cấu tạo từ') ||
      lowerPrompt.includes('tiếng việt'));

  const isFlowchart =
    !isArtDrawing &&
    (diagram?.type === 'flowchart' ||
      subject === 'Tin học' ||
      subject === 'Công nghệ' ||
      lowerPrompt.includes('thuật toán') ||
      lowerPrompt.includes('sơ đồ khối') ||
      lowerPrompt.includes('lưu đồ') ||
      lowerPrompt.includes('máy tính'));

  const handleCopyColor = (hex: string) => {
    navigator.clipboard?.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  // Art model ideas data
  const artSamples = diagram?.illustrations && diagram.illustrations.length > 0
    ? diagram.illustrations
    : [
        {
          title: 'Mẫu 1: Bình minh rực rỡ trên sông & núi biếc',
          subtitle: 'Phong cách tươi sáng, ngập tràn sức sống buổi sớm mai',
          description: 'Mặt trời đỏ cam nhô lên sau khe núi nhấp nhô. Dòng sông xanh biếc chảy uốn lượn chữ S từ chân núi ra tiền cảnh, điểm xuyết một con đò nhỏ và đàn chim hải âu.',
          colorPalette: ['#38bdf8', '#0284c7', '#22c55e', '#f59e0b', '#ef4444'],
          compositionLayers: [
            'Tiền cảnh: Bờ cỏ xanh mướt góc phải, khóm hoa dại vàng và một con đò nhỏ neo đậu.',
            'Trung cảnh: Mặt sông xanh ngọc uốn lượn phản chiếu những tia nắng vàng.',
            'Hậu cảnh: 3 lớp núi xanh lam mờ ảo, mặt trời tròn rực rỡ và đàn chim bay.'
          ],
          tips: 'Tô núi bằng màu xanh lam pha chút tím để tạo cảm giác núi ở rất xa trong sương sớm.'
        },
        {
          title: 'Mẫu 2: Dãy núi cao Tây Bắc & suối nguồn kỳ vĩ',
          subtitle: 'Phong cách thiên nhiên đại ngàn kỳ vĩ',
          description: 'Dãy núi đá cao sừng sững bên trái, dòng suối trong vắt len lỏi qua thung lũng có thác nước nhỏ, rặng thông xanh mát và nếp nhà sàn khói lam chiều.',
          colorPalette: ['#1e293b', '#475569', '#15803d', '#0ea5e9', '#d97706'],
          compositionLayers: [
            'Tiền cảnh: Rặng đá cuội ven bờ suối và cụm cây dương xỉ xanh rậm rạp.',
            'Trung cảnh: Dòng suối có ghềnh đá nhỏ tạo bọt trắng xoá.',
            'Hậu cảnh: Đỉnh núi nhọn mây trắng bao phủ quanh sườn núi.'
          ],
          tips: 'Nhấn một vài vệt trắng trên mặt nước để diễn tả dòng nước đang chảy róc rách.'
        },
        {
          title: 'Mẫu 3: Chiều hoàng hôn sông quê êm đềm bên rặng núi xa',
          subtitle: 'Phong cách ấm áp, lãng mạn với gam màu hoàng hôn',
          description: 'Bầu trời rực rỡ sắc cam hồng và tím nhạt lúc chiều tà. Bóng núi tím sẫm in trên nền trời, dòng sông lấp lánh ánh hoàng hôn, bác thuyền chài đang thả lưới.',
          colorPalette: ['#7c3aed', '#ec4899', '#f97316', '#fbbf24', '#1e1b4b'],
          compositionLayers: [
            'Tiền cảnh: Cành tre rủ bóng mềm mại từ mép trên tranh xuống.',
            'Trung cảnh: Bác thuyền chài đang buông tấm lưới tròn trên sông.',
            'Hậu cảnh: Dãy núi sẫm màu dưới bầu trời hoàng hôn rực rỡ.'
          ],
          tips: 'Phối màu hoàng hôn cam - tím chuyển sắc rất dễ đạt điểm 9 - 10 môn Mỹ thuật!'
        }
      ];

  const currentArt = artSamples[activeArtTab] || artSamples[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
      {/* Header of the Illustration Card */}
      <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
            {isArtDrawing ? '🎨' : '📐'}
          </span>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
              {diagram?.title ||
                (isArtDrawing
                  ? 'Góc Mỹ Thuật & Tranh Mẫu Sông Núi Lớp 6'
                  : isHoangSaOrMap
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
              Minh họa sinh động chuẩn SGK mới giúp học sinh quan sát và ghi nhớ sâu
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
          {subject}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        {/* =========================================================
            0. MỸ THUẬT: TRANH PHONG CẢNH SÔNG NÚI & Ý TƯỞNG VẼ MẪU
            ========================================================= */}
        {isArtDrawing && (
          <div className="space-y-4">
            {/* Top Sub-tabs for 3 Artworks */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {artSamples.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveArtTab(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      activeArtTab === idx
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Brush className="w-3.5 h-3.5" />
                    <span>Mẫu {idx + 1}: {sample.title.split(':')[1]?.split('và')[0] || sample.title.slice(0, 16)}</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowCompositionLabels(!showCompositionLabels)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 cursor-pointer transition ${
                  showCompositionLabels
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-amber-600" />
                <span>{showCompositionLabels ? 'Đang hiện nhãn 3 lớp' : 'Hiện nhãn 3 lớp bố cục'}</span>
              </button>
            </div>

            {/* Main Interactive Artwork Canvas (SVG) */}
            <div className="relative w-full h-[280px] sm:h-[340px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner select-none bg-slate-900">
              {activeArtTab === 0 && (
                /* MẪU 1: BÌNH MINH TRÊN SÔNG & NÚI BIẾC */
                <svg viewBox="0 0 800 500" className="w-full h-full object-cover">
                  <defs>
                    <linearGradient id="skyGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="40%" stopColor="#bae6fd" />
                      <stop offset="75%" stopColor="#fed7aa" />
                      <stop offset="100%" stopColor="#fef08a" />
                    </linearGradient>
                    <linearGradient id="sunGlow1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                    <linearGradient id="mountainFar1" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#dbeafe" stopOpacity="0.4" />
                    </linearGradient>
                    <linearGradient id="mountainMid1" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                    <linearGradient id="mountainFront1" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#1e40af" />
                      <stop offset="100%" stopColor="#172554" />
                    </linearGradient>
                    <linearGradient id="riverGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0284c7" />
                      <stop offset="50%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#0369a1" />
                    </linearGradient>
                    <linearGradient id="bankGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#14532d" />
                    </linearGradient>
                  </defs>

                  {/* 1. SKY */}
                  <rect width="800" height="500" fill="url(#skyGrad1)" />

                  {/* SUN WITH AURA */}
                  <circle cx="480" cy="180" r="70" fill="#fef08a" opacity="0.3" />
                  <circle cx="480" cy="180" r="45" fill="url(#sunGlow1)" />

                  {/* FLYING BIRDS */}
                  <path d="M 280 120 Q 290 110 300 120 Q 310 110 320 120 Q 310 116 300 124 Q 290 116 280 120 Z" fill="#475569" />
                  <path d="M 330 95 Q 338 87 346 95 Q 354 87 362 95 Q 354 91 346 98 Q 338 91 330 95 Z" fill="#64748b" transform="scale(0.85)" />
                  <path d="M 580 110 Q 588 102 596 110 Q 604 102 612 110 Q 604 106 596 113 Q 588 106 580 110 Z" fill="#475569" />

                  {/* 2. BACKGROUND MOUNTAINS (HẬU CẢNH - XA & MỜ) */}
                  <path d="M -50 290 Q 150 140 320 280 Q 480 160 620 270 Q 720 180 850 280 L 850 500 L -50 500 Z" fill="url(#mountainFar1)" />
                  <path d="M 0 310 Q 180 190 380 300 Q 520 200 700 290 Q 760 250 820 310 L 820 500 L 0 500 Z" fill="url(#mountainMid1)" opacity="0.85" />
                  <path d="M -20 340 Q 120 230 290 330 Q 380 270 500 350 L 500 500 L -20 500 Z" fill="url(#mountainFront1)" opacity="0.95" />

                  {/* 3. MIDDLEGROUND: WINDING S-SHAPED RIVER (TRUNG CẢNH) */}
                  <path d="M 460 300 C 440 330, 480 370, 360 410 C 260 440, 180 470, 50 500 L 800 500 L 800 400 C 720 370, 600 330, 510 300 Z" fill="url(#riverGrad1)" />
                  {/* Water Highlights */}
                  <path d="M 440 340 Q 470 345 500 340" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" fill="none" />
                  <path d="M 380 380 Q 430 385 480 380" stroke="#fef08a" strokeWidth="3" strokeLinecap="round" opacity="0.6" fill="none" />
                  <path d="M 280 430 Q 360 435 440 430" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.5" fill="none" />

                  {/* 4. FOREGROUND: GREEN BANKS & WOODEN BOAT (TIỀN CẢNH - GẦN & RÕ) */}
                  <path d="M 520 500 C 580 440, 680 410, 800 420 L 800 500 Z" fill="url(#bankGrad1)" />
                  <path d="M 0 450 C 80 440, 160 460, 220 500 L 0 500 Z" fill="url(#bankGrad1)" />

                  {/* Wooden boat with oarsman */}
                  <g transform="translate(420, 370) scale(0.9)">
                    <path d="M 0 15 Q 35 25 70 15 Q 60 35 10 30 Z" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
                    <circle cx="38" cy="4" r="5" fill="#fcd34d" />
                    <path d="M 38 9 L 36 20 L 32 26" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="28" y1="12" x2="48" y2="28" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
                  </g>

                  {/* Foreground tree on the right */}
                  <path d="M 720 440 Q 710 370 700 320" stroke="#451a03" strokeWidth="10" strokeLinecap="round" />
                  <circle cx="690" cy="300" r="45" fill="#15803d" />
                  <circle cx="730" cy="290" r="40" fill="#22c55e" opacity="0.9" />
                  <circle cx="700" cy="260" r="35" fill="#16a34a" />
                </svg>
              )}

              {activeArtTab === 1 && (
                /* MẪU 2: NÚI ĐÁ HÙNG VĨ TÂY BẮC & THÁC NƯỚC */
                <svg viewBox="0 0 800 500" className="w-full h-full object-cover">
                  <defs>
                    <linearGradient id="skyGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#0284c7" />
                      <stop offset="60%" stopColor="#e0f2fe" />
                      <stop offset="100%" stopColor="#ffffff" />
                    </linearGradient>
                    <linearGradient id="cliffGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#334155" />
                      <stop offset="100%" stopColor="#1e293b" />
                    </linearGradient>
                    <linearGradient id="waterfallGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#e0f2fe" />
                      <stop offset="100%" stopColor="#38bdf8" />
                    </linearGradient>
                  </defs>

                  <rect width="800" height="500" fill="url(#skyGrad2)" />

                  {/* Majestic Mountain Peaks */}
                  <polygon points="0,500 0,180 180,90 360,280 520,120 700,320 800,240 800,500" fill="url(#cliffGrad2)" />
                  <polygon points="120,500 240,160 420,380" fill="#475569" opacity="0.7" />

                  {/* Waterfall streaming down */}
                  <path d="M 230 180 Q 235 280 240 380 Q 245 420 260 460" stroke="url(#waterfallGrad2)" strokeWidth="18" fill="none" opacity="0.9" />
                  <ellipse cx="260" cy="460" rx="40" ry="12" fill="#ffffff" opacity="0.7" />

                  {/* Pine Trees */}
                  <polygon points="80,320 60,370 100,370" fill="#14532d" />
                  <polygon points="80,350 50,410 110,410" fill="#166534" />
                  <polygon points="620,280 605,330 635,330" fill="#14532d" />
                  <polygon points="620,310 595,370 645,370" fill="#166534" />

                  {/* Foreground stream & cottage */}
                  <path d="M 200 450 C 350 430, 500 460, 800 480 L 800 500 L 0 500 L 0 470 Z" fill="#0284c7" />
                  <rect x="520" y="400" width="60" height="45" fill="#78350f" rx="3" />
                  <polygon points="510,400 550,370 590,400" fill="#b45309" />
                </svg>
              )}

              {activeArtTab === 2 && (
                /* MẪU 3: CHIỀU HOÀNG HÔN SÔNG QUÊ */
                <svg viewBox="0 0 800 500" className="w-full h-full object-cover">
                  <defs>
                    <linearGradient id="skyGrad3" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#4c1d95" />
                      <stop offset="35%" stopColor="#db2777" />
                      <stop offset="70%" stopColor="#ea580c" />
                      <stop offset="100%" stopColor="#fde047" />
                    </linearGradient>
                    <linearGradient id="sunsetRiver3" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ea580c" />
                      <stop offset="50%" stopColor="#9a3412" />
                      <stop offset="100%" stopColor="#581c87" />
                    </linearGradient>
                  </defs>

                  <rect width="800" height="500" fill="url(#skyGrad3)" />

                  {/* Sunset Mountain Silhouette */}
                  <path d="M 0 320 Q 160 210 340 300 Q 500 190 680 290 Q 750 250 800 300 L 800 500 L 0 500 Z" fill="#2e1065" />

                  {/* Sun sinking */}
                  <circle cx="340" cy="270" r="40" fill="#fef08a" opacity="0.9" />

                  {/* River glowing in twilight */}
                  <path d="M 280 300 C 350 350, 200 410, 0 460 L 0 500 L 800 500 L 800 360 C 650 340, 480 320, 360 300 Z" fill="url(#sunsetRiver3)" />

                  {/* Fisherman with round net */}
                  <g transform="translate(480, 380)">
                    <path d="M 0 15 Q 40 25 80 15 Q 70 35 15 30 Z" fill="#1e1b4b" />
                    <circle cx="45" cy="5" r="5" fill="#ea580c" />
                    <ellipse cx="95" cy="25" rx="35" ry="15" fill="none" stroke="#fef08a" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.8" />
                  </g>

                  {/* Bamboo silhouettes */}
                  <path d="M 800 200 Q 730 260 680 350" stroke="#1e1b4b" strokeWidth="4" fill="none" />
                  <path d="M 800 240 Q 750 280 700 370" stroke="#1e1b4b" strokeWidth="3.5" fill="none" />
                </svg>
              )}

              {/* Composition Overlay Labels */}
              {showCompositionLabels && (
                <div className="absolute inset-0 pointer-events-none p-3 sm:p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-sky-300 text-[10px] sm:text-xs font-bold rounded-lg border border-sky-400/40">
                      ⛰️ LỚP 3: HẬU CẢNH (Dãy núi nhấp nhô & Mặt trời - Nét mờ nhẹ)
                    </span>
                    <span className="px-2 py-0.5 bg-amber-500/90 text-slate-950 text-[10px] font-black rounded-md">
                      Mẫu {activeArtTab + 1}/3
                    </span>
                  </div>

                  <div className="flex justify-center">
                    <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-emerald-300 text-[10px] sm:text-xs font-bold rounded-lg border border-emerald-400/40">
                      🌊 LỚP 2: TRUNG CẢNH (Dòng sông chữ S uốn lượn mềm mại)
                    </span>
                  </div>

                  <div className="flex justify-start">
                    <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-amber-300 text-[10px] sm:text-xs font-bold rounded-lg border border-amber-400/40">
                      🌿 LỚP 1: TIỀN CẢNH (Bờ cỏ hoa, rặng cây & con đò - Vẽ to rõ)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Color Palette & Composition 3-Layer Guide */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {/* Left: Color Palette */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                    <Palette className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Bảng màu gợi ý cho {currentArt.title.split(':')[0] || 'mẫu vẽ'}:</span>
                  </div>
                  {copiedColor && (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Đã sao chép {copiedColor}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {(currentArt.colorPalette || ['#38bdf8', '#0284c7', '#22c55e', '#f59e0b', '#ef4444']).map((hex, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleCopyColor(hex)}
                      className="group flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono hover:border-indigo-400 transition cursor-pointer shadow-2xs"
                      title="Bấm để sao chép mã màu"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="text-[11px] text-slate-700 font-semibold">{hex}</span>
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-slate-500 italic pt-1">
                  💡 {currentArt.tips || 'Gợi ý: Dùng màu sáp dầu hoặc màu nước để tạo độ chuyển màu từ trời xuống nước mượt mà.'}
                </p>
              </div>

              {/* Right: 3-Layer Breakdown */}
              <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-1.5 text-xs text-indigo-950">
                <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Bố cục 3 lớp chuẩn SGK Mỹ thuật 6:</span>
                </div>
                <ul className="space-y-1 text-[11px] leading-relaxed">
                  {(currentArt.compositionLayers || [
                    'Tiền cảnh: Bờ cỏ xanh, con đò nhỏ neo đậu (Vẽ gần, chi tiết to).',
                    'Trung cảnh: Dòng sông uốn lượn chữ S dẫn hướng mắt nhìn.',
                    'Hậu cảnh: Dãy núi nhấp nhô mờ sương và mặt trời rực rỡ.'
                  ]).map((layer, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{layer}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 4 Drawing Steps Sketch Guide */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Brush className="w-3.5 h-3.5 text-blue-600" />
                  Quy trình 4 bước phác họa chì & lên màu cho học sinh lớp 6:
                </span>
                <span className="text-[10px] text-slate-500 font-medium">SGK Mỹ thuật THCS</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 text-xs">
                {(diagram?.drawingSteps || [
                  { step: 1, title: 'Kẻ khung & Đường chân trời', detail: 'Kẻ viền cách mép 1cm, vạch đường chân trời nhẹ ở 1/3 phía trên trang giấy.' },
                  { step: 2, title: 'Phác các ngọn núi', detail: 'Vẽ 2-3 ngọn núi nhấp nhô lượn sóng mềm mại, ngọn cao ngọn thấp đan xen.' },
                  { step: 3, title: 'Vẽ dòng sông chữ S', detail: 'Vẽ 2 nét uốn lượn từ chân núi thu hẹp rồi mở rộng dần ra góc dưới giấy.' },
                  { step: 4, title: 'Tô màu theo lớp', detail: 'Tô nền trời ➔ Tô núi xa ➔ Tô dòng sông ➔ Tô bờ cỏ & chi tiết con đò.' }
                ]).map((s, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                    <span className="inline-block px-1.5 py-0.5 rounded-full bg-blue-600 text-white font-black text-[10px]">
                      Bước {s.step}
                    </span>
                    <h5 className="font-bold text-slate-800 text-[11px]">{s.title}</h5>
                    <p className="text-[11px] text-slate-600 leading-snug">{s.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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

              {/* Central Geographic Compass Rose */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs p-2 rounded-xl shadow-xs border border-slate-200 flex flex-col items-center">
                <Compass className="w-5 h-5 text-indigo-600 animate-spin-slow" />
                <div className="relative w-12 h-12 mt-1">
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 text-[9px] font-black text-rose-600">B</span>
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-700">N</span>
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-700">T</span>
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[9px] font-black text-blue-600">Đ</span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  </div>
                </div>
                <span className="text-[9px] font-bold text-slate-500">Hoa gió</span>
              </div>

              {/* Stylized S-curve of Vietnam Central Coast */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 300">
                <path
                  d="M 60 20 Q 90 90 85 140 Q 80 200 130 280"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="28"
                  strokeLinecap="round"
                  opacity="0.85"
                />
                <path
                  d="M 60 20 Q 90 90 85 140 Q 80 200 130 280"
                  fill="none"
                  stroke="#86efac"
                  strokeWidth="16"
                  strokeLinecap="round"
                />

                {/* Point 1: Da Nang Coastline */}
                <circle cx="85" cy="140" r="7" fill="#dc2626" />
                <circle cx="85" cy="140" r="14" fill="#dc2626" opacity="0.2" className="animate-ping" />

                {/* Point 2: Paracel Islands (Hoang Sa) */}
                <circle cx="350" cy="140" r="8" fill="#2563eb" />
                <circle cx="350" cy="140" r="16" fill="#2563eb" opacity="0.2" className="animate-ping" />

                {/* East Directional Arrow line */}
                <line
                  x1="95"
                  y1="140"
                  x2="335"
                  y2="140"
                  stroke="#2563eb"
                  strokeWidth="3.5"
                  strokeDasharray="6 4"
                />
                <polygon points="340,140 326,133 326,147" fill="#2563eb" />
              </svg>

              {/* Label: Da Nang */}
              <div className="absolute top-[125px] left-[15px] sm:left-[25px] bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-rose-300 shadow-xs flex items-center gap-1 text-[11px] font-black text-rose-700">
                <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>TP. ĐÀ NẴNG</span>
              </div>

              {/* Label: Hoang Sa */}
              <div className="absolute top-[120px] right-[40px] sm:right-[70px] bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 text-xs font-black">
                <span>Quần đảo HOÀNG SA</span>
              </div>

              {/* Label: Arrow Indicator */}
              <div className="absolute top-[100px] left-[45%] -translate-x-1/2 bg-amber-400 text-amber-950 font-black px-2.5 py-0.5 rounded-full text-[10px] shadow-xs flex items-center gap-1">
                <span>MŨI TÊN CHỈ HƯỚNG ĐÔNG (➔)</span>
              </div>

              {/* Sea Water Text */}
              <div className="absolute bottom-3 left-4 text-blue-900/60 font-black text-xs tracking-widest uppercase">
                🌊 BIỂN ĐÔNG VIỆT NAM
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200/70 rounded-xl flex items-start gap-2">
              <span className="text-blue-600 text-base font-black">💡</span>
              <p className="text-xs text-blue-950 leading-relaxed font-medium">
                <strong>Quy tắc nhớ nhanh môn Địa lý 6:</strong> Trên bản đồ, phía trên là Bắc, dưới là Nam, trái là Tây, phải là Đông. Đứng từ đất liền TP. Đà Nẵng nhìn ra Biển Đông chính là hướng sang bên phải ➔ <strong>HƯỚNG ĐÔNG</strong>.
              </p>
            </div>
          </div>
        )}

        {/* =========================================================
            2. TOÁN HỌC: BIỂU ĐỒ VEN (VENN DIAGRAM) CHO TẬP HỢP
            ========================================================= */}
        {isVennSet && (
          <div className="space-y-3">
            <div className="relative w-full h-[260px] sm:h-[300px] bg-gradient-to-b from-indigo-50/60 to-purple-50/60 rounded-xl border border-indigo-200 overflow-hidden flex items-center justify-center select-none">
              <div className="relative w-[280px] sm:w-[320px] h-[220px]">
                {/* Venn Outer Container */}
                <div className="absolute inset-0 rounded-full border-3 border-indigo-600 bg-indigo-500/10 flex flex-col justify-between p-4 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs font-black rounded-md">
                      Tập hợp B
                    </span>
                    <span className="text-[11px] font-bold text-indigo-700">Các phần tử ∈ B</span>
                  </div>

                  {/* Elements inside Set B */}
                  <div className="flex items-center justify-around py-4">
                    <span className="w-9 h-9 rounded-full bg-emerald-500 text-white font-black text-sm flex items-center justify-center shadow-md">
                      2
                    </span>
                    <span className="w-9 h-9 rounded-full bg-emerald-500 text-white font-black text-sm flex items-center justify-center shadow-md">
                      3
                    </span>
                    <span className="w-9 h-9 rounded-full bg-emerald-500 text-white font-black text-sm flex items-center justify-center shadow-md">
                      4
                    </span>
                    <span className="w-9 h-9 rounded-full bg-emerald-500 text-white font-black text-sm flex items-center justify-center shadow-md">
                      5
                    </span>
                  </div>

                  <div className="text-center text-[10px] text-indigo-900 font-bold">
                    {"B = {2; 3; 4; 5}"}
                  </div>
                </div>

                {/* Elements outside Set B */}
                <div className="absolute -top-1 -left-6 sm:-left-10 flex flex-col items-center">
                  <span className="w-8 h-8 rounded-full bg-rose-500 text-white font-black text-xs flex items-center justify-center shadow-md">
                    1
                  </span>
                  <span className="text-[9px] font-bold text-rose-700 mt-0.5">{"1 ∉ B"}</span>
                </div>

                <div className="absolute -bottom-1 -right-6 sm:-right-10 flex flex-col items-center">
                  <span className="w-8 h-8 rounded-full bg-rose-500 text-white font-black text-xs flex items-center justify-center shadow-md">
                    6
                  </span>
                  <span className="text-[9px] font-bold text-rose-700 mt-0.5">$6 \notin B$</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 font-medium">
                <span className="font-bold text-emerald-800 block mb-0.5">✓ Thuộc tập hợp ($\in$):</span>
                Số 2, 3, 4, 5 nằm trong vòng tròn B.
              </div>
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 font-medium">
                <span className="font-bold text-rose-800 block mb-0.5">✗ Không thuộc ($\notin$):</span>
                Số 1 và 6 nằm ngoài vòng tròn B.
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            3. TIẾNG ANH: FLASHCARD & TÌNH HUỐNG THỰC TẾ
            ========================================================= */}
        {isEnglishScene && (
          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-md uppercase">
                  English Grammar 6
                </span>
                <button
                  type="button"
                  onClick={() => onSpeakEnglish?.('Look! The teacher is coming.')}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-emerald-200"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Nghe phát âm chuẩn</span>
                </button>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-base font-extrabold text-slate-800">
                  <span className="text-rose-600">Look!</span>
                  <span>The teacher</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md border border-emerald-300 underline">
                    is coming
                  </span>
                  <span>.</span>
                </div>
                <p className="text-xs text-slate-600 italic">
                  "Nhìn kìa! Cô giáo đang đi vào lớp đấy."
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white/80 rounded-lg border border-emerald-100">
                  <span className="font-bold text-emerald-900 block mb-0.5">Dấu hiệu nhận biết:</span>
                  Từ cảm thán <strong>Look! (Nhìn kìa!)</strong> báo hiệu hành động đang diễn ra ngay lúc nói.
                </div>
                <div className="p-2.5 bg-white/80 rounded-lg border border-emerald-100">
                  <span className="font-bold text-emerald-900 block mb-0.5">Công thức thì HTTD:</span>
                  {"S + (am / is / are) + V-ing"} (Chủ ngữ số ít đi với <strong>is</strong>).
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            4. KHOA HỌC TỰ NHIÊN: THÍ NGHIỆM & KHỐI LƯỢNG RIÊNG
            ========================================================= */}
        {isScienceLab && (
          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl flex flex-col items-center justify-center text-center space-y-3">
              <span className="px-2.5 py-0.5 bg-cyan-600 text-white text-[10px] font-bold rounded-md">
                KHTN 6 • Vật Lý & Đo Thể Tích
              </span>
              <div className="flex items-center gap-6 py-2">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-28 border-2 border-slate-700 border-t-0 rounded-b-lg bg-blue-200/50 relative flex items-end justify-center p-1">
                    <div className="w-full h-14 bg-blue-400 rounded-b-md" />
                    <span className="absolute top-2 text-[10px] font-black text-slate-600">V1 = 50ml</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 mt-1">Nước ban đầu</span>
                </div>
                <span className="text-xl font-bold text-cyan-700">➔</span>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-28 border-2 border-slate-700 border-t-0 rounded-b-lg bg-blue-200/50 relative flex items-end justify-center p-1">
                    <div className="w-full h-20 bg-blue-400 rounded-b-md relative flex items-center justify-center">
                      <div className="w-5 h-5 rounded-sm bg-slate-800" />
                    </div>
                    <span className="absolute top-2 text-[10px] font-black text-slate-600">V2 = 70ml</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 mt-1">Thả vật chìm</span>
                </div>
              </div>
              <div className="text-xs bg-white px-3 py-1.5 rounded-lg border border-cyan-200 font-bold text-cyan-900">
                {"Thể tích vật: V = V2 - V1 = 70 - 50 = 20 ml = 20 cm³"}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            5. NGỮ VĂN: MINDMAP TỪ GHÉP & TỪ LÁY
            ========================================================= */}
        {isLiteratureMindmap && (
          <div className="space-y-3">
            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-amber-600 text-white text-[10px] font-bold rounded-md">
                  Ngữ Văn 6 • Cấu Tạo Từ Phức
                </span>
                <span className="text-[11px] text-amber-900 font-bold">Sơ đồ phân loại</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-black">
                      1
                    </span>
                    <span>TỪ GHÉP (Quan hệ về nghĩa)</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Các tiếng có quan hệ về nghĩa với nhau (Đẳng lập hoặc Chính phụ).
                  </p>
                  <div className="mt-1.5 p-2 bg-indigo-50/70 rounded-lg text-indigo-950 font-medium">
                    Ví dụ: <strong>sách vở, hoa quả, áo dài, xe đạp</strong>.
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center font-black">
                      2
                    </span>
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
        {!isArtDrawing &&
          !isHoangSaOrMap &&
          !isVennSet &&
          !isEnglishScene &&
          !isScienceLab &&
          !isLiteratureMindmap &&
          !isFlowchart && (
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
