"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
//utils
import { deleteCookie } from "@/action/cookie";  
//icon
import { LogOut, ChevronLeft, RefreshCw } from "lucide-react";

const MenuHeader = () => {
  const router = useRouter();
  const handleLogout = useCallback(() => {
    deleteCookie("token");
    router.refresh()
  }, [router]);

  return (
    <div className="w-full mb-12 bg-[var(--secondary)] py-4 rounded-b-4xl text-[var(--primary)]">
      <div className="flex items-center w-full justify-center h-full relative">
        <LogOut
          className="max-[400px]:size-8 size-9 absolute right-3 duration-300 active:scale-90"
          onClick={handleLogout}
        />
        <h1 className="text-2xl max-[400px]:text-xl font-semibold">باشگاه بدنسازی</h1>
      </div>
    </div>
  );
};

const PageHeader = () => {
  const router = useRouter();
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  const handleBack = useCallback(() => router.back(), [router]);
  const handleRefresh = useCallback(() => {
    setIsSpinning(true);
    setTimeout(() => {
      window.location.reload();
      setIsSpinning(false);
    }, 1500);
  }, []);

  return (
    <div className="w-full mb-12 bg-[var(--secondary)] py-4 rounded-b-4xl text-[var(--primary)]">
      <div className="flex items-center w-full justify-between h-full px-2">
        <ChevronLeft
          className="max-[400px]:size-8 size-9 duration-300 active:-translate-x-1"
          onClick={handleBack}
        />
        <h1 className="text-2xl max-[400px]:text-xl font-semibold">باشگاه بدنسازی</h1>
        <RefreshCw
          className={`max-[400px]:size-8 size-9 duration-300 ${isSpinning ? "animate-spin" : ""}`}
          onClick={handleRefresh}
        />
      </div>
    </div>
  );
};

export default function Header({ type }: { type: string }) {
  if (type === "menu") {
    return <MenuHeader />;
  } else if (type === "page") {
    return <PageHeader />;
  }
  return null;
}
