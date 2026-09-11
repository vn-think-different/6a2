import React from 'react';
import { Image, Smile, BookOpen, Heart, Megaphone } from 'lucide-react';
import { UserAccount } from '../types';
import { SmartImage } from './SmartImage';

interface CreatePostBoxProps {
  currentUser: UserAccount;
  onClick: () => void;
}

export const CreatePostBox: React.FC<CreatePostBoxProps> = ({ currentUser, onClick }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 mb-4">
      <div className="flex items-center gap-3">
        <SmartImage
          src={currentUser.avatar}
          alt={currentUser.name}
          title={`Ảnh đại diện: ${currentUser.name}`}
          subtitle={currentUser.roleTitle}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
          roundedClass="rounded-full"
        />
        <button
          onClick={onClick}
          className="flex-1 bg-slate-100 hover:bg-slate-200/80 rounded-full px-4 py-2.5 text-left text-xs sm:text-sm text-slate-500 transition cursor-pointer"
        >
          {currentUser.role === 'admin'
            ? 'Cô Tuyết Nhi muốn gửi gắm thông báo hay lời nhắn gì đến lớp 6A2?'
            : `${currentUser.name} ơi, bạn muốn chia sẻ điều gì cùng lớp hôm nay?`}
        </button>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-around text-xs font-medium text-slate-600">
        <button
          onClick={onClick}
          className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
        >
          <Image className="w-4 h-4 text-emerald-500" />
          <span className="hidden sm:inline">Ảnh / Video minh chứng</span>
          <span className="sm:hidden">Ảnh/Video</span>
        </button>

        <button
          onClick={onClick}
          className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
        >
          <Heart className="w-4 h-4 text-rose-500" />
          <span className="hidden sm:inline">Việc tốt / Yêu thương</span>
          <span className="sm:hidden">Việc tốt</span>
        </button>

        <button
          onClick={onClick}
          className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-blue-500" />
          <span className="hidden sm:inline">Sản phẩm học tập</span>
          <span className="sm:hidden">Sản phẩm</span>
        </button>
      </div>
    </div>
  );
};
