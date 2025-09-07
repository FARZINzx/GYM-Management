"use client";
import { useEffect, useState } from "react";
//components
import LoadingScreen from "@/components/loading/loadingScreen";
import Header from "@/components/ui/header";
import Link from "next/link";
//utils
import { getCookie } from "@/action/cookie";
//db
import {
  ManagerPanelItem,
  AdminPanelItem,
  ReceptionPanelItem,
  CoachPanelItem,
} from "@/data/db";
//interface
import { IconButtonProps } from "@/data/type";
import { useHydration } from "@/hooks/useHydration";

const Item = ({ icon: Icon, label, href, id }: IconButtonProps) => {
  return (
    <Link
      href={href}
      key={id}
      className="bg-[var(--secondary)] rounded-lg p-1 flex gap-3 flex-col items-center justify-center aspect-square hover:brightness-90  active:scale-90 duration-500 text-center max-[400px]:text-sm text-lg"
    >
      <Icon className="max-[400px]:size-10 size-15" />
      <span className="text-[var(--primary)] font-medium">{label}</span>
    </Link>
  );
};

export default function Home() {
  const [role, setRole] = useState<string>("");
  const mounted = useHydration();

  useEffect(() => {
    if (!mounted) return;

    const fetchRole = async () => {
      const roleCookie = await getCookie("role");
      setRole(roleCookie || "");
    };
    fetchRole();
  }, [mounted]);


  if (!mounted || !role) {
    return <LoadingScreen />;
  }

  return (
    <main className="min-h-screen bg-[var(--primary)] ">
      <div className="max-w-[430px] mx-auto">
        {/* Header */}
        <Header type="menu" />
        <div className="flex flex-col gap-6 px-10">
          <h2 className="text-3xl max-[400px]:text-2xl text-[var(--secondary)] text-center border-b border-[var(--secondary)]">
            {role === "manager"
              ? " پنل مدیریت"
              : role === "receptionist"
              ? "پنل منشی"
              : role === "admin"
              ? "پنل ادمین"
              : "پنل مربی"}
          </h2>
          {/* Grid of Management Options */}
          <div className="w-full flex flex-col gap-2 hide-scrollbar max-h-[calc(100vh-220px)] hide-scrollbar overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 pb-2 ">
            {role === "manager"
              ? ManagerPanelItem.map((item: IconButtonProps) => (
                  <Item
                    label={item.label}
                    href={item.href}
                    icon={item.icon}
                    id={item.id}
                    key={item.id}
                  />
                ))
              : role === "receptionist"
              ? ReceptionPanelItem.map((item: IconButtonProps) => (
                  <Item
                    label={item.label}
                    href={item.href}
                    icon={item.icon}
                    id={item.id}
                    key={item.id}
                  />
                ))
              : role === "admin"
              ? AdminPanelItem.map((item: IconButtonProps) => (
                  <Item
                    label={item.label}
                    href={item.href}
                    icon={item.icon}
                    id={item.id}
                    key={item.id}
                  />
                ))
              : CoachPanelItem.map((item: IconButtonProps) => (
                  <Item
                    label={item.label}
                    href={item.href}
                    icon={item.icon}
                    id={item.id}
                    key={item.id}
                  />
                ))}
          </div>
          </div>
        </div>
      </div>
    </main>
  );
}
