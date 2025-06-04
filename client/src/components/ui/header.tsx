"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
//utils
import Logout from "@/components/login/logout"
//icon
import {ChevronLeft, RefreshCw , Funnel } from "lucide-react";


const MenuHeader = () => {


  return (
    <div className="w-full mb-12 bg-[var(--secondary)] py-4 rounded-b-4xl text-[var(--primary)]">
      <div className="flex items-center w-full justify-center h-full relative">
        <Logout/>
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
        <RefreshCw
          className={`max-[400px]:size-8 size-9 duration-300 ${isSpinning ? "animate-spin" : ""}`}
          onClick={handleRefresh}
        />
        <h1 className="text-2xl max-[400px]:text-xl font-semibold">باشگاه بدنسازی</h1>
        <ChevronLeft
          className="max-[400px]:size-8 size-9 duration-300 active:-translate-x-1"
          onClick={handleBack}
        />
      </div>
    </div>
  );
};

const FilterHeader = () => {
  const router = useRouter();

  const handleBack = useCallback(() => router.back(), [router]);

  return (
      <div className="w-full mb-12 bg-[var(--secondary)] py-4 rounded-b-4xl text-[var(--primary)]">
        <div className="flex items-center w-full justify-between h-full px-2">
          <Funnel fill='var(--primary)'
              className={`max-[400px]:size-10 size-11 duration-300 scale-90`}
              // onClick={handleRefresh}
          />
          <h1 className="text-2xl max-[400px]:text-xl font-semibold">باشگاه بدنسازی</h1>
          <ChevronLeft
              className="max-[400px]:size-8 size-9 duration-300 active:-translate-x-1"
              onClick={handleBack}
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
  } else {
    return <FilterHeader />;
  }
}
