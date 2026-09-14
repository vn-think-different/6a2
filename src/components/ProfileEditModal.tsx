import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Camera,
  Heart,
  Smile,
  Quote,
  Lock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Save,
  KeyRound,
  Shield,
  CloudCheck,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { UserAccount } from '../types';
import {
  updateUserProfile,
  changeUserPassword,
  getStoredUsers,
} from '../db/authDatabase';
import { saveUserToCloud } from '../db/firestoreService';
import { useImageModal, PRESET_LIBRARY } from '../context/ImageContext';

interface ProfileEditModalProps {
  currentUser: UserAccount;
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: (updatedUser: UserAccount) => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onProfileUpdated,
}) => {
  const { showToast, openImageModal } = useImageModal();
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');

  // Form State
  const [name, setName] = useState(currentUser.name);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [interests, setInterests] = useState(currentUser.interests || '');
  const [personality, setPersonality] = useState(currentUser.personality || '');
  const [motto, setMotto] = useState(currentUser.motto || '');
  const [dob, setDob] = useState(currentUser.dob || '');
  const [gender, setGender] = useState<'Nam' | 'Nữ'>(currentUser.gender || 'Nam');
  const [isSaving, setIsSaving] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Sync state whenever modal opens or currentUser changes
  useEffect(() => {
    if (isOpen) {
      setName(currentUser.name);
      setAvatar(currentUser.avatar);
      setInterests(currentUser.interests || '');
      setPersonality(currentUser.personality || '');
      setMotto(currentUser.motto || '');
      setDob(currentUser.dob || '');
      setGender(currentUser.gender || 'Nam');
      setPasswordError(null);
      setPasswordSuccess(null);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // Quick avatar suggestions from library
  const avatarPresets = PRESET_LIBRARY[0]?.images || [];

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updated = updateUserProfile(currentUser.id, {
        name: name.trim(),
        avatar,
        interests: interests.trim(),
        personality: personality.trim(),
        motto: motto.trim(),
        dob: dob.trim(),
        gender,
      });

      if (updated) {
        // Also ensure direct Cloud Firestore write completes
        await saveUserToCloud(updated);
        const { password, ...safeUser } = updated;
        onProfileUpdated(safeUser);
        showToast('Đã lưu và đồng bộ thông tin cá nhân lên Cloud thành công!');
        setIsSaving(false);
        onClose();
      }
    } catch (err) {
      console.warn('Profile save error:', err);
      setIsSaving(false);
      showToast('Đã lưu thông tin vào bộ nhớ tạm');
      onClose();
    }
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (newPassword.length < 4) {
      setPasswordError('Mật khẩu mới phải có ít nhất 4 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu mới và xác nhận mật khẩu không khớp nhau.');
      return;
    }

    const res = changeUserPassword(currentUser.id, currentPassword, newPassword);
    if (res.success) {
      setPasswordSuccess(res.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Đã đổi mật khẩu và đồng bộ lên Cloud thành công!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setPasswordError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scaleIn my-8 text-slate-900 border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-rose-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                Thông Tin Tài Khoản Cá Nhân
              </h3>
              <p className="text-xs text-slate-500">
                Tài khoản: <code className="font-bold text-rose-600">{currentUser.username}</code> ({currentUser.roleTitle})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`pb-2.5 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'info'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Hồ sơ & Sở thích</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('password')}
            className={`pb-2.5 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'password'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Đổi Mật Khẩu</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeTab === 'info' && (
            <form onSubmit={handleSaveInfo} className="space-y-4">
              {/* Avatar section */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="relative group">
                  <img
                    src={avatar}
                    alt={name}
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-rose-200 shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      openImageModal({
                        src: avatar,
                        title: `Thay đổi ảnh đại diện: ${name}`,
                        subtitle: 'Tải ảnh mới từ máy hoặc dán liên kết URL',
                        onSave: (newUrl) => setAvatar(newUrl),
                      })
                    }
                    className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  >
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span className="text-[10px] font-bold">Đổi ảnh</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() =>
                      openImageModal({
                        src: avatar,
                        title: `Thay đổi ảnh đại diện: ${name}`,
                        subtitle: 'Tải ảnh mới từ máy hoặc dán liên kết URL',
                        onSave: (newUrl) => setAvatar(newUrl),
                      })
                    }
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer bg-rose-50 hover:bg-rose-100 px-3 py-1 rounded-lg border border-rose-200 transition"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Tải ảnh từ máy / Đổi link ảnh</span>
                  </button>
                </div>

                {/* Quick Avatar Presets */}
                <div className="mt-3 w-full border-t border-slate-200 pt-3">
                  <p className="text-[11px] font-bold text-slate-500 mb-2 text-center">
                    Hoặc chọn nhanh ảnh mẫu có sẵn:
                  </p>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {avatarPresets.slice(0, 7).map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatar(img.url)}
                        className={`relative w-9 h-9 rounded-full overflow-hidden border-2 transition cursor-pointer transform hover:scale-110 ${
                          avatar === img.url
                            ? 'border-rose-600 ring-2 ring-rose-300 scale-105'
                            : 'border-slate-200 hover:border-rose-400'
                        }`}
                        title={img.label}
                      >
                        <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                        {avatar === img.url && (
                          <div className="absolute inset-0 bg-rose-600/30 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-white drop-shadow" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Real-time Cloud Notice */}
                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CloudCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Ảnh & thông tin sẽ tự động đồng bộ thời gian thực lên Cloud</span>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Họ và tên hiển thị
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 font-medium"
                />
              </div>

              {/* DOB & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Ngày sinh (dd/mm/yyyy)
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      placeholder="VD: 15/08/2015"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Giới tính
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'Nam' | 'Nữ')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 cursor-pointer"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              {/* Interests (Sở thích) */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <label className="text-xs font-bold text-slate-700">
                    Sở thích cá nhân
                  </label>
                </div>
                <input
                  type="text"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="Ví dụ: Đọc sách, Vẽ tranh, Chơi bóng đá, Khoa học vũ trụ..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
              </div>

              {/* Personality (Tính cách) */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Smile className="w-3.5 h-3.5 text-amber-500" />
                  <label className="text-xs font-bold text-slate-700">
                    Tính cách nổi bật & Sở trường
                  </label>
                </div>
                <input
                  type="text"
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  placeholder="Ví dụ: Hòa đồng, vui vẻ, thích giúp đỡ bạn bè, cẩn thận..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
              </div>

              {/* Motto (Châm ngôn sống / Lời hứa) */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Quote className="w-3.5 h-3.5 text-indigo-500" />
                  <label className="text-xs font-bold text-slate-700">
                    Châm ngôn sống / Lời hứa phấn đấu
                  </label>
                </div>
                <textarea
                  rows={2}
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                  placeholder="Ví dụ: Cố gắng mỗi ngày một chút! Đoàn kết cùng tập thể 6A2..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  {isSaving ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>{isSaving ? 'Đang lưu lên Cloud...' : 'Lưu Thay Đổi'}</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <Shield className="w-4 h-4 text-amber-600" />
                  Bảo vệ tài khoản cá nhân
                </p>
                <p>
                  Nếu bạn đang sử dụng mật khẩu mặc định <b>123456</b>, hãy đổi sang mật khẩu riêng để bảo mật tài khoản.
                </p>
              </div>

              {passwordError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu đang dùng (mặc định là 123456)"
                    required
                    className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mật khẩu mới (ít nhất 4 ký tự)"
                    required
                    className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Xác nhận lại mật khẩu mới
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Gõ lại mật khẩu mới"
                    required
                    className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer transition"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Cập Nhật Mật Khẩu</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
