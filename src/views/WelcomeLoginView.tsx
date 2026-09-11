import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  School,
  Heart,
  HelpCircle,
  Search,
  CheckCircle2,
  AlertCircle,
  Users,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import { authenticateUser, getStoredUsers, toSlugUsername, StoredUser } from '../db/authDatabase';
import { CLASS_INFO } from '../data/mockData';
import { UserAccount } from '../types';

interface WelcomeLoginViewProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const WelcomeLoginView: React.FC<WelcomeLoginViewProps> = ({ onLoginSuccess }) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Quick lookup drawer/modal for students finding their username
  const [showLookupModal, setShowLookupModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const allUsers = getStoredUsers();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!usernameInput.trim()) {
      setErrorMessage('Vui lòng nhập tên đăng nhập (Họ tên viết liền không dấu).');
      return;
    }
    if (!passwordInput.trim()) {
      setErrorMessage('Vui lòng nhập mật khẩu (mặc định ban đầu là 123456).');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = authenticateUser(usernameInput, passwordInput);
      setIsLoading(false);
      if (result.success && result.user) {
        const { password, ...safeUser } = result.user;
        onLoginSuccess(safeUser);
      } else {
        setErrorMessage(result.message || 'Đăng nhập không thành công.');
      }
    }, 300);
  };

  const handleQuickSelect = (user: StoredUser) => {
    setUsernameInput(user.username);
    setPasswordInput(user.password || '123456');
    setErrorMessage(null);
  };

  const filteredLookup = allUsers.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.studentId && u.studentId.toString() === q)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-rose-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-md bg-white/5 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 p-0.5 shadow-md flex items-center justify-center">
            <School className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-[10px] tracking-wider uppercase font-extrabold text-rose-300 block">
              {CLASS_INFO.school}
            </span>
            <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
              {CLASS_INFO.name}
            </h1>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/15 text-xs text-rose-200">
          <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
          <span>Năm học {CLASS_INFO.schoolYear}</span>
        </div>
      </header>

      {/* Main Login Body */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: School & Class Warm Intro */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-rose-200 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Cổng Thông Tin Điện Tử Nội Bộ Lớp 6A2</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Chào mừng bạn về với{' '}
                <span className="bg-gradient-to-r from-rose-400 via-pink-300 to-amber-300 bg-clip-text text-transparent">
                  Mái Nhà 6A2
                </span>
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-lg mx-auto lg:mx-0">
                "{CLASS_INFO.bannerQuote}"
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3 pt-2 max-w-md mx-auto lg:mx-0">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-md text-center">
                <div className="text-2xl font-black text-rose-400">54</div>
                <div className="text-[11px] text-slate-300 font-medium">Học sinh thân yêu</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-md text-center">
                <div className="text-2xl font-black text-amber-300">100%</div>
                <div className="text-[11px] text-slate-300 font-medium">Gắn kết sẻ chia</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-md text-center">
                <div className="text-2xl font-black text-emerald-400">08</div>
                <div className="text-[11px] text-slate-300 font-medium">Chuyên mục lớp</div>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-rose-400/50">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                  alt="GVCN"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-bold text-white">Cô Nguyễn Thị Tuyết Nhi</p>
                <p className="text-slate-400">Giáo viên chủ nhiệm • Quản trị viên hệ thống</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Login Box */}
          <div className="lg:col-span-6">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-white/40">
              <div className="mb-6 text-center">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">Đăng Nhập Thành Viên</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Nhập Họ tên không dấu viết liền để vào hệ thống lớp 6A2
                </p>
              </div>

              {errorMessage && (
                <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <span className="leading-snug">{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Username Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">Tên đăng nhập</label>
                    <button
                      type="button"
                      onClick={() => setShowLookupModal(true)}
                      className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Search className="w-3 h-3" />
                      <span>Tra cứu tên của bạn</span>
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="Ví dụ: nguyenthituyetnhi, doanthienbao..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition text-slate-900"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 pl-1">
                    * Họ tên tiếng Việt viết liền không dấu (VD: Nguyễn Quỳnh Anh ➔ <b>nguyenquynhanh</b>)
                  </p>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">Mật khẩu</label>
                    <span className="text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-md">
                      Mặc định: 123456
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Nhập mật khẩu (123456)"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <GraduationCap className="w-5 h-5" />
                      <span>Đăng Nhập Vào Lớp Học</span>
                    </>
                  )}
                </button>
              </form>

              {/* Quick Sample Selector For Convenience */}
              <div className="mt-6 pt-5 border-t border-slate-200/80">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
                  Bấm để đăng nhập nhanh mẫu:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setUsernameInput('nguyenthituyetnhi');
                      setPasswordInput('123456');
                    }}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-left transition cursor-pointer"
                  >
                    <span className="font-bold block truncate">👑 Cô Tuyết Nhi</span>
                    <span className="text-[10px] text-rose-600">Admin chính (GVCN)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUsernameInput('nguyenquynhanh');
                      setPasswordInput('123456');
                    }}
                    className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-left transition cursor-pointer"
                  >
                    <span className="font-bold block truncate">⭐ Nguyễn Quỳnh Anh</span>
                    <span className="text-[10px] text-indigo-600">Lớp trưởng (Admin phụ)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUsernameInput('phannguyenhaan');
                      setPasswordInput('123456');
                    }}
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-left transition cursor-pointer"
                  >
                    <span className="font-bold block truncate">🎒 Phan Nguyễn Hà An</span>
                    <span className="text-[10px] text-emerald-600">Học sinh STT 01</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUsernameInput('doantrongnam');
                      setPasswordInput('123456');
                    }}
                    className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-left transition cursor-pointer"
                  >
                    <span className="font-bold block truncate">👨‍👩‍👧 Bác Đoàn Trọng Nam</span>
                    <span className="text-[10px] text-amber-600">Phụ huynh học sinh</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 border-t border-white/10 backdrop-blur-md bg-white/5 px-4 py-3 text-center text-xs text-slate-400">
        <p>
          Hệ thống Quản lý & Kết nối Lớp 6A2 • {CLASS_INFO.school} • Tự hào kết nối 54 gia đình & học sinh
        </p>
      </footer>

      {/* Username Quick Lookup Modal */}
      {showLookupModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-scaleIn text-slate-900">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Tra Cứu Tên Đăng Nhập Lớp 6A2
                </h3>
                <p className="text-xs text-slate-500">
                  Tìm tên của bạn để lấy Tên đăng nhập (Họ tên không dấu)
                </p>
              </div>
              <button
                onClick={() => setShowLookupModal(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Search Filter */}
            <div className="p-4 border-b border-slate-100 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nhập tên bạn, số thứ tự STT hoặc chữ cái đầu..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                  autoFocus
                />
              </div>
            </div>

            {/* List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-2 max-h-[50vh]">
              {filteredLookup.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Không tìm thấy thành viên phù hợp với từ khóa "{searchQuery}"
                </div>
              ) : (
                filteredLookup.map((u) => (
                  <div
                    key={u.id}
                    className="p-3 rounded-2xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/40 transition flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{u.name}</span>
                          {u.studentId && (
                            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-600">
                              STT {u.studentId}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>Tên đăng nhập:</span>
                          <code className="bg-slate-100 text-rose-600 px-1.5 py-0.2 rounded font-bold">
                            {u.username}
                          </code>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        handleQuickSelect(u);
                        setShowLookupModal(false);
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
                    >
                      Chọn dùng
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
              Mật khẩu khởi tạo mặc định cho tất cả thành viên là: <b className="text-rose-600">123456</b>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
