"use client";

import { useEffect } from "react";
import Image from "next/image";
import LoadingSpinner from "@/components/loading/LoadingSpinner";
import { toggleFullScreen } from "@/lib/utils";

export default function LoadingScreen() {
  useEffect(() => {
    const handleClick = () => {
      toggleFullScreen();
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col gap-20 justify-center items-center">
        <div className="flex flex-col gap-20 justify-center items-center">
          <Image src="/images/logo.png" alt="logo" width={400} height={400} />
          <LoadingSpinner />
        </div>
      </div>
    </div>
  );
}
