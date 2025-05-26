'use client'
import {useEffect, useState} from "react";
//utils
import {toggleFullScreen , convertRoleNameToPersian} from "@/lib/utils";
import Header from "@/components/ui/header";
import Link from "next/link";
import toast from "react-hot-toast";
//service
import {getAllPersonnel} from "@/lib/services";
//icon
//type
import {PersonnelType} from "@/data/type";

export default function Personnel() {

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [personnels, setPersonnels] = useState<PersonnelType[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const result = await getAllPersonnel();
                console.log(result);

                if (result.success) {
                    setPersonnels(result.data);
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
                <div className="flex flex-col gap-12 mx-auto  px-6">
                    <h2 className="text-3xl text-[var(--secondary)] text-center border-b border-[var(--secondary)] pb-2">
                        پرسنل
                    </h2>
                    {/* Grid of Management Options */}
                    <div className="grid grid-cols-1 gap-3">
                        <div className="w-full grid grid-cols-2  bg-[var(--secondary)] rounded-xl py-2">
                            {["نام و نام خانوادگی","سمت"].map((item, index) => (
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
                                    {personnels.map((personnel) => (
                                        <Link
                                            href={`/personnel/${personnel.id}`}
                                            key={personnel.id}
                                            className="w-full place-items-center place-content-center grid grid-cols-2 gap-1 bg-[var(--secondary)] rounded-xl py-2 active:scale-90 duration-500 text-sm min-w-[380]:text-base"
                                        >
                                            <p className="text-center">{personnel.first_name} {personnel.last_name}</p>{" "}

                                                <div className="text-[var(--primary)] text-center font-medium">
                                                    <p>{convertRoleNameToPersian(personnel.role_name)}</p>
                                                </div>

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