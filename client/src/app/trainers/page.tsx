"use client";
import Link from "next/link";
//components
import Header from "@/components/ui/header";
import { toggleFullScreen } from "@/lib/utils";
//DB
import { CoachesDB } from "@/data/db";
//interface
import { Coach } from "@/data/type";
//icon
import { UserRoundCheck, UserRoundX } from "lucide-react";

export default function Coaches() {
  return (
    <main
      className="min-h-screen bg-[var(--primary)] "
      onClick={() => toggleFullScreen()}
    >
      <div className="max-w-[430px] mx-auto relative">
        {/* Header */}
        <Header type="page" />
        <div className="flex flex-col gap-12 mx-auto px-6">
          <h2 className="text-3xl text-[var(--secondary)] text-center border-b border-[var(--secondary)] pb-2">
            مربیان
          </h2>
          {/* Grid of Management Options */}
          <div className="grid grid-cols-1 gap-3">
            <div className="w-full grid grid-cols-2 text-center gap-1 bg-[var(--secondary)] rounded-xl py-2">
              {["نام و نام خانوادگی","وضعیت حضور"].map((item, index) => (
                <p
                  key={index}
                  className="pb-1 text-sm min-w-[380]:text-base w-full  underline underline-offset-10 text-center"
                >
                  {item}
                </p>
              ))}
            </div>
            <div className="flex flex-col gap-2 overflow-y-scroll">
              {CoachesDB.map((item: Coach) => (
                <Link
                  href={`/trainers/${item.id}`}
                  key={item.id}
                  className="w-full grid grid-cols-2 text-sm gap-1 bg-[var(--secondary)] rounded-xl  py-2 active:scale-90 duration-500"
                >
                  <p className="text-center">{item.name}</p>{" "}
                  {item.present ? (
                    <div className="flex items-center gap-1 justify-center  text-green-600 text-center">
                      <UserRoundCheck className="w-5 h-5" />
                      <p>حاضر</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600 text-center justify-center ">
                      <UserRoundX className="w-5 h-5" />
                      <p>غایب</p>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
