import React, { useState } from 'react';
import { Camera, Eye } from 'lucide-react';
import { useImageModal } from '../context/ImageContext';

export interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  description?: string;
  onImageChange?: (newSrc: string) => void;
  showEditBadge?: boolean;
  containerClassName?: string;
  roundedClass?: string;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  title,
  subtitle,
  description,
  onImageChange,
  showEditBadge = true,
  className = '',
  containerClassName = '',
  roundedClass = '',
  ...rest
}) => {
  const { getImage, openImageModal, canEdit } = useImageModal();
  const [hasError, setHasError] = useState(false);

  const resolvedSrc = getImage(src);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openImageModal({
      src,
      title: title || alt || 'Hình ảnh',
      subtitle: subtitle || (canEdit ? 'Nhấn để thay đổi hoặc tải ảnh mới' : 'Ảnh phóng to lớp 6A2'),
      description,
      onSave: onImageChange,
    });
  };

  const fallbackSrc =
    'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&auto=format&fit=crop&q=80';

  return (
    <div
      onClick={handleClick}
      className={`relative group inline-block overflow-hidden cursor-pointer transition select-none ${roundedClass} ${containerClassName}`}
      title={canEdit ? 'Click để xem & thay đổi ảnh này' : 'Click để xem phóng to ảnh này'}
    >
      <img
        src={hasError ? fallbackSrc : resolvedSrc}
        alt={alt}
        onError={() => setHasError(true)}
        className={`${className} transition duration-200 group-hover:brightness-95`}
        {...rest}
      />

      {/* Hover Overlay for Admin */}
      {showEditBadge && canEdit && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 text-slate-900 rounded-full p-1.5 shadow-lg transform scale-90 group-hover:scale-100 transition duration-150 flex items-center gap-1">
            <Camera className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[10px] font-extrabold pr-1 hidden sm:inline">Đổi ảnh</span>
          </div>
        </div>
      )}

      {/* Hover View Badge for Students/Parents */}
      {showEditBadge && !canEdit && (
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 text-slate-800 rounded-full p-1.5 shadow-md">
            <Eye className="w-3.5 h-3.5 text-slate-700" />
          </div>
        </div>
      )}
    </div>
  );
};
