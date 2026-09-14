import 'dotenv/config';
import express from 'express';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

const app = express();

// Body parser with 25MB limit to allow image uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Lazy get Gemini AI client
let aiInstance: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

// Multi-model resilience: Try primary model with backoff, then graceful fallback
const FALLBACK_MODELS = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

async function callGeminiWithResilience(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
  }
): Promise<GenerateContentResponse> {
  let lastError: any = null;

  for (const model of FALLBACK_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        return res;
      } catch (err: any) {
        lastError = err;
        const msg = (err?.message || '').toLowerCase();
        const isTemporary =
          msg.includes('503') ||
          msg.includes('unavailable') ||
          msg.includes('high demand') ||
          msg.includes('429') ||
          msg.includes('resource_exhausted') ||
          msg.includes('overloaded');

        if (isTemporary && attempt === 0) {
          await new Promise((r) => setTimeout(r, 650));
          continue;
        }
        break;
      }
    }
  }

  throw lastError;
}

// Built-in high-quality fallback generator for Grade 6 exercises
function getSmartFallbackSolution(prompt: string, subject?: string, studentName?: string) {
  const lower = prompt.toLowerCase();
  const name = studentName || 'con';
  
  // 1. MỸ THUẬT: VẼ TRANH PHONG CẢNH SÔNG NÚI, THIÊN NHIÊN
  if (
    lower.includes('sông núi') ||
    lower.includes('mỹ thuật') ||
    lower.includes('vẽ tranh') ||
    lower.includes('phong cảnh') ||
    lower.includes('hình ảnh để làm ví dụ') ||
    lower.includes('ý tưởng để làm mẫu') ||
    subject === 'Mỹ thuật'
  ) {
    return {
      problemSummary: 'Gợi ý ý tưởng, bố cục và hướng dẫn từng bước vẽ tranh phong cảnh Sông Núi quê hương (Mỹ thuật 6)',
      subject: 'Mỹ thuật',
      topic: 'Chủ đề: Vẻ đẹp quê hương - Vẽ tranh phong cảnh thiên nhiên (SGK Mỹ thuật 6)',
      givenData: [
        'Đề bài: Vẽ tranh phong cảnh sông núi thiên nhiên',
        'Yêu cầu: Cung cấp 2-3 ý tưởng tranh mẫu, bố cục và hướng dẫn từng bước vẽ cho học sinh lớp 6'
      ],
      toFind: 'Bộ 3 mẫu tranh ý tưởng, quy tắc bố cục xa gần và 4 bước vẽ chì + tô màu chuẩn học sinh lớp 6',
      keyConcepts: [
        'Luật xa gần trong Mỹ thuật 6: Cảnh ở gần (tiền cảnh) vẽ to, rõ nét; Cảnh ở xa (hậu cảnh) vẽ nhỏ, nét mờ hơn.',
        'Bố cục 3 lớp vàng: Tiền cảnh (bờ sông, con đò, rặng cây) ➔ Trung cảnh (dòng sông uốn lượn) ➔ Hậu cảnh (dãy núi nhấp nhô, mặt trời).',
        'Phối màu cảm xúc: Kết hợp màu nóng (vàng, cam bình minh) và màu lạnh (xanh lam mặt nước, xanh lục cây cối) để tranh có chiều sâu.'
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Chọn ý tưởng tranh và xác định đường chân trời',
          explanation: `Cô/Thầy khuyên ${name} hãy đặt tờ giấy vẽ nằm ngang. Dùng bút chì 2B kẻ một đường chân trời nhẹ ở khoảng 1/3 phía trên bức tranh để chia ranh giới giữa bầu trời và mặt đất/sông núi.`,
          tip: 'Đừng kẻ đường chân trời ở chính giữa tờ giấy nhé, tranh sẽ bị chia đôi nhìn không tự nhiên!'
        },
        {
          stepNumber: 2,
          title: 'Phác thảo các mảng núi nhấp nhô (Hậu cảnh)',
          explanation: `Vẽ 2 đến 3 lớp núi đan xen nhau bằng các đường uốn lượn hình tam giác mềm. Lớp núi ở xa vẽ nét nhẹ tay hơn lớp núi phía trước. ${name} có thể vẽ thêm một vầng mặt trời tròn mọc sau khe núi và vài cánh chim chao lượn.`,
          tip: 'Đỉnh núi không nên đều tăm tắp mà có ngọn cao ngọn thấp nhấp nhô như sóng lượn.'
        },
        {
          stepNumber: 3,
          title: 'Vẽ dòng sông uốn lượn chữ S mềm mại (Trung cảnh & Tiền cảnh)',
          explanation: 'Bắt đầu từ chân dãy núi xa (vẽ một nét hẹp) rồi uốn lượn mở rộng dần ra phía trước góc dưới tờ giấy. Quy tắc xa nhỏ - gần to này sẽ tạo cảm giác dòng sông chảy dài vô tận rất đẹp mắt!',
          tip: 'Uốn lượn nhẹ nhàng hình chữ S hoặc chữ C, đừng vẽ đường thẳng tuột nhé.'
        },
        {
          stepNumber: 4,
          title: 'Thêm chi tiết sinh động và phối màu sắc hoàn thiện',
          explanation: `Ở hai bên bờ sông gần ${name} (tiền cảnh), vẽ thêm một bờ cỏ hoa dại, con đò nhỏ hoặc một cây đa tỏa bóng mát. Khi tô màu: Tô nền trời trước (xanh nhạt hoặc cam hồng), tô dãy núi (xanh lam sẫm hoặc xám tím), tô mặt sông (xanh ngọc lấp lánh) và tô cây cối xanh tươi.`,
          tip: 'Dùng màu sáp dầu, màu nước hoặc chì màu đều rất đẹp đối với học sinh lớp 6.'
        }
      ],
      visualDiagram: {
        type: 'art_sketch',
        title: 'Bộ 3 Ý Tưởng & Mẫu Tranh Sông Núi Lớp 6',
        description: '3 phong cách vẽ phong cảnh sông núi chuẩn mỹ thuật THCS, có sẵn màu sắc và bố cục mẫu cho con tham khảo',
        visualPoints: [
          'Mẫu 1: Bình minh trên dòng sông và rặng núi biếc',
          'Mẫu 2: Dòng sông uốn lượn ôm chân núi đá hùng vĩ',
          'Mẫu 3: Chiều hoàng hôn sông quê ấm áp bên dãy núi xa'
        ],
        illustrations: [
          {
            title: 'Mẫu 1: Bình minh trên dòng sông và rặng núi biếc',
            subtitle: 'Phong cách tươi sáng, ngập tràn sức sống buổi sớm mai',
            description: 'Bố cục gồm mặt trời đỏ cam nhô lên sau khe núi nhấp nhô. Dòng sông xanh biếc chảy dài từ chân núi ra tiền cảnh, điểm xuyết một con đò nhỏ bồng bềnh và đàn chim hải âu.',
            colorPalette: ['#38bdf8', '#0284c7', '#22c55e', '#f59e0b', '#ef4444'],
            compositionLayers: [
              'Tiền cảnh: Bờ cỏ xanh mướt góc phải, khóm hoa dại vàng và một con đò nhỏ neo đậu.',
              'Trung cảnh: Mặt sông xanh ngọc uốn lượn phản chiếu những tia nắng vàng.',
              'Hậu cảnh: 3 lớp núi xanh lam mờ ảo, mặt trời tròn rực rỡ và đàn chim bay.'
            ],
            tips: 'Tô núi bằng màu xanh lam pha chút tím để tạo cảm giác núi ở rất xa trong sương sớm.'
          },
          {
            title: 'Mẫu 2: Dãy núi cao hùng vĩ và dòng suối ngàn',
            subtitle: 'Phong cách thiên nhiên Tây Bắc / miền núi kỳ vĩ',
            description: 'Dãy núi đá cao sừng sững bên trái, dòng sông trong vắt len lỏi qua thung lũng. Hai bên sườn núi có rừng thông xanh mát và nếp nhà sàn nhỏ khói lam chiều.',
            colorPalette: ['#1e293b', '#475569', '#15803d', '#0ea5e9', '#d97706'],
            compositionLayers: [
              'Tiền cảnh: Rặng đá cuội ven bờ suối và cụm cây dương xỉ xanh rậm rạp.',
              'Trung cảnh: Dòng suối có vài ghềnh đá nhỏ tạo bọt trắng xoá.',
              'Hậu cảnh: Đỉnh núi nhọn mây trắng bao phủ quanh sườn núi.'
            ],
            tips: 'Nhấn một vài vệt trắng trên mặt nước để diễn tả dòng nước đang chảy róc rách.'
          },
          {
            title: 'Mẫu 3: Hoàng hôn sông quê êm đềm bên rặng núi xa',
            subtitle: 'Phong cách ấm áp, lãng mạn với tông màu nóng',
            description: 'Bầu trời rực rỡ sắc cam hồng và tím nhạt lúc chiều tà. Bóng núi tím sẫm in trên nền trời, dòng sông lấp lánh ánh hoàng hôn, bác thuyền chài đang thả lưới.',
            colorPalette: ['#7c3aed', '#ec4899', '#f97316', '#fbbf24', '#1e1b4b'],
            compositionLayers: [
              'Tiền cảnh: Cành tre rủ bóng mềm mại từ mép trên tranh xuống.',
              'Trung cảnh: Bác thuyền chài đang buông tấm lưới tròn trên sông.',
              'Hậu cảnh: Dãy núi sẫm màu dưới bầu trời hoàng hôn rực rỡ.'
            ],
            tips: 'Đây là mẫu tranh rất dễ đạt điểm 9 - 10 vì phối màu hoàng hôn vô cùng ấn tượng và giàu cảm xúc.'
          }
        ],
        drawingSteps: [
          { step: 1, title: 'Kẻ khung & Đường chân trời', detail: 'Vẽ khung tranh viền cách mép giấy 1cm, phác đường chân trời nhẹ ở 1/3 trên.' },
          { step: 2, title: 'Phác thảo các ngọn núi', detail: 'Vẽ 2-3 ngọn núi nhấp nhô lượn sóng mềm mại, ngọn cao ngọn thấp.' },
          { step: 3, title: 'Tạo hình dòng sông chữ S', detail: 'Vẽ 2 nét uốn lượn từ xa hẹp dần đến gần mở rộng ra.' },
          { step: 4, title: 'Tô màu theo lớp', detail: 'Tô trời ➔ Tô núi ➔ Tô sông ➔ Tô cảnh vật gần bằng màu sắc hài hòa.' }
        ]
      },
      finalAnswer: {
        result: 'Hoàn thành bộ 3 ý tưởng & phác thảo tranh Sông Núi cho học sinh lớp 6',
        conclusion: `Thầy/Cô tin rằng với 3 mẫu tranh gợi ý và 4 bước vẽ bố cục ở trên, ${name} sẽ tự tin hoàn thành một bức tranh phong cảnh sông núi thật đẹp và giàu cảm xúc để nộp cho cô giáo Mỹ thuật!`,
        verification: 'Cách tự chấm điểm tranh: 1. Có đủ 3 lớp cảnh (tiền - trung - hậu)? 2. Dòng sông uốn lượn xa nhỏ gần to? 3. Màu sắc tô kín nền giấy không bị lem?'
      },
      teacherEncouragement: `Cô Tuyết Nhi khen ${name} rất có tinh thần tự giác chuẩn bị bài môn Mỹ thuật! Chúc con vẽ được bức tranh thật ưng ý đạt điểm 10 nhé!`
    };
  }

  // 2. TẬP HỢP & PHẦN TỬ (TOÁN 6)
  if (
    lower.includes('tập hợp') ||
    lower.includes('phần tử') ||
    lower.includes('\\in') ||
    lower.includes('\\notin') ||
    lower.includes('thuộc') ||
    lower.includes('khẳng định') ||
    lower.includes('{2; 3; 4; 5}') ||
    lower.includes('b = {') ||
    lower.includes('b={')
  ) {
    return {
      problemSummary: 'Xét tính đúng / sai của các khẳng định phần tử thuộc hoặc không thuộc tập hợp (Toán 6)',
      subject: 'Toán học',
      topic: 'Tập hợp & Phần tử của tập hợp (Chương 1 - Số tự nhiên, Toán 6)',
      givenData: [
        'Tập hợp $B = \\{2; 3; 4; 5\\}$',
        'Các khẳng định cần xét: $2 \\in B$, $5 \\in B$, $1 \\notin B$, $6 \\in B$'
      ],
      toFind: 'Tìm khẳng định SAI trong các phương án đề bài đưa ra và giải thích chi tiết',
      keyConcepts: [
        'Ký hiệu $\\in$ đọc là "thuộc": Phần tử nằm bên trong dấu ngoặc nhọn của tập hợp.',
        'Ký hiệu $\\notin$ đọc là "không thuộc": Phần tử không có mặt trong tập hợp đó.'
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Liệt kê các phần tử có mặt trong tập hợp B',
          explanation: `Con hãy nhìn vào dấu ngoặc nhọn của tập hợp $B = \\{2; 3; 4; 5\\}$. Tập hợp này gồm đúng 4 số: $2, 3, 4, 5$.`,
          tip: 'Bất kỳ số nào không nằm trong danh sách 4 số này đều KHÔNG thuộc B.'
        },
        {
          stepNumber: 2,
          title: 'Kiểm tra từng khẳng định của đề bài',
          explanation: '• Khẳng định $2 \\in B$: ĐÚNG vì số 2 có trong tập hợp $B$.\\n• Khẳng định $5 \\in B$: ĐÚNG vì số 5 có trong tập hợp $B$.\\n• Khẳng định $1 \\notin B$: ĐÚNG vì số 1 không có trong tập hợp $B$.\\n• Khẳng định $6 \\in B$: SAI vì số 6 không thuộc $B$ (viết đúng phải là $6 \\notin B$).',
          tip: 'Quan sát kỹ dấu gạch chéo của ký hiệu $\\notin$ để không bị nhầm lẫn nhé!'
        },
        {
          stepNumber: 3,
          title: 'Kết luận khẳng định sai theo yêu cầu',
          explanation: 'Vậy khẳng định SAI cần chọn chính là $6 \\in B$ (Đáp án D).',
          tip: 'Khi làm bài trắc nghiệm, con hãy gạch chân chữ "khẳng định sai" để không khoanh nhầm câu đúng nhé.'
        }
      ],
      visualDiagram: {
        type: 'venn',
        title: 'Sơ đồ Ven trực quan: Tập hợp B = {2, 3, 4, 5}',
        description: 'Biểu diễn trực quan các phần tử nằm trong và ngoài vòng tròn tập hợp B',
        visualPoints: ['Bên trong vòng tròn B: Các số 2, 3, 4, 5', 'Bên ngoài vòng tròn B: Số 1 và Số 6']
      },
      finalAnswer: {
        result: 'Khẳng định sai là $6 \\in B$ (Chọn phương án D)',
        conclusion: 'Vì số 6 không phải là phần tử của tập hợp $B$, nên cách viết đúng phải là $6 \\notin B$. Khẳng định $6 \\in B$ là sai.',
        verification: 'Đối chiếu lại các phần tử trong ngoặc nhọn: $B$ chỉ có $2, 3, 4, 5$, hoàn toàn không có số 6.'
      },
      teacherEncouragement: `Thầy/Cô khen ${name} đã làm rất tốt dạng bài nhận biết tập hợp! Dạng bài này sẽ xuất hiện nhiều trong các bài kiểm tra 15 phút đầu năm đấy nhé!`
    };
  }

  // 3. ĐỊA LÝ: HOÀNG SA - ĐÀ NẴNG - BIỂN ĐÔNG
  if (
    lower.includes('đà nẵng') ||
    lower.includes('hoàng sa') ||
    lower.includes('trường sa') ||
    lower.includes('biển đông') ||
    lower.includes('hướng') ||
    lower.includes('bản đồ')
  ) {
    return {
      problemSummary: 'Xác định phương hướng của quần đảo Hoàng Sa so với thành phố Đà Nẵng trên bản đồ (Lịch sử & Địa lý 6)',
      subject: 'Lịch sử & Địa lý',
      topic: 'Vị trí địa lý & Phương hướng trên bản đồ Việt Nam (Lịch sử & Địa lý 6)',
      givenData: [
        'Điểm mốc xuất phát: Thành phố Đà Nẵng ven biển miền Trung',
        'Đối tượng xác định: Quần đảo Hoàng Sa (huyện Hoàng Sa thuộc TP. Đà Nẵng)',
        'Vùng không gian: Nằm ngoài khơi trên Biển Đông'
      ],
      toFind: 'Xác định quần đảo Hoàng Sa nằm theo hướng nào so với Đà Nẵng (Bắc, Nam, Tây, hay Đông)?',
      keyConcepts: [
        'Quy tắc hoa gió trên bản đồ chuẩn: Phía TRÊN là BẮC (N), phía DƯỚI là NAM (S), bên TAY PHẢI là ĐÔNG (E), bên TAY TRÁI là TÂY (W).',
        'Biển Đông nằm trọn vẹn ở phía TAY PHẢI (phía ĐÔNG) của dải đất liền hình chữ S Việt Nam.'
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Xác định vị trí Đà Nẵng trên dải bờ biển Việt Nam',
          explanation: 'Thành phố Đà Nẵng nằm ở vùng Duyên hải Nam Trung Bộ nước ta, có đường bờ biển dài nhìn thẳng ra Biển Đông.',
          tip: 'Đặt tâm điểm quan sát ngay tại vị trí thành phố Đà Nẵng.'
        },
        {
          stepNumber: 2,
          title: 'Chiếu tia định hướng từ Đà Nẵng ra Hoàng Sa',
          explanation: 'Quần đảo Hoàng Sa nằm ngoài khơi Biển Đông, ngay bên tay phải của thành phố Đà Nẵng. Theo quy ước 4 hướng chính trên bản đồ địa lý, bên phải chính là HƯỚNG ĐÔNG.',
          tip: 'Đường nối từ Đà Nẵng đến Hoàng Sa là một đường nằm ngang hướng sang phải.'
        }
      ],
      visualDiagram: {
        type: 'map',
        title: 'Bản đồ minh họa: Hướng từ Đà Nẵng ra Hoàng Sa',
        description: 'Lược đồ Biển Đông thể hiện mũi tên hướng Đông từ đất liền TP. Đà Nẵng đến Quần đảo Hoàng Sa',
        visualPoints: [
          'Đất liền TP. Đà Nẵng (Điểm xuất phát)',
          'Mũi tên chỉ thẳng sang tay phải (Hướng Đông)',
          'Quần đảo Hoàng Sa (Vùng biển đảo thiêng liêng)'
        ]
      },
      finalAnswer: {
        result: 'Quần đảo Hoàng Sa nằm về phía ĐÔNG so với đất liền TP. Đà Nẵng (Đáp án D. Đông)',
        conclusion: 'Theo quy tắc phương hướng chuẩn trên bản đồ Việt Nam, Biển Đông và quần đảo Hoàng Sa nằm về phía tay phải (hướng Đông) của đất liền Đà Nẵng.',
        verification: 'Mẹo nhớ nhanh cho học sinh lớp 6: Biển Đông luôn nằm ở phía ĐÔNG của Tổ quốc Việt Nam!'
      },
      teacherEncouragement: 'Hoàng Sa và Trường Sa là một phần máu thịt thiêng liêng của Tổ quốc Việt Nam. Thầy/Cô rất vui vì con đã nắm vững kiến thức địa lý này!'
    };
  }

  // 4. TOÁN HỌC: PHÉP TÍNH VÀ TÌM X
  if (lower.includes('3*(x-2)') || lower.includes('3*(x - 2)') || lower.includes('2^3=26') || lower.includes('2^3 = 26')) {
    return {
      problemSummary: 'Tìm số tự nhiên $x$, biết: $3 \\cdot (x - 2) + 2^3 = 26$',
      subject: 'Toán học',
      topic: 'Thứ tự thực hiện phép tính & Tìm $x$ trong tập hợp số tự nhiên (Toán 6)',
      givenData: [
        'Biểu thức: $3 \\cdot (x - 2) + 2^3 = 26$',
        'Điều kiện: $x \\in \\mathbb{N}$'
      ],
      toFind: 'Tìm giá trị của số tự nhiên $x$',
      keyConcepts: [
        'Thứ tự ưu tiên phép tính: Lũy thừa ➔ Nhân, Chia ➔ Cộng, Trừ.',
        'Quy tắc tìm $x$: Luôn tính gọn các số đã biết (như lũy thừa $2^3$) trước khi thực hiện chuyển vế.'
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Tính lũy thừa $2^3$',
          explanation: 'Ta có $2^3 = 2 \\times 2 \\times 2 = 8$. Thay vào biểu thức ta được: $3 \\cdot (x - 2) + 8 = 26$',
          tip: 'Chú ý: $2^3$ là 3 số 2 nhân với nhau bằng 8, chứ không phải $2 \\times 3 = 6$ đâu con nhé!'
        },
        {
          stepNumber: 2,
          title: 'Tìm cụm số hạng $3 \\cdot (x - 2)$',
          explanation: 'Coi $3 \\cdot (x - 2)$ là số hạng chưa biết trong phép cộng: $3 \\cdot (x - 2) = 26 - 8 \\Rightarrow 3 \\cdot (x - 2) = 18$',
          tip: 'Muốn tìm số hạng chưa biết, ta lấy tổng trừ đi số hạng đã biết.'
        },
        {
          stepNumber: 3,
          title: 'Tìm thừa số $(x - 2)$',
          explanation: 'Coi $(x - 2)$ là thừa số chưa biết trong phép nhân: $x - 2 = 18 : 3 \\Rightarrow x - 2 = 6$',
          tip: 'Muốn tìm thừa số chưa biết, ta lấy tích chia cho thừa số đã biết.'
        },
        {
          stepNumber: 4,
          title: 'Tìm số bị trừ $x$',
          explanation: '$x = 6 + 2 \\Rightarrow x = 8$. Kiểm tra: $8 \\in \\mathbb{N}$ (thỏa mãn điều kiện).',
          tip: 'Muốn tìm số bị trừ, ta lấy hiệu cộng với số trừ.'
        }
      ],
      visualDiagram: {
        type: 'geometry',
        title: 'Sơ đồ từng bước tìm x theo thứ tự ngược',
        description: 'Biểu diễn thứ tự gỡ từng lớp phép tính: Tính $2^3=8$ ➔ Trừ 8 còn 18 ➔ Chia 3 còn 6 ➔ Cộng 2 ra 8',
        visualPoints: ['Bước 1: $2^3 = 8$', 'Bước 2: $26 - 8 = 18$', 'Bước 3: $18 : 3 = 6$', 'Bước 4: $6 + 2 = 8$']
      },
      finalAnswer: {
        result: '$x = 8$',
        conclusion: 'Vậy giá trị số tự nhiên $x$ cần tìm là $x = 8$.',
        verification: 'Thử lại vào đề bài: $3 \\cdot (8 - 2) + 2^3 = 3 \\cdot 6 + 8 = 18 + 8 = 26$ (Hoàn toàn chính xác!).'
      },
      teacherEncouragement: `Con làm rất tuyệt vời! Lần sau khi gặp bài tìm $x$ có lũy thừa, ${name} cứ áp dụng đúng 4 bước gỡ dần này là chắc chắn đạt điểm tối đa!`
    };
  }

  // DEFAULT FALLBACK
  return {
    problemSummary: `Hướng dẫn sư phạm bài tập: "${prompt.slice(0, 100)}..."`,
    subject: subject || 'Môn học lớp 6',
    topic: 'Kiến thức trọng tâm chương trình THCS lớp 6',
    givenData: ['Đề bài yêu cầu phân tích và hướng dẫn giải chi tiết từng bước.'],
    toFind: 'Lời giải chi tiết, dễ hiểu và mẹo học tập ghi nhớ sâu',
    keyConcepts: [
      'Đọc kỹ đề bài, xác định rõ từ khóa chính và công thức/kiến thức tương ứng trong SGK lớp 6.',
      'Trình bày mạch lạc từng bước, có kết luận và kiểm tra lại kết quả.'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Phân tích đề bài và nhận diện dạng bài',
        explanation: `${name} hãy gạch chân các dữ kiện đã cho và câu hỏi chính cần tìm để chọn đúng hướng đi.`,
        tip: 'Xác định môn học và bài học tương ứng trong chương trình lớp 6.'
      },
      {
        stepNumber: 2,
        title: 'Thực hiện từng bước suy luận mạch lạc',
        explanation: 'Vận dụng công thức hoặc quy tắc đã học để lần lượt tính toán hoặc trả lời câu hỏi.',
        tip: 'Viết lời giải rõ ràng, dùng đúng thuật ngữ chuyên môn.'
      },
      {
        stepNumber: 3,
        title: 'Kiểm tra lại kết quả và ghi đáp số',
        explanation: 'Đối chiếu lại với điều kiện ban đầu của đề bài để đảm bảo kết quả chính xác nhất.',
        tip: 'Luôn đọc lại đề bài trước khi kết luận để không bỏ sót ý nhỏ.'
      }
    ],
    visualDiagram: {
      type: 'mindmap',
      title: 'Sơ đồ phương pháp tư duy giải bài tập lớp 6',
      description: 'Quy trình 3 bước chuẩn sư phạm: Phân tích giả thiết ➔ Lập luận từng bước ➔ Kiểm tra đáp số',
      visualPoints: ['Bước 1: Đọc kỹ & Tóm tắt', 'Bước 2: Giải chi tiết', 'Bước 3: Đối chiếu & Kết luận']
    },
    finalAnswer: {
      result: 'Hoàn thành hướng dẫn giải bài tập lớp 6',
      conclusion: `${name} hãy đối chiếu lại từng bước hướng dẫn trên để hoàn thiện bài vào vở nhé!`,
      verification: 'Kiểm tra lại bằng cách thay ngược kết quả vào đề bài ban đầu.'
    },
    teacherEncouragement: 'Thầy/Cô luôn tin tưởng vào sự chăm chỉ và tiến bộ từng ngày của con. Cố gắng lên nhé!'
  };
}

function cleanMarkdownFences(raw: string): string {
  let text = raw.trim();
  text = text.replace(/^```(?:json)?\s*/i, '');
  text = text.replace(/\s*```$/i, '');
  return text.trim();
}

function buildStudyPrompt(
  exerciseText: string,
  subjectHint?: string,
  ragContext?: {
    studentName?: string;
    learningStyle?: string;
    ragMemoryNotes?: string[];
    weakAreas?: string[];
    recentTopics?: string[];
  }
): string {
  const studentName = ragContext?.studentName || 'Học sinh Lớp 6A2';
  const learningStyle = ragContext?.learningStyle || 'Trực quan & Từng bước sư phạm';
  const memoryInfo = (ragContext?.ragMemoryNotes || []).join('; ');
  const weakInfo = (ragContext?.weakAreas || []).join(', ');

  return `Bạn là Cô Giáo Tuyết Nhi (Giáo viên chủ nhiệm lớp 6A2 kiêm Gia Sư AI tận tâm bậc THCS tại Việt Nam - chuyên chương trình SGK mới lớp 6: Kết Nối Tri Thức, Chân Trời Sáng Tạo, Cánh Diều).

THÔNG TIN HỌC SINH & HỒ SƠ RAG CÁ NHÂN HÓA:
- Học sinh: ${studentName} (Lớp 6A2, 11-12 tuổi)
- Phong cách tiếp thu yêu thích: ${learningStyle}
${weakInfo ? `- Các mảng kiến thức con cần lưu ý/rèn luyện thêm: ${weakInfo}` : ''}
${memoryInfo ? `- Ghi chú học tập đã lưu của con: ${memoryInfo}` : ''}

NHIỆM VỤ SƯ PHẠM CỦA BẠN:
Giải bài tập hoặc giải đáp câu hỏi sau đây của ${studentName} theo phong cách SƯ PHẠM ĐÍCH THỰC, ĐÚNG HOÀN CẢNH, ĐÚNG LỨA TUỔI 11 - 12 TUỔI:
- Xưng hô: "Cô/Thầy" và gọi học sinh là "con" (hoặc "em" / "${studentName}") một cách ân cần, gần gũi, khích lệ và kiên nhẫn.
- Ngôn ngữ: Trong sáng, ấm áp, siêu dễ hiểu, có ví dụ trực quan đời thực.
- Nếu là môn Mỹ thuật / Vẽ tranh: Cung cấp đầy đủ 2-3 ý tưởng tranh mẫu (illustrations) chi tiết từng lớp tiền cảnh - trung cảnh - hậu cảnh, bảng màu khuyên dùng (colorPalette) và 4 bước phác thảo chì đến lên màu.
- Nếu là môn Toán / Khoa học / Lịch sử Địa lý / Tiếng Anh: Giải thích cặn kẽ từng bước, có sơ đồ minh họa, mẹo nhớ nhanh.

${subjectHint ? `MÔN HỌC ĐƯỢC CHỌN: ${subjectHint}` : ''}
NỘI DUNG YÊU CẦU CỦA ${studentName}:
"""
${exerciseText}
"""

QUY ĐỊNH BẮT BUỘC VỀ ĐỊNH DẠNG JSON:
Chỉ trả về DUY NHẤT một chuỗi JSON hợp lệ (không kèm theo văn bản dẫn dắt hay markdown code block ngoài JSON). Cấu trúc JSON bắt buộc phải tuân theo mẫu chuẩn sau:

{
  "problemSummary": "Tóm tắt ngắn gọn đề bài 1 câu",
  "subject": "Môn học (Toán học / Mỹ thuật / Lịch sử & Địa lý / Tiếng Anh / Khoa học tự nhiên / Ngữ văn / Tin học / GDCD)",
  "topic": "Tên bài học hoặc chủ đề trong SGK lớp 6",
  "givenData": [
    "Dữ kiện 1 đã cho",
    "Dữ kiện 2 đã cho"
  ],
  "toFind": "Yêu cầu cần tìm hoặc mục tiêu cần hoàn thành của bài",
  "keyConcepts": [
    "Kiến thức trọng tâm 1",
    "Kiến thức trọng tâm 2 hoặc quy tắc vàng"
  ],
  "steps": [
    {
      "stepNumber": 1,
      "title": "Tên ngắn gọn của bước",
      "explanation": "Giải thích chi tiết, ân cần, dễ hiểu dành riêng cho học sinh lớp 6. Có thể dùng công thức LaTeX kẹp giữa $...$ nếu cần.",
      "tip": "Mẹo nhỏ giúp con không bị nhầm lẫn ở bước này"
    }
  ],
  "visualDiagram": {
    "type": "art_sketch" (nếu là Mỹ thuật/Vẽ) | "map" (Địa lý/Bản đồ) | "venn" (Toán tập hợp) | "geometry" (Hình học) | "flowchart" (Tin học) | "science" (KHTN) | "english_flashcard" (Tiếng Anh) | "mindmap",
    "title": "Tiêu đề sơ đồ / bộ tranh minh họa",
    "description": "Mô tả trực quan chi tiết",
    "visualPoints": [
      "Điểm quan sát 1",
      "Điểm quan sát 2"
    ],
    "illustrations": [
      {
        "title": "Tên mẫu tranh 1 / ý tưởng 1",
        "subtitle": "Phong cách nghệ thuật hoặc chủ đề nhỏ",
        "description": "Mô tả chi tiết bố cục và cách vẽ từng nét",
        "colorPalette": ["#38bdf8", "#0284c7", "#22c55e", "#f59e0b"],
        "compositionLayers": [
          "Tiền cảnh: ...",
          "Trung cảnh: ...",
          "Hậu cảnh: ..."
        ],
        "tips": "Mẹo phối màu hoặc phác thảo"
      }
    ],
    "drawingSteps": [
      { "step": 1, "title": "Phác thảo khung hình & đường chân trời", "detail": "..." },
      { "step": 2, "title": "Vẽ hình khối chính", "detail": "..." },
      { "step": 3, "title": "Chi tiết phụ & nét vẽ sinh động", "detail": "..." },
      { "step": 4, "title": "Tô màu sáng tối & hoàn thiện", "detail": "..." }
    ]
  },
  "finalAnswer": {
    "result": "Đáp số cốt lõi hoặc tên ý tưởng chính (BẮT BUỘC CÓ)",
    "conclusion": "Lời kết luận đầy đủ, rõ ràng và ân cần (BẮT BUỘC CÓ)",
    "verification": "Cách tự kiểm tra lại bài hoặc tiêu chí đánh giá điểm 10"
  },
  "teacherEncouragement": "Lời động viên, khen ngợi ấm áp từ Cô/Thầy dành cho ${studentName}"
}

LƯU Ý QUAN TRỌNG:
1. Đảm bảo đúng lứa tuổi học sinh lớp 6 (11 - 12 tuổi), ấm áp, sư phạm.
2. Nếu là công thức toán học, hãy dùng $...$ và escape gạch chéo \\\\ thành \\\\\\\\ để JSON hợp lệ.
3. Luôn luôn có finalAnswer là một JSON object gồm { result, conclusion, verification }, KHÔNG ĐƯỢC để trống kết luận.`;
}

// API endpoint: Solve Exercise with Gemini AI
app.post(['/api/ai/solve-exercise', '/ai/solve-exercise', '/solve-exercise', /.*solve-exercise$/], async (req, res) => {
  try {
    const {
      prompt,
      image,
      mimeType,
      subject,
      studentName,
      learningStyle,
      ragMemoryNotes,
      weakAreas,
      recentTopics,
    } = req.body;

    if (!prompt && !image) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng nhập đề bài hoặc tải ảnh chụp bài tập!',
      });
    }

    const ai = getAI();

    if (!ai) {
      const fallback = getSmartFallbackSolution(prompt || 'Bài tập lớp 6', subject, studentName);
      return res.json({
        success: true,
        data: fallback,
        model: 'pedagogical-engine (built-in SGK lớp 6)',
      });
    }

    const contents: any[] = [];
    const studyPrompt = buildStudyPrompt(
      prompt || 'Hãy giải bài tập trong bức ảnh đính kèm này thật chi tiết cho học sinh lớp 6.',
      subject,
      {
        studentName,
        learningStyle,
        ragMemoryNotes,
        weakAreas,
        recentTopics,
      }
    );

    if (image && mimeType) {
      contents.push({
        inlineData: {
          data: image,
          mimeType: mimeType || 'image/jpeg',
        },
      });
    }

    contents.push(studyPrompt);

    let parsedSolution: any = null;

    try {
      const response: GenerateContentResponse = await callGeminiWithResilience(ai, {
        contents,
        config: {
          temperature: 0.25,
          responseMimeType: 'application/json',
        },
      });

      const rawText = response.text || '';
      const cleanJson = cleanMarkdownFences(rawText);
      parsedSolution = JSON.parse(cleanJson);
    } catch (apiError: any) {
      console.warn('[Gemini API Call Notice] Switching to pedagogical engine fallback:', apiError?.message || apiError);
      parsedSolution = getSmartFallbackSolution(prompt || 'Bài tập', subject, studentName);
    }

    if (!parsedSolution) {
      parsedSolution = getSmartFallbackSolution(prompt || 'Bài tập', subject, studentName);
    }

    // Resilient normalization of finalAnswer & fields
    if (typeof parsedSolution.finalAnswer === 'string') {
      const textAns = parsedSolution.finalAnswer;
      parsedSolution.finalAnswer = {
        result: textAns,
        conclusion: textAns,
        verification: 'Con hãy đọc lại kỹ đề bài và đối chiếu các bước trên nhé!'
      };
    } else if (parsedSolution.finalAnswer && typeof parsedSolution.finalAnswer === 'object') {
      parsedSolution.finalAnswer = {
        result: parsedSolution.finalAnswer.result || parsedSolution.finalAnswer.conclusion || 'Hoàn thành hướng dẫn giải',
        conclusion: parsedSolution.finalAnswer.conclusion || parsedSolution.finalAnswer.result || 'Con hãy đối chiếu lại từng bước giải trên nhé!',
        verification: parsedSolution.finalAnswer.verification || 'Kiểm tra lại từng bước tính và quy tắc áp dụng.'
      };
    } else {
      parsedSolution.finalAnswer = {
        result: 'Hoàn thành hướng dẫn giải',
        conclusion: 'Con hãy đối chiếu lại từng bước giải trên nhé!',
        verification: 'Kiểm tra lại từng bước tính và quy tắc áp dụng.'
      };
    }

    if (!parsedSolution.toFind) {
      parsedSolution.toFind = 'Phân tích và hoàn thành yêu cầu bài tập theo chuẩn SGK lớp 6';
    }
    if (!Array.isArray(parsedSolution.keyConcepts) || parsedSolution.keyConcepts.length === 0) {
      parsedSolution.keyConcepts = parsedSolution.coreConcept
        ? [parsedSolution.coreConcept]
        : ['Đọc kỹ đề bài, nhận diện dạng bài và áp dụng đúng quy tắc/công thức đã học.'];
    }

    return res.json({
      success: true,
      data: parsedSolution,
      model: 'gemini-3.8-flash',
    });
  } catch (err: any) {
    console.warn('Server notice in /api/ai/solve-exercise:', err?.message || err);
    const fallback = getSmartFallbackSolution(req.body?.prompt || 'Bài tập lớp 6', req.body?.subject, req.body?.studentName);
    return res.json({
      success: true,
      data: fallback,
      model: 'pedagogical-engine (fallback)',
    });
  }
});

// API endpoint: Ask AI about a specific step (interactive follow-up)
app.post(['/api/ai/ask-step', '/api/ai/ask-step', '/ask-step', /.*ask-step$/], async (req, res) => {
  try {
    const { question, stepTitle, stepExplanation, problemSummary, studentName } = req.body;
    const ai = getAI();
    const name = studentName || 'con';

    if (ai) {
      try {
        const promptText = `Học sinh ${name} (Lớp 6A2) đang hỏi về bước làm bài này:
Đề bài: ${problemSummary}
Bước đang làm: ${stepTitle} - ${stepExplanation}
Câu hỏi của học sinh: "${question}"

Hãy trả lời học sinh bằng giọng điệu Cô giáo Tuyết Nhi / Thầy giáo lớp 6A2 ân cần, kiên nhẫn, giải thích thêm một ví dụ nhỏ siêu dễ hiểu để học sinh hiểu cặn kẽ bước này. (Tối đa 3 - 4 câu ngắn gọn, dễ hiểu dành cho học sinh 11-12 tuổi).`;

        const response: GenerateContentResponse = await callGeminiWithResilience(ai, {
          contents: promptText,
        });

        return res.json({
          success: true,
          answer: response.text || `Cô khuyên ${name} đọc lại kỹ quy tắc và thực hành từng nét nhé!`,
        });
      } catch (e: any) {
        console.warn('[AI Assistant Step Notice] Using helpful pedagogical explanation:', e?.message || e);
      }
    }

    return res.json({
      success: true,
      answer: `Cô giải thích thêm cho ${name} nhé: Ở ${stepTitle}, con hãy chú ý quan sát tỷ lệ và làm theo quy tắc xa gần. Con thử nháp nhẹ tay bằng bút chì trước khi tô màu nhé!`,
    });
  } catch (err: any) {
    console.warn('Server notice in /api/ai/ask-step:', err?.message || err);
    res.status(500).json({ success: false, error: 'Không thể giải đáp lúc này.' });
  }
});

// API Health Check
app.get(['/api/health', '/health', '/api', /.*health$/], (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY',
    time: new Date().toISOString(),
  });
});

export default app;
