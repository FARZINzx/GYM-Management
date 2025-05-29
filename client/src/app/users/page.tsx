"use client";
import {useState, useEffect} from "react";
import Link from "next/link";
//components
import Header from "@/components/ui/header";
import {toggleFullScreen} from "@/lib/utils";
import toast from "react-hot-toast";
//interface
import {User} from '@/data/type'
//services
import {getAllUsers} from '@/lib/services'
//icon
import { UserRoundCheck, UserRoundX } from "lucide-react";

export default function Users() {

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [users, setUsers] = useState<User[]>([]);


    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const result = await getAllUsers();

                if (result.success) {
                    setUsers(result.data.data);
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

        fetchUsers();
    }, []);

    return (
        <main
            className="min-h-screen bg-[var(--primary)] "
            onClick={() => toggleFullScreen()}
        >
            <div className="max-w-[430px] mx-auto relative">
                {/* Header */}
                <Header type="page"/>
                <div className="flex flex-col gap-6 mx-auto  px-6">
                    <h2 className="text-3xl text-[var(--secondary)] text-center border-b border-[var(--secondary)] pb-2">
                        کاربران
                    </h2>
                    {/* Grid of Management Options */}
                    <div className="grid grid-cols-1 gap-3">
                        <div className="w-full grid grid-cols-2 gap-1 bg-[var(--secondary)] rounded-xl py-2">
                            {["نام و نام خانوادگی","وضعیت شهریه"].map((item, index) => (
                                <p
                                    key={index}
                                    className="pb-1 text-sm min-w-[380]:text-base  underline underline-offset-10 text-center"
                                >
                                    {item}
                                </p>
                            ))}
                        </div>
                        {
                            isLoading
                                ? Array.from({length: 10}).map((_, index) => (
                                    <div
                                        key={index}
                                        className="w-full animate-pulse gap-1 bg-gray-500 rounded-xl h-10 duration-500">
                                    </div>
                                ))
                                : <div className="flex flex-col gap-2 overflow-y-scroll h-full hide-scrollbar">
                                    {users.map((user) => (
                                        <Link
                                            href={`/users/${user.id}`}
                                            key={user.id}
                                            className="w-full place-items-center place-content-center grid grid-cols-2 gap-1 bg-[var(--secondary)] rounded-xl py-2 active:scale-90 duration-500 text-sm min-w-[380]:text-base"
                                        >
                                            <p className="text-center">{user.first_name} {user.last_name}</p>{" "}
                                            {user.is_fee_paid ? (
                                                <div className="flex items-center gap-1 justify-center text-green-600 text-center">
                                                    <UserRoundCheck className="w-6 h-6" />
                                                    <p>پرداخت شده</p>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-red-600 text-center justify-center">
                                                    <UserRoundX className="w-6 h-6" />
                                                    <p>پرداخت نشده</p>
                                                </div>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                        }

                    </div>
                </div>
            </div>
        </main>
    )
}
