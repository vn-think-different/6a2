import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserAccount } from '../types';

export interface ImageModalOptions {
  src?: string;
  currentUrl?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  contextTag?: string;
  canEdit?: boolean;
  onSave?: (newSrc: string) => void;
}

export interface ImageContextType {
  imageOverrides: Record<string, string>;
  getImage: (src?: string) => string;
  openImageModal: (options: ImageModalOptions) => void;
  closeImageModal: () => void;
  setImageOverride: (originalSrc: string, newSrc: string) => void;
  setImage: (originalSrc: string, newSrc: string) => void;
  currentUser: UserAccount;
  canEdit: boolean;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const PRESET_LIBRARY = [
  {
    category: 'Chân dung & Avatar học sinh',
    images: [
      { url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80', label: 'Nữ sinh tươi tắn' },
      { url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80', label: 'Nam sinh năng động' },
      { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80', label: 'Nữ sinh duyên dáng' },
      { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80', label: 'Nam sinh chăm chỉ' },
      { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', label: 'Học sinh tích cực' },
      { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80', label: 'Học sinh gương mẫu' },
      { url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80', label: 'Cô giáo Tuyết Nhi' },
    ],
  },
  {
    category: 'Hoạt động lớp học & Phong trào',
    images: [
      { url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80', label: 'Học nhóm sôi nổi' },
      { url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80', label: 'Giờ học chăm chỉ' },
      { url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80', label: 'Không gian lớp học 6A2' },
      { url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&auto=format&fit=crop&q=80', label: 'Vui chơi gắn kết' },
      { url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&auto=format&fit=crop&q=80', label: 'Thuyết trình tự tin' },
      { url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80', label: 'Tình bạn tuổi học trò' },
    ],
  },
  {
    category: 'STEM & Trải nghiệm khoa học',
    images: [
      { url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80', label: 'Lắp ráp mô hình' },
      { url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80', label: 'Thí nghiệm khoa học' },
      { url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80', label: 'Kỹ sư nhí 6A2' },
      { url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80', label: 'Khám phá vũ trụ' },
    ],
  },
  {
    category: 'Việc tốt & Thi đua hoa điểm 10',
    images: [
      { url: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb7?w=800&auto=format&fit=crop&q=80', label: 'Làm việc tốt giúp bạn' },
      { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80', label: 'Nghệ thuật & Sáng tạo' },
      { url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80', label: 'Sắc màu yêu thương' },
    ],
  },
];

interface ImageProviderProps {
  children: ReactNode;
  currentUser: UserAccount;
}

export const ImageProvider: React.FC<ImageProviderProps> = ({ children, currentUser }) => {
  // Store overrides in localStorage if available
  const [imageOverrides, setImageOverrides] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('6a2_image_overrides');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [modalOptions, setModalOptions] = useState<ImageModalOptions | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Admin check: Cô giáo (admin) or Ban cán sự/Lớp trưởng (sub_admin)
  const canEdit = currentUser.role === 'admin' || currentUser.role === 'sub_admin';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const setImageOverride = (originalSrc: string, newSrc: string) => {
    if (!originalSrc) return;
    setImageOverrides((prev) => {
      const updated = { ...prev, [originalSrc]: newSrc };
      try {
        localStorage.setItem('6a2_image_overrides', JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not save to localStorage:', err);
      }
      return updated;
    });
  };

  const getImage = (src?: string): string => {
    if (!src) return 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&auto=format&fit=crop&q=80';
    return imageOverrides[src] || src;
  };

  const openImageModal = (options: ImageModalOptions) => {
    setModalOptions(options);
  };

  const closeImageModal = () => {
    setModalOptions(null);
  };

  return (
    <ImageContext.Provider
      value={{
        imageOverrides,
        getImage,
        openImageModal,
        closeImageModal,
        setImageOverride,
        setImage: setImageOverride,
        currentUser,
        canEdit,
        toastMessage,
        showToast,
      }}
    >
      {children}
      {modalOptions && (
        <ImageEditorModalInner
          options={modalOptions}
          onClose={closeImageModal}
          canEdit={modalOptions.canEdit !== undefined ? modalOptions.canEdit : canEdit}
          currentUser={currentUser}
          getImage={getImage}
          onSaveSuccess={(newSrc) => {
            if (modalOptions.onSave) {
              modalOptions.onSave(newSrc);
            }
            const targetSrc = modalOptions.src || modalOptions.currentUrl || '';
            if (targetSrc) {
              setImageOverride(targetSrc, newSrc);
            }
            showToast('Đã lưu và cập nhật hình ảnh thành công!');
            closeImageModal();
          }}
        />
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs">
            ✓
          </div>
          <p className="text-xs font-semibold text-slate-100">{toastMessage}</p>
        </div>
      )}
    </ImageContext.Provider>
  );
};

export const useImageModal = () => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error('useImageModal must be used within an ImageProvider');
  }
  return context;
};

// Internal Modal implementation imported from separate file or implemented right below
import { ImageEditorModalInner } from '../components/ImageEditorModal';
