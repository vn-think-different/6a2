import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  UserPlus,
  KeyRound,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Edit,
  Shield,
  Clock,
  Check,
  X,
  FileText,
  BookOpen,
  Settings,
  Download,
  Sparkles,
  Lock,
  User,
  Heart,
  Award,
} from 'lucide-react';
import { UserAccount, UserRole, Student, Post } from '../types';
import {
  getStoredUsers,
  saveStoredUsers,
  adminResetUserPassword,
  adminAddNewMember,
  adminRemoveMember,
  adminUpdateMemberRole,
  StoredUser,
} from '../db/authDatabase';
import { useImageModal } from '../context/ImageContext';

interface AdminManagementViewProps {
  currentUser: UserAccount;
  posts: Post[];
  onApprovePost: (postId: string) => void;
  onRejectPost: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onClassUpdated: () => void;
}

export const AdminManagementView: React.FC<AdminManagementViewProps> = ({
  currentUser,
  posts,
  onApprovePost,
  onRejectPost,
  onDeletePost,
  onClassUpdated,
}) => {
  const { showToast } = useImageModal();
  const [adminTab, setAdminTab] = useState<'members' | 'moderation' | 'backup'>('members');
  const [usersList, setUsersList] = useState<StoredUser[]>(() => getStoredUsers());
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'sub_admin' | 'parent' | 'admin'>('all');

  // Sub-modals inside admin workspace
  const [showAddModal, setShowAddModal] = useState(false);
  const [userForPassword, setUserForPassword] = useState<StoredUser | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('123456');

  // Role editing state
  const [userForRoleEdit, setUserForRoleEdit] = useState<StoredUser | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('student');
  const [editRoleTitle, setEditRoleTitle] = useState('');
  const [editAmbassadorRole, setEditAmbassadorRole] = useState('');

  // Add Member Form
  const [newName, setNewName] = useState('');
  const [newDob, setNewDob] = useState('');
  const [newGender, setNewGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [newRole, setNewRole] = useState<UserRole>('student');
  const [newRoleTitle, setNewRoleTitle] = useState('Học sinh lớp 6A2');
  const [newCustomPass, setNewCustomPass] = useState('123456');

  const pendingPosts = posts.filter((p) => p.status === 'pending');
  const approvedPosts = posts.filter((p) => p.status === 'approved');

  const refreshList = () => {
    setUsersList(getStoredUsers());
    onClassUpdated();
  };

  const roleTitlePresets = [
    'Học sinh lớp 6A2',
    'Lớp trưởng',
    'Lớp phó học tập',
    'Lớp phó phong trào',
    'Lớp phó kỷ luật',
    'Lớp phó lao động',
    'Tổ trưởng Tổ 1',
    'Tổ trưởng Tổ 2',
    'Tổ trưởng Tổ 3',
    'Tổ trưởng Tổ 4',
    'Ban Cán sự lớp 6A2',
    'Đại sứ Văn hóa học đường',
    'Phụ huynh học sinh',
  ];

  const handleOpenRoleEdit = (u: StoredUser) => {
    setUserForRoleEdit(u);
    setEditRole(u.role);
    setEditRoleTitle(u.roleTitle || 'Học sinh lớp 6A2');
    setEditAmbassadorRole('');
  };

  const handleSaveRoleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForRoleEdit) return;

    const res = adminUpdateMemberRole(
      userForRoleEdit.id,
      editRole,
      editRoleTitle.trim(),
      editAmbassadorRole.trim() || undefined
    );

    if (res.success) {
      showToast(res.message);
      setUserForRoleEdit(null);
      refreshList();
    } else {
      alert(res.message);
    }
  };

  const handleResetPassword = (userId: string, pass: string) => {
    const res = adminResetUserPassword(userId, pass);
    if (res.success) {
      showToast(res.message);
      setUserForPassword(null);
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
      `Bạn có chắc chắn muốn cho thành viên "${u.name}" rời khỏi lớp và xóa tài khoản đăng nhập?`
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
      customPassword: newCustomPass,
    });

    if (res.success) {
      showToast(res.message);
      setShowAddModal(false);
      setNewName('');
      setNewDob('');
      setNewCustomPass('123456');
      refreshList();
    } else {
      alert(res.message);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.studentId && u.studentId.toString().includes(searchTerm)) ||
      (u.roleTitle && u.roleTitle.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const studentsCount = usersList.filter((u) => u.studentId !== undefined).length;
  const officersCount = usersList.filter((u) => u.role === 'sub_admin').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Workspace Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500/30 border border-indigo-400/30 px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider text-indigo-200">
                Bảng Điều Khiển Quản Trị Lớp 6A2
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {currentUser.name} ({currentUser.roleTitle})
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              🛡️ TRUNG TÂM QUẢN TRỊ & PHÂN QUYỀN
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Giao diện làm việc tập trung: Gán vai trò (Lớp trưởng, Tổ trưởng, Ban cán sự), quản lý tài khoản đăng nhập, duyệt bài viết và kiểm soát nội dung lớp học.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm Thành Viên Mới</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <p className="text-[11px] text-slate-400 font-medium">Tổng số tài khoản</p>
            <p className="text-xl font-black text-white mt-0.5">{usersList.length}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <p className="text-[11px] text-slate-400 font-medium">Học sinh lớp</p>
            <p className="text-xl font-black text-cyan-300 mt-0.5">{studentsCount} em</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <p className="text-[11px] text-slate-400 font-medium">Ban cán sự / Quản lý phụ</p>
            <p className="text-xl font-black text-amber-300 mt-0.5">{officersCount} bạn</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <p className="text-[11px] text-slate-400 font-medium">Bài viết chờ duyệt</p>
            <p className="text-xl font-black text-rose-300 mt-0.5">{pendingPosts.length} bài</p>
          </div>
        </div>

        {/* Workspace Navigation Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 bg-black/40 p-1.5 rounded-2xl max-w-xl">
          <button
            onClick={() => setAdminTab('members')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
              adminTab === 'members'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Thành viên & Phân quyền ({usersList.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('moderation')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer relative ${
              adminTab === 'moderation'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Kiểm duyệt bài</span>
            {pendingPosts.length > 0 && (
              <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {pendingPosts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminTab('backup')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
              adminTab === 'backup'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Cài đặt & Sao lưu</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Member Management & Role Assignment */}
      {adminTab === 'members' && (
        <div className="space-y-4">
          {/* Filter & Search */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo họ tên, username, vai trò, STT..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-bold shrink-0">Lọc vai trò:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-none"
              >
                <option value="all">Tất cả ({usersList.length})</option>
                <option value="admin">Quản trị viên (GVCN)</option>
                <option value="sub_admin">Ban cán sự lớp</option>
                <option value="student">Học sinh</option>
                <option value="parent">Phụ huynh</option>
              </select>
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Thành viên</th>
                    <th className="py-3 px-4">Tài khoản đăng nhập</th>
                    <th className="py-3 px-4">Vai trò hiện tại</th>
                    <th className="py-3 px-4">Mật khẩu</th>
                    <th className="py-3 px-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      {/* Avatar & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-slate-900 text-sm">{u.name}</span>
                              {u.studentId && (
                                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                  STT {u.studentId}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500">
                              {u.dob ? `Ngày sinh: ${u.dob}` : ''} {u.gender ? `• Giới tính: ${u.gender}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Username */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono bg-slate-100 text-indigo-900 font-bold px-2 py-1 rounded-md text-xs">
                          {u.username}
                        </span>
                      </td>

                      {/* Role & Role Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                              u.role === 'admin'
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : u.role === 'sub_admin'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200 font-black'
                                : u.role === 'parent'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {u.roleTitle || u.role}
                          </span>
                        </div>
                      </td>

                      {/* Password Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 font-mono text-slate-600">
                          <span>{u.password || '123456'}</span>
                          {u.isDefaultPassword && (
                            <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1 rounded">
                              mặc định
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Gán / Chỉnh sửa vai trò */}
                          <button
                            onClick={() => handleOpenRoleEdit(u)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold transition cursor-pointer"
                            title="Gán vai trò & Chức danh trong lớp"
                          >
                            <Shield className="w-3.5 h-3.5" />
                            <span>Gán vai trò</span>
                          </button>

                          {/* Đặt lại mật khẩu */}
                          <button
                            onClick={() => {
                              setUserForPassword(u);
                              setNewPasswordInput('123456');
                            }}
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                            title="Cấp lại mật khẩu"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Xóa thành viên rời lớp */}
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleRemoveMember(u)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Cho rời lớp & Xóa tài khoản"
                            >
                              <Trash2 className="w-4 h-4" />
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
      )}

      {/* Tab 2: Content Moderation */}
      {adminTab === 'moderation' && (
        <div className="space-y-6">
          {/* Pending Posts */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                  <span>Bài viết đang chờ phê duyệt</span>
                  <span className="bg-rose-100 text-rose-800 text-xs px-2.5 py-0.5 rounded-full font-black">
                    {pendingPosts.length} bài
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Các bài viết do học sinh gửi lên cần giáo viên hoặc ban cán sự kiểm duyệt trước khi hiển thị trên Bảng tin chung.
                </p>
              </div>
            </div>

            {pendingPosts.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                <p className="font-bold text-slate-700">Tất cả bài viết đã được phê duyệt!</p>
                <p className="text-xs text-slate-400 mt-0.5">Không có bài viết nào đang chờ xử lý.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={post.authorAvatar}
                          alt={post.authorName}
                          className="w-9 h-9 rounded-xl object-cover"
                        />
                        <div>
                          <p className="font-bold text-xs text-slate-900">{post.authorName}</p>
                          <p className="text-[10px] text-slate-500">
                            {post.authorRoleTitle} • {post.timestamp}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                        {post.categoryLabel || 'Chờ duyệt'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                      {post.content}
                    </p>

                    {post.imageUrl && (
                      <div className="h-40 max-w-sm rounded-xl overflow-hidden border border-slate-200">
                        <img
                          src={post.imageUrl}
                          alt="Đính kèm"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200/60">
                      <button
                        onClick={() => onRejectPost(post.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Từ chối</span>
                      </button>
                      <button
                        onClick={() => onApprovePost(post.id)}
                        className="flex items-center gap-1 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm transition cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Duyệt & Đăng bài</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Approved Posts Management */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">
              Bài viết đã duyệt trên bảng tin ({approvedPosts.length})
            </h3>
            <div className="space-y-3">
              {approvedPosts.slice(0, 8).map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={p.authorAvatar}
                      alt={p.authorName}
                      className="w-8 h-8 rounded-lg object-cover shrink-0"
                    />
                    <div className="overflow-hidden">
                      <p className="font-bold text-slate-900 truncate">
                        {p.authorName}:{' '}
                        <span className="font-normal text-slate-600">{p.content.slice(0, 80)}...</span>
                      </p>
                      <p className="text-[10px] text-slate-400">{p.timestamp}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('Bạn có chắc muốn gỡ bài viết này khỏi bảng tin?')) {
                        onDeletePost(p.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0"
                    title="Xóa bài viết"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Backup & Settings */}
      {adminTab === 'backup' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="font-black text-lg text-slate-900">Sao Lưu & Cài Đặt Dữ Liệu Lớp Học</h3>
            <p className="text-xs text-slate-500 mt-1">
              Quản lý cơ sở dữ liệu học sinh, tài khoản, bài đăng và thiết lập lớp học 6A2.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-3">
              <h4 className="font-extrabold text-sm text-indigo-950">Xuất dữ liệu sao lưu (Backup)</h4>
              <p className="text-xs text-slate-600">
                Tải về toàn bộ danh sách 54 học sinh, tài khoản đăng nhập và bài viết dưới dạng tệp JSON.
              </p>
              <button
                onClick={() => {
                  const data = {
                    users: usersList,
                    exportedAt: new Date().toISOString(),
                    className: '6A2 - THCS Bình An',
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], {
                    type: 'application/json',
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Backup_Lop_6A2_${new Date().toISOString().slice(0, 10)}.json`;
                  a.click();
                  URL.revokeObjectURL(a.href);
                  showToast('Đã xuất tệp sao lưu thành công!');
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Tải tệp sao lưu .JSON</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
              <h4 className="font-extrabold text-sm text-rose-950">Khôi phục mặc định</h4>
              <p className="text-xs text-slate-600">
                Đặt lại toàn bộ tài khoản và bài viết về trạng thái ban đầu của hệ thống.
              </p>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      'CẢNH BÁO: Thao tác này sẽ xóa các thay đổi mới và đưa danh sách tài khoản về mặc định ban đầu. Bạn có muốn tiếp tục?'
                    )
                  ) {
                    localStorage.removeItem('app_6a2_users_v2');
                    localStorage.removeItem('app_6a2_students_v2');
                    localStorage.removeItem('app_6a2_posts_v2');
                    localStorage.removeItem('app_6a2_study_documents_v2');
                    window.location.reload();
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>Khôi phục dữ liệu ban đầu</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Assignment Modal */}
      {userForRoleEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-6 border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-indigo-700 to-blue-700 text-white">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5" />
                <div>
                  <h3 className="font-black text-base">Gán & Chỉnh Sửa Vai Trò Thành Viên</h3>
                  <p className="text-xs text-indigo-100">{userForRoleEdit.name}</p>
                </div>
              </div>
              <button
                onClick={() => setUserForRoleEdit(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRoleEdit} className="p-5 sm:p-6 space-y-4 text-xs">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <img
                  src={userForRoleEdit.avatar}
                  alt={userForRoleEdit.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{userForRoleEdit.name}</h4>
                  <p className="text-slate-500 font-mono">Username: {userForRoleEdit.username}</p>
                  {userForRoleEdit.studentId && (
                    <p className="text-blue-700 font-bold">Học sinh STT: {userForRoleEdit.studentId}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Cấp quyền hệ thống (Quyền hạn kỹ thuật)
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="student">Học sinh thông thường (Xem, tương tác, gửi bài chờ duyệt)</option>
                  <option value="sub_admin">Ban cán sự / Quản lý phụ (Có quyền duyệt bài viết)</option>
                  <option value="ambassador">Đại sứ Văn hóa học đường</option>
                  <option value="parent">Phụ huynh học sinh</option>
                  <option value="admin">Quản trị viên (Toàn quyền quản lý lớp)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Chức danh / Vai trò hiển thị trong lớp
                </label>
                <input
                  type="text"
                  required
                  value={editRoleTitle}
                  onChange={(e) => setEditRoleTitle(e.target.value)}
                  placeholder="VD: Lớp trưởng, Tổ trưởng Tổ 1, Lớp phó học tập..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 py-1 font-semibold">Chọn nhanh:</span>
                  {roleTitlePresets.slice(0, 8).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setEditRoleTitle(preset);
                        if (
                          preset.includes('Lớp trưởng') ||
                          preset.includes('Lớp phó') ||
                          preset.includes('Ban Cán sự')
                        ) {
                          setEditRole('sub_admin');
                        } else if (preset.includes('Đại sứ')) {
                          setEditRole('ambassador');
                        } else if (preset.includes('Phụ huynh')) {
                          setEditRole('parent');
                        }
                      }}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-md text-[11px] font-semibold text-slate-600 transition cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setUserForRoleEdit(null)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black shadow-sm transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Lưu Vai Trò Mới</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {userForPassword && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-sm text-slate-900">Cấp Lại Mật Khẩu</h3>
              </div>
              <button
                onClick={() => setUserForPassword(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Đặt lại mật khẩu cho thành viên: <span className="font-bold text-slate-900">{userForPassword.name}</span>{' '}
              (Username: <span className="font-mono font-bold text-indigo-600">{userForPassword.username}</span>)
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu mới</label>
              <input
                type="text"
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setNewPasswordInput('123456')}
                  className="text-[11px] text-indigo-600 font-bold hover:underline"
                >
                  Đặt mặc định 123456
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setUserForPassword(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={() => handleResetPassword(userForPassword.id, newPasswordInput)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Xác Nhận Đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-6 border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                <h3 className="font-black text-base">Thêm Thành Viên Mới Vào Lớp</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewMemberSubmit} className="p-5 sm:p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="VD: Nguyễn Hoàng Long"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày sinh</label>
                  <input
                    type="text"
                    value={newDob}
                    onChange={(e) => setNewDob(e.target.value)}
                    placeholder="VD: 15/08/2015"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giới tính</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quyền hạn</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="student">Học sinh</option>
                    <option value="sub_admin">Ban cán sự</option>
                    <option value="parent">Phụ huynh</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chức danh</label>
                  <input
                    type="text"
                    value={newRoleTitle}
                    onChange={(e) => setNewRoleTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mật khẩu ban đầu</label>
                <input
                  type="text"
                  value={newCustomPass}
                  onChange={(e) => setNewCustomPass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-sm"
                >
                  Tạo Thành Viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
