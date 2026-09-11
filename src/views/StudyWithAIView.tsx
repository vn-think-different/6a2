import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Image as ImageIcon,
  Upload,
  X,
  CheckCircle2,
  HelpCircle,
  Volume2,
  VolumeX,
  Sliders,
  Play,
  Square,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Calculator,
  Compass,
  FileText,
  Lightbulb,
  Award,
  Brain,
  MessageCircleQuestion,
  Printer,
  Library,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount, AIExerciseSolution, AISavedExercise } from '../types';
import { MathView, FormattedTextWithMath } from '../components/MathView';
import { SubjectIllustration } from '../components/SubjectIllustration';

interface StudyWithAIViewProps {
  currentUser: UserAccount;
}

// Preset Grade 6 curriculum sample exercises for 1-click test
const SAMPLE_EXERCISES = [
  {
    subject: 'Lịch sử & Địa lý',
    title: 'Vị trí quần đảo Hoàng Sa trên bản đồ Việt Nam',
    prompt: 'Dựa vào bản đồ địa lý Việt Nam, quần đảo Hoàng Sa nằm cách đất liền thành phố Đà Nẵng về phía Biển Đông theo hướng nào? A. Bắc, B. Nam, C. Tây, D. Đông.',
    topic: 'Địa lý 6 - Vị trí biển đảo Việt Nam'
  },
  {
    subject: 'Toán học',
    title: 'Tập hợp B và tính đúng sai: 2 ∈ B, 6 ∉ B',
    prompt: 'Cho tập hợp B = {2; 3; 4; 5}. Hãy xét tính đúng sai của các khẳng định sau: 2 ∈ B, 5 ∈ B, 1 ∉ B, 6 ∈ B. Vì sao?',
    topic: 'Tập hợp & Phần tử của tập hợp (Toán 6)'
  },
  {
    subject: 'Tiếng Anh',
    title: 'Chia động từ thì Hiện tại tiếp diễn (Unit 1 & 2)',
    prompt: 'Complete the sentences with Present Continuous and practice pronunciation: 1. Look! The teacher (come) _______. 2. We (study) _______ English with AI right now.',
    topic: 'Global Success 6 - Present Continuous'
  },
  {
    subject: 'Khoa học tự nhiên',
    title: 'Tính khối lượng riêng và thể tích vật thể',
    prompt: 'Một khối sắt có thể tích 50 cm³ và khối lượng 390 g. Tính khối lượng riêng của sắt theo đơn vị kg/m³.',
    topic: 'Vật lý & Hóa học lớp 6'
  },
  {
    subject: 'Ngữ văn',
    title: 'Phân biệt từ ghép và từ láy trong Tiếng Việt',
    prompt: 'Trong các từ sau: lung linh, xinh xắn, bàn ghế, phẳng lặng, cây cối. Từ nào là từ ghép, từ nào là từ láy? Hãy giải thích quy tắc nhận biết.',
    topic: 'Tiếng Việt - Cấu tạo từ'
  },
  {
    subject: 'Tin học',
    title: 'Sơ đồ khối thuật toán kiểm tra số dương',
    prompt: 'Em hãy nêu các bước và vẽ sơ đồ khối thuật toán nhập vào một số tự nhiên a và kiểm tra xem số a có lớn hơn 0 hay không.',
    topic: 'Thuật toán & Lưu đồ (Tin học 6)'
  },
  {
    subject: 'Toán học',
    title: 'Tìm số tự nhiên x có lũy thừa và phép nhân',
    prompt: 'Tìm số tự nhiên x, biết: 3 × (x - 2) + 2³ = 26',
    topic: 'Số học & Thứ tự phép tính'
  }
];

// Helper: Convert raw LaTeX / math notation to natural, pedagogical spoken Vietnamese
function sanitizeMathForVietnameseSpeech(text: string): string {
  let s = text;
  // Clean markdown bold/italic/code
  s = s.replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '');

  // Sets and element relations (Toán học tập hợp)
  s = s.replace(/\\notin/g, ' không thuộc ');
  s = s.replace(/∉/g, ' không thuộc ');
  s = s.replace(/\\in/g, ' thuộc ');
  s = s.replace(/∈/g, ' thuộc ');
  s = s.replace(/\\subset/g, ' là tập hợp con của ');
  s = s.replace(/⊂/g, ' là tập hợp con của ');
  s = s.replace(/\\supset/g, ' chứa tập hợp ');
  s = s.replace(/\\cap/g, ' giao với ');
  s = s.replace(/∩/g, ' giao với ');
  s = s.replace(/\\cup/g, ' hợp với ');
  s = s.replace(/∪/g, ' hợp với ');
  s = s.replace(/\\emptyset/g, ' tập hợp rỗng ');
  s = s.replace(/∅/g, ' tập hợp rỗng ');

  // Logic & Arrows
  s = s.replace(/\\Rightarrow/g, ' suy ra ');
  s = s.replace(/⇒/g, ' suy ra ');
  s = s.replace(/\\Leftrightarrow/g, ' tương đương ');
  s = s.replace(/⇔/g, ' tương đương ');
  s = s.replace(/\\approx/g, ' xấp xỉ bằng ');
  s = s.replace(/≈/g, ' xấp xỉ bằng ');
  s = s.replace(/\\neq/g, ' khác ');
  s = s.replace(/≠/g, ' khác ');
  s = s.replace(/\\le/g, ' nhỏ hơn hoặc bằng ');
  s = s.replace(/≤/g, ' nhỏ hơn hoặc bằng ');
  s = s.replace(/\\ge/g, ' lớn hơn hoặc bằng ');
  s = s.replace(/≥/g, ' lớn hơn hoặc bằng ');

  // Number sets
  s = s.replace(/\\mathbb\{N\}\^\*/g, ' tập hợp số tự nhiên khác không N sao ');
  s = s.replace(/\\mathbb\{N\}/g, ' tập hợp số tự nhiên N ');
  s = s.replace(/\\mathbb\{Z\}/g, ' tập hợp số nguyên Z ');
  s = s.replace(/\\mathbb\{Q\}/g, ' tập hợp số hữu tỉ Q ');

  // Text wrapper in LaTeX
  s = s.replace(/\\text\{([^}]+)\}/g, ' $1 ');

  // Arithmetic operations
  s = s.replace(/\\times/g, ' nhân ');
  s = s.replace(/×/g, ' nhân ');
  s = s.replace(/\\cdot/g, ' nhân ');
  s = s.replace(/·/g, ' nhân ');
  s = s.replace(/\\div/g, ' chia cho ');
  s = s.replace(/÷/g, ' chia cho ');
  s = s.replace(/\\pm/g, ' cộng trừ ');
  s = s.replace(/±/g, ' cộng trừ ');
  s = s.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, ' $1 phần $2 ');
  s = s.replace(/\\sqrt\{([^}]+)\}/g, ' căn bậc hai của $1 ');
  s = s.replace(/\^2/g, ' bình phương ');
  s = s.replace(/\^3/g, ' lập phương ');
  s = s.replace(/\^\{?([0-9a-zA-Z]+)\}?/g, ' mũ $1 ');

  // Units
  s = s.replace(/\\text\{cm\}\^3|cm\^3|cm³/g, ' xen-ti-mét khối ');
  s = s.replace(/\\text\{m\}\^3|m\^3|m³/g, ' mét khối ');
  s = s.replace(/\\text\{cm\}\^2|cm\^2|cm²/g, ' xen-ti-mét vuông ');
  s = s.replace(/\\text\{m\}\^2|m\^2|m²/g, ' mét vuông ');
  s = s.replace(/kg\/m\^3|kg\/m³/g, ' ki-lô-gam trên mét khối ');
  s = s.replace(/g\/cm\^3|g\/cm³/g, ' gam trên xen-ti-mét khối ');
  s = s.replace(/°C|\^\\circ\s*C/g, ' độ C ');
  s = s.replace(/°|\^\\circ/g, ' độ ');

  // Quiz Options
  s = s.replace(/\bA\.\s*/g, 'Phương án A: ');
  s = s.replace(/\bB\.\s*/g, 'Phương án B: ');
  s = s.replace(/\bC\.\s*/g, 'Phương án C: ');
  s = s.replace(/\bD\.\s*/g, 'Phương án D: ');

  // Strip remaining LaTeX formatting characters
  s = s.replace(/[\{\}\$\\\_\|]/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

const SUBJECTS = [
  'Tất cả môn',
  'Toán học',
  'Lịch sử & Địa lý',
  'Tiếng Anh',
  'Khoa học tự nhiên',
  'Ngữ văn',
  'Tin học'
];

export const StudyWithAIView: React.FC<StudyWithAIViewProps> = ({ currentUser }) => {
  // Input state
  const [selectedSubject, setSelectedSubject] = useState<string>('Tất cả môn');
  const [promptText, setPromptText] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Solving state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Results state
  const [solution, setSolution] = useState<AIExerciseSolution | null>(null);
  const [activeTabSub, setActiveTabSub] = useState<'solver' | 'saved'>('solver');
  
  // Interactive features
  const [copied, setCopied] = useState<boolean>(false);
  const [savedExercises, setSavedExercises] = useState<AISavedExercise[]>(() => {
    try {
      const stored = localStorage.getItem('6a2_saved_ai_exercises');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isSavedCurrent, setIsSavedCurrent] = useState<boolean>(false);
  const [showSimilarAnswer, setShowSimilarAnswer] = useState<boolean>(false);

  // Step follow-up questioning state
  const [stepAskingIndex, setStepAskingIndex] = useState<number | null>(null);
  const [stepQuestionText, setStepQuestionText] = useState<string>('');
  const [stepAnswers, setStepAnswers] = useState<{ [index: number]: string }>({});
  const [isAnsweringStep, setIsAnsweringStep] = useState<boolean>(false);

  // Speech TTS state
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [speechSpeed, setSpeechSpeed] = useState<number>(0.9);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const available = window.speechSynthesis.getVoices();
        setVoices(available);
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Save exercises to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('6a2_saved_ai_exercises', JSON.stringify(savedExercises));
    } catch (e) {
      console.warn('Cannot save to localStorage', e);
    }
  }, [savedExercises]);

  // Check if current solution is already saved
  useEffect(() => {
    if (!solution) {
      setIsSavedCurrent(false);
      return;
    }
    const exists = savedExercises.some(
      (item) => item.problemSummary === solution.problemSummary && item.finalAnswer.result === solution.finalAnswer.result
    );
    setIsSavedCurrent(exists);
  }, [solution, savedExercises]);

  // Handle Image Upload & Drag-and-drop
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chỉ tải lên tệp hình ảnh (PNG, JPG, JPEG, WEBP)!');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      alert('Hình ảnh quá lớn (vượt quá 15MB). Vui lòng chọn ảnh nhẹ hơn!');
      return;
    }

    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      setSelectedImage(loadEvt.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearInput = () => {
    setPromptText('');
    setSelectedImage(null);
    setImageName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setErrorMessage(null);
  };

  const loadSample = (sample: typeof SAMPLE_EXERCISES[0]) => {
    setSelectedSubject(sample.subject);
    setPromptText(sample.prompt);
    setSelectedImage(null);
    setImageName('');
    setErrorMessage(null);
  };

  // Submit to AI
  const handleSolveExercise = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptText.trim() && !selectedImage) {
      setErrorMessage('Vui lòng nhập đề bài hoặc tải ảnh bài tập lên!');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    setLoadingStage('Đang kết nối Trợ lý AI Google...');
    setShowSimilarAnswer(false);
    setStepAnswers({});
    setStepAskingIndex(null);

    const stages = [
      'Đang nhận diện nội dung đề bài...',
      'Đang đối chiếu chuẩn kiến thức SGK Lớp 6...',
      'Đang giải chi tiết từng bước sư phạm...',
      'Đang chuẩn hóa đáp số và mẹo ghi nhớ...'
    ];

    let stageIdx = 0;
    const stageInterval = setInterval(() => {
      stageIdx = (stageIdx + 1) % stages.length;
      setLoadingStage(stages[stageIdx]);
    }, 1100);

    try {
      const response = await fetch('/api/ai/solve-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          image: selectedImage,
          subject: selectedSubject !== 'Tất cả môn' ? selectedSubject : undefined,
        }),
      });

      clearInterval(stageInterval);

      if (!response.ok) {
        throw new Error('Máy chủ phản hồi không thành công. Vui lòng thử lại!');
      }

      const result = await response.json();
      if (result.success && result.data) {
        const enrichedSolution: AIExerciseSolution = {
          ...result.data,
          id: 'sol_' + Date.now(),
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          userPrompt: promptText,
          userImage: selectedImage || undefined,
        };
        setSolution(enrichedSolution);

        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 }
        });
      } else {
        throw new Error(result.error || 'Không thể giải bài tập lúc này.');
      }
    } catch (err: any) {
      clearInterval(stageInterval);
      console.error(err);
      setErrorMessage(err.message || 'Có lỗi xảy ra khi gửi bài lên AI. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Save Current Solution
  const handleToggleSave = () => {
    if (!solution) return;
    if (isSavedCurrent) {
      setSavedExercises((prev) =>
        prev.filter((item) => item.problemSummary !== solution.problemSummary)
      );
      setIsSavedCurrent(false);
    } else {
      const newSaved: AISavedExercise = {
        ...solution,
        savedAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setSavedExercises((prev) => [newSaved, ...prev]);
      setIsSavedCurrent(true);
    }
  };

  // Copy full solution text
  const handleCopySolution = () => {
    if (!solution) return;
    const textLines = [
      `📚 BÀI TẬP LỚP 6A2 - LỜI GIẢI TỪ TRỢ LÝ AI`,
      `Môn: ${solution.subject} • Chủ đề: ${solution.topic}`,
      `Đề bài: ${solution.problemSummary}`,
      `---------------------------------`,
      `📖 CÁC BƯỚC THỰC HIỆN:`,
      ...solution.steps.map(
        (s) => `${s.title}:\n- Lời giải: ${s.explanation}${s.mathExpression ? `\n- Biểu thức: ${s.mathExpression}` : ''}`
      ),
      `---------------------------------`,
      `🎯 ĐÁP SỐ: ${solution.finalAnswer.result}`,
      `Kết luận: ${solution.finalAnswer.conclusion}`,
      solution.finalAnswer.verification ? `Cách kiểm tra: ${solution.finalAnswer.verification}` : '',
    ].filter(Boolean).join('\n\n');

    navigator.clipboard.writeText(textLines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    }
  };

  // Enhanced Speak step
  const speakText = (rawText: string, id: string, forceLang?: 'en-US' | 'vi-VN') => {
    if (!('speechSynthesis' in window)) {
      alert('Trình duyệt của bạn không hỗ trợ phát âm thanh.');
      return;
    }

    if (speakingId === id) {
      stopSpeaking();
      return;
    }

    window.speechSynthesis.cancel();

    // Language resolution: Strictly Vietnamese for all subjects unless subject is 'Tiếng Anh' or explicitly forced to 'en-US'
    const isEnglish = forceLang === 'en-US' || (forceLang !== 'vi-VN' && solution?.subject === 'Tiếng Anh');
    const targetLang: 'en-US' | 'vi-VN' = isEnglish ? 'en-US' : 'vi-VN';

    let cleanedText = rawText;
    if (targetLang === 'vi-VN') {
      cleanedText = sanitizeMathForVietnameseSpeech(rawText);
    } else {
      cleanedText = cleanedText
        .replace(/\\text\{([^}]+)\}/g, '$1')
        .replace(/[\$\{\}\\]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    if (!cleanedText) return;

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = targetLang;
    utterance.rate = speechSpeed;

    if (voices.length > 0) {
      if (targetLang === 'vi-VN') {
        const viVoice = voices.find(v => 
          v.lang.toLowerCase().startsWith('vi') || 
          v.lang.toLowerCase().includes('vn') || 
          v.name.toLowerCase().includes('vietnam') ||
          v.name.toLowerCase().includes('vietnamese') ||
          v.name.toLowerCase().includes('hoaimy') ||
          v.name.toLowerCase().includes('namminh') ||
          v.name.toLowerCase().includes('mai') ||
          v.name.toLowerCase().includes('linh') ||
          v.name.toLowerCase().includes('an')
        );
        if (viVoice) utterance.voice = viVoice;
      } else {
        const enVoice = voices.find(v => 
          v.lang.startsWith('en') && (v.name.includes('US') || v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Zira'))
        ) || voices.find(v => v.lang.startsWith('en'));
        if (enVoice) utterance.voice = enVoice;
      }
    }

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Ask AI about a specific step
  const handleAskStep = async (stepIndex: number) => {
    if (!stepQuestionText.trim() || !solution) return;

    const step = solution.steps[stepIndex];
    setIsAnsweringStep(true);

    try {
      const res = await fetch('/api/ai/ask-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: stepQuestionText,
          stepTitle: step.title,
          stepExplanation: step.explanation,
          problemSummary: solution.problemSummary,
        }),
      });

      const data = await res.json();
      if (data.success && data.answer) {
        setStepAnswers((prev) => ({
          ...prev,
          [stepIndex]: data.answer,
        }));
        setStepQuestionText('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnsweringStep(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 pb-16 pt-3 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Header Bar: Clean & Focused */}
      <header className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-xs shrink-0">
            <Sparkles className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Học Cùng AI • Gia Sư Lớp 6A2
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Giải thích sư phạm từng bước mạch lạc, rõ ràng cho mọi môn học lớp 6
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTabSub(activeTabSub === 'saved' ? 'solver' : 'saved')}
            className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl border transition cursor-pointer ${
              activeTabSub === 'saved'
                ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Library className="w-4 h-4 text-amber-600" />
            <span>Sổ tay bài đã lưu ({savedExercises.length})</span>
          </button>
        </div>
      </header>

      {/* VIEW: Saved Exercises Notebook */}
      {activeTabSub === 'saved' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs mb-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Bookmark className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Sổ tay bài tập đã lưu</h2>
                <p className="text-xs text-slate-500">Các bài tập em đã tìm hiểu cùng AI để ôn thi</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTabSub('solver')}
              className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition"
            >
              Quay lại học bài
            </button>
          </div>

          {savedExercises.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="text-sm font-medium text-slate-600">Chưa có bài tập nào trong sổ tay</p>
              <p className="text-xs text-slate-400 mt-1">Khi xem lời giải, em bấm nút "Lưu vào sổ tay" nhé!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {savedExercises.map((item, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 hover:bg-white hover:border-blue-300 hover:shadow-2xs transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[11px]">
                        {item.subject}
                      </span>
                      <span className="text-slate-400 text-[11px]">{item.savedAt}</span>
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 mb-2">
                      {item.problemSummary}
                    </h3>
                    <div className="bg-white rounded-lg p-2.5 text-xs text-slate-700 border border-slate-200/80 mb-2">
                      <span className="font-bold text-emerald-700 mr-1">Đáp số:</span>
                      <span className="font-semibold text-slate-900">{item.finalAnswer.result}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setSolution(item);
                        setActiveTabSub('solver');
                      }}
                      className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Xem lại lời giải</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSavedExercises((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          PROFESSIONAL TWO-COLUMN LAYOUT (DESKTOP)
          Left: Input & Presets (~38%) | Right: Detailed Solution (~62%)
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================
            COLUMN 1: INPUT WORKSPACE & SAMPLES (LG: 5 COLS)
            ====================================================== */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Input Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs transition-all">
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <span>Nhập đề bài hoặc tải ảnh chụp</span>
              </h2>

              {(promptText || selectedImage) && (
                <button
                  type="button"
                  onClick={clearInput}
                  className="text-xs text-slate-400 hover:text-rose-600 cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Làm mới</span>
                </button>
              )}
            </div>

            {/* Subject Selector Chips */}
            <div className="mb-3.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Chọn môn học:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SUBJECTS.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSelectedSubject(sub)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                      selectedSubject === sub
                        ? 'bg-blue-600 text-white font-bold shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea Input */}
            <div className="mb-3">
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Gõ đề bài hoặc dán câu hỏi tại đây... (Ví dụ: Cho tập hợp B = {2; 3; 4; 5} xét tính đúng sai, hoặc câu hỏi Địa lý Hoàng Sa - Đà Nẵng...)"
                rows={4}
                className="w-full text-sm p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400 transition resize-none leading-relaxed text-slate-800"
              />
            </div>

            {/* Upload image thumbnail or upload button */}
            {selectedImage ? (
              <div className="mb-4 p-2.5 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <img
                    src={selectedImage}
                    alt="Đề bài tải lên"
                    className="w-12 h-12 object-cover rounded-lg border border-blue-200 shrink-0"
                  />
                  <div className="truncate text-xs">
                    <p className="font-semibold text-blue-950 truncate">{imageName || 'Ảnh chụp bài tập'}</p>
                    <p className="text-[11px] text-blue-600">Đã đính kèm ảnh vào đề bài</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setImageName('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition cursor-pointer"
                  title="Xóa ảnh này"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="mb-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="ai-image-upload-input"
                />
                <label
                  htmlFor="ai-image-upload-input"
                  className="flex items-center justify-center gap-2 p-2.5 border border-dashed border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 rounded-xl text-xs font-semibold text-slate-600 hover:text-blue-700 cursor-pointer transition"
                >
                  <Upload className="w-4 h-4 text-blue-500" />
                  <span>Tải ảnh chụp đề bài từ SGK / Vở bài tập</span>
                </label>
              </div>
            )}

            {/* Error banner */}
            {errorMessage && (
              <div className="mb-3.5 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
                {errorMessage}
              </div>
            )}

            {/* Solve Action Button */}
            <button
              type="button"
              onClick={() => handleSolveExercise()}
              disabled={isLoading || (!promptText.trim() && !selectedImage)}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs ${
                isLoading || (!promptText.trim() && !selectedImage)
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-[0.99]'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{loadingStage || 'AI đang phân tích...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Hỏi AI Giải Bài Chi Tiết</span>
                </>
              )}
            </button>
          </div>

          {/* Sample Exercises Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>Đề bài mẫu chuẩn SGK Lớp 6</span>
              </h3>
              <span className="text-[11px] text-slate-400">Bấm để thử nhanh</span>
            </div>

            <div className="space-y-2">
              {SAMPLE_EXERCISES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => loadSample(sample)}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/40 transition group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                      {sample.subject}
                    </span>
                    <span className="text-slate-400 group-hover:text-blue-600 transition">Thử ngay ➔</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-950 transition line-clamp-1">
                    {sample.title}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ======================================================
            COLUMN 2: DETAILED SOLUTION & PEDAGOGICAL WORKSPACE (LG: 7 COLS)
            ====================================================== */}
        <div className="lg:col-span-7">
          {/* Empty State: Guide for students */}
          {!solution && !isLoading && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-3.5">
                <Brain className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                Không gian học tập và lời giải chi tiết
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
                Em hãy nhập đề bài hoặc bấm chọn một đề bài mẫu ở cột bên trái, 
                sau đó nhấn <strong>"Hỏi AI Giải Bài Chi Tiết"</strong> để nhận lời giải sư phạm từng bước nhé!
              </p>

              {/* 3 Step Guidance */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-lg mx-auto text-xs">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px] mb-2">
                    1
                  </span>
                  <p className="font-bold text-slate-800 mb-0.5">Tóm tắt & Giả thiết</p>
                  <p className="text-slate-500 text-[11px]">Xác định rõ dữ kiện đề bài cho và yêu cầu cần tìm.</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[11px] mb-2">
                    2
                  </span>
                  <p className="font-bold text-slate-800 mb-0.5">Hướng dẫn từng bước</p>
                  <p className="text-slate-500 text-[11px]">Giải thích lập luận, công thức và nghe đọc audio.</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[11px] mb-2">
                    3
                  </span>
                  <p className="font-bold text-slate-800 mb-0.5">Đáp số chuẩn xác</p>
                  <p className="text-slate-500 text-[11px]">Kết luận rõ ràng và mẹo thử lại để đạt điểm 10.</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading Animation Card */}
          {isLoading && (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-xs">
              <div className="inline-block p-4 rounded-full bg-blue-50 text-blue-600 mb-3 animate-pulse">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                Trợ lý AI đang giải bài tập cho em...
              </h3>
              <p className="text-xs text-blue-600 font-semibold mb-4">
                {loadingStage}
              </p>
              <div className="w-44 h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden">
                <div className="w-full h-full bg-blue-600 rounded-full animate-pulse" />
              </div>
            </div>
          )}

          {/* Solution Ready */}
          {solution && !isLoading && (
            <div className="space-y-4">
              {/* Actions & Subject Header */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="bg-blue-600 text-white font-bold px-2.5 py-1 rounded-lg">
                    {solution.subject}
                  </span>
                  <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {solution.topic}
                  </span>
                  {/* Voice Mode Indicator */}
                  <span className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 border text-xs ${
                    solution.subject === 'Tiếng Anh'
                      ? 'bg-amber-50 text-amber-900 border-amber-200'
                      : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  }`}>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{solution.subject === 'Tiếng Anh' ? '🇬🇧 Giọng đọc: English (US)' : '🇻🇳 Giọng đọc: Tiếng Việt chuẩn SGK'}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopySolution}
                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition cursor-pointer text-xs flex items-center gap-1 font-semibold"
                    title="Sao chép lời giải"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span className="hidden sm:inline">{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleSave}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                      isSavedCurrent
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isSavedCurrent ? <BookmarkCheck className="w-3.5 h-3.5 text-amber-700" /> : <Bookmark className="w-3.5 h-3.5" />}
                    <span>{isSavedCurrent ? 'Đã lưu' : 'Lưu sổ tay'}</span>
                  </button>
                </div>
              </div>

              {/* 1. HERO ANSWER CARD (Clean & Legible Pastel Emerald) */}
              <div className="bg-emerald-50/90 border border-emerald-300/80 rounded-2xl p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-md">
                    Đáp số chính xác (Final Answer)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      speakText(
                        `Đáp số: ${solution.finalAnswer.result}. Lời kết luận: ${solution.finalAnswer.conclusion}`,
                        'final_ans'
                      )
                    }
                    className={`text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      speakingId === 'final_ans'
                        ? 'bg-emerald-600 text-white animate-pulse'
                        : 'bg-white/80 hover:bg-white text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{speakingId === 'final_ans' ? 'Đang đọc...' : 'Nghe đáp số'}</span>
                  </button>
                </div>

                {/* The Answer Result: Pure Vietnamese text or KaTeX Math without font mangling */}
                <div className="text-xl sm:text-2xl font-black text-emerald-950 my-2 leading-relaxed tracking-normal">
                  <MathView expression={solution.finalAnswer.result} displayMode={false} />
                </div>

                {/* Conclusion */}
                <div className="text-xs sm:text-sm text-emerald-900 leading-relaxed font-medium bg-white/70 p-3 rounded-xl border border-emerald-200/80 mt-2">
                  <strong className="text-emerald-950 font-bold">Lời kết luận: </strong>
                  <FormattedTextWithMath text={solution.finalAnswer.conclusion} />
                </div>
              </div>

              {/* 2. SUBJECT-SPECIFIC ILLUSTRATION / VISUAL LEARNING AID */}
              <SubjectIllustration
                subject={solution.subject}
                topic={solution.topic}
                problemText={solution.problemSummary + ' ' + (solution.userPrompt || '')}
                diagram={solution.visualDiagram}
                onSpeakEnglish={(phrase) => speakText(phrase, 'en_phrase', 'en-US')}
              />

              {/* 2. GIVEN DATA & KEY CONCEPTS (Clean Two-Column Grid) */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Tóm tắt đề bài & Trọng tâm kiến thức</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                  {/* Left: Given & To Find */}
                  <div className="space-y-2">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-700 block mb-1">📌 Dữ kiện đã cho (Giả thiết):</span>
                      <ul className="list-disc list-inside space-y-1 text-slate-600">
                        {solution.givenData.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-700 block mb-0.5">🎯 Yêu cầu cần tìm (Kết luận):</span>
                      <p className="text-slate-800 font-medium">{solution.toFind}</p>
                    </div>
                  </div>

                  {/* Right: Key Concepts */}
                  {solution.keyConcepts && solution.keyConcepts.length > 0 && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                        <span>Kiến thức trọng tâm cần nhớ:</span>
                      </div>
                      <ul className="space-y-1 text-amber-950">
                        {solution.keyConcepts.map((concept, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-600 font-bold">•</span>
                            <span className="leading-relaxed">{concept}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. STEP-BY-STEP PEDAGOGICAL BREAKDOWN */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900">
                      Hướng dẫn giải chi tiết ({solution.steps.length} bước)
                    </h3>
                  </div>

                  {/* Audio Controls */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span>Tốc độ:</span>
                    <button
                      type="button"
                      onClick={() => setSpeechSpeed(0.8)}
                      className={`px-1.5 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                        speechSpeed === 0.8 ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100'
                      }`}
                    >
                      0.8x
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpeechSpeed(1.0)}
                      className={`px-1.5 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                        speechSpeed === 1.0 ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100'
                      }`}
                    >
                      1.0x
                    </button>
                  </div>
                </div>

                {/* Steps List */}
                <div className="space-y-3.5">
                  {solution.steps.map((step, idx) => {
                    const isEnglishStep = solution.subject === 'Tiếng Anh';

                    const hasFormula = Boolean(step.mathExpression && step.mathExpression.trim() !== '');

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border transition ${
                          speakingId === `step_${idx}`
                            ? 'border-indigo-500 ring-2 ring-indigo-100 bg-indigo-50/20'
                            : 'border-slate-200/90 bg-slate-50/40 hover:bg-white'
                        }`}
                      >
                        {/* Step Header */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0">
                              {step.stepNumber || idx + 1}
                            </span>
                            <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                              <FormattedTextWithMath text={step.title} />
                            </h4>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                speakText(
                                  `${step.title}. ${step.explanation}. ${step.mathExpression || ''}`,
                                  `step_${idx}`,
                                  isEnglishStep ? 'en-US' : 'vi-VN'
                                )
                              }
                              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                                speakingId === `step_${idx}`
                                  ? 'bg-rose-500 text-white animate-pulse'
                                  : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100'
                              }`}
                              title="Nghe giảng bước này"
                            >
                              {speakingId === `step_${idx}` ? <Square className="w-3.5 h-3.5 fill-current" /> : <Volume2 className="w-3.5 h-3.5" />}
                              <span className="text-[11px] hidden sm:inline">
                                {speakingId === `step_${idx}` ? 'Dừng' : 'Nghe'}
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Step Explanation Text */}
                        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal pl-8">
                          <FormattedTextWithMath text={step.explanation} />
                        </div>

                        {/* ONLY display formula box when mathExpression exists and is non-empty */}
                        {hasFormula && (
                          <div className="mt-2.5 ml-8 p-3 bg-white border border-indigo-100 rounded-xl text-xs shadow-2xs">
                            <span className="text-[10px] uppercase font-bold text-indigo-800 tracking-wider block mb-1.5">
                              {solution.subject === 'Tiếng Anh'
                                ? 'Mẫu câu & Cấu trúc tiếng Anh:'
                                : solution.subject === 'Toán học'
                                ? 'Biểu thức & Phép tính toán học:'
                                : 'Ý chính / Dữ kiện cần nhớ:'}
                            </span>
                            <div className="font-semibold text-slate-900 overflow-x-auto py-1">
                              <MathView expression={step.mathExpression} displayMode={true} />
                            </div>
                          </div>
                        )}

                        {/* Step Tip */}
                        {step.tip && (
                          <div className="mt-2 ml-8 p-2 bg-amber-50/60 border border-amber-200/60 rounded-lg text-[11px] text-amber-900 flex items-start gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span><strong>Mẹo ghi nhớ:</strong> {step.tip}</span>
                          </div>
                        )}

                        {/* Step Follow-up AI Question */}
                        <div className="mt-2.5 ml-8 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setStepAskingIndex(stepAskingIndex === idx ? null : idx)}
                            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                          >
                            <MessageCircleQuestion className="w-3.5 h-3.5" />
                            <span>{stepAskingIndex === idx ? 'Đóng câu hỏi' : 'Chưa hiểu? Hỏi thêm AI về bước này'}</span>
                          </button>
                        </div>

                        {/* Follow-up question input box */}
                        {stepAskingIndex === idx && (
                          <div className="mt-2.5 ml-8 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2">
                            <p className="text-[11px] font-semibold text-indigo-900">
                              Em hãy gõ thắc mắc về bước {idx + 1}, Thầy/Cô AI sẽ giải thích thêm:
                            </p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={stepQuestionText}
                                onChange={(e) => setStepQuestionText(e.target.value)}
                                placeholder="Ví dụ: Tại sao lại chọn đáp án D? / Tại sao 2 thuộc B?..."
                                className="flex-1 text-xs p-2 bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleAskStep(idx);
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleAskStep(idx)}
                                disabled={isAnsweringStep || !stepQuestionText.trim()}
                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:bg-slate-300 transition cursor-pointer"
                              >
                                {isAnsweringStep ? '...' : 'Gửi'}
                              </button>
                            </div>

                            {stepAnswers[idx] && (
                              <div className="p-2.5 bg-white border border-indigo-100 rounded-lg text-xs text-indigo-950 mt-2 leading-relaxed">
                                <span className="font-bold text-indigo-700 block mb-0.5">Thầy/Cô giải đáp:</span>
                                {stepAnswers[idx]}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. VERIFICATION & TEACHER ENCOURAGEMENT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {solution.finalAnswer.verification && (
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs mb-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Cách kiểm tra & thử lại đáp số:</span>
                    </div>
                    <div className="text-xs text-slate-600 leading-relaxed">
                      <FormattedTextWithMath text={solution.finalAnswer.verification} />
                    </div>
                  </div>
                )}

                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 shadow-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs mb-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>Lời động viên từ Thầy/Cô Lớp 6A2:</span>
                  </div>
                  <p className="text-xs text-amber-950 leading-relaxed italic">
                    "{solution.teacherEncouragement || 'Em làm bài rất tốt! Hãy ghi nhớ phương pháp này nhé.'}"
                  </p>
                </div>
              </div>

              {/* 5. PRACTICE SIMILAR EXERCISE */}
              {solution.finalAnswer.similarExercise && (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs sm:text-sm">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      <span>Bài tập tương tự để em tự luyện tập:</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSimilarAnswer(!showSimilarAnswer)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                    >
                      {showSimilarAnswer ? 'Ẩn gợi ý' : 'Hiện gợi ý'}
                    </button>
                  </div>

                  <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium leading-relaxed">
                    <FormattedTextWithMath text={solution.finalAnswer.similarExercise} />
                  </div>

                  {showSimilarAnswer && (
                    <div className="mt-2 text-xs bg-indigo-50/70 border border-indigo-100 text-indigo-900 p-2.5 rounded-lg">
                      💡 <em>Gợi ý: Em áp dụng đúng các bước vừa học ở trên để tự giải vào vở nhé!</em>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
