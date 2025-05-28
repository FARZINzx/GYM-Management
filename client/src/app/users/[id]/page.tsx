"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/ui/header";
// import { toggleFullScreen } from "@/lib/utils";
import clsx from "clsx";
import toast from "react-hot-toast";
import { User } from "@/data/type";
import { getUser } from "@/lib/services";
import { useSelectedUserStore } from "@/zustand/stores/selected-user-store";
import { convertToJalali } from '@/lib/utils'
import { UserPen, UserRoundX } from "lucide-react";

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
                <div className="w-full h-4 rounded bg-gray-400 animate-pulse" />
            ) : (
                <p className={clsx("font-medium w-full text-center", valueClass)}>{children}</p>
            )}
        </div>
    );
}

export default function UserProfile() {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { id } = useParams();
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter()
    const { setSelectedUser } = useSelectedUserStore()

    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true);
            try {
                const result = await getUser(id);
                if (result.success) {
                    setUser(result.data);
                } else {
                    toast.error(result.message || "خطایی رخ داده است", {
                        style: { background: "red", color: "#fff" },
                    });
                }
            } catch (e: any) {
                toast.error(e.message || "خطایی رخ داده است", {
                    style: { background: "red", color: "#fff" },
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [id]);

    const handleEdit = (user : User) => {
        setSelectedUser(user);
        router.push('/register?edit=true');
    };

    return (
        <main className="min-h-screen bg-[var(--primary)]">
            <div className="max-w-[430px] mx-auto relative">
                <Header type="page" />
                <div className="flex flex-col gap-12 mx-auto px-6">
                    <h2 className="text-3xl text-[var(--secondary)] text-center border-b border-[var(--secondary)] pb-2">
                        پروفایل کاربر
                    </h2>
                    {
                        user
                        ? <div className="flex flex-col">
                        <div className="w-full bg-[var(--secondary)] p-3 gap-3 flex flex-col rounded-t-md">
                            <GridRow label="نام و نام خانوادگی :" isLoading={isLoading}>
                                {user?.first_name} {user?.last_name}
                            </GridRow>

                            <GridRow label="شماره تلفن :" isLoading={isLoading}>
                                {user?.phone}
                            </GridRow>

                            <GridRow label="سن:" isLoading={isLoading}>
                                {user?.age}
                            </GridRow>

                            <GridRow label="شاخص توده بدنی :" isLoading={isLoading}>
                                {user?.bmi}
                            </GridRow>

                            <GridRow label="جنسیت :" isLoading={isLoading}>
                                {user?.gender === "male" ? "مرد" : "زن"}
                            </GridRow>

                            <GridRow label="تاریخ عضویت :" isLoading={isLoading}>
                                {convertToJalali(user?.created_at)}
                            </GridRow>

                            <GridRow
                                label="وضعیت شهریه :"
                                isLoading={isLoading}
                                valueClass={clsx(
                                    user?.is_fee_paid ? "text-[#15A712]" : "text-[#CD0505]"
                                )}
                            >
                                {user?.is_fee_paid ? "پرداخت شده" : "پرداخت نشده"}
                            </GridRow>

                            <GridRow label="مربی :" isLoading={isLoading} >
                                {user?.trainer_id ? "دارد" : "ندارد"}
                            </GridRow>
                        </div>
                        <div className="w-full flex items-center border-t rounded-b-md" dir="rtl">
                            <button
                                onClick={() => handleEdit(user)}
                                className="w-full flex items-center justify-center rounded-br-md py-2 bg-[var(--secondary)] text-sm gap-1 border-l font-semibold text-[#0D141A] active:scale-95 duration-300">
                                <UserPen className="size-5" />
                                <span>ویرایش اطلاعات</span>
                            </button>
                            <button className="w-full flex items-center justify-center rounded-bl-md  py-2  bg-[var(--secondary)] text-sm gap-1 text-[#CD0505] font-semibold active:scale-95 duration-300">
                                <UserRoundX className="size-5" />
                                <span>حذف کاربر</span>
                            </button>
                        </div>
                    </div>
                        : <p>اطلاعاتی از کاربر موجود نمی باشد</p>
                    }
                </div>
            </div>
        </main>
    );
}