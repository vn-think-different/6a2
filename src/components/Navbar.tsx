import React, { useState } from 'react';
import {
  Home,
  GraduationCap,
  Users,
  Heart,
  BookOpen,
  Sparkles,
  UserCheck,
  Camera,
  BarChart3,
  ShieldCheck,
  PlusCircle,
  ChevronDown,
  Bell,
  Search,
  MessageCircleHeart,
  Lock,
  LogOut,
  Settings,
  KeyRound,
  User,
} from 'lucide-react';
import { UserAccount, Student } from '../types';
import { INITIAL_USERS, STUDENTS_54 } from '../data/mockData';
import { SmartImage } from './SmartImage';
import { useImageModal } from '../context/ImageContext';
import { toSlugUsername } from '../db/authDatabase';

interface NavbarProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  onSelectTab?: (tab: string) => void;
  currentUser: UserAccount;
  setCurrentUser?: (user: UserAccount) => void;
  onSelectRole?: (user: UserAccount) => void;
  allPresetUsers?: UserAccount[];
  students?: Student[];
  pendingPostsCount?: number;
  pendingCount?: number;
  openCreatePostModal?: () => void;
  openApprovalModal?: () => void;
  openListeningModal?: () => void;
  openProfileModal?: () => void;
  openAdminAccountsModal?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onSelectTab,
  currentUser,
  setCurrentUser,
  onSelectRole,
  allPresetUsers = INITIAL_USERS,
  students = STUDENTS_54,
  pendingPostsCount,
  pendingCount,
  openCreatePostModal,
  openApprovalModal,
  openListeningModal,
  openProfileModal,
  openAdminAccountsModal,
  onLogout,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { openImageModal, setImage, showToast } = useImageModal();

  const handleTabChange = (tabId: string) => {
    if (setActiveTab) setActiveTab(tabId);
    if (onSelectTab) onSelectTab(tabId);
  };

  const effectivePendingCount = pendingPostsCount ?? pendingCount ?? 0;

  const navItems = [
    { id: 'trang_chu', label: 'Trang chủ', icon: Home, badge: 0 },
    { id: 'goc_co_giao', label: 'Góc cô giáo', icon: GraduationCap, badge: 0 },
    { id: 'thanh_vien', label: '54 thành viên', icon: Users, badge: 54 },
    { id: 'van_hoa_hoc_duong', label: 'Văn hóa học đường', icon: Heart, badge: 0 },
    { id: 'goc_hoc_tap', label: 'Góc học tập', icon: BookOpen, badge: 0 },
    { id: 'hoc_cung_ai', label: 'Học cùng AI', icon: Sparkles, badge: 0 },
    { id: 'dong_hanh_phu_huynh', label: 'Đồng hành PH', icon: UserCheck, badge: 0 },
    { id: 'nhat_ky_vlog', label: 'Nhật ký & Vlog', icon: Camera, badge: 0 },
    { id: 'cung_tien_bo', label: 'Cùng tiến bộ', icon: BarChart3, badge: 0 },
    ...(currentUser.role === 'admin' || currentUser.role === 'sub_admin'
      ? [{ id: 'quan_tri', label: 'Quản trị lớp', icon: ShieldCheck, badge: effectivePendingCount }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      {/* Top Notice Banner: School Name & Slogan */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white text-xs px-3 sm:px-4 py-1.5 font-medium flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase">
            Trường THCS Bình An
          </span>
          <span className="hidden sm:inline text-blue-100">
            Năm học 2026 - 2027 • 54 học sinh – 54 gia đình – Một tập thể đồng hành
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden md:inline italic text-blue-200 text-xs">
            “Lắng nghe để thấu hiểu – Đồng hành để trưởng thành”
          </span>
          <button
            onClick={openListeningModal}
            className="flex items-center gap-1 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold px-2.5 py-0.5 rounded-full text-[11px] transition shadow-xs cursor-pointer"
            title="Gửi thư riêng cho cô giáo chủ nhiệm"
          >
            <MessageCircleHeart className="w-3.5 h-3.5 text-rose-600" />
            <span>Cô muốn lắng nghe em</span>
          </button>
        </div>
      </div>

      {/* Main Header Bar: Brand on Left, Actions on Right */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 flex items-center justify-between h-15 gap-2">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => handleTabChange('trang_chu')}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:scale-105 transition shrink-0">
              6A2
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight tracking-tight flex items-center gap-1.5 whitespace-nowrap">
                <span>KẾT NỐI YÊU THƯƠNG</span>
                <span className="text-rose-500 text-sm">❤️</span>
              </div>
              <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 whitespace-nowrap">
                <span>GVCN: Cô Tuyết Nhi</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="text-blue-600 font-medium">Mạng xã hội lớp học</span>
              </div>
            </div>
          </button>
        </div>

        {/* Right side: Action Buttons & Role Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Create Post Button */}
          <button
            onClick={openCreatePostModal}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition cursor-pointer whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Đăng bài</span>
          </button>

          {/* Pending Approval Button for Admins */}
          {(currentUser.role === 'admin' || currentUser.role === 'sub_admin') && (
            <button
              onClick={openApprovalModal}
              className={`relative flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                effectivePendingCount > 0
                  ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 ring-1 ring-amber-300 animate-pulse'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title="Quản lý phê duyệt bài viết"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="hidden sm:inline">Duyệt bài</span>
              {effectivePendingCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full min-w-4.5 text-center">
                  {effectivePendingCount}
                </span>
              )}
            </button>
          )}

          {/* Admin Management Fast Button */}
          {(currentUser.role === 'admin' || currentUser.role === 'sub_admin') && openAdminAccountsModal && (
            <button
              onClick={openAdminAccountsModal}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer whitespace-nowrap"
              title="Quản trị đăng ký, mật khẩu & thành viên lớp"
            >
              <KeyRound className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="hidden md:inline">Quản trị tài khoản</span>
            </button>
          )}

          {/* User Account Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-full border border-slate-200 transition cursor-pointer focus:outline-none"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-blue-500/40 shrink-0"
              />
              <div className="text-left hidden sm:block max-w-[130px] truncate">
                <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-blue-600 font-semibold truncate leading-tight">
                  {currentUser.badge || currentUser.roleTitle}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                      Đang đăng nhập với vai trò:
                    </p>
                    <div className="flex items-center gap-2.5 mt-2">
                      <SmartImage
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        title={`Ảnh đại diện: ${currentUser.name}`}
                        subtitle={currentUser.roleTitle}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500 shrink-0"
                        roundedClass="rounded-full"
                      />
                      <div className="truncate flex-1">
                        <p className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</p>
                        <p className="text-xs text-blue-600 font-semibold truncate">{currentUser.roleTitle}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 mt-2.5">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          if (openProfileModal) openProfileModal();
                        }}
                        className="flex items-center justify-center gap-1 py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Sửa hồ sơ & Sở thích</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          openImageModal({
                            currentUrl: currentUser.avatar,
                            title: `Ảnh đại diện: ${currentUser.name}`,
                            subtitle: currentUser.roleTitle,
                            canEdit: true,
                            onSave: (newUrl) => {
                              currentUser.avatar = newUrl;
                              setImage(currentUser.avatar, newUrl);
                              showToast(`Đã đổi ảnh đại diện cho ${currentUser.name}`);
                            },
                          });
                        }}
                        className="flex items-center justify-center gap-1 py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Đổi avatar</span>
                      </button>
                    </div>

                    {(currentUser.role === 'admin' || currentUser.role === 'sub_admin') && openAdminAccountsModal && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          openAdminAccountsModal();
                        }}
                        className="mt-1.5 w-full flex items-center justify-center gap-1.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl transition cursor-pointer border border-amber-200"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                        <span>Quản trị tài khoản & thành viên lớp</span>
                      </button>
                    )}
                  </div>

                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        if (openProfileModal) openProfileModal();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                    >
                      <User className="w-4 h-4 text-indigo-600" />
                      <div className="flex-1">
                        <p className="leading-tight">Hồ sơ cá nhân & Sở thích</p>
                        <p className="text-[10px] text-slate-400 font-normal">Cập nhật thông tin, tính cách, châm ngôn</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        if (openProfileModal) openProfileModal();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4 text-amber-600" />
                      <div className="flex-1">
                        <p className="leading-tight">Đổi mật khẩu tài khoản</p>
                        <p className="text-[10px] text-slate-400 font-normal">Đổi mật khẩu từ 123456 sang mật khẩu mới</p>
                      </div>
                    </button>

                    {(currentUser.role === 'admin' || currentUser.role === 'sub_admin') && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          handleTabChange('quan_tri');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        <div className="flex-1">
                          <p className="leading-tight">Trung tâm Quản trị & Phân quyền</p>
                          <p className="text-[10px] text-amber-700 font-normal">Giao diện Tab quản trị: Gán vai trò, duyệt bài, đổi mật khẩu</p>
                        </div>
                      </button>
                    )}

                    <div className="pt-2 mt-1 border-t border-slate-100">
                      {onLogout && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onLogout();
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <LogOut className="w-4 h-4" />
                            <span>Đăng xuất tài khoản</span>
                          </div>
                          <span className="text-[10px] text-rose-400 font-normal">Thoát</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Dedicated Primary Navigation Bar: Beautiful, Spacious, Never Wraps */}
      <div className="border-t border-slate-200/80 bg-white shadow-2xs">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <nav
            className="flex items-center gap-1 sm:gap-1.5 py-1.5 overflow-x-auto scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`relative flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap shrink-0 transition cursor-pointer select-none ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-xs shadow-blue-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                  {item.badge > 0 && (
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 rounded-full shrink-0 ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
