import { StudyDocument, ScheduleEvent, StudentProduct } from '../types';
import { STUDY_DOCUMENTS, SCHEDULE_EVENTS, STUDENT_PRODUCTS } from '../data/mockData';

const STORAGE_STUDY_DOCS_KEY = 'app_6a2_study_documents_v2';
const STORAGE_SCHEDULE_KEY = 'app_6a2_schedule_events_v2';
const STORAGE_PRODUCTS_KEY = 'app_6a2_student_products_v2';

export function getStoredStudyDocuments(): StudyDocument[] {
  try {
    const data = localStorage.getItem(STORAGE_STUDY_DOCS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading study documents from localStorage:', e);
  }

  // Seed with enriched initial study documents
  const enrichedInitials: StudyDocument[] = STUDY_DOCUMENTS.map((doc, idx) => {
    if (idx === 1) {
      return {
        ...doc,
        content: `📖 HƯỚNG DẪN ĐỌC HIỂU & LÀM BÀI:\n\n1. Các em đọc kỹ đoạn trích từ đầu đến "...tôi không dám đứng gần bác Tai nữa".\n2. Chú ý chi tiết miêu tả ngoại hình và hành động thể hiện thói hung hăng của Dế Mèn.\n3. Hãy rút ra 01 bài học sâu sắc nhất về sự khiêm tốn và lòng trắc ẩn đối với người yếu thế.\n\n*Hạn nộp phiếu học tập: Trước 17h00 chiều Thứ 6 tuần này.*`,
        attachmentName: 'Phieu_Hoc_Tap_So_2_Ngu_Van_6.docx',
        attachmentSize: '1.1 MB',
        images: [
          'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1000&auto=format&fit=crop&q=80',
        ],
        likes: 18,
        pinned: true,
      };
    }
    if (idx === 0) {
      return {
        ...doc,
        content: `📐 TRỌNG TÂM ÔN TẬP CHƯƠNG 1:\n\n- Định nghĩa tập hợp, phần tử thuộc / không thuộc.\n- Cách viết tập hợp bằng cách liệt kê hoặc chỉ ra tính chất đặc trưng.\n- Các phép toán: Cộng, trừ, nhân, chia và lũy thừa với số mũ tự nhiên.\n- Các em tải đề cương file PDF đính kèm bên dưới để làm 30 câu hỏi trắc nghiệm tự luyện nhé!`,
        attachmentName: 'De_Cuong_Toan_6_Chuong_1.pdf',
        attachmentSize: '2.4 MB',
        images: [
          'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1000&auto=format&fit=crop&q=80',
        ],
        likes: 25,
        pinned: true,
      };
    }
    return {
      ...doc,
      content: doc.description,
      likes: 12 + idx * 3,
    };
  });

  saveStoredStudyDocuments(enrichedInitials);
  return enrichedInitials;
}

export function saveStoredStudyDocuments(docs: StudyDocument[]): void {
  try {
    localStorage.setItem(STORAGE_STUDY_DOCS_KEY, JSON.stringify(docs));
  } catch (e) {
    console.error('Error saving study documents to localStorage:', e);
  }
}

export function addStudyDocument(doc: StudyDocument): StudyDocument[] {
  const current = getStoredStudyDocuments();
  const updated = [doc, ...current];
  saveStoredStudyDocuments(updated);
  return updated;
}

export function updateStudyDocument(doc: StudyDocument): StudyDocument[] {
  const current = getStoredStudyDocuments();
  const updated = current.map((item) => (item.id === doc.id ? doc : item));
  saveStoredStudyDocuments(updated);
  return updated;
}

export function deleteStudyDocument(id: string): StudyDocument[] {
  const current = getStoredStudyDocuments();
  const updated = current.filter((item) => item.id !== id);
  saveStoredStudyDocuments(updated);
  return updated;
}

export function toggleStudyDocumentLike(id: string): StudyDocument[] {
  const current = getStoredStudyDocuments();
  const updated = current.map((item) => {
    if (item.id === id) {
      return { ...item, likes: (item.likes || 0) + 1 };
    }
    return item;
  });
  saveStoredStudyDocuments(updated);
  return updated;
}

// Schedule events
export function getStoredScheduleEvents(): ScheduleEvent[] {
  try {
    const data = localStorage.getItem(STORAGE_SCHEDULE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading schedule from localStorage:', e);
  }

  const initial = [...SCHEDULE_EVENTS];
  saveStoredScheduleEvents(initial);
  return initial;
}

export function saveStoredScheduleEvents(events: ScheduleEvent[]): void {
  try {
    localStorage.setItem(STORAGE_SCHEDULE_KEY, JSON.stringify(events));
  } catch (e) {
    console.error('Error saving schedule to localStorage:', e);
  }
}

export function addScheduleEvent(event: ScheduleEvent): ScheduleEvent[] {
  const current = getStoredScheduleEvents();
  const updated = [event, ...current];
  saveStoredScheduleEvents(updated);
  return updated;
}

export function deleteScheduleEvent(id: string): ScheduleEvent[] {
  const current = getStoredScheduleEvents();
  const updated = current.filter((item) => item.id !== id);
  saveStoredScheduleEvents(updated);
  return updated;
}
