"use client";
import {useState, useEffect} from "react";
import {useParams, useRouter} from "next/navigation";
import Header from "@/components/ui/header";
// import { toggleFullScreen } from "@/lib/utils";
import clsx from "clsx";
import toast from "react-hot-toast";
import {PersonnelType} from "@/data/type";
import {getPersonnel} from "@/lib/services";
import {useSelectedPersonnelStore} from "@/zustand/stores/selected-personnel-store";
import {convertToJalali, formatToPersianCurrency} from '@/lib/utils'
import {UserPen, UserRoundX} from "lucide-react";
import ConfirmationDialog from '@/components/ui/ConfirmationDialog'

function GridRow({
                     label,
                     children,
                     isLoading,
                     valueClass,
                 }: {
    label: string;
    children: React.ReactNode;
    isLoading: boolean;
    valueClass?: string;
}) {
    return (
        <div className="w-full grid grid-cols-2 text-sm">
            {/* Label Column */}
            <p className="text-sm text-start">{label}</p>
            {/* Value Column */}
            {isLoading ? (
                <div className="w-full h-4 rounded bg-gray-400 animate-pulse"/>
            ) : (
                <p className={clsx("font-medium w-full text-center", valueClass)}>{children}</p>
            )}
        </div>
    );
}

export default function PersonnelProfile() {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const {id} = useParams();
    const [personnel, setPersonnel] = useState<PersonnelType | null>(null);
    const router = useRouter()
    const {setSelectedPersonnel} = useSelectedPersonnelStore()
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        const fetchPersonnelData = async () => {
            setIsLoading(true);
            try {
                const result = await getPersonnel(id);
                if (result.success) {
                    setPersonnel(result.data);
                } else {
                    toast.error(result.message || "خطایی رخ داده است", {
                        style: {background: "red", color: "#fff"},
                    });
                }
            } catch (e: any) {
                toast.error(e.message || "خطایی رخ داده است", {
                    style: {background: "red", color: "#fff"},
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchPersonnelData();
    }, [id]);

    const handleEdit = (personnel: PersonnelType | null) => {
        if (personnel) {
            setSelectedPersonnel({
                ...personnel,
                role_id: personnel.role_id // Make sure role_id is included
            });
            router.push('/personnel/addPersonnel?edit=true');
        }
    };

    const handleDelete = async (personnel: PersonnelType | null) => {
        if (!personnel) return;

        try {
            const response = await fetch(`http://localhost:3001/api/personnel/${personnel.id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || 'کارمند مورد نظر با موفقیت حذف شد.', {
                    style: {background: "#31C440", color: "#fff"}
                });
                router.push('/personnel');
            } else {
                toast.error(data.message || 'در عملیات مشکلی به وجود آمده', {
                    style: {background: "red", color: "#fff"}
                });
            }
        } catch (error : any) {
            toast.error(error.message || 'خطا در عملیات', {
                style: {background: "red", color: "#fff"}
            });
        }
    };

    const handleDeleteClick = () => {
        setShowConfirm(true);
    };

    const handleConfirmDelete = async () => {
        setShowConfirm(false);
        await handleDelete(personnel); // or personnel
    };

    return <>
        <main className="min-h-screen bg-[var(--primary)]">
            <div className="max-w-[430px] mx-auto relative">
                <Header type="page"/>
                <div className="flex flex-col gap-12 mx-auto px-6">
                    <h2 className="text-3xl text-[var(--secondary)] text-center border-b border-[var(--secondary)] pb-2">
                        پروفایل کاربر
                    </h2>
                    <div className="flex flex-col">
                        <div className="w-full bg-[var(--secondary)] p-3 gap-3 flex flex-col rounded-t-md">
                            <GridRow label="نام و نام خانوادگی :" isLoading={isLoading}>
                                {personnel?.first_name} {personnel?.last_name}
                            </GridRow>

                            <GridRow label="شماره تلفن :" isLoading={isLoading}>
                                {personnel?.phone}
                            </GridRow>

                            <GridRow label="سن:" isLoading={isLoading}>
                                {personnel?.age}
                            </GridRow>


                            <GridRow label="تاریخ عضویت :" isLoading={isLoading}>
                                {convertToJalali(personnel?.created_at)}
                            </GridRow>

                            <GridRow label=" میزان حقوق :" isLoading={isLoading}>
                                <span>{formatToPersianCurrency(personnel?.salary)}</span> <span
                                className='text-xs font-semibold'>ریال</span>

                            </GridRow>

                            <GridRow label="وضعیت :" isLoading={isLoading}>
                                {personnel?.is_active ? <span className='text-green-700 font-semibold'>فعال</span> :
                                    <span className='text-red-700 font-semibold'>غیر فعال</span>}
                            </GridRow>

                            <GridRow label="  آدرس :" isLoading={isLoading}>
                                {personnel?.address}
                            </GridRow>
                        </div>
                        <div className="w-full flex items-center border-t rounded-b-md" dir="rtl">
                            <button
                                onClick={() => handleEdit(personnel)}
                                className="w-full flex items-center justify-center rounded-br-md py-2 bg-[var(--secondary)] text-sm gap-1 border-l font-semibold text-[#0D141A] active:scale-95 duration-300">
                                <UserPen className="size-5"/>
                                <span>ویرایش اطلاعات</span>
                            </button>
                            <button
                                onClick={() => handleDeleteClick()}
                                className="w-full flex items-center justify-center rounded-bl-md  py-2  bg-[var(--secondary)] text-sm gap-1 text-[#CD0505] font-semibold active:scale-95 duration-300">
                                <UserRoundX className="size-5"/>
                                <span>حذف کاربر</span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </main>
        {showConfirm && (
            <ConfirmationDialog
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleConfirmDelete}
                title="حذف پرسنل"
                message="آیا از حذف پرسنل انتخاب شده مطمئن هسنید ؟"
            />
        )}
    </>

}