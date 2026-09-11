import React, { useState } from 'react';
import { X, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { ScheduleEvent, UserAccount } from '../types';

interface CreateScheduleEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: ScheduleEvent) => void;
}

export const CreateScheduleEventModal: React.FC<CreateScheduleEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [dayOfWeek, setDayOfWeek] = useState('Thứ 2');
  const [date, setDate] = useState('15/09/2026');
  const [subjectOrEvent, setSubjectOrEvent] = useState('');
  const [type, setType] = useState<ScheduleEvent['type']>('test');
  const [time, setTime] = useState('Tiết 2 (08:00)');
  const [description, setDescription] = useState('');
  const [important, setImportant] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectOrEvent.trim()) {
      alert('Vui lòng nhập tên môn học hoặc nội dung sự kiện/kiểm tra!');
      return;
    }

    const newEvent: ScheduleEvent = {
      id: `evt-${Date.now()}`,
      dayOfWeek,
      date,
      subjectOrEvent: subjectOrEvent.trim(),
      type,
      time,
      description: description.trim() || 'Nhiệm vụ học tập lớp 6A2',
      important,
    };

    onSubmit(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-6 border border-slate-200">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-700 to-indigo-700 text-white">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5" />
            <h2 className="font-extrabold text-base sm:text-lg">
              Thêm Lịch Kiểm Tra & Nhiệm Vụ Tuần
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Thứ</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              >
                {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ngày (dd/mm/yyyy)</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="VD: 15/09/2026"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Môn học / Tiêu đề sự kiện <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={subjectOrEvent}
              onChange={(e) => setSubjectOrEvent(e.target.value)}
              placeholder="VD: Kiểm tra 15 phút Toán học, Nộp bài dự án KHTN..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Thời gian</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="VD: Tiết 3 (09:00)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phân loại</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              >
                <option value="test">Kiểm tra / Đánh giá</option>
                <option value="task">Nhiệm vụ / Bài tập nộp</option>
                <option value="class">Tiết học đặc biệt</option>
                <option value="activity">Hoạt động trải nghiệm</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mô tả & Dặn dò học sinh</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Các em nhớ mang đầy đủ compa, thước kẻ và bút chì..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
            <input
              type="checkbox"
              id="important-check"
              checked={important}
              onChange={(e) => setImportant(e.target.checked)}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
            />
            <label htmlFor="important-check" className="text-xs font-bold text-amber-900 cursor-pointer">
              Đánh dấu là lịch quan trọng cần lưu ý đặc biệt
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Thêm Vào Lịch</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
