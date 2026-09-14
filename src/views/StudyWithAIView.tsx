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
  ChevronUp,
  UserCheck,
  Settings2,
  Cloud,
  Layers,
  Palette,
  Eye,
  Plus,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount, AIExerciseSolution, AISavedExercise } from '../types';
import { MathView, FormattedTextWithMath } from '../components/MathView';
import { SubjectIllustration } from '../components/SubjectIllustration';
import {
  subscribeToSavedExercises,
  saveExerciseToCloud,
  deleteExerciseFromCloud,
  subscribeToStudentRAGProfile,
  saveStudentRAGProfile,
  StudentRAGProfile,
  DEFAULT_RAG_PROFILE
} from '../db/firestoreService';

interface StudyWithAIViewProps {
  currentUser: UserAccount;
}

// Preset Grade 6 curriculum sample exercises for 1-click test
const SAMPLE_EXERCISES = [
  {
    subject: 'Mỹ thuật',
    title: 'Vẽ tranh phong cảnh Sông Núi - 3 mẫu tranh và bố cục',
    prompt: 'Em hãy hướng dẫn vẽ tranh phong cảnh Sông Núi quê hương (cho học sinh lớp 6), cung cấp 2-3 ý tưởng tranh mẫu có bố cục xa gần và từng bước vẽ chi tiết.',
    topic: 'Chủ đề: Vẻ đẹp quê hương - Mỹ thuật 6'
  },
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
  s = s.replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '');

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

  s = s.replace(/\\mathbb\{N\}\^\*/g, ' tập hợp số tự nhiên khác không N sao ');
  s = s.replace(/\\mathbb\{N\}/g, ' tập hợp số tự nhiên N ');
  s = s.replace(/\\mathbb\{Z\}/g, ' tập hợp số nguyên Z ');
  s = s.replace(/\\mathbb\{Q\}/g, ' tập hợp số hữu tỉ Q ');

  s = s.replace(/\\text\{([^}]+)\}/g, ' $1 ');

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

  s = s.replace(/\\text\{cm\}\^3|cm\^3|cm³/g, ' xen-ti-mét khối ');
  s = s.replace(/\\text\{m\}\^3|m\^3|m³/g, ' mét khối ');
  s = s.replace(/\\text\{cm\}\^2|cm\^2|cm²/g, ' xen-ti-mét vuông ');
  s = s.replace(/\\text\{m\}\^2|m\^2|m²/g, ' mét vuông ');
  s = s.replace(/kg\/m\^3|kg\/m³/g, ' ki-lô-gam trên mét khối ');
  s = s.replace(/g\/cm\^3|g\/cm³/g, ' gam trên xen-ti-mét khối ');
  s = s.replace(/°C|\^\\circ\s*C/g, ' độ C ');
  s = s.replace(/°|\^\\circ/g, ' độ ');

  s = s.replace(/\bA\.\s*/g, 'Phương án A: ');
  s = s.replace(/\bB\.\s*/g, 'Phương án B: ');
  s = s.replace(/\bC\.\s*/g, 'Phương án C: ');
  s = s.replace(/\bD\.\s*/g, 'Phương án D: ');

  s = s.replace(/[\{\}\$\\\_\|]/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

const SUBJECTS = [
  'Tất cả môn',
  'Mỹ thuật',
  'Lịch sử & Địa lý',
  'Toán học',
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
  const [activeTabSub, setActiveTabSub] = useState<'solver' | 'saved' | 'rag_profile'>('solver');
  
  // Interactive features & Notebook
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

  // RAG Profile & Memory State
  const [ragProfile, setRagProfile] = useState<StudentRAGProfile>(() => ({
    ...DEFAULT_RAG_PROFILE,
    userId: currentUser.id,
    studentName: currentUser.name,
  }));
  const [newMemoryNote, setNewMemoryNote] = useState<string>('');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  // Step follow-up questioning state
  const [stepAskingIndex, setStepAskingIndex] = useState<number | null>(null);
  const [stepQuestionText, setStepQuestionText] = useState<string>('');
  const [stepAnswers, setStepAnswers] = useState<{ [index: number]: string }>({});
  const [isAnsweringStep, setIsAnsweringStep] = useState<boolean>(false);

  // Speech TTS state
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [speechSpeed, setSpeechSpeed] = useState<number>(0.9);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // 1. Subscribe to Saved Exercises & Cloud Firestore Sync
  useEffect(() => {
    const unsub = subscribeToSavedExercises(
      currentUser.id,
      (cloudExercises) => {
        setSavedExercises(cloudExercises);
        try {
          localStorage.setItem('6a2_saved_ai_exercises', JSON.stringify(cloudExercises));
        } catch {}
      },
      savedExercises
    );
    return () => unsub();
  }, [currentUser.id]);

  // 2. Subscribe to Student RAG Profile
  useEffect(() => {
    const unsub = subscribeToStudentRAGProfile(
      currentUser.id,
      currentUser.name,
      (cloudProfile) => {
        setRagProfile(cloudProfile);
      }
    );
    return () => unsub();
  }, [currentUser.id, currentUser.name]);

  // Load voices for Web Speech API
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

  // Check if current solution is already saved
  useEffect(() => {
    if (!solution) {
      setIsSavedCurrent(false);
      return;
    }
    const currentRes = typeof solution.finalAnswer === 'string'
      ? solution.finalAnswer
      : solution.finalAnswer?.result;

    const exists = savedExercises.some(
      (item) => item.problemSummary === solution.problemSummary && item.finalAnswer?.result === currentRes
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
    setActiveTabSub('solver');
  };

  // Submit to AI with RAG & Personalization
  const handleSolveExercise = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptText.trim() && !selectedImage) {
      setErrorMessage('Vui lòng nhập đề bài hoặc tải ảnh bài tập lên!');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSolution(null);
    setStepAnswers({});
    setStepAskingIndex(null);
    setActiveTabSub('solver');

    setLoadingStage('Đang đọc đề bài và đối chiếu chuẩn SGK lớp 6...');
    const stageTimer1 = setTimeout(() => {
      setLoadingStage(`Đang áp dụng phong cách học "${ragProfile.preferredLearningStyle}" cho ${currentUser.name}...`);
    }, 900);

    const stageTimer2 = setTimeout(() => {
      setLoadingStage('Đang phác thảo sơ đồ minh họa trực quan & từng bước giải...');
    }, 1800);

    try {
      let base64Data: string | undefined = undefined;
      let mimeType: string | undefined = undefined;

      if (selectedImage) {
        const parts = selectedImage.split(';base64,');
        if (parts.length === 2) {
          mimeType = parts[0].replace('data:', '');
          base64Data = parts[1];
        }
      }

      const res = await fetch('/api/ai/solve-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          image: base64Data,
          mimeType,
          subject: selectedSubject !== 'Tất cả môn' ? selectedSubject : undefined,
          studentName: currentUser.name,
          learningStyle: ragProfile.preferredLearningStyle,
          ragMemoryNotes: ragProfile.memoryPoints,
          weakAreas: ragProfile.weakAreas,
          recentTopics: ragProfile.recentTopics,
        }),
      });

      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error(json.error || 'Không thể giải bài tập lúc này.');
      }

      // Format & Normalize Solution
      const rawSol = json.data;
      const normalizedSol: AIExerciseSolution = {
        problemSummary: rawSol.problemSummary || promptText.slice(0, 80) || 'Bài tập lớp 6',
        subject: rawSol.subject || (selectedSubject !== 'Tất cả môn' ? selectedSubject : 'Môn học lớp 6'),
        topic: rawSol.topic || 'Chương trình THCS Lớp 6',
        givenData: Array.isArray(rawSol.givenData) ? rawSol.givenData : ['Đề bài yêu cầu phân tích và giải chi tiết'],
        toFind: rawSol.toFind || 'Yêu cầu cần tìm của bài toán / đề bài',
        keyConcepts: Array.isArray(rawSol.keyConcepts) ? rawSol.keyConcepts : ['Quy tắc và kiến thức trọng tâm SGK lớp 6'],
        steps: Array.isArray(rawSol.steps) ? rawSol.steps : [],
        visualDiagram: rawSol.visualDiagram,
        finalAnswer: typeof rawSol.finalAnswer === 'string'
          ? {
              result: rawSol.finalAnswer,
              conclusion: rawSol.finalAnswer,
              verification: 'Con hãy đối chiếu lại từng bước giải trên nhé!'
            }
          : {
              result: rawSol.finalAnswer?.result || rawSol.finalAnswer?.conclusion || 'Hoàn thành bài giải',
              conclusion: rawSol.finalAnswer?.conclusion || rawSol.finalAnswer?.result || 'Con hãy đối chiếu lại từng bước giải trên nhé!',
              verification: rawSol.finalAnswer?.verification || 'Thử lại bằng cách đối chiếu với đề bài ban đầu.'
            },
        teacherEncouragement: rawSol.teacherEncouragement || `Thầy/Cô rất tự hào về sự chăm chỉ học tập của ${currentUser.name}!`,
        userPrompt: promptText,
        timestamp: new Date().toISOString(),
      };

      setSolution(normalizedSol);

      // Celebrate success with gentle confetti
      try {
        confetti({
          particleCount: 40,
          spread: 55,
          origin: { y: 0.7 },
        });
      } catch {}
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Đã xảy ra lỗi khi kết nối với Gia sư AI. Vui lòng thử lại!');
    } finally {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      setIsLoading(false);
    }
  };

  // Ask AI about a specific step
  const handleAskStep = async (stepIdx: number) => {
    if (!stepQuestionText.trim() || !solution) return;
    const step = solution.steps[stepIdx];
    if (!step) return;

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
          studentName: currentUser.name,
        }),
      });
      const data = await res.json();
      if (data.success && data.answer) {
        setStepAnswers((prev) => ({ ...prev, [stepIdx]: data.answer }));
        setStepQuestionText('');
      }
    } catch (e) {
      console.warn('Error asking step', e);
    } finally {
      setIsAnsweringStep(false);
    }
  };

  // Text-to-Speech Engine
  const speakText = (text: string, id: string, languageOverride?: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Trình duyệt của bạn chưa hỗ trợ tính năng đọc âm thanh!');
      return;
    }

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const isEnglish = languageOverride === 'en-US' || solution?.subject === 'Tiếng Anh';
    const spokenText = isEnglish ? text : sanitizeMathForVietnameseSpeech(text);

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = speechSpeed;
    utterance.pitch = 1.05;

    if (isEnglish) {
      utterance.lang = 'en-US';
      const enVoice = voices.find((v) => v.lang.includes('en') || v.name.includes('US') || v.name.includes('English'));
      if (enVoice) utterance.voice = enVoice;
    } else {
      utterance.lang = 'vi-VN';
      const viVoice = voices.find((v) => v.lang.includes('vi') || v.name.includes('Vietnamese') || v.name.includes('Vietnam'));
      if (viVoice) utterance.voice = viVoice;
    }

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Save or remove from Notebook
  const handleToggleSave = async () => {
    if (!solution) return;

    const currentRes = typeof solution.finalAnswer === 'string'
      ? solution.finalAnswer
      : solution.finalAnswer?.result;

    if (isSavedCurrent) {
      const target = savedExercises.find(
        (item) => item.problemSummary === solution.problemSummary && item.finalAnswer?.result === currentRes
      );
      if (target) {
        const updated = savedExercises.filter((item) => item.id !== target.id);
        setSavedExercises(updated);
        await deleteExerciseFromCloud(target.id);
      }
    } else {
      const newEntry: AISavedExercise = {
        ...solution,
        id: 'sol_' + Date.now(),
        savedAt: new Date().toLocaleDateString('vi-VN'),
      };
      const updated = [newEntry, ...savedExercises];
      setSavedExercises(updated);
      await saveExerciseToCloud(newEntry, currentUser);
    }
  };

  // Copy solution
  const handleCopySolution = () => {
    if (!solution) return;
    const finalRes = typeof solution.finalAnswer === 'string'
      ? solution.finalAnswer
      : solution.finalAnswer?.result;
    const finalConc = typeof solution.finalAnswer === 'string'
      ? solution.finalAnswer
      : solution.finalAnswer?.conclusion;

    const text = `📚 HƯỚNG DẪN BÀI TẬP LỚP 6: ${solution.subject} - ${solution.topic}
Đề bài: ${solution.problemSummary}

🎯 ĐÁP SỐ CHÍNH XÁC:
${finalRes}

📝 LỜI KẾT LUẬN:
${finalConc}

🔍 CÁC BƯỚC GIẢI CHI TIẾT:
${solution.steps.map((s, i) => `${i + 1}. ${s.title}\n   ${s.explanation}`).join('\n\n')}

💡 LỜI ĐỘNG VIÊN:
${solution.teacherEncouragement}`;

    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Add memory point to RAG Profile
  const handleAddMemoryPoint = async () => {
    if (!newMemoryNote.trim()) return;
    const updatedPoints = [...(ragProfile.memoryPoints || []), newMemoryNote.trim()];
    const updatedProfile: StudentRAGProfile = {
      ...ragProfile,
      memoryPoints: updatedPoints,
    };
    setRagProfile(updatedProfile);
    setNewMemoryNote('');
    setIsSavingProfile(true);
    await saveStudentRAGProfile(updatedProfile);
    setIsSavingProfile(false);
  };

  const handleRemoveMemoryPoint = async (idx: number) => {
    const updatedPoints = (ragProfile.memoryPoints || []).filter((_, i) => i !== idx);
    const updatedProfile: StudentRAGProfile = {
      ...ragProfile,
      memoryPoints: updatedPoints,
    };
    setRagProfile(updatedProfile);
    await saveStudentRAGProfile(updatedProfile);
  };

  const handleUpdateLearningStyle = async (style: StudentRAGProfile['preferredLearningStyle']) => {
    const updatedProfile: StudentRAGProfile = {
      ...ragProfile,
      preferredLearningStyle: style,
    };
    setRagProfile(updatedProfile);
    await saveStudentRAGProfile(updatedProfile);
  };

  // Normalized final answer values for current solution
  const currentFinalResult = solution
    ? typeof solution.finalAnswer === 'string'
      ? solution.finalAnswer
      : solution.finalAnswer?.result || solution.finalAnswer?.conclusion || 'Hoàn thành bài tập'
    : '';

  const currentFinalConclusion = solution
    ? typeof solution.finalAnswer === 'string'
      ? solution.finalAnswer
      : solution.finalAnswer?.conclusion || solution.finalAnswer?.result || 'Con hãy đối chiếu lại từng bước giải trên nhé!'
    : '';

  const currentVerification = solution && typeof solution.finalAnswer === 'object'
    ? solution.finalAnswer?.verification
    : null;

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Navigation */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Gia Sư Sư Phạm AI Lớp 6A2
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/40 text-[11px] font-semibold flex items-center gap-1">
                <Cloud className="w-3 h-3" /> Đã kết nối Cloud Firestore
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Học Cùng AI • Cá Nhân Hóa & RAG Sư Phạm
            </h2>

            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
              Chào <strong>{currentUser.name}</strong>! Cô Tuyết Nhi cùng Trợ lý AI sẵn sàng đồng hành giải bài tập, gợi ý tranh mẫu Mỹ thuật, vẽ bản đồ Địa lý và hướng dẫn từng bước chuẩn SGK mới.
            </p>
          </div>

          {/* Sub Tabs: Solver vs Saved Notebook vs RAG Profile */}
          <div className="flex bg-white/15 backdrop-blur-md p-1 rounded-2xl border border-white/20 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTabSub('solver')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTabSub === 'solver'
                  ? 'bg-white text-blue-900 shadow-md'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Brain className="w-4 h-4 text-blue-600" />
              <span>Giải bài mới</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTabSub('rag_profile')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTabSub === 'rag_profile'
                  ? 'bg-white text-blue-900 shadow-md'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <span>Bộ nhớ RAG ({ragProfile.memoryPoints?.length || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTabSub('saved')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTabSub === 'saved'
                  ? 'bg-white text-blue-900 shadow-md'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Bookmark className="w-4 h-4 text-amber-500" />
              <span>Sổ tay ({savedExercises.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          VIEW 1: RAG PERSONALIZATION & KNOWLEDGE PROFILE
          ========================================================= */}
      {activeTabSub === 'rag_profile' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Settings2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Hồ Sơ RAG & Cá Nhân Hóa Gia Sư AI ({currentUser.name})
                </h3>
                <p className="text-xs text-slate-500">
                  AI tự động học theo phong cách tiếp thu và ghi chú học tập riêng của em để giảng bài sát nhất
                </p>
              </div>
            </div>

            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5" /> Đồng bộ Cloud tự động
            </span>
          </div>

          {/* 1. Preferred Learning Style */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
              1. Phong cách tiếp thu yêu thích của {currentUser.name}:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  id: 'Trực quan & Hình ảnh' as const,
                  icon: '🎨',
                  title: 'Trực quan & Hình ảnh',
                  desc: 'Nhiều tranh mẫu, sơ đồ Ven, bản đồ địa lý và bảng màu phối sắc.'
                },
                {
                  id: 'Từng bước sư phạm' as const,
                  icon: '📝',
                  title: 'Từng bước sư phạm',
                  desc: 'Gỡ dần từng lớp bài toán, giải thích công thức và mẹo nhớ SGK.'
                },
                {
                  id: 'Âm thanh & Đọc to' as const,
                  icon: '🔊',
                  title: 'Âm thanh & Đọc to',
                  desc: 'Nghe giọng đọc giáo viên ân cần, phát âm tiếng Anh chuẩn bản xứ.'
                },
                {
                  id: 'Ví dụ thực tế' as const,
                  icon: '🔬',
                  title: 'Ví dụ đời sống',
                  desc: 'Liên hệ thực tế, ví von gần gũi với lứa tuổi 11 - 12 tuổi.'
                }
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => handleUpdateLearningStyle(style.id)}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer space-y-1.5 ${
                    ragProfile.preferredLearningStyle === style.id
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-200'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{style.icon}</span>
                    {ragProfile.preferredLearningStyle === style.id && (
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-xs">{style.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-snug">{style.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 2. RAG Knowledge & Memory Notes */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                2. Bộ nhớ ghi chú & Mẹo học tập RAG của em:
              </label>
              <span className="text-[11px] text-slate-500">
                {ragProfile.memoryPoints?.length || 0} ghi chú đã lưu
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newMemoryNote}
                onChange={(e) => setNewMemoryNote(e.target.value)}
                placeholder="Ví dụ: Em cần cô hướng dẫn kỹ quy tắc xa gần trong vẽ tranh phong cảnh..."
                className="flex-1 text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddMemoryPoint();
                }}
              />
              <button
                type="button"
                onClick={handleAddMemoryPoint}
                disabled={isSavingProfile || !newMemoryNote.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm vào bộ nhớ</span>
              </button>
            </div>

            {/* List of Memory Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
              {(ragProfile.memoryPoints || []).map((point, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-xl flex items-start justify-between gap-2 text-xs text-indigo-950"
                >
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-200 text-indigo-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{point}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMemoryPoint(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded transition cursor-pointer"
                    title="Xóa ghi chú"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              💡 Mỗi khi em hỏi bài, Gia sư AI sẽ tự động đọc các ghi chú trên để cá nhân hóa lời giải cho riêng em.
            </p>
            <button
              type="button"
              onClick={() => setActiveTabSub('solver')}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
            >
              Bắt đầu hỏi bài ➔
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          VIEW 2: SAVED EXERCISES NOTEBOOK
          ========================================================= */}
      {activeTabSub === 'saved' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-amber-600" />
              <h3 className="font-extrabold text-base text-slate-900">
                Sổ Tay Bài Tập Đã Lưu ({savedExercises.length})
              </h3>
            </div>
            <span className="text-xs text-slate-500">Đồng bộ Cloud Firestore</span>
          </div>

          {savedExercises.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Bookmark className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-xs sm:text-sm">Chưa có bài tập nào được lưu vào sổ tay.</p>
              <p className="text-[11px] text-slate-400">
                Khi AI giải xong một bài tập, hãy bấm nút <strong>"Lưu sổ tay"</strong> để ôn tập lại bất kỳ lúc nào nhé!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {savedExercises.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl hover:border-blue-300 transition space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                      {item.subject}
                    </span>
                    <span className="text-[11px] text-slate-400">{item.savedAt}</span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 line-clamp-2">
                    {item.problemSummary}
                  </h4>

                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-950 font-semibold line-clamp-2">
                    Đáp số: {typeof item.finalAnswer === 'string' ? item.finalAnswer : item.finalAnswer?.result}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSolution(item);
                        setActiveTabSub('solver');
                      }}
                      className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Xem lại chi tiết</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        const updated = savedExercises.filter((x) => x.id !== item.id);
                        setSavedExercises(updated);
                        await deleteExerciseFromCloud(item.id);
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      title="Xóa bài tập này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          VIEW 3: MAIN SOLVER WORKSPACE (Input + Detailed Solution)
          ========================================================= */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 ${activeTabSub !== 'solver' ? 'hidden' : ''}`}>
        {/* ======================================================
            COLUMN 1: QUESTION INPUT & SAMPLES (LG: 5 COLS)
            ====================================================== */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            {/* Subject Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-800 flex items-center justify-between">
                <span>Chọn môn học:</span>
                <span className="text-[11px] font-normal text-blue-600">Chuẩn SGK Lớp 6</span>
              </label>

              <div className="flex flex-wrap gap-1.5">
                {SUBJECTS.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSelectedSubject(sub)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      selectedSubject === sub
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {sub === 'Mỹ thuật' ? '🎨 ' : sub === 'Toán học' ? '📐 ' : sub === 'Lịch sử & Địa lý' ? '🗺️ ' : ''}
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Text Area */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-800 flex items-center justify-between">
                <span>Nhập câu hỏi hoặc đề bài tập:</span>
                <button
                  type="button"
                  onClick={clearInput}
                  className="text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Xóa trắng
                </button>
              </label>

              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Nhập đề bài ở đây (Ví dụ: Hướng dẫn vẽ tranh phong cảnh sông núi / Vị trí Hoàng Sa trên bản đồ / Tìm x biết 3*(x-2)+2^3=26...)"
                rows={4}
                className="w-full text-xs sm:text-sm p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* Image Upload Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Hoặc chụp ảnh đề bài / ảnh vẽ nháp:</span>
              </label>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {!selectedImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) processImageFile(e.dataTransfer.files[0]);
                  }}
                  className="p-4 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl text-center cursor-pointer transition bg-slate-50/50 hover:bg-blue-50/20 group"
                >
                  <Upload className="w-5 h-5 mx-auto text-slate-400 group-hover:text-blue-600 mb-1" />
                  <p className="text-xs font-bold text-slate-700">Tải ảnh đề bài lên</p>
                  <p className="text-[11px] text-slate-400">Hỗ trợ JPG, PNG, WEBP tối đa 15MB</p>
                </div>
              ) : (
                <div className="relative p-2 bg-slate-100 rounded-2xl flex items-center gap-3">
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="w-14 h-14 object-cover rounded-xl border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{imageName || 'Ảnh đề bài'}</p>
                    <p className="text-[11px] text-emerald-600 font-semibold">✓ Đã sẵn sàng gửi AI</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setImageName('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSolveExercise}
              disabled={isLoading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Cô giáo AI đang chuẩn bị bài giảng...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Hỏi AI Giải Bài Chi Tiết</span>
                </>
              )}
            </button>
          </div>

          {/* Quick 1-Click Curriculum Samples */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Library className="w-3.5 h-3.5 text-blue-600" />
                Đề bài mẫu kiểm tra 1-chạm (Lớp 6):
              </span>
              <span className="text-[10px] text-slate-400">Bấm để nạp ngay</span>
            </div>

            <div className="space-y-2">
              {SAMPLE_EXERCISES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => loadSample(sample)}
                  className="w-full p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-blue-50/50 hover:border-blue-200 text-left transition cursor-pointer flex items-center justify-between gap-2 group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[9px]">
                        {sample.subject}
                      </span>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-blue-900 truncate">
                        {sample.title}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
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
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-xs space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                <Brain className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800">
                  Không gian học tập và lời giải chi tiết
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                  Em hãy nhập đề bài hoặc bấm chọn một đề bài mẫu ở cột bên trái, 
                  sau đó nhấn <strong>"Hỏi AI Giải Bài Chi Tiết"</strong> để nhận lời giải sư phạm từng bước nhé!
                </p>
              </div>

              {/* 3 Step Guidance */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-lg mx-auto text-xs pt-2">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] mb-2">
                    1
                  </span>
                  <p className="font-bold text-slate-800 mb-0.5">Tóm tắt & Giả thiết</p>
                  <p className="text-slate-500 text-[11px]">Xác định rõ dữ kiện đề bài cho và yêu cầu cần tìm.</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] mb-2">
                    2
                  </span>
                  <p className="font-bold text-slate-800 mb-0.5">Tranh mẫu & Sơ đồ</p>
                  <p className="text-slate-500 text-[11px]">Minh họa trực quan, bố cục 3 lớp và màu sắc.</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] mb-2">
                    3
                  </span>
                  <p className="font-bold text-slate-800 mb-0.5">Đáp số & Lời kết</p>
                  <p className="text-slate-500 text-[11px]">Kết luận rõ ràng và mẹo thử lại để đạt điểm 10.</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading Animation Card */}
          {isLoading && (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-xs space-y-4">
              <div className="inline-block p-4 rounded-full bg-blue-50 text-blue-600 animate-pulse">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Gia sư AI đang chuẩn bị bài giảng cho {currentUser.name}...
                </h3>
                <p className="text-xs text-blue-600 font-semibold mt-1">
                  {loadingStage}
                </p>
              </div>
              <div className="w-48 h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden">
                <div className="w-full h-full bg-blue-600 rounded-full animate-pulse" />
              </div>
            </div>
          )}

          {/* Solution Ready */}
          {solution && !isLoading && (
            <div className="space-y-4">
              {/* Header Bar */}
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
                    <span>{solution.subject === 'Tiếng Anh' ? '🇬🇧 Voice: English (US)' : '🇻🇳 Giọng đọc: Chuẩn SGK mới'}</span>
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
                    <span>{isSavedCurrent ? 'Đã lưu sổ tay' : 'Lưu sổ tay'}</span>
                  </button>
                </div>
              </div>

              {/* 1. HERO ANSWER CARD (Guaranteed formatted results & conclusions) */}
              <div className="bg-emerald-50/90 border border-emerald-300/80 rounded-2xl p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-md">
                    Đáp số & Kết luận cốt lõi (Final Answer)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      speakText(
                        `Đáp số: ${currentFinalResult}. Lời kết luận: ${currentFinalConclusion}`,
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

                {/* The Answer Result */}
                <div className="text-lg sm:text-xl font-black text-emerald-950 my-2 leading-relaxed tracking-normal">
                  <FormattedTextWithMath text={currentFinalResult} />
                </div>

                {/* Conclusion */}
                {currentFinalConclusion && (
                  <div className="text-xs sm:text-sm text-emerald-900 leading-relaxed font-medium bg-white/80 p-3 rounded-xl border border-emerald-200/80 mt-2">
                    <strong className="text-emerald-950 font-bold">Lời kết luận: </strong>
                    <FormattedTextWithMath text={currentFinalConclusion} />
                  </div>
                )}
              </div>

              {/* 2. SUBJECT-SPECIFIC ILLUSTRATION / ARTWORK STUDIO / MAP / VENN */}
              <SubjectIllustration
                subject={solution.subject}
                topic={solution.topic}
                problemText={solution.problemSummary + ' ' + (solution.userPrompt || '')}
                diagram={solution.visualDiagram}
                onSpeakEnglish={(phrase) => speakText(phrase, 'en_phrase', 'en-US')}
              />

              {/* 3. GIVEN DATA & KEY CONCEPTS */}
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

              {/* 4. STEP-BY-STEP PEDAGOGICAL BREAKDOWN */}
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

                        {/* Math Formula Box if available */}
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

              {/* 5. VERIFICATION & TEACHER ENCOURAGEMENT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {currentVerification && (
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs mb-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Cách kiểm tra & thử lại đáp số:</span>
                    </div>
                    <div className="text-xs text-slate-600 leading-relaxed">
                      <FormattedTextWithMath text={currentVerification} />
                    </div>
                  </div>
                )}

                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 shadow-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs mb-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>Lời động viên từ Thầy/Cô Lớp 6A2:</span>
                  </div>
                  <p className="text-xs text-amber-950 leading-relaxed italic">
                    "{solution.teacherEncouragement || `Thầy/Cô luôn tự hào về sự chăm chỉ của ${currentUser.name}!`}"
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
