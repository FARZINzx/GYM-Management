"use client";

import Image from "next/image";
import LoadingSpinner from "@/components/loading/LoadingSpinner";

export default function LoadingScreen() {

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
