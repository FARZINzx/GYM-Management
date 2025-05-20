"use client";
import {useState, useEffect} from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
//components
import Header from "@/components/ui/header";
import {toggleFullScreen} from "@/lib/utils";
import toast from "react-hot-toast";
//interface
import {User} from '@/data/type'
//services
import {getUser} from '@/lib/services'
//icon
import { UserRoundCheck, UserRoundX } from "lucide-react";
import { number } from "zod";


export default function UserProfile() {

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const {id} = useParams()
    const [user, setUser] = useState<User[]>([]);


    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true);
            try {
                const result = await getUser(id);

                if (result.success) {
                    setUser(result.data.data);
                } else {
                    toast.error(result.message || 'خطایی رخ داده است' , {
                        style: {
                            background: "red",
                            color: "#fff",
                        }
                    });
                }
            } catch (e : any) {
                toast.error(e.message || 'خطایی رخ داده است' , {
                    style: {
                        background: "red",
                        color: "#fff",
                    }
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    return (
        <main
            className="min-h-screen bg-[var(--primary)] "
            onClick={() => toggleFullScreen()}
        >
            <div className="max-w-[430px] mx-auto relative">
                {/* Header */}
                <Header type="page"/>
                <div className="flex flex-col gap-12 mx-auto px-6">
                    <h2 className="text-3xl text-[var(--secondary)] text-center border-b border-[var(--secondary)] pb-2">
                        پروفایل کاربر
                    </h2>  
                    <div className="w-full bg-[var(--secondary)] p-1 flex flex-col">
                        <div className="w-full flex-row-reverse text-sm items-center justify-between">
                            <p>نام :</p>
                            <p>{user?.first_name} {user?.last_name}</p>
                        </div>
                         <div className="w-full flex-row-reverse text-sm items-center justify-between">
                            <p>شماره تلفن :</p>
                            <p>{user?.phone}</p>
                        </div>
                         <div className="w-full flex-row-reverse text-sm items-center justify-between">
                            <p>نام :</p>
                            <p>{user?.first_name} {user?.last_name}</p>
                        </div>
                         <div className="w-full flex-row-reverse text-sm items-center justify-between">
                            <p>شاخص توده بدنی :</p>
                            <p>{user?.bmi}</p>
                        </div>
                         <div className="w-full flex-row-reverse text-sm items-center justify-between">
                            <p>جنسیت :</p>
                            <p>{user?.gender == "male" ? "مرد" : "زن"}</p>
                        </div>
                         {/* <div className="w-full flex-row-reverse text-sm items-center justify-between">
                            <p>نام :</p>
                            <p>{user?.first_name} {user?.last_name}</p>
                        </div> */}
                         <div className="w-full flex-row-reverse text-sm items-center justify-between">
                            <p>وضعیت شهریه :</p>
                            <p>{user?.is_fee_paid ? "پرداخت شده" :"پرداخت نشده"}</p>
                        </div>
                         <div className="w-full flex-row-reverse text-sm items-center justify-between">
                            <p>مربی :</p>
                            <p>{user?.trainer_id ? "دارد" : "ندارد"}</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
