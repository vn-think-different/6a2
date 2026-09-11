import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  UserPlus,
  KeyRound,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Users,
  RefreshCw,
  User,
  Heart,
  Smile,
  Shield,
  Calendar,
  Lock,
} from 'lucide-react';
import { UserAccount, UserRole, Student } from '../types';
import {
  getStoredUsers,
  saveStoredUsers,
  adminResetUserPassword,
  adminAddNewMember,
  adminRemoveMember,
  toSlugUsername,
  StoredUser,
} from '../db/authDatabase';
import { useImageModal } from '../context/ImageContext';

interface AdminAccountManagerModalProps {
  currentUser: UserAccount;
  isOpen: boolean;
  onClose: () => void;
  onClassUpdated: () => void;
}

export const AdminAccountManagerModal: React.FC<AdminAccountManagerModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onClassUpdated,
}) => {
  const { showToast } = useImageModal();
  const [usersList, setUsersList] = useState<StoredUser[]>(() => getStoredUsers());
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'sub_admin' | 'parent'>('all');

  // Modal sub-states
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<StoredUser | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('123456');

  // Add Member Form
  const [newName, setNewName] = useState('');
  const [newDob, setNewDob] = useState('');
  const [newGender, setNewGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [newRole, setNewRole] = useState<UserRole>('student');
  const [newRoleTitle, setNewRoleTitle] = useState('Học sinh lớp 6A2');
  const [newInterests, setNewInterests] = useState('');
  const [newPersonality, setNewPersonality] = useState('');
  const [newMotto, setNewMotto] = useState('');
  const [newCustomPass, setNewCustomPass] = useState('123456');

  if (!isOpen) return null;

  const refreshList = () => {
    setUsersList(getStoredUsers());
    onClassUpdated();
  };

  const handleResetPassword = (userId: string, pass: string) => {
    const res = adminResetUserPassword(userId, pass);
    if (res.success) {
      showToast(res.message);
      setSelectedUserForPassword(null);
      refreshList();
    } else {
      alert(res.message);
    }
  };

  const handleRemoveMember = (u: StoredUser) => {
    if (u.role === 'admin') {
      alert('Không thể xóa Quản trị viên chính!');
      return;
    }
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn cho thành viên "${u.name}" rời khỏi lớp và xóa tài khoản đăng nhập này không?`
    );
    if (!confirmed) return;

    const res = adminRemoveMember(u.id);
    if (res.success) {
      showToast(res.message);
      refreshList();
    } else {
      alert(res.message);
    }
  };

  const handleAddNewMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      alert('Vui lòng nhập họ và tên thành viên.');
      return;
    }

    const res = adminAddNewMember({
      name: newName,
      dob: newDob || '01/01/2015',
      gender: newGender,
      role: newRole,
      roleTitle: newRoleTitle,
      interests: newInterests,
      personality: newPersonality,
      motto: newMotto,
      customPassword: newCustomPass,
    });

    if (res.success) {
      showToast(res.message);
      setShowAddModal(false);
      // Reset form
      setNewName('');
      setNewDob('');
      setNewInterests('');
      setNewPersonality('');
      setNewMotto('');
      setNewCustomPass('123456');
      refreshList();
    } else {
      alert(res.message);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.studentId && u.studentId.toString().includes(searchTerm));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const studentsCount = usersList.filter((u) => u.studentId !== undefined).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-scaleIn my-4 sm:my-8 text-slate-900 border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-indigo-50 via-rose-50 to-amber-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base sm:text-lg text-slate-900">
                  Quản Trị Đăng Ký & Tài Khoản Lớp 6A2
                </h2>
                <span className="text-[11px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                  Admin Control
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Được quản lý bởi: <span className="font-bold text-slate-700">{currentUser.name}</span> ({currentUser.roleTitle})
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

        {/* Action & Stats Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo họ tên, username, STT..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="student">Học sinh</option>
              <option value="sub_admin">Ban cán sự / Quản trị phụ</option>
              <option value="parent">Phụ huynh</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-slate-500 font-medium hidden md:inline">
              Sĩ số: <b className="text-indigo-600">{studentsCount}</b> học sinh • Tổng{' '}
              <b className="text-slate-800">{usersList.length}</b> tài khoản
            </span>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm thành viên mới</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-y-auto flex-1 p-3 sm:p-4">
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Thành viên</th>
                    <th className="py-3 px-3">Tên đăng nhập</th>
                    <th className="py-3 px-3">Vai trò</th>
                    <th className="py-3 px-3">Sở thích & Tính cách</th>
                    <th className="py-3 px-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {u.studentId && (
                                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-bold">
                                  #{u.studentId}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {u.dob ? `Sinh: ${u.dob}` : ''} {u.gender ? `• ${u.gender}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <code className="bg-slate-100 text-rose-600 font-bold px-2 py-0.5 rounded text-[11px]">
                            {u.username}
                          </code>
                          {u.isDefaultPassword && (
                            <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded font-semibold">
                              Pass 123456
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            u.role === 'admin'
                              ? 'bg-rose-100 text-rose-800'
                              : u.role === 'sub_admin'
                              ? 'bg-indigo-100 text-indigo-800'
                              : u.role === 'ambassador'
                              ? 'bg-pink-100 text-pink-800'
                              : u.role === 'parent'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.roleTitle}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 max-w-xs truncate text-[11px] text-slate-500">
                        {u.interests && (
                          <div className="truncate">
                            <span className="font-semibold text-slate-700">Sở thích:</span> {u.interests}
                          </div>
                        )}
                        {u.personality && (
                          <div className="truncate text-[10px] text-slate-400">
                            <span className="font-semibold">Tính cách:</span> {u.personality}
                          </div>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUserForPassword(u);
                              setNewPasswordInput('123456');
                            }}
                            title="Đổi / Cấp lại mật khẩu"
                            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition cursor-pointer flex items-center gap-1 font-bold text-[11px]"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Đổi mật khẩu</span>
                          </button>

                          {u.role !== 'admin' && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(u)}
                              title="Cho rời khỏi lớp"
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer flex items-center gap-1 font-bold text-[11px]"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Rời lớp</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Change Password Dialog */}
        {selectedUserForPassword && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl border border-slate-200 animate-scaleIn">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-indigo-700 font-black">
                  <KeyRound className="w-5 h-5" />
                  <span>Cấp Lại / Đổi Mật Khẩu Thành Viên</span>
                </div>
                <button
                  onClick={() => setSelectedUserForPassword(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl mb-4 text-xs space-y-1">
                <p>
                  Thành viên: <b>{selectedUserForPassword.name}</b>
                </p>
                <p>
                  Tên đăng nhập: <code className="text-rose-600 font-bold">{selectedUserForPassword.username}</code>
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nhập mật khẩu mới
                  </label>
                  <input
                    type="text"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500/30 font-medium"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPasswordInput('123456')}
                    className="text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition cursor-pointer"
                  >
                    Reset về mặc định (123456)
                  </button>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedUserForPassword(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleResetPassword(selectedUserForPassword.id, newPasswordInput)
                    }
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Lưu Mật Khẩu
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add New Member Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 p-5 sm:p-6 my-6 animate-scaleIn max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5 text-indigo-700">
                  <UserPlus className="w-5 h-5" />
                  <h3 className="font-black text-base text-slate-900">
                    Thêm Thành Viên Mới Vào Lớp 6A2
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddNewMemberSubmit} className="space-y-3.5 text-xs">
                {/* Name */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Họ và tên thành viên mới *
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ví dụ: Lê Quốc Huy"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                  {newName && (
                    <p className="text-[11px] text-slate-500 mt-1">
                      ➔ Tên đăng nhập tự động: <code className="font-bold text-rose-600">{toSlugUsername(newName)}</code>
                    </p>
                  )}
                </div>

                {/* DOB & Gender */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Ngày sinh</label>
                    <input
                      type="text"
                      value={newDob}
                      onChange={(e) => setNewDob(e.target.value)}
                      placeholder="VD: 15/06/2015"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Giới tính</label>
                    <select
                      value={newGender}
                      onChange={(e) => setNewGender(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs cursor-pointer"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>
                </div>

                {/* Role */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Vai trò hệ thống</label>
                    <select
                      value={newRole}
                      onChange={(e) => {
                        const r = e.target.value as UserRole;
                        setNewRole(r);
                        if (r === 'student') setNewRoleTitle('Học sinh lớp 6A2');
                        if (r === 'sub_admin') setNewRoleTitle('Lớp phó / Quản trị phụ');
                        if (r === 'parent') setNewRoleTitle('Phụ huynh học sinh');
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs cursor-pointer"
                    >
                      <option value="student">Học sinh</option>
                      <option value="sub_admin">Ban cán sự / Quản trị phụ</option>
                      <option value="ambassador">Đại sứ Văn hóa</option>
                      <option value="parent">Phụ huynh</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Chức danh hiển thị</label>
                    <input
                      type="text"
                      value={newRoleTitle}
                      onChange={(e) => setNewRoleTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Mật khẩu đăng nhập ban đầu
                  </label>
                  <input
                    type="text"
                    value={newCustomPass}
                    onChange={(e) => setNewCustomPass(e.target.value)}
                    placeholder="Mặc định là 123456"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                  <span className="text-[10px] text-slate-400">
                    Thành viên có thể tự đổi mật khẩu sau khi đăng nhập.
                  </span>
                </div>

                {/* Interests & Personality */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Sở thích (tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={newInterests}
                    onChange={(e) => setNewInterests(e.target.value)}
                    placeholder="VD: Cầu lông, Đọc sách, Lập trình..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tính cách & Sở trường (tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={newPersonality}
                    onChange={(e) => setNewPersonality(e.target.value)}
                    placeholder="VD: Nhanh nhẹn, hòa đồng, sáng tạo..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    Thêm Vào Lớp Học
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
