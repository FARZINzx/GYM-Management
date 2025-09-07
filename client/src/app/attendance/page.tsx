// page.tsx
"use client";
import {useState, useEffect, useCallback} from "react";
import moment from "moment-jalaali";
import Clock from '@/components/Clock';
import Header from "@/components/ui/header";
import toast from "react-hot-toast";
//utils
import {getCookie} from "@/action/cookie";

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
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [isChecking, setIsChecking] = useState<boolean>(false);
    const [id, setId] = useState<string>('');

    useEffect(() => {
        const fetchId = async () => {
            const idCookie = await getCookie('id');
            setId(idCookie || '');
        };
        if (!id) {
            fetchId();
        }
    }, [id]);

    moment.loadPersian({dialect: "persian-modern"});
    const jalaliDate = moment().format('dddd jD jMMMM jYYYY');

    const fetchTodayAttendance = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/attendance/today?employee_id=${id}`);

            if (!response.ok) throw new Error('Failed to fetch attendance');

            const data = await response.json();
            setAttendanceRecords(data.data || []);
        } catch (error: any) {
            toast.error(error.message || 'خطایی رخ داده است', {
                style: {
                    background: "red",
                    color: "#fff",
                }
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckIn = async () => {
        try {
            setIsChecking(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/attendance/check-in`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({employee_id: id})
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            toast.success('ورود با موفقیت ثبت شد', {
                style: {
                    background: "#31C440",
                    color: "#fff",
                },
                duration: 2000
            });

            await fetchTodayAttendance();
        } catch (error: any) {
            toast.error(error.message || 'خطایی رخ داده است', {
                style: {
                    background: "red",
                    color: "#fff",
                }
            });
        } finally {
            setIsChecking(false);
        }
    };

    const handleCheckOut = async (recordId?: number) => {
        try {
            setIsChecking(true);
            const body = recordId
                ? JSON.stringify({employee_id: id, record_id: recordId})
                : JSON.stringify({employee_id: id});

            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/attendance/check-out`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: body
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            toast.success('خروج با موفقیت ثبت شد', {
                style: {
                    background: "#31C440",
                    color: "#fff",
                },
                duration: 2000
            });

            await fetchTodayAttendance();
        } catch (error: any) {
            toast.error(error.message || 'خطایی رخ داده است', {
                style: {
                    background: "red",
                    color: "#fff",
                }
            });
        } finally {
            setIsChecking(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchTodayAttendance();
        }
    }, [id]);

    // Check if there are any incomplete check-ins (without check-out)
    const hasIncompleteCheckins = attendanceRecords.some(
        record => record.check_in_time && !record.check_out_time
    );

    // Get the latest incomplete check-in
    const latestIncompleteCheckin = attendanceRecords
        .filter(record => record.check_in_time && !record.check_out_time)
        .sort((a, b) => new Date(b.check_in_time!).getTime() - new Date(a.check_in_time!).getTime())[0];

    const handleAttendanceAction = useCallback(() => {
        if (hasIncompleteCheckins) {
            handleCheckOut(latestIncompleteCheckin?.attendance_id);
        } else {
            handleCheckIn();
        }
    }, [hasIncompleteCheckins, latestIncompleteCheckin, handleCheckOut, handleCheckIn]);

    return (
        <main className="min-h-screen bg-[var(--primary)]">
            <div className="max-w-[430px] mx-auto relative">
                <Header type="page"/>
                <div className="flex flex-col gap-6 mx-auto px-6">
                    <h2 className="text-3xl text-[var(--secondary)] text-center border-b border-[var(--secondary)] pb-2">
                        ثبت تردد
                    </h2>

                    <div className="h-full flex items-center justify-center gap-10 flex-col">
                        <div className="flex items-center justify-center gap-1 w-full text-sm text-[var(--secondary)]">
                            <p className="pl-1">{jalaliDate}</p>
                            <p>-</p>
                            <Clock/>
                        </div>

                        {/* Check-in Button */}
                        <button
                            className={`size-52 bg-secondary rounded-full flex items-center justify-center disabled:active:scale-100 active:scale-90 duration-300 ${isLoading || isChecking ? 'opacity-50' : ''}`}
                            onClick={handleAttendanceAction}
                            disabled={isLoading || isChecking}
                        >
                            <p className={`text-4xl font-semibold ${hasIncompleteCheckins ? 'text-red-600' : 'text-green-600'}`}>
                                {isChecking ? 'در حال ثبت...' : hasIncompleteCheckins ? 'خروج' : 'ورود'}
                            </p>
                        </button>


                        {/* Display all attendance records */}
                        <div className="flex flex-col w-full text-secondary px-10 gap-5">
                            {attendanceRecords.length === 0 ? (
                                <p className="text-center">هیچ رکورد حضورغیابی برای امروز ثبت نشده است</p>
                            ) : (
                                attendanceRecords.map((record, index) => (
                                    <div key={record.attendance_id} className="border-b pb-4">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold">تردد {index + 1}:</p>
                                            {!record.check_out_time && (
                                                <button
                                                    onClick={() => handleCheckOut(record.attendance_id)}
                                                    className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                                                    disabled={isChecking}
                                                >
                                                    ثبت خروج
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <p>ساعت ورود:</p>
                                            <p>
                                                {record.check_in_time
                                                    ? moment(record.check_in_time).format('HH:mm')
                                                    : 'ثبت نشده است'}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <p>ساعت خروج:</p>
                                            <p>
                                                {record.check_out_time
                                                    ? moment(record.check_out_time).format('HH:mm')
                                                    : 'ثبت نشده است'}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <p>وضعیت:</p>
                                            <p>
                                                {record.status === 'present' && 'حاضر'}
                                                {record.status === 'leave' && 'ترک کار'}
                                                {record.status === 'absent' && 'غایب'}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}