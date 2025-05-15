'use client'
import {useRouter} from "next/navigation";
import {useCallback} from "react";
//utils
import {deleteCookie} from "@/action/cookie";
import toast from "react-hot-toast";
//icon
import {LogOut} from "lucide-react";


export default function Logout() {
    const router = useRouter();
    const handleLogout = useCallback(() => {
        deleteCookie("token");
        toast.success('خروج با موفقیت انجام شد', {
            style: {
                background: "#31C440",
                color: "#fff",
            },
            duration: 2000
        });
        router.refresh()
    }, [router]);

    return <LogOut
        className="max-[400px]:size-8 size-9 absolute right-3 duration-300 active:scale-90"
        onClick={handleLogout}
    />
}