import React, { useState } from 'react';
import { Search, Users, Sparkles, Filter, Award, Heart, Check, User, ShieldCheck, KeyRound } from 'lucide-react';
import { Student, UserAccount } from '../types';
import { CLASS_INFO } from '../data/mockData';
import { SmartImage } from '../components/SmartImage';
import { toSlugUsername } from '../db/authDatabase';

interface Students54ViewProps {
  students: Student[];
  currentUser: UserAccount;
  onOpenProfile?: () => void;
  onAdminManage?: () => void;
  onUpdateStudentAvatar?: (stt: number, newAvatar: string) => void;
}

export const Students54View: React.FC<Students54ViewProps> = ({
  students,
  currentUser,
  onOpenProfile,
  onAdminManage,
  onUpdateStudentAvatar,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Nam' | 'Nữ'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'cadre' | 'ambassador'>('all');

  const safeStudents = students || [];
  const boysCount = safeStudents.filter((s) => s.gender === 'Nam').length;
  const girlsCount = safeStudents.filter((s) => s.gender === 'Nữ').length;

  const filteredStudents = safeStudents.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.stt.toString() === searchTerm.trim() ||
      s.dob.includes(searchTerm);

    const matchesGender = genderFilter === 'all' || s.gender === genderFilter;

    const matchesRole =
      roleFilter === 'all'
        ? true
        : roleFilter === 'cadre'
        ? Boolean(s.roleInClass)
        : Boolean(s.ambassadorRole);

    return matchesSearch && matchesGender && matchesRole;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Title Card */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="inline-block bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase text-blue-100">
              {CLASS_INFO.school} • LỚP 6A2
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">
              🌟 54 Thành Viên Lớp 6A2
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
              54 học sinh – 54 gia đình – Một tập thể đồng hành. Mỗi thành viên là một mảnh ghép
              đặc biệt tạo nên đại gia đình 6A2 đoàn kết và yêu thương.
            </p>
          </div>

          {/* Stat counters */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur p-3 rounded-2xl border border-white/10">
            <div className="text-center px-3 border-r border-white/20">
              <div className="text-2xl font-black text-amber-300">54</div>
              <div className="text-[11px] text-blue-200">Học sinh</div>
            </div>
            <div className="text-center px-3 border-r border-white/20">
              <div className="text-2xl font-black text-cyan-300">{boysCount}</div>
              <div className="text-[11px] text-blue-200">Nam sinh</div>
            </div>
            <div className="text-center px-3">
              <div className="text-2xl font-black text-pink-300">{girlsCount}</div>
              <div className="text-[11px] text-blue-200">Nữ sinh</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Tìm theo họ tên hoặc số thứ tự STT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Gender filters */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setGenderFilter('all')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                genderFilter === 'all' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả (54)
            </button>
            <button
              onClick={() => setGenderFilter('Nam')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                genderFilter === 'Nam' ? 'bg-white text-cyan-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nam ({boysCount})
            </button>
            <button
              onClick={() => setGenderFilter('Nữ')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                genderFilter === 'Nữ' ? 'bg-white text-pink-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nữ ({girlsCount})
            </button>
          </div>

          {/* Role filters */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">Tất cả chức vụ</option>
            <option value="cadre">Ban Cán sự lớp</option>
            <option value="ambassador">Đại sứ Văn hóa</option>
          </select>
        </div>
      </div>

      {/* Grid of 54 Students */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredStudents.map((s) => {
          const isCurrentActive = currentUser.studentId === s.stt;

          return (
            <div
              key={s.stt}
              className={`bg-white rounded-2xl border transition duration-200 p-4 flex flex-col justify-between hover:shadow-md ${
                isCurrentActive
                  ? 'border-blue-500 ring-2 ring-blue-400/50 bg-blue-50/20'
                  : 'border-slate-200/90'
              }`}
            >
              <div>
                {/* STT Badge & Gender Tag */}
                <div className="flex items-center justify-between mb-3">
                  <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center border border-slate-200">
                    {s.stt}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        s.gender === 'Nữ'
                          ? 'bg-pink-100 text-pink-700 border border-pink-200'
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {s.gender}
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      Kinh
                    </span>
                  </div>
                </div>

                {/* Avatar & Name */}
                <div className="text-center space-y-2">
                  <SmartImage
                    src={s.avatar}
                    alt={s.name}
                    title={`Ảnh đại diện: ${s.name}`}
                    subtitle={`Học sinh STT ${s.stt} • Sinh ngày: ${s.dob} • Lớp 6A2`}
                    onImageChange={(newAvatar) => onUpdateStudentAvatar && onUpdateStudentAvatar(s.stt, newAvatar)}
                    className="w-16 h-16 rounded-full mx-auto object-cover ring-2 ring-slate-100 shadow-xs"
                    roundedClass="rounded-full"
                  />
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                      {s.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Sinh ngày: {s.dob}</p>
                  </div>
                </div>

                {/* Badges for roles */}
                <div className="mt-2.5 flex flex-wrap gap-1 justify-center">
                  {s.roleInClass && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-600" />
                      {s.roleInClass}
                    </span>
                  )}
                  {s.ambassadorRole && (
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Heart className="w-3 h-3 text-purple-600" />
                      {s.ambassadorRole}
                    </span>
                  )}
                </div>

                {/* Interests & Motto */}
                {s.interests && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                    <p className="line-clamp-1">
                      <span className="font-semibold text-slate-500">Sở thích:</span> {s.interests}
                    </p>
                    {s.motto && (
                      <p className="line-clamp-2 italic text-slate-500 text-[10px]">
                        “{s.motto}”
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Account / Action Footer */}
              <div className="mt-4 pt-2.5 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  <span>Tài khoản:</span>
                  <span className="font-mono text-slate-600 font-semibold">@{toSlugUsername(s.name)}</span>
                </div>

                {isCurrentActive ? (
                  <button
                    onClick={onOpenProfile}
                    className="w-full py-1.5 px-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Sửa hồ sơ của tôi</span>
                  </button>
                ) : (currentUser.role === 'admin' || currentUser.role === 'sub_admin') ? (
                  <button
                    onClick={onAdminManage}
                    className="w-full py-1.5 px-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                    <span>Quản trị tài khoản</span>
                  </button>
                ) : (
                  <div className="py-1 px-2 rounded-xl text-center text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-200/60">
                    <span>Thành viên 6A2</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
