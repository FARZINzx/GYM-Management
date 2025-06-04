// page.tsx
"use client";
import { useState, useEffect } from "react";
import moment from "moment-jalaali";
import Clock from '@/components/Clock';
import Header from "@/components/ui/header";
import toast from "react-hot-toast";

type AttendanceStatus = 'present' | 'absent' | 'leave';
type AttendanceRecord = {
  attendance_id: number;
  employee_id: number;
  attendance_date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: AttendanceStatus;
};

export default function Attendance() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [attendance, setAttendance] = useState<AttendanceRecord | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  moment.loadPersian({ dialect: "persian-modern" });
  const jalaliDate = moment().format('dddd jD jMMMM jYYYY');

  const fetchTodayAttendance = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/attendance/today', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch attendance');
      
      const data = await response.json();
      setAttendance(data.data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttendanceAction = async () => {
    try {
      setIsChecking(true);
      
      if (!attendance) {
        // Check in
        const response = await fetch('/api/attendance/check-in', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        toast.success('ورود با موفقیت ثبت شد');
      } else if (attendance && !attendance.check_out_time) {
        // Check out
        const response = await fetch('/api/attendance/check-out', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        toast.success('خروج با موفقیت ثبت شد');
      } else {
        toast('شما امروز قبلاً ورود و خروج خود را ثبت کرده‌اید');
        return;
      }
      
      await fetchTodayAttendance();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const getButtonState = () => {
    if (!attendance) return { text: 'ورود', color: 'green' };
    if (attendance.check_in_time && !attendance.check_out_time) return { text: 'خروج', color: 'red' };
    return { text: 'ثبت شده', color: 'gray' };
  };

  const buttonState = getButtonState();

  return (
    <main className="min-h-screen bg-[var(--primary)]">
      <div className="max-w-[430px] mx-auto relative">
        <Header type="page" />
        <div className="flex flex-col gap-6 mx-auto px-6">
          <h2 className="text-3xl text-[var(--secondary)] text-center border-b border-[var(--secondary)] pb-2">
            حضور / غیاب
          </h2>
          
          <div className="h-full flex items-center justify-center gap-10 flex-col">
            <div className="flex items-center justify-center gap-1 w-full text-sm text-[var(--secondary)]">
              <p className="pl-1">{jalaliDate}</p>
              <p>-</p>
              <Clock />
            </div>

            <button 
              className={`size-52 bg-secondary rounded-full flex items-center justify-center active:scale-90 duration-300 ${
                isLoading || isChecking ? 'opacity-50' : ''
              }`}
              onClick={handleAttendanceAction}
              disabled={isLoading || isChecking || buttonState.text === 'ثبت شده'}
            >
              <p className={`text-4xl font-semibold text-${buttonState.color}-600`}>
                {isChecking ? 'در حال ثبت...' : buttonState.text}
              </p>
            </button>

            <div className="flex flex-col w-full text-secondary px-10 gap-5">
              <div className="flex items-center justify-between w-full">
                <p>ساعت ورود:</p>
                <p>
                  {attendance?.check_in_time 
                    ? moment(attendance.check_in_time).format('HH:mm') 
                    : 'ثبت نشده است'}
                </p>
              </div>
              <div className="flex items-center justify-between w-full">
                <p>ساعت خروج:</p>
                <p>
                  {attendance?.check_out_time 
                    ? moment(attendance.check_out_time).format('HH:mm') 
                    : 'ثبت نشده است'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}